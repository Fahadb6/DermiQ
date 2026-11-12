import cv2, numpy as np, os, sys
from PIL import Image
sys.path.insert(0, '.')
from pen_matte import comp

OUT = '/home/user/dermiq/src/assets/product'
os.makedirs(OUT, exist_ok=True)

def save_webp(arr_bgr_or_bgra, name, q=90):
    a = arr_bgr_or_bgra
    if a.shape[2] == 4: im = Image.fromarray(cv2.cvtColor(a, cv2.COLOR_BGRA2RGBA))
    else: im = Image.fromarray(cv2.cvtColor(a, cv2.COLOR_BGR2RGB))
    p = os.path.join(OUT, name)
    im.save(p, 'WEBP', quality=q, method=6)
    print(f'{name:28s} {im.size}  {os.path.getsize(p)//1024} KB')

def border_bg(img, m=6):
    b = np.concatenate([img[:m].reshape(-1,3), img[-m:].reshape(-1,3), img[:, :m].reshape(-1,3), img[:, -m:].reshape(-1,3)])
    return np.median(b, axis=0)

def white_norm(img, bg=None):
    bg = border_bg(img) if bg is None else np.array(bg, np.float32)
    return np.clip(img.astype(np.float32) / bg * 255.0, 0, 255)

def color_to_alpha(img_white, floor=0.035, gamma=1.0):
    """White -> transparent ("multiply-ready" asset for light surfaces)."""
    c = img_white.astype(np.float32)/255.
    a = 1.0 - c.min(axis=2)
    a2 = np.clip((a - floor)/(1 - floor), 0, 1)
    safe = np.maximum(a2, 1e-4)[...,None]
    fg = np.clip((c - (1 - a2[...,None]))/safe, 0, 1)
    out = np.dstack([fg*255, a2*255]).astype(np.uint8)
    return out

def neutralise_blue(img, region=None, lift=0.5, keep=0.05):
    H,W = img.shape[:2]
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    h,s,v = hsv[...,0], hsv[...,1]/255., hsv[...,2]/255.
    blue = (h > 82) & (h < 117) & (s > 0.10)
    if region is not None:
        r = np.zeros((H,W), bool); x0,y0,x1,y1 = region; r[y0:y1, x0:x1] = True; blue &= r
    w = np.clip((s-0.10)/0.12, 0, 1) * blue
    w = cv2.GaussianBlur(w.astype(np.float32), (0,0), 1.0)
    s2 = s*(1-w) + (s*keep)*w
    v2 = v*(1-w) + (v + (1-v)*lift)*w
    return cv2.cvtColor(np.dstack([h, np.clip(s2*255,0,255), np.clip(v2*255,0,255)]).astype(np.uint8), cv2.COLOR_HSV2BGR)

# ------------------------------------------------------------------ 1. pen (installed cartridge), alpha cut-out
pen = cv2.imread('crops/pen_installed_rgba.png', cv2.IMREAD_UNCHANGED)
save_webp(pen, 'pen.webp', 92)

# ------------------------------------------------------------------ 2. pen + separate cartridges plate
pc = cv2.imread('ref/pen_cartridges.png')
H_, W_ = pc.shape[:2]
hsv = cv2.cvtColor(pc, cv2.COLOR_BGR2HSV).astype(np.float32)
h,s,v = hsv[...,0], hsv[...,1]/255., hsv[...,2]/255.
blue = (h > 82) & (h < 119) & (s > 0.085)
blue[:560] = False
inside = np.zeros((H_,W_), bool)
for (xa, xb) in [(226,353), (572,693), (906,1027)]: inside[600:790, xa:xb] = True
w_in = cv2.GaussianBlur((np.clip((s-0.085)/0.10,0,1) * (blue & inside)).astype(np.float32), (0,0), 1.0)
w_out = cv2.GaussianBlur((np.clip((s-0.085)/0.06,0,1) * (blue & ~inside)).astype(np.float32), (0,0), 1.5)
# inside the glass: colourless liquid
s2 = s*(1-w_in) + (s*0.04)*w_in
v2 = v*(1-w_in) + (v + (1-v)*0.40)*w_in
h2 = h.copy()
# outside the glass: blue spill on the backdrop -> backdrop lavender
bgH, bgS = 126.0, 0.075
h2 = h2*(1-w_out) + bgH*w_out
s2 = s2*(1-w_out) + bgS*w_out
v2 = v2*(1-w_out) + np.minimum(v2, 0.966)*w_out
pc = cv2.cvtColor(np.dstack([h2, np.clip(s2*255,0,255), np.clip(v2*255,0,255)]).astype(np.uint8), cv2.COLOR_HSV2BGR)
# clone "TWIST" from cartridge 2 onto cartridge 3 (typo in the render)
g = cv2.cvtColor(pc, cv2.COLOR_BGR2GRAY)
tb = (636, 570, 676, 592)            # "TO MIX" on cartridge 2
tpl = g[tb[1]:tb[3], tb[0]:tb[2]]
sx0, sy0 = 950, 556
res = cv2.matchTemplate(g[sy0:606, sx0:1030], tpl, cv2.TM_CCOEFF_NORMED)
_, mx, _, loc = cv2.minMaxLoc(res)
dx = sx0 + loc[0] - tb[0]; dy = sy0 + loc[1] - tb[1]
print('clone offset', dx, dy, 'score', round(mx,3))
sb = (588, 569, 635, 593)            # "TWIST" on cartridge 2
patch = pc[sb[1]:sb[3], sb[0]:sb[2]].astype(np.float32)
hh, ww = patch.shape[:2]
fm = np.zeros((hh,ww), np.float32); fm[2:-2, 2:-2] = 1; fm = cv2.GaussianBlur(fm, (0,0), 1.0)[...,None]
dst = pc[sb[1]+dy:sb[3]+dy, sb[0]+dx:sb[2]+dx].astype(np.float32)
pc[sb[1]+dy:sb[3]+dy, sb[0]+dx:sb[2]+dx] = (patch*fm + dst*(1-fm)).astype(np.uint8)
# remove garbled descriptor micro-text under the wordmark on the three loose cartridges
for (x0,y0,x1,y1) in [(238,673,352,705), (578,673,690,705), (912,673,1024,705)]:
    roi = pc[y0:y1, x0:x1]
    gr = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY).astype(np.float32)
    gm = cv2.cvtColor(cv2.medianBlur(roi, 21), cv2.COLOR_BGR2GRAY).astype(np.float32)
    m = ((gm - gr) > 7).astype(np.uint8)*255
    m = cv2.dilate(m, np.ones((3,3),np.uint8))
    full = np.zeros(pc.shape[:2], np.uint8); full[y0:y1, x0:x1] = m
    pc = cv2.inpaint(pc, full, 3, cv2.INPAINT_TELEA)
cv2.imwrite('crops/pc_clean.png', pc)
save_webp(pc, 'pen-cartridges.webp', 90)

# single cartridge (middle), multiply-ready
cart = pc[312:800, 548:718].copy()
cw = white_norm(cart, bg=border_bg(cart))
sil = np.zeros(cart.shape[:2], np.float32)
sil[6:482, 22:148] = 1; sil[232:296, 12:160] = 1      # body + twist collar
sil = cv2.GaussianBlur(sil, (0,0), 2.0)[...,None]
cw = cw*sil + 255.0*(1-sil)
save_webp(color_to_alpha(cw, floor=0.05), 'cartridge.webp', 92)
cv2.imwrite('crops/cart_single.png', cart)

# ------------------------------------------------------------------ 3. treatment head views
head = cv2.imread('ref/head.png')
A = head[191:820, 32:764].copy()
# detect + remove leader lines / dots (annotation overlay of the reference sheet)
hsvA = cv2.cvtColor(A, cv2.COLOR_BGR2HSV).astype(np.float32)
hA, sA, vA = hsvA[...,0]*2, hsvA[...,1]/255., hsvA[...,2]/255.
dp = (sA > 0.35) & (vA < 0.8) & (hA > 240) & (hA < 300)
mask = np.zeros(A.shape[:2], np.uint8)
rows = [y for y in range(A.shape[0]) if dp[y, 708:730].sum() >= 16]
groups = []
for y in rows:
    if groups and y - groups[-1][-1] <= 2: groups[-1].append(y)
    else: groups.append([y])
for gr_ in groups:
    yc = int(round(np.mean(gr_)))
    x = 708
    while x > 520:
        col = dp[yc-1:yc+2, x].any()
        thick = dp[yc-7:yc+8, x].sum()
        if not col or thick > 9: break
        x -= 1
    print('leader y', yc, 'ends x', x)
    cv2.line(mask, (x-2, yc), (A.shape[1]-1, yc), 255, 7)
    cv2.circle(mask, (x-5, yc), 15, 255, -1)
A = cv2.inpaint(A, mask, 6, cv2.INPAINT_TELEA)
cv2.imwrite('crops/headA_clean.png', A)
Aw = white_norm(A, bg=np.median(A[:10,:200].reshape(-1,3), axis=0))
save_webp(color_to_alpha(Aw, floor=0.03), 'head-34.webp', 92)

B = head[239:653, 1229:1640]
save_webp(color_to_alpha(white_norm(B), floor=0.03), 'head-array.webp', 92)
C = head[892:1298, 40:462]
save_webp(color_to_alpha(white_norm(C), floor=0.03), 'head-top.webp', 92)
D = head[905:1300, 512:1040].copy()
bgD = np.median(D[:8,:200].reshape(-1,3), axis=0).astype(np.uint8)
D[330:, 462:] = bgD; D[370:, 430:] = bgD; D[:30, 505:] = bgD          # dimension mark / leader stub of the reference sheet
save_webp(color_to_alpha(white_norm(D, bg=bgD), floor=0.03), 'head-side.webp', 92)
F = head[1373+16:1373+326, 920+62:920+650].copy()
save_webp(color_to_alpha(white_norm(F, bg=(250,248,250)), floor=0.02), 'head-macro.webp', 92)

# ------------------------------------------------------------------ 3b. cartridge concept states (reference diagram frames)
wf = cv2.imread('ref/workflow_b.png')
f1 = wf[176:614, 110:187].copy()
f3 = wf[176:614, 650:725].copy()
m3 = np.zeros(f3.shape[:2], np.uint8)
cv2.line(m3, (48, 304), (74, 304), 255, 7); cv2.circle(m3, (51, 304), 7, 255, -1)
f3 = cv2.inpaint(f3, m3, 5, cv2.INPAINT_TELEA)
m1 = np.zeros(f1.shape[:2], np.uint8); m1[203:214, 64:77] = 255
f1 = cv2.inpaint(f1, m1, 4, cv2.INPAINT_TELEA)
for nm, fr in (('state-separated.webp', f1), ('state-mixed.webp', f3)):
    up = cv2.resize(fr, None, fx=2, fy=2, interpolation=cv2.INTER_LANCZOS4)
    save_webp(color_to_alpha(white_norm(up, bg=border_bg(fr, 3)), floor=0.05), nm, 90)
cv2.imwrite('crops/f1.png', f1); cv2.imwrite('crops/f3.png', f3)

# ------------------------------------------------------------------ 4. packaging
pack = cv2.imread('ref/pack.png')
save_webp(pack, 'packaging.webp', 88)
save_webp(pack[325:748, 580:1250], 'packaging-window.webp', 90)

# previews
def prev(name, col=(0xF5,0xF9,0xFB)):
    im = cv2.cvtColor(np.array(Image.open(os.path.join(OUT,name)).convert('RGBA')), cv2.COLOR_RGBA2BGRA)
    return comp(im, col)
def sheet(names, fn, col=(0xF5,0xF9,0xFB), pad=20):
    ims = [prev(n, col) for n in names]
    H = max(i.shape[0] for i in ims) + 2*pad; W = sum(i.shape[1] for i in ims) + pad*(len(ims)+1)
    s = np.zeros((H,W,3), np.uint8); s[:] = col
    x = pad
    for i in ims:
        s[pad:pad+i.shape[0], x:x+i.shape[1]] = i; x += i.shape[1] + pad
    cv2.imwrite(fn, s); print(fn, s.shape)
sheet(['head-34.webp','head-array.webp','head-top.webp'], 'crops/prev_heads1.png')
sheet(['head-side.webp','head-macro.webp','cartridge.webp','state-separated.webp','state-mixed.webp'], 'crops/prev_heads2.png', col=(0xE9,0xF0,0xF4))
