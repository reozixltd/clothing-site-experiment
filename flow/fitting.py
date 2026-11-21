"""Fitting room images: python flow/fitting.py

Outfit photos flow/fitting/<model>/<top>__<bottom>.jpg -> public/fitting/<model>/...webp (768 x 1376,
studio wall and floor turned flat light grey, GREY, by rembg). Packshots flow/fitting/tops|bottoms/<id>.jpg (magenta backdrop) -> transparent
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


_session = None


def regrey(im):
    """The studio wall and floor replaced by flat GREY: rembg (isnet-general-use, ~10 s an image on CPU)
    mattes the model, feet and all, and a faint soft shadow under the shoes keeps them on the ground."""
    global _session
    from rembg import new_session, remove
    _session = _session or new_session('isnet-general-use')
    al = np.asarray(remove(im, session=_session, only_mask=True), np.float32) / 255
    # The shadow: the bottom 3% of the figure, squashed flat and blurred, just under the feet.
    rows = np.nonzero(al.max(1) > 0.5)[0]
    foot = rows.max()
    band = (al[foot - int(len(rows) * 0.03): foot + 1] > 0.5).any(0)
    xs = np.nonzero(band)[0]
    sh = Image.new('L', im.size, 0)
    ImageDraw.Draw(sh).ellipse((xs.min() - 12, foot - 8, xs.max() + 12, foot + 8), fill=90)
    sh = np.asarray(sh.filter(ImageFilter.GaussianBlur(10)), np.float32)[..., None] / 255
    bg = np.array(GREY, np.float32) * (1 - 0.35 * sh)
    a = al[..., None]
    return Image.fromarray((a * np.asarray(im, np.float32) + (1 - a) * bg).round().astype(np.uint8)), al

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


def headwear():
    """flow/remix/headwear/<id>.jpg (magenta backdrop) -> 800 x 800 cutouts in public/remix/headwear/ (Remix Deck)."""
    os.makedirs('public/remix/headwear', exist_ok=True)
    for src in sorted(glob.glob('flow/remix/headwear/*.jpg')):
        packshot(src, f'public/remix/headwear/{os.path.basename(src)[:-4]}.webp', 800, 800, fix=lambda im: unpink(despill(im)))


def main():
    n = 0
    for src in sorted(glob.glob('flow/fitting/*/*.jpg')):
        kind, name = src.replace('\\', '/').split('/')[-2:]
        os.makedirs(f'public/fitting/{kind}', exist_ok=True)
        dst = f'public/fitting/{kind}/{name[:-4]}.webp'
        if kind in ('tops', 'bottoms'):
            packshot(src, dst)
        else:
            out, al = regrey(fit(Image.open(src).convert('RGB'), OW, OH))
            out.save(dst, quality=86, method=6)
            # The silhouette, small, for the shimmer as the outfit changes (FittingRoom.css .fit__magic).
            os.makedirs(f'public/fitting/{kind}/mask', exist_ok=True)
            m = Image.new('RGBA', (OW, OH), 'white')
            m.putalpha(Image.fromarray((al * 255).round().astype(np.uint8)))
            m.resize((192, 344), Image.LANCZOS).save(f'public/fitting/{kind}/mask/{name[:-4]}.webp', lossless=True)
        n += 1
    shoes()
    bags()
    headwear()
    print(f'{n} images')
    print('backdrop #%02x%02x%02x' % GREY)

if __name__ == '__main__':
    headwear() if sys.argv[1:] == ['headwear'] else main()
