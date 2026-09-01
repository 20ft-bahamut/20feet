import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', headless: true });
const page = await browser.newPage({ viewport:{width:1440,height:1000}, locale:'ko-KR' });
const reqs=[]; page.on('request',r=>{ if(r.url().includes('/api/')) reqs.push(r.method()+' '+r.url().slice(0,130)); });
page.on('response', r=>{ if(r.status()>=400 ) console.log('HTTP-'+r.status(), r.url().slice(0,130)); });
await page.goto('http://localhost:8000/shop/products/QAE2ESTOCKTEST001',{waitUntil:'networkidle'}); await page.waitForTimeout(1500);
const dom = await page.evaluate(()=>({
  route: window.location.pathname,
  productCode: document.querySelector('[data-testid="shop_product_code"],#shop_product_code')?.textContent?.trim(),
  price: document.querySelector('[id*="price"],[data-testid*=price]')?.textContent?.trim()?.slice(0,30),
  h1: document.querySelector('h1')?.textContent?.trim(),
}));
console.log(JSON.stringify(dom,null,1));
const resp = await page.evaluate(async()=>{ const r= await fetch('/api/modules/sirsoft-ecommerce/products/QAE2ESTOCKTEST001',{headers:{Accept:'application/json'}}); return r.status; });
console.log('manual fetch product:', resp);
await browser.close();
