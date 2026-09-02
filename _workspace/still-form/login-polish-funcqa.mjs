import { chromium } from 'playwright-core';
import { readFileSync } from 'fs';
const BASE = 'http://127.0.0.1:8000';
const OUT = '/home/bahamut/20feet/_workspace/still-form/visual-qa/login-polish';
const creds = JSON.parse(readFileSync('/tmp/qa-creds.json', 'utf8'));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ko-KR' });
const page = await ctx.newPage();
const results = {};

// 1. Invalid login
await page.goto(`${BASE}/login?redirect=%2Fshop%2Fproducts%2FSTLBOOK000008XY`, { waitUntil: 'networkidle' });
await page.fill('#auth_login_email', 'wrong@stillform.test');
await page.fill('#auth_login_password', 'WrongPass123!');
await page.click('#auth_login_submit');
await page.waitForTimeout(2500);
results.invalidLogin = {
    errorVisible: await page.isVisible('#auth_login_error'),
    errorText: (await page.textContent('#auth_login_error p').catch(() => null))?.trim(),
    stillOnLogin: page.url().includes('/login'),
};
await page.screenshot({ path: `${OUT}/qa-invalid-login.png` });

// 2. Keyboard: tab order from email field
await page.goto(`${BASE}/login?redirect=%2Fshop%2Fproducts%2FSTLBOOK000008XY`, { waitUntil: 'networkidle' });
const tabOrder = [];
await page.focus('#auth_login_email');
for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    const active = await page.evaluate(() => ({
        id: document.activeElement?.id || null,
        tag: document.activeElement?.tagName,
        text: (document.activeElement?.textContent || '').trim().slice(0, 20),
    }));
    tabOrder.push;
    tabOrder.push(active.id || `${active.tag}:${active.text}`);
}
results.tabOrder = tabOrder;

// 3. Valid login + redirect preservation
await page.fill('#auth_login_email', creds.memberId);
await page.fill('#auth_login_password', creds.memberPw);
await page.click('#auth_login_submit');
await page.waitForTimeout(4000);
results.validLogin = {
    finalUrl: page.url(),
    redirectWorked: page.url().includes('/shop/products/'),
    toast: (await page.textContent('body').then(b => (b || '').includes('로그인되었습니다'))),
};
await page.screenshot({ path: `${OUT}/qa-redirect-success.png` });

// logged-in header state
results.loggedInHeader = await page.evaluate(() => {
    const nav = document.querySelector('.scm-header-nav');
    return (nav?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
});

// 4. Logged-in /login guest_only redirect
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
results.guestOnlyRedirect = { finalUrl: page.url() };

// 5. Logout then check links on login page
await page.evaluate(() => { try { localStorage.removeItem('cartKey'); } catch (e) {} });
// find logout in header
const logoutSel = await page.evaluate(() => {
    const links = [...document.querySelectorAll('.scm-header-nav a, .scm-header-nav button')];
    const lo = links.find(el => /로그아웃/.test(el.textContent || ''));
    if (lo) { lo.click(); return true; }
    return false;
});
await page.waitForTimeout(2500);
results.logoutClicked = logoutSel;
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
results.loginLinks = await page.evaluate(() => ({
    forgotHref: document.querySelector('#auth_login_forgot_link')?.getAttribute('href') ?? null,
    registerHref: document.querySelector('#auth_login_register_link')?.getAttribute('href') ?? null,
}));

// 6. forgot-password page reachable
await page.click('#auth_login_forgot_link');
await page.waitForTimeout(2000);
results.forgotPage = { url: page.url(), hasEmailField: await page.isVisible('input[type="email"]') };
await page.screenshot({ path: `${OUT}/qa-forgot-page.png` });

// 7. register page reachable
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.click('#auth_login_register_link');
await page.waitForTimeout(2000);
results.registerPage = { url: page.url(), hasForm: await page.isVisible('form') };

console.log(JSON.stringify(results, null, 1));
await browser.close();