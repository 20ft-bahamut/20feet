import { chromium } from 'playwright-core';

const BASE = 'http://127.0.0.1:8000';
const MEMBER = { email: 'parity-bot@stillform.test', password: '<redacted-pw>parity!!!' };
const OUT = '/home/bahamut/20feet/_workspace/still-form/visual-qa/checkout-parity';
import { mkdirSync } from 'fs';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'ko-KR' });
const out = {};

// login
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('#auth_login_email', MEMBER.email);
await page.fill('#auth_login_password', MEMBER.password);
await page.click('#auth_login_submit');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);
await page.waitForLoadState('networkidle').catch(() => {});
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/debug-after-login.png`, fullPage: true });
out.urlAfterLogin = page.url();
// 헤더에서 로그인 판정(레이아웃 렌더 기준) — currentUser 는 progressive라 시간차 발생
out.loggedIn = (await page.locator('header, nav, body').first().textContent()).includes('패리티봇');

// capture React console.error component stack
const origErr = [];
await page.addInitScript(() => {
    const orig = console.error;
    console.error = (...args) => {
        try { (window.__reactErrors = window.__reactErrors || []).push(args.map(String).join(' | ').slice(0, 2000)); } catch {}
        orig(...args);
    };
});
// debug capture on failure
page.on('console', (msg) => { if (msg.type() === 'error') console.log('CONSOLE-ERR:', msg.text().slice(0, 200)); });
page.on('pageerror', (err) => console.log('PAGE-ERR:', String(err).slice(0, 300)));
page.on('response', async (r) => { if (r.status() >= 400) console.log('HTTP-ERR:', r.status(), r.url().slice(0, 140)); });

// cart → checkout
if (!out.loggedIn) { console.log(JSON.stringify(out)); await browser.close(); process.exit(0); }
// 장바구니 비었으면 상품 담기
await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle' });
const cartEmpty = (await page.content()).includes('비어') || !(await page.locator('input[name=zipcode], [data-testid="cart-item-row"], .scm-cart').count());
if (cartEmpty) {
    await page.goto(`${BASE}/shop`, { waitUntil: 'networkidle' });
    await page.goto(`${BASE}/shop/product/STLMUG0001AB12CD`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    // 장바구니 담기(첫 번째 add 버튼 — buy 아님)
    const addBtn = page.locator('[data-testid="add-to-cart"], [data-mode="add"]').first();
    if (await addBtn.count()) { await addBtn.click(); await page.waitForTimeout(1200); }
}
await page.goto(`${BASE}/shop/checkout`, { waitUntil: 'networkidle' });
try {
    await page.waitForSelector('[data-testid="checkout-form"]', { timeout: 15000 });
} catch {
    const detail = page.locator('summary, details button, [data-testid*="detail"]').first();
    if (await detail.count()) { await detail.click().catch(() => {}); await page.waitForTimeout(300); }
    // 페이지 이미 크래시 상태면 SPA 재부팅 없이 스택 확보 불가 → 별도 로딩 없이 현재 page에서 시도
    out.reactErrors = await page.evaluate(() => (window.__reactErrors || []).filter((e) => e.includes('Error #31') || e.includes('componentStack') || e.includes('at ')).slice(-2));
    out.renderDetail = (await page.locator('body').textContent()).replace(/\s+/g, ' ').slice(0, 600);
    await page.screenshot({ path: `${OUT}/debug-timeout.png`, fullPage: true });
    console.log('DEBUG-HTML:', (await page.content()).slice(0, 500));
    out.outcome = 'no-checkout-form';
    console.log(JSON.stringify(out, null, 1));
    await browser.close();
    process.exit(0);
}
out.sameAsOrderer = await page.locator('[data-testid="checkout-same-as-orderer"]').count();
out.manageAddresses = await page.locator('[data-testid="checkout-manage-addresses"]').count();
out.saveAddress = await page.locator('[data-testid="checkout-save-shipping-address"]').count();
out.discountSection = await page.locator('[data-testid="checkout-section-discount"]').count();
out.mileageSection = await page.locator('[data-testid="checkout-section-mileage"]').count();
out.itemCouponSelects = await page.locator('[data-testid="checkout-item-coupon-1"]').count();
out.additionalOptions = await page.locator('[data-testid="checkout-item-additional-options"]').count();
out.savedPills = await page.locator('[data-testid^="checkout-saved-address-"]').count();

// same-as-orderer flow
if (out.sameAsOrderer) {
    const on = await page.locator('input[name="same_as_orderer"]').isChecked();
    out.sameAsOrdererChecked = on;
    if (!on) await page.click('[data-testid="checkout-same-as-orderer"]');
    // orderer prefill from member → recipient mirrors
    const ordererName = await page.inputValue('input[name="orderer_name"]');
    const recipName = await page.inputValue('input[name="recipient_name"]');
    out.mirrorWorks = ordererName !== '' && recipName === ordererName;
    await page.click('[data-testid="checkout-same-as-orderer"]').catch(() => {});
}

// 배송지 관리 modal open
if (out.manageAddresses) {
    await page.click('[data-testid="checkout-manage-addresses"]');
    await page.waitForTimeout(800);
    out.modalOpen = await page.evaluate(() => {
        const s = window.G7Core?.state?.get?.();
        return s?._global?.activeModal === 'checkoutAddressManageModal' || (s?._global?.modalStack || []).includes('checkoutAddressManageModal');
    });
    await page.screenshot({ path: `${OUT}/member-address-modal.png`, fullPage: false });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
}

await page.screenshot({ path: `${OUT}/member-checkout-1440.png`, fullPage: true });

// mobile
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'ko-KR' });
await m.goto(`${BASE}/shop/checkout`, { waitUntil: 'networkidle' });
try { await m.waitForSelector('[data-testid="checkout-form"]', { timeout: 15000 }); }
catch {
    out.mobileBody = (await m.locator('body').textContent()).replace(/\s+/g, ' ').slice(0, 300);
    await m.screenshot({ path: `${OUT}/debug-mobile.png`, fullPage: true });
    console.log(JSON.stringify(out, null, 1));
    await browser.close(); process.exit(0);
}
out.mobileOverflow = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
await m.screenshot({ path: `${OUT}/member-checkout-390.png`, fullPage: true });

console.log(JSON.stringify(out, null, 1));
await browser.close();
