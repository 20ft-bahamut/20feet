import { chromium } from 'playwright-core';

const BASE_URL = 'http://127.0.0.1:8000';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const MUST_HAVE_TEXT = [
  '20ft Website',
  'Preview Project',
  'SuperBify Turnstile',
  'SuperBify Business',
  'SuperBify Developer Tools',
  'Portfolio',
  'SuperBify',
  '프로젝트 문의',
];

const MUST_NOT_HAVE_TEXT = [
  '데이터를 표시할 수 없습니다',
];

const ALL_ASSETS = [
  `${BASE_URL}/api/templates/assets/twentyft-studio/css/components.css`,
  `${BASE_URL}/api/templates/assets/twentyft-studio/js/components.iife.js`,
  `${BASE_URL}/build/core/template-engine.min.js`,
  'https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/Paperlogy.css',
  'https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css',
  'https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/Paperlogy-7Bold.woff2',
  'https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.woff2',
];

async function fetchAssets() {
  const results = [];
  for (const url of ALL_ASSETS) {
    try {
      const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(15000) });
      results.push({ url, status: res.status, ok: res.ok });
    } catch (e) {
      results.push({ url, status: 0, ok: false, error: e.message });
    }
  }
  return results;
}

async function checkPage(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  const consoleMessages = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => consoleMessages.push({ type: 'pageerror', text: err.message }));
  page.on('response', async res => {
    if (!res.ok() && res.request().resourceType() !== 'document') {
      consoleMessages.push({ type: 'network-error', text: `${res.url()} => ${res.status()}` });
    }
  });

  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    const bodyText = await page.evaluate(() => document.body.innerText);
    const missing = MUST_HAVE_TEXT.filter(s => !bodyText.includes(s));
    const forbidden = MUST_NOT_HAVE_TEXT.filter(s => bodyText.includes(s));

    const styles = await page.evaluate(() => {
      const header = document.querySelector('[data-testid="site-header"]');
      const headerInner = header ? header.querySelector('[data-testid="header-desktop-group"]') || header.firstElementChild : null;
      const hero = document.querySelector('[data-testid="home-hero"]');
      const portfolio = document.querySelector('[data-testid="selected-portfolio"]');
      const firstContainer = document.querySelector('[data-testid="container"]');
      const heroH1 = document.querySelector('h1');
      const body = document.body;
      const getComputed = (el, prop) => el ? window.getComputedStyle(el)[prop] : null;
      return {
        headerHeight: header ? header.getBoundingClientRect().height : null,
        headerDisplay: getComputed(header, 'display'),
        headerInnerAlign: getComputed(headerInner, 'alignItems'),
        heroPaddingBottom: getComputed(hero, 'paddingBottom'),
        portfolioPaddingTop: getComputed(portfolio, 'paddingTop'),
        firstContainerMaxWidth: getComputed(firstContainer, 'maxWidth'),
        firstContainerMarginInline: getComputed(firstContainer, 'marginInline'),
        firstContainerPaddingInline: getComputed(firstContainer, 'paddingInline'),
        bodyFontFamily: getComputed(body, 'fontFamily'),
        heroH1FontFamily: getComputed(heroH1, 'fontFamily'),
        heroH1FontWeight: getComputed(heroH1, 'fontWeight'),
      };
    });

    const mobileMenuVisible = await page.evaluate(() => {
      const trigger = document.querySelector('[data-testid="header-menu-trigger"]');
      if (!trigger) return { triggerVisible: false };
      const rect = trigger.getBoundingClientRect();
      return { triggerVisible: rect.width > 0 && rect.height > 0 };
    });

    return {
      viewport: viewport.name,
      missingFixtureItems: missing,
      forbiddenText: forbidden,
      consoleErrors: consoleMessages,
      styles,
      mobileMenuTriggerVisible: mobileMenuVisible.triggerVisible,
    };
  } catch (e) {
    return { viewport: viewport.name, error: e.message, consoleErrors: consoleMessages };
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/bahamut/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const assets = await fetchAssets();
    const pageChecks = [];
    for (const vp of VIEWPORTS) {
      pageChecks.push(await checkPage(browser, vp));
    }
    console.log(JSON.stringify({ assets, pageChecks }, null, 2));
  } finally {
    await browser.close();
  }
})();
