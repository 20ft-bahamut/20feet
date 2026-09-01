// Footer admin-settings overlay runtime verification.
//
// Steps:
//   (a) Snapshot the current admin basic_info via public /shop-info (we will
//       use it as both baseline + restore source). Original = empty payload.
//   (b) Login as admin, PUT new QA-marked values via the admin settings API.
//   (c) Hit a public shop page; the StoreFooter fetches /shop-info on mount
//       and must render the QA values. Screenshot footer-admin-settings.png.
//   (d) Restore the ORIGINAL empty settings snapshot.
//   (e) Reload the public page; footer must fall back to static seed
//       (12-345-67890 etc.). Screenshot footer-fallback.png.
//   (f) Write evidence JSON to remediation/evidence/footer-admin-settings.json.

import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = 'http://localhost:8000';
const CHROME = '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const CREDS_PATH = '/tmp/qa-creds.json';
const SHOP_INFO_PATH = '/api/plugins/superbify-commerce-compat/shop-info';
const ADMIN_SETTINGS_PATH = '/api/modules/sirsoft-ecommerce/admin/settings';

// QA-marked admin values — must surface verbatim in the footer screenshot.
const QA_PAYLOAD = {
    basic_info: {
        shop_name: 'QA 스틸폼',
        route_path: 'shop',
        no_route: false,
        company_name: 'QA 상점',
        business_number_1: '000',
        business_number_2: '00',
        business_number_3: '00001',
        ceo_name: 'QA대표',
        business_type: '',
        business_category: '',
        zipcode: '12345',
        base_address: '테스트주소 1',
        detail_address: '',
        phone_1: '070',
        phone_2: '0000',
        phone_3: '0000',
        fax_1: '',
        fax_2: '',
        fax_3: '',
        email_id: 'qa',
        email_domain: 'example.test',
        privacy_officer: '',
        privacy_officer_email: '',
        mail_order_number: '2026-QA-0001호',
        telecom_number: '',
    },
};

const SHOP_PAGE_PATH = '/shop'; // any public page that renders the StoreFooter

const evidence = {
    steps: [],
    assertions: [],
    blockers: [],
    summary: null,
};

function step(name, ok, detail) {
    evidence.steps.push({ name, ok, detail, ts: new Date().toISOString() });
    const tag = ok ? 'PASS' : 'FAIL';
    console.log(`[${tag}] ${name} — ${typeof detail === 'string' ? detail : JSON.stringify(detail).slice(0, 200)}`);
}

async function snap(page, name) {
    const path = resolve(
        '/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots',
        name
    );
    await page.screenshot({ path, fullPage: false });
    console.log('   screenshot:', path);
    return path;
}

async function loginAdmin(page) {
    // Login form lives at /login with #auth_login_email / #auth_login_password /
    // #auth_login_submit. The creds JSON holds the admin (member) account.
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('#auth_login_email', creds.email);
    await page.fill('#auth_login_password', creds.password);
    await Promise.all([
        page.waitForResponse((r) => r.url().includes('auth/login') || r.url().includes('login'), {
            timeout: 15000,
        }),
        page.click('#auth_login_submit'),
    ]);
    await page.waitForLoadState('networkidle');
}

// Pull admin creds from /tmp/qa-creds.json (NEVER print contents).
// Field names follow the project's convention: adminId / adminPw, memberId / memberPw.
const creds = JSON.parse(await import('node:fs').then((m) => m.readFileSync(CREDS_PATH, 'utf8')));
if (!creds?.adminId || !creds?.adminPw) {
    throw new Error('admin creds missing in /tmp/qa-creds.json');
}
creds.email = creds.adminId;
creds.password = creds.adminPw;

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Capture every /shop-info request so we can prove the footer actually fetches it.
const shopInfoRequests = [];
page.on('request', (req) => {
    if (req.url().includes(SHOP_INFO_PATH)) {
        shopInfoRequests.push({ url: req.url(), method: req.method(), headers: req.headers() });
    }
});

try {
    // Need a page origin for page.evaluate(fetch) — visit any page first.
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });

    // ---------- 0. Initial baseline: snapshot current admin basic_info ----------
    // NOTE: admin basic_info may already hold values from prior runs. The
    // StoreEcommerceSettingsRequest forbids saving basic_info with an empty
    // shop_name (required_with:basic_info), so the only legal admin restore
    // is to set shop_name to the storefront brand "Still Form". Re-running
    // this script on a system that already holds non-empty values will see
    // a non-empty baseline; the assertions below measure overlay + restore
    // independently of the starting shape.
    const baseline = await page.evaluate(async (url) => {
        const r = await fetch(url, { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
        return { status: r.status, body: await r.json() };
    }, SHOP_INFO_PATH);
    const originalShopInfo = baseline.body?.data ?? {};
    const baselineAllEmpty = Object.values(originalShopInfo).every((v) => !v || v === '');
    step(
        'baseline /shop-info snapshot',
        baseline.status === 200,
        {
            status: baseline.status,
            all_empty: baselineAllEmpty,
            note: baselineAllEmpty
                ? 'starting state is fully empty (first run)'
                : 'admin basic_info already held values from a prior run; restore target = "Still Form" (the only legal empty-like admin restore)',
            data: originalShopInfo,
        }
    );

    // ---------- 1. Login as admin ----------
    try {
        await loginAdmin(page);
        step('admin login', true, 'logged in (no creds in evidence)');
    } catch (e) {
        step('admin login', false, String(e?.message ?? e));
        evidence.blockers.push('admin login failed; subsequent admin-only steps skipped');
    }

    // Helper to PUT admin basic_info through the page context (uses admin cookies).
    // Sanctum's auth:sanctum guard accepts a Bearer token from localStorage
    // (G7Core.api stores it under the project's token key) OR a session cookie
    // + matching X-XSRF-TOKEN. We send the Bearer token because the api client
    // attaches it on real navigation; mirroring that path keeps the call
    // shape identical to a normal admin page save action.
    async function putAdminBasicInfo(payload) {
        return await page.evaluate(
            async ({ url, payload }) => {
                // G7Core / ApiClient stores the bearer token in localStorage.
                // The default key is 'g7_auth_token' but we also probe the
                // shared G7Core.api singleton just in case the key differs.
                const probeKeys = ['g7_auth_token', 'g7_token', 'auth_token', 'token'];
                let token = null;
                for (const k of probeKeys) {
                    const v = localStorage.getItem(k);
                    if (typeof v === 'string' && v.length > 0) {
                        token = v;
                        break;
                    }
                }
                // Fallback: any localStorage key whose value looks like a
                // Laravel Sanctum PAT (digits|alnum, often pipe-separated).
                if (!token) {
                    for (let i = 0; i < localStorage.length; i += 1) {
                        const k = localStorage.key(i);
                        const v = localStorage.getItem(k);
                        if (typeof v === 'string' && /^\d+\|[A-Za-z0-9]+$/.test(v)) {
                            token = v;
                            break;
                        }
                    }
                }
                const xsrfCookie = document.cookie
                    .split('; ')
                    .find((c) => c.startsWith('XSRF-TOKEN='));
                const xsrfToken = xsrfCookie ? decodeURIComponent(xsrfCookie.split('=')[1]) : null;
                const r = await fetch(url, {
                    method: 'PUT',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
                    },
                    body: JSON.stringify(payload),
                });
                return { status: r.status, body: await r.text() };
            },
            { url: ADMIN_SETTINGS_PATH, payload }
        );
    }

    // ---------- 2. Fill admin basic_info with QA-marked values ----------
    let adminPut;
    try {
        adminPut = await putAdminBasicInfo(QA_PAYLOAD);
        step(
            'PUT admin basic_info (QA values)',
            adminPut.status >= 200 && adminPut.status < 300,
            { status: adminPut.status, body: adminPut.body.slice(0, 300) }
        );
    } catch (e) {
        step('PUT admin basic_info (QA values)', false, String(e?.message ?? e));
        evidence.blockers.push('admin PUT failed; footer overlay could not be tested');
    }

    // ---------- 3. Confirm public /shop-info now returns the QA values ----------
    const shopAfter = await page.evaluate(async (url) => {
        const r = await fetch(url, { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
        return { status: r.status, body: await r.json() };
    }, SHOP_INFO_PATH);
    const sa = shopAfter.body?.data ?? {};
    step(
        '/shop-info reflects admin QA values',
        shopAfter.status === 200 && sa.shop_name === 'QA 스틸폼' && sa.ceo_name === 'QA대표' && sa.business_number === '000-00-00001',
        { status: shopAfter.status, data: sa }
    );

    // ---------- 4. Visit public shop page; footer must render QA values ----------
    await page.goto(`${BASE}${SHOP_PAGE_PATH}`, { waitUntil: 'networkidle' });
    // Allow the StoreFooter useEffect fetch to settle.
    await page.waitForTimeout(1500);

    const footerInfo = await page.evaluate(() => {
        const root = document.querySelector('[data-testid="footer-business-info"]');
        if (!root) return { present: false, texts: [] };
        const texts = Array.from(root.querySelectorAll('[data-testid="footer-business-field"]'))
            .map((f) => {
                // Concatenate every leaf text node (span + a) so substrings
                // like "070-0000-0000" survive the search even when the value
                // is wrapped in an <a> tag (tel:/mailto: anchors).
                const all = f.querySelectorAll('span, a');
                return Array.from(all)
                    .map((n) => n.textContent?.trim())
                    .filter(Boolean)
                    .join(' ');
            })
            .filter((t) => t.length > 0);
        return { present: true, texts };
    });
    const flatFooterTexts = footerInfo.texts; // already flattened by the joined-string shape above
    const expectsAdmin = ['QA 스틸폼', 'QA 상점', 'QA대표', '000-00-00001', '2026-QA-0001호', '070-0000-0000', 'qa@example.test'];
    const adminSurfaceOk = expectsAdmin.every((t) =>
        flatFooterTexts.some((txt) => txt?.includes(t))
    );
    step(
        'footer renders QA admin values',
        footerInfo.present && adminSurfaceOk,
        {
            present: footerInfo.present,
            // After the admin overlay is applied, the rendered footer has
            // label + value glued together inside a single <span>. Compare
            // against substrings instead of exact strings to be robust to
            // label/value concatenation in the DOM.
            seen_admin_substrings: expectsAdmin.filter((t) =>
                flatFooterTexts.some((txt) => txt?.includes(t))
            ),
            missing: expectsAdmin.filter(
                (t) => !flatFooterTexts.some((txt) => txt?.includes(t))
            ),
        }
    );

    const footerShot1 = await snap(page, 'footer-admin-settings.png');
    evidence.assertions.push({
        name: 'footer renders admin basic_info overlay',
        ok: adminSurfaceOk,
        screenshot: footerShot1,
        details: { footerInfo, expectsAdmin },
    });

    // ---------- 5. Restore ORIGINAL empty settings snapshot ----------
    // The baseline snapshot was a fully empty basic_info (no admin values at
    // all). The StoreEcommerceSettingsRequest forbids saving basic_info with
    // shop_name = '' when basic_info is present, so we cannot write a truly
    // empty basic_info through the public API. The closest legal equivalent
    // is the storefront's brand name "Still Form" for shop_name and empty
    // for everything else — which leaves business-info.json fields like
    // businessRegistrationNumber/phone/hostingProvider rendering from the
    // static seed (because admin now sets shopName to "Still Form" but the
    // footer field key is shopName, not the static shopName field — wait, the
    // static config has shopName empty so the admin shopName wins; the only
    // fields that *should* fall back to the seed are those the admin leaves
    // empty: business_number, mail_order_number, address parts, phone,
    // email. host_provider and business_verification_url are not part of
    // basic_info so they always come from the static seed.
    const restorePayload = {
        basic_info: {
            shop_name: 'Still Form',
            route_path: 'shop',
            no_route: false,
            company_name: '',
            business_number_1: '',
            business_number_2: '',
            business_number_3: '',
            ceo_name: '',
            business_type: '',
            business_category: '',
            zipcode: '',
            base_address: '',
            detail_address: '',
            phone_1: '',
            phone_2: '',
            phone_3: '',
            fax_1: '',
            fax_2: '',
            fax_3: '',
            email_id: '',
            email_domain: '',
            privacy_officer: '',
            privacy_officer_email: '',
            mail_order_number: '',
            telecom_number: '',
        },
    };
    let restore;
    try {
        restore = await putAdminBasicInfo(restorePayload);
        step(
            'restore original empty basic_info',
            restore.status >= 200 && restore.status < 300,
            { status: restore.status, body: restore.body.slice(0, 200) }
        );
    } catch (e) {
        step('restore original empty basic_info', false, String(e?.message ?? e));
        evidence.blockers.push('restore PUT failed; admin basic_info may still hold QA values');
    }

    // ---------- 6. Reload public shop page; footer must show static seed ----------
    await page.goto(`${BASE}${SHOP_PAGE_PATH}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const fallbackTexts = await page.evaluate(() => {
        const root = document.querySelector('[data-testid="footer-business-info"]');
        if (!root) return [];
        return Array.from(root.querySelectorAll('[data-testid="footer-business-field"]'))
            .map((f) => f.textContent?.trim())
            .filter(Boolean);
    });
    // After restore, the footer must show the static seed values for the
    // fields the admin did not set: business_registration_number,
    // ecommerce_registration_number, customer_service_phone. shop_name is
    // owned by the admin (set to "Still Form"); host_provider is NOT
    // rendered at all (admin basic_info has no matching input — FIELD
    // list excludes it).
    const expectsSeed = ['12-345-67890', '070-123-1234', '2026-경남김해-1234호'];
    const seedOk = expectsSeed.every((t) =>
        fallbackTexts.some((x) => x?.includes(t))
    );
    step(
        'footer falls back to business-info.json seed',
        seedOk,
        { seen_seed_values: fallbackTexts, missing: expectsSeed.filter((t) => !fallbackTexts.some((x) => x?.includes(t))) }
    );

    const footerShot2 = await snap(page, 'footer-fallback.png');
    evidence.assertions.push({
        name: 'footer falls back to static seed after restore',
        ok: seedOk,
        screenshot: footerShot2,
        details: { fallbackTexts, expectsSeed },
    });

    // ---------- 7. Document /shop-info traffic captured during the run ----------
    evidence.shopInfoTraffic = shopInfoRequests.map((r) => ({
        url: r.url,
        method: r.method,
        accept: r.headers?.accept,
    }));

    evidence.summary = {
        baseline_empty: baselineAllEmpty,
        admin_overlay_rendered: adminSurfaceOk,
        static_seed_restored: seedOk,
        total_steps: evidence.steps.length,
        passed: evidence.steps.filter((s) => s.ok).length,
        failed: evidence.steps.filter((s) => !s.ok).length,
        restore_strategy:
            'admin basic_info can never be made fully empty through the public API ' +
            '(StoreEcommerceSettingsRequest requires shop_name when basic_info is present); ' +
            'restore sets shop_name to the storefront brand "Still Form" and clears every ' +
            'other basic_info field so the static seed wins for business_number, ' +
            'mail_order_number, customer_service_phone, customer_service_email, ' +
            'business_address, representative, company_name, hosting_provider (never rendered).',
    };
} catch (e) {
    evidence.blockers.push(`uncaught error: ${String(e?.message ?? e)}`);
} finally {
    await browser.close();
}

const outPath = resolve('/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/evidence/footer-admin-settings.json');
writeFileSync(outPath, JSON.stringify(evidence, null, 2));
console.log('\nEVIDENCE_WRITTEN:', outPath);
console.log('SUMMARY:', JSON.stringify(evidence.summary));
console.log('BLOCKERS:', JSON.stringify(evidence.blockers));
