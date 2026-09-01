import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
mkdirSync('/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots', { recursive: true });
const C = readFileSync('/tmp/qa-creds.json','utf8'); const base='http://localhost:8000';
const browser = await chromium.launch({ executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', headless: true });
const page = await browser.newPage({ viewport:{width:1440,height:1000}, locale:'ko-KR' });
const errs=[]; page.on('pageerror',e=>errs.push(String(e).slice(0,150)));
await page.goto(`${base}/login`,{waitUntil:'networkidle'});
await page.fill('#auth_login_email', JSON.parse(C).memberId);
await page.fill('#auth_login_password', JSON.parse(C).memberPw);
await page.click('#auth_login_submit'); await page.waitForTimeout(1500);
await page.goto(`${base}/shop/product/QA_E2E_FREE_SHIP_PRODUCT`,{waitUntil:'networkidle'}); await page.waitForTimeout(800);
const add = page.locator('[data-testid="add-to-cart"], [data-mode="add"]').first();
if (await add.count()) { await add.click(); await page.waitForTimeout(1000); }
await page.goto(`${base}/shop/checkout`,{waitUntil:'networkidle'}); await page.waitForTimeout(1200);
const out={checkoutUrl:page.url()};
out.buttonCount=await page.locator('text=주소 검색').count();
out.hasDaumWiring=(await page.content()).match(/daum|postcode|우편번호/i)?.length>0;
if (out.buttonCount>0){ try { await page.locator('text=주소 검색').first().click(); await page.waitForTimeout(2500); out.popupOrLayer = page.url()!==`${base}/shop/checkout` ? 'new_window_or_navigation':'inline_layer_or_noop'; } catch(e){ out.clickErr=String(e).slice(0,120);} }
out.consoleErrors=errs.slice(0,5);
await page.screenshot({path:'/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots/checkout-address-search.png',fullPage:false});
writeFileSync('/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/evidence/daum-partial.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,1)); await browser.close();