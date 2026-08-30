import { chromium } from 'playwright-core';

const BASE_URL = 'http://127.0.0.1:8000';
const OUT_DIR = '/home/bahamut/20feet/_workspace/still-form/visual-qa/brand-01';
const TAG = process.argv[2] || 'before';

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

async function shot(page, locator, file) {
    const el = page.locator(locator).first();
    try {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        await el.screenshot({ path: file });
        console.log('[shot] saved', file);
        return true;
    } catch (e) {
        console.error('[shot] FAIL', file, e.message);
        return false;
    }
}

async function main() {
    const browser = await chromium.launch({
        executablePath: process.env.CHROME_PATH,
        args: ['--force-color-profile=srgb'],
    });
    for (const vp of [
        { name: 'desktop-1440', width: 1440, height: 900 },
        { name: 'mobile-430', width: 430, height: 932 },
    ]) {
        const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
        const page = await ctx.newPage();
        try {
            await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 45000 });
        } catch (e) { console.error('[nav]', e.message); }
        await waitForImages(page);
        await page.waitForTimeout(900);

        // Header + hero (top of page)
        const clipH = vp.name === 'desktop-1440' ? 760 : 640;
        await page.screenshot({ path: `${OUT_DIR}/${vp.name}-${TAG}-header-hero.png`, clip: { x: 0, y: 0, width: vp.width, height: clipH } });
        console.log('[shot] saved', `${OUT_DIR}/${vp.name}-${TAG}-header-hero.png`);

        // Header only
        await shot(page, '[data-testid="store-header"]', `${OUT_DIR}/${vp.name}-${TAG}-header.png`);

        if (vp.name === 'desktop-1440') {
            await shot(page, '[data-testid="brand-story-section"]', `${OUT_DIR}/${vp.name}-${TAG}-brand-story.png`);
        }
        await shot(page, '[data-testid="store-footer"]', `${OUT_DIR}/${vp.name}-${TAG}-footer.png`);
        await ctx.close();
    }
    await browser.close();
}

main().catch((err) => { console.error('FATAL', err); process.exit(1); });