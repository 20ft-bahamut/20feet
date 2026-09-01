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

// Find all slots.content components and look for inquiry form / review list  
const slotsContent = await page.evaluate(() => {
  // Try to find tabs or similar content
  const tabs = Array.from(document.querySelectorAll('[class*="tab"], [role="tablist"], [data-tab]'));
  return tabs.map(t => t.outerHTML.slice(0, 200));
});
console.log('TAB_ELEMENTS:', slotsContent.slice(0,5));

// Check for review list, inquiry form
const reviewListExists = await page.locator('[class*="review"], [data-component*="review"]').count();
const inquiryFormExists = await page.locator('[class*="inquiry"], [class*="qna"], [class*="question"], form[action*="inquir"]').count();
console.log('REVIEW_LIST_COUNT:', reviewListExists);
console.log('INQUIRY_FORM_COUNT:', inquiryFormExists);

await browser.close();
