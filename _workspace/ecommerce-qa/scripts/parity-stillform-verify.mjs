#!/usr/bin/env node
/**
 * Still Form parity verification (read-only).
 * Visits product detail pages, checks for option selector UI, additional-option UI,
 * inquiry tab, review tab. Captures screenshots.
 */
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'fs';

const EXECUTABLE = '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:8000';
const SHOT_DIR = '/home/bahamut/20feet/_workspace/ecommerce-qa/screenshots/parity-stillform';

const PRODUCTS = [
    { code: 'QA_E2E_SINGLE_OPT_PRODUCT', id: 10, type: 'single_opt' },
    { code: 'QA_E2E_MULTI_OPT_PRODUCT', id: 11, type: 'multi_opt' },
    { code: 'QA_E2E_ADDITIONAL_OPTION_PRODUCT', id: 12, type: 'additional_opt' },
];

async function snap(page, name) {
    const p = `${SHOT_DIR}/${name}.png`;
    await page.screenshot({ path: p, fullPage: true });
    return p;
}

(async () => {
    mkdirSync(SHOT_DIR, { recursive: true });
    const browser = await chromium.launch({ executablePath: EXECUTABLE, headless: true });

    const findings = [];

    // Desktop 1440
    const ctxDesktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageDesktop = await ctxDesktop.newPage();

    // Mobile 430
    const ctxMobile = await browser.newContext({ viewport: { width: 430, height: 900 } });
    const pageMobile = await ctxMobile.newPage();

    for (const prod of PRODUCTS) {
        const url = `${BASE}/shop/product/${prod.code}`;
        console.log(`Visiting ${url}`);
        await pageDesktop.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await pageDesktop.waitForTimeout(1500);
        await snap(pageDesktop, `desktop-1440-${prod.code}`);

        await pageMobile.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await pageMobile.waitForTimeout(1500);
        await snap(pageMobile, `mobile-430-${prod.code}`);

        // Probe DOM for option / additional option / tab UI
        const probes = await pageDesktop.evaluate(() => {
            const result = {};
            // Look for any <select> within purchase card area
            const allSelects = Array.from(document.querySelectorAll('select'));
            result.select_count = allSelects.length;
            result.select_names = allSelects.map(s => s.name || s.id || s.getAttribute('aria-label') || '');

            // Look for buttons with "옵션" / "색상" / "사이즈" text
            const labels = Array.from(document.querySelectorAll('label, button, span, div'))
                .map(n => n.textContent || '')
                .filter(t => t && t.length < 60);
            result.contains_option_label = labels.some(t => /옵션/.test(t) && /선택/.test(t));
            result.contains_additional_label = labels.some(t => /(추가옵션|추가\s*옵션|선물포장|각인)/.test(t));
            result.contains_color_label = labels.some(t => /^(색상|컬러)$/.test(t.trim()));
            result.contains_size_label = labels.some(t => /^(사이즈|크기)$/.test(t.trim()));
            result.contains_price_recalc_handler = !!document.querySelector('[data-testid="add-to-cart-panel"]');
            // Look for option-specific data-* on any interactive
            result.has_option_buttons = !!document.querySelector('[data-option-id], [data-option-name], [data-additional-option-id]');

            // Tab area
            const tabList = document.querySelector('[role="tablist"], .tabs, [class*="tab"]');
            result.tab_count_indicators = document.querySelectorAll('[role="tab"], .tab').length;
            result.tab_html_sample = tabList ? tabList.outerHTML.substring(0, 500) : null;
            result.contains_review_text = /리뷰/.test(document.body.innerText);
            result.contains_inquiry_text = /문의/.test(document.body.innerText);

            // Render AddToCartPanel quantity stepper
            result.has_qty_stepper = !!document.querySelector('[data-testid="quantity-input"]');

            // Look for product detail full HTML text snippet around option area
            const addToCartPanel = document.querySelector('[data-testid="add-to-cart-panel"]');
            result.add_to_cart_panel_parent_text = addToCartPanel
                ? (addToCartPanel.parentElement?.outerHTML?.substring(0, 800) || '')
                : null;

            return result;
        });
        findings.push({ product: prod.code, type: prod.type, ...probes });
    }

    // Capture cart page (empty)
    await pageDesktop.goto(`${BASE}/cart`, { waitUntil: 'networkidle', timeout: 30000 });
    await pageDesktop.waitForTimeout(1500);
    await snap(pageDesktop, 'desktop-1440-cart-empty');

    // Mypage tabs
    await pageDesktop.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await pageDesktop.fill('#auth_login_email', 'mutzero@gmail.com');
    await pageDesktop.fill('#auth_login_password', '<member-password-redacted>');
    await pageDesktop.click('#auth_login_submit');
    await pageDesktop.waitForTimeout(2500);

    const mypageTabs = ['orders', 'addresses', 'coupons', 'mileage', 'wishlist', 'inquiries', 'reviews', 'profile'];
    for (const t of mypageTabs) {
        const url = `${BASE}/mypage/${t}`;
        await pageDesktop.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await pageDesktop.waitForTimeout(1500);
        await snap(pageDesktop, `desktop-1440-mypage-${t}`);
    }

    // Guest order lookup
    await pageDesktop.goto(`${BASE}/shop/guest/orders`, { waitUntil: 'networkidle', timeout: 30000 });
    await pageDesktop.waitForTimeout(1500);
    await snap(pageDesktop, 'desktop-1440-guest-order-lookup');

    writeFileSync(`${SHOT_DIR}/_findings.json`, JSON.stringify(findings, null, 2));
    console.log(JSON.stringify(findings, null, 2));

    await browser.close();
})();
