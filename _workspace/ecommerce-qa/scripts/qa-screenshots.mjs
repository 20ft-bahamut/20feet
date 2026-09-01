import { chromium } from 'playwright-core';
const browser = await chromium.launch({
  executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  headless: true
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// 1. Product detail page (Still Form) - check heart icon
await page.goto('http://localhost:8000/shop/qa-e2e-stock-test-product', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: '/home/bahamut/20feet/_workspace/ecommerce-qa/screenshots/wishlist/product-detail-1440.png', fullPage: false });

// Check HTML for wishlist-related markup
const html = await page.content();
const hasWishlist = /wishlist|찜|heart/i.test(html);
console.log('PRODUCT_HTML_HAS_WISHLIST:', hasWishlist);

// 2. Login page
await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle' });
await page.fill('#auth_login_email', 'mutzero@gmail.com');
await page.fill('#auth_login_password', '<member-password-redacted>');
await page.screenshot({ path: '/home/bahamut/20feet/_workspace/ecommerce-qa/screenshots/wishlist/login-page.png', fullPage: false });

// 3. Mypage wishlist page (as guest - should redirect)
await page.goto('http://localhost:8000/mypage/wishlist', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: '/home/bahamut/20feet/_workspace/ecommerce-qa/screenshots/wishlist/mypage-wishlist-guest.png', fullPage: true });
console.log('GUEST_WISHLIST_URL:', page.url());

await browser.close();
