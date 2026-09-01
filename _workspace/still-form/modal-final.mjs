import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const BASE = 'http://127.0.0.1:8000';
const MEMBER = { email: 'parity-bot@stillform.test', password: '<redacted-pw>parity!!!' };
const OUT = '/home/bahamut/20feet/_workspace/still-form/visual-qa/checkout-parity';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'ko-KR' });
page.on('console', m => { if (m.type() === 'error') console.log('CS:', m.text().slice(0, 150)); });
page.on('pageerror', e => console.log('PE:', String(e).slice(0, 150)));

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('#auth_login_email', MEMBER.email);
await page.fill('#auth_login_password', MEMBER.password);
await page.click('#auth_login_submit');
await page.waitForLoadState('networkidle');

await page.goto(`${BASE}/shop/product/STLBOOK000008XY`, { waitUntil: 'networkidle' });
await page.click('[data-testid="add-to-cart"]').catch(() => {});
await page.waitForTimeout(1200);

await page.goto(`${BASE}/shop/checkout`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-testid="checkout-form"]', { timeout: 15000 });

// 배송지 관리 → 모달
await page.click('[data-testid="checkout-manage-addresses"]');
await page.waitForTimeout(1500);
const st1 = await page.evaluate(() => ({
    active: window.G7Core?.state?.get?.()?._global?.activeModal,
    panel: !!document.querySelector('.scm-modal-panel'),
    title: document.querySelector('.scm-modal-title')?.textContent ?? null,
}));
console.log('CLICK-MODAL:', JSON.stringify(st1));
await page.screenshot({ path: `${OUT}/member-address-modal.png`, fullPage: false });
if (st1.panel) {
    const close = page.locator('[data-testid="scm-modal-close"]');
    if (await close.count()) { await close.click(); await page.waitForTimeout(600); }
}

await page.screenshot({ path: `${OUT}/member-checkout-full-1440.png`, fullPage: true });
// 모바일
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'ko-KR', storageState: undefined });
// member 세션 유지 불가(새 페이지) → 같은 브라우저에서 viewport 변경 컨텍스트만
const mp = await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE}/shop/checkout`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-testid="checkout-form"]', { timeout: 15000 });
try {
    await page.waitForSelector('[data-testid="checkout-form"]', { timeout: 15000 });
} catch {}
const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
console.log('MOBILE-OVERFLOW:', ov);
await page.screenshot({ path: `${OUT}/member-checkout-390.png`, fullPage: true });
await browser.close();
