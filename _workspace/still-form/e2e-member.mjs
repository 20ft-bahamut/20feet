import { chromium } from 'playwright-core';

const BASE = 'http://127.0.0.1:8000';
const CHROME = process.env.CHROME_PATH;
const OUT = '/home/bahamut/20feet/_workspace/still-form/visual-qa/member';
const MEMBER = { name: 'QA멤버', email: 'qa-member@stillform.test', password: 'qwer1234member' };

const results = [];
const log = (k, v) => { results.push({ k, v }); console.log(`[RESULT] ${k} :: ${v}`); };

async function shot(page, name) {
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
    console.log(`[CAPTURE] ${name}`);
}

async function registerNewMember(browser) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ko-KR' });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    await page.fill('#auth_register_name', MEMBER.name);
    await page.fill('#auth_register_email', MEMBER.email);
    await page.fill('#auth_register_password', MEMBER.password);
    await page.fill('#auth_register_password_confirm', MEMBER.password);
    await page.check('#auth_register_agree_terms');
    await page.check('#auth_register_agree_privacy');
    await shot(page, 'desktop-1440-register');
    await page.click('#auth_register_submit');
    await page.waitForTimeout(2500);
    log('register-submits', page.url());
    // register layout navigates to /login (BASIC pattern, no auto-login) — now login
    if (!/\/login/.test(page.url())) {
        log('register-outcome', 'stayed on register (member id already exists) — proceeding to login');
        await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    }
    await page.waitForSelector('#auth_login_email', { timeout: 10000 });
    await page.fill('#auth_login_email', MEMBER.email);
    await page.fill('#auth_login_password', MEMBER.password);
    await page.click('#auth_login_submit');
    await page.waitForSelector('[data-testid="nav-user-name"]', { timeout: 15000 });
    await page.waitForTimeout(500);
    const userName = await page.textContent('[data-testid="nav-user-name"]');
    const mypageVisible = await page.isVisible('[data-testid="nav-mypage"]');
    log('login-header-user-name', (userName || '').trim());
    log('login-header-mypage-visible', mypageVisible);
    await shot(page, 'desktop-1440-header-logged-in');
    return { ctx, page };
}

async function guestCartMerge(browser) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ko-KR' });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/shop/product/STLBOOK000008XY`, { waitUntil: 'networkidle' });
    await page.click('[data-testid="add-to-cart"]');
    await page.waitForTimeout(1500);
    const badgeBefore = (await page.textContent('[data-testid="cart-count"]').catch(() => '0')) || '0';
    log('guest-cart-badge-before', badgeBefore.trim());

    let xCartKey = null;
    page.on('request', (req) => {
        if (req.url().includes('/api/auth/login') && req.method() === 'POST') {
            xCartKey = req.headers()['x-cart-key'] ?? null;
            console.log('[REQ] login X-Cart-Key =', xCartKey);
        }
    });
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('#auth_login_email', MEMBER.email);
    await page.fill('#auth_login_password', MEMBER.password);
    await shot(page, 'desktop-1440-login');
    await page.click('#auth_login_submit');
    await page.waitForSelector('[data-testid="nav-user-name"]', { timeout: 15000 });
    await page.waitForTimeout(2000);
    const badgeAfter = (await page.textContent('[data-testid="cart-count"]').catch(() => '0')) || '0';
    log('merge-x-cart-key-sent', xCartKey ? 'yes' : `NO (${xCartKey})`);
    log('guest-cart-badge-after-login', badgeAfter.trim());
    return { ctx, page };
}

async function main() {
    const browser = await chromium.launch({ executablePath: CHROME });

    // --- Step 1: register + login + header state
    const s1 = await registerNewMember(browser);

    // --- Step 3: authed /mypage redirect + logged-out redirect with query
    await s1.page.goto(`${BASE}/mypage`, { waitUntil: 'networkidle' });
    await s1.page.waitForTimeout(1200);
    log('mypage-redirect-authed', s1.page.url());
    await s1.page.waitForSelector('[data-testid="nav-user-name"]', { timeout: 10000 });
    log('mypage-tabs', (await s1.page.content()).includes('mypage') ? 'rendered' : 'missing');

    const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ko-KR' });
    const p3 = await ctx3.newPage();
    await p3.goto(`${BASE}/mypage/orders`, { waitUntil: 'networkidle' });
    await p3.waitForTimeout(1200);
    log('mypage-orders-loggedout-redirect', p3.url());
    await shot(p3, 'desktop-1440-login-redirect-guard');
    if (p3.url().includes('/login')) {
        await p3.fill('#auth_login_email', MEMBER.email);
        await p3.fill('#auth_login_password', MEMBER.password);
        await p3.click('#auth_login_submit');
        await p3.waitForTimeout(2500);
        log('login-with-redirect-returns', p3.url());
    }

    // --- Step 2: guest cart merge on fresh profile
    const s2 = await guestCartMerge(browser);

    // --- Step 4: member checkout
    const p4 = s2.page;
    await p4.goto(`${BASE}/shop/product/STLBOOK000008XY`, { waitUntil: 'networkidle' });
    await p4.click('[data-testid="add-to-cart"]');
    await p4.waitForTimeout(1500);
    await p4.goto(`${BASE}/shop/checkout`, { waitUntil: 'networkidle' });
    await p4.waitForSelector('[data-testid="checkout-form"]', { timeout: 20000 });
    await p4.waitForTimeout(1000);
    const guestFieldset = await p4.$('[data-testid="checkout-guest-password"]');
    log('guest-password-fieldset-hidden',
        guestFieldset ? !(await guestFieldset.isVisible()) : 'not-rendered');
    const ordererName = await p4.inputValue('input[name="orderer_name"]').catch(() => '');
    const ordererEmail = await p4.inputValue('input[name="orderer_email"]').catch(() => '');
    log('orderer-prefill', JSON.stringify({ name: ordererName, email: ordererEmail }));
    const daumBtn = await p4.$('.scm-address-search-button');
    log('daum-button-rendered', daumBtn ? 'yes' : 'NO');
    // State bridge probe: set _global.checkoutAddress via engine state
    try {
        const bridged = await p4.evaluate(() => {
            const core = window.G7Core;
            if (!core?.state?.set) return 'no-state-api';
            core.state.set({ checkoutAddress: { zipcode: '06236', address: '서울특별시 강남구 테헤란로 123', region: '서울특별시', city: '강남구', country_code: 'KR' } });
            return 'set-ok';
        });
        await p4.waitForTimeout(1500);
        const zip = await p4.inputValue('input[name="zipcode"]').catch(() => '');
        const addr = await p4.inputValue('input[name="address"]').catch(() => '');
        log('state-bridge-probe', JSON.stringify({ set: bridged, zip, addr }));
    } catch (e) {
        log('state-bridge-probe', `error: ${e.message}`);
    }
    await shot(p4, 'desktop-1440-checkout-logged-in');
    // submit order (dbank)
    const orderResponses = [];
    p4.on('response', async (res) => {
        if (res.url().includes('/api/modules/sirsoft-ecommerce/user/orders') && res.request().method() === 'POST') {
            let body = '';
            try { body = (await res.text()).slice(0, 300); } catch { }
            orderResponses.push({ status: res.status(), url: res.url(), body });
        }
    });
    // member checkout still collects shipping recipient explicitly (design) — fill required fields
    await p4.fill('input[name="orderer_phone"]', '010-1234-5678');
    await p4.fill('input[name="recipient_name"]', MEMBER.name);
    await p4.fill('input[name="recipient_phone"]', '010-1234-5678');
    await p4.fill('input[name="address_detail"]', '101호');
    await p4.fill('input[name="depositor_name"]', MEMBER.name).catch(() => {});
    await p4.click('[data-testid="checkout-pay-button"]');
    await p4.waitForTimeout(8000);
    log('order-submit-status', JSON.stringify(orderResponses));
    log('order-complete-url', p4.url());
    await shot(p4, 'desktop-1440-order-complete');
    const orderUrl = p4.url();

    // --- Step 5: orders list → detail → cancel → reorder
    await p4.goto(`${BASE}/mypage/orders`, { waitUntil: 'networkidle' });
    await p4.waitForTimeout(2000);
    await shot(p4, 'desktop-1440-mypage-orders');
    const detailLink = await p4.$('#mypage_orders_row_detail_link');
    if (detailLink) { await detailLink.click(); } else { log('orders-list-detail-link', 'MISSING'); }
    await p4.waitForTimeout(2500);
    log('order-detail-url', p4.url());
    await shot(p4, 'desktop-1440-order-detail');
    const cancelResponses = [];
    p4.on('response', (res) => {
        if (res.url().includes('/cancel') && res.request().method() === 'POST') {
            cancelResponses.push({ status: res.status(), url: res.url(), body: res.request().postData() });
        }
    });
    const cancelBtn = await p4.$('#mypage_order_cancel_button');
    if (cancelBtn && (await cancelBtn.isVisible())) {
        await p4.waitForSelector('#mypage_order_cancel_reason_select', { timeout: 5000 }).catch(() => {});
        const opts = await p4.$$('#mypage_order_cancel_reason_select option');
        if (opts.length > 1) {
            await p4.selectOption('#mypage_order_cancel_reason_select', { index: 1 });
            await p4.click('#mypage_order_cancel_button');
            await p4.waitForTimeout(800);
            await p4.click('[data-testid="confirm-ok"]').catch(() => {});
            await p4.waitForTimeout(3000);
            log('cancel-api-response', JSON.stringify(cancelResponses));
        } else {
            log('cancel-reason-options', `EMPTY (${opts.length})`);
        }
    } else {
        log('cancel-button-available', 'NO — order not cancellable in current state');
    }
    const reorderBtn = await p4.$('#mypage_order_show_reorder');
    if (reorderBtn && (await reorderBtn.isVisible())) {
        await reorderBtn.click();
        await p4.waitForTimeout(3500);
        log('reorder-landed', p4.url());
        await p4.goto(`${BASE}/cart`, { waitUntil: 'networkidle' });
        await p4.waitForTimeout(1500);
        const cartText = await p4.content();
        log('reorder-cart-has-book', cartText.includes('북 스탠드') ? 'yes' : 'NO');
        await shot(p4, 'desktop-1440-cart-reorder');
    } else {
        log('reorder-button-available', 'NO');
    }

    await s1.ctx.close(); await s2.ctx.close(); await ctx3.close();
    await browser.close();
    console.log('\n=== SUMMARY ===');
    for (const r of results) console.log(`${r.k}: ${r.v}`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });