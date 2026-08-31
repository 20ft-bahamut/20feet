import { chromium } from 'playwright-core';
const BASE = 'http://127.0.0.1:8000';
const OUT = '/home/bahamut/20feet/_workspace/still-form/visual-qa/checkout-redesign/parity-guest-after-strip';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });

async function capture(vw, vh, name, mode) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, locale: 'ko-KR' });
    const page = await ctx.newPage();
    // Build a guest cart with 2 lines
    await page.goto(`${BASE}/shop/product/STLBOOK000008XY`, { waitUntil: 'networkidle' });
    await page.click('[data-testid="add-to-cart"]');
    await page.waitForTimeout(1200);
    await page.goto(`${BASE}/shop/product/STLCUSH000005AB`, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(2000);
    const add = await page.$('[data-testid="add-to-cart"]');
    if (add) { await page.click('[data-testid="add-to-cart"]').catch(() => {}); await page.waitForTimeout(1200); }
    await page.goto(`${BASE}/shop/checkout`, { waitUntil: 'networkidle' });
    try {
        await page.waitForSelector('[data-testid="checkout-form"]', { timeout: 25000 });
    } catch (e2) {
        console.log('GUEST-FAIL-BODY:', (await page.locator('body').textContent()).replace(/\s+/g, ' ').slice(0, 500));
        await page.screenshot({ path: '/tmp/guest-fail.png', fullPage: true });
        throw e2;
    }
    await page.waitForTimeout(2500);
    if (mode === 'full') {
        await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${OUT}/${name}-top.png`, fullPage: false });
    } else {
        await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    }
    // diagnostics
    const diag = await page.evaluate(() => ({
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        addressSearchInShipping: !!document.querySelector('[data-testid="checkout-section-shipping"] [data-testid="checkout-address-search-slot"] button, [data-testid="checkout-section-shipping"] .scm-address-search'),
        headings: [...document.querySelectorAll('h1,h2,h3')].map(h => (h.textContent || '').trim()).filter(Boolean),
        items: [...document.querySelectorAll('[data-testid="checkout-item-row"]')].map(r => ({
            text: (r.textContent || '').trim().slice(0, 70),
            img: r.querySelector('img')?.getAttribute('src') ?? null,
            imgW: (() => { const i = r.querySelector('img'); return i ? getComputedStyle(i).width : null; })(),
        })),
        cta: document.querySelector('[data-testid="checkout-pay-button"]')?.textContent?.trim() ?? null,
        summaryFinal: document.querySelector('[data-testid="checkout-summary-final"]')?.textContent ?? null,
        dbankDetail: !!document.querySelector('[data-testid="checkout-dbank-detail"]'),
        progressCurrent: document.querySelector('[data-testid="checkout-progress-checkout"]')?.textContent ?? null,
        stickyAside: (() => { const el = document.querySelector('.scm-checkout-aside'); return el ? getComputedStyle(el).position : null; })(),
    }));
    console.log(`[${name}]`, JSON.stringify(diag));
    await ctx.close();
}

await capture(1440, 900, 'desktop-1440', 'full');
await capture(1280, 900, 'desktop-1280', 'viewport-full');
await capture(768, 1024, 'tablet-768', 'viewport-full');
await capture(430, 932, 'mobile-430', 'viewport-full');
await capture(390, 844, 'mobile-390', 'viewport-full');
await browser.close();
