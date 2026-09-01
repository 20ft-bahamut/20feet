import { chromium } from 'playwright-core';
import fs from 'node:fs';

const CREDS = JSON.parse(fs.readFileSync('/tmp/qa-creds.json', 'utf8'));
const BASE = CREDS.baseUrl.replace(/\/$/, '');
const MEMBER = { id: CREDS.memberId, pw: CREDS.memberPw };

const browser = await chromium.launch({
  executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  headless: true,
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
await page.fill('#auth_login_email', MEMBER.id);
await page.fill('#auth_login_password', MEMBER.pw);
await page.click('#auth_login_submit');
await page.waitForFunction(() => !location.pathname.startsWith('/login')).catch(() => {});

async function dump(label, slug) {
  await page.goto(`${BASE}/shop/product/${slug}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const out = await page.evaluate(() => {
    function summarize(el) {
      if (!el) return null;
      const tag = el.tagName.toLowerCase();
      const cls = el.className || '';
      const tid = el.getAttribute('data-testid') || '';
      const id = el.id || '';
      const text = (el.innerText || '').trim().slice(0, 200).replace(/\s+/g, ' ');
      return { tag, cls, tid, id, text };
    }
    const wishlist = document.querySelector('[data-testid="wishlist-heart"], .WishlistHeart, button[aria-label*="찜"]');
    const purchase = document.querySelector('[data-testid="purchase-panel"], .PurchasePanel, [class*="PurchasePanel"]');
    const reviews = document.querySelector('[data-testid="product-review"], .ProductReviews, [class*="ProductReviews"], section');
    const qna = document.querySelector('[data-testid="product-qna"], .ProductQna, [class*="ProductQna"]');
    const inputs = Array.from(document.querySelectorAll('input, select, textarea')).map((el) => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type'),
      name: el.getAttribute('name'),
      testid: el.getAttribute('data-testid'),
      placeholder: el.getAttribute('placeholder'),
      options: el.tagName === 'SELECT' ? Array.from(el.querySelectorAll('option')).map((o) => ({ value: o.value, text: o.textContent.trim() })) : null,
    }));
    const buttons = Array.from(document.querySelectorAll('button')).map((b) => ({
      text: (b.innerText || '').trim().slice(0, 40),
      testid: b.getAttribute('data-testid'),
      aria: b.getAttribute('aria-label'),
    })).filter((b) => b.text || b.testid || b.aria);
    const allTestIds = Array.from(document.querySelectorAll('[data-testid]')).map((e) => e.getAttribute('data-testid'));
    return {
      wishlist: summarize(wishlist),
      purchase: summarize(purchase),
      reviews: summarize(reviews),
      qna: summarize(qna),
      inputs,
      buttons: buttons.slice(0, 50),
      allTestIds: Array.from(new Set(allTestIds)).slice(0, 200),
    };
  });
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(out, null, 2));
}

await dump('SINGLE', 'QA_E2E_SINGLE_OPT_PRODUCT');
await dump('MULTI', 'QA_E2E_MULTI_OPT_PRODUCT');
await dump('ADD', 'QA_E2E_ADDITIONAL_OPTION_PRODUCT');

await browser.close();
