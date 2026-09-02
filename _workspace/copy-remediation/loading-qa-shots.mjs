import { chromium } from 'playwright-core';
const BASE = 'http://127.0.0.1:8000';
const OUT = '/home/bahamut/20feet/_workspace/copy-remediation/screenshots/loading';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });

const PAGES = [
    ['home', '/', []],
    ['shop', '/shop', []],
    ['product', '/shop/products/STLMUG0001AB12CD', []],
    ['notice', '/shop/notices', []],
    ['cart', '/cart', []],
    ['guest-order', '/shop/guest/orders', []],
    ['login', '/login', []],
    ['terms', '/shop/terms', []],
];

const results = [];
for (const [name, path, _x] of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ko-KR' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
    // capture early frames
    await page.goto(`${BASE}${path}`, { waitUntil: 'commit', timeout: 30000 });
    for (const t of [250, 700]) {
        await page.waitForTimeout(t === 250 ? 250 : 450);
        try { await page.screenshot({ path: `${OUT}/load-${name}-early${t}.png` }); } catch {}
        const loading = await page.evaluate(() => ({
            spinner: !!document.querySelector('[data-testid="page-loading"], #g7-skeleton-overlay'),
            emptyFlash: [...document.querySelectorAll('[data-testid="empty-state"]')].map(e => e.textContent.slice(0, 30)),
        })).catch(() => null);
        if (loading) console.log(`${name} +${t}ms spinner=${loading.spinner} emptyStates=${JSON.stringify(loading.emptyFlash)}`);
    }
    await page.waitForTimeout(2500);
    const final = await page.evaluate(() => ({
        empty: [...document.querySelectorAll('[data-testid="empty-state"]')].length,
        hasContent: document.body.innerText.length,
    }));
    await page.screenshot({ path: `${OUT}/load-${name}-final.png`, fullPage: false });
    console.log(`${name} FINAL empty=${final.empty} textLen=${final.hasContent} errors=${errors.length ? errors[0] : 0}`);
    await ctx.close();
}

// mypage with login
{
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ko-KR' });
    const page = await ctx.newPage();
    
    const email = process.env.QA_EMAIL;
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.fill('#auth_login_email', email);
    await page.fill('#auth_login_password', 'CopyQa1234!');
    await page.click('#auth_login_submit');
    await page.waitForTimeout(2000);
    for (const path of ['/mypage/orders', '/mypage/addresses', '/mypage/mileage']) {
        await page.goto(`${BASE}${path}`, { waitUntil: 'commit' });
        await page.waitForTimeout(500);
        const loading = await page.evaluate(() => ({
            spinner: !!document.querySelector('[data-testid="page-loading"], #g7-skeleton-overlay'),
            empty: [...document.querySelectorAll('[data-testid="empty-state"]')].length,
        })).catch(() => null);
        console.log(`mypage ${path} +700ms spinner=${loading?.spinner} empty=${loading?.empty}`);
        await page.waitForTimeout(2500);
        const fin = await page.evaluate(() => [...document.querySelectorAll('[data-testid="empty-state"]')].length);
        console.log(`mypage ${path} FINAL empty=${fin}`);
    }
    await ctx.close();
}
await browser.close();