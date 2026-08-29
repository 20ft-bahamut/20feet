import { chromium } from '/mnt/wslg/distro/home/bahamut/20feet/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const data = await page.evaluate(() => {
    const grid = document.querySelector('[data-testid="product-grid"][data-variant="featured"]');
    if (!grid) return { error: 'no featured grid' };
    const cs = window.getComputedStyle(grid);
    const cards = Array.from(grid.querySelectorAll('[data-testid="product-card"]')).map((el, i) => {
        const c = window.getComputedStyle(el);
        return {
            i,
            featured: el.getAttribute('data-featured'),
            gridColumn: c.gridColumn,
            gridRow: c.gridRow,
            inlineStyle: el.getAttribute('style')?.slice(0, 200),
        };
    });
    return {
        gridDisplay: cs.display,
        gridTemplateColumns: cs.gridTemplateColumns,
        gridTemplateRows: cs.gridTemplateRows,
        cardCount: cards.length,
        cards,
    };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
