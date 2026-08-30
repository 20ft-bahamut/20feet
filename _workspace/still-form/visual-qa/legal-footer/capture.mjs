import { chromium } from 'playwright-core';

const BASE_URL = 'http://127.0.0.1:8000';
const OUT_DIR = '/home/bahamut/20feet/_workspace/still-form/visual-qa/legal-footer';
const TAG = process.argv[2] || 'default';

const CHROME = process.env.CHROME_PATH
    || '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';

const SHOTS = [
    { name: 'desktop-1440', viewport: { width: 1440, height: 900 }, page: '/', mode: 'footer' },
    { name: 'desktop-1440', viewport: { width: 1440, height: 900 }, page: '/shop/privacy', mode: 'full' },
    { name: 'mobile-430', viewport: { width: 430, height: 932 }, page: '/', mode: 'footer' },
    { name: 'mobile-430', viewport: { width: 430, height: 932 }, page: '/shop/shipping-policy', mode: 'full' },
];

async function main() {
    const browser = await chromium.launch({
        executablePath: CHROME,
        args: ['--force-color-profile=srgb'],
    });
    for (const shot of SHOTS) {
        const ctx = await browser.newContext({ viewport: shot.viewport });
        const page = await ctx.newPage();
        const url = `${BASE_URL}${shot.page}`;
        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            await page.evaluate(async () => {
                const imgs = Array.from(document.querySelectorAll('img'));
                await Promise.all(imgs.map((img) =>
                    img.complete && img.naturalWidth > 0
                        ? Promise.resolve()
                        : new Promise((res) => {
                              img.addEventListener('load', res, { once: true });
                              img.addEventListener('error', res, { once: true });
                              setTimeout(res, 6000);
                          })
                ));
            });
            await page.waitForTimeout(600);
            const base = `${shot.name}`;
            const target = shot.mode === 'footer'
                ? page.locator('[data-testid="store-footer"]').first()
                : page.locator('body');
            const vp = shot.name;
            const label = shot.page === '/' ? 'footer'
                : shot.page === '/shop/privacy' ? 'policy-privacy'
                : shot.page === '/shop/shipping-policy' ? 'shipping-policy' : 'page';
            const file = `${OUT_DIR}/${base}-${label}-${TAG}.png`;
            await target.scrollIntoViewIfNeeded();
            await page.waitForTimeout(300);
            await target.screenshot({ path: file });
            console.log('[shot] saved', file);
            // overflow check: no horizontal scroll
            const overflow = await page.evaluate(
                () => document.documentElement.scrollWidth - document.documentElement.clientWidth
            );
            console.log(`[check] ${vp} ${shot.page} horizontal overflow px: ${overflow}`);
        } catch (e) {
            console.error('[shot] FAIL', url, e.message);
        } finally {
            await ctx.close();
        }
    }
    await browser.close();
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });