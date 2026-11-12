// WCAG 2.1 AA text-contrast audit over representative routes. Usage: node contrast.mjs [baseUrl]
import { chromium } from 'playwright';
const BASE = process.argv[2] || 'http://localhost:5173';
const P = 'patient|DQ-P-1001|sara@dermiq.demo', D = 'physician|DQ-DR-01|dr.lina@dermiq.demo', R = 'patient|DQ-P-1005|reem@dermiq.demo';
const routes = [
  ['/', null], ['/about', null], ['/product', null], ['/philosophy', null], ['/how-it-works', null], ['/guide', null], ['/guide/dermiq-at-a-glance', null], ['/faq', null], ['/contact', null], ['/privacy', null], ['/login/patient', null], ['/login/physician', null],
  ['/patient', P], ['/patient/plan', P], ['/patient/walkthrough', P], ['/patient/sessions', P], ['/patient/progress', P], ['/patient/reminders', P], ['/patient/education', P], ['/patient/settings', P], ['/patient', R], ['/patient/plan', R],
  ['/physician', D], ['/physician/patients', D], ['/physician/patients/DQ-P-1003?tab=configuration', D], ['/physician/patients/DQ-P-1001?tab=overview', D], ['/physician/patients/DQ-P-1001?tab=sessions', D], ['/physician/sessions', D], ['/physician/progress', D], ['/physician/appointments', D], ['/physician/notifications', D], ['/physician/content', D], ['/physician/settings', D],
];
const browser = await chromium.launch();
const all = new Map();
let checked = 0;
for (const lang of ['en', 'ar']) for (const [w, h] of [[1440, 900], [390, 844]]) {
  for (const [path, login] of routes) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.addInitScript(([l, login]) => {
      localStorage.setItem('dermiq.lang', l);
      if (login && !sessionStorage.getItem('dermiq.session')) {
        const [role, profileId, email] = login.split('|'); const now = Date.now();
        sessionStorage.setItem('dermiq.session', JSON.stringify({ userId: 'U', role, profileId, email, startedAt: new Date(now).toISOString(), expiresAt: new Date(now + 8 * 3600e3).toISOString() }));
      }
    }, [lang, login]);
    await page.goto(`${BASE}/#${path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(250);
    const res = await page.evaluate(() => {
      const parse = (c) => { const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
      const over = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
      const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
      const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
      const bgOf = (el) => {
        const stack = [];
        for (let e = el; e; e = e.parentElement) {
          const cs = getComputedStyle(e); const c = parse(cs.backgroundColor);
          if (cs.backgroundImage !== 'none' && (!c || c.a < 1)) return null;
          if (c && c.a > 0) { stack.push(c); if (c.a === 1) break; }
        }
        let base = { r: 255, g: 255, b: 255, a: 1 };
        for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
        return base;
      };
      const out = []; let n = 0;
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (tw.nextNode()) {
        const node = tw.currentNode; const txt = node.textContent.trim(); if (!txt) continue;
        const el = node.parentElement; if (!el || el.closest('script,style,noscript,[aria-hidden="true"]')) continue;
        if (el.closest(':disabled,[aria-disabled="true"]')) continue;
        const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        const r = el.getBoundingClientRect(); if (r.width < 3 || r.height < 3) continue;
        let op = 1; for (let e = el; e; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
        if (op < 0.05) continue;
        const bg = bgOf(el); if (!bg) continue;
        let fg = parse(cs.color); if (!fg) continue; fg = over({ ...fg, a: fg.a * op }, bg);
        const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        const size = parseFloat(cs.fontSize); const large = size >= 24 || (size >= 18.66 && parseInt(cs.fontWeight) >= 700);
        n++;
        if (ratio < (large ? 3 : 4.5)) out.push({ key: `${hex(fg)} on ${hex(bg)}`, ratio: +ratio.toFixed(2), size: Math.round(size), txt: txt.slice(0, 34), cls: (el.className && el.className.baseVal === undefined ? el.className : '').toString().slice(0, 110) });
      }
      return { out, n };
    });
    checked += res.n;
    for (const f of res.out) { const k = f.key + '|' + f.cls; const e = all.get(k) || { ...f, count: 0, where: new Set() }; e.count++; e.where.add(path); all.set(k, e); }
    await ctx.close();
  }
}
const rows = [...all.values()].sort((a, b) => a.ratio - b.ratio);
console.log(`text nodes checked: ${checked}; failing style groups: ${rows.length}`);
for (const r of rows.slice(0, 40)) console.log(`${r.ratio}  ${r.key}  ${r.size}px ×${r.count}  "${r.txt}"  [${r.cls}]  @${[...r.where].slice(0, 2).join(',')}`);
await browser.close();
