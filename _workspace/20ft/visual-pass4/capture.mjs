/**
 * Visual-pass4 capture script (Round 2).
 *  - Desktop 1440x900: home, shop, product (STLPEN0000007QR), cart-filled
 *  - Mobile 390x844: home, shop, product
 * Saves to /home/bahamut/20feet/_workspace/20ft/visual-pass4/
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://127.0.0.1:8000';
const OUT_DIR = '/home/bahamut/20feet/_workspace/20ft/visual-pass4';

fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORTS = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
];

const PAGES = [
    { name: 'home', path: '/' },
    { name: 'shop', path: '/shop' },
    { name: 'product', path: '/shop/product/STLPEN0000007QR' },
    { name: 'cart', path: '/cart' },
];

async function fillCart(page) {
    await page.goto(`${BASE_URL}/shop/product/STLPEN0000007QR?_=${Date.now()}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const addBtn = page.locator('[data-testid="add-to-cart"]').first();
    if (await addBtn.count()) {
        try {
            await addBtn.click({ timeout: 2000 });
        } catch {}
    }
    await page.waitForTimeout(1500);
}

async function shoot(page, vpName, pageName, suffix = '') {
    const file = path.join(OUT_DIR, `${vpName}-${pageName}${suffix}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`[shot] ${vpName} ${pageName}${suffix}: ${file}`);
}

async function main() {
    const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
    try {
        for (const vp of VIEWPORTS) {
            const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
            const page = await ctx.newPage();
            for (const p of PAGES) {
                if (p.name === 'cart' && vp.name !== 'desktop') continue;
                await page.goto(`${BASE_URL}${p.path}?_=${Date.now()}`, { waitUntil: 'networkidle' });
                await page.waitForTimeout(2000);
                await shoot(page, vp.name, p.name);
            }
            await ctx.close();
        }
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await ctx.newPage();
        await fillCart(page);
        await page.goto(`${BASE_URL}/cart?_=${Date.now()}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2500);
        await shoot(page, 'desktop', 'cart', '-filled');
        await ctx.close();
    } finally {
        await browser.close();
    }
}

main().catch((err) => { console.error('FATAL', err); process.exit(1); });
