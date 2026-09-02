import { chromium } from 'playwright-core';
const BASE = 'http://127.0.0.1:8000';
const OUT = '/home/bahamut/20feet/_workspace/still-form/visual-qa/register-parity';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });

async function capture(vw, vh, name) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, locale: 'ko-KR' });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${OUT}/register-${name}.png`, fullPage: false });
    await page.screenshot({ path: `${OUT}/register-${name}-full.png`, fullPage: true });
    const diag = await page.evaluate(() => {
        const img = document.querySelector('.scm-auth-visual img');
        const fields = [...document.querySelectorAll('#registerForm input, #registerForm select')].map((i) => ({
            name: i.getAttribute('name'),
            type: i.getAttribute('type') ?? i.tagName.toLowerCase(),
            required: i.hasAttribute('required'),
        }));
        const visual = document.querySelector('.scm-auth-visual');
        const vs = visual ? getComputedStyle(visual) : null;
        return {
            overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            hasVisual: !!visual,
            imgLoaded: img ? (img.complete && img.naturalWidth > 0) : false,
            visualPosition: vs?.position ?? null,
            visualStickyTop: vs?.top ?? null,
            panelWidth: (() => { const p = document.querySelector('.scm-auth-panel-inner--register'); return p ? Math.round(p.getBoundingClientRect().width) : null; })(),
            formFields: fields,
            agreeTerms: !!document.querySelector('#auth_register_agree_terms'),
            agreePrivacy: !!document.querySelector('#auth_register_agree_privacy'),
            termsModalTrigger: !!document.querySelector('#auth_register_terms_modal_trigger'),
            privacyModalTrigger: !!document.querySelector('#auth_register_privacy_modal_trigger'),
            termsPageLink: document.querySelector('#auth_register_terms_link')?.getAttribute('href') ?? null,
            privacyPageLink: document.querySelector('#auth_register_privacy_link')?.getAttribute('href') ?? null,
            languageSelect: !!document.querySelector('#auth_register_language'),
            passwordHint: document.querySelector('#auth_register_password_hint')?.textContent?.trim() ?? null,
            submit: !!document.querySelector('#auth_register_submit'),
            loginLink: document.querySelector('#auth_register_login_link')?.getAttribute('href') ?? null,
            sectionLabels: [...document.querySelectorAll('[id^="auth_register_section"]')].map((e) => e.textContent?.trim()),
        };
    });
    console.log(`[${name}]`, JSON.stringify(diag, null, 1));
    await ctx.close();
}

await capture(1440, 900, 'desktop-1440');
await capture(430, 932, 'mobile-430');
await capture(390, 844, 'mobile-390');
await browser.close();