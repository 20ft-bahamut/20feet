import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const logs = [];
page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
page.on('pageerror', err => logs.push(`PAGEERROR: ${err.message}`));
page.on('requestfailed', req => logs.push(`REQUESTFAILED: ${req.url()} ${req.failure()?.errorText}`));

// 1. 로그인
await page.goto('http://127.0.0.1:8000/admin/login', { waitUntil: 'networkidle' });
await page.fill('input[type="email"], input[name="email"], input[name="user_id"]', 'test@test.com');
await page.fill('input[type="password"], input[name="password"]', 'qwer1234');
await page.click('button[type="submit"]');
await page.waitForTimeout(2000);

// 2. /admin/board/superbify 접근
await page.goto('http://127.0.0.1:8000/admin/board/superbify', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const url = page.url();
const bodyText = await page.evaluate(() => document.body.innerText);
const dataSourceRequests = await page.evaluate(() => {
  return window.performance.getEntriesByType('resource')
    .map(r => ({ name: r.name, status: r.responseStatus }))
    .filter(u => u.name.includes('/admin/board') || u.name.includes('sirsoft-board'));
});

console.log('--- URL ---');
console.log(url);
console.log('--- BODY TEXT ---');
console.log(bodyText.slice(0, 1500));
console.log('--- RELEVANT REQUESTS ---');
console.log(JSON.stringify(dataSourceRequests, null, 2));
console.log('--- CONSOLE LOGS ---');
console.log(logs.join('\n'));

await browser.close();
