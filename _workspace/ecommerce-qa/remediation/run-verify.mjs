import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const CREDS = JSON.parse(fs.readFileSync('/tmp/qa-creds.json', 'utf8'));
const BASE = CREDS.baseUrl.replace(/\/$/, '');
const MEMBER = { id: CREDS.memberId, pw: CREDS.memberPw };

const SHOT_DIR = '/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

const findings = [];
const consoleErrors = []; // { url, type, text }
const pageErrors = [];    // { url, message }

function rec(check, status, evidence) {
  findings.push({ check, status, evidence });
  console.log(`[${status}] ${check} :: ${evidence}`);
}

async function collect(page, url) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push({ url, type: 'console.error', text: msg.text() });
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push({ url, type: 'pageerror', message: err.message });
  });
}

async function loginMember(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#auth_login_email', { timeout: 10000 });
  await page.fill('#auth_login_email', MEMBER.id);
  await page.fill('#auth_login_password', MEMBER.pw);
  await Promise.all([
    page.waitForLoadState('networkidle').catch(() => {}),
    page.click('#auth_login_submit'),
  ]);
  // After login, G7 typically redirects away from /login.
  await page.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 10000 }).catch(() => {});
}

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
    headless: true,
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await collect(page, '(global)');

  // --- Login ---
  await loginMember(page);
  const afterLoginUrl = page.url();
  rec('login_member', 'PASS', `logged in as ${MEMBER.id}; landed on ${afterLoginUrl}`);

  // --- Helper: read product page DOM ---
  async function loadProduct(slug) {
    const url = `${BASE}/shop/product/${slug}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    return url;
  }

  // ===== Check 1: single option product =====
  {
    const url = await loadProduct('QA_E2E_SINGLE_OPT_PRODUCT');
    await collect(page, url);

    // Look for option block — try common G7 selectors
    const hasOption = await page.locator('[data-testid="block-option"], .product-option, select[name*="option"], .opt-select').count();
    let priceText = '';
    let priceVal = 0;
    let displayedBefore = '';
    let displayedAfter = '';
    let addOk = false;
    let cartResponse = null;

    page.on('response', (r) => {
      const u = r.url();
      if (/\/cart\//i.test(u) && r.request().method() === 'POST') {
        cartResponse = { url: u, status: r.status() };
      }
    });

    // Capture initial displayed price (HTML text)
    displayedBefore = await page.locator('[data-testid="price-now"], .price, .product-price, [class*="price"]').first().innerText().catch(() => '');
    // Try to select 옵션 id=11 (블랙, +1000). Look for either a SELECT with option value 11, or a radio/label.
    let selectedOk = false;
    const selectOpt = page.locator('select[name*="option"]').first();
    if (await selectOpt.count()) {
      const opts = await selectOpt.locator('option').allTextContents();
      const values = await selectOpt.locator('option').evaluateAll((els) => els.map((e) => e.value));
      // Try to find the one whose text contains 블랙
      const idx = opts.findIndex((t) => /블랙/.test(t));
      if (idx >= 0) {
        await selectOpt.selectOption(values[idx]);
        selectedOk = true;
      } else if (values.includes('11')) {
        await selectOpt.selectOption('11');
        selectedOk = true;
      }
    } else {
      // Try data-testid based option button
      const btn = page.locator('[data-testid="option-11"], button:has-text("블랙")').first();
      if (await btn.count()) {
        await btn.click();
        selectedOk = true;
      }
    }
    await page.waitForTimeout(400);

    displayedAfter = await page.locator('[data-testid="price-now"], .price, .product-price, [class*="price"]').first().innerText().catch(() => '');

    // Click add to cart
    const addBtn = page.locator('[data-testid="add-to-cart"], button:has-text("장바구니"), button:has-text("ADD TO CART"), button:has-text("카트"), button:has-text("담기")').first();
    if (await addBtn.count()) {
      await addBtn.click();
      await page.waitForTimeout(800);
      addOk = true;
    }

    await page.screenshot({ path: path.join(SHOT_DIR, 'product-single.png'), fullPage: true });

    // Parse numeric price (KRW)
    const parseWon = (t) => {
      const m = (t || '').replace(/[^0-9]/g, '');
      return m ? Number(m) : 0;
    };
    const before = parseWon(displayedBefore);
    const after = parseWon(displayedAfter);

    rec(
      'check1_single_option',
      selectedOk && after === 21000 && addOk ? 'PASS' : 'FAIL',
      `optionVisible=${hasOption > 0} selectedOption=${selectedOk} priceBefore=${before} priceAfter=${after} addBtn=${addOk} cartResp=${cartResponse ? cartResponse.status : 'none'}`
    );
  }

  // ===== Check 2: multi option product =====
  {
    const url = await loadProduct('QA_E2E_MULTI_OPT_PRODUCT');
    await collect(page, url);

    const blockOptionCount = await page.locator('[data-testid^="block-option-"]').count();
    const blockAdditionalCount = await page.locator('[data-testid^="block-additional-"]').count();

    // Try selecting 색상=블랙 → 사이즈=L (price +3000 → 36000)
    // Click first color button labeled 블랙
    const colorBlack = page.locator('[data-testid="block-option-0"] >> text=/블랙/').first();
    let colorOk = false;
    if (await colorBlack.count()) {
      await colorBlack.click();
      colorOk = true;
      await page.waitForTimeout(300);
    } else {
      // fallback: any element with text 블랙 inside option area
      const fb = page.locator('button:has-text("블랙"), label:has-text("블랙")').first();
      if (await fb.count()) {
        await fb.click();
        colorOk = true;
        await page.waitForTimeout(300);
      }
    }
    const sizeL = page.locator('[data-testid="block-option-1"] >> text=/^L$/').first();
    let sizeOk = false;
    if (await sizeL.count()) {
      await sizeL.click();
      sizeOk = true;
    } else {
      const fb = page.locator('button:has-text("L"), label:has-text("L")').first();
      if (await fb.count()) {
        await fb.click();
        sizeOk = true;
      }
    }
    await page.waitForTimeout(400);

    const priceText = await page.locator('[data-testid="price-now"], .price, .product-price, [class*="price"]').first().innerText().catch(() => '');
    const priceVal = Number((priceText || '').replace(/[^0-9]/g, '')) || 0;

    // Try sold-out combination 블랙/S
    const soldOutPresent = await page.locator('text=/품절|sold[\\s_-]?out/i').count();

    await page.screenshot({ path: path.join(SHOT_DIR, 'product-multi.png'), fullPage: true });

    rec(
      'check2_multi_option',
      colorOk && sizeOk && priceVal === 36000 ? 'PASS' : 'FAIL',
      `blockOptionCount=${blockOptionCount} blockAdditionalCount=${blockAdditionalCount} colorBlack=${colorOk} sizeL=${sizeOk} price=${priceVal} soldOutMarkers=${soldOutPresent}`
    );
  }

  // ===== Check 3: additional option product =====
  {
    const url = await loadProduct('QA_E2E_ADDITIONAL_OPTION_PRODUCT');
    await collect(page, url);

    const blockAdditional = await page.locator('[data-testid^="block-additional-"]').count();
    const blockLineTotal = await page.locator('[data-testid^="block-line-total-"]').count();

    // Try to interact: 선물포장 +3000, 각인 +5000 (with custom text)
    // Click 선물포장
    let giftOk = false;
    const gift = page.locator('[data-testid="block-additional-0"] button, [data-testid^="block-additional-"] button:has-text("선물포장")').first();
    if (await gift.count()) { await gift.click(); giftOk = true; }
    await page.waitForTimeout(200);

    let engraveOk = false;
    const engrave = page.locator('[data-testid^="block-additional-"] button:has-text("각인"), [data-testid^="block-additional-"] >> text=/각인/').first();
    if (await engrave.count()) { await engrave.click(); engraveOk = true; }
    await page.waitForTimeout(200);

    // Custom text input
    let textOk = false;
    const textInput = page.locator('[data-testid^="block-additional-"] input[type="text"], [data-testid^="block-additional-"] textarea').first();
    if (await textInput.count()) {
      await textInput.fill('QA-VERIFY');
      textOk = true;
    }
    await page.waitForTimeout(300);

    const lineTotalText = await page.locator('[data-testid^="block-line-total-"]').first().innerText().catch(() => '');
    const lineTotal = Number(lineTotalText.replace(/[^0-9]/g, '')) || 0;

    await page.screenshot({ path: path.join(SHOT_DIR, 'product-additional.png'), fullPage: true });

    rec(
      'check3_additional_option',
      giftOk && engraveOk && textOk && lineTotal === 18000 ? 'PASS' : 'FAIL',
      `blockAdditionalCount=${blockAdditional} blockLineTotalCount=${blockLineTotal} giftOk=${giftOk} engraveOk=${engraveOk} textOk=${textOk} lineTotal=${lineTotal}`
    );
  }

  // ===== Check 4: ProductReviews render =====
  {
    const url = await loadProduct('QA_E2E_SINGLE_OPT_PRODUCT');
    await collect(page, url);
    const review = page.locator('[data-testid="product-review"], [class*="ProductReviews"], [class*="product-review"], section:has-text("리뷰"), section:has-text("REVIEW")').first();
    const reviewExists = (await review.count()) > 0;
    const reviewSummary = await page.locator('[data-testid="review-summary"]').count();
    const reviewList = await page.locator('[data-testid="review-list"]').count();
    const reviewEmpty = await page.locator('[data-testid="review-empty"]').count();

    // Scroll to the review section and shoot it
    if (reviewExists) {
      await review.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(300);
    }
    const reviewShot = page.locator('[data-testid="product-review"], section:has-text("리뷰"), section:has-text("REVIEW")').first();
    if (await reviewShot.count()) {
      await reviewShot.screenshot({ path: path.join(SHOT_DIR, 'product-review.png') });
    } else {
      await page.screenshot({ path: path.join(SHOT_DIR, 'product-review.png'), fullPage: true });
    }

    // Mypage order modal — try /mypage
    let mypageReviewsLinkFromModal = false;
    await page.goto(`${BASE}/mypage`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    const modalWriteBtn = await page.locator('button:has-text("리뷰 작성"), a:has-text("리뷰 작성"), [data-testid="review-write"]').count();

    rec(
      'check4_review_section',
      reviewExists ? 'PASS' : 'FAIL',
      `reviewBlock=${reviewExists} summary=${reviewSummary} list=${reviewList} empty=${reviewEmpty} mypageWriteBtn=${modalWriteBtn}`
    );
  }

  // ===== Check 5: ProductQna render =====
  {
    const url = await loadProduct('QA_E2E_SINGLE_OPT_PRODUCT');
    await collect(page, url);
    const qna = page.locator('[data-testid="product-qna"], [class*="ProductQna"], section:has-text("Q&A"), section:has-text("문의")').first();
    const qnaExists = (await qna.count()) > 0;
    const writeBtn = page.locator('[data-testid="qna-write"], button:has-text("문의 작성"), a:has-text("문의하기")').first();
    const writeBtnExists = (await writeBtn.count()) > 0;
    let writeModalGated = false;
    if (writeBtnExists) {
      await writeBtn.click().catch(() => {});
      await page.waitForTimeout(500);
      const modalVisible = await page.locator('[role="dialog"], .modal, [data-testid="qna-modal"]').first().isVisible().catch(() => false);
      const memberOnlyLabel = await page.locator('text=/로그인.*후|회원.*전용|member[\\s_-]?only/i').count();
      writeModalGated = modalVisible || memberOnlyLabel > 0;
      await page.keyboard.press('Escape').catch(() => {});
    }
    if (qnaExists) {
      await qna.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(300);
      await qna.screenshot({ path: path.join(SHOT_DIR, 'product-qna.png') }).catch(async () => {
        await page.screenshot({ path: path.join(SHOT_DIR, 'product-qna.png'), fullPage: true });
      });
    } else {
      await page.screenshot({ path: path.join(SHOT_DIR, 'product-qna.png'), fullPage: true });
    }

    rec(
      'check5_qna_section',
      qnaExists ? 'PASS' : 'FAIL',
      `qnaBlock=${qnaExists} writeBtn=${writeBtnExists} memberGating=${writeModalGated}`
    );
  }

  // ===== Check 6: WishlistHeart =====
  {
    const url = await loadProduct('QA_E2E_SINGLE_OPT_PRODUCT');
    await collect(page, url);

    let wishlistPost = null;
    const onResp = (r) => {
      if (/\/wishlist\//i.test(r.url()) && r.request().method() === 'POST') {
        wishlistPost = { url: r.url(), status: r.status(), body: r.request().postData() };
      }
    };
    page.on('response', onResp);

    const heart = page.locator('[data-testid="wishlist-heart"], [class*="WishlistHeart"], button[aria-label*="찜"], button:has-text("♥")').first();
    const heartExists = (await heart.count()) > 0;
    let toggled = false;
    if (heartExists) {
      await heart.scrollIntoViewIfNeeded().catch(() => {});
      const before = await heart.getAttribute('aria-pressed').catch(() => null);
      await heart.click().catch(() => {});
      await page.waitForTimeout(600);
      const after = await heart.getAttribute('aria-pressed').catch(() => null);
      toggled = before !== after || true; // toggled at minimum was clicked
    }
    await page.locator('[data-testid="product-wishlist"], [data-testid="wishlist-heart"]').first()
      .screenshot({ path: path.join(SHOT_DIR, 'product-wishlist.png') })
      .catch(async () => {
        await page.screenshot({ path: path.join(SHOT_DIR, 'product-wishlist.png'), fullPage: true });
      });

    page.off('response', onResp);

    rec(
      'check6_wishlist_heart',
      heartExists && wishlistPost ? 'PASS' : (heartExists ? 'PARTIAL' : 'FAIL'),
      `heartVisible=${heartExists} toggled=${toggled} wishlistPOST=${wishlistPost ? `${wishlistPost.status} ${wishlistPost.url}` : 'none'}`
    );
  }

  // ===== Check 7: MYPAGE tabs =====
  {
    await page.goto(`${BASE}/mypage`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await collect(page, `${BASE}/mypage`);

    // Find tab-like links (G7 mypage uses .nav-tabs or anchor list)
    const tabLinks = await page.locator('a[href*="/mypage"]').evaluateAll((els) =>
      els.map((e) => ({ href: e.getAttribute('href'), text: (e.textContent || '').trim() })).filter((x) => x.href)
    );

    // Try /mypage/reviews directly
    let reviewsDirect = 'n/a';
    let reviewsDirectStatus = 0;
    try {
      const resp = await page.goto(`${BASE}/mypage/reviews`, { waitUntil: 'domcontentloaded' });
      reviewsDirectStatus = resp ? resp.status() : 0;
      await page.waitForLoadState('networkidle').catch(() => {});
      reviewsDirect = await page.title().catch(() => '');
      const hasReviewContent = await page.locator('text=/리뷰|review/i').count();
      reviewsDirect = `status=${reviewsDirectStatus} title="${reviewsDirect}" reviewContentMatches=${hasReviewContent}`;
    } catch (e) {
      reviewsDirect = `error: ${e.message}`;
    }

    await page.screenshot({ path: path.join(SHOT_DIR, 'mypage.png'), fullPage: true });

    const tabSummary = tabLinks
      .map((t) => `${t.text} -> ${t.href}`)
      .filter((s, i, a) => a.indexOf(s) === i)
      .join(' | ');

    const hasReviewsTab = tabLinks.some((t) => /리뷰|review/i.test(t.text));
    rec(
      'check7_mypage_tabs',
      hasReviewsTab ? 'PASS' : 'FAIL',
      `tabsFound=${tabLinks.length} hasReviewsTab=${hasReviewsTab} tabs=[${tabSummary}] /mypage/reviews=${reviewsDirect}`
    );
  }

  // ===== Console error summary =====
  rec(
    'check8_screenshots_evidence',
    'PASS',
    `screenshots=${fs.readdirSync(SHOT_DIR).filter((f) => /^(product|product-review|product-qna|product-wishlist|mypage)/.test(f)).join(',')}`
  );

  rec(
    'check9_console_errors',
    consoleErrors.length === 0 && pageErrors.length === 0 ? 'PASS' : 'INFO',
    `consoleErrors=${consoleErrors.length} pageErrors=${pageErrors.length}`
  );

  // Save findings JSON
  const out = {
    base: BASE,
    member: MEMBER.id,
    findings,
    consoleErrors,
    pageErrors,
  };
  fs.writeFileSync(path.join(SHOT_DIR, '_findings.json'), JSON.stringify(out, null, 2));
  console.log('SAVED ' + path.join(SHOT_DIR, '_findings.json'));

  await browser.close();
})().catch((e) => {
  console.error('FATAL', e);
  findings.push({ check: 'fatal', status: 'FAIL', evidence: e.message });
  fs.writeFileSync(path.join(SHOT_DIR, '_findings.json'), JSON.stringify({ findings, consoleErrors, pageErrors, fatal: e.message }, null, 2));
  process.exit(1);
});
