// Remediation regression — coupon scope (SEC-COUPON-002) + payment validation (PAY-006/002/005)
// Run AFTER compat plugin activated. Node >= 18 (fetch).
import { readFileSync, writeFileSync } from 'fs';

const C = JSON.parse(readFileSync('/tmp/qa-creds.json', 'utf8'));
const BASE = 'http://localhost:8000';
const API = BASE + '/api/modules/sirsoft-ecommerce';

const results = [];
const record = (id, status, detail, expected = '', actual = '') => {
    results.push({ id, status, detail, expected, actual });
    console.log(`${status}  ${id}  ${detail}${status !== 'PASS' ? `  [expected=${expected} actual=${actual}]` : ''}`);
};

let memberToken = '';
async function api(method, path, data) {
    const res = await fetch(API + path, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(memberToken ? { Authorization: 'Bearer ' + memberToken } : {}) },
        body: data ? JSON.stringify(data) : undefined,
    });
    let body = null; try { body = await res.json(); } catch {}
    return { code: res.status, data: body?.data, body, errors: body?.errors };
}

// ---- login member
{
    const res = await fetch(BASE + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: C.memberId, password: C.memberPw }) });
    const body = await res.json().catch(() => ({}));
    memberToken = body?.data?.token ?? '';
    if (!memberToken) { console.log('FATAL member login failed', res.status, JSON.stringify(body).slice(0, 200)); writeFileSync('/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/evidence/regression-coupon-payment.json', JSON.stringify(results)); process.exit(1); }
}

// ---- coupon scope regression (uses member cart)
const P_COUPON_TARGET = 13; // 100000원, QA_E2E_COUPON (id=1) 대상
const P_OUT_OF_SCOPE = 10;  // 대상 아님

const p10 = await api('GET', `/api/modules/sirsoft-ecommerce/public/../../sirsoft-ecommerce/products/${P_OUT_OF_SCOPE}`.replace(`/api/modules/sirsoft-ecommerce/public/../../sirsoft-ecommerce/products`, `/products`));
const opt10 = p10.data?.options?.[0]?.id ?? p10.data?.default_option_id ?? null;

async function freshCart(items) {
    const list0 = await api('GET', '/cart');
    if (list0.code === 200) for (const line of list0.data?.items ?? []) await api('DELETE', `/cart/${line.id}`);
    const payload = items.length === 1
        ? { product_id: items[0].product_id, items: [{ product_option_id: items[0].product_option_id ?? null, quantity: items[0].quantity }] }
        : { product_id: items[0].product_id, items: items.map((i) => ({ product_option_id: i.product_option_id ?? null, quantity: i.quantity })) };
    const add = await api('POST', '/cart', payload);
    if (add.code > 201) return { err: add.code, body: add.body };
    const list = await api('GET', '/cart');
    const ids = (list.data?.items ?? []).map((i) => i.id);
    const ck = await api('POST', '/checkout', { item_ids: ids });
    if (ck.code > 201) return { err: ck.code, body: ck.body };
    return { tempId: ck.data?.temp_order_id, calc: ck.data?.calculation, ids };
}

// resolve member's coupon issue id for coupon 1
const coupons = await api('GET', '/user/coupons');
const raw = coupons.data?.coupons?.data ?? coupons.data?.items ?? coupons.data ?? [];
const list = Array.isArray(raw) ? raw : (raw.data ?? []);
const issue = list.find((i) => (i.coupon_id ?? i.coupon?.id) === 1 || JSON.stringify(i.name ?? i.coupon?.name ?? '').includes('쿠폰'));
const issueId = issue?.id ?? null;

// COUPON-SCOPE-002: out-of-scope only cart
{
    const cart = await freshCart([{ product_id: P_OUT_OF_SCOPE, quantity: 2 }]);
    if (cart.calc) {
        const apply = issueId ? await api('PUT', '/checkout', { order_coupon_issue_id: issueId }) : { code: 0 };
        const summary = apply.data?.calculation?.summary ?? {};
        const discount = summary.order_coupon_discount ?? summary.total_coupon_discount;
        if (apply.code === 422 || apply.code === 403) record('COUPON-SCOPE-002', 'PASS', 'out-of-scope coupon attach rejected', '4xx or discount 0', `code=${apply.code}`);
        else if (apply.code === 200 && (discount ?? 0) === 0) record('COUPON-SCOPE-002', 'PASS', 'no 422 but discount 0 (non-eligible ignored)', '4xx or 0', `discount=${discount}`);
        else record('COUPON-SCOPE-002', 'FAIL', 'out-of-scope coupon applied!', '4xx or 0', `code=${apply.code} discount=${discount} final=${summary.final_amount}`);
        await api('DELETE', '/checkout');
    } else record('COUPON-SCOPE-002', 'BLOCKED', 'cart/checkout setup failed', '', JSON.stringify(cart).slice(0, 160));
}

// COUPON-SCOPE-001: target-only cart → eligible discount applies
{
    const cart = await freshCart([{ product_id: P_COUPON_TARGET, quantity: 1 }]);
    if (cart.calc) {
        const apply = issueId ? await api('PUT', '/checkout', { order_coupon_issue_id: issueId }) : { code: 0 };
        const summary = apply.data?.calculation?.summary ?? {};
        const discount = summary.order_coupon_discount;
        if (apply.code === 200 && (discount ?? 0) >= 10000) record('COUPON-SCOPE-001', 'PASS', `target coupon discount=${discount}`, '>= 10000', String(discount));
        else record('COUPON-SCOPE-001', 'FAIL', 'target coupon discount wrong', '>= 10000', `code=${apply.code} discount=${discount} issueId=${issueId}`);
        await api('DELETE', '/checkout');
    } else record('COUPON-SCOPE-001', 'BLOCKED', 'cart/checkout setup failed', '', JSON.stringify(cart).slice(0, 160));
}

// ---- payment validation
async function orderWith(method) {
    const cart = await freshCart([{ product_id: P_COUPON_TARGET, quantity: 1 }]);
    if (cart.err && !cart.calc) return { code: cart.err, body: cart.body };
    const payload = {
        item_ids: cart.ids,
        payment_method: method,
        orderer: { name: 'QA결제자', phone: '010-5555-5555' },
        shipping_address: { receiver_name: 'QA수신자', phone: '010-5555-5556', zipcode: '06611', address: '서울 서초구', address_detail: '3층' },
        deposit_name: 'QA결제자',
        guest_lookup_password: 'qapassword123',
    };
    return api('POST', '/user/orders', payload);
}
{
    const r = await orderWith('card');
    const msg = (r.body?.message ?? '').slice(0, 70);
    if (r.code === 422 || r.code === 403) record('PAYMENT-VAL-002-card', 'PASS', 'inactive card method rejected', '4xx', `${r.code} ${msg}`);
    else record('PAYMENT-VAL-002-card', 'FAIL', 'inactive method accepted', '4xx', `${r.code} ${msg}`);
}
{
    const r = await orderWith('vbank');
    const msg = (r.body?.message ?? '').slice(0, 70);
    if (r.code === 422 || r.code === 403) record('PAYMENT-VAL-004-vbank', 'PASS', 'vbank without PG provider rejected', '4xx', `${r.code} ${msg}`);
    else record('PAYMENT-VAL-004-vbank', 'FAIL', 'vbank order accepted without provider', '4xx', `${r.code} ${msg}`);
}
{
    const r = await orderWith('totally_bogus');
    if (r.code === 422 || r.code === 403) record('PAYMENT-VAL-005-bogus', 'PASS', 'arbitrary method string rejected', '4xx', String(r.code));
    else record('PAYMENT-VAL-005-bogus', 'FAIL', 'bogus method accepted', '4xx', String(r.code));
}

writeFileSync('/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/evidence/regression-coupon-payment.json', JSON.stringify(results, null, 2));
console.log('\nSUMMARY:', results.map((r) => `${r.id}:${r.status}`).join(' '));