// Sign-in pages: the illustration and the panel statement must fit at every size, in both languages.
// usage: node qa/login-fit.mjs [baseUrl]
import { chromium } from 'playwright';
const BASE = process.argv[2] || 'http://localhost:5173';
const VIEWPORTS = [[360, 720], [390, 844], [820, 1180], [1024, 700], [1280, 720], [1366, 768], [1440, 900], [1920, 1080]];
const browser = await chromium.launch();
let bad = 0, total = 0;
for (const lang of ['ar', 'en']) for (const role of ['patient', 'physician']) for (const [w, h] of VIEWPORTS) {
  total++;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.addInitScript((l) => localStorage.setItem('dermiq.lang', l), lang);
  await page.goto(`${BASE}/#/login/${role}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  const r = await page.evaluate((role) => {
    const visible = (e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
    const imgs = [...document.querySelectorAll('[data-testid^="login-art"] img')].filter(visible);
    const img = imgs[0];
    const aside = document.querySelector('aside');
    const panel = aside && visible(aside);
    // each sentence of the statement must sit on one line and stay inside the panel
    const lines = panel ? [...aside.querySelectorAll('p.display span')].map((s) => {
      const range = document.createRange(); range.selectNodeContents(s);
      const rows = new Set([...range.getClientRects()].map((q) => Math.round(q.top)));
      const sb = s.getBoundingClientRect(), ab = aside.getBoundingClientRect();
      return rows.size === 1 && sb.left >= ab.left - 0.5 && sb.right <= ab.right + 0.5 && s.scrollWidth <= s.clientWidth + 1;
    }) : [];
    const fig = panel ? aside.querySelector('figure').getBoundingClientRect() : null;
    const txt = panel ? aside.querySelector('p.display').getBoundingClientRect() : null;
    return {
      shown: imgs.length,
      forRole: imgs.length === 1 && img.closest('[data-testid^="login-art"]').getAttribute('data-testid').endsWith(role),
      loaded: !!img && img.complete && img.naturalWidth > 0,
      alt: img ? img.alt.length : 0,
      linesOk: lines.every(Boolean), lineCount: lines.length,
      overlap: !!(fig && txt && fig.bottom > txt.top),
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      form: !!document.querySelector('[data-testid="login-form"]'),
    };
  }, role);
  const ok = r.shown === 1 && r.forRole && r.loaded && r.alt > 10 && r.linesOk && !r.overlap && !r.overflowX && r.form && (r.lineCount === 0 || r.lineCount === 3);
  if (!ok) { bad++; console.log('FAIL', lang, role, `${w}x${h}`, JSON.stringify(r)); }
  await ctx.close();
}
console.log(bad ? `${bad} of ${total} FAILED` : `ALL PASS — ${total} sign-in layouts`);
await browser.close();
process.exit(bad ? 1 : 0);
