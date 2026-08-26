import { chromium } from 'playwright-core';

const BASE_URL = 'http://127.0.0.1:8000';

async function check(browser, viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => {
    const heroP = document.querySelector('[data-testid="home-hero"] p');
    const navLink = document.querySelector('[data-testid="header-nav"] a');
    const portfolioSummary = document.querySelector('[data-testid="portfolio-item"] p');
    const hero = document.querySelector('[data-testid="home-hero"]');
    const portfolio = document.querySelector('[data-testid="selected-portfolio"]');
    const header = document.querySelector('[data-testid="site-header"]');
    const headerRow = header ? header.querySelector('[data-testid="container"] > div') : null;
    const cta = header ? header.querySelector('[data-testid="header-cta"]') : null;

    const styles = {};
    [heroP, navLink, portfolioSummary].forEach((el, i) => {
      const key = ['heroP', 'navLink', 'portfolioSummary'][i];
      styles[key] = el ? window.getComputedStyle(el).fontFamily : null;
    });

    const heroRect = hero ? hero.getBoundingClientRect() : null;
    const portfolioRect = portfolio ? portfolio.getBoundingClientRect() : null;
    const headerRect = header ? header.getBoundingClientRect() : null;
    const headerRowRect = headerRow ? headerRow.getBoundingClientRect() : null;
    const ctaRect = cta ? cta.getBoundingClientRect() : null;

    return {
      styles,
      heroBottom: heroRect ? heroRect.bottom : null,
      portfolioTop: portfolioRect ? portfolioRect.top : null,
      gapPx: heroRect && portfolioRect ? portfolioRect.top - heroRect.bottom : null,
      headerHeightPx: headerRect ? headerRect.height : null,
      headerRowHeightPx: headerRowRect ? headerRowRect.height : null,
      headerRowAlignItems: headerRow ? window.getComputedStyle(headerRow).alignItems : null,
      ctaVerticalCenterOffset: headerRowRect && ctaRect ? (ctaRect.top + ctaRect.height/2) - (headerRowRect.top + headerRowRect.height/2) : null,
      oldErrorInText: document.body.innerText.includes('데이터를 표시할 수 없습니다'),
      fixtureCount: {
        portfolio: document.querySelectorAll('[data-testid="portfolio-item"]').length,
        superbify: document.querySelectorAll('[data-testid="superbify-preview-item"]').length,
      }
    };
  });

  await ctx.close();
  return { viewport: `${viewport.width}x${viewport.height}`, info };
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/bahamut/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const results = await Promise.all([
      check(browser, { width: 1280, height: 800 }),
      check(browser, { width: 768, height: 1024 }),
      check(browser, { width: 390, height: 844 }),
    ]);
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})();
