import { chromium } from 'playwright-core';

const BASE_URL = 'http://127.0.0.1:8000';
const OUT_DIR = '/home/bahamut/20feet/_workspace/still-form/visual-qa/notice-seed';
const CHROME = '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';

const PAGES = [{ name: 'notice', path: '/shop/notice' }];

const VIEWPORTS = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'mobile-390', width: 390, height: 844 },
];

async function main() {
    const browser = await chromium.launch({ executablePath: CHROME });
    for (const vp of VIEWPORTS) {
        const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        await ctx.addInitScript(() => {
            try { localStorage.setItem('g7_locale', 'ko'); } catch (e) {}
        });
        const page = await ctx.newPage();
        for (const p of PAGES) {
            const url = `${BASE_URL}${p.path}`;
            console.log(`[shot] ${vp.name} ${p.name}: ${url}`);
            try {
                await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
                await page.waitForTimeout(1500);
                const file = `${OUT_DIR}/${vp.name}-${p.name}.png`;
                await page.screenshot({ path: file, fullPage: true });
                console.log(`[shot] saved ${file}`);
            } catch (e) {
                console.error(`[shot] FAIL ${vp.name} ${p.name}:`, e.message);
            }
        }
        await ctx.close();
    }
    await browser.close();
}

main().catch((err) => { console.error('FATAL', err); process.exit(1); });