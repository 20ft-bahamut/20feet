import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(() => {
  try { localStorage.setItem('g7_cart_key', 'ck_jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj'); } catch (e) {}
});
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500); // longer wait

const cards = await page.$$eval('[data-testid^="product-card"]', els => els.slice(0, 8).map(e => ({
  pid: e.getAttribute('data-product-id'),
  featured: e.getAttribute('data-featured'),
  img: e.querySelector('img')?.src,
  loaded: e.querySelector('img')?.complete,
  natW: e.querySelector('img')?.naturalWidth,
  natH: e.querySelector('img')?.naturalHeight,
})));
console.log(JSON.stringify(cards, null, 2));
await browser.close();
