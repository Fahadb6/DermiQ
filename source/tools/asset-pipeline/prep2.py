"""DermiQ — cartridge stage tiles from the owner's reference sheet (b_#_STRICT_IMAGE_EDITI.webp).

What this does, and nothing else:
  * re-frames stages 1-4 of the sheet as four equal 3:5 tiles on the sheet's own background;
  * removes the baked-in English labels, brackets, leader lines and column rules (the interface draws
    translated captions instead);
  * corrects the misspelt collar print "TWISY TO MIX" (stage 4) to "TWIST TO MIX" by re-using the
    letter T from the same line.
The cartridge geometry, proportions and colours (including the blue of the mixed solution) are untouched.
"""
import cv2, numpy as np, os
from PIL import Image
SRC = '/home/user/uploads/b_#_STRICT_IMAGE_EDITI.webp'
OUT = '/home/user/work/prep'
im0 = cv2.cvtColor(np.array(Image.open(SRC).convert('RGB')), cv2.COLOR_RGB2BGR)
H, W = im0.shape[:2]; k = W / 1568.0
P = lambda u: int(round(u * k))

def box(b):  # (x0,y0,x1,y1) in sheet units -> pixel slices
    return slice(P(b[1]), P(b[3])), slice(P(b[0]), P(b[2]))

def hsv_of(a): return cv2.cvtColor(a, cv2.COLOR_BGR2HSV)

def ink_mask(a, thr=22, kern=61, protect_sat=None):
    """Thin dark strokes (text / brackets) in patch a."""
    g = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY)
    bh = cv2.morphologyEx(g, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kern, kern)))
    m = (bh > thr).astype(np.uint8)
    if protect_sat is not None:
        m[hsv_of(a)[..., 1] > protect_sat] = 0
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    if protect_sat is not None:
        m[hsv_of(a)[..., 1] > protect_sat] = 0
    return m

def remove_text(img, b, thr=22, protect_sat=None, radius=7, pad=14):
    ys, xs = box(b)
    ys2 = slice(max(0, ys.start - pad), min(H, ys.stop + pad)); xs2 = slice(max(0, xs.start - pad), min(W, xs.stop + pad))
    a = img[ys2, xs2]
    m = np.zeros(a.shape[:2], np.uint8)
    inner = ink_mask(a, thr, protect_sat=protect_sat)
    m[pad:-pad, pad:-pad] = inner[pad:-pad, pad:-pad]
    img[ys2, xs2] = cv2.inpaint(a, m, radius, cv2.INPAINT_TELEA)
    return int(m.sum())

def remove_hline(img, b, thr=9, win=41):
    """Horizontal leader line (and its end dot) inside box b: every masked run is refilled column by column
    by interpolating between the pixels just above and below it, so vertical structure (glass walls, collar
    ribs) crossing the line is continued exactly."""
    ys, xs = box(b)
    a = img[ys, xs].astype(np.float32); h, w = a.shape[:2]
    g = cv2.cvtColor(img[ys, xs], cv2.COLOR_BGR2GRAY)
    se = cv2.getStructuringElement(cv2.MORPH_RECT, (1, win))
    dark = cv2.morphologyEx(g, cv2.MORPH_BLACKHAT, se); light = cv2.morphologyEx(g, cv2.MORPH_TOPHAT, se)
    m = ((dark > thr) | (light > thr * 2.2)).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 9)))
    m[:4] = 0; m[-4:] = 0
    out = a.copy()
    for x in range(w):
        col = m[:, x]
        if not col.any(): continue
        y = 0
        while y < h:
            if col[y]:
                y2 = y
                while y2 + 1 < h and col[y2 + 1]: y2 += 1
                A = a[max(0, y - 3):y, x].mean(axis=0); B = a[y2 + 1:y2 + 4, x].mean(axis=0)
                n = y2 - y + 1
                t = ((np.arange(n) + 1) / (n + 1))[:, None]
                out[y:y2 + 1, x] = A * (1 - t) + B * t
                y = y2 + 1
            else: y += 1
    sm = cv2.GaussianBlur(out, (5, 1), 0)                      # kill single-column streaks, horizontally only
    mm = cv2.GaussianBlur(m.astype(np.float32), (5, 5), 0)[..., None]
    img[ys, xs] = np.clip(out * (1 - mm) + sm * mm, 0, 255).astype(np.uint8)
    return int(m.sum())

def bg_like(a):
    h_, s_, v_ = cv2.split(hsv_of(a))
    return (s_ >= 8) & (s_ <= 60) & (v_ >= 200) & (h_ >= 112) & (h_ <= 152)

def fit_bg(a, mask, step=4):
    h, w = a.shape[:2]
    ys, xs = np.mgrid[0:h:step, 0:w:step]; m = mask[::step, ::step]
    x = (xs[m] / w * 2 - 1).astype(np.float64); y = (ys[m] / h * 2 - 1).astype(np.float64)
    A = np.stack([np.ones_like(x), x, y, x * x, x * y, y * y], 1)
    X = (np.arange(w) / w * 2 - 1)[None, :].astype(np.float32); Y = (np.arange(h) / h * 2 - 1)[:, None].astype(np.float32)
    out = np.empty((h, w, 3), np.float32)
    for c in range(3):
        cf = np.linalg.lstsq(A, a[::step, ::step, c][m].astype(np.float64), rcond=None)[0]
        out[..., c] = cf[0] + cf[1] * X + cf[2] * Y + cf[3] * X * X + cf[4] * X * Y + cf[5] * Y * Y
    return out

def fix_twisy(img):
    """Stage 4 collar print reads TWISY TO MIX. Replace the Y with the T of the same word."""
    b = (1022, 480, 1112, 502); ys, xs = box(b)
    a = img[ys, xs]; g = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY)
    white = (g > 178).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(white, 8)
    comps = [j for j in range(1, n) if st[j, cv2.CC_STAT_AREA] > 60 and 18 < st[j, cv2.CC_STAT_HEIGHT] < 40]
    # the text line = glyphs sharing the same band; the pointer triangle below is excluded by its lower position
    top = np.median([st[j, cv2.CC_STAT_TOP] for j in comps])
    glyphs = sorted([j for j in comps if abs(st[j, cv2.CC_STAT_TOP] - top) < 8], key=lambda j: st[j, cv2.CC_STAT_LEFT])
    assert len(glyphs) == 10, ('expected 10 glyphs in TWISY TO MIX, found', len(glyphs))
    T, Y = glyphs[5], glyphs[4]          # the T of 'TO' sits right beside the Y: same lighting on the collar
    tx, ty, tw, th = st[T, :4]; yx, yy, yw, yh = st[Y, :4]
    pad = 5
    af = a.astype(np.float32)
    # 1) erase the Y: refill from the collar colour left/right of it (the collar shades horizontally, so
    #    fill each row by interpolating between the pixels either side of the glyph)
    my = cv2.dilate((lab == Y).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    erased = cv2.inpaint(a, my, 6, cv2.INPAINT_TELEA).astype(np.float32)
    # 2) lay the T down as coverage (alpha) so only letter pixels move, not the purple around them
    patch = af[ty - pad:ty + th + pad, tx - pad:tx + tw + pad]
    pg = cv2.cvtColor(patch.astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
    base = np.percentile(pg, 12); peak = np.percentile(pg, 99.5)
    alpha = np.clip((pg - base - 6) / (peak - base - 6), 0, 1)
    lp = lab[ty - pad:ty + th + pad, tx - pad:tx + tw + pad]
    own = cv2.dilate((lp == T).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    other = cv2.dilate(((lp != T) & (lp != 0)).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    alpha[~own | other] = 0                      # nothing but the T itself (not the edge of the neighbouring O)
    ink = af[lab == T].reshape(-1, 3); ink = ink[ink.sum(1) > np.percentile(ink.sum(1), 60)].mean(axis=0)
    # align: same baseline, centred on the Y's horizontal extent
    ox = int(round(yx + yw / 2 - tw / 2)) - pad; oy = (yy + yh) - th - pad
    dst = erased[oy:oy + patch.shape[0], ox:ox + patch.shape[1]]
    erased[oy:oy + patch.shape[0], ox:ox + patch.shape[1]] = dst * (1 - alpha[..., None]) + ink * alpha[..., None]
    img[ys, xs] = np.clip(erased, 0, 255).astype(np.uint8)
    return dict(T=(int(tx), int(ty), int(tw), int(th)), Y=(int(yx), int(yy), int(yw), int(yh)))

Y0, Y1, HALF = 196, 729, 160
STAGES = {
  1: dict(cx=170.5, obj=(124, 213, 218, 709), fit_x=(24, 326),
          text=[dict(b=(104, 236, 130, 424), protect_sat=95, thr=18), dict(b=(104, 458, 130, 656), protect_sat=95, thr=18),
                dict(b=(226, 412, 322, 472)), dict(b=(14, 712, 330, 729))],
          hline=[(197, 434, 232, 446)]),
  2: dict(x=(316, 636), obj=(341, 213, 640, 729), fit_x=(336, 636),
          text=[dict(b=(333, 280, 435, 338)), dict(b=(537, 326, 632, 366)), dict(b=(539, 572, 632, 614), thr=14, radius=9)],
          hline=[(433, 300, 469, 316), (496, 338, 539, 354), (497, 579, 541, 595)]),
  3: dict(cx=786.5, obj=(737, 213, 836, 709), fit_x=(650, 934),
          text=[dict(b=(841, 518, 946, 600))],
          hline=[(804, 543, 843, 559)]),
  4: dict(cx=1067, obj=(994, 213, 1118, 719), fit_x=(946, 1194),
          text=[dict(b=(1115, 279, 1192, 354)), dict(b=(1115, 541, 1192, 617))],
          hline=[(1074, 308, 1117, 324), (1075, 566, 1117, 582)]),
}
EXPORT = (840, 1400)
if __name__ == '__main__':
    img = im0.copy()
    info = fix_twisy(img); print('TWISY fix:', info)
    tiles = {}
    for i, c in STAGES.items():
        for t in c['text']:
            n = remove_text(img, t['b'], thr=t.get('thr', 22), protect_sat=t.get('protect_sat'), radius=t.get('radius', 7))
        for hb in c['hline']:
            remove_hline(img, hb)
        x0, x1 = c['x'] if 'x' in c else (c['cx'] - HALF, c['cx'] + HALF)
        ys = slice(P(Y0), P(Y1)); xs = slice(P(x0), P(x0) + P(2 * HALF))
        a = img[ys, xs].copy(); h, w = a.shape[:2]
        # everything away from the object -> the sheet's own (fitted) background
        fm = bg_like(a)
        fx0, fx1 = P(c['fit_x'][0]) - xs.start, P(c['fit_x'][1]) - xs.start
        fm[:, :max(0, fx0)] = False; fm[:, min(w, fx1):] = False
        ox0, oy0, ox1, oy1 = [P(v) for v in c['obj']]
        keep = np.zeros((h, w), np.float32)
        mg = P(9)
        keep[max(0, oy0 - ys.start - mg):min(h, oy1 - ys.start + mg), max(0, ox0 - xs.start - mg):min(w, ox1 - xs.start + mg)] = 1
        fm &= cv2.dilate(keep, np.ones((P(6) | 1,) * 2, np.uint8)) < 0.5 if i != 2 else fm
        bg = fit_bg(a, fm)
        keep = cv2.GaussianBlur(keep, (0, 0), P(3.2))[..., None]
        if i == 2:                                   # the hand runs off the right and bottom edges of the tile
            pass
        out = np.clip(a.astype(np.float32) * keep + bg * (1 - keep), 0, 255).astype(np.uint8)
        cv2.imwrite(f'{OUT}/tile{i}_full.png', out)
        tiles[i] = out
        small = cv2.resize(out, EXPORT, interpolation=cv2.INTER_AREA)
        Image.fromarray(cv2.cvtColor(small, cv2.COLOR_BGR2RGB)).save(f'{OUT}/stage-{i}.webp', 'WEBP', quality=90, method=6)
        print(f'stage {i}: region x {x0:.1f}-{x0 + 2 * HALF:.1f}  full {w}x{h}  webp {os.path.getsize(f"{OUT}/stage-{i}.webp") // 1024} KB  edge colour', out[5, 5][::-1].tolist(), out[-6, 5][::-1].tolist())
    sheet = np.full((560, 4 * 330 + 10, 3), 70, np.uint8)
    for i, t in tiles.items():
        sheet[10:550, 10 + (i - 1) * 330:10 + (i - 1) * 330 + 320] = cv2.resize(t, (320, 540), interpolation=cv2.INTER_AREA)
    cv2.imwrite(f'{OUT}/sheet2.jpg', sheet, [cv2.IMWRITE_JPEG_QUALITY, 90])
