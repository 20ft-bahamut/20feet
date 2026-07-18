/**
 * E2E: 환경설정 > SEO/고급 — Sitemap 생성 설정 칸 (#481)
 *
 * @scenario admin_settings_sitemap_generation_fields
 * @effects fields_mounted, fields_persisted, regenerate_is_async
 *
 * 배경: 대용량 사이트에서 sitemap 을 여러 파일로 나눠 생성하도록 분할 기준/압축 설정을
 * 추가하고, 관리자 "지금 생성" 버튼을 즉시 실행에서 큐 예약으로 바꿨다. 설정 칸이 실제로
 * 마운트·저장되는지, 재생성 버튼이 응답을 기다리며 멈추지 않는지 브라우저에서 확인한다.
 *
 * 검증:
 *  1. SEO 탭에 분할 기준/압축 칸이 번역문과 함께 마운트된다
 *  2. 분할 기준을 바꿔 저장하면 422 없이 성공하고 재진입 시 유지된다
 *  3. 고급 탭에 Sitemap 캐시 기준값 칸이 마운트되고 기본값(86400)이 저장된다
 *  4. "지금 생성" 클릭이 즉시 응답을 받는다 (동기 생성이면 대용량에서 타임아웃)
 */
import { test, expect, issueToken, authenticatePage } from '../../fixtures/auth';

const URLS_PER_FILE = '#field_sitemap_urls_per_file';
const GZIP_ROW = '#field_sitemap_gzip';
const HREFLANG_ROW = '#field_sitemap_hreflang_enabled';
const ADVANCED_SITEMAP_CACHE = '#cache_seo_sitemap';

/** 관리자 환경설정 SEO 탭 진입 */
async function gotoSeoTab(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/admin/settings?tab=seo');
  await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
  await expect(page.locator(URLS_PER_FILE)).toBeAttached({ timeout: 20_000 });
}

/** 관리자 환경설정 고급 탭 진입 */
async function gotoAdvancedTab(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/admin/settings?tab=advanced');
  await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
  await expect(page.locator(ADVANCED_SITEMAP_CACHE)).toBeAttached({ timeout: 20_000 });
}

// @scenario tab=seo, permitted=yes
// @effects fields_mounted
test('@smoke #481 - SEO 탭에 Sitemap 분할 기준/압축 칸이 번역문과 함께 마운트된다', async ({ page }) => {
  const token = issueToken('core.settings.read', 'core.settings.update');
  await authenticatePage(page, token);

  await gotoSeoTab(page);
  expect(page.url()).not.toMatch(/\/admin\/login/);

  const urlsPerFile = page.locator(URLS_PER_FILE);
  await expect(urlsPerFile).toBeAttached();

  // 다국어 키 미해석 회귀 가드
  const urlsText = (await urlsPerFile.innerText()).trim();
  expect(urlsText).not.toContain('$t:');
  expect(urlsText.length).toBeGreaterThan(0);

  // 프로토콜 상한이 입력 단계에서 그대로 반영된다
  const input = urlsPerFile.locator('input[type="number"]').first();
  await expect(input).toHaveAttribute('max', '50000');
  await expect(input).toHaveAttribute('min', '1000');

  const gzipRow = page.locator(GZIP_ROW);
  await expect(gzipRow).toBeAttached();
  expect((await gzipRow.innerText()).trim()).not.toContain('$t:');
  await expect(gzipRow.locator('input[type="checkbox"]').first()).toBeAttached();

  const hreflangRow = page.locator(HREFLANG_ROW);
  await expect(hreflangRow).toBeAttached();
  expect((await hreflangRow.innerText()).trim()).not.toContain('$t:');
  await expect(hreflangRow.locator('input[type="checkbox"]').first()).toBeAttached();
});

// @scenario tab=seo, permitted=yes
// @effects fields_persisted
test('#481 - hreflang 토글을 바꿔 저장하면 성공하고 재진입 시 유지된다', async ({ page }) => {
  const token = issueToken('core.settings.read', 'core.settings.update');
  await authenticatePage(page, token);

  await gotoSeoTab(page);

  const toggle = page.locator(`${HREFLANG_ROW} input[type="checkbox"]`).first();
  await expect(toggle).toBeAttached({ timeout: 15_000 });

  const wasChecked = await toggle.isChecked();

  // 토글을 반대 상태로 바꾼다
  await toggle.click();
  await expect(page.locator('#save_button')).toBeEnabled({ timeout: 10_000 });

  const save = page.waitForResponse(
    (r) => r.url().includes('/api/admin/settings') && r.request().method() === 'POST',
    { timeout: 20_000 }
  );
  await page.locator('#save_button').click();

  // 신규 boolean 키가 검증 규칙에 없으면 422 로 떨어진다 (배관 누락 회귀 가드)
  expect((await save).status()).toBe(200);

  await gotoSeoTab(page);
  const reloaded = page.locator(`${HREFLANG_ROW} input[type="checkbox"]`).first();
  await expect.poll(() => reloaded.isChecked(), { timeout: 15_000 }).toBe(!wasChecked);

  // 원상 복구 (E2E 는 실제 환경 설정을 건드린다)
  await reloaded.click();
  const restore = page.waitForResponse(
    (r) => r.url().includes('/api/admin/settings') && r.request().method() === 'POST',
    { timeout: 20_000 }
  );
  await page.locator('#save_button').click();
  expect((await restore).status()).toBe(200);
});

// @scenario tab=seo, permitted=yes
// @effects fields_persisted
test('#481 - 분할 기준을 바꿔 저장하면 성공하고 재진입 시 유지된다', async ({ page }) => {
  const token = issueToken('core.settings.read', 'core.settings.update');
  await authenticatePage(page, token);

  await gotoSeoTab(page);

  const input = page.locator(`${URLS_PER_FILE} input[type="number"]`).first();

  // 폼이 저장된 설정으로 채워진 뒤에 수정해야 한다 (로드 전 입력은 다른 필드가 빈 채로 전송됨)
  await expect.poll(() => input.inputValue(), { timeout: 15_000 }).not.toBe('');

  const original = await input.inputValue();
  const next = original === '30000' ? '40000' : '30000';

  await input.fill(next);
  await expect(page.locator('#save_button')).toBeEnabled({ timeout: 10_000 });

  const save = page.waitForResponse(
    (r) => r.url().includes('/api/admin/settings') && r.request().method() === 'POST',
    { timeout: 20_000 }
  );
  await page.locator('#save_button').click();

  // 신규 키가 검증 규칙에 없으면 422 로 떨어진다 (배관 누락 회귀 가드)
  expect((await save).status()).toBe(200);

  await gotoSeoTab(page);
  const reloaded = page.locator(`${URLS_PER_FILE} input[type="number"]`).first();
  await expect.poll(() => reloaded.inputValue(), { timeout: 15_000 }).toBe(next);

  // 원상 복구 (E2E 는 실제 환경 설정을 건드린다)
  await reloaded.fill(original);
  const restore = page.waitForResponse(
    (r) => r.url().includes('/api/admin/settings') && r.request().method() === 'POST',
    { timeout: 20_000 }
  );
  await page.locator('#save_button').click();
  expect((await restore).status()).toBe(200);
});

// @scenario tab=advanced, permitted=yes
// @effects fields_mounted, fields_persisted
test('#481 - 고급 탭 Sitemap 캐시 기준값 칸이 마운트되고 기본값이 저장된다', async ({ page }) => {
  const token = issueToken('core.settings.read', 'core.settings.update');
  await authenticatePage(page, token);

  await gotoAdvancedTab(page);

  const row = page.locator(ADVANCED_SITEMAP_CACHE);
  await expect(row).toBeAttached();
  expect((await row.innerText()).trim()).not.toContain('$t:');

  const input = row.locator('input[type="number"]').first();
  await expect(input).toBeAttached();

  // 폼이 저장된 설정으로 채워진 뒤에 수정해야 한다 (로드 전 입력은 다른 필드가 빈 채로 전송됨)
  await expect.poll(() => input.inputValue(), { timeout: 15_000 }).not.toBe('');

  const original = await input.inputValue();
  // 기본값 86400 은 형제 칸 규칙(최대 14400)을 재사용하면 저장 자체가 막힌다
  const next = original === '86400' ? '43200' : '86400';

  await input.fill(next);
  await expect(page.locator('#save_button')).toBeEnabled({ timeout: 10_000 });

  const save = page.waitForResponse(
    (r) => r.url().includes('/api/admin/settings') && r.request().method() === 'POST',
    { timeout: 20_000 }
  );
  await page.locator('#save_button').click();

  expect((await save).status()).toBe(200);

  // 원상 복구 (E2E 는 실제 환경 설정을 건드린다)
  await gotoAdvancedTab(page);
  const restored = page.locator(`${ADVANCED_SITEMAP_CACHE} input[type="number"]`).first();
  await expect.poll(() => restored.inputValue(), { timeout: 15_000 }).toBe(next);
  await restored.fill(original);
  const restore = page.waitForResponse(
    (r) => r.url().includes('/api/admin/settings') && r.request().method() === 'POST',
    { timeout: 20_000 }
  );
  await page.locator('#save_button').click();
  expect((await restore).status()).toBe(200);
});

// @scenario tab=seo, permitted=yes
// @effects regenerate_is_async
test('#481 - "지금 생성" 클릭이 큐에 예약되고 즉시 응답한다', async ({ page }) => {
  const token = issueToken('core.settings.read', 'core.settings.update');
  await authenticatePage(page, token);

  await gotoSeoTab(page);

  const regenerate = page.waitForResponse(
    (r) => r.url().includes('/api/admin/seo/sitemap/regenerate'),
    { timeout: 20_000 }
  );

  const startedAt = Date.now();
  await page.locator('#sitemap_last_updated_block button').first().click();
  const response = await regenerate;
  const elapsed = Date.now() - startedAt;

  expect(response.status()).toBe(200);
  expect((await response.json())?.data?.status).toBe('dispatched');

  // 동기 생성으로 되돌아가면 응답 시간이 데이터 규모에 비례해 늘어난다.
  // 절대 하한 대신 "예약 응답이라면 당연히 만족하는" 상한으로 회귀만 잡는다.
  expect(elapsed).toBeLessThan(10_000);
});
