import { chromium } from 'playwright-core';

const BASE_URL = 'http://127.0.0.1:8000';
const PRODUCT_PATH = '/shop/product/STLPEN0000007QR';

async function main() {
    const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();

    const results = { flow: [], console_errors: [], network: [] };
    const log = (...a) => { console.log('[verify]', ...a); results.flow.push(a.map(String).join(' ')); };

    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            results.console_errors.push({ type: 'console.error', text: msg.text() });
        }
    });
    page.on('pageerror', (err) => results.console_errors.push({ type: 'pageerror', text: err.message }));
    page.on('response', (res) => {
        const url = res.url();
        const method = res.request().method();
        if (url.includes('/api/modules/sirsoft-ecommerce/cart')) {
            results.network.push({ method, url: url.replace(BASE_URL, ''), status: res.status() });
        }
    });

    log('open product detail');
    await page.goto(`${BASE_URL}${PRODUCT_PATH}?_=${Date.now()}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Verify CTAs
    const ctaAdd = await page.locator('[data-testid="add-to-cart"]').count();
    const ctaBuy = await page.locator('[data-testid="buy-now"]').count();
    const qty = await page.locator('[data-testid="quantity-input"]').count();
    log(`CTAs present: add=${ctaAdd} buy=${ctaBuy} qty=${qty}`);

    // Check product data
    const productData = await page.evaluate(() => {
        const k = window.G7Core?.state?.get?.('cartKey');
        const isObj = typeof k === 'object' && k !== null;
        return {
            hasG7Core: !!window.G7Core,
            hasG7TemplateHandlers: !!window.G7TemplateHandlers,
            hasAddToCart: !!window.G7TemplateHandlers?.addToCart,
            cartKeyPrefix: typeof k === 'string' ? k.slice(0, 10) : (isObj ? 'OBJECT:' + Object.keys(k).slice(0,5).join(',') : String(k)),
        };
    });
    log('product data:', JSON.stringify(productData));

    // Click button (real user click)
    log('click add-to-cart');
    await page.locator('[data-testid="add-to-cart"]').click();
    await page.waitForTimeout(3500);

    // Navigate to /cart
    log('navigate to /cart');
    await page.goto(`${BASE_URL}/cart?_=${Date.now()}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const itemCount = await page.locator('[data-testid="cart-item-row"]').count();
    log(`cart rows: ${itemCount}`);

    let itemId = null;
    if (itemCount > 0) {
        itemId = await page.locator('[data-testid="cart-item-row"]').first().getAttribute('data-item-id');
        log(`first item id: ${itemId}`);

        // PATCH qty
        log('PATCH qty: change input to 3 then blur');
        const qtyInput = page.locator('[data-testid="cart-qty-input"]').first();
        await qtyInput.fill('3');
        await qtyInput.blur();
        const applyBtn = page.locator('[data-testid="cart-qty-apply"]').first();
        if (await applyBtn.count() > 0 && await applyBtn.isEnabled()) {
            await applyBtn.click();
        }
        await page.waitForTimeout(2500);

        // DELETE
        log('DELETE item');
        await page.locator('[data-testid="cart-item-delete"]').first().click();
        await page.waitForTimeout(2500);
    } else {
        log('no items in cart to PATCH/DELETE');
    }

    // Checkout
    log('navigate to /shop/checkout');
    await page.goto(`${BASE_URL}/shop/checkout?_=${Date.now()}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const checkoutH1 = await page.locator('h1').first().textContent();
    log(`checkout H1: ${checkoutH1}`);

    await page.screenshot({ path: '/home/bahamut/20feet/_workspace/20ft/cart_checkout.png', fullPage: true });

    await browser.close();

    console.log('=== REPORT ===');
    console.log(JSON.stringify({
        flow: results.flow,
        console_errors_count: results.console_errors.length,
        console_errors: results.console_errors.slice(0, 5),
        cart_network: results.network,
    }, null, 2));
}

main().catch((err) => { console.error('FATAL', err); process.exit(1); });
