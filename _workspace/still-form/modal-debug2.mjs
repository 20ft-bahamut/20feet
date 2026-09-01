import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const BASE = 'http://127.0.0.1:8000';
const MEMBER = { email: 'parity-bot@stillform.test', password: '<redacted-pw>parity!!!' };
const OUT = '/home/bahamut/20feet/_workspace/still-form/visual-qa/checkout-parity';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'ko-KR' });
page.on('console', m => { const t=m.text(); if(t.includes('odal')||t.includes('모달')||t.includes('실패')||m.type()==='error') console.log('CS['+m.type()+']:', t.slice(0, 200)); });
page.on('pageerror', e => console.log('PE:', String(e).slice(0, 200)));
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('#auth_login_email', MEMBER.email);
await page.fill('#auth_login_password', MEMBER.password);
await page.click('#auth_login_submit');
await page.waitForLoadState('networkidle');
// 카트 채우고
await page.goto(`${BASE}/shop/product/STLBOOK000008XY`, { waitUntil: 'networkidle' });
await page.click('[data-testid="add-to-cart"]').catch(() => {});
await page.waitForTimeout(1200);
await page.goto(`${BASE}/shop/checkout`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-testid="checkout-form"]', { timeout: 15000 });
// 배송지 관리 클릭
await page.click('[data-testid="checkout-manage-addresses"]');
await page.waitForTimeout(1200);
// 직접 modal.open 호출
const api = await page.evaluate(() => {
    const g = window.G7Core;
    return { hasModal: typeof g?.modal?.open, hasDispatch: typeof g?.dispatch, hasGetActionDispatcher: typeof g?.getActionDispatcher, hasTemplateApp: !!g?.templateApp };
});
console.log('API:', JSON.stringify(api));
await page.evaluate(() => { try { window.G7Core.modal.open('checkoutAddressManageModal'); } catch (e) { console.log('OPEN-ERR', String(e).slice(0, 120)); } });
await page.waitForTimeout(1200);
const st = await page.evaluate(() => {
    const out = {};
    try {
        const g = window.G7Core;
        out.gKeys = Object.keys(g || {}).slice(0, 30);
        out.appKeys = g?.templateApp ? 'yes' : 'no';
        const ta = g?.templateApp || g?._templateApp || (g?.getTemplateApp && g.getTemplateApp()) || null;
        out.taKeys = Object.keys(ta || {}).slice(0, 20);
        out.hasLayout = !!(ta?.currentLayoutJson || ta?.state?.currentLayoutJson);
        const lj = ta?.state?.currentLayoutJson || ta?.currentLayoutJson || null;
        out.layoutModals = lj ? (lj.modals || []).map((m) => m.id) : 'n/a';
        out.layoutName = lj?.layout_name || null;
        out.registryModal = !!(g && g.templateEngine && g.templateEngine.ComponentRegistry);
        try { out.findModal = typeof g?.templateEngine?.ComponentRegistry?.getInstance === 'function' ? (function(){ const r=g.templateEngine.ComponentRegistry.getInstance(); const c=r.get ? r.get('Modal') : null; return c ? 'registered' : 'MISSING'; })() : 'n/a'; } catch(e){ out.findModal = 'ERR'+String(e).slice(0,60); }
    } catch (e) { out.err = String(e).slice(0, 100); }
    return out;
});
console.log('LAYOUT:', JSON.stringify(st));
const reg = await page.evaluate(() => {
    const out = {};
    try {
        const g = window.G7Core;
        const cm = typeof g.getComponentMap === 'function' ? g.getComponentMap() : null;
        if (cm) {
            const keys = typeof cm.keys === 'function' ? [...cm.keys()] : Object.keys(cm);
            out.allKeys = keys.slice(0, 60); out.count = keys.length;
        } else out.cm = typeof g.getComponentMap;
        // 컴포지트 이름으로 확인
        try { out.check = g.evaluateCondition ? n => undefined : null; } catch {}
    } catch (e) { out.err = String(e).slice(0, 120); }
    return out;
});
console.log('REG:', JSON.stringify(reg));
console.log('MODAL:', JSON.stringify(st));
await page.screenshot({ path: `${OUT}/member-address-modal.png`, fullPage: false });
await browser.close();
