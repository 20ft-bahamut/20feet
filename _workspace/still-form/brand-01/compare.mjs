import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const page = await browser.newPage({ viewport: { width: 900, height: 500 }, deviceScaleFactor: 3 });
await page.goto('file:///home/bahamut/20feet/_workspace/still-form/brand-01/logo-compare.html');
await page.waitForTimeout(1200);
await page.screenshot({ path: '/home/bahamut/20feet/_workspace/still-form/brand-01/logo-compare.png', fullPage: true });
await browser.close();
console.log('done');
