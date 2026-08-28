/**
 * Take full-page screenshots of /shop/product/..., /shop, /cart
 * at desktop (1440) + mobile (390) viewports.
 * Saves to /home/bahamut/20feet/_workspace/20ft/visual-pass2/
 */
import { chromium } from 'playwright-core';

const BASE_URL = 'http://127.0.0.1:8000';
const OUT_DIR = '/home/bahamut/20feet/_workspace/20ft/visual-pass2';

const PAGES = [
    { name: 'product', path: '/shop/product/STLPEN0000007QR' },
    { name: 'shop',    path: '/shop' },
    { name: 'cart',    path: '/cart' },
];

const VIEWPORTS = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile',  width: 390,  height: 844 },
];

async function main() {
    const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
    for (const vp of VIEWPORTS) {
        const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        const page = await ctx.newPage();
        for (const p of PAGES) {
            const url = `${BASE_URL}${p.path}?_=${Date.now()}`;
            console.log(`[shot] ${vp.name} ${p.name}: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle' });
            // small delay to let progressive data sources + dynamic SVGs settle
            await page.waitForTimeout(2000);
            const file = `${OUT_DIR}/${vp.name}-${p.name}.png`;
            await page.screenshot({ path: file, fullPage: true });
            console.log(`[shot] saved ${file}`);
        }
        await ctx.close();
    }
    await browser.close();
}

main().catch((err) => { console.error('FATAL', err); process.exit(1); });
