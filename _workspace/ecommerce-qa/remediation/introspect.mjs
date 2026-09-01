import { chromium } from 'playwright-core';
const CREDS = JSON.parse(await import('node:fs').then((m) => m.readFileSync('/tmp/qa-creds.json', 'utf8')));
const BASE = CREDS.baseUrl.replace(/\/$/, '');
const MEMBER = { id: CREDS.memberId, pw: CREDS.memberPw };

const browser = await chromium.launch({
  executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  headless: true,
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

// Login
await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#auth_login_email');
await page.fill('#auth_login_email', MEMBER.id);
await page.fill('#auth_login_password', MEMBER.pw);
await page.click('#auth_login_submit');
await page.waitForFunction(() => !location.pathname.startsWith('/login')).catch(() => {});
console.log('LOGIN OK', page.url());

async function inspect(label, slug) {
  const url = `${BASE}/shop/product/${slug}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const html = await page.content();
  const title = await page.title();
  const headings = await page.locator('h1, h2, h3').allInnerTexts();
  const bodyText = (await page.locator('body').innerText()).slice(0, 1500);
  const optionSelectors = await page.locator('[data-testid*="option"], select[name*="옵션"], select[name*="option"], .opt, [class*="opt"]').count();
  const hasQA = /QA_E2E/.test(html);
  const hasWon = /\b\d{1,3}(,\d{3})+\b/.test(bodyText);
  console.log(`\n=== ${label} ${url} ===`);
  console.log('title:', title);
  console.log('hasQA_E2E_token:', hasQA);
  console.log('hasWonNumber:', hasWon);
  console.log('optionSelectorHits:', optionSelectors);
  console.log('headings:', JSON.stringify(headings.slice(0, 10)));
  console.log('body(1500):', bodyText.replace(/\n+/g, ' | '));
}

await inspect('SINGLE', 'QA_E2E_SINGLE_OPT_PRODUCT');
await inspect('MULTI', 'QA_E2E_MULTI_OPT_PRODUCT');
await inspect('ADD', 'QA_E2E_ADDITIONAL_OPTION_PRODUCT');

// Also check /mypage full
await page.goto(`${BASE}/mypage`, { waitUntil: 'networkidle' });
const myLinks = await page.locator('a[href*="/mypage"]').evaluateAll((els) =>
  els.map((e) => ({ href: e.getAttribute('href'), text: (e.textContent || '').trim() }))
);
console.log('\nMYPAGE LINKS:', JSON.stringify(myLinks));

await browser.close();
