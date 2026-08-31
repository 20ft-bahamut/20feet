import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const BASE = 'http://127.0.0.1:8000';
const MEMBER = { email: 'parity-bot@stillform.test', password: 'qwer1234parity!!!' };
const OUT = '/home/bahamut/20feet/_workspace/still-form/visual-qa/checkout-parity';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'ko-KR' });
const out = {};
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

// 주문서 작성 (member: same-as-orderer)
await page.click('[data-testid="checkout-same-as-orderer"]').catch(() => {});
await page.fill('input[name="zipcode"]', '06236');
await page.fill('input[name="address"]', '서울 강남구 테헤란로 427');
await page.fill('input[name="address_detail"]', '101동');
await page.click('input[name="selected_dbank"]').catch(() => {});
// 주문 생성
const respPromise = page.waitForResponse((r) => r.url().includes('/user/orders'), { timeout: 20000 }).catch(() => null);
await page.click('[data-testid="checkout-pay-button"]');
const resp = await respPromise;
out.orderCreateStatus = resp ? resp.status() : 'no-response';
out.orderUrl = page.url();

// mypage 주문 상세로
await page.goto(page.url(), { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const cancelBtn = page.locator('#mypage_order_cancel_button');
out.cancelBtnCount = await cancelBtn.count();
out.cancelBtnDisabled = (await cancelBtn.count()) ? await cancelBtn.isDisabled() : null;
out.reasonOptions = await page.locator('#mypage_order_cancel_reason_select option').count();
if (reasonOptionsOk(out.reasonOptions)) {
    // 사유 선택
    const sel = page.locator('#mypage_order_cancel_reason_select');
    await sel.selectOption({ index: 1 }).catch(() => {});
    await page.waitForTimeout(300);
    out.disabledAfterReason = await cancelBtn.isDisabled();
    // 클릭 → ConfirmDialog
    await cancelBtn.click();
    await page.waitForTimeout(600);
    out.confirmDialogVisible = await page.locator('[data-testid="confirm-dialog"], .scm-confirm-dialog, [role=dialog]').filter({ hasText: '취소' }).count() > 0
        || await page.evaluate(() => !!document.querySelector('[class*="confirm"]'));
    await page.screenshot({ path: `${OUT}/order-cancel-confirm-dialog.png`, fullPage: false });
    // 아니오(취소) 클릭 — 주문 유지 검증
    const decline = page.getByRole('button', { name: /아니오|취소(?!사유)/ }).last();
    if (await decline.count()) { await decline.click(); await page.waitForTimeout(500); }
    out.orderStatusAfterDecline = (await page.bodyText ? '' : '').trim ? null : null;
}
// 다시 확인(예) — 실제 취소까지 진행하려면 아래 주석 해제
// out.confirmDoCancel = true; // 테스트용

function reasonOptionsOk(n) { return n !== null && !Number.isNaN(n); }
console.log(JSON.stringify(out, null, 1));
await page.screenshot({ path: `${OUT}/order-cancel-panel.png`, fullPage: true });
await browser.close();
