"""Fitting room images: python flow/fitting.py

Outfit photos flow/fitting/<model>/<top>__<bottom>.jpg -> public/fitting/<model>/...webp (768 x 1376,
backdrop kept). Packshots flow/fitting/tops|bottoms/<id>.jpg (magenta backdrop) -> transparent
800 x 1000 cutouts in public/fitting/tops|bottoms/. Shoe packshots flow/shoes/<id>.jpg -> public/shoes/. Prints each model's backdrop colour for fitting.ts.
"""
import glob
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(__file__))
from cutout import cutout, W, H  # noqa: E402

OW, OH = 768, 1376
BASES = {'him': 'sage-linen-overshirt__grey-utility-cargo', 'her': 'ivory-silk-shirt__cream-wide-trouser'}


def fit(im, w, h):
    """Centre-crop to w:h, then scale to w x h."""
    k = min(im.width / w, im.height / h)
    cw, ch = round(w * k), round(h * k)
    l, t = (im.width - cw) // 2, (im.height - ch) // 2
    return im.crop((l, t, l + cw, t + ch)).resize((w, h), Image.LANCZOS)


def packshot(src, dst, W=W, H=H, floor=False):
    im = cutout(src)
    im.putalpha(im.getchannel('A').filter(ImageFilter.MinFilter(3)))
    # Drop the pink fringe: on soft edge pixels, magenta shows as red and blue above green.
    a = np.asarray(im).astype(np.int16)
    edge = a[..., 3] < 250
    g = a[..., 1]
    a[..., 0] = np.where(edge, np.minimum(a[..., 0], g + 20), a[..., 0])
    a[..., 2] = np.where(edge, np.minimum(a[..., 2], g), a[..., 2])
    im = Image.fromarray(a.astype(np.uint8), 'RGBA')
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


def main():
    n = 0
    for src in sorted(glob.glob('flow/fitting/*/*.jpg')):
        kind, name = src.replace('\\', '/').split('/')[-2:]
        os.makedirs(f'public/fitting/{kind}', exist_ok=True)
        dst = f'public/fitting/{kind}/{name[:-4]}.webp'
        if kind in ('tops', 'bottoms'):
            packshot(src, dst)
        else:
            fit(Image.open(src).convert('RGB'), OW, OH).save(dst, quality=86, method=6)
        n += 1
    shoes()
    print(f'{n} images')
    for model, base in BASES.items():
        a = np.asarray(Image.open(f'flow/fitting/{model}/{base}.jpg').convert('RGB'))
        c = np.median(np.concatenate([a[:40, :40].reshape(-1, 3), a[:40, -40:].reshape(-1, 3)]), 0)
        print(model, '#%02x%02x%02x' % tuple(int(v) for v in c))


if __name__ == '__main__':
    main()
