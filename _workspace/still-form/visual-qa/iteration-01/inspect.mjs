import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.on('response', r => {
  if (r.url().includes('demo') || r.url().includes('image')) {
    console.log(`[${r.status()}] ${r.url()}`);
  }
});
page.on('pageerror', e => console.log('[err]', e.message));
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
// Check what img tags exist
const imgs = await page.$$eval('img', els => els.map(e => ({ src: e.src, alt: e.alt, w: e.naturalWidth })));
console.log("IMG TAGS:", JSON.stringify(imgs.slice(0, 20), null, 2));
await browser.close();
