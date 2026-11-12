"""Procedural, clearly synthetic scalp-progress images for the fictional demo patients.
No real patient imagery is used anywhere in the prototype."""
import cv2, numpy as np, os
from PIL import Image
OUT = '/home/user/dermiq/public/demo'

def smoothstep(x): x = np.clip(x, 0, 1); return x*x*(3-2*x)

def fbm(rng, size, scale):
    n = rng.normal(0, 1, (size//scale + 2, size//scale + 2)).astype(np.float32)
    n = cv2.resize(n, (size, size), interpolation=cv2.INTER_CUBIC)
    return cv2.GaussianBlur(n, (0,0), scale*0.5)

def render(seed, skin, hair, cx, cy, r0, keep, base_angle, grey=0.0, S=1280, out=640):
    rng = np.random.default_rng(seed)          # geometry seed: identical per patient across dates
    rs = np.random.default_rng(seed*7919 + int(keep*1000))   # per-photo variation
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    # ---- skin
    skin = np.array(skin, np.float32)
    base = np.ones((S,S,3), np.float32) * skin
    lf = fbm(rng, S, 160)[...,None]; mf = fbm(rng, S, 24)[...,None]; ff = rng.normal(0,1,(S,S,1)).astype(np.float32)
    base *= (1 + 0.05*lf + 0.025*mf + 0.012*ff)
    base[...,2] *= (1 + 0.02*mf[...,0])      # faint redness variation (BGR: index 2 = R)
    # ---- patch geometry (irregular ellipse)
    a,b,c = rng.uniform(0, 6.28, 3)
    ph = np.arctan2(yy - cy*S, xx - cx*S)
    rr = r0*S*(1 + 0.13*np.sin(2*ph+a) + 0.08*np.sin(3*ph+b) + 0.05*np.sin(5*ph+c))
    d = np.hypot(xx - cx*S, yy - cy*S) / rr
    inside = 1 - smoothstep((d - 0.86)/0.3)             # 1 in patch, 0 outside
    # soft sheen on the bare area
    sheen = np.exp(-(((xx - (cx-0.03)*S)/(r0*S*0.7))**2 + ((yy - (cy-0.04)*S)/(r0*S*0.5))**2))
    base += (inside*sheen*14)[...,None]
    img = np.clip(base, 0, 255).astype(np.uint8)
    # ---- hair flow field
    flow = base_angle + 0.35*fbm(rng, S, 220) + 0.12*fbm(rng, S, 60)
    def hair_dir(x, y):
        th = flow[int(np.clip(y,0,S-1)), int(np.clip(x,0,S-1))]
        vx, vy = np.cos(th), np.sin(th)
        dx, dy = x - cx*S, y - cy*S; dist = np.hypot(dx, dy) + 1e-3
        w = np.clip(1.9 - dist/(r0*S), 0, 1)*0.50*float(np.clip((dist/(r0*S) - 0.45)/0.45, 0, 1))   # comb away from the patch edge
        vx = vx*(1-w) + (dx/dist)*w; vy = vy*(1-w) + (dy/dist)*w
        n = np.hypot(vx, vy) + 1e-6
        return vx/n, vy/n
    hair = np.array(hair, np.float32)
    def draw(n, length, thick, colfn, keepfn, bend=0.18, r=rng):
        for _ in range(n):
            x, y = r.uniform(-60, S+60), r.uniform(-60, S+60)
            xi, yi = int(np.clip(x,0,S-1)), int(np.clip(y,0,S-1))
            if r.random() > keepfn(xi, yi): continue
            vx, vy = hair_dir(x, y)
            L = max(12, r.normal(length, length*0.22))
            px, py = -vy, vx
            bd = r.normal(0, bend)*L
            p1 = (x + vx*L*0.5 + px*bd, y + vy*L*0.5 + py*bd)
            p2 = (x + vx*L + px*bd*0.4, y + vy*L + py*bd*0.4)
            pts = np.array([[x,y], p1, p2], np.float32)
            t = np.linspace(0,1,9)[:,None]
            curve = ((1-t)**2*pts[0] + 2*(1-t)*t*pts[1] + t**2*pts[2]).astype(np.int32)
            cv2.polylines(img, [curve], False, colfn(r), thick, cv2.LINE_AA)
    def dense_col(r):
        k = r.normal(1.0, 0.16)
        col = hair*k + (r.random() < 0.14)*np.array([38,34,30])
        if r.random() < grey: col = np.array([190,188,186])*r.uniform(0.8,1.05)
        return tuple(float(v) for v in np.clip(col, 0, 255))
    out_keep = lambda xi, yi: 1 - inside[yi, xi]
    # shadow layer under the hair mass
    shade = img.copy().astype(np.float32)
    shade *= (1 - 0.55*(1-inside))[...,None]
    img = shade.astype(np.uint8)
    draw(15000, 150, 3, dense_col, out_keep)
    draw(17000, 140, 2, dense_col, out_keep)
    # ---- fine hairs inside the patch (drawn with per-photo rng so density differs between dates)
    def fine_col(r):
        m = r.uniform(0.35, 0.75)
        col = hair*m + skin*(1-m)
        return tuple(float(v) for v in col)
    in_keep = lambda xi, yi: inside[yi, xi]*keep
    draw(int(9000), 34 + 60*keep, 1, fine_col, in_keep, bend=0.3, r=rs)
    if keep > 0.12:
        draw(int(5000), 60 + 90*keep, 2, dense_col, lambda xi, yi: inside[yi, xi]*(keep-0.1)*0.9, r=rs)
    # ---- lighting / lens
    vig = 1 - 0.32*(((xx - S/2)/(S*0.72))**2 + ((yy - S/2)/(S*0.72))**2)
    f = img.astype(np.float32) * vig[...,None]
    f = cv2.GaussianBlur(f, (0,0), 1.1)
    f += rs.normal(0, 2.2, f.shape)
    small = cv2.resize(np.clip(f,0,255).astype(np.uint8), (out, out), interpolation=cv2.INTER_AREA)
    return small

PATIENTS = {
    # id: (seed, skin BGR, hair BGR, cx, cy, r0, base_angle, grey, [keep per photo])
    'p1': (11, (150,178,214), (28,30,36), 0.50, 0.52, 0.20, 1.25, 0.00, [0.03, 0.15, 0.30]),
    'p2': (23, (120,150,192), (20,20,22), 0.46, 0.50, 0.24, 0.70, 0.05, [0.04, 0.05, 0.09]),
    'p3': (37, (165,190,222), (34,44,62), 0.54, 0.48, 0.17, 1.90, 0.00, [0.03, 0.06]),
    'p4': (41, (135,165,205), (24,24,28), 0.50, 0.50, 0.22, 0.20, 0.12, [0.04]),
    'p5': (53, (158,184,218), (30,36,48), 0.48, 0.54, 0.19, 2.40, 0.00, [0.04, 0.20, 0.21]),
    'p6': (67, (128,158,198), (22,22,26), 0.52, 0.47, 0.26, 1.00, 0.20, [0.03, 0.10]),
}
if __name__ == '__main__':
    for pid, (seed, skin, hair, cx, cy, r0, ang, grey, keeps) in PATIENTS.items():
        for i, k in enumerate(keeps):
            im = render(seed, skin, hair, cx, cy, r0, k, ang, grey)
            p = os.path.join(OUT, f'scalp-{pid}-{i+1}.webp')
            Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGR2RGB)).save(p, 'WEBP', quality=74, method=6)
            print(p, os.path.getsize(p)//1024, 'KB')
    # an extra neutral sample the reviewer can use to try the upload flow
    im = render(79, (150,176,210), (26,28,34), 0.5, 0.5, 0.21, 0.12, 1.6, 0.0)
    Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGR2RGB)).save(os.path.join(OUT, 'scalp-sample-upload.webp'), 'WEBP', quality=74, method=6)
