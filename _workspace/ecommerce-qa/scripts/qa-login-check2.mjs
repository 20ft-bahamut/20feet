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
await Promise.all([
  page.waitForResponse(r => r.url().includes('auth/login')),
  page.click('#auth_login_submit'),
]);
await page.waitForTimeout(1500);

// Get CSRF + check sanctum endpoints
const csrfMeta = await page.evaluate(() => {
  return {
    meta: document.querySelector('meta[name="csrf-token"]')?.content || 'NONE',
    cookie: document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] || 'NONE',
    g7session: document.cookie.split('; ').find(c => c.startsWith('g7-session='))?.split('=')[1] || 'NONE',
  };
});
console.log('CSRF_INFO:', csrfMeta);

// Call wishlist with explicit cookies + X-XSRF-TOKEN
const r1 = await page.evaluate(async () => {
  const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
  const r = await fetch('/api/modules/sirsoft-ecommerce/wishlist', {
    headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf || '', 'X-Requested-With': 'XMLHttpRequest' },
    credentials: 'include'
  });
  return { status: r.status, body: (await r.text()).slice(0, 300) };
});
console.log('WISHLIST_API_COOKIE_XCSRF:', r1.status, r1.body);

// Direct session route - check sanctum endpoints
const r2 = await page.evaluate(async () => {
  const r = await fetch('/api/auth/user', { headers: { Accept: 'application/json' }, credentials: 'include' });
  return { status: r.status, body: (await r.text()).slice(0, 300) };
});
console.log('AUTH_USER_API:', r2.status, r2.body);

// Try login again via session cookie path
const r3 = await page.evaluate(async () => {
  const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
  const r = await fetch('/api/modules/sirsoft-ecommerce/wishlist', {
    method: 'GET', headers: { Accept: 'application/json', 'X-XSRF-TOKEN': decodeURIComponent(getCookie('XSRF-TOKEN') || ''), 'X-Requested-With': 'XMLHttpRequest' },
    credentials: 'include'
  });
  function getCookie(n) { const m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)')); return m ? m[1] : null; }
  return { status: r.status, body: (await r.text()).slice(0, 300) };
});
console.log('WISHLIST_XSRF_DECODED:', r3.status, r3.body);

await browser.close();
