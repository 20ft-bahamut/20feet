import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
for (const vp of [{w:1440,h:900},{w:430,h:932},{w:390,h:844}]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle', timeout: 45000 });
  const r = await page.evaluate(() => {
    const bar = document.querySelector('.scm-header-bar');
    const head = document.querySelector('[data-testid="store-header"]');
    const logoWrap = document.querySelector('[data-scm-logo]');
    const img = logoWrap?.querySelector('img');
    const brand = document.querySelector('.scm-header-brand');
    const container = document.querySelector('#home_hero_inner, [data-testid="hero-banner"] > div, section > div');
    let res = { headerTotal: head?.getBoundingClientRect().height, barHeight: bar?.getBoundingClientRect().height,
      logoWrap: logoWrap ? logoWrap.getBoundingClientRect() : null,
      imgRect: img ? img.getBoundingClientRect() : null,
      brandRect: brand ? brand.getBoundingClientRect() : null,
      imgNatural: img ? { w: img.naturalWidth, h: img.naturalHeight, complete: img.complete, src: img.currentSrc } : null };
    // measure actual logo ink height via canvas alpha sample
    return res;
  });
  // measure ink height of rendered logo using an offscreen canvas
  const ink = await page.evaluate(async () => {
    const img = document.querySelector('[data-scm-logo] img');
    if (!img) return null;
    const src = img.currentSrc;
    const resp = await fetch(src);
    const blob = new Blob([await resp.arrayBuffer()], { type: 'image/png' });
    const bmp = await createImageBitmap(blob);
    const c = document.createElement('canvas');
    c.width = bmp.width; c.height = bmp.height;
    const ctx2 = c.getContext('2d');
    ctx2.drawImage(bmp, 0, 0);
    const data = ctx2.getImageData(0, 0, c.width, c.height).data;
    let minY = -1, maxY = -1, minX = -1, maxX = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      if (data[(y * c.width + x) * 4 + 3] > 8) {
        if (minY < 0) minY = y; maxY = y; if (minX < 0) minX = x; maxX = x;
      }
    }
    return { canvas: c.width, inkH: maxY - minY + 1, inkW: maxX - minX + 1 };
  });
  const dpr = 1;
  console.log(JSON.stringify({ vp: vp.w, ...r, ink }, (k, v) => (v && v.constructor?.name === 'DOMRect' ? { x: v.x, y: v.y, w: v.width, h: v.height } : v)));
  await ctx.close();
}
await browser.close();
