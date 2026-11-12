// Usage: node crawl.mjs <group> [langs=ar,en] [sizes=d,m]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
mkdirSync('qa/shots', { recursive: true });
const [group = 'public', langs = 'ar,en', sizes = 'd,m'] = process.argv.slice(2);
const SARA = 'patient|DQ-P-1001|sara@dermiq.demo', KHALID = 'patient|DQ-P-1004|khalid@dermiq.demo', REEM = 'patient|DQ-P-1005|reem@dermiq.demo', DR = 'physician|DQ-DR-01|dr.lina@dermiq.demo';
const ROUTES = {
  public: [['home', '/'], ['about', '/about'], ['product', '/product'], ['philosophy', '/philosophy'], ['how', '/how-it-works'], ['guide', '/guide'], ['article', '/guide/dermiq-at-a-glance'],
    ['locked', '/guide/reading-your-plan'], ['faq', '/faq'], ['contact', '/contact'], ['privacy', '/privacy'], ['404', '/nope'], ['login-pt', '/login/patient'], ['login-ph', '/login/physician']],
  patient: [['home', '/patient', SARA], ['plan', '/patient/plan', SARA], ['walk', '/patient/walkthrough', SARA], ['sessions', '/patient/sessions', SARA], ['reminders', '/patient/reminders', SARA],
    ['progress', '/patient/progress', SARA], ['edu', '/patient/education', SARA], ['edu-article', '/patient/education/reading-your-plan', SARA], ['settings', '/patient/settings', SARA],
    ['home-draft', '/patient', KHALID], ['plan-draft', '/patient/plan', KHALID], ['home-review', '/patient', REEM], ['plan-review', '/patient/plan', REEM]],
  physician: [['dash', '/physician', DR], ['patients', '/physician/patients', DR], ['config-pending', '/physician/patients/DQ-P-1003?tab=configuration', DR], ['config-locked', '/physician/patients/DQ-P-1001?tab=configuration', DR],
    ['overview', '/physician/patients/DQ-P-1001', DR], ['p-sessions', '/physician/patients/DQ-P-1001?tab=sessions', DR], ['p-progress', '/physician/patients/DQ-P-1001?tab=progress', DR],
    ['p-appts', '/physician/patients/DQ-P-1001?tab=appointments', DR], ['p-notes', '/physician/patients/DQ-P-1001?tab=notes', DR], ['sessions', '/physician/sessions', DR], ['progress', '/physician/progress', DR],
    ['appts', '/physician/appointments', DR], ['notifs', '/physician/notifications', DR], ['content', '/physician/content', DR], ['settings', '/physician/settings', DR]],
};
const SIZE = { d: [1440, 900], m: [390, 844] };
const browser = await chromium.launch();
let bad = 0;
for (const lang of langs.split(',')) for (const size of sizes.split(',')) {
  const [w, h] = SIZE[size];
  let i = 0;
  for (const [name, path, login = ''] of ROUTES[group]) {
    i++;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/WebSocket|ws:\/\/|wss:\/\/|\[vite\]|ERR_CONNECTION_REFUSED|React Router Future|DevTools/i.test(m.text())) errors.push(m.type() + ': ' + m.text().slice(0, 300)); });
    page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 300)));
    await page.addInitScript(([l, login]) => {
      localStorage.setItem('dermiq.lang', l);
      if (login && !sessionStorage.getItem('dermiq.session')) {
        const [role, profileId, email] = login.split('|');
        const now = Date.now();
        sessionStorage.setItem('dermiq.session', JSON.stringify({ userId: 'U', role, profileId, email, startedAt: new Date(now).toISOString(), expiresAt: new Date(now + 8 * 3600e3).toISOString() }));
      }
    }, [lang, login]);
    await page.goto(`${process.env.BASE || 'http://localhost:5173'}/#${path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(350);
    if (group === 'public') {
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < total; y += h * 0.8) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(70); }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(700);
    }
    const info = await page.evaluate(() => {
      const de = document.documentElement;
      const text = document.body.innerText;
      const flags = ['undefined', '[object Object]', 'NaN', 'Invalid Date'].filter((k) => text.includes(k));
      // elements poking out of the viewport horizontally
      const out = [];
      if (de.scrollWidth > de.clientWidth) {
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && (r.right > de.clientWidth + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed') { out.push(el.tagName + '.' + String(el.className).slice(0, 60)); if (out.length > 3) break; }
        }
      }
      return { sw: de.scrollWidth, cw: de.clientWidth, sh: de.scrollHeight, hash: location.hash, flags, out, h1: document.querySelectorAll('h1').length, title: document.title, dir: de.dir, lang: de.lang };
    });
    await page.screenshot({ path: `qa/shots/${group}-${lang}-${size}-${String(i).padStart(2, '0')}-${name}.jpg`, fullPage: true, type: 'jpeg', quality: 70 });
    const problems = [];
    if (info.sw > info.cw) problems.push(`OVERFLOW ${info.sw}>${info.cw} ${info.out.join(' ; ')}`);
    if (info.flags.length) problems.push('TEXT ' + info.flags.join(','));
    if (info.h1 !== 1) problems.push('H1=' + info.h1);
    if (!info.hash.startsWith('#' + path.split('?')[0])) problems.push('REDIRECT ' + info.hash);
    if (info.dir !== (lang === 'ar' ? 'rtl' : 'ltr') || info.lang !== lang) problems.push(`DIR ${info.dir}/${info.lang}`);
    if (errors.length) problems.push(...errors.slice(0, 3));
    if (problems.length) { bad++; console.log(`✗ ${lang}-${size} ${name} [${info.title}] sh=${info.sh}\n    ` + problems.join('\n    ')); }
    await ctx.close();
  }
}
console.log(bad ? `${bad} page(s) with findings` : 'ALL CLEAN');
await browser.close();
