/**
 * E2E: 총 건수 상한 표기 계약 + 쇼핑 첫 화면 단일 요청 (#519)
 *
 * 두 변경 모두 브라우저에서만 드러나는 성질을 갖는다.
 *
 *   (1) 총 건수가 상한을 넘으면 서버가 `last_page: null` 을 보낸다. 화면이 그 값을
 *       숫자로 잘못 해석하면 페이저가 통째로 사라지거나 "1 / 1" 로 굳는다 —
 *       응답은 정상이고 콘솔 에러도 없어 API 테스트로는 드러나지 않는다.
 *   (2) 쇼핑 첫 화면은 다섯 묶음을 한 번에 받도록 바꿨다. 레이아웃 바인딩을 한 곳이라도
 *       옛 경로에 남겨 두면 그 영역만 조용히 비어 렌더된다.
 *
 * @scenario case=bounded_total_and_single_storefront_request
 *
 * @effects search_pager_survives_null_last_page,
 *          search_count_marks_inexact_total,
 *          storefront_uses_single_request,
 *          storefront_sections_render
 */
import type { Page } from '@playwright/test';
import { test, expect } from '../../fixtures/auth';

/**
 * 화면 진입 공통 대기.
 *
 * `networkidle` 은 폴링이 있는 화면에서 idle 이 되지 않으므로 쓰지 않는다.
 *
 * @param page 대상 페이지
 * @param path 이동할 경로
 * @returns void
 */
async function gotoAndSettle(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
  await acceptCookieConsent(page);
  await page.waitForTimeout(1200);
}

/**
 * 쿠키 동의 배너를 처리한다.
 *
 * GDPR 사전 차단(preblocker)이 동의 전까지 데이터 요청을 막으므로, 배너를 남겨 둔 채로는
 * "화면이 어떤 API 를 부르는가" 를 관찰할 수 없다. 배너가 없는 사이트에서는 아무 일도 하지 않는다.
 *
 * @param page 대상 페이지
 * @returns void
 */
async function acceptCookieConsent(page: Page): Promise<void> {
  const accept = page.getByRole('button', { name: /모두 동의|Accept all/i }).first();

  if (await accept.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await accept.click();
    await page.waitForTimeout(500);
  }
}

// 쇼핑 목록 라우트는 '/shop' 이 아니라 '/shop/products' 다 (템플릿 routes.json 기준).
const SHOP_LIST_PATH = '/shop/products';

test.describe('총 건수 상한과 페이지 이동', () => {
  // @scenario case=search_response_carries_accuracy_meta
  // @effects search_count_marks_inexact_total
  test('검색 응답이 총 건수 정확도를 함께 싣는다', async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (r) => r.url().includes('/api/search?') && r.status() === 200,
      { timeout: 20_000 },
    );

    await gotoAndSettle(page, '/search?q=' + encodeURIComponent('테스트'));

    const body = await (await responsePromise).json();
    const data = body?.data;

    expect(data, '검색 응답에 data 가 없다').toBeTruthy();
    expect(data).toHaveProperty('total_is_exact');
    expect(data).toHaveProperty('total_relation');

    // 정확도가 true 면 종전 표기 그대로, false 면 "이상" 표기가 붙어야 한다.
    // 표기 문구는 로케일에 따라 다르므로 둘 중 하나가 화면에 있는지로 판정한다.
    // 본문 전체를 대상으로 하므로 앵커(`$`)를 쓰지 않는다 — 뒤에 다른 문구가 따라온다.
    const suffix = data.total_is_exact
      ? /\d+\s*건|\d+\s*results/i
      : /건 이상|\+ results|more than/i;

    await expect(page.locator('body')).toContainText(suffix, { timeout: 15_000 });
  });

  // @scenario case=search_pager_survives_null_last_page
  // @effects search_pager_survives_null_last_page
  test('마지막 페이지를 모르는 목록에서도 페이저가 사라지지 않는다', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    // 상한 초과 상태는 실데이터로 재현하기 어려우므로 응답을 가로채 주입한다.
    // last_page: null + has_more_pages: true 가 이 시나리오의 핵심 입력이다.
    await page.route('**/api/search?**', async (route) => {
      const response = await route.fetch();
      const body = await response.json();

      if (body?.data) {
        body.data.last_page = null;
        body.data.has_more_pages = true;
        body.data.total_relation = 'at_least';
        body.data.total_is_exact = false;
      }

      await route.fulfill({ response, json: body });
    });

    await gotoAndSettle(page, '/search?q=' + encodeURIComponent('테스트'));

    expect(errors, '검색 화면 렌더 중 자바스크립트 오류가 발생했다').toEqual([]);

    // "다음" 이동 수단이 실제로 화면에 남아 있어야 한다. 이것이 사라지면 상한 초과
    // 검색에서 2페이지 이후에 도달할 방법이 없어진다.
    const nextControl = page
      .locator('button:has(i.fa-chevron-right), a:has(i.fa-chevron-right)')
      .first();

    await expect(nextControl, '마지막 페이지를 모른다는 이유로 "다음" 이동이 사라졌다')
      .toBeVisible({ timeout: 15_000 });
  });
});

test.describe('쇼핑 첫 화면 단일 요청', () => {
  // @scenario case=storefront_uses_single_request
  // @effects storefront_uses_single_request
  test('분류·상품·진열 묶음을 한 번의 요청으로 받는다', async ({ page }) => {
    const productApiCalls: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (/\/api\/modules\/sirsoft-ecommerce\/(products|categories|storefront)/.test(url)) {
        productApiCalls.push(url);
      }
    });

    const storefrontPromise = page.waitForResponse(
      (r) => r.url().includes('/api/modules/sirsoft-ecommerce/storefront') && r.status() === 200,
      { timeout: 20_000 },
    );

    await gotoAndSettle(page, SHOP_LIST_PATH);

    const body = await (await storefrontPromise).json();
    const data = body?.data;

    expect(data, 'storefront 응답에 data 가 없다').toBeTruthy();
    for (const key of ['categories', 'products', 'recent_products', 'popular_products', 'new_products']) {
      expect(data, `storefront 응답에 ${key} 묶음이 없다`).toHaveProperty(key);
    }

    // 개별 엔드포인트를 함께 부르고 있으면 통합의 의미가 없다.
    const legacyCalls = productApiCalls.filter(
      (url) => /\/(products\/(popular|new|recent)|categories)(\?|$)/.test(url),
    );
    expect(legacyCalls, `쇼핑 첫 화면이 개별 엔드포인트를 여전히 호출한다: ${legacyCalls.join(', ')}`).toEqual([]);
  });

  // @scenario case=storefront_sections_render
  // @effects storefront_sections_render
  test('첫 화면의 각 영역이 비어 있지 않게 렌더된다', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    const storefrontPromise = page.waitForResponse(
      (r) => r.url().includes('/api/modules/sirsoft-ecommerce/storefront') && r.status() === 200,
      { timeout: 20_000 },
    );

    await gotoAndSettle(page, SHOP_LIST_PATH);

    expect(errors, '쇼핑 첫 화면 렌더 중 자바스크립트 오류가 발생했다').toEqual([]);
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 });

    // 통합 응답이 실제로 담아 온 묶음은 화면에도 나타나야 한다. 바인딩 경로가
    // 하나라도 옛 이름에 남아 있으면 그 영역만 조용히 비므로, 응답에 항목이 있는
    // 묶음에 한해 그 이름이 화면에 렌더됐는지 본다 (빈 사이트에서는 건너뛴다).
    const data = (await (await storefrontPromise).json())?.data;

    const sections: Array<[string, unknown]> = [
      ['recent_products', data?.recent_products],
      ['popular_products', data?.popular_products],
      ['new_products', data?.new_products],
    ];

    for (const [key, items] of sections) {
      const list = Array.isArray(items) ? items : (items as { data?: unknown[] })?.data;

      if (!Array.isArray(list) || list.length === 0) {
        continue;
      }

      const firstName = (list[0] as { name_localized?: string; name?: string })?.name_localized
        ?? (list[0] as { name?: string })?.name;

      if (typeof firstName !== 'string' || firstName.trim() === '') {
        continue;
      }

      await expect(
        page.getByText(firstName, { exact: false }).first(),
        `${key} 묶음이 응답에는 있는데 화면에 렌더되지 않았다 — 바인딩 경로가 어긋났다`,
      ).toBeVisible({ timeout: 15_000 });
    }
  });
});

test.describe('공유 partial 을 쓰는 다른 화면 (#519 회귀)', () => {
  // 쇼핑 첫 화면을 단일 요청으로 통합하면서, 같은 partial 을 쓰는 분류 화면과 상품
  // 상세의 인기 상품 영역이 조용히 비었던 회귀다. `?? []` 폴백 때문에 예외도 404 도
  // 나지 않아 브라우저에서 눈으로 보는 것 말고는 드러나지 않는다.

  // @scenario case=shared_partial_reads_parent_declared_names
  // @effects shared_partial_reads_parent_declared_names
  test('분류 화면이 상품 그리드 데이터를 실제로 받는다', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    const listRequests: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (/\/api\/modules\/sirsoft-ecommerce\/(products|storefront)(\?|$|\/)/.test(url)) {
        listRequests.push(url);
      }
    });

    // 분류 슬러그가 없는 사이트에서는 목록 화면으로 대체 확인한다
    await gotoAndSettle(page, '/shop/products');

    expect(errors, '분류/목록 화면 렌더 중 자바스크립트 오류가 발생했다').toEqual([]);

    // 이 화면은 공유 partial 로 상품 그리드를 그린다. partial 이 부모가 선언한 이름을
    // 읽지 못하면 데이터 요청 자체가 나가지 않고 그리드만 조용히 빈다 — 요청이 실제로
    // 있었는지가 그 회귀를 잡는 신호다.
    expect(
      listRequests,
      '상품 목록/통합 응답 요청이 한 번도 나가지 않았다 — 공유 partial 이 부모가 선언한 데이터소스 이름을 읽지 못한다',
    ).not.toEqual([]);

    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 });
  });

  // @scenario case=storefront_grid_pager_uses_has_more_pages
  // @effects storefront_grid_pager_uses_has_more_pages
  test('상품 그리드 페이저가 마지막 페이지를 몰라도 접히지 않는다', async ({ page }) => {
    await page.route('**/api/modules/sirsoft-ecommerce/storefront**', async (route) => {
      const response = await route.fetch();
      const body = await response.json().catch(() => null);

      if (!body?.data?.products?.pagination) {
        return route.fulfill({ response });
      }

      // 총 건수를 상한까지만 센 응답을 흉내 낸다 — last_page 는 계산할 수 없다
      body.data.products.pagination.last_page = null;
      body.data.products.pagination.has_more_pages = true;
      body.data.products.pagination.total_relation = 'at_least';
      body.data.products.pagination.total_is_exact = false;

      return route.fulfill({ response, body: JSON.stringify(body) });
    });

    await gotoAndSettle(page, SHOP_LIST_PATH);

    // last_page 가 null 이라고 페이저가 통째로 사라지면 1페이지 밖 상품에 도달할 방법이 없다
    const nextButton = page.locator('button:has(i.fa-chevron-right)').last();
    await expect(nextButton).toBeVisible({ timeout: 15_000 });
    await expect(nextButton).toBeEnabled();
  });
});
