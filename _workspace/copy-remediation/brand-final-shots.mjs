import { chromium } from 'playwright-core';
const BASE = 'http://127.0.0.1:8000';
const OUT = '/home/bahamut/20feet/_workspace/copy-remediation/screenshots';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });

const EXPECT = {
    hero: ['조용한 일상의', '물건들', '눈에 띄기보다 곁에 오래 남는 것.', '매일 손이 가고, 쓰일수록 편안해지는 생활의 도구를 고릅니다.', 'Shop 둘러보기', 'Brand Story'],
    story: ['BRAND STORY', '오래 두고 쓰는 물건에는', '이유가 있습니다.', '재질은 손에 닿는 감촉으로,', '형태는 실제 쓰임으로 봅니다.', 'Still Form은 유행보다 오래 쓰이고,', '생활 속에 자연스럽게 남는 물건을 고릅니다.', 'Still Form의 기준'],
    editorial: ['EDITORIAL', '자주 쓰는 것일수록,', '더 단순하게.', '컵 하나, 조명 하나, 트레이 하나도', '매일 손이 가는 방식은 다릅니다.', '복잡한 장식보다 쓰기 편하고,', '곁에 두기 좋은 형태를 고릅니다.', '상품 둘러보기'],
    final: ['EXPLORE', '매일 쓰는 물건부터', '천천히 골라보세요.', '컵, 조명, 트레이, 패브릭처럼', '생활 가까이에 두는 물건을 한곳에서 만나보세요.', '전체 상품 보기'],
};
const results = [];
for (const [tag, vw, vh] of [['desktop-1440', 1440, 900], ['mobile-430', 430, 932], ['mobile-390', 390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, locale: 'ko-KR' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    const body = await page.evaluate(() => document.body.innerText);
    const missing = Object.entries(EXPECT).flatMap(([k, list]) => list.filter(t => !body.includes(t)).map(t => `${k}:${t}`));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const secs = [['home-hero-copy', '[data-testid="hero-banner"]'], ['home-brand-story-copy', '[data-testid="brand-story-section"]'], ['home-editorial-copy', '[data-testid*="editorial"]'], ['home-final-cta-copy', 'section:has(#home_final_cta_heading)']];
    for (const [name, sel] of secs) {
        const el = page.locator(sel).first();
        if (await el.count()) await el.screenshot({ path: `${OUT}/${name}-${tag}.png` }).catch(e => console.log('shot fail', name, String(e).slice(0, 60)));
        else console.log('SEL MISS', name, tag);
    }
    await page.screenshot({ path: `${OUT}/home-fullpage-${tag}.png`, fullPage: true });
    const hrefs = await page.evaluate(() => [...document.querySelectorAll('a')].filter(a => ['Shop 둘러보기', 'Brand Story', 'Still Form의 기준', '상품 둘러보기', '전체 상품 보기'].includes(a.textContent.trim())).map(a => `${a.textContent.trim()} => ${a.getAttribute('href')}`));
    await page.goto(`${BASE}/shop/story`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    const sbody = await page.evaluate(() => document.body.innerText);
    const smissing = ['STORY', '오래 곁에 둘 물건을', '고릅니다.', 'Still Form은 생활 가까이에서', '매일 쓰는 물건을 다룹니다.', '화려함보다 쓰임을,', '유행보다 오래 남는 형태를,', '장식보다 손에 닿는 재질을 먼저 봅니다.'].filter(t => !sbody.includes(t));
    const h1text = await page.evaluate(() => document.querySelector('h1')?.innerText?.replace(/\n/g, '⏎'));
    const h1count = await page.evaluate(() => document.querySelectorAll('h1').length);
    await page.screenshot({ path: `${OUT}/story-hero-copy-${tag}.png`, fullPage: true });
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const homeH1 = await page.evaluate(() => document.querySelectorAll('h1').length);
    results.push({ tag, missing: [...missing, ...smissing.map(t => 'story-page:' + t)], overflow, errors, hrefs, h1count, h1text, homeH1 });
    await ctx.close();
}
await browser.close();
for (const r of results) {
    console.log(`${r.missing.length === 0 && r.errors.length === 0 ? 'PASS' : 'FAIL'} ${r.tag} overflow=${r.overflow} storyH1=${r.h1count}(${r.h1text}) homeH1=${r.homeH1}`);
    if (r.missing.length) console.log('  missing:', JSON.stringify(r.missing));
    if (r.errors.length) console.log('  errors:', r.errors[0]?.slice(0, 100));
    if (r.tag === 'desktop-1440') r.hrefs.forEach(h => console.log('  CTA', h));
}