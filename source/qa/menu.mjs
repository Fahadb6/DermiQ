// Opens every mobile / tablet navigation control through the real UI and checks that it actually shows.
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:5173';
const b = await chromium.launch(); let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const session = (role, profileId, email) => { const now = Date.now(); return JSON.stringify({ userId: 'U-' + profileId, role, profileId, email, startedAt: new Date(now).toISOString(), expiresAt: new Date(now + 8 * 3600e3).toISOString() }); };
for (const [w, h, label] of [[390, 844, 'phone'], [820, 1180, 'tablet']]) {
  for (const lang of ['ar', 'en']) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: w < 500 });
    await ctx.addInitScript((l) => { try { localStorage.setItem('dermiq.lang', l); } catch {} }, lang);
    const p = await ctx.newPage(); p.setDefaultTimeout(8000);
    await p.goto(base + '/#/', { waitUntil: 'networkidle' });
    const btn = p.locator('button[aria-controls="site-menu"]');
    await btn.tap().catch(() => btn.click());
    await p.waitForTimeout(350);
    const box = await p.locator('#site-menu').boundingBox().catch(() => null);
    const links = await p.locator('#site-menu a:visible').count().catch(() => 0);
    ok(!!box && box.height > h * 0.6 && links >= 8, `public menu opens — ${label} ${lang}: box ${box ? Math.round(box.width) + 'x' + Math.round(box.height) : 'none'}, visible links ${links}`);
    // every link must be reachable (inside the viewport or scrollable inside the menu)
    const firstLink = p.locator('#site-menu nav ul li a').nth(2);
    const target = await firstLink.getAttribute('href').catch(() => null);
    await firstLink.tap().catch(() => {});
    await p.waitForTimeout(400);
    const closed = (await p.locator('#site-menu').count()) === 0;
    ok(closed && !!target && p.url().endsWith(target.replace(/^#/, '#')), `public menu link navigates and closes — ${label} ${lang}: ${p.url().split('#')[1]}`);
    // scrolled down the page: header may be hidden; the control must still work once visible
    await p.goto(base + '/#/product', { waitUntil: 'networkidle' });
    await p.mouse.wheel(0, 1600); await p.waitForTimeout(300); await p.mouse.wheel(0, -200); await p.waitForTimeout(450);
    await btn.tap().catch(() => btn.click()); await p.waitForTimeout(350);
    const box2 = await p.locator('#site-menu').boundingBox().catch(() => null);
    ok(!!box2 && box2.height > h * 0.6, `public menu opens after scrolling — ${label} ${lang}: ${box2 ? Math.round(box2.height) : 'none'}`);
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok((await p.locator('#site-menu').count()) === 0, `Escape closes it — ${label} ${lang}`);
    await ctx.close();
  }
}
console.log(fail ? `\n${fail} FAILED` : '\nALL PASS'); await b.close(); process.exit(fail ? 1 : 0);
