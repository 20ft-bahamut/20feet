import { chromium } from '/mnt/wslg/distro/home/bahamut/20feet/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
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
await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/desktop-1440-viewport.png' });
console.log('saved viewport screenshot');
await browser.close();
