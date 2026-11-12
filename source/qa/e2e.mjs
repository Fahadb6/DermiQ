// End-to-end flow across the public site, the physician portal and the patient app (two tabs, one browser profile).
// Usage: node e2e.mjs [baseUrl]
import { chromium } from 'playwright';
const BASE = process.argv[2] || 'http://localhost:5173';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
let pass = 0, fail = 0;
const ok = (n, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${n}${extra ? '  — ' + extra : ''}`); };
const errors = [];
const watch = (p, tag) => {
  p.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error' && !/WebSocket|vite|ERR_CONNECTION_REFUSED|Failed to load resource/i.test(m.text())) errors.push(`${tag}: ${m.text().slice(0, 200)}`); });
};
const T = (id) => `[data-testid="${id}"]`;
const go = async (p, path) => { await p.goto(`${BASE}/#${path}`); await p.waitForLoadState('networkidle'); await p.waitForTimeout(250); };
const text = async (p, sel) => ((await p.locator(sel).first().textContent().catch(() => '')) || '').trim();
const appears = async (p, sel, ms = 5000) => p.waitForSelector(sel, { timeout: ms }).then(() => true).catch(() => false);
const login = async (p, role, profileId) => {
  await go(p, `/login/${role}`);
  await p.click(T(`demo-${profileId}`));
  await p.click(`${T('login-form')} button[type=submit]`);
  await p.waitForURL(new RegExp(`#/${role}`), { timeout: 8000 });
  await p.waitForLoadState('networkidle');
};
const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('dermiq.db')).state?.db ?? JSON.parse(localStorage.getItem('dermiq.db')).db ?? JSON.parse(localStorage.getItem('dermiq.db')));
const future = (days) => { const d = new Date(Date.now() + days * 864e5); if (d.getDay() === 5) d.setDate(d.getDate() + 2); if (d.getDay() === 6) d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };

const dr = await ctx.newPage(); watch(dr, 'tab-1');
// 01
await go(dr, '/'); await dr.waitForSelector('h1');
ok('01 Public site opens in Arabic, right-to-left', await dr.evaluate(() => document.documentElement.dir === 'rtl' && document.documentElement.lang === 'ar'));
// 02
await dr.locator(`${T('lang-switch')}:visible`).first().click();
await dr.waitForTimeout(300); await dr.reload(); await dr.waitForSelector('h1');
ok('02 Language switch to English persists after reload', await dr.evaluate(() => document.documentElement.dir === 'ltr' && document.documentElement.lang === 'en'));
// 03
await go(dr, '/guide'); await dr.fill(T('edu-search'), 'cartridge'); await dr.waitForTimeout(400);
const hits = await dr.locator('main a[href*="#/guide/"]').count();
await go(dr, '/guide/reading-your-plan');
const lockedCta = await dr.locator('main a[href="#/login/patient"]').count();
const lockedBody = await dr.locator('main .prose-dq').count();
await go(dr, '/guide/dermiq-at-a-glance');
ok('03 Guide search finds articles; patient-only article is locked for visitors', hits > 0 && lockedCta > 0 && lockedBody === 0 && (await dr.locator('main article').count()) === 1, `${hits} result links`);
// 04
await go(dr, '/physician/patients');
const guarded = dr.url().includes('#/login/physician');
await dr.fill('input[name=email]', 'dr.lina@dermiq.demo'); await dr.fill('input[name=password]', 'wrong-pass'); await dr.click(`${T('login-form')} button[type=submit]`);
const wrongPw = await appears(dr, `${T('login-form')} [role=alert]`, 3000);
await dr.fill('input[name=email]', 'sara@dermiq.demo'); await dr.fill('input[name=password]', 'Demo#2026'); await dr.click(`${T('login-form')} button[type=submit]`);
await dr.waitForTimeout(300);
ok('04 Protected route redirects to sign-in; wrong password and wrong portal are refused', guarded && wrongPw && dr.url().includes('#/login/physician'));
// 05
await login(dr, 'physician', 'DQ-DR-01');
ok('05 Physician signs in and lands back on the requested page or dashboard', /#\/physician/.test(dr.url()) && (await appears(dr, 'h1')));
// 06
await go(dr, '/physician/patients/DQ-P-1003?tab=configuration');
ok('06 Pending plan: nothing is visible to the patient yet', (await dr.getAttribute(T('config-tab'), 'data-status')) === 'pending_approval' && (await dr.locator(T('patient-preview-none')).count()) === 1);
// 07
const pt = await ctx.newPage(); watch(pt, 'tab-2');
await login(pt, 'patient', 'DQ-P-1003');
await dr.reload(); await dr.waitForLoadState('networkidle');
ok('07 Patient (second tab) sees "being prepared" and no dose; both sessions coexist', (await pt.locator(T('plan-pending')).count()) === 1 && (await pt.locator(T('home-dose')).count()) === 0 && /#\/physician/.test(dr.url()));
// 08
await dr.click(T('dose-0.2')); await dr.fill(T('interval'), '21'); await dr.click(T('save-config'));
await dr.waitForTimeout(500);
await dr.click(T('review-changes')); const diff = await appears(dr, T('diff-table'), 3000); await dr.keyboard.press('Escape'); await dr.waitForTimeout(300);
ok('08 Save configuration + review changes; draft stays hidden from the patient', diff && (await dr.getAttribute(T('config-tab'), 'data-status')) === 'pending_approval' && (await pt.locator(T('plan-pending')).count()) === 1);
// 09
await dr.click(T('approve-plan')); await dr.click(T('confirm-ok'));
const approved = await appears(dr, `${T('config-tab')}[data-status="approved"]`);
ok('09 Physician approves the plan', approved && (await text(dr, T('preview-dose'))).includes('0.2'), await text(dr, T('preview-dose')));
// 10
const live = await appears(pt, T('home-dose'), 5000);
if (!live) { await pt.reload(); await pt.waitForLoadState('networkidle'); }
const homeDose = await text(pt, T('home-dose'));
await go(pt, '/patient/plan');
const editable = await pt.locator(`${T('patient-plan')} input, ${T('patient-plan')} select, ${T('patient-plan')} textarea`).count();
ok('10 Patient sees the approved plan (read-only) — live cross-tab update', homeDose.includes('0.2') && (await text(pt, T('plan-dose'))).includes('0.2') && editable === 0, live ? 'updated without reload' : 'needed reload');
// 11
await dr.click(T('lock-plan')); await dr.click(T('confirm-ok'));
const locked = await appears(dr, `${T('config-tab')}[data-status="locked"]`);
ok('11 Digital lock: configuration becomes read-only in the software', locked && (await dr.locator(T('dose-0.5')).isDisabled()) && (await dr.locator(T('save-config')).isDisabled()));
// 12
ok('12 Patient sees the plan as approved and digitally locked', await appears(pt, `${T('plan-state')}[data-status="locked"]`, 5000));
// 13
await dr.click(T('update-plan')); await dr.click(T('confirm-ok'));
await appears(dr, `${T('config-tab')}[data-status="requires_review"]`);
await dr.click(T('dose-0.3')); await dr.click(T('save-config')); await dr.waitForTimeout(500);
const stillOld = (await text(pt, T('plan-dose'))).includes('0.2') && (await appears(pt, `${T('plan-state')}[data-status="requires_review"]`, 5000));
ok('13 Update plan: patient keeps the last approved version while changes await approval', stillOld);
// 14
await dr.click(T('approve-plan')); await dr.click(T('confirm-ok'));
await appears(dr, `${T('config-tab')}[data-status="approved"]`);
await pt.waitForFunction((sel) => document.querySelector(sel)?.textContent?.includes('0.3'), T('plan-dose'), { timeout: 5000 }).catch(() => {});
const d14 = await db(dr);
ok('14 Re-approval publishes revision 2 to the patient', (await text(pt, T('plan-dose'))).includes('0.3') && d14.plans.find((p) => p.patientId === 'DQ-P-1003').approved.revision === 2);
// 15
await go(pt, '/patient/reminders');
const before15 = await pt.locator(`${T('upcoming-appointments')} > li`).count();
await go(dr, '/physician/appointments'); await dr.click(T('new-appt'));
await dr.selectOption(T('appt-patient'), 'DQ-P-1003'); await dr.selectOption(T('appt-type'), 'follow_up'); await dr.fill(T('appt-date'), future(3)); await dr.fill(T('appt-time'), '11:30'); await dr.click(T('appt-submit'));
await dr.waitForTimeout(500);
await pt.waitForFunction(([sel, n]) => document.querySelectorAll(sel).length > n, [`${T('upcoming-appointments')} > li`, before15], { timeout: 5000 }).catch(() => {});
ok('15 Physician schedules an appointment; patient sees it and an in-app notification', (await pt.locator(`${T('upcoming-appointments')} > li`).count()) === before15 + 1 && (await pt.locator(`${T('notification-list')} > li`).count()) > 0);
// 16
await go(pt, '/patient/settings'); await pt.click(T('signout')); await pt.waitForURL(/#\/login\/patient/);
await login(pt, 'patient', 'DQ-P-1001');
const s0 = JSON.stringify((await db(pt)).sessions);
await pt.click(T('start-session')); await appears(pt, T('walkthrough'));
for (let i = 0; i < 6; i++) { await pt.click(T('walk-next')); await pt.waitForTimeout(120); }
const endScreen = await appears(pt, T('walk-to-sessions'), 3000);
const s1 = JSON.stringify((await db(pt)).sessions);
await pt.click(T('walk-to-sessions')); await pt.waitForURL(/#\/patient\/sessions/);
ok('16 "Start Session" walkthrough is educational — it records nothing', endScreen && s0 === s1);
// 17
const awaiting = pt.locator('[data-view="awaiting_documentation"]').first();
const sid = (await awaiting.getAttribute('data-testid')).replace('session-', '');
await awaiting.locator(T('report-btn')).click();
await pt.click(T('report-submit')); await pt.waitForTimeout(200);
const needsConfirm = (await text(pt, '#confirm-err')).length > 0;
await pt.check(T('report-confirm')); await pt.fill(T('report-note'), 'E2E: session took place.'); await pt.click(T('report-submit'));
const reported = await appears(pt, `${T('session-' + sid)}[data-view="pending_review"]`);
ok('17 Patient reports a session manually (confirmation required) → pending physician review', needsConfirm && reported, sid);
// 18
await go(dr, '/physician/sessions?patient=DQ-P-1001');
const row = dr.locator(T('ph-session-' + sid));
const inQueue = (await row.count()) === 1;
await row.locator(T('review-session')).click(); await dr.fill(T('review-session-note'), 'E2E: reviewed.'); await dr.click(T('review-session-submit'));
const reviewed = await appears(pt, `${T('session-' + sid)}[data-view="reviewed"]`, 5000);
ok('18 Physician reviews the patient-reported session; patient sees the note', inQueue && reviewed && (await text(pt, T('session-' + sid))).includes('E2E: reviewed.'));
// 19
await go(pt, '/patient/progress');
const p0 = await pt.locator(`${T('photo-grid')} > li`).count();
await pt.click(T('add-photo')); await pt.click(T('use-sample')); await pt.fill(T('photo-note'), 'E2E photo'); await pt.click(T('save-photo'));
await pt.waitForFunction(([sel, n]) => document.querySelectorAll(sel).length > n, [`${T('photo-grid')} > li`, p0], { timeout: 5000 }).catch(() => {});
const p1 = await pt.locator(`${T('photo-grid')} > li`).count();
const newPhoto = (await db(pt)).photos.find((x) => x.patientId === 'DQ-P-1001' && x.origin === 'upload');
await go(dr, '/physician/progress?patient=DQ-P-1001');
await dr.click(T('ph-photo-' + newPhoto.id)); await dr.fill(T('review-photo-note'), 'E2E: photo noted.'); await dr.click(T('review-photo-submit'));
await dr.waitForTimeout(500);
const photoReviewed = (await db(pt)).photos.find((x) => x.id === newPhoto.id).review === 'reviewed';
await pt.locator('[role="tablist"] [role="tab"]').nth(1).click();
const compare = await appears(pt, T('photo-compare'), 3000);
ok('19 Progress photo: upload → physician review → side-by-side comparison (no analysis)', p1 === p0 + 1 && photoReviewed && compare && (await pt.locator(`${T('photo-compare')} img`).count()) === 2);
// 20
await go(pt, '/patient/education/appointment-types');
const hiddenBefore = (await pt.locator('main .prose-dq').count()) === 0;
await go(dr, '/physician/content');
await dr.locator(T('article-appointment-types')).locator(T('open-article')).click();
await dr.fill(T('article-note'), 'E2E: medically reviewed.'); await dr.click(T('to-approved')); await dr.waitForTimeout(300);
await dr.fill(T('article-note'), 'E2E: publish.'); await dr.click(T('to-published')); await dr.waitForTimeout(400);
await pt.reload(); await pt.waitForLoadState('networkidle');
const visibleAfter = (await pt.locator('main .prose-dq').count()) === 1;
await dr.fill(T('article-note'), 'E2E: archive.'); await dr.click(T('to-archived')); await dr.waitForTimeout(400);
await pt.reload(); await pt.waitForLoadState('networkidle');
const hiddenAgain = (await pt.locator('main .prose-dq').count()) === 0;
const hist = await dr.locator(`${T('article-history')} > li`).count();
await dr.keyboard.press('Escape');
await go(pt, '/physician');
const crossRole = pt.url().includes('#/login/physician');
await go(pt, '/patient/settings'); await pt.click(T('signout')); await pt.waitForURL(/#\/login\/patient/);
await go(pt, '/patient/plan');
ok('20 Content governance (review → publish → archive) controls visibility; role guards and sign-out hold', hiddenBefore && visibleAfter && hiddenAgain && hist >= 3 && crossRole && pt.url().includes('#/login/patient'), `history entries: ${hist}`);

console.log(`\n${pass} passed, ${fail} failed` + (errors.length ? `\nConsole/page errors:\n  ${[...new Set(errors)].slice(0, 8).join('\n  ')}` : '\nNo console or page errors.'));
await browser.close();
process.exit(fail ? 1 : 0);
