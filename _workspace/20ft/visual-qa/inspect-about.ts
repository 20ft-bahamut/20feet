import { chromium, type Browser, type Page } from '@playwright/test';

const VIEWPORTS = [
    { name: '1440', width: 1440, height: 1000 },
    { name: '768', width: 768, height: 1024 },
    { name: '430', width: 430, height: 932 },
    { name: '390', width: 390, height: 844 },
];

const BASE_URL = 'http://127.0.0.1:8000/about';
const OUT_DIR = '/home/bahamut/20feet/_workspace/20ft/visual-qa';

async function inspectViewport(page: Page, viewport: { name: string; width: number; height: number }): Promise<void> {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const revealSelectors = [
        '[data-testid="about-hero"]',
        '[data-testid="about-why"]',
        '[data-testid="about-person"]',
        '[data-testid="about-garage"]',
        '[data-testid="about-what-we-build"]',
        '[data-testid="about-superbify"]',
        '[data-testid="about-just-for-fun"]',
        '[data-testid="about-final-cta"]',
    ];
    for (const selector of revealSelectors) {
        await page.locator(selector).scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);

    const screenshotPath = `${OUT_DIR}/about-${viewport.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const metrics = await page.evaluate((w) => {
        const html = document.documentElement;
        const body = document.body;
        const elements = [
            { key: 'page', selector: '[data-testid="about-page"]' },
            { key: 'hero', selector: '[data-testid="about-hero"]' },
            { key: 'heroHeading', selector: 'h1' },
            { key: 'heroSymbol', selector: '[data-testid="about-hero-symbol"]' },
            { key: 'why', selector: '[data-testid="about-why"]' },
            { key: 'person', selector: '[data-testid="about-person"]' },
            { key: 'garage', selector: '[data-testid="about-garage"]' },
            { key: 'whatWeBuild', selector: '[data-testid="about-what-we-build"]' },
            { key: 'superbify', selector: '[data-testid="about-superbify"]' },
            { key: 'justForFun', selector: '[data-testid="about-just-for-fun"]' },
            { key: 'finalCta', selector: '[data-testid="about-final-cta"]' },
        ];

        const rects: Record<string, { left: number; right: number; top: number; bottom: number; width: number; height: number } | null> = {};
        for (const el of elements) {
            const node = document.querySelector(el.selector);
            if (node) {
                const r = node.getBoundingClientRect();
                rects[el.key] = {
                    left: r.left,
                    right: r.right,
                    top: r.top,
                    bottom: r.bottom,
                    width: r.width,
                    height: r.height,
                };
            } else {
                rects[el.key] = null;
            }
        }

        const overflowing: Array<{ tag: string; class: string; left: number; right: number }> = [];
        for (const node of document.querySelectorAll('*')) {
            const r = node.getBoundingClientRect();
            if (r.width > 0 && r.height > 0 && (r.left < -1 || r.right > w + 1)) {
                const style = window.getComputedStyle(node);
                if (style.position === 'fixed' || style.position === 'sticky') continue;
                if (r.left < -500 || r.right > w + 500) continue;
                overflowing.push({
                    tag: node.tagName.toLowerCase(),
                    class: node.className || '',
                    left: Math.round(r.left),
                    right: Math.round(r.right),
                });
            }
        }

        return {
            scrollWidth: html.scrollWidth,
            clientWidth: html.clientWidth,
            bodyScrollWidth: body.scrollWidth,
            innerWidth: w,
            rects,
            overflowCount: overflowing.length,
            firstOverflow: overflowing.slice(0, 5),
        };
    }, viewport.width);

    console.log(`\n=== ${viewport.name} ===`);
    console.log(
        `scrollWidth: ${metrics.scrollWidth}, clientWidth: ${metrics.clientWidth}, innerWidth: ${metrics.innerWidth}, bodyScrollWidth: ${metrics.bodyScrollWidth}`
    );
    console.log('Bounding rects:', JSON.stringify(metrics.rects, null, 2));
    console.log(`Overflow count: ${metrics.overflowCount}`);
    if (metrics.firstOverflow.length) {
        console.log('First overflow elements:', JSON.stringify(metrics.firstOverflow, null, 2));
    }
    console.log(`Screenshot: ${screenshotPath}`);
}

async function main(): Promise<void> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    for (const viewport of VIEWPORTS) {
        await inspectViewport(page, viewport);
    }

    await browser.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
