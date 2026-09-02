import { chromium } from 'playwright-core';

const BASE = 'http://127.0.0.1:8000';
const OUT = '/home/bahamut/20feet/_workspace/copy-remediation/screenshots';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });

const PAGES = [
    ['home', '/', ['Still Form이 고르는 기준', '매일 손이 가는 물건들', 'Still Form의 모든 상품', '전체 상품 보기', '생활 가까이에서 쓰는 물건을 모은 온라인 스토어입니다']],
    ['shop', '/shop', ['CATEGORIES', '카테고리']],
    ['story', '/shop/story', ['Still Form은 생활 가까이에서 쓰는 물건을 다룹니다.', '재질과 형태, 실제 쓰임을 기준으로 상품을 고릅니다.']],
    ['notice', '/shop/notices', []],
    ['product', '/shop/products/STLMUG0001AB12CD', ['함께 보면 좋은 상품', 'RELATED', '장바구니 담기', '상품 금액']],
    ['cart', '/cart', ['장바구니', 'CART']],
    ['checkout', '/shop/checkout', []],
    ['login', '/login', ['로그인', '회원가입']],
    ['register', '/register', ['회원가입', '이미 회원이신가요?']],
    ['forgot', '/forgot-password', ['비밀번호 찾기', '재설정 링크 보내기']],
    ['reset-invalid', '/reset-password?token=invalid-test', ['비밀번호 재설정']],
    ['guest-order', '/shop/guest/orders', ['비회원 주문 조회', '조회 비밀번호']],
    ['terms', '/shop/terms', ['이용약관']],
    ['privacy', '/shop/privacy', ['개인정보처리방침']],
    ['shipping', '/shop/shipping-policy', ['배송·교환·반품 안내']],
];

const results = [];
for (const [name, path, expects] of PAGES) {
    for (const [tag, vw, vh] of [['desktop-1440', 1440, 900], ['mobile-390', 390, 844]]) {
        const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, locale: 'ko-KR' });
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(String(e)));
        try {
            await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForTimeout(1500);
            await page.screenshot({ path: `${OUT}/${name}-${tag}.png`, fullPage: true });
            const body = await page.evaluate(() => document.body.innerText);
            const missing = expects.filter((t) => !body.includes(t));
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
            results.push({ name, tag, ok: missing.length === 0 && errors.length === 0, missing, errors, overflow });
        } catch (e) {
            results.push({ name, tag, ok: false, missing: [], errors: [String(e)], overflow: -1 });
        }
        await ctx.close();
    }
}
await browser.close();
for (const r of results) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name} ${r.tag}${r.overflow > 0 ? ` overflowX=${r.overflow}` : ''}${r.missing.length ? ` missing=${JSON.stringify(r.missing)}` : ''}${r.errors.length ? ` errors=${r.errors[0].slice(0, 80)}` : ''}`);
}