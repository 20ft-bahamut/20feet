import { chromium } from '/mnt/wslg/distro/home/bahamut/20feet/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const featured = await page.$('[data-testid="product-card"][data-featured="true"]');
if (featured) {
    await featured.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await featured.screenshot({ path: '/tmp/featured-only.png' });
    console.log('saved /tmp/featured-only.png');
}
await browser.close();
