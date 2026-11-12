"""DermiQ — cartridge stage tiles from the owner's reference sheet (b_#_STRICT_IMAGE_EDITI.webp).

Scope of the edit (nothing else is touched — every other pixel of each tile is the reference pixel):
  * stages 1-4 are re-framed as four equal 3:5 tiles on the sheet's own background;
  * baked-in English labels, brackets, leader lines and column rules are removed (the interface draws
    translated captions instead);
  * the misspelt collar print "TWISY TO MIX" (stage 4) becomes "TWIST TO MIX", re-using the T of the same line.
Cartridge geometry, proportions and colours — including the blue of the mixed solution — are as supplied.
All coordinates are in "sheet units" (sheet width = 1568).
"""
import cv2, numpy as np, os, sys
from PIL import Image
from prep2 import im0, k, P, H, W, bg_like, fit_bg, fix_twisy
OUT = '/home/user/work/prep'

def chroma(a):
    a = a.astype(np.int16); return a.max(axis=2) - a.min(axis=2)

def ink_core(a, vmax=120, cmax=45):
    return (a.max(axis=2) < vmax) & (chroma(a) < cmax)

def band_fill(img, x0, x1, y0, y1, smooth=0.0):
    """Refill the rows y0..y1 over the columns x0..x1 (sheet units), column by column, from the pixels just
    above and below. Used for the horizontal leader lines and their end dots: whatever crosses the band
    vertically (glass walls, collar ribs, highlights, the collar lug) is continued exactly."""
    xa, xb, ya, yb = P(x0), P(x1), P(y0), P(y1)
    a = img[ya - 4:yb + 4, xa:xb].astype(np.float32)
    A = a[1:4].mean(axis=0); B = a[-4:-1].mean(axis=0); n = yb - ya
    t = ((np.arange(n) + 1) / (n + 1))[:, None, None]
    if smooth:
        A = cv2.GaussianBlur(A[None], (0, 0), smooth)[0]; B = cv2.GaussianBlur(B[None], (0, 0), smooth)[0]
    fill = A[None] * (1 - t) + B[None] * t
    m = np.ones((n, xb - xa), np.float32); m[:, :2] = 0.5; m[:, -2:] = 0.5
    img[ya:yb, xa:xb] = np.clip(a[4:-4] * (1 - m[..., None]) + fill * m[..., None], 0, 255).astype(np.uint8)

def remove_leader(img, line, dot=None, half=3.3, dot_half=5.0):
    """line = (x_start, x_end, y_centre); dot = (x_centre, y_centre) of the round end marker, if any."""
    xs, xe, yc = line
    band_fill(img, xs, xe, yc - half, yc + half)
    if dot: band_fill(img, dot[0] - dot_half - 0.4, dot[0] + dot_half + 0.4, dot[1] - dot_half, dot[1] + dot_half, smooth=5.0)

def remove_text_on_surface(img, b, grow_u=15.0, limit=None, feather=9, seed=7):
    """Label printed over a smooth object surface (the glove, stage 2). b = label box, limit = box the edit may
    never leave (both in sheet units).

    The sheet lightens the surface around such a label so that it stays legible. Refilling only the strokes
    leaves that light halo behind as a pale rectangle, so the whole halo is refilled: a membrane (harmonic
    interpolation, bounded by the colours on its rim, so it can never overshoot) is stretched from the
    untouched surface around it. A little synthetic grain with the measured amplitude of the surrounding
    surface keeps the patch from looking airbrushed. Nothing is copied from elsewhere, and the cartridge wall
    and the tile edge lie outside `limit`, so neither is touched."""
    x0, y0, x1, y1 = [P(v) for v in b]; pad = P(grow_u) + P(14)
    Ya, Yb, Xa, Xb = y0 - pad, y1 + pad, x0 - pad, x1 + pad
    a = img[Ya:Yb, Xa:Xb].copy(); h, w = a.shape[:2]
    core = np.zeros((h, w), np.uint8); core[pad:-pad, pad:-pad] = ink_core(a)[pad:-pad, pad:-pad]
    g = P(grow_u) * 2 + 1
    m = cv2.dilate(core, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (g, g)))
    lim = np.ones_like(m)
    if limit:
        lim[:] = 0; lx0, ly0, lx1, ly1 = [P(v) for v in limit]
        lim[max(0, ly0 - Ya):max(0, ly1 - Ya), max(0, lx0 - Xa):max(0, lx1 - Xa)] = 1
    m &= lim
    filled = cv2.inpaint(a, m, 12, cv2.INPAINT_TELEA).astype(np.float32); mf = m.astype(np.float32)[..., None]
    for _ in range(400):
        filled = filled * (1 - mf) + cv2.GaussianBlur(filled, (0, 0), 6) * mf
    af = a.astype(np.float32)
    hp = af - cv2.GaussianBlur(af, (0, 0), 2.0)
    ring = (cv2.dilate(m, np.ones((41, 41), np.uint8)) > 0) & (m == 0)
    sd = np.median(np.abs(hp[ring] - np.median(hp[ring], axis=0)), axis=0) * 1.4826   # robust: creases are not grain
    n = np.random.default_rng(seed).normal(0, 1, (h, w)).astype(np.float32)
    n = cv2.GaussianBlur(n, (0, 0), 1.1); n -= cv2.GaussianBlur(n, (0, 0), 2.0); n /= n.std()
    filled = filled + n[..., None] * sd[None, None, :]
    soft = cv2.GaussianBlur(m.astype(np.float32), (0, 0), feather) * cv2.GaussianBlur(lim.astype(np.float32), (0, 0), 1.0)
    inner = cv2.erode(m, np.ones((2 * int(feather * 1.6) + 1,) * 2, np.uint8)).astype(np.float32)
    ink = cv2.dilate(core, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (P(3.0) * 2 + 1,) * 2)).astype(np.float32)
    soft = np.maximum(np.maximum(soft, cv2.GaussianBlur(inner, (0, 0), 2.0)), cv2.GaussianBlur(ink, (0, 0), 1.5))   # no ink survives
    soft = np.clip(soft, 0, 1)[..., None]
    img[Ya:Yb, Xa:Xb] = np.clip(af * (1 - soft) + filled * soft, 0, 255).astype(np.uint8)
    return int(m.sum())

def fit_plane(a, mask, step=4):
    """Background model: a plane per channel (stable when a zone has to be extrapolated), refined locally below."""
    h, w = a.shape[:2]
    ys, xs = np.mgrid[0:h:step, 0:w:step]; m = mask[::step, ::step]
    x = (xs[m] / w * 2 - 1).astype(np.float64); y = (ys[m] / h * 2 - 1).astype(np.float64)
    A = np.stack([np.ones_like(x), x, y], 1)
    X = (np.arange(w) / w * 2 - 1)[None, :].astype(np.float32); Y = (np.arange(h) / h * 2 - 1)[:, None].astype(np.float32)
    out = np.empty((h, w, 3), np.float32)
    for c in range(3):
        cf = np.linalg.lstsq(A, a[::step, ::step, c][m].astype(np.float64), rcond=None)[0]
        out[..., c] = cf[0] + cf[1] * X + cf[2] * Y
    return out

Y0, Y1, TW = 196, 729, 320
STAGES = {
  1: dict(x0=10.5,
          zones=[(10.5, 196, 128.6, 729, 'protect'), (218.5, 409, 330.5, 473, 'protect'), (324, 196, 330.5, 729), (10.5, 714.5, 330.5, 729)],
          leaders=[dict(line=(201, 229.6, 440.3), half=3.4)]),
  2: dict(x0=319.5,
          zones=[(319.5, 196, 337.5, 729), (319.5, 274, 439, 340), (530, 323, 639.5, 370)],
          leaders=[dict(line=(434, 459, 308.95), dot=(461.75, 308.95)), dict(line=(506, 536.5, 347.5), dot=(503.95, 347.5)), dict(line=(507.5, 539, 588.2), dot=(505.65, 588.2))],
          surface_text=[dict(box=(536, 573, 632, 619), limit=(528, 520, 638, 700))]),
  3: dict(x0=626.5,
          zones=[(626.5, 196, 652, 729), (832.5, 518, 946.5, 599), (929, 196, 946.5, 729)], novalid=[(590, 160, 652, 760)],
          leaders=[dict(line=(804, 833, 551.2), dot=(802.25, 551.2))]),
  4: dict(x0=907,
          zones=[(907, 196, 946, 729), (1114.5, 275, 1227, 356), (1114.5, 538, 1227, 623), (1188, 196, 1227, 729)],
          leaders=[dict(line=(1083.4, 1115.5, 316.5), dot=(1081.55, 316.5)), dict(line=(1084.5, 1116.5, 574.85), dot=(1082.65, 574.85))]),
}
EXPORT = (900, 1500)

def build():
    img = im0.copy()
    print('collar print fix:', fix_twisy(img))
    for i, c in STAGES.items():
        for ld in c['leaders']: remove_leader(img, **ld)
        for sb in c.get('surface_text', []): remove_text_on_surface(img, sb['box'], limit=sb['limit'])
    tiles = {}
    for i, c in STAGES.items():
        pad = 26
        X0, X1 = max(0, P(c['x0'] - pad)), min(W, P(c['x0'] + TW + pad)); Ya, Yb = P(Y0 - pad), P(Y1 + pad)
        a = img[Ya:Yb, X0:X1].copy(); h, w = a.shape[:2]
        zone = np.zeros((h, w), np.uint8); guarded = np.zeros((h, w), np.uint8)
        for z in c['zones']:
            zx0, zy0, zx1, zy1 = z[:4]
            # a zone that reaches the tile edge continues past it, so its feather never falls on the edge itself
            if zx0 <= c['x0'] + 0.01: zx0 -= 12
            if zx1 >= c['x0'] + TW - 0.01: zx1 += 12
            if zy0 <= Y0 + 0.01: zy0 -= 12
            if zy1 >= Y1 - 0.01: zy1 += 12
            sl = (slice(max(0, P(zy0) - Ya), max(0, P(zy1) - Ya)), slice(max(0, P(zx0) - X0), max(0, P(zx1) - X0)))
            zone[sl] = 1
            if len(z) > 4: guarded[sl] = 1        # zone that touches the object: its colour must survive
        # anything outside the tile itself (context padding) may hold neighbours' content: never sample it as background
        # object colour inside a zone is never replaced (collar edge beside the bracket, etc.)
        protect = cv2.dilate((chroma(a) > 42).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (P(1.4) * 2 + 1,) * 2)) & guarded
        nonbg = (~bg_like(a)).astype(np.uint8)
        valid = (cv2.dilate(nonbg, np.ones((P(2.5) * 2 + 1,) * 2, np.uint8)) == 0) & (cv2.dilate(zone, np.ones((P(1.5) * 2 + 1,) * 2, np.uint8)) == 0)
        for (nx0, ny0, nx1, ny1) in c.get('novalid', []):   # neighbour's content that only looks like background
            valid[max(0, P(ny0) - Ya):max(0, P(ny1) - Ya), max(0, P(nx0) - X0):max(0, P(nx1) - X0)] = False
        model = fit_plane(a, valid)
        res = (a.astype(np.float32) - model) * valid[..., None]
        sg = P(9)
        wgt = cv2.GaussianBlur(valid.astype(np.float32), (0, 0), sg)
        corr = cv2.GaussianBlur(res, (0, 0), sg) / np.maximum(wgt, 0.02)[..., None] * np.clip(wgt / 0.2, 0, 1)[..., None]
        fill = model + corr
        m = cv2.GaussianBlur((zone & (1 - protect)).astype(np.float32), (0, 0), 2.6)
        m = np.minimum(m, 1 - cv2.GaussianBlur(protect.astype(np.float32), (0, 0), 1.2))
        m = np.where(zone > 0, np.maximum(m, (1 - protect) * 0.0), m)[..., None]
        out = np.clip(a.astype(np.float32) * (1 - m) + fill * m, 0, 255).astype(np.uint8)
        tx, ty = P(c['x0']) - X0, P(Y0) - Ya
        t = out[ty:ty + P(Y1) - P(Y0), tx:tx + P(TW)]
        tiles[i] = t
        cv2.imwrite(f'{OUT}/tile{i}_full.png', t)
        small = cv2.resize(t, EXPORT, interpolation=cv2.INTER_AREA)
        Image.fromarray(cv2.cvtColor(small, cv2.COLOR_BGR2RGB)).save(f'{OUT}/stage-{i}.webp', 'WEBP', quality=90, method=6)
        resid = np.abs(a.astype(np.float32) - fill)[valid]
        print(f'stage {i}: tile {t.shape[1]}x{t.shape[0]}  webp {os.path.getsize(f"{OUT}/stage-{i}.webp") // 1024} KB  bg-fill residual median {np.median(resid):.2f} p99 {np.percentile(resid, 99):.2f}  corners', t[4, 4][::-1].tolist(), t[4, -5][::-1].tolist(), t[-5, 4][::-1].tolist(), t[-5, -5][::-1].tolist())
    sheet = np.full((560, 4 * 330 + 10, 3), 70, np.uint8)
    for i, t in tiles.items():
        sheet[10:550, 10 + (i - 1) * 330:10 + (i - 1) * 330 + 320] = cv2.resize(t, (320, 540), interpolation=cv2.INTER_AREA)
    cv2.imwrite(f'{OUT}/sheet3.jpg', sheet, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return tiles

if __name__ == '__main__':
    build()
