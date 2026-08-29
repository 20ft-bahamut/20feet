import { chromium } from '/mnt/wslg/distro/home/bahamut/20feet/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const data = await page.evaluate(() => {
    // Check if the button shows in the quick-add hover
    const card = document.querySelector('[data-testid="product-card"]');
    if (!card) return 'no card';
    const btn = card.querySelector('button');
    return btn ? btn.outerHTML.slice(0, 300) : 'no button';
});
console.log(data);
await browser.close();
