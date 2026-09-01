import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'fs';
mkdirSync('/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots', { recursive: true });
const C = JSON.parse(readFileSync('/tmp/qa-creds.json','utf8'));
const browser = await chromium.launch({ executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', headless: true });
const page = await browser.newPage({ viewport:{width:1440,height:1100}, locale:'ko-KR' });
const errs=[]; page.on('pageerror',e=>errs.push('PAGEERR '+String(e).slice(0,180)));
page.on('response', r=>{ if(r.status()>=400) console.log('HTTP-'+r.status(), r.request().method(), r.url().slice(0,140)); });
await page.goto('http://localhost:8000/login',{waitUntil:'networkidle'}); await page.waitForTimeout(600);
await page.fill('#auth_login_email', C.memberId); await page.fill('#auth_login_password', C.memberPw);
await page.click('#auth_login_submit'); await page.waitForTimeout(1500);
await page.goto('http://localhost:8000/shop/products/QAE2ESTOCKTEST001',{waitUntil:'networkidle'}); await page.waitForTimeout(1200);
// find write button
const btns = await page.evaluate(()=>Array.from(document.querySelectorAll('[data-testid]')).map(e=>e.getAttribute('data-testid')).filter(t=>/qna/.test(t)));
console.log('qna testids:', JSON.stringify(btns));
const btn = page.locator('[data-testid="qna-write-button"]').first();
console.log('write button count:', await btn.count());
if (await btn.count()) {
  await btn.click(); await page.waitForTimeout(900);
  // inspect modal
  const modal = await page.evaluate(()=>{
    const el = document.querySelector('[data-testid="qna-write-modal"], [role="dialog"], .modal');
    if (!el) return null;
    return { testids: Array.from(el.querySelectorAll('[data-testid]')).map(e=>e.getAttribute('data-testid')).slice(0,12),
             inputs: el.querySelectorAll('input,textarea,select').length,
             text: el.textContent.replace(/\s+/g,' ').slice(0,200) };
  });
  console.log('modal:', JSON.stringify(modal,null,1));
  // try filling if fields exist
  const title = page.locator('[data-testid="qna-write-title"], [name="title"]').first();
  const body = page.locator('[data-testid="qna-write-content"], textarea').first();
  if (await body.count()) {
    if (await title.count()) await title.fill('QA 문의 테스트');
    await body.fill('상품 문의 자동 QA 테스트 본문입니다. 확인 부탁드립니다.');
    const submit = page.locator('[data-testid="qna-modal-submit"]').first();
    console.log('submit count:', await submit.count());
    await submit.click().catch(e=>console.log('click err', String(e).slice(0,80)));
    await page.waitForTimeout(2000);
    const after = await page.evaluate(()=>({
      modal: !!document.querySelector('[data-testid="qna-modal-submit"]'),
      toast: document.querySelector('[class*="toast"],[data-testid*="toast"]')?.textContent?.slice(0,100) ?? null,
      qnaItems: document.querySelectorAll('[data-testid="qna-item"], [data-testid*="qna-item"]').length,
      empty: !!document.querySelector('[data-testid="qna-empty"]'),
      rows: Array.from(document.querySelectorAll('[data-testid^="qna-"]')).map(e=>e.getAttribute('data-testid')).filter((v,i,a)=>a.indexOf(v)===i).slice(0,12),
    }));
    console.log('AFTER-SUBMIT:', JSON.stringify(after,null,1));
  }
  await page.screenshot({ path:'/home/bahamut/20feet/_workspace/ecommerce-qa/remediation/screenshots/qna-write-flow.png', fullPage:false });
}
console.log('pageerrors:', errs.slice(0,3));
await browser.close();
