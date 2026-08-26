import pkg from '/home/bahamut/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pkg;
const browser = await chromium.launch({ headless: true, executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome' });
const pages = ['/', '/portfolio', '/superbify', '/inquiry', '/portfolio/test-slug', '/superbify/test-slug', '/nonexistent'];
const out = [];
for (const p of pages) {
  const page = await browser.newPage();
  const resp = await page.goto('http://127.0.0.1:8000' + p, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  const html = await page.content();
  const title = await page.title();
  out.push({ path: p, status: resp.status(), title, has20ftTemplate: html.includes('data-template-id="twentyft-studio"'), hasHeader: html.includes('data-testid="site-header"') });
  await page.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
