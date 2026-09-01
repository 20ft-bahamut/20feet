import { chromium } from 'playwright-core';
const browser = await chromium.launch({
  executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  headless: true
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Login
await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle' });
await page.fill('#auth_login_email', 'mutzero@gmail.com');
await page.fill('#auth_login_password', '<member-password-redacted>');
await page.click('#auth_login_submit');
await page.waitForLoadState('networkidle');
console.log('AFTER_LOGIN_URL:', page.url());

// Visit product detail
await page.goto('http://localhost:8000/shop/qa-e2e-stock-test-product', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: '/home/bahamut/20feet/_workspace/ecommerce-qa/screenshots/wishlist/product-detail.png', fullPage: false });

// Look for heart toggle
const heartExists = await page.locator('[class*="heart"], [data-action*="wishlist"], button:has-text("찜"), [aria-label*="wishlist"], [aria-label*="찜"]').count();
console.log('HEART_LOCATOR_COUNT:', heartExists);

// Visit mypage wishlist
await page.goto('http://localhost:8000/mypage/wishlist', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: '/home/bahamut/20feet/_workspace/ecommerce-qa/screenshots/wishlist/mypage-wishlist.png', fullPage: true });
console.log('MYPAGE_URL:', page.url());

// Check mypage tabs
await page.goto('http://localhost:8000/mypage', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const tabs = await page.locator('a[href*="/mypage/"]').allTextContents();
console.log('MYPAGE_TABS:', JSON.stringify(tabs));

await browser.close();
