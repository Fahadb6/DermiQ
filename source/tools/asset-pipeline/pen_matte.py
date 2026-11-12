import cv2, numpy as np
from scipy.signal import medfilt

def first_run(mask1d, n):
    k = np.convolve(mask1d.astype(np.int16), np.ones(n, np.int16), 'valid')
    f = np.flatnonzero(k == n)
    return int(f[0]) if len(f) else None

def profile_matte(img, med_top=11, med_bot=15, s_body=0.060, v_edge=0.915, rim_gap=12, debug=False):
    """Column-profile matte for a horizontal pen photographed on a flat lavender backdrop
    with a contact shadow underneath. Returns a binary mask."""
    H,W = img.shape[:2]
    hsv = cv2.cvtColor(cv2.GaussianBlur(img,(0,0),0.7), cv2.COLOR_BGR2HSV).astype(np.float32)
    s,v = hsv[...,1]/255., hsv[...,2]/255.
    bgv = cv2.GaussianBlur(np.median(v[:8], axis=0)[None,:].astype(np.float32), (0,0), 12)[0]
    bgs = cv2.GaussianBlur(np.median(s[:8], axis=0)[None,:].astype(np.float32), (0,0), 12)[0]
    strong = (v < (bgv - (1.0 - v_edge))[None,:])
    body = (s < (bgs * (s_body/0.09))[None,:])
    penlike = (body & (v < (bgv - 0.06)[None,:])) | (s > 0.30) | (v < 0.25)
    # --- contact-shadow line (robust straight-line fit) ---
    half = H//2
    dr = half + np.argmin(v[half:], axis=0).astype(np.float64)
    dv = np.min(v[half:], axis=0)
    xs = np.arange(W); ok = dv < 0.35
    for _ in range(6):
        c = np.polyfit(xs[ok], dr[ok], 1)
        res = np.abs(dr - np.polyval(c, xs))
        ok = (dv < 0.35) & (res < max(2.5, np.median(res[ok])*2.5))
    line = np.polyval(c, xs)
    if debug: print('contact line', c)
    top = np.full(W, np.nan); bot = np.full(W, np.nan)
    for x in range(W):
        z0 = int(max(0, line[x] - 10)); z1 = int(min(H, line[x] + 14))
        A = first_run(strong[:z0, x], 2)
        B = first_run(body[:z0, x], 10)
        if A is None and B is None: continue
        if B is None or (A is not None and A - B <= rim_gap): t = A
        else: t = B
        idx = np.flatnonzero(penlike[:, x])
        if len(idx) < 3: continue
        last = idx[-1] + 1.0
        if last > z0 - 8:
            dark = z0 + int(np.argmin(v[z0:z1, x])) - 1.0
            last = min(last, dark)
        if last - t < 6: continue
        top[x] = t; bot[x] = last
    xs = np.flatnonzero(~np.isnan(top)); xa, xb = xs.min(), xs.max()
    tt = top[xa:xb+1].copy(); bb = bot[xa:xb+1].copy()
    for arr in (tt, bb):
        nn = np.isnan(arr)
        if nn.any(): arr[nn] = np.interp(np.flatnonzero(nn), np.flatnonzero(~nn), arr[~nn])
    t = medfilt(tt, med_top); b = medfilt(bb, med_bot)
    k = med_top//2 + 1; t[:k] = tt[:k]; t[-k:] = tt[-k:]
    k = med_bot//2 + 1; b[:k] = bb[:k]; b[-k:] = bb[-k:]
    mask = np.zeros((H,W), np.uint8)
    for i, x in enumerate(range(xa, xb+1)):
        mask[int(round(t[i])):int(round(b[i]))+1, x] = 1
    return mask

def finish(img, mask, erode=1, feather=0.8, smooth=1.6):
    m = cv2.GaussianBlur(mask.astype(np.float32), (0,0), smooth)
    m = (m > 0.5).astype(np.uint8)
    if erode: m = cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*erode+1,2*erode+1)))
    alpha = np.clip(cv2.GaussianBlur(m.astype(np.float32), (0,0), feather), 0, 1)
    inner = cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7)))
    band = (cv2.dilate(m, np.ones((9,9),np.uint8)) & (1-inner)).astype(np.uint8)*255
    rgb = cv2.inpaint(img, band, 4, cv2.INPAINT_TELEA)
    out = np.dstack([rgb, (alpha*255).astype(np.uint8)])
    ys,xs = np.where(alpha>0.02)
    return out[max(ys.min()-4,0):ys.max()+5, max(xs.min()-4,0):xs.max()+5]

def comp(out, col):
    a = out[...,3:4].astype(np.float32)/255.
    bgc = np.zeros_like(out[...,:3]); bgc[:] = col
    return (out[...,:3]*a + bgc*(1-a)).astype(np.uint8)
