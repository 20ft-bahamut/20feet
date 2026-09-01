import { chromium } from 'playwright-core';
const browser = await chromium.launch({
  executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  headless: true
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle' });
await page.fill('#auth_login_email', 'mutzero@gmail.com');
await page.fill('#auth_login_password', '<member-password-redacted>');
await page.click('#auth_login_submit');
await page.waitForTimeout(1500);

await page.goto('http://localhost:8000/shop/qa-e2e-stock-test-product', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const html = await page.content();
const matches = (re, n=5) => {
  const m = html.match(re);
  return m ? m.slice(0, n) : null;
};
console.log('REVIEW_HITS:', matches(/(review|리뷰)/gi, 5));
console.log('INQUIRY_HITS:', matches(/(inquiry|문의)/gi, 5));
console.log('QNA_HITS:', matches(/(qna|q&a|qna|q&a)/gi, 5));
await browser.close();
