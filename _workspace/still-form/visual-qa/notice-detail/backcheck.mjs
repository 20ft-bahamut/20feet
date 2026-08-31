import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome' });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8000/shop/notice/21', { waitUntil: 'networkidle' });
await page.waitForSelector('[data-testid="html-content"]');
const backLink = page.locator('#shop_notice_detail_back');
await backLink.click();
await page.waitForSelector('[data-testid="notice-row"]', { timeout: 15000 });
console.log('BACK OK ->', page.url(), 'rows=', await page.locator('[data-testid="notice-row"]').count());
// next-neighbor click from detail
await page.goto('http://127.0.0.1:8000/shop/notice/20', { waitUntil: 'networkidle' });
const nextHref = await page.locator('.scm-notice-nav-link.scm-notice-nav-next').getAttribute('href');
console.log('next href:', nextHref);
await browser.close();
