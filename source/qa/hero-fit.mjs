// Home hero: the three-sentence statement must keep one sentence per line and the pen must be level and whole,
// at every width, in both languages.   usage: node qa/hero-fit.mjs [baseUrl]
import { chromium } from 'playwright';
const BASE = process.argv[2] || 'http://localhost:5173';
const WIDTHS = [320, 360, 375, 390, 412, 430, 540, 600, 639, 640, 768, 820, 912, 1024, 1180, 1280, 1366, 1440, 1536, 1920];
const browser = await chromium.launch();
let bad = 0, total = 0;
for (const lang of ['ar', 'en']) for (const w of WIDTHS) {
  total++;
  const h = w < 700 ? Math.round(w * 2.05) : w < 1000 ? Math.round(w * 1.35) : Math.round(w * 0.6);
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.addInitScript((l) => localStorage.setItem('dermiq.lang', l), lang);
  await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  const r = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const spans = [...h1.querySelectorAll('span')];
    const rows = spans.map((s) => { const g = document.createRange(); g.selectNodeContents(s); return new Set([...g.getClientRects()].map((q) => Math.round(q.top))).size; });
    const inside = spans.every((s) => { const g = document.createRange(); g.selectNodeContents(s); return [...g.getClientRects()].every((q) => q.left >= -0.5 && q.right <= innerWidth + 0.5); });
    const hero = h1.closest('section');
    const img = hero.querySelector('figure img'); const b = img.getBoundingClientRect();
    // any rotation or skew anywhere above the pen would show up in the accumulated transform
    let tilted = false; for (let e = img; e && e !== document.body; e = e.parentElement) { const t = getComputedStyle(e).transform; if (t && t !== 'none') { const m = new DOMMatrixReadOnly(t); if (Math.abs(m.b) > 1e-4 || Math.abs(m.c) > 1e-4) tilted = true; } }
    const lead = [...hero.querySelectorAll('p')].find((p) => p.textContent.length > 80);
    const lb = lead ? lead.getBoundingClientRect() : null;
    return {
      sentences: spans.length, rows, inside,
      pen: { whole: b.left >= -0.5 && b.right <= innerWidth + 0.5 && b.width > 200, loaded: img.complete && img.naturalWidth > 0, ratio: +(b.width / b.height).toFixed(2), natural: +(img.naturalWidth / img.naturalHeight).toFixed(2), tilted },
      lead: !!lb && lb.width > 150 && lb.height > 20 && lb.left >= -0.5 && lb.right <= innerWidth + 0.5 && getComputedStyle(lead).visibility === 'visible',
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  const ok = r.sentences === 3 && r.rows.every((n) => n === 1) && r.inside && r.pen.whole && r.pen.loaded && !r.pen.tilted && Math.abs(r.pen.ratio - r.pen.natural) < 0.05 && r.lead && !r.overflowX;
  if (!ok) { bad++; console.log('FAIL', lang, w, JSON.stringify(r)); }
  await ctx.close();
}
console.log(bad ? `${bad} of ${total} FAILED` : `ALL PASS — ${total} hero layouts (${WIDTHS[0]}–${WIDTHS[WIDTHS.length - 1]} px, Arabic and English)`);
await browser.close();
process.exit(bad ? 1 : 0);
