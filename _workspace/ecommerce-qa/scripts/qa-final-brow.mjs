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
await page.waitForTimeout(1500);

// Visit each mypage tab and capture status
const tabs = [
  { name: 'mypage', path: '/mypage' },
  { name: 'orders', path: '/mypage/orders' },
  { name: 'addresses', path: '/mypage/addresses' },
  { name: 'wishlist', path: '/mypage/wishlist' },
  { name: 'coupons', path: '/mypage/coupons' },
  { name: 'mileage', path: '/mypage/mileage' },
  { name: 'inquiries', path: '/mypage/inquiries' },
  { name: 'change-password', path: '/mypage/change-password' },
];

const results = [];
for (const t of tabs) {
  await page.goto(`http://localhost:8000${t.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const url = page.url();
  const status = url.includes('/login') ? 'redirect-to-login' : 'loaded';
  await page.screenshot({ path: `/home/bahamut/20feet/_workspace/ecommerce-qa/screenshots/mypage/${t.name}.png`, fullPage: false });
  results.push({ name: t.name, path: t.path, url, status });
}

// Visit product detail (Still Form - check review/inquiry UI)
await page.goto('http://localhost:8000/shop/qa-e2e-stock-test-product', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const productHtml = await page.content();
const hasReviewUI = /리뷰|review/i.test(productHtml);
const hasInquiryUI = /문의|inquiry/i.test(productHtml);
console.log('PRODUCT_REVIEW_UI:', hasReviewUI);
console.log('PRODUCT_INQUIRY_UI:', hasInquiryUI);
await page.screenshot({ path: '/home/bahamut/20feet/_workspace/ecommerce-qa/screenshots/inquiry/product-detail.png', fullPage: true });

// Inquiry form (mypage)
await page.goto('http://localhost:8000/mypage/inquiries', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: '/home/bahamut/20feet/_workspace/ecommerce-qa/screenshots/inquiry/mypage-inquiries.png', fullPage: true });

// Recent-viewed page (if exists)
await page.goto('http://localhost:8000/mypage/recent', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
console.log('RECENT_PAGE_URL:', page.url());

console.log('MYPAGE_TAB_RESULTS:', JSON.stringify(results, null, 2));

await browser.close();
