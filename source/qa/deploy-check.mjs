#!/usr/bin/env node
// "Will this folder work if I upload it?" — checks a folder (or a .zip) exactly as a static host would see it.
// usage: node qa/deploy-check.mjs <folder | file.zip> [--no-browser]
//   1. the home page: index.html must be at the top level (otherwise the host answers "Page not found");
//   2. every file index.html asks for must be there;
//   3. served through qa/netlify-sim.mjs: "/" opens, wrong addresses lead home, package-only files stay private;
//   4. in a real browser: the home page renders, a sign-in page opens, the product images load.
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { startSim } from './netlify-sim.mjs';

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('--'));
const withBrowser = !args.includes('--no-browser');
if (!target) { console.error('usage: node qa/deploy-check.mjs <folder | file.zip> [--no-browser]'); process.exit(2); }

let folder = resolve(target), temp = null;
if (statSync(folder).isFile()) {                       // a zip: unpack it the way the upload would
  temp = mkdtempSync(join(tmpdir(), 'dq-deploy-'));
  execFileSync('unzip', ['-q', folder, '-d', temp]);
  folder = temp;
}
let failed = 0;
const check = (ok, what, detail = '') => { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}${detail ? '  — ' + detail : ''}`); return ok; };

const top = readdirSync(folder).sort();
const hasIndex = check(existsSync(join(folder, 'index.html')), 'index.html is at the top level of the uploaded folder', `top level: ${top.join(', ')}`);
if (!hasIndex) {
  const nested = top.filter((d) => existsSync(join(folder, d, 'index.html')));
  if (nested.length) console.log(`      the website is inside “${nested[0]}/” — the host would answer “Page not found” at “/” and show the site only at “/${nested[0]}/”`);
}
const html = hasIndex ? readFileSync(join(folder, 'index.html'), 'utf8') : '';
const refs = [...new Set([...html.matchAll(/(?:src|href)="\.\/([^"#?]+)"/g)].map((m) => m[1]))];
if (hasIndex) check(refs.length > 0 && refs.every((r) => existsSync(join(folder, r))), 'every file index.html asks for is present', `${refs.length} files`);

const sim = await startSim(folder, 0);
const base = `http://localhost:${sim.port}`;
const get = async (path) => { const r = await fetch(base + path, { redirect: 'manual' }); return { status: r.status, to: r.headers.get('location'), type: r.headers.get('content-type') || '', body: r.status === 200 ? await r.text() : '' }; };

const home = await get('/');
check(home.status === 200 && home.body.includes('id="root"'), 'the address “/” opens the website', `HTTP ${home.status}`);
if (hasIndex) {
  for (const r of refs) { const a = await get('/' + r); if (a.status !== 200) check(false, `asset /${r}`, `HTTP ${a.status}`); }
  const wrong = await get('/no-such-page'); check([301, 302].includes(wrong.status) && wrong.to === '/', 'a wrong address leads back to the home page', `HTTP ${wrong.status} → ${wrong.to}`);
  const old = await get('/site/'); check([301, 302].includes(old.status) && old.to === '/', 'the old address “/site/” leads back to the home page', `HTTP ${old.status} → ${old.to}`);
  for (const priv of ['source/package.json', 'docs/QA_REPORT.md', 'README.txt', 'serve.mjs']) {
    if (!existsSync(join(folder, priv))) continue;
    const p = await get('/' + priv); check([301, 302].includes(p.status), `package-only file /${priv} is not shown to visitors`, `HTTP ${p.status}`);
  }
}

if (withBrowser && hasIndex) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  const h1 = await page.locator('h1').first().textContent().catch(() => '');
  check(!!h1 && h1.trim().length > 5, 'browser: the home page renders', (h1 || '').trim().slice(0, 60));
  await page.locator('button[aria-controls="site-menu"]').click(); await page.waitForTimeout(400);
  const links = await page.locator('#site-menu a:visible').count();
  check(links >= 8, 'browser: the phone menu opens and lists the pages', `${links} links`);
  await page.goto(base + '/#/login/patient', { waitUntil: 'networkidle' });
  check(await page.locator('[data-testid="login-form"]').count() === 1, 'browser: the patient sign-in page opens');
  await page.goto(base + '/#/product', { waitUntil: 'networkidle' });
  for (let y = 0; y < 9000; y += 700) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(60); }
  const imgs = await page.evaluate(() => { const all = [...document.images]; return { total: all.length, broken: all.filter((i) => i.complete && i.naturalWidth === 0).length }; });
  check(imgs.total > 8 && imgs.broken === 0, 'browser: product images load', `${imgs.total} images, ${imgs.broken} broken`);
  await page.goto(base + '/no-such-page', { waitUntil: 'networkidle' });
  check(new URL(page.url()).pathname === '/' && await page.locator('h1').count() > 0, 'browser: a wrong address ends on the home page', page.url().replace(base, ''));
  check(errors.length === 0, 'browser: no script errors', errors.slice(0, 2).join(' | '));
  await browser.close();
}
sim.server.close();
if (temp) rmSync(temp, { recursive: true, force: true });
console.log(failed ? `\n${failed} check(s) FAILED — do not upload this folder as it is` : '\nALL PASS — this folder can be uploaded as it is');
process.exit(failed ? 1 : 0);
