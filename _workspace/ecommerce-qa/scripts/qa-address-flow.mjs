import { chromium } from 'playwright-core';
import fs from 'fs';
const BASE = 'http://localhost:8000';
const creds = JSON.parse(fs.readFileSync('/tmp/qa-creds.json','utf8'));
const SHOTS = '/home/bahamut/20feet/_workspace/ecommerce-qa/screenshots/cart-checkout';

const browser = await chromium.launch({
  executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  headless: true,
});

const log = (...a) => console.log('[addr-flow]', ...a);

const page = await browser.newPage({ viewport: { width: 1440, height: 1400 }, locale: 'ko-KR' });

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('#auth_login_email', creds.memberId);
await page.fill('#auth_login_password', creds.memberPw);
await page.click('#auth_login_submit');
await page.waitForTimeout(2000);

await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const checkoutBtn = page.locator('[data-testid="cart-summary-checkout"]');
await checkoutBtn.first().click();
await page.waitForTimeout(2500);
log('on checkout, url:', page.url());

// Inspect form fields by name
const beforeSame = await page.evaluate(() => {
  const sameAs = document.querySelector('[name="same_as_orderer"]');
  const saveAddr = document.querySelector('[name="save_shipping_address"]');
  const rcptName = document.querySelector('[name="recipient_name"]');
  const rcptPhone = document.querySelector('[name="recipient_phone"]');
  const ordererName = document.querySelector('[name="orderer_name"]');
  return {
    sameAsPresent: !!sameAs, sameAsChecked: sameAs ? sameAs.checked : null,
    saveAddrPresent: !!saveAddr, saveAddrChecked: saveAddr ? saveAddr.checked : null,
    rcptName: rcptName ? rcptName.value : null,
    rcptPhone: rcptPhone ? rcptPhone.value : null,
    ordererName: ordererName ? ordererName.value : null,
  };
});
console.log('initial state:', JSON.stringify(beforeSame, null, 2));

// Toggle same-as-orderer ON
await page.locator('[name="same_as_orderer"]').check();
await page.waitForTimeout(500);
const afterSame = await page.evaluate(() => {
  const rcptName = document.querySelector('[name="recipient_name"]');
  const rcptPhone = document.querySelector('[name="recipient_phone"]');
  return { rcptName: rcptName ? rcptName.value : null, rcptPhone: rcptPhone ? rcptPhone.value : null };
});
console.log('after same_as_orderer ON:', JSON.stringify(afterSame));

// Click first saved-address chip ("기본 본사" - id 2 default)
await page.screenshot({ path: SHOTS + '/before-chip-click.png', fullPage: true });
const chips = await page.locator('button').all();
let clicked = false;
for (const c of chips) {
  const t = (await c.textContent() || '').trim();
  if (/본사|집|테헤란로|세종대로/.test(t) && t.length < 60) {
    log('clicking chip:', t);
    await c.click();
    clicked = true;
    break;
  }
}
await page.waitForTimeout(800);
const afterChip = await page.evaluate(() => {
  const rcptName = document.querySelector('[name="recipient_name"]');
  const rcptPhone = document.querySelector('[name="recipient_phone"]');
  const zipcode = document.querySelector('[name="zipcode"]');
  const address = document.querySelector('[name="address"]');
  return {
    rcptName: rcptName ? rcptName.value : null,
    rcptPhone: rcptPhone ? rcptPhone.value : null,
    zipcode: zipcode ? zipcode.value : null,
    address: address ? address.value : null,
  };
});
console.log('after chip click:', JSON.stringify(afterChip, null, 2));
log('chip clicked:', clicked);
await page.screenshot({ path: SHOTS + '/after-chip-click.png', fullPage: true });

// Check daum extension slot — try clicking address search button
const daumBtns = await page.locator('button:has-text("주소 검색")').all();
log('daum address search button count:', daumBtns.length);
if (daumBtns.length > 0) {
  log('trying daum click (headless will likely block popup)');
  try {
    await daumBtns[0].click({ timeout: 3000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SHOTS + '/daum-after-click.png', fullPage: true });
    log('daum click OK');
  } catch (e) {
    log('daum popup blocked (expected headless):', e.message.slice(0, 100));
  }
}

await browser.close();
console.log('DONE');