import pkg from '/home/bahamut/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pkg;

const BASE = 'http://127.0.0.1:8000';
const CHROME = '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';

const checks = {
  home: { path: '/', expected: [
    { name: '20ft logo image', selector: 'img[src*="20ft"], svg[class*="logo"], [data-testid*="logo"]' },
    { name: 'Korean tagline', text: '작은 공간에서, 큰 가능성을 만듭니다.' },
    { name: 'Capability line', text: 'WEB / COMMERCE / SOFTWARE / GNUBOARD 7' },
  ]},
  portfolio: { path: '/portfolio', expected: [] },
  superbify: { path: '/superbify', expected: [] },
  inquiry: { path: '/inquiry', expected: [] },
};

const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const results = [];

for (const [key, cfg] of Object.entries(checks)) {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  const resp = await page.goto(BASE + cfg.path, { waitUntil: 'networkidle', timeout: 30000 });
  const status = resp ? resp.status() : null;
  const html = await page.content();
  const title = await page.title();
  const hasLogoImg = /\blogo\b/i.test(html) || html.includes('full.svg') || html.includes('symbol.svg');
  const missingTranslations = [...html.matchAll(/\$t:twentyft\.[\w.]+/g)].map(m => m[0]);

  const checkResults = {};
  for (const exp of cfg.expected) {
    if (exp.selector) {
      const el = await page.$(exp.selector);
      checkResults[exp.name] = !!el;
    } else if (exp.text) {
      checkResults[exp.name] = await page.locator(`text=${exp.text}`).count() > 0;
    }
  }

  results.push({ key, path: cfg.path, status, title, htmlLength: html.length, hasLogoImg, missingTranslations: [...new Set(missingTranslations)], consoleErrors: [...new Set(consoleErrors)], checks: checkResults });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
