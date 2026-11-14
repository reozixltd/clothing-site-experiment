"""Cut out one rail piece: python flow/cutout.py <id>

Reads flow/rack/<id>-front.jpg, -back.jpg and -side.jpg (Flow images on a
magenta backdrop) and writes public/rack/<id>-<view>.webp. All three views are
the same garment height with the hook top centre, so they line up when the site
swaps between them.
"""
import sys
import numpy as np
from PIL import Image

W, H = 800, 1000
VIEWS = ('front', 'back', 'side')


def cutout(src):
    a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.minimum(r, b) - g  # how magenta a pixel is
    # Flow's "magenta" drifts towards pink, so key relative to this image's backdrop (top corners).
    bg = np.median(np.concatenate([m[:40, :40].ravel(), m[:40, -40:].ravel()]))
    lo, hi = bg * 0.4, bg * 0.8
    alpha = np.clip(1 - (m - lo) / (hi - lo), 0, 1)
    spill = np.clip(m - bg * 0.15, 0, None) * (alpha < 1)
    a[..., 0] -= spill
    a[..., 2] -= spill
    return Image.fromarray(np.dstack([np.clip(a, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')


def measure(im):
    """Bounding box plus the x of the hook (middle of the top 2% of the piece)."""
    solid = np.asarray(im.getchannel('A')) > 24
    # Ignore specks: keep only rows and columns with a few solid pixels.
    solid &= (solid.sum(1) > 3)[:, None] & (solid.sum(0) > 3)[None, :]
    ys, xs = np.nonzero(solid)
    top, bottom, left, right = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    hx = xs[ys < top + (bottom - top) * 0.02].mean()
    return top, bottom, left, right, hx


def build(pid):
    ims = {v: cutout(f'flow/rack/{pid}-{v}.jpg') for v in VIEWS}
    boxes = {v: measure(im) for v, im in ims.items()}
    # Every view is scaled to the front's height (Flow draws the side a little taller or shorter),
    # at the largest size where all of them fit with the hook on the centre line.
    t0, b0 = boxes['front'][:2]
    k = {v: (b0 - t0) / (b - t) for v, (t, b, l, r, hx) in boxes.items()}
    s = min(min(H / (b - t) / k[v], (W / 2) / max(hx - l, r - hx) / k[v]) for v, (t, b, l, r, hx) in boxes.items())
    for v, im in ims.items():
        t, b, l, r, hx = boxes[v]
        part = im.crop((l, t, r, b))
        sv = s * k[v]
        part = part.resize((round(part.width * sv), round(part.height * sv)), Image.LANCZOS)
        out = Image.new('RGBA', (W, H))
        out.paste(part, (round(W / 2 - (hx - l) * sv), 0))
        out.save(f'public/rack/{pid}-{v}.webp', quality=86, method=6)


if __name__ == '__main__':
    for pid in sys.argv[1:]:
        build(pid)
