// Does the app survive when Web Storage is unavailable (embedded / privacy-restricted iframes)?
import { chromium } from 'playwright';
const BASE = process.argv[2] || 'http://localhost:5173';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.addInitScript(() => {
  for (const k of ['localStorage', 'sessionStorage']) Object.defineProperty(window, k, { configurable: true, get() { throw new DOMException('Access is denied for this document.', 'SecurityError'); } });
});
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message.slice(0, 160)));
p.on('console', (m) => { if (m.type() === 'error' && !/WebSocket|vite|ERR_CONNECTION_REFUSED/i.test(m.text())) errs.push('console: ' + m.text().slice(0, 160)); });
const h1 = async () => ((await p.locator('h1').first().textContent({ timeout: 6000 }).catch(() => null)) || 'NO H1').trim().slice(0, 50);
await p.goto(`${BASE}/#/`, { waitUntil: 'networkidle' });
console.log('home      →', await h1());
await p.goto(`${BASE}/#/login/physician`, { waitUntil: 'networkidle' });
console.log('login     →', await h1());
const demo = p.locator('[data-testid="demo-DQ-DR-01"]');
if (await demo.count()) { await demo.click(); await p.click('[data-testid="login-form"] button[type=submit]'); await p.waitForTimeout(1200); console.log('signed in →', p.url().split('#')[1], '|', await h1()); }
const link = p.locator('a[href="#/physician/patients"]').first();
if (await link.count()) { await link.click(); await p.waitForTimeout(800); console.log('patients  →', p.url().split('#')[1], '|', await h1(), '| rows:', await p.locator('[data-testid="patients-table"] tbody tr').count()); }
console.log(errs.length ? [...new Set(errs)].slice(0, 5).join('\n') : 'no errors');
await b.close();
