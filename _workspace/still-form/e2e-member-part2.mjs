import { chromium } from 'playwright-core';
const BASE = 'http://127.0.0.1:8000';
const OUT = '/home/bahamut/20feet/_workspace/still-form/visual-qa/member';
const MEMBER = { name: 'QA멤버', email: 'qa-member@stillform.test', password: '<redacted-pw>member' };

const results = [];
const log = (k, v) => { results.push({ k, v }); console.log(`[RESULT] ${k} :: ${v}`); };
const shot = (page, name) => page.screenshot({ path: `${OUT}/${name}.png` }).then(() => console.log(`[CAPTURE] ${name}`));

async function login(page) {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('#auth_login_email', MEMBER.email);
    await page.fill('#auth_login_password', MEMBER.password);
    await page.click('#auth_login_submit');
    await page.waitForSelector('[data-testid="nav-user-name"]', { timeout: 15000 });
}

async function main() {
    const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });

    // --- logout sequence (E.1): login → click logout → token cleared + redirect home
    const ctx1 = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ko-KR' });
    const p1 = await ctx1.newPage();
    await login(p1);
    await shot(p1, 'desktop-1440-header-logged-in');
    const tokenBefore = await p1.evaluate(() => {
        const k = Object.keys(localStorage).find((x) => x.includes('token'));
        return k ? `${k}=${String(localStorage.getItem(k)).slice(0, 8)}...` : 'none-found';
    });
    await p1.click('[data-testid="nav-logout"]');
    await p1.waitForTimeout(2500);
    const tokenAfter = await p1.evaluate(() => {
        const keys = Object.keys(localStorage).filter((x) => x.toLowerCase().includes('token'));
        return keys.length ? keys.map((k) => `${k}=${String(localStorage.getItem(k)).slice(0, 8)}`).join(',') : 'cleared';
    });
    log('logout-token-before', tokenBefore);
    log('logout-token-after', tokenAfter);
    log('logout-url-after', p1.url());
    const loginVisible = await p1.isVisible('[data-testid="nav-login"]').catch(() => false);
    const userNameGone = (await p1.$('[data-testid="nav-user-name"]').catch(() => null)) === null;
    log('logout-header-state', JSON.stringify({ loginVisible, userNameGone }));
    await shot(p1, 'desktop-1440-header-logged-out');
    // mypage route after logout → login guard redirect
    await p1.goto(`${BASE}/mypage/orders`, { waitUntil: 'networkidle' });
    await p1.waitForTimeout(1500);
    log('post-logout-mypage-guard', p1.url());

    // --- mypage addresses capture (daum postcode UI present)
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ko-KR' });
    const p2 = await ctx2.newPage();
    await login(p2);
    await p2.goto(`${BASE}/mypage/addresses`, { waitUntil: 'networkidle' });
    await p2.waitForTimeout(2000);
    let addrBtn = await p2.$('.scm-address-search-button');
    let openedNote = 'visible-without-modal';
    if (!addrBtn) {
        // daum extension lives inside the add/edit modal — open it first
        const openBtn = await p2.$('[data-testid="address-add"]')
            ?? await p2.$('button[class*="scm-primary"]')
            ?? (await p2.$$('button')).find(async (b) => (await b.textContent())?.includes('배송지'));
        if (openBtn) {
            await openBtn.click();
            await p2.waitForTimeout(1200);
            addrBtn = await p2.$('.scm-address-search-button');
            openedNote = 'after-modal-open';
        }
    }
    log('addresses-daum-button', addrBtn ? `yes (${openedNote})` : 'NO');
    log('addresses-daum-note', 'real daum postcode layer requires interaction + manual QA (headless cannot drive the popup)');
    await shot(p2, 'desktop-1440-mypage-addresses');

    // --- regression sweep (D.7): 200 + no console errors + header/footer spot text
    const sweep = ['/', '/shop', '/shop/product/STLMUG0001AB12CD', '/cart', '/shop/notice'];
    for (const path of sweep) {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ko-KR' });
        const page = await ctx.newPage();
        const errors = [];
        page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
        page.on('pageerror', (e) => errors.push(`pageerror: ${String(e).slice(0, 120)}`));
        const resp = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);
        const headerOk = !!(await page.$('[data-testid="store-header"]'));
        const brandOk = (await page.textContent('[data-testid="store-header"]').catch(() => '')).includes('Still Form');
        log(`regress ${path}`, JSON.stringify({ status: resp.status(), header: headerOk, brand: brandOk, consoleErrors: errors.length, first: errors[0] ?? null }));
        await page.close(); await ctx.close();
    }

    // --- mobile captures
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR' });
    const mp = await mctx.newPage();
    await mp.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await shot(mp, 'mobile-390-login');
    await login(mp);
    await mp.goto(`${BASE}/mypage/orders`, { waitUntil: 'networkidle' });
    await mp.waitForTimeout(2000);
    await shot(mp, 'mobile-390-mypage-orders');

    await ctx1.close(); await ctx2.close(); await mctx.close();
    await browser.close();
    console.log('\n=== SUMMARY ===');
    for (const r of results) console.log(`${r.k}: ${r.v}`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });