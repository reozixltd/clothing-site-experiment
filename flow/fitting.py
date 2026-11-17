"""Fitting room images: python flow/fitting.py

Outfit photos flow/fitting/<model>/<top>__<bottom>.jpg -> public/fitting/<model>/...webp (768 x 1376,
studio wall turned flat light grey, GREY). Packshots flow/fitting/tops|bottoms/<id>.jpg (magenta backdrop) -> transparent
800 x 1000 cutouts in public/fitting/tops|bottoms/. Shoe packshots flow/shoes/<id>.jpg -> public/shoes/. Bags flow/bags/ -> public/bags/.
"""
import glob
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, os.path.dirname(__file__))
from cutout import cutout, W, H  # noqa: E402

OW, OH = 768, 1376


def fit(im, w, h):
    """Centre-crop to w:h, then scale to w x h."""
    k = min(im.width / w, im.height / h)
    cw, ch = round(w * k), round(h * k)
    l, t = (im.width - cw) // 2, (im.height - ch) // 2
    return im.crop((l, t, l + cw, t + ch)).resize((w, h), Image.LANCZOS)


GREY = (236, 236, 234)  # the fitting room's backdrop in fitting.ts


def regrey(im):
    """The studio wall and floor replaced by flat GREY. A smooth surface is fitted to the wall either side
    of the model and keyed on the distance from it; the figure is what the wall can't reach from the
    border, with enclosed gaps that look like wall (between arm and body) reopened. The floor's colour
    overlaps cream cloth too much to key, so the legs fade out just above the wall/floor seam instead.
    ponytail: hand-rolled key; a matting model (rembg) would keep the feet."""
    a = np.asarray(im).astype(np.float32)
    H_, W_, _ = a.shape
    ys, xs = np.mgrid[0:H_, 0:W_]
    strip = np.concatenate([a[:, : int(W_ * 0.12)], a[:, int(W_ * 0.88):]], 1).mean((1, 2))
    lo = int(H_ * 0.55)
    seam = lo + int(np.argmax(np.abs(np.diff(np.convolve(strip[lo:], np.ones(9) / 9, 'same')))[8:-8])) + 8

    def feats(y, x):
        y, x = y / H_, x / W_
        return np.stack([np.ones_like(x), x, y, x * x, y * y, x * y, y ** 3, x * x * y], -1)

    side = ((xs < W_ * 0.16) | (xs > W_ * 0.84)) & (ys < seam - 6)
    F = feats(ys[side], xs[side])
    bg = np.stack([feats(ys, xs) @ np.linalg.lstsq(F, a[side][:, c], rcond=None)[0] for c in range(3)], -1)
    d = np.sqrt(((a - bg) ** 2).sum(-1))
    # The mask at half size; a closing fills the speckle.
    w, h = W_ // 2, H_ // 2
    fig = Image.fromarray(((d > 9) * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR).point(lambda v: 255 if v > 127 else 0)
    fig = fig.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MedianFilter(3))
    # (fromarray images ignore floodfill until copied.)
    m = Image.fromarray(np.where(np.asarray(fig) > 0, 0, 255).astype(np.uint8)).copy()
    for x in range(0, w, 3):
        for y in (0, h - 1):
            if m.getpixel((x, y)) == 255:
                ImageDraw.floodfill(m, (x, y), 128)
    for y in range(0, h, 3):
        for x in (0, w - 1):
            if m.getpixel((x, y)) == 255:
                ImageDraw.floodfill(m, (x, y), 128)
    lab = np.asarray(m).copy()
    keep = lab != 128
    dh = np.asarray(Image.fromarray(d.astype(np.float32)).resize((w, h)))
    # Enclosed holes big enough to hold a 15px square: wall if they look like wall.
    seeds = np.asarray(Image.fromarray(((lab == 255) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(15))) > 0
    holes = Image.fromarray(lab).copy()
    for y_, x_ in zip(*np.nonzero(seeds)):
        if holes.getpixel((int(x_), int(y_))) != 255:
            continue
        ImageDraw.floodfill(holes, (int(x_), int(y_)), 64)
        comp = np.asarray(holes) == 64
        if np.median(dh[comp]) < 5:
            keep[comp] = False
        holes.paste(32, mask=Image.fromarray((comp * 255).astype(np.uint8)))
    # Shadows at the foot of the wall touch the legs: low down, keep only the legs' own width.
    knee = int(h * 0.62)
    cols = np.nonzero(keep[knee])[0]
    keep[knee:, : cols.min() - w // 30] = False
    keep[knee:, cols.max() + w // 30:] = False
    # Only the figure holding the torso.
    km = Image.fromarray((keep * 255).astype(np.uint8)).copy()
    ImageDraw.floodfill(km, (w // 2, int(h * 0.4)), 200)
    alpha = Image.fromarray(((np.asarray(km) == 200) * 255).astype(np.uint8)).resize((W_, H_), Image.BILINEAR)
    al = np.asarray(alpha.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
    fade = np.clip((seam - 10 - np.arange(H_)) / 90, 0, 1)[:, None]
    al = (al * fade)[..., None]
    return Image.fromarray((al * a + (1 - al) * np.array(GREY, np.float32)).round().astype(np.uint8))


def keyed(src):
    """The magenta backdrop cut away, edges cleaned."""
    im = cutout(src)
    im.putalpha(im.getchannel('A').filter(ImageFilter.MinFilter(3)))
    # Drop the pink fringe: on soft edge pixels, magenta shows as red and blue above green.
    a = np.asarray(im).astype(np.int16)
    edge = a[..., 3] < 250
    g = a[..., 1]
    a[..., 0] = np.where(edge, np.minimum(a[..., 0], g + 20), a[..., 0])
    a[..., 2] = np.where(edge, np.minimum(a[..., 2], g), a[..., 2])
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def packshot(src, dst, W=W, H=H, floor=False, fix=None):
    im = keyed(src)
    if fix:
        im = fix(im)
    box = (np.asarray(im.getchannel('A')) > 24)
    ys, xs = np.nonzero(box)
    part = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    s = min(W * 0.92 / part.width, H * 0.92 / part.height)
    part = part.resize((round(part.width * s), round(part.height * s)), Image.LANCZOS)
    out = Image.new('RGBA', (W, H))
    # floor: stand the piece on a line near the bottom (shoes share one ground line).
    out.paste(part, ((W - part.width) // 2, H - part.height - H // 20 if floor else (H - part.height) // 2))
    out.save(dst, quality=86, method=6)


def shoes():
    """flow/shoes/<id>.jpg (magenta backdrop, toe left) -> transparent 1000 x 640 public/shoes/<id>.webp."""
    os.makedirs('public/shoes', exist_ok=True)
    for src in sorted(glob.glob('flow/shoes/*.jpg')):
        packshot(src, f'public/shoes/{os.path.basename(src)[:-4]}.webp', 1000, 640, floor=True)


def despill(im, band=25):
    """Magenta spill on opaque pixels near the edge (hair, arms): pull red and blue back to green."""
    a = np.asarray(im).astype(np.int16)
    m = im.getchannel('A')
    for _ in range(max(1, band // 8)):  # repeated 9 px passes: a wide MinFilter(band) is very slow
        m = m.filter(ImageFilter.MinFilter(9))
    near = np.asarray(m) < 250
    # Skin and hair have blue below green; any edge pixel with blue above green is backdrop.
    pink = near & (a[..., 2] > a[..., 1] + 15)
    # Strong magenta anywhere (backdrop caught between arm and body).
    pink |= (a[..., 2] > a[..., 1] + 20) & (a[..., 0] > a[..., 1] + 20)
    g = a[..., 1]
    a[..., 2] = np.where(pink, g, a[..., 2])
    a[..., 0] = np.where(pink, g + (a[..., 0] - g) * 0.4, a[..., 0])
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def unpink(im):
    """Pink light from the backdrop on pale leather: bright pixels with red and blue above green go neutral."""
    a = np.asarray(im).astype(np.int16)
    g = a[..., 1]
    pink = (g > 120) & (a[..., 2] > g) & (a[..., 0] > g + 5)
    a[..., 0] = np.where(pink, g + (a[..., 0] - g) * 0.3, a[..., 0])
    a[..., 2] = np.where(pink, g, a[..., 2])
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def bags():
    """flow/bags/<id>.jpg -> 800 x 800 cutouts in public/bags/; flow/bags/model/<id>.jpg (the model
    holding that bag, magenta backdrop) -> full-frame cutouts in public/bags/model/, so every photo lines up."""
    os.makedirs('public/bags/model', exist_ok=True)
    for src in sorted(glob.glob('flow/bags/*.jpg')):
        # Pale bags (the white Moon) pick up pink light from the backdrop.
        packshot(src, f'public/bags/{os.path.basename(src)[:-4]}.webp', 800, 800, fix=lambda im: unpink(despill(im)))
    for src in sorted(glob.glob('flow/bags/model/*.jpg')):
        unpink(despill(keyed(src))).save(f'public/bags/model/{os.path.basename(src)[:-4]}.webp', quality=86, method=6)


def main():
    n = 0
    for src in sorted(glob.glob('flow/fitting/*/*.jpg')):
        kind, name = src.replace('\\', '/').split('/')[-2:]
        os.makedirs(f'public/fitting/{kind}', exist_ok=True)
        dst = f'public/fitting/{kind}/{name[:-4]}.webp'
        if kind in ('tops', 'bottoms'):
            packshot(src, dst)
        else:
            regrey(fit(Image.open(src).convert('RGB'), OW, OH)).save(dst, quality=86, method=6)
        n += 1
    shoes()
    bags()
    print(f'{n} images')
    print('backdrop #%02x%02x%02x' % GREY)

if __name__ == '__main__':
    main()
