import pkg from '/home/bahamut/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pkg;
const browser = await chromium.launch({ headless: true, executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome' });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8000/portfolio', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000);
console.log('title after wait:', await page.title());
console.log('meta title:', await page.$eval('title', el => el.innerText));
await browser.close();
