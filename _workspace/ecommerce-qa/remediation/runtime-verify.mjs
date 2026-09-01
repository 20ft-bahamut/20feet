// Runtime verification for superbify-commerce_minimal — official contract alignment.
// Boots Playwright Chromium, hits every registered route, collects DOM hydration +
// console errors. Saves screenshots + JSON evidence.

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const CHROME = '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:8000';
const CREDS = JSON.parse(fs.readFileSync('/tmp/qa-creds.json', 'utf8'));
const OUT_DIR = '/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/evidence';
fs.mkdirSync(OUT_DIR, { recursive: true });

const ROUTES = [
    { path: '/', label: 'home' },
    { path: '/shop', label: 'shop_index' },
    { path: '/shop/products', label: 'shop_products' },
    { path: '/shop/products/QAE2ESTOCKTEST001', label: 'shop_product_detail' },
    { path: '/shop/cart', label: 'shop_cart_canonical' },
    { path: '/shop/checkout', label: 'shop_checkout' },
    { path: '/shop/guest/orders/QAE2FREEship01', label: 'shop_guest_order_show' },
    { path: '/mypage/orders', label: 'mypage_orders' },
    { path: '/login', label: 'login_page' },
    { path: '/cart', label: 'legacy_cart_redirect' },
    { path: '/shop/reorder/QAE2FREEship01', label: 'shop_reorder' },
];

async function loginMember(page) {
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="email"]', CREDS.memberId).catch(() => {});
    await page.fill('input[name="password"]', CREDS.memberPw).catch(() => {});
    // Try multiple selectors — different layouts render differently.
    const submit = await page.$('button[type="submit"]');
    if (submit) await submit.click();
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
}

async function visit(page, route) {
    const errors = [];
    page.removeAllListeners('console');
    page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
    });
    page.removeAllListeners('pageerror');
    page.on('pageerror', (err) => errors.push(String(err)));
    let status = 0;
    let h1 = '';
    let empty = false;
    try {
        const resp = await page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        status = resp ? resp.status() : 0;
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        h1 = await page.evaluate(() => {
            const h = document.querySelector('h1');
            return h ? h.textContent?.trim() ?? '' : '';
        });
        const bodyText = await page.evaluate(() => document.body.innerText || '');
        empty = bodyText.includes('화면을 불러오지 못했습니다') || bodyText.includes('페이지를 찾을 수 없습니다');
    } catch (err) {
        errors.push(`navigation: ${err.message}`);
    }
    return { path: route.path, label: route.label, status, h1, empty, errors };
}

async function main() {
    const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // 1. Anonymous visit.
    const anonymous = [];
    for (const r of ROUTES) {
        const result = await visit(page, r);
        anonymous.push(result);
        console.log(`anon ${r.path} -> ${result.status} h1='${result.h1.slice(0,40)}' empty=${result.empty}`);
    }

    // 2. Capture screenshots for the canonical cart and a product detail page.
    await page.goto(`${BASE}/shop/cart`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.screenshot({ path: path.join(OUT_DIR, 'shop-cart-url.png'), fullPage: false });

    await page.goto(`${BASE}/shop/products/QAE2ESTOCKTEST001`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.screenshot({ path: path.join(OUT_DIR, 'shopbase-product.png'), fullPage: false });

    // 3. Login as member, then visit member-only routes.
    await loginMember(page);
    const member = [];
    for (const r of ROUTES) {
        const result = await visit(page, r);
        member.push(result);
        console.log(`member ${r.path} -> ${result.status} h1='${result.h1.slice(0,40)}' empty=${result.empty}`);
    }

    await browser.close();

    const evidence = {
        timestamp: new Date().toISOString(),
        base_url: BASE,
        routes_visited: ROUTES,
        anonymous_runs: anonymous,
        member_runs: member,
        summary: {
            anonymous_total: anonymous.length,
            anonymous_hydrated: anonymous.filter((r) => r.h1.length > 0 && !r.empty).length,
            member_total: member.length,
            member_hydrated: member.filter((r) => r.h1.length > 0 && !r.empty).length,
        },
        screenshots: ['shop-cart-url.png', 'shopbase-product.png'],
    };
    fs.writeFileSync(path.join(OUT_DIR, 'official-alignment.json'), JSON.stringify(evidence, null, 2));
    console.log('\nEvidence written to', path.join(OUT_DIR, 'official-alignment.json'));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
