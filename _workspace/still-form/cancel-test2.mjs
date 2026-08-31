import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const BASE = 'http://127.0.0.1:8000';
const MEMBER = { email: 'parity-bot@stillform.test', password: 'qwer1234parity!!!' };
const ORDER = '20260831-1406336092';
const OUT = '/home/bahamut/20feet/_workspace/still-form/visual-qa/checkout-parity';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'ko-KR' });
const out = {};
page.on('response', r => { if (r.url().includes('/cancel') && r.request().method() === 'POST') console.log('CANCEL-HTTP:', r.status()); });
page.on('pageerror', e => console.log('PE:', String(e).slice(0, 150)));
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('#auth_login_email', MEMBER.email);
await page.fill('#auth_login_password', MEMBER.password);
await page.click('#auth_login_submit');
await page.waitForLoadState('networkidle');
await page.goto(`${BASE}/mypage/orders/${ORDER}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const btn = page.locator('#mypage_order_cancel_button');
out.cancelBtn = await btn.count();
out.disabled = await btn.isDisabled();
out.reasonOpts = await page.locator('#mypage_order_cancel_reason_select option').count();
await page.screenshot({ path: `${OUT}/cancel-panel-1.png`, fullPage: false });
// 디버그: select 상태 + 액션 존재 확인
out.selectHtml = await page.evaluate(() => {
    const el = document.querySelector('#mypage_order_cancel_reason_select');
    return el ? { tag: el.tagName, opts: el.options.length, firstVal: el.options[1]?.value ?? null, hasOnChange: !!el.onchange || el.getAttribute('data-has-change') !== null, outer: el.outerHTML.slice(0, 300) } : null;
});
// 프로그램적 change 이벤트로 재시도 + 상태 확인
await page.evaluate(() => {
    const el = document.querySelector('#mypage_order_cancel_reason_select');
    el.value = 'order_mistake';
    el.dispatchEvent(new Event('change', { bubbles: true }));
});
await page.waitForTimeout(600);
out.disabledAfterChange = await btn.isDisabled();
out.selectVal = await page.evaluate(() => document.querySelector('#mypage_order_cancel_reason_select')?.value);
out.localState = await page.evaluate(() => { try { const s = window.G7Core?.state?.get?.(); return { hasLocal: !!s, localKeys: s?._local ? Object.keys(s._local).slice(0, 10) : null, cancelReason: s?._local?.cancelReason }; } catch (e) { return String(e).slice(0, 60); } });
if (!out.disabledAfterChange) {
    await page.locator('#mypage_order_cancel_reason_select').selectOption({ index: 1 });
    await page.waitForTimeout(300);
    await btn.click();
    await page.waitForTimeout(800);
    out.dialogVisible = await page.locator('.scm-panel, [role=dialog], [data-testid*="confirm"]').filter({ hasText: /취소/ }).count() > 0;
    // 다이얼로그 스크린샷
    await page.screenshot({ path: `${OUT}/cancel-confirm-dialog.png`, fullPage: false });
    // 취소(아니오) 클릭 — 주문 유지
    const cancelLabels = await page.evaluate(() => [...document.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean));
    out.dialogButtons = cancelLabels.slice(-4);
    // 예 버튼으로 실제 취소 진행 (test order)
    const confirmBtn = page.getByRole('button', { name: /주문 취소|확인|삭제/ }).last();
    if (await confirmBtn.count()) {
        await confirmBtn.click();
        await page.waitForTimeout(1500);
        out.pageAfter = (await page.locator('body').textContent()).replace(/\s+/g, ' ').match(/취소완료|취소|결제대기/g)?.slice(0, 3);
    }
    await page.screenshot({ path: `${OUT}/cancel-result.png`, fullPage: false });
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
