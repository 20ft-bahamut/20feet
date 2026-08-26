import { chromium } from 'playwright-core';
const BASE_URL = 'http://127.0.0.1:8000';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/bahamut/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.click('[data-testid="header-menu-trigger"]');
  await page.waitForTimeout(300);
  const menuVisible = await page.isVisible('[data-testid="header-mobile-menu"]');
  const menuText = await page.textContent('[data-testid="header-mobile-menu"]');
  await ctx.close();
  await browser.close();
  console.log(JSON.stringify({ menuVisible, menuText: (menuText || '').trim().replace(/\s+/g, ' ').slice(0, 200) }, null, 2));
})();
