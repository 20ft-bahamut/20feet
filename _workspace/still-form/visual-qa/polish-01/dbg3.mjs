import { chromium } from '/mnt/wslg/distro/home/bahamut/20feet/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const data = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-testid="product-card-quickadd"]'));
    return cards.slice(0, 3).map((c) => c.textContent);
});
console.log('quick-add labels:', JSON.stringify(data, null, 2));
const data2 = await page.evaluate(() => {
    const nav = Array.from(document.querySelectorAll('[data-testid^="nav-"]'));
    return nav.map((n) => n.textContent);
});
console.log('nav labels:', JSON.stringify(data2, null, 2));
await browser.close();
