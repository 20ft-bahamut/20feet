import { chromium } from '/mnt/wslg/distro/home/bahamut/20feet/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const data = await page.evaluate(() => {
    const sec = document.querySelector('[data-testid="product-grid-secondary"]');
    if (!sec) return { error: 'no secondary' };
    const sc = window.getComputedStyle(sec);
    const cards = Array.from(sec.querySelectorAll('[data-testid="product-card"]')).map((c, i) => {
        const r = c.getBoundingClientRect();
        const imgR = c.querySelector('img')?.getBoundingClientRect();
        const cardCs = window.getComputedStyle(c);
        return { i, w: r.width, h: r.height, imgW: imgR?.width, imgH: imgR?.height, gridRow: cardCs.gridRow, gridColumn: cardCs.gridColumn };
    });
    return { w: sec.getBoundingClientRect().width, h: sec.getBoundingClientRect().height, cards, secGridTemplateRows: sc.gridTemplateRows, secGridTemplateColumns: sc.gridTemplateColumns };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
