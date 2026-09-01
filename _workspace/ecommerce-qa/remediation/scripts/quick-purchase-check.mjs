import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'fs';
mkdirSync('/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots', { recursive: true });
const base='http://localhost:8000';
const browser = await chromium.launch({ executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', headless: true });
const page = await browser.newPage({ viewport:{width:1440,height:1000}, locale:'ko-KR' });
for (const code of ['QA_E2E_SINGLE_OPT_PRODUCT','QA_E2E_MULTI_OPT_PRODUCT','QA_E2E_ADDITIONAL_OPTION_PRODUCT']) {
  await page.goto(`${base}/shop/product/${code}`,{waitUntil:'networkidle'}); await page.waitForTimeout(1000);
  const res = await page.evaluate(() => ({
    testids: Array.from(document.querySelectorAll('[data-testid]')).map(e=>e.getAttribute('data-testid')).filter(t=>/option|additional|line-total|add-to|wishlist|qty/.test(t)).slice(0,14),
    selects: document.querySelectorAll('select').length,
    price: document.querySelector('[data-testid="price"],[data-testid="option-price"],[id*="price"]')?.textContent?.trim() ?? null,
  }));
  console.log(code, JSON.stringify(res));
  await page.screenshot({ path: `/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots/after-fix-${code}.png`, fullPage: false });
}
await browser.close();
