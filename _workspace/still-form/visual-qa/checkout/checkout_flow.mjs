import { chromium } from 'playwright-core';
import fs from 'fs';

const BASE_URL = 'http://127.0.0.1:8000';
const OUT_DIR = '/home/bahamut/20feet/_workspace/still-form/visual-qa/checkout';
const CART_KEY = 'ck_jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj';

const VIEWPORTS = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'mobile-430',   width: 430,  height: 932 },
];

const PRODUCT_IDS = [8]; // product 7 has string-cast option_values in DB seed — backend bug, exclude for v1

function log(...args) {
    const line = `[${new Date().toISOString()}] ${args.join(' ')}`;
    console.log(line);
    fs.appendFileSync(`${OUT_DIR}/flow.log`, line + '\n');
}

async function waitForImages(page) {
    await page.evaluate(async () => {
        const imgs = Array.from(document.querySelectorAll('img'));
        await Promise.all(imgs.map(img => {
            if (img.complete && img.naturalWidth > 0) return Promise.resolve();
            return new Promise(resolve => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
                setTimeout(resolve, 8000);
            });
        }));
    });
}

async function seedCart(page) {
    // Seed cart via the public add-to-cart endpoint. X-Cart-Key header is required.
    // BulkAddToCartRequest expects { product_id, items: [{ quantity, ... }] }
    for (const productId of PRODUCT_IDS) {
        const res = await page.request.post(`${BASE_URL}/api/modules/sirsoft-ecommerce/cart`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Cart-Key': CART_KEY,
            },
            data: { product_id: productId, items: [{ quantity: 1 }] },
        });
        const status = res.status();
        let body;
        try { body = await res.json(); } catch { body = await res.text(); }
        log(`add-to-cart product=${productId} status=${status} body=${JSON.stringify(body).slice(0, 200)}`);
    }
}

async function killStaleTempOrder(page) {
    // DELETE /checkout wipes any previous temp_order for the cart key.
    // Critical: stale temp orders hold item_ids from earlier carts and bypass
    // the empty-cart guard, leading to "Cart item not found" on POST /user/orders.
    const res = await page.request.delete(`${BASE_URL}/api/modules/sirsoft-ecommerce/checkout`, {
        headers: {
            'Accept': 'application/json',
            'X-Cart-Key': CART_KEY,
        },
    });
    log(`delete checkout temp-order status=${res.status()}`);
}

async function readCurrentFinalAmount(page) {
    const res = await page.request.get(`${BASE_URL}/api/modules/sirsoft-ecommerce/checkout`, {
        headers: {
            'Accept': 'application/json',
            'X-Cart-Key': CART_KEY,
        },
    });
    try {
        const body = await res.json();
        return body?.data?.calculation?.summary?.final_amount ?? null;
    } catch {
        return null;
    }
}

async function clearCart(page) {
    const res = await page.request.delete(`${BASE_URL}/api/modules/sirsoft-ecommerce/cart/all`, {
        headers: {
            'Accept': 'application/json',
            'X-Cart-Key': CART_KEY,
        },
    });
    log(`clear cart status=${res.status()}`);
}

async function main() {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(`${OUT_DIR}/flow.log`, '');

    const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });

    for (const vp of VIEWPORTS) {
        log(`=== Viewport ${vp.name} ===`);
        const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        await ctx.addInitScript((key) => {
            try { localStorage.setItem('g7_cart_key', key); } catch (e) {}
        }, CART_KEY);

        const page = await ctx.newPage();
        page.on('pageerror', (err) => log(`[pageerror] ${err.message}`));
        page.on('console', (msg) => {
            const t = msg.type();
            if (t === 'error' || t === 'warn' || t === 'info') {
                log(`[console.${t}] ${msg.text().slice(0, 400)}`);
            }
        });
        page.on('response', (r) => {
            if (r.status() >= 400) {
                log(`[net ${r.status()}] ${r.request().method()} ${r.url()}`);
            }
        });
        page.on('request', (r) => {
            const url = r.url();
            if (url.includes('sirsoft-ecommerce/checkout') || url.includes('user/orders')) {
                log(`[req] ${r.method()} ${url.slice(url.indexOf('/api'))}`);
            }
        });

        // 0. Clear cart from previous run
        await clearCart(page);
        await killStaleTempOrder(page);

        // 1. Add items to cart
        log('--- 1. Seed cart ---');
        await seedCart(page);

        // 2. Visit /cart
        log('--- 2. /cart ---');
        await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle', timeout: 30000 });
        await waitForImages(page);
        await page.waitForTimeout(800);
        await page.screenshot({ path: `${OUT_DIR}/${vp.name}-01-cart.png`, fullPage: true });
        log(`cart screenshot saved`);

        // 3. Click Checkout CTA — locator supports both Korean "결제하기" and English "Checkout"
        log('--- 3. click checkout CTA ---');
        const checkoutBtn = page.locator(
            'button:has-text("결제하기"), a:has-text("결제하기"), button:has-text("Checkout"), a:has-text("Checkout")'
        ).first();
        if (await checkoutBtn.count() === 0) {
            log('Checkout CTA not found on /cart — aborting this viewport');
            continue;
        }
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
            checkoutBtn.click(),
        ]);
        await waitForImages(page);
        await page.waitForTimeout(1000);
        const checkoutUrl = page.url();
        log(`landed at ${checkoutUrl}`);
        await page.screenshot({ path: `${OUT_DIR}/${vp.name}-02-checkout-empty.png`, fullPage: true });

        // 4. Wait for checkout form to be ready (or temp-order error)
        try {
            await page.waitForSelector(
                '[data-testid="checkout-form"], [data-testid="checkout-temp-order-error"]',
                { timeout: 30000 }
            );
        } catch {
            log('neither checkout-form nor checkout-temp-order-error appeared within 30s');
            const html = await page.content();
            fs.writeFileSync(`${OUT_DIR}/${vp.name}-02-checkout-dom.html`, html);
            continue;
        }

        const errorState = await page.locator('[data-testid="checkout-temp-order-error"]').count();
        if (errorState > 0) {
            log('checkout-temp-order-error visible — skipping form fill');
            await page.screenshot({ path: `${OUT_DIR}/${vp.name}-02b-temp-error.png`, fullPage: true });
            continue;
        }

        log('checkout form ready');

        log('--- 4. fill form ---');
        // Use locator + label. Korean labels.
        const fill = async (label, value) => {
            // find input next to label text
            const input = page.locator(`label:has-text("${label}")`).first().locator('xpath=following::input[1]');
            await input.fill(value);
        };

        await fill('이름', '홍길동');
        // First "연락처" — orderer phone
        await page.locator('label:has-text("연락처")').first().locator('xpath=following::input[1]').fill('010-1234-5678');
        await fill('이메일', 'hong@example.com');
        await fill('받는 분', '김영희');
        // Second "연락처" — recipient phone (after shipping section header)
        await page.locator('label:has-text("연락처")').nth(1).locator('xpath=following::input[1]').fill('010-9876-5432');
        await fill('우편번호', '06000');
        await fill('주소', '서울특별시 강남구 테헤란로 123');
        await fill('상세 주소', '4층');
        // Select a memo from the dropdown to populate shipping_memo
        const memoSelect = page.locator('select').first();
        if (await memoSelect.count() > 0) {
            await memoSelect.selectOption({ index: 1 });
        }
        await fill('조회 비밀번호', 'pass1234');
        await fill('비밀번호 확인', 'pass1234');

        // Fill dbank depositor name
        const depositor = page.locator('label:has-text("입금자명")').first().locator('xpath=following::input[1]');
        if (await depositor.count() > 0) {
            await depositor.fill('홍길동');
        }

        await page.waitForTimeout(500);
        await page.screenshot({ path: `${OUT_DIR}/${vp.name}-03-checkout-filled.png`, fullPage: true });
        log(`filled form screenshot saved`);

        // 6. Submit
        log('--- 5. submit ---');
        const submitBtn = page.locator(
            'button[type="submit"]:has-text("결제하기"), button[type="submit"]:has-text("Checkout"), button[type="submit"]:has-text("Pay"), button[type="submit"]:has-text("Place order")'
        ).first();
        if (await submitBtn.count() === 0) {
            log('Submit button not found');
            continue;
        }

        // Capture the response from /user/orders to log it
        const submitPromise = page.waitForResponse((r) => r.url().includes('/user/orders') && r.request().method() === 'POST', { timeout: 30000 }).catch(() => null);

        await submitBtn.click();

        const submitRes = await submitPromise;
        if (submitRes) {
            const status = submitRes.status();
            let body;
            try { body = await submitRes.json(); } catch { body = await submitRes.text(); }
            log(`POST /user/orders status=${status} body=${JSON.stringify(body).slice(0, 500)}`);
        } else {
            log('No /user/orders response captured (timeout or error)');
        }

        // Wait for navigation to complete page
        try {
            await page.waitForURL(/order\/complete|guest\/orders/, { timeout: 20000 });
        } catch {
            log(`after submit, current url: ${page.url()}`);
        }
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `${OUT_DIR}/${vp.name}-04-complete.png`, fullPage: true });
        log(`complete page screenshot saved`);
        log(`final url: ${page.url()}`);

        await ctx.close();
    }

    await browser.close();
    log('done');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});