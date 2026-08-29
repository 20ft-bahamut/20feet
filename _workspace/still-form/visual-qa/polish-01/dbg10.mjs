import { chromium } from '/mnt/wslg/distro/home/bahamut/20feet/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const popular = await page.$('[data-testid="product-grid"][data-variant="featured"]');
if (popular) {
    await popular.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await popular.screenshot({ path: '/home/bahamut/20feet/_workspace/still-form/visual-qa/polish-01/dbg/popular-section.png' });
    console.log('saved');
}
await browser.close();
