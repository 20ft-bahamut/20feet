import { chromium } from 'playwright-core';
const BASE = 'http://127.0.0.1:8000';
const OUT = '/home/bahamut/20feet/_workspace/copy-remediation/screenshots/mobile-final';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });

// 43. overflow + screenshots at required widths
const results = [];
for (const w of [360, 390, 430, 768, 1024, 1440]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, locale: 'ko-KR' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 100)));
    await page.goto(`${BASE}/shop/products/STLMUG0001AB12CD`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3200);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const checks = await page.evaluate(() => {
        const img = document.querySelector('[data-testid="product-gallery"] img') || document.querySelector('[data-testid="product-gallery"]');
        const h1 = document.querySelector('h1');
        const qty = document.querySelector('[data-testid="add-to-cart-panel"]');
        return {
            imgW: img ? Math.round(img.getBoundingClientRect().width) : null,
            innerW: window.innerWidth,
            qtyVisible: !!qty,
        };
    });
    const name = w >= 1024 ? 'desktop' : w === 768 ? 'tablet' : 'mobile';
    await page.screenshot({ path: `${OUT}/product-${name}-${w}.png`, fullPage: true });
    results.push({ w, ov, checks, errors });
    await ctx.close();
}

// menu open + functional QA at 390
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, locale: 'ko-KR' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 100)));
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await page.waitForSelector('[data-testid="header-menu-toggle"]', { state: 'visible', timeout: 20000 });
for (let i = 0; i < 5; i++) {
    await page.click('[data-testid="header-menu-toggle"]').catch(() => {});
    await page.waitForTimeout(400);
    const disp = await page.evaluate(() => getComputedStyle(document.querySelector('.scm-header-nav')).display).catch(() => 'none');
    if (disp === 'flex') break;
}
const menuVisible = await page.evaluate(() => getComputedStyle(document.querySelector('.scm-header-nav')).display);
console.log('menuVisible:', menuVisible);
await page.screenshot({ path: `${OUT}/menu-open-390.png` });
// navigate via menu
await page.click('[data-testid="nav-cart"]');
await page.waitForTimeout(1500);
const menuNavUrl = page.url();

// product functional QA at 390
await page.goto(`${BASE}/shop/products/STLMUG0001AB12CD`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3200);
const func = {};
// quantity +/-
const qm = page.locator('[data-testid="add-to-cart-panel"] button', { hasText: '−' }).first();
const qp = page.locator('[data-testid="add-to-cart-panel"] button', { hasText: '+' }).first();
const qtyInput = page.locator('[data-testid="add-to-cart-panel"] input').first();
if (await qtyInput.count()) {
    const before = await qtyInput.inputValue();
    if (await qp.count()) { await qp.click(); await page.waitForTimeout(300); }
    func.qtyPlus = await qtyInput.inputValue() === String(Number(before) + 1);
    if (await qm.count()) { await qm.click(); await page.waitForTimeout(300); }
    func.qtyMinus = await qtyInput.inputValue() === before;
} else { func.qty = 'no-input-found'; }
// add to cart
await page.click('[data-testid="add-to-cart"]');
await page.waitForTimeout(1500);
func.addToCart = true;
// buy now
await page.click('[data-testid="buy-now"]');
await page.waitForTimeout(2000);
func.buyNowUrl = page.url();
// wishlist (logged out → likely prompts login)
await page.goto(`${BASE}/shop/products/STLMUG0001AB12CD`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
const wish = page.locator('[data-testid="wishlist-heart"], button[aria-label*="찜"], button[aria-label*="Wishlist"]').first();
func.wishlistPresent = await wish.count() > 0;
// coupon badge
func.coupon = await page.evaluate(() => document.body.innerText.includes('할인') && document.body.innerText.includes('쿠폰'));
// review / qna sections present
const sec = await page.evaluate(() => ({
    review: document.body.innerText.includes('이 상품 리뷰'),
    qna: document.body.innerText.includes('상품 Q&A'),
}));
func.review = sec.review; func.qna = sec.qna;
await page.screenshot({ path: `${OUT}/product-functional-390.png`, fullPage: true });

// story + footer final
await page.goto(`${BASE}/shop/story`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/story-390.png`, fullPage: true });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/footer-390.png` });

await browser.close();
console.log('---WIDTHS---');
for (const r of results) console.log(`${r.w}px overflow=${ov(r)} imgW=${r.checks.imgW} errors=${r.errors.length}`);
function ov(r) { return r.ov; }
console.log('---FUNCTIONAL---');
console.log(JSON.stringify({ menuNavUrl, ...func }, null, 1));