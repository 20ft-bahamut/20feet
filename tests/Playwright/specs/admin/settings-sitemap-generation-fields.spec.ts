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
  // 체크박스 input 은 sr-only(화면에서 숨김)이고 클릭 대상은 wrapper div(onClick) 이다.
  // input 을 직접 클릭하면 toggle-switch-track 오버레이가 포인터 이벤트를 가로챈다.
  const toggleSwitch = page.locator(`${HREFLANG_ROW} .toggle-switch-wrapper`).first();

  const wasChecked = await toggle.isChecked();

  // 토글을 반대 상태로 바꾼다
  await toggleSwitch.click();
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
  await page.locator(`${HREFLANG_ROW} .toggle-switch-wrapper`).first().click();
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
// @effects regenerate_is_async, progress_visible
test('#481 - "지금 생성" 클릭이 큐에 예약되고 진행상황이 화면에 표시된다', async ({ page }) => {
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
  // 예약 즉시 진행상황이 'queued' 로 실려 온다 (동기 생성이 아니라 큐 예약)
  expect((await response.json())?.data?.progress?.status).toBe('queued');

  // 동기 생성으로 되돌아가면 응답 시간이 데이터 규모에 비례해 늘어난다.
  // 절대 하한 대신 "예약 응답이라면 당연히 만족하는" 상한으로 회귀만 잡는다.
  expect(elapsed).toBeLessThan(10_000);

  // 진행상황 블록이 화면에 나타나고 상태 배지가 미해석 키가 아닌 실제 문구로 렌더된다
  const progressBlock = page.locator('#sitemap_progress_block');
  await expect(progressBlock).toBeAttached({ timeout: 15_000 });
  const progressText = (await progressBlock.innerText()).trim();
  expect(progressText).not.toContain('$t:');
  expect(progressText.length).toBeGreaterThan(0);
});

// @scenario tab=seo, permitted=yes
// @effects status_endpoint
test('#481 - SEO 탭 진입 시 sitemap 상태 API 가 진행상황/실시간 여부를 반환한다', async ({ page }) => {
  const token = issueToken('core.settings.read', 'core.settings.update');
  await authenticatePage(page, token);

  const status = page.waitForResponse(
    (r) => r.url().includes('/api/admin/seo/sitemap/status') && r.request().method() === 'GET',
    { timeout: 20_000 }
  );

  await gotoSeoTab(page);

  const res = await status;
  expect(res.status()).toBe(200);
  const body = await res.json();
  // 상태 응답 스키마: 진행상황(progress) + 실시간 연결 가능 여부(realtime_enabled)
  expect(body?.data).toHaveProperty('realtime_enabled');
  expect(body?.data).toHaveProperty('progress');
  expect(body?.data).toHaveProperty('last_updated_at');
});

// @scenario tab=seo, permitted=yes
// @effects regenerate_is_async
test('#481 - 재생성 후 실시간/폴링 모드에 맞게 진행상황이 갱신된다', async ({ page }) => {
  const token = issueToken('core.settings.read', 'core.settings.update');
  await authenticatePage(page, token);

  // 상태(GET) 응답을 가로채 실시간 여부 판정 + 재조회 횟수 카운트 (앱의 인증 요청 기준)
  let realtimeEnabled: boolean | null = null;
  let statusGets = 0;
  page.on('response', async (r) => {
    if (r.url().includes('/api/admin/seo/sitemap/status') && r.request().method() === 'GET') {
      statusGets += 1;
      if (realtimeEnabled === null) {
        try { realtimeEnabled = (await r.json())?.data?.realtime_enabled === true; } catch { /* ignore */ }
      }
    }
  });

  await gotoSeoTab(page);
  await expect.poll(() => realtimeEnabled, { timeout: 20_000 }).not.toBeNull();

  // 여기부터 재생성 이후의 폴링만 센다
  statusGets = 0;
  await page.locator('#sitemap_last_updated_block button').first().click();
  await page.waitForResponse((r) => r.url().includes('/api/admin/seo/sitemap/regenerate'), { timeout: 20_000 });

  const pollingMode = realtimeEnabled === false;

  // 8초 관찰
  await page.waitForTimeout(8_000);

  if (pollingMode) {
    // Reverb OFF: startInterval 폴링이 상태를 반복 재조회해야 한다.
    // 회귀(폴링 미시작) 시 재생성 직후 refetch 1회로 멈춰 배지가 갱신되지 않는다.
    expect(statusGets).toBeGreaterThanOrEqual(2);
  } else {
    // 실시간(WebSocket) 모드면 폴링하지 않는다 — 재생성 직후 refetch 수준
    expect(statusGets).toBeLessThanOrEqual(2);
  }
});
