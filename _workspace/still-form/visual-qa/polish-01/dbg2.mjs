import { chromium } from '/mnt/wslg/distro/home/bahamut/20feet/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const data = await page.evaluate(() => {
    const featured = document.querySelector('[data-testid="product-card"][data-featured="true"]');
    if (!featured) return { error: 'no featured' };
    return {
        text: featured.innerText,
        imgSrc: featured.querySelector('img')?.getAttribute('src'),
        imgNatural: featured.querySelector('img')?.naturalWidth,
    };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
