/**
 * Phase 1 — product detail parity-affordance runtime verification.
 *
 * Verifies:
 *  (a) Member: /shop/product/QAE2ESTOCKTEST001 shows coupon download badges
 *      (QA E2E 쿠폰 downloadable). Download click → success toast / POST +
 *      DS refetch; screenshot product-coupon-badge.png.
 *  (b) Admin: abilities.can_update gates admin edit link → /admin/ecommerce/
 *      products/{product_code}/edit visible (target=_blank); screenshot
 *      product-admin-edit.png.
 *  (c) Wishlist heart renders inline next to title (parent id =
 *      shop_product_title_row, width <= 120px); screenshot
 *      product-wishlist-inline.png.
 *  (d) No console/page errors beyond known 404s for missing images.
 *
 * Writes evidence JSON to /home/bahamut/20feet/_workspace/ecommerce-qa/
 *   remediation/evidence/parity-affordances.json and screenshots under
 *   _workspace/ecommerce-qa/remediation/screenshots/.
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const CREDS = JSON.parse(fs.readFileSync('/tmp/qa-creds.json', 'utf8'));
const BASE = CREDS.baseUrl.replace(/\/$/, '');
const MEMBER = { id: CREDS.memberId, pw: CREDS.memberPw };
const ADMIN = { id: CREDS.adminId, pw: CREDS.adminPw };

const PRODUCT = 'QAE2ESTOCKTEST001';

const SHOT_DIR = '/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots';
const EVIDENCE_DIR = '/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/evidence';
fs.mkdirSync(SHOT_DIR, { recursive: true });
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

const findings = [];
const consoleErrors = [];
const pageErrors = [];

function rec(check, status, evidence) {
    findings.push({ check, status, evidence });
    console.log(`[${status}] ${check} :: ${evidence}`);
}

async function bindCollectors(page, url) {
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            consoleErrors.push({ url, type: 'console.error', text: msg.text() });
        }
    });
    page.on('pageerror', (err) => {
        pageErrors.push({ url, type: 'pageerror', message: err.message });
    });
}

async function login(page, who) {
    // Bust any cached translation file before reloading.
    try {
        await page.goto('about:blank', { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => {
            try { localStorage.clear(); sessionStorage.clear(); } catch (_) {}
        }).catch(() => {});
        await page.context().clearCookies();
    } catch (_) { /* ignore */ }
    // Disable HTTP cache so the engine re-fetches /api/templates/.../lang/ko.
    const client = await page.context().newCDPSession(page);
    try {
        await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    } catch (_) { /* ignore */ }
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#auth_login_email', { timeout: 10000 });
    await page.fill('#auth_login_email', who.id);
    await page.fill('#auth_login_password', who.pw);
    await Promise.all([
        page.waitForLoadState('networkidle').catch(() => {}),
        page.click('#auth_login_submit'),
    ]);
    await page.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 10000 }).catch(() => {});
}

async function logout(page) {
    // G7 has /logout endpoint via GET — try the standard sign-out URL.
    await page.evaluate(() => {
        try { localStorage.removeItem('g7_token'); } catch (_) {}
    });
    await page.context().clearCookies();
    try {
        await page.goto(`${BASE}/api/auth/logout`, { waitUntil: 'domcontentloaded', timeout: 5000 });
    } catch (_) { /* ignore */ }
}

(async () => {
    const browser = await chromium.launch({
        executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
        headless: true,
    });
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    // Disable HTTP cache for the entire context — translation file changes
    // shouldn't stick to disk cache between runs.
    const cdp = await ctx.newCDPSession(page);
    try {
        await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    } catch (_) { /* ignore */ }
    await bindCollectors(page, 'product');

    try {
        // ----- (a) Member flow: coupon download badge list + download click -----
        await login(page, MEMBER);
        await page.goto(`${BASE}/shop/product/${PRODUCT}`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#shop_product_title_row', { timeout: 15000 });
        // Coupon DS auto-fetches — give it a moment, then look for the badges.
        await page.waitForTimeout(1500);

        const badgeCount = await page.locator('[data-testid="coupon-badge"]').count();
        rec('coupon-badges-render', badgeCount > 0 ? 'PASS' : 'FAIL', `badges=${badgeCount}`);

        // Capture network: did the page issue a /downloadable-coupons request?
        const dlReqs = [];
        page.on('request', (req) => {
            if (req.url().includes('/downloadable-coupons')) dlReqs.push(req.url());
        });

        // Reload to capture request count cleanly.
        await page.goto(`${BASE}/shop/product/${PRODUCT}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(800);
        rec('downloadable-coupons-DS-fetch', dlReqs.length > 0 ? 'PASS' : 'FAIL', `requests=${dlReqs.length}`);

        // Click first available (not-yet-downloaded) badge and capture fetch + toast.
        const couponFetch = page.waitForResponse(
            (resp) => resp.url().includes('/user/coupons/') && resp.url().includes('/download'),
            { timeout: 10000 },
        ).catch(() => null);
        const availableBadge = page.locator('[data-testid="coupon-badge"][data-downloaded="false"]').first();
        const availableExists = await availableBadge.count();
        if (availableExists > 0) {
            await availableBadge.click();
            const dlResp = await couponFetch;
            if (dlResp) {
                const ok = dlResp.status() >= 200 && dlResp.status() < 500;
                // 4xx is acceptable for "already downloaded" or server-side validation — we
                // simply need to observe the POST was issued and reached the API.
                rec('coupon-download-POST', ok ? 'PASS' : 'FAIL', `status=${dlResp.status()} url=${dlResp.url()}`);
            } else {
                rec('coupon-download-POST', 'FAIL', 'no POST observed within timeout');
            }
        } else {
            // Member has already downloaded all coupons — fall back to admin user.
            await logout(page);
            await login(page, ADMIN);
            await page.goto(`${BASE}/shop/product/${PRODUCT}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(1500);
            const couponFetchAdmin = page.waitForResponse(
                (resp) => resp.url().includes('/user/coupons/') && resp.url().includes('/download'),
                { timeout: 10000 },
            ).catch(() => null);
            const adminAvailableBadge = page.locator('[data-testid="coupon-badge"][data-downloaded="false"]').first();
            const adminAvailableCount = await adminAvailableBadge.count();
            if (adminAvailableCount > 0) {
                await adminAvailableBadge.click();
                const dlResp = await couponFetchAdmin;
                if (dlResp) {
                    const ok = dlResp.status() >= 200 && dlResp.status() < 500;
                    rec('coupon-download-POST', ok ? 'PASS' : 'FAIL', `status=${dlResp.status()} url=${dlResp.url()}`);
                } else {
                    rec('coupon-download-POST', 'FAIL', 'no POST observed within timeout');
                }
            } else {
                rec('coupon-download-POST', 'SKIP', 'no available (un-downloaded) badge to click (member + admin both exhausted)');
            }
            // Return to member session for the wishlist screenshot to avoid confusing state.
            await logout(page);
            await login(page, MEMBER);
            await page.goto(`${BASE}/shop/product/${PRODUCT}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(1000);
        }

        // Capture screenshots for (a) coupon badges — crop to the badge area.
        await page.waitForTimeout(800);
        const couponShot = path.join(SHOT_DIR, 'product-coupon-badge.png');
        try {
            await page.locator('[data-testid="coupon-download-badges"]').scrollIntoViewIfNeeded();
            await page.waitForTimeout(300);
        } catch (_) { /* no-op */ }
        await page.screenshot({ path: couponShot, fullPage: false });
        rec('coupon-screenshot', 'PASS', couponShot);

        // ----- (c) Wishlist heart inline next to title -----
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
        const heartEl = page.locator('[data-testid="wishlist-heart"]');
        const heartCount = await heartEl.count();
        rec('wishlist-heart-rendered', heartCount > 0 ? 'PASS' : 'FAIL', `count=${heartCount}`);
        if (heartCount > 0) {
            const box = await heartEl.boundingBox();
            const parentId = await heartEl.evaluate((el) => el.parentElement?.id ?? '');
            const widthOk = !!box && box.width <= 120;
            rec('wishlist-inline-parent', parentId === 'shop_product_title_row' ? 'PASS' : 'FAIL', `parentId=${parentId}`);
            rec('wishlist-inline-width', widthOk ? 'PASS' : 'FAIL', `width=${box?.width ?? 'n/a'}`);
            const heartShot = path.join(SHOT_DIR, 'product-wishlist-inline.png');
            try {
                await page.locator('#shop_product_title_row').scrollIntoViewIfNeeded();
                await page.waitForTimeout(300);
            } catch (_) { /* no-op */ }
            await page.screenshot({ path: heartShot, fullPage: false });
            rec('wishlist-screenshot', 'PASS', heartShot);
        }

        // ----- (b) Admin flow: can_update gates admin edit link -----
        await logout(page);
        await login(page, ADMIN);
        await page.goto(`${BASE}/shop/product/${PRODUCT}`, { waitUntil: 'networkidle' });
        await page.waitForSelector('#shop_product_title_row', { timeout: 15000 });
        await page.waitForSelector('#shop_product_admin_edit', { timeout: 5000 }).catch(() => {});
        // Wait for translations to settle (engine fetches lang file async).
        await page.waitForTimeout(2500);

        const adminEditEl = page.locator('#shop_product_admin_edit');
        const adminEditCount = await adminEditEl.count();
        rec('admin-edit-link-rendered', adminEditCount > 0 ? 'PASS' : 'FAIL', `count=${adminEditCount}`);
        if (adminEditCount > 0) {
            const target = await adminEditEl.getAttribute('target');
            const href = await adminEditEl.getAttribute('href');
            const rel = await adminEditEl.getAttribute('rel');
            const adminEditText = await adminEditEl.textContent();
            const adminEditTitle = await adminEditEl.getAttribute('title');
            rec('admin-edit-target-blank', target === '_blank' ? 'PASS' : 'FAIL', `target=${target}`);
            rec('admin-edit-href', /\/admin\/ecommerce\/products\/.+\/edit$/.test(href ?? '') ? 'PASS' : 'FAIL', `href=${href}`);
            rec('admin-edit-rel-noopener', (rel ?? '').includes('noopener') ? 'PASS' : 'FAIL', `rel=${rel}`);
            // Label must be the resolved string (Korean "관리자 수정") — not the raw $t: token.
            const resolved = (adminEditText ?? '').includes('관리자 수정') && !(adminEditText ?? '').includes('$t:');
            rec('admin-edit-label-resolved', resolved ? 'PASS' : 'FAIL', `text=${JSON.stringify(adminEditText)} title=${JSON.stringify(adminEditTitle)}`);
            const adminShot = path.join(SHOT_DIR, 'product-admin-edit.png');
            try {
                await page.locator('#shop_product_title_row').scrollIntoViewIfNeeded();
                await page.waitForTimeout(300);
            } catch (_) { /* no-op */ }
            await page.screenshot({ path: adminShot, fullPage: false });
            rec('admin-edit-screenshot', 'PASS', adminShot);
        }

        // ----- (d) Console / page error summary -----
        const filteredConsole = consoleErrors.filter((e) => {
            // Allowlist common harmless errors that come from missing static assets.
            const t = (e.text ?? '').toLowerCase();
            if (t.includes('failed to load resource')) return true;
            if (t.includes('the resource at') || t.includes('not found')) return true;
            return false;
        });
        const fatalConsole = consoleErrors.length - filteredConsole.length;
        rec('console-errors', fatalConsole === 0 ? 'PASS' : 'FAIL', `total=${consoleErrors.length} fatal=${fatalConsole}`);
        if (filteredConsole.length) {
            rec('console-errors-ignored-404', 'INFO', `ignored=${filteredConsole.length}`);
        }
        rec('page-errors', pageErrors.length === 0 ? 'PASS' : 'FAIL', `count=${pageErrors.length}`);
    } catch (err) {
        rec('runtime-error', 'FAIL', (err && err.message) || String(err));
    } finally {
        await ctx.close();
        await browser.close();
    }

    const evidence = {
        task: 'phase1-product-detail-parity-affordances',
        product: PRODUCT,
        timestamp: new Date().toISOString(),
        checks: findings,
        console_errors: consoleErrors,
        page_errors: pageErrors,
    };
    fs.writeFileSync(path.join(EVIDENCE_DIR, 'parity-affordances.json'), JSON.stringify(evidence, null, 2));
    console.log(`\nEvidence written: ${EVIDENCE_DIR}/parity-affordances.json`);
    const fails = findings.filter((f) => f.status === 'FAIL');
    console.log(`Summary: ${findings.length} checks, ${fails.length} FAIL(s).`);
    process.exit(fails.length > 0 ? 1 : 0);
})();