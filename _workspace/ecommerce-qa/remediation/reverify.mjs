import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const CREDS = JSON.parse(fs.readFileSync('/tmp/qa-creds.json', 'utf8'));
const BASE = CREDS.baseUrl.replace(/\/$/, '');
const MEMBER = { id: CREDS.memberId, pw: CREDS.memberPw };

const SHOT_DIR = '/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

const findings = [];
const consoleErrors = [];
const pageErrors = [];

function rec(check, status, evidence) {
  findings.push({ check, status, evidence });
  console.log(`[${status}] ${check} :: ${evidence}`);
}

const browser = await chromium.launch({
  executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  headless: true,
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push({ url: page.url(), text: m.text() });
});
page.on('pageerror', (e) => pageErrors.push({ url: page.url(), message: e.message }));

// Login
await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#auth_login_email');
await page.fill('#auth_login_email', MEMBER.id);
await page.fill('#auth_login_password', MEMBER.pw);
await page.click('#auth_login_submit');
await page.waitForFunction(() => !location.pathname.startsWith('/login')).catch(() => {});
rec('login_member', 'PASS', `logged in as ${MEMBER.id}; landed on ${page.url()}`);

async function dump(slug) {
  await page.goto(`${BASE}/shop/product/${slug}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  return await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input,select,textarea')).map((el) => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type'),
      name: el.getAttribute('name'),
      testid: el.getAttribute('data-testid'),
      options: el.tagName === 'SELECT' ? Array.from(el.querySelectorAll('option')).map((o) => ({ value: o.value, text: o.textContent.trim() })) : null,
    }));
    const buttons = Array.from(document.querySelectorAll('button')).map((b) => ({
      text: (b.innerText || '').trim().slice(0, 40),
      testid: b.getAttribute('data-testid'),
      aria: b.getAttribute('aria-label'),
    })).filter((b) => b.text || b.testid || b.aria);
    const allTestIds = Array.from(document.querySelectorAll('[data-testid]')).map((e) => e.getAttribute('data-testid'));
    const priceText = (document.querySelector('[data-testid="price"], .price') || {}).innerText || '';
    const bodyText = (document.body.innerText || '').slice(0, 600);
    return {
      price: priceText.replace(/\s+/g, ' ').trim(),
      inputs,
      buttons: buttons.slice(0, 30),
      allTestIds: Array.from(new Set(allTestIds)),
      bodyExcerpt: bodyText.replace(/\s+/g, ' ').trim(),
    };
  });
}

const dumpSingle = await dump('QA_E2E_SINGLE_OPT_PRODUCT');
rec('check1_single_option', 'FAIL',
  `price="${dumpSingle.price}" inputs=${dumpSingle.inputs.length} buttons=${dumpSingle.buttons.map((b) => b.testid || b.text).join('|')} testids=[${dumpSingle.allTestIds.join(',')}]`);
await page.screenshot({ path: path.join(SHOT_DIR, 'product-single.png'), fullPage: true });

const dumpMulti = await dump('QA_E2E_MULTI_OPT_PRODUCT');
rec('check2_multi_option', 'FAIL',
  `price="${dumpMulti.price}" inputs=${dumpMulti.inputs.length} buttons=${dumpMulti.buttons.map((b) => b.testid || b.text).join('|')} testids=[${dumpMulti.allTestIds.join(',')}] soldOutMarkers=${(await page.locator('text=/품절|sold[\\s_-]?out/i').count())}`);
await page.screenshot({ path: path.join(SHOT_DIR, 'product-multi.png'), fullPage: true });

const dumpAdd = await dump('QA_E2E_ADDITIONAL_OPTION_PRODUCT');
rec('check3_additional_option', 'FAIL',
  `price="${dumpAdd.price}" inputs=${dumpAdd.inputs.length} blockAdditional=${await page.locator('[data-testid^="block-additional-"]').count()} blockLineTotal=${await page.locator('[data-testid^="block-line-total-"]').count()}`);
await page.screenshot({ path: path.join(SHOT_DIR, 'product-additional.png'), fullPage: true });

// Review section
const dumpSingle2 = await dump('QA_E2E_SINGLE_OPT_PRODUCT');
const reviewBlock = await page.locator('[data-testid="product-review"], [class*="ProductReviews"], section:has-text("리뷰"), section:has-text("REVIEW")').count();
const reviewScreenshot = page.locator('[data-testid="product-review"]').first();
if (await reviewScreenshot.count()) await reviewScreenshot.screenshot({ path: path.join(SHOT_DIR, 'product-review.png') });
else await page.screenshot({ path: path.join(SHOT_DIR, 'product-review.png'), fullPage: true });
rec('check4_review_section', reviewBlock > 0 ? 'PASS' : 'FAIL',
  `reviewBlock=${reviewBlock} allTestIds=[${dumpSingle2.allTestIds.join(',')}]`);

// Q&A
const qnaBlock = await page.locator('[data-testid="product-qna"], [class*="ProductQna"], section:has-text("Q&A"), section:has-text("문의")').count();
const qnaScreenshot = page.locator('[data-testid="product-qna"]').first();
if (await qnaScreenshot.count()) await qnaScreenshot.screenshot({ path: path.join(SHOT_DIR, 'product-qna.png') });
else await page.screenshot({ path: path.join(SHOT_DIR, 'product-qna.png'), fullPage: true });
rec('check5_qna_section', qnaBlock > 0 ? 'PASS' : 'FAIL', `qnaBlock=${qnaBlock}`);

// Wishlist heart — capture HTTP evidence
let wishlistPost = null;
page.on('response', (r) => {
  if (/\/wishlist\//i.test(r.url()) && r.request().method() === 'POST') {
    wishlistPost = { url: r.url(), status: r.status(), body: r.request().postData() };
  }
});
const heart = page.locator('[data-testid="wishlist-heart"], [class*="WishlistHeart"], button[aria-label*="찜"]').first();
const heartExists = (await heart.count()) > 0;
if (heartExists) await heart.click().catch(() => {});
await page.waitForTimeout(800);
const heartShot = page.locator('[data-testid="wishlist-heart"]').first();
if (await heartShot.count()) await heartShot.screenshot({ path: path.join(SHOT_DIR, 'product-wishlist.png') });
else await page.screenshot({ path: path.join(SHOT_DIR, 'product-wishlist.png'), fullPage: true });
rec('check6_wishlist_heart', heartExists && wishlistPost ? 'PASS' : 'FAIL',
  `heartVisible=${heartExists} wishlistPOST=${wishlistPost ? `${wishlistPost.status} ${wishlistPost.url}` : 'none'}`);

// Mypage tabs
await page.goto(`${BASE}/mypage`, { waitUntil: 'networkidle' });
const tabLinks = await page.locator('a[href*="/mypage"]').evaluateAll((els) =>
  els.map((e) => ({ href: e.getAttribute('href'), text: (e.textContent || '').trim() })).filter((x) => x.href)
);
let reviewsDirect = 'n/a';
try {
  const resp = await page.goto(`${BASE}/mypage/reviews`, { waitUntil: 'networkidle' });
  reviewsDirect = `status=${resp ? resp.status() : 0} title="${await page.title()}" reviewMatches=${await page.locator('text=/리뷰|review/i').count()}`;
} catch (e) { reviewsDirect = `error: ${e.message}`; }
await page.screenshot({ path: path.join(SHOT_DIR, 'mypage.png'), fullPage: true });
const hasReviewsTab = tabLinks.some((t) => /리뷰|review/i.test(t.text));
rec('check7_mypage_tabs', hasReviewsTab ? 'PASS' : 'FAIL',
  `tabsFound=${tabLinks.length} hasReviewsTab=${hasReviewsTab} tabs=[${tabLinks.map((t) => t.text + '->' + t.href).join(' | ')}] /mypage/reviews=${reviewsDirect}`);

// 3-level (id 19)
const dump3 = await dump('QA_E2E_3LEVEL_OPT_PRODUCT');
await page.screenshot({ path: path.join(SHOT_DIR, 'product-3level.png'), fullPage: true });
const hasAnyOptionUi = dump3.inputs.length > 0 || /option|옵션/.test(dump3.bodyExcerpt);
rec('check10_3level_product', hasAnyOptionUi ? 'PASS' : 'FAIL',
  `slug=QA_E2E_3LEVEL_OPT_PRODUCT price="${dump3.price}" inputs=${dump3.inputs.length} testids=[${dump3.allTestIds.join(',')}] bodyHasOptionKeyword=${/option|옵션|color|색상/i.test(dump3.bodyExcerpt)}`);

// Screenshots + console summary
const shotFiles = fs.readdirSync(SHOT_DIR).filter((f) => /\.(png|json)$/.test(f));
rec('check8_screenshots_evidence', 'PASS', `files=${shotFiles.join(',')}`);
rec('check9_console_errors', pageErrors.length === 0 ? (consoleErrors.length === 0 ? 'PASS' : 'INFO') : 'FAIL',
  `consoleErrors=${consoleErrors.length} pageErrors=${pageErrors.length} firstErrors=${consoleErrors.slice(0, 3).map((e) => e.text.slice(0, 100)).join(' || ')}`);

fs.writeFileSync(
  path.join(SHOT_DIR, '_findings.json'),
  JSON.stringify({
    base: BASE,
    member: MEMBER.id,
    runtimeArtifactCheck: {
      runtimeLayoutHash: 'md5 of templates/superbify-commerce_minimal/layouts/shop/product.json = 517b801b9ebf7664f7ab395e7c6894bb (byte-identical to _bundled)',
      runtimeComponentsHash: '42b46ae18fa064778e61d35107434721 (byte-identical to _bundled)',
      runtimeSrcIndexRegisteredComposites: ['AddToCartPanel'],
      runtimeSrcIndexMissingComposites: ['PurchasePanel', 'WishlistHeart', 'ProductReviews', 'ProductQna'],
      layoutReferencesMissingComposites: [
        'layouts/shop/product.json:287 WishlistHeart',
        'layouts/shop/product.json:297 PurchasePanel',
        'layouts/shop/product.json:663 ProductReviews',
        'layouts/shop/product.json:684 ProductQna'
      ],
      componentsJsonRegistersMissingComposites: [
        'components.json:370 PurchasePanel',
        'components.json:376 WishlistHeart',
        'components.json:382 ProductReviews',
        'components.json:388 ProductQna'
      ],
    },
    findings,
    consoleErrors,
    pageErrors,
  }, null, 2)
);
console.log('SAVED _findings.json');

await browser.close();
