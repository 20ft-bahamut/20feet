import { chromium } from 'playwright-core';
import fs from 'fs';
const BASE = 'http://localhost:8000';
const creds = JSON.parse(fs.readFileSync('/tmp/qa-creds.json','utf8'));
const SHOTS = '/home/bahamut/20feet/_workspace/ecommerce-qa/screenshots/cart-checkout';

const browser = await chromium.launch({
  executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  headless: true,
});

const log = (...a) => console.log('[cart-checkout]', ...a);

const page = await browser.newPage({ viewport: { width: 1440, height: 1400 }, locale: 'ko-KR' });
page.on('console', (msg) => {
  if (msg.type() === 'error') console.log('[browser err]', msg.text().slice(0, 200));
});

// Login
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('#auth_login_email', creds.memberId);
await page.fill('#auth_login_password', creds.memberPw);
await page.click('#auth_login_submit');
await page.waitForTimeout(2000);
log('logged in, url:', page.url());

// Use cart page to navigate to checkout (member already has 3 lines from earlier API tests)
// Still Form uses /cart (not /shop/cart)
await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.screenshot({ path: SHOTS + '/cart-page.png', fullPage: true });

// Click 결제하기 button
const checkoutBtn = page.locator('[data-testid="cart-summary-checkout"]');
const cnt = await checkoutBtn.count();
log('checkout button count:', cnt);
if (cnt > 0) {
  await checkoutBtn.first().click();
  await page.waitForTimeout(2500);
  log('after click, url:', page.url());
}
await page.screenshot({ path: SHOTS + '/checkout-page.png', fullPage: true });

// Saved address chips & daum slot
const html = await page.content();
const dom = await page.evaluate(() => {
  // saved-address chips - any element with saved-address class or data, or chips with address content
  const chips = Array.from(document.querySelectorAll('[class*="chip"], [class*="saved"], [class*="address-pill"]'));
  const foundChip = chips.some(el => {
    const t = (el.textContent || '').trim();
    return /테헤란로|세종대로|저장|배송지/i.test(t) && t.length < 200;
  });
  // Daum: look for a button/link near zipcode input that says 우편번호 or 주소검색
  const zipcodeInput = document.querySelector('input[name*="zipcode" i], input[id*="zipcode" i], input[placeholder*="우편" i]');
  let daumNearZip = null;
  if (zipcodeInput) {
    const parent = zipcodeInput.parentElement?.parentElement || zipcodeInput.parentElement;
    daumNearZip = Array.from(parent?.querySelectorAll('button, a') || [])
      .map(el => (el.textContent || '').trim())
      .filter(t => t.length > 0 && t.length < 60)
      .slice(0, 10);
  }
  // Or search entire page for any button/link with 우편번호 or 주소검색 text
  const daumAny = Array.from(document.querySelectorAll('button, a'))
    .map(el => (el.textContent || '').trim())
    .filter(t => /우편번호|주소.*검색|postcode|daum/i.test(t))
    .slice(0, 10);

  // Same-as-orderer
  const sameAs = document.querySelector('#same_as_orderer');
  const sameAsInfo = sameAs ? {
    id: sameAs.id, name: sameAs.name,
    label: (sameAs.closest('label')?.textContent || '').slice(0, 80),
    checked: sameAs.checked,
  } : null;

  // Save-shipping
  const saveShip = document.querySelector('#save_shipping_address');
  const saveShipInfo = saveShip ? {
    id: saveShip.id, name: saveShip.name,
    label: (saveShip.closest('label')?.textContent || '').slice(0, 80),
    checked: saveShip.checked,
  } : null;

  return {
    url: location.href,
    foundChip,
    daumNearZip,
    daumAny,
    sameAsInfo,
    saveShipInfo,
  };
});

console.log(JSON.stringify(dom, null, 2));

// Open address manage modal if exists
const manageBtn = await page.locator('button:has-text("배송지 관리"), a:has-text("배송지 관리"), button:has-text("Manage addresses"), [data-modal="addressManage"]').first();
if (await manageBtn.count() > 0) {
  await manageBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: SHOTS + '/address-manage-modal.png', fullPage: true });
  // Try opening Daum inside modal
  const daumBtnInModal = await page.locator('button:has-text("우편번호"), button:has-text("주소 검색")').first();
  if (await daumBtnInModal.count() > 0) {
    log('clicking daum button inside address modal');
    try {
      await daumBtnInModal.click({ timeout: 3000 });
      await page.waitForTimeout(2500);
    } catch (e) {
      log('daum popup click failed (expected in headless):', e.message.slice(0, 120));
    }
    await page.screenshot({ path: SHOTS + '/daum-after-click.png', fullPage: true });
  }
}

await browser.close();
console.log('DONE');