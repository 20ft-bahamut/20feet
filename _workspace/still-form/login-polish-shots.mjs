import { chromium } from 'playwright-core';
const BASE = 'http://127.0.0.1:8000';
const OUT = '/home/bahamut/20feet/_workspace/still-form/visual-qa/login-polish';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });

async function capture(vw, vh, name) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, locale: 'ko-KR' });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/login?redirect=%2Fshop%2Fproducts%2FSTLBOOK000008XY`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${OUT}/login-${name}.png`, fullPage: false });
    await page.screenshot({ path: `${OUT}/login-${name}-full.png`, fullPage: true });
    const diag = await page.evaluate(() => {
        const img = document.querySelector('.scm-auth-visual img');
        return {
            overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            hasVisual: !!document.querySelector('.scm-auth-visual'),
            imgLoaded: img ? (img.complete && img.naturalWidth > 0) : false,
            imgSrc: img?.getAttribute('src') ?? null,
            hasLabel: !!document.querySelector('.scm-auth-visual-label'),
            h1: document.querySelector('h1')?.textContent?.trim() ?? null,
            formFields: [...document.querySelectorAll('#auth_login_form input')].map((i) => ({
                id: i.id, type: i.type, h: Math.round(i.getBoundingClientRect().height),
            })),
            submit: (() => { const b = document.querySelector('#auth_login_submit'); return b ? Math.round(b.getBoundingClientRect().height) : null; })(),
            visualBox: (() => { const v = document.querySelector('.scm-auth-visual'); if (!v) return null; const r = v.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })(),
            forgot: !!document.querySelector('#auth_login_forgot_link'),
            register: !!document.querySelector('#auth_login_register_link'),
            focusRingTest: (() => {
                const i = document.querySelector('#auth_login_email');
                i.focus();
                const s = getComputedStyle(i).boxShadow;
                return s !== 'none' ? s.slice(0, 60) : 'none';
            })(),
            headerAlign: (() => {
                const header = document.querySelector('.scm-header-bar');
                const shell = document.querySelector('.scm-auth-shell');
                if (!header || !shell) return null;
                return {
                    headerLeft: Math.round(header.getBoundingClientRect().left),
                    shellLeft: Math.round(shell.getBoundingClientRect().left),
                };
            })(),
        };
    });
    console.log(`[${name}]`, JSON.stringify(diag));
    await ctx.close();
}

await capture(1440, 900, 'desktop-1440');
await capture(430, 932, 'mobile-430');
await capture(390, 844, 'mobile-390');
await browser.close();