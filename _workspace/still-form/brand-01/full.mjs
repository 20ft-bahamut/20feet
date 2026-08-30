import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const OUT = '/home/bahamut/20feet/_workspace/still-form/visual-qa/brand-01';
async function waitForImages(page) {
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    await Promise.all(imgs.map(img => img.complete && img.naturalWidth > 0 ? Promise.resolve() :
      new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); setTimeout(r, 8000); })));
  });
}
for (const vp of [[1440, 900, 'desktop-1440'], [430, 932, 'mobile-430']]) {
  const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle', timeout: 45000 });
  await waitForImages(page); await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${vp[2]}-after-v1-home-full.png`, fullPage: true });
  console.log('saved', vp[2]);
  await ctx.close();
}
await browser.close();
