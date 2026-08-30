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
for (const p of [['shop', '/shop'], ['product', '/shop/product/STLPEN0000007QR'], ['story', '/shop/story']]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const bad = [];
  page.on('requestfailed', req => { if (req.url().includes('/api/templates')) bad.push(req.url()); });
  try {
    await page.goto(`http://127.0.0.1:8000${p[1]}`, { waitUntil: 'networkidle', timeout: 45000 });
    await waitForImages(page);
    await page.screenshot({ path: `${OUT}/desktop-1440-after-v1-${p[0]}-top.png`, clip: { x: 0, y: 0, width: 1440, height: 560 } });
    const logo = await page.evaluate(() => {
      const i = document.querySelector('[data-scm-logo] img');
      return i ? { loaded: i.complete && i.naturalWidth > 0, src: i.currentSrc } : null;
    });
    console.log(p[0], JSON.stringify(logo), 'failed:', bad.length ? bad : 'none');
  } catch (e) { console.error(p[0], 'FAIL', e.message); }
  await ctx.close();
}
await browser.close();
