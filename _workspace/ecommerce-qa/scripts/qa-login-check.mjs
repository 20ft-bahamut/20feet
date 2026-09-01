import { chromium } from 'playwright-core';
const browser = await chromium.launch({
  executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  headless: true
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Login + check cookies
await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle' });
const cookiesBefore = await ctx.cookies();
console.log('COOKIES_BEFORE:', cookiesBefore.map(c => c.name));

await page.fill('#auth_login_email', 'mutzero@gmail.com');
await page.fill('#auth_login_password', '<member-password-redacted>');
const [resp] = await Promise.all([
  page.waitForResponse(r => r.url().includes('auth/login') || r.url().includes('login')),
  page.click('#auth_login_submit'),
]);
console.log('LOGIN_RESPONSE_STATUS:', resp.status(), 'URL:', resp.url());
console.log('LOGIN_RESPONSE_BODY:', (await resp.text()).slice(0, 300));
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);

const cookiesAfter = await ctx.cookies();
console.log('COOKIES_AFTER:', cookiesAfter.map(c => c.name + '=' + c.value.slice(0, 20)));

// Try wishlist API with cookies
const r = await page.evaluate(async () => {
  const r = await fetch('/api/modules/sirsoft-ecommerce/wishlist', { headers: { Accept: 'application/json' } });
  return { status: r.status, body: (await r.text()).slice(0, 200) };
});
console.log('WISHLIST_API_WITH_COOKIES:', r.status, r.body);

await browser.close();
