import { chromium } from 'playwright-core';

const BASE_URL = 'http://127.0.0.1:8000';
const OUT_DIR = '/home/bahamut/20feet/_workspace/still-form/visual-qa/polish-01';
const CART_KEY = 'ck_jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj';

const PAGES = [
    { name: 'home',            path: '/' },
];

const VIEWPORTS = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'desktop-1920', width: 1920, height: 1080 },
    { name: 'mobile-430',   width: 430,  height: 932 },
    { name: 'mobile-390',   width: 390,  height: 844 },
];

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

async function main() {
    const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
    for (const vp of VIEWPORTS) {
        const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        await ctx.addInitScript((key) => {
            try { localStorage.setItem('g7_cart_key', key); } catch (e) {}
        }, CART_KEY);
        const page = await ctx.newPage();
        for (const p of PAGES) {
            const url = `${BASE_URL}${p.path}`;
            console.log(`[shot] ${vp.name} ${p.name}: ${url}`);
            try {
                await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
                await waitForImages(page);
                // Scroll through page to force lazy-load, then back to top
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
                await waitForImages(page);
                await page.waitForTimeout(1500);
                const file = `${OUT_DIR}/${vp.name}-${p.name}.png`;
                await page.screenshot({ path: file, fullPage: true });
                console.log(`[shot] saved ${file}`);
            } catch (e) {
                console.error(`[shot] FAIL ${vp.name} ${p.name}:`, e.message);
            }
        }
        await ctx.close();
    }
    await browser.close();
}

main().catch((err) => { console.error('FATAL', err); process.exit(1); });
