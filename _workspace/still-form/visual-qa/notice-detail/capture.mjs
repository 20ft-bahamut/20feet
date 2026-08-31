import { chromium } from 'playwright-core';

const BASE_URL = 'http://127.0.0.1:8000';
const OUT_DIR = '/home/bahamut/20feet/_workspace/still-form/visual-qa/notice-detail';
const CHROME = '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';

const VIEWPORTS = {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 },
};

async function shot(page, name) {
    const file = `${OUT_DIR}/${name}.png`;
    await page.screenshot({ path: file, fullPage: name.startsWith('mobile') ? true : false });
    console.log(`[shot] saved ${file}`);
}

async function main() {
    const browser = await chromium.launch({ executablePath: CHROME });

    // ---------- Desktop 1440: list p1 -> page 2 -> detail ----------
    {
        const ctx = await browser.newContext({ viewport: VIEWPORTS.desktop });
        await ctx.addInitScript(() => {
            try { localStorage.setItem('g7_locale', 'ko'); } catch (e) {}
        });
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
        page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

        // 1. list page 1
        await page.goto(`${BASE_URL}/shop/notice`, { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForSelector('[data-testid="notice-row"]', { timeout: 20000 });
        await page.waitForTimeout(1200);
        let rows = await page.locator('[data-testid="notice-row"]').count();
        const pagerVisible = await page.locator('[data-testid="pagination"]').count();
        console.log(`[list p1] rows=${rows} pagination=${pagerVisible} url=${page.url()}`);
        await shot(page, 'desktop-1440-list-p1');

        // 2. click page 2
        await page.locator('[data-testid="pagination-page"][data-page="2"]').click();
        await page.waitForTimeout(1800);
        rows = await page.locator('[data-testid="notice-row"]').count();
        console.log(`[list p2] rows=${rows} url=${page.url()}`);
        await shot(page, 'desktop-1440-list-p2');

        // 3. click row 3 on page 2 -> detail
        const href = await page.locator('[data-testid="notice-row"]').nth(2).getAttribute('href');
        console.log(`[detail] clicking ${href}`);
        await page.locator('[data-testid="notice-row"]').nth(2).click();
        await page.waitForSelector('[data-testid="html-content"]', { timeout: 20000 });
        await page.waitForTimeout(1500);
        const title = await page.locator('#shop_notice_detail_title, [id="shop_notice_detail_title"]').first().textContent().catch(() => 'n/a');
        const contentText = await page.locator('[data-testid="html-content"]').first().innerText();
        console.log(`[detail] url=${page.url()} title=${(title || '').trim()}`);
        console.log(`[detail] content has raw html tags: ${/<[a-z]+[\s>]/.test(contentText)}`);
        console.log(`[detail] content snippet: ${contentText.replace(/\s+/g, ' ').slice(0, 120)}`);
        await shot(page, 'desktop-1440-detail');

        // back link
        const backCount = await page.locator('a[href="/shop/notice"]').count();
        console.log(`[detail] back links=${backCount}`);
        console.log(`[errors] ${errors.length ? errors.slice(0, 5).join(' || ') : 'none'}`);
        await ctx.close();
    }

    // ---------- Mobile 390: list + detail ----------
    {
        const ctx = await browser.newContext({ viewport: VIEWPORTS.mobile });
        await ctx.addInitScript(() => {
            try { localStorage.setItem('g7_locale', 'ko'); } catch (e) {}
        });
        const page = await ctx.newPage();
        await page.goto(`${BASE_URL}/shop/notice`, { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForSelector('[data-testid="notice-row"]', { timeout: 20000 });
        await page.waitForTimeout(1400);
        await shot(page, 'mobile-390-list');

        await page.goto(`${BASE_URL}/shop/notice/19`, { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForSelector('[data-testid="html-content"]', { timeout: 20000 });
        await page.waitForTimeout(1400);
        await shot(page, 'mobile-390-detail');
        await ctx.close();
    }

    await browser.close();
}

main().catch((err) => { console.error('FATAL', err); process.exit(1); });