import { chromium } from 'playwright-core';
const browser = await chromium.launch({
  executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  headless: true
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

// Login as member
await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle' });
await page.fill('#auth_login_email', 'mutzero@gmail.com');
await page.fill('#auth_login_password', '<member-password-redacted>');
await page.click('#auth_login_submit');
await page.waitForTimeout(2000);
console.log('LOGIN_URL_AFTER:', page.url());

// Verify wishlist row via API
const verify = await page.evaluate(async () => {
  const r = await fetch('/api/modules/sirsoft-ecommerce/wishlist', { headers: { Accept: 'application/json' } });
  const cookies = document.cookie;
  return { status: r.status, body: await r.text(), cookies };
});
console.log('WISHLIST_API_VIA_PAGE:', verify.status, verify.body.slice(0, 200));

await browser.close();
