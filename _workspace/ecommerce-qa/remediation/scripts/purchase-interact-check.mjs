import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
mkdirSync('/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots', { recursive: true });
const base='http://localhost:8000';
const browser = await chromium.launch({ executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', headless: true });
const page = await browser.newPage({ viewport:{width:1440,height:1000}, locale:'ko-KR' });
const out = {};
// member login for wishlist toggle
await page.goto(`${base}/login`,{waitUntil:'networkidle'});
const C = JSON.parse((await import('fs')).readFileSync('/tmp/qa-creds.json','utf8'));
await page.fill('#auth_login_email', C.memberId); await page.fill('#auth_login_password', C.memberPw);
await page.click('#auth_login_submit'); await page.waitForTimeout(1200);

await page.goto(`${base}/shop/product/QA_E2E_SINGLE_OPT_PRODUCT`,{waitUntil:'networkidle'}); await page.waitForTimeout(800);
out.panelText = (await page.locator('[data-testid="add-to-cart-panel"]').textContent().catch(()=> ''))?.replace(/\s+/g,' ').slice(0,220);
// select 블랙 in first select
const sels = page.locator('[data-testid="add-to-cart-panel"] select');
out.selectCount = await sels.count();
if (out.selectCount >= 1) {
  const opts = await sels.nth(0).locator('option').allTextContents();
  out.group1 = opts;
  const idx = opts.findIndex(t=>t.includes('블랙'));
  if (idx > 0) { await sels.nth(0).selectOption({index: idx}); await page.waitForTimeout(600); }
  out.panelTextAfter = (await page.locator('[data-testid="add-to-cart-panel"]').textContent().catch(()=> ''))?.replace(/\s+/g,' ').slice(0,220);
}
// additional option product: check blocks + line total
await page.goto(`${base}/shop/product/QA_E2E_ADDITIONAL_OPTION_PRODUCT`,{waitUntil:'networkidle'}); await page.waitForTimeout(800);
out.addlTestids = await page.evaluate(()=>Array.from(document.querySelectorAll('[data-testid]')).map(e=>e.getAttribute('data-testid')).filter(t=>/additional|line-total/.test(t)).slice(0,8));
// wishlist heart click
await page.locator('[data-testid="wishlist-heart"]').first().click().catch(e=>out.wishErr=String(e).slice(0,80));
await page.waitForTimeout(800);
out.wishPostSeen = 'checked-below';
out.wishHeartState = await page.locator('[data-testid="wishlist-heart"]').first().getAttribute('class').catch(()=> '');
await page.screenshot({ path: '/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots/after-fix-single-selected.png', fullPage: false });
console.log(JSON.stringify(out,null,1));
await browser.close();
