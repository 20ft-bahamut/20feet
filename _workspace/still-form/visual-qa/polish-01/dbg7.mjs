import { chromium } from '/mnt/wslg/distro/home/bahamut/20feet/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const data = await page.evaluate(() => {
    const featured = document.querySelector('[data-testid="product-card"][data-featured="true"]');
    if (!featured) return { error: 'no featured' };
    const r = featured.getBoundingClientRect();
    const imgWrapper = featured.querySelector('div');
    const imgR = imgWrapper?.getBoundingClientRect();
    const img = featured.querySelector('img');
    const imgRect = img?.getBoundingClientRect();
    const cs = window.getComputedStyle(imgWrapper);
    return {
        cardRect: { w: r.width, h: r.height, top: r.top, left: r.left },
        imgWrapperRect: { w: imgR?.width, h: imgR?.height, top: imgR?.top },
        imgRect: { w: imgRect?.width, h: imgRect?.height, top: imgRect?.top },
        aspectRatio: cs.aspectRatio,
        wrapperOverflow: cs.overflow,
    };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
