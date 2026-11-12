// Horizontal-overflow sweep across many widths (the route crawl only looks at 1440 and 390).
// usage: node widths.mjs <group|all> [baseUrl]      env WIDTHS=320,360,...
import { chromium } from 'playwright';
const [group = 'all', BASE = 'http://localhost:5173'] = process.argv.slice(2);
const SARA = 'patient|DQ-P-1001|sara@dermiq.demo', KHALID = 'patient|DQ-P-1004|khalid@dermiq.demo', REEM = 'patient|DQ-P-1005|reem@dermiq.demo', DR = 'physician|DQ-DR-01|dr.lina@dermiq.demo';
const ROUTES = {
  public: [['/'], ['/about'], ['/product'], ['/philosophy'], ['/how-it-works'], ['/guide'], ['/guide/dermiq-at-a-glance'], ['/guide/reading-your-plan'], ['/faq'], ['/contact'], ['/privacy'], ['/nope'], ['/login/patient'], ['/login/physician']],
  patient: [['/patient', SARA], ['/patient/plan', SARA], ['/patient/walkthrough', SARA], ['/patient/sessions', SARA], ['/patient/reminders', SARA], ['/patient/progress', SARA], ['/patient/education', SARA], ['/patient/education/reading-your-plan', SARA], ['/patient/settings', SARA], ['/patient', KHALID], ['/patient/plan', KHALID], ['/patient', REEM], ['/patient/plan', REEM]],
  physician: [['/physician', DR], ['/physician/patients', DR], ['/physician/patients/DQ-P-1003?tab=configuration', DR], ['/physician/patients/DQ-P-1001?tab=configuration', DR], ['/physician/patients/DQ-P-1001', DR], ['/physician/patients/DQ-P-1001?tab=sessions', DR], ['/physician/patients/DQ-P-1001?tab=progress', DR], ['/physician/patients/DQ-P-1001?tab=appointments', DR], ['/physician/patients/DQ-P-1001?tab=notes', DR], ['/physician/sessions', DR], ['/physician/progress', DR], ['/physician/appointments', DR], ['/physician/notifications', DR], ['/physician/content', DR], ['/physician/settings', DR]],
};
const WIDTHS = (process.env.WIDTHS || '320,360,414,540,640,768,820,912,1024,1100,1180,1280,1366,1536,1920').split(',').map(Number);
const groups = group === 'all' ? Object.keys(ROUTES) : [group];
const browser = await chromium.launch();
let bad = 0, checked = 0;
for (const g of groups) for (const lang of ['ar', 'en']) for (const [path, login] of ROUTES[g]) {
  const ctx = await browser.newContext({ viewport: { width: WIDTHS[0], height: 900 } });
  const page = await ctx.newPage(); page.setDefaultTimeout(8000);
  await page.addInitScript(([l, login]) => {
    localStorage.setItem('dermiq.lang', l);
    if (login && !sessionStorage.getItem('dermiq.session')) { const [role, profileId, email] = login.split('|'); const now = Date.now(); sessionStorage.setItem('dermiq.session', JSON.stringify({ userId: 'U', role, profileId, email, startedAt: new Date(now).toISOString(), expiresAt: new Date(now + 8 * 3600e3).toISOString() })); }
  }, [lang, login || '']);
  await page.goto(`${BASE}/#${path}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: w < 700 ? 844 : 900 }); await page.waitForTimeout(110); checked++;
    const r = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth, sw = document.documentElement.scrollWidth;
      if (sw <= vw) return null;
      let who = '';
      for (const e of document.querySelectorAll('body *')) {
        const b = e.getBoundingClientRect(); if (!b.width || !b.height) continue;
        if (b.right > vw + 0.5 || b.left < -0.5) {
          if (e.classList.contains('sr-only')) continue;
          let clipped = false; for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { if (/(hidden|clip|auto|scroll)/.test(getComputedStyle(a).overflowX)) { clipped = true; break; } }
          if (!clipped) { who = `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 60)} [${Math.round(b.left)}..${Math.round(b.right)}] "${(e.textContent || '').trim().slice(0, 24)}"`; break; }
        }
      }
      return { vw, sw, who };
    });
    if (r) { bad++; console.log(`OVERFLOW ${g} ${lang} ${path} @${w}: page ${r.sw}px  ${r.who}`); }
  }
  await ctx.close();
}
console.log(bad ? `${bad} overflow(s) in ${checked} layouts` : `ALL CLEAN — ${checked} layouts (${WIDTHS[0]}–${WIDTHS[WIDTHS.length - 1]} px), no horizontal overflow`);
await browser.close();
process.exit(bad ? 1 : 0);
