// Verifies release/DermiQ-standalone.html: (1) sandboxed srcdoc frame, offline  (2) sandboxed blob frame, offline  (3) file://
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const FILE = resolve(process.argv[2] || 'release/DermiQ-standalone.html');
const html = readFileSync(FILE, 'utf8');
const T = (id) => `[data-testid="${id}"]`;
const browser = await chromium.launch();
let failed = 0;
const say = (name, ok, extra = '') => { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`); };
const vis = (f, sel) => f.locator(`${sel}:visible`).first();
const txt = async (f, sel) => ((await f.locator(sel).first().textContent({ timeout: 6000 }).catch(() => '')) || '').trim();
const has = (f, sel, ms = 6000) => f.waitForSelector(sel, { timeout: ms, state: 'visible' }).then(() => true).catch(() => false);

async function flow(f, label, full) {
  say(`${label}: renders`, await has(f, 'h1', 15000), (await txt(f, 'h1')).slice(0, 40));
  await vis(f, 'a[href$="/login/physician"]').click();
  say(`${label}: navigation to sign-in`, await has(f, T('login-form')));
  await f.click(T('demo-DQ-DR-01')); await f.click(`${T('login-form')} button[type=submit]`);
  say(`${label}: sign-in form submits`, await has(f, T('kpis')), (await txt(f, 'h1')).slice(0, 40));
  if (!full) return;
  await vis(f, 'a[href$="/physician/patients"]').click();
  say(`${label}: patients table`, await has(f, T('patients-table')), `${await f.locator(`${T('patients-table')} tbody tr`).count()} rows`);
  await f.fill(T('patient-search'), 'DQ-P-1003'); await has(f, T('row-DQ-P-1003'));
  await f.locator(`${T('row-DQ-P-1003')} a`).first().click(); await has(f, T('open-config')); await f.locator('[role="tablist"] [role="tab"]').nth(1).click();
  await has(f, T('config-tab'));
  const before = await f.getAttribute(T('config-tab'), 'data-status');
  await f.click(T('approve-plan')); await f.click(T('confirm-ok'));
  say(`${label}: approve plan`, await has(f, `${T('config-tab')}[data-status="approved"]`), `${before} → approved`);
  await f.locator('[role="tablist"] [role="tab"]').nth(5).click(); await has(f, T('note-text'));
  const n0 = await f.locator(`${T('notes-list')} > li`).count();
  await f.fill(T('note-text'), 'Standalone check'); await f.click(T('note-save')); await f.waitForTimeout(500);
  const n1 = await f.locator(`${T('notes-list')} > li`).count();
  say(`${label}: note form submits exactly once`, n1 === n0 + 1, `${n0} → ${n1}`);
  await vis(f, `${T('signout')}, ${T('signout-rail')}`).click(); await f.waitForTimeout(500);
  if (!(await f.locator('a[href$="/login/patient"]:visible').count())) await vis(f, 'a[href="/"], a[href="#/"]').click();
  await vis(f, 'a[href$="/login/patient"]').click(); await has(f, T('demo-DQ-P-1003'));
  await f.click(T('demo-DQ-P-1003')); await f.click(`${T('login-form')} button[type=submit]`);
  say(`${label}: patient sees the plan approved a moment ago`, await has(f, T('home-dose')), await txt(f, T('home-dose')));
  await vis(f, 'a[href$="/patient/progress"]').click(); await has(f, T('photo-grid'));
  await f.waitForTimeout(600);
  const imgs = await f.evaluate(() => [...document.querySelectorAll('[data-testid="photo-grid"] img')].map((i) => i.complete && i.naturalWidth > 0));
  say(`${label}: inlined demo photos load`, imgs.length > 0 && imgs.every(Boolean), `${imgs.filter(Boolean).length}/${imgs.length}`);
  await f.click(T('add-photo')); await f.click(T('use-sample')); await f.click(T('save-photo')); await f.waitForTimeout(700);
  const after = await f.evaluate(() => [...document.querySelectorAll('[data-testid="photo-grid"] img')].map((i) => i.complete && i.naturalWidth > 0));
  say(`${label}: add sample photo`, after.length === imgs.length + 1 && after.every(Boolean), `${imgs.length} → ${after.length}`);
  const d0 = await f.evaluate(() => document.documentElement.dir);
  await vis(f, T('lang-switch')).click(); await f.waitForTimeout(400);
  const d1 = await f.evaluate(() => document.documentElement.dir);
  say(`${label}: language switch`, d0 !== d1, `${d0} → ${d1}`);
}

for (const mode of ['srcdoc', 'blob']) {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 950 } });
  const page = await ctx.newPage(); page.setDefaultTimeout(8000); const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message.slice(0, 140)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Blocked form submission/.test(m.text())) errs.push(m.text().slice(0, 140)); });
  await page.setContent('<body style="margin:0"><iframe id="f" sandbox="allow-scripts" style="width:1340px;height:900px;border:0"></iframe></body>');
  await ctx.setOffline(true);
  await page.evaluate(([h, mode]) => { const f = document.getElementById('f'); if (mode === 'srcdoc') f.srcdoc = h; else f.src = URL.createObjectURL(new Blob([h], { type: 'text/html' })); }, [html, mode]);
  await page.waitForTimeout(1500);
  const frame = page.frames().find((x) => x !== page.mainFrame());
  try { await flow(frame, `sandbox/${mode}`, mode === 'srcdoc'); } catch (e) { say(`sandbox/${mode}: flow completed`, false, e.message.split('\n')[0].slice(0, 150)); }
  say(`sandbox/${mode}: no script errors`, errs.length === 0, [...new Set(errs)].slice(0, 3).join(' | '));
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1340, height: 900 } });
  const page = await ctx.newPage(); page.setDefaultTimeout(8000); const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message.slice(0, 140)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
  await ctx.setOffline(true);
  await page.goto('file://' + FILE);
  try {
    await flow(page, 'file://', true);
    say('file://: hash routing', /#\/patient\/progress/.test(page.url()), page.url().split('#')[1]);
    await page.reload(); await page.waitForTimeout(800);
    say('file://: session and data survive a reload', (await has(page, T('photo-grid'))) && (await page.evaluate(() => !!localStorage.getItem('dermiq.db'))));
  } catch (e) { say('file://: flow completed', false, e.message.split('\n')[0].slice(0, 150)); }
  say('file://: no script errors', errs.length === 0, [...new Set(errs)].slice(0, 3).join(' | '));
  await ctx.close();
}
await browser.close();
console.log(failed ? `\n${failed} FAILED` : '\nALL PASS');
