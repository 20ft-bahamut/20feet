import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'fs';
mkdirSync('/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots', { recursive: true });
const base='http://localhost:8000';
const C = JSON.parse(readFileSync('/tmp/qa-creds.json','utf8'));
const browser = await chromium.launch({ executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', headless: true });
const page = await browser.newPage({ viewport:{width:1440,height:1000}, locale:'ko-KR' });
await page.goto(`${base}/login`,{waitUntil:'networkidle'}); await page.waitForTimeout(800);
await page.fill('#auth_login_email', C.adminId); await page.fill('#auth_login_password', C.adminPw);
await page.click('#auth_login_submit'); await page.waitForTimeout(1500);
await page.goto(`${base}/cart`,{waitUntil:'networkidle'}); await page.waitForTimeout(900);
const out = await page.evaluate(()=>({
  addoptRows: Array.from(document.querySelectorAll('[data-testid^="cart-additional-option-"]')).map(e=>e.textContent.trim()).slice(0,6),
}));
await page.screenshot({ path:'/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots/cart-additional-options.png', fullPage:false });
console.log(JSON.stringify(out,null,1));
await browser.close();
