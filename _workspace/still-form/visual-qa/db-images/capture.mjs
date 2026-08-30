import { chromium } from 'playwright-core';

const BASE_URL = 'http://127.0.0.1:8000';
const OUT_DIR = '/home/bahamut/20feet/_workspace/still-form/visual-qa/db-images';
const CHROME = process.env.CHROME_PATH
    || '/home/bahamut/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';

const PAGES = [
    { name: 'shop', path: '/shop' },
    { name: 'product-mug', path: '/shop/product/STLMUG0001AB12CD' },
    { name: 'product-glass-cup', path: '/shop/product/STLGLSCUP0002XY' },
    { name: 'product-lamp', path: '/shop/product/STLLAMP0003PQR7' },
];

async function waitForImages(page) {
    await page.evaluate(async () => {
        const imgs = Array.from(document.querySelectorAll('img'));
        await Promise.all(imgs.map((img) => {
            if (img.complete && img.naturalWidth > 0) return Promise.resolve();
            return new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
                setTimeout(resolve, 8000);
            });
        }));
    });
}

async function scrollThrough(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let total = 0;
            const distance = 800;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                total += distance;
                if (total >= document.body.scrollHeight) {
                    clearInterval(timer);
                    window.scrollTo(0, 0);
                    resolve();
                }
            }, 80);
        });
    });
}

async function listImageSources(page) {
    return page.evaluate(() => {
        const seen = new Set();
        for (const img of document.querySelectorAll('img')) {
            if (img.src) seen.add(img.currentSrc || img.src);
        }
        return Array.from(seen);
    });
}

async function main() {
    const browser = await chromium.launch({ executablePath: CHROME });
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    for (const p of PAGES) {
        const url = `${BASE_URL}${p.path}`;
        console.log(`[shot] ${p.name}: ${url}`);
        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            await waitForImages(page);
            await scrollThrough(page);
            await waitForImages(page);
            await page.waitForTimeout(1200);
            const file = `${OUT_DIR}/${p.name}.png`;
            await page.screenshot({ path: file, fullPage: true });
            const sources = await listImageSources(page);
            console.log(`[images] ${p.name}:`);
            for (const s of sources) console.log('  ', s);
            console.log(`[shot] saved ${file}`);
        } catch (e) {
            console.error(`[shot] FAIL ${p.name}:`, e.message);
        }
    }
    await ctx.close();
    await browser.close();
}

main().catch((err) => { console.error('FATAL', err); process.exit(1); });