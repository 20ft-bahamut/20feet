import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
mkdirSync('/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots', { recursive: true });
const base='http://localhost:8000';
const C = JSON.parse(readFileSync('/tmp/qa-creds.json','utf8'));
const browser = await chromium.launch({ executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', headless: true });
const page = await browser.newPage({ viewport:{width:1440,height:1000}, locale:'ko-KR' });
const posts=[];
page.on('request', r=>{ if(r.method()==='POST' && r.url().includes('/wishlist')) posts.push(r.url()); });
const out={};
// login member
await page.goto(`${base}/login`,{waitUntil:'networkidle'});
await page.fill('#auth_login_email', C.memberId); await page.fill('#auth_login_password', C.memberPw);
await page.click('#auth_login_submit'); await page.waitForTimeout(1200);

// 1) single option select + price recompute
await page.goto(`${base}/shop/product/QAE2ESINGLEOPT01`,{waitUntil:'networkidle'}); await page.waitForTimeout(900);
out.single = {};
out.single.panel = (await page.locator('[data-testid="add-to-cart-panel"]').textContent().catch(()=> ''))?.replace(/\s+/g,' ').slice(0,200);
const sels = page.locator('[data-testid="add-to-cart-panel"] select');
out.single.selectCount = await sels.count();
try {
  const o0 = await sels.nth(0).locator('option').allTextContents();
  out.single.group1Options = o0;
  const i = o0.findIndex(t=>t.includes('블랙'));
  if (i > 0) await sels.nth(0).selectOption({index:i});
  await page.waitForTimeout(700);
  out.single.afterSelect = (await page.locator('[data-testid="add-to-cart-panel"]').textContent().catch(()=> ''))?.replace(/\s+/g,' ').slice(0,220);
} catch(e){ out.single.err = String(e).slice(0,100); }
await page.screenshot({ path:'/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots/product-option-single.png', fullPage:false });

// 2) multi product: cascading + price for L
await page.goto(`${base}/shop/product/QAE2EMULTIOPT001`,{waitUntil:'networkidle'}); await page.waitForTimeout(900);
out.multi = {};
const m = page.locator('[data-testid="add-to-cart-panel"] select');
out.multi.selectCount = await m.count();
try {
  await m.nth(0).selectOption({label: (await m.nth(0).locator('option').allTextContents()).find((t,i)=>i>0) ?? ''});
  await page.waitForTimeout(500);
  const opts1 = await m.nth(1).locator('option').allTextContents();
  out.multi.group2 = opts1;
  const li = opts1.findIndex(t=>t.trim()==='L' || t.includes('L'));
  if (li>0) await m.nth(1).selectOption({index:li});
  await page.waitForTimeout(700);
  out.multi.afterL = (await page.locator('[data-testid="add-to-cart-panel"]').textContent().catch(()=> ''))?.replace(/\s+/g,' ').slice(0,220);
} catch(e){ out.multi.err = String(e).slice(0,100); }
await page.screenshot({ path:'/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots/product-option-multi.png', fullPage:false });

// 3) additional options
await page.goto(`${base}/shop/product/QAE2EADDOPT0001`,{waitUntil:'networkidle'}); await page.waitForTimeout(900);
out.addl = await page.evaluate(()=>({
  blocks: Array.from(document.querySelectorAll('[data-testid]')).map(e=>e.getAttribute('data-testid')).filter(t=>/additional|line-total/.test(t)).slice(0,10),
  panel: (document.querySelector('[data-testid="add-to-cart-panel"]')?.textContent ?? '').replace(/\s+/g,' ').slice(0,220),
}));
await page.screenshot({ path:'/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots/product-additional-option.png', fullPage:false });

// 4) wishlist toggle POST
await page.goto(`${base}/shop/product/QAE2ESTOCKTEST001`,{waitUntil:'networkidle'}); await page.waitForTimeout(900);
const heart = page.locator('[data-testid="wishlist-heart"]').first();
out.heartExists = await heart.count();
if (out.heartExists) { await heart.click(); await page.waitForTimeout(900); await heart.click(); await page.waitForTimeout(600); }
out.wishlistPosts = posts.length;
await page.screenshot({ path:'/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots/product-wishlist.png', fullPage:false });

// 5) reviews + qna sections
for (const [code,key] of [['QAE2ESTOCKTEST001','reviews'],[ 'QAE2ESTOCKTEST001','qna']]) {
  await page.goto(`${base}/shop/product/QAE2ESTOCKTEST001`,{waitUntil:'networkidle'}); await page.waitForTimeout(900);
  out[key] = await page.evaluate(()=>({
    testids: Array.from(document.querySelectorAll('[data-testid]')).map(e=>e.getAttribute('data-testid')).filter(t=>/review|qna|inquiry/.test(t)).slice(0,10),
  }));
}
await page.screenshot({ path:'/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots/product-review.png', fullPage:true });
writeFileSync('/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/evidence/purchase-final-check.json', JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,1));
await browser.close();
