import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFilter

src = cv2.imread('ref/pen_filled.png')  # BGR
x0,y0,x1,y1 = 28, 860, 2020, 1235
img = src[y0:y1, x0:x1].copy()
H,W = img.shape[:2]

# ---------- 1. neutralise the blue tint of the liquid in the holder window ----------
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
h,s,v = hsv[...,0], hsv[...,1]/255., hsv[...,2]/255.
region = np.zeros((H,W), bool)
region[945-y0:1055-y0, 600-x0:1080-x0] = True
blue = region & (h > 80) & (h < 118) & (s > 0.10)
wgt = np.clip((s-0.10)/0.15, 0, 1) * blue
wgt = cv2.GaussianBlur(wgt.astype(np.float32), (0,0), 1.2)
s2 = s*(1-wgt) + (s*0.05)*wgt
v2 = v*(1-wgt) + (v + (1-v)*0.55)*wgt
img = cv2.cvtColor(np.dstack([h, np.clip(s2*255,0,255), np.clip(v2*255,0,255)]).astype(np.uint8), cv2.COLOR_HSV2BGR)

# ---------- 2. unit fix: "mg" -> "mL" on the mechanical dose counter ----------
gx0,gy0,gx1,gy1 = 1594-x0, 1036-y0, 1628-x0, 1086-y0
patch = img[gy0:gy1, gx0:gx1]
gray = cv2.cvtColor(patch, cv2.COLOR_BGR2GRAY).astype(np.float32)
bgl = np.median(gray[:6,:])
m = (gray > bgl + 9).astype(np.uint8)*255
m = cv2.dilate(m, np.ones((7,7),np.uint8))
mask = np.zeros((H,W), np.uint8); mask[gy0:gy1, gx0:gx1] = m
mask[:, :1594-x0] = 0
img = cv2.inpaint(img, mask, 6, cv2.INPAINT_TELEA)
# smooth the filled area a little to kill any ghost
blur = cv2.GaussianBlur(img, (0,0), 2.0)
mm = cv2.GaussianBlur(mask.astype(np.float32)/255., (0,0), 1.0)[...,None]
img = (img*(1-mm) + blur*mm).astype(np.uint8)
# draw L (supersampled)
SS = 8
lx0, ltop, lbase = 1597.0-x0, 1034.2-y0, 1068.6-y0
stem, foot_len, foot_th = 8.4, 20.5, 7.6
ox, oy = int(lx0)-10, int(ltop)-10
big = Image.new('L', (60*SS, 60*SS), 0)
d = ImageDraw.Draw(big)
def R(xa,ya,xb,yb): d.rectangle([ (xa-ox)*SS, (ya-oy)*SS, (xb-ox)*SS, (yb-oy)*SS ], fill=255)
R(lx0, ltop, lx0+stem, lbase)
R(lx0, lbase-foot_th, lx0+foot_len, lbase)
small = big.resize((60,60), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.45))
a = np.asarray(small).astype(np.float32)/255.
glyph_col = np.array([247,247,247], np.float32)
roi = img[oy:oy+60, ox:ox+60].astype(np.float32)
roi = roi*(1-a[...,None]) + glyph_col*a[...,None]
img[oy:oy+60, ox:ox+60] = np.clip(roi,0,255).astype(np.uint8)
cv2.imwrite('crops/pen_hi_fixed.png', img)

# ---------- 3. matte ----------
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
h,s,v = hsv[...,0]*2, hsv[...,1]/255., hsv[...,2]/255.
bglike = (h > 225) & (h < 285) & (s > 0.055) & (s < 0.26) & (v > 0.55)
fg0 = (~bglike).astype(np.uint8)
# GrabCut refinement seeded by colour rule
gc = np.where(fg0==1, cv2.GC_PR_FGD, cv2.GC_PR_BGD).astype(np.uint8)
gc[:10,:] = cv2.GC_BGD; gc[-10:,:] = cv2.GC_BGD; gc[:,:6] = cv2.GC_BGD; gc[:,-6:] = cv2.GC_BGD
sure = cv2.erode(fg0, np.ones((15,15),np.uint8))
gc[sure==1] = cv2.GC_FGD
bgd = np.zeros((1,65), np.float64); fgd = np.zeros((1,65), np.float64)
cv2.grabCut(img, gc, None, bgd, fgd, 4, cv2.GC_INIT_WITH_MASK)
fg = ((gc==1)|(gc==3)).astype(np.uint8)
fg = fg & fg0   # never keep lavender-looking pixels
# largest component + fill holes
n, lab, stats, _ = cv2.connectedComponentsWithStats(fg, 8)
big_i = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
fg = (lab==big_i).astype(np.uint8)
ff = fg.copy(); ffm = np.zeros((H+2,W+2), np.uint8)
inv = (1-fg).astype(np.uint8)
cv2.floodFill(inv, ffm, (0,0), 2)
fg[inv==1] = 1   # holes
fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3,3),np.uint8))
fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((5,5),np.uint8))
n, lab, stats, _ = cv2.connectedComponentsWithStats(fg, 8)
big_i = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]); fg = (lab==big_i).astype(np.uint8)
print('fg frac', fg.mean())
er = cv2.erode(fg, cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(3,3)))
alpha = cv2.GaussianBlur(er.astype(np.float32), (0,0), 0.9)
alpha = np.clip(alpha*1.15, 0, 1)
# colour decontamination: extend interior colours outward
inner = cv2.erode(fg, cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7)))
rgb = cv2.inpaint(img, ((1-inner)*255).astype(np.uint8) & (cv2.dilate(fg, np.ones((9,9),np.uint8))*255), 5, cv2.INPAINT_TELEA)
out = np.dstack([rgb, (alpha*255).astype(np.uint8)])
ys,xs = np.where(alpha>0.02)
out = out[max(ys.min()-6,0):ys.max()+7, max(xs.min()-6,0):xs.max()+7]
cv2.imwrite('crops/pen_installed_rgba.png', out)
print('cutout', out.shape)
# previews
def comp(col):
    a = out[...,3:4].astype(np.float32)/255.
    bgc = np.zeros_like(out[...,:3]); bgc[:] = col
    return (out[...,:3]*a + bgc*(1-a)).astype(np.uint8)
dark = comp((0x29,0x13,0x21)); light = comp((0xE9,0xF0,0xF4))
cv2.imwrite('crops/pen_hi_preview.png', np.vstack([dark, light]))
z = dark[:, :760]; cv2.imwrite('crops/pen_hi_edge_left.png', cv2.resize(z, None, fx=2, fy=2, interpolation=cv2.INTER_LANCZOS4))
z = dark[:, -760:]; cv2.imwrite('crops/pen_hi_edge_right.png', cv2.resize(z, None, fx=2, fy=2, interpolation=cv2.INTER_LANCZOS4))
z = img[60:250, 1420:1700]; cv2.imwrite('crops/pen_hi_dose_fixed.png', cv2.resize(z, None, fx=3, fy=3, interpolation=cv2.INTER_LANCZOS4))
