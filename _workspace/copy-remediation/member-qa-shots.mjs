import { chromium } from 'playwright-core';

const BASE = 'http://127.0.0.1:8000';
const OUT = '/home/bahamut/20feet/_workspace/copy-remediation/screenshots';
const PW = 'CopyQa1234!';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ko-KR' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

const EMAIL = `copyqa-${Date.now()}@test.local`;
async function register(page) {
    await page.goto(`${BASE}/register`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.fill('#auth_register_email', EMAIL);
    await page.fill('#auth_register_password', PW);
    await page.fill('#auth_register_password_confirm', PW);
    await page.fill('#auth_register_name', '카피QA');
    const boxes = page.locator('input[type=checkbox]');
    const n = await boxes.count();
    for (let i = 0; i < n; i++) await boxes.nth(i).check().catch(() => {});
    await page.click('#auth_register_submit');
    await page.waitForTimeout(2500);
    return page.url();
}
async function ensureLogin(p) {
    await p.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await p.fill('#auth_login_email', EMAIL);
    await p.fill('#auth_login_password', PW);
    await p.click('#auth_login_submit');
    await p.waitForTimeout(2000);
    return p.url();
}
const regUrl = await register(page);
console.log('after register:', regUrl);
console.log('after login:', await ensureLogin(page));

const results = [];
const shots = [
    ['mypage', '/mypage', ['프로필', '주문 내역']],
    ['mypage-orders', '/mypage/orders', ['주문 내역이 없습니다', '주문 내역']],
    ['mypage-addresses', '/mypage/addresses', ['배송지 관리', '배송지 추가']],
    ['mypage-coupons', '/mypage/coupons', ['쿠폰']],
    ['mypage-mileage', '/mypage/mileage', ['마일리지']],
    ['mypage-inquiries', '/mypage/inquiries', ['상품 문의']],
    ['mypage-password', '/mypage/password', ['비밀번호 변경', '현재 비밀번호']],
];
for (const [name, path, expects] of shots) {
    try {
        await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2500);
        await page.screenshot({ path: `${OUT}/${name}-desktop-1440.png`, fullPage: true });
        const body = await page.evaluate(() => document.body.innerText);
        const missing = expects.filter((t) => !body.includes(t));
        results.push({ name, ok: missing.length === 0 && errors.length === 0, missing, url: page.url() });
    } catch (e) {
        results.push({ name, ok: false, missing: [String(e).slice(0, 80)], url: path });
    }
}
await browser.close();
console.log('EMAIL:', EMAIL);
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}${r.missing.length ? ` missing=${JSON.stringify(r.missing)}` : ''} ${r.url}`);