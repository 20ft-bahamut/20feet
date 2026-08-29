import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
page.on('response', r => {
  if (r.url().includes('pen-stand') || r.url().includes('book-stand')) {
    console.log(`[${r.status()}] ${r.url().slice(-60)}`);
  }
});
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(5000);
const cards = await page.$$eval('[data-testid^="product-card"]', els => els.slice(0, 8).map(e => ({
  pid: e.getAttribute('data-product-id'),
  img: e.querySelector('img')?.src?.slice(-50),
  complete: e.querySelector('img')?.complete,
  natW: e.querySelector('img')?.naturalWidth,
  natH: e.querySelector('img')?.naturalHeight,
})));
console.log("CARDS:", JSON.stringify(cards, null, 2));
await browser.close();
