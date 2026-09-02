import { chromium } from 'playwright-core';
const BASE = 'http://127.0.0.1:8000';
const OUT = '/home/bahamut/20feet/_workspace/still-form/visual-qa/register-parity';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ko-KR' });
const page = await ctx.newPage();
const results = {};

const email = `qa_register_${Date.now()}@stillform-qa.test`;
const password = 'QaRegister!2026x';
const reg = {
    email,
    password,
    password_confirmation: password,
    name: 'QA 레지스터',
    nickname: `qa_register_${Date.now()}`,
    mobile: '010-9999-0001',
    phone: '02-999-0001',
};

async function fillForm({ withAgreements = true, mismatch = false } = {}) {
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.fill('#auth_register_email', reg.email);
    await page.fill('#auth_register_password', reg.password);
    await page.fill('#auth_register_password_confirm', mismatch ? reg.password + 'x' : reg.password);
    await page.fill('#auth_register_name', reg.name);
    await page.fill('#auth_register_nickname', reg.nickname);
    await page.fill('#auth_register_mobile', reg.mobile);
    await page.fill('#auth_register_phone', reg.phone);
    if (withAgreements) {
        await page.check('#auth_register_agree_terms');
        await page.check('#auth_register_agree_privacy');
    }
}

// 1. Terms modal — actual G7 CMS content
await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.click('#auth_register_terms_modal_trigger');
await page.waitForTimeout(2500);
results.termsModal = {
    visible: await page.isVisible('[role="dialog"]'),
    contentChars: (await page.textContent('[role="dialog"]').then((t) => (t || '').trim())).length,
    hasArticle1: (await page.textContent('[role="dialog"]').then((t) => (t || '').includes('제1조'))),
};
await page.screenshot({ path: `${OUT}/qa-terms-modal.png` });
await page.click('.scm-modal-close').catch(() => {});
await page.waitForTimeout(800);

// 2. Privacy modal
await page.click('#auth_register_privacy_modal_trigger');
await page.waitForTimeout(2500);
results.privacyModal = {
    visible: await page.isVisible('[role="dialog"]'),
    hasArticle1: (await page.textContent('[role="dialog"]').then((t) => (t || '').includes('제1조'))),
};
await page.screenshot({ path: `${OUT}/qa-privacy-modal.png` });
await page.click('.scm-modal-close').catch(() => {});
await page.waitForTimeout(800);

// 3. Policy page links target real pages
results.policyPageLinks = {
    terms: await (async () => {
        const href = await page.getAttribute('#auth_register_terms_link', 'href');
        const res = await page.request.get(BASE + href);
        return { href, status: res.status() };
    })(),
    privacy: await (async () => {
        const href = await page.getAttribute('#auth_register_privacy_link', 'href');
        const res = await page.request.get(BASE + href);
        return { href, status: res.status() };
    })(),
};

// 4. Empty submit blocked by client validation
await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.click('#auth_register_submit');
await page.waitForTimeout(600);
results.emptySubmit = {
    stayedOnRegister: page.url().includes('/register'),
    firstInvalid: await page.evaluate(() => document.querySelector('input:invalid')?.getAttribute('name') ?? null),
};

// 5. Password mismatch client span
await fillForm({ mismatch: true, withAgreements: true });
results.passwordMismatch = {
    spanVisible: await page.evaluate(() => {
        const spans = [...document.querySelectorAll('#auth_register_password_confirm_field span')];
        const last = spans[spans.length - 1];
        return last ? last.textContent.includes('일치') : false;
    }),
};
await page.screenshot({ path: `${OUT}/qa-register-validation.png` });

// 6. Missing agreements — client required blocks UI submit
await fillForm({ withAgreements: false });
await page.click('#auth_register_submit');
await page.waitForTimeout(800);
results.missingAgreements = {
    stayedOnRegister: page.url().includes('/register'),
    firstInvalid: await page.evaluate(() => document.querySelector('input:invalid')?.getAttribute('name') ?? null),
};

// 7. AGREE-SEC-001/002 — server rejects tampered direct API calls without each agreement
async function tamperTest(key) {
    const payload = { ...reg };
    delete payload[key];
    const res = await page.request.post(`${BASE}/api/auth/register`, {
        headers: { Accept: 'application/json' },
        data: payload,
    });
    let body = null;
    try { body = await res.json(); } catch (e) {}
    return {
        status: res.status(),
        agreeError: body?.errors?.[key]?.[0] ?? body?.message ?? null,
    };
}
results.AGREE_SEC_001_terms = await tamperTest('agree_terms');
results.AGREE_SEC_002_privacy = await tamperTest('agree_privacy');

// 8. CSRF-less direct POST (no cookies/session) — record server behavior
{
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p2 = await ctx2.newPage();
    const res = await p2.request.post(`${BASE}/api/auth/register`, {
        headers: { Accept: 'application/json' },
        data: reg,
    });
    results.csrfLessRegister = { status: res.status() };
    await ctx2.close();
}

// 9. Short password — server policy (min 8)
{
    const payload = { ...reg, password: 'Qa1!', password_confirmation: 'Qa1!', email: `qa_short_${Date.now()}@stillform-qa.test` };
    const res = await page.request.post(`${BASE}/api/auth/register`, {
        headers: { Accept: 'application/json' },
        data: payload,
    });
    let body = null;
    try { body = await res.json(); } catch (e) {}
    results.shortPassword = { status: res.status(), message: body?.errors?.password?.[0] ?? body?.message ?? null };
}

// 10. Successful registration via UI (QA_REGISTER_ prefix user)
await fillForm({ withAgreements: true });
await page.click('#auth_register_submit');
await page.waitForTimeout(4000);
results.successfulRegistration = {
    finalUrl: page.url(),
    navigatedToLogin: page.url().includes('/login'),
    toast: (await page.textContent('body').then((b) => (b || '').includes('회원가입이 완료되었습니다'))),
};
await page.screenshot({ path: `${OUT}/qa-register-success.png` });

// 11. Duplicate email — server unique rejection
{
    const dup = { ...reg, email: reg.email };
    const res = await page.request.post(`${BASE}/api/auth/register`, {
        headers: { Accept: 'application/json' },
        data: dup,
    });
    let body = null;
    try { body = await res.json(); } catch (e) {}
    results.duplicateEmail = { status: res.status(), message: body?.errors?.email?.[0] ?? body?.message ?? null };
}

// 12. Login link from register page
await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.click('#auth_register_login_link');
await page.waitForTimeout(1500);
results.loginLink = { url: page.url(), hasLoginForm: await page.isVisible('#auth_login_email').catch(() => false) };

console.log(JSON.stringify(results, null, 1));
await browser.close();