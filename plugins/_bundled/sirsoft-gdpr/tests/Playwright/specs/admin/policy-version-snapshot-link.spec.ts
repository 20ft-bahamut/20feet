/**
 * E2E: 관리자 환경설정 > 쿠키 배너 > 정책 버전 > 보기 — 본문 페이지 링크 (#509 체크리스트 12번)
 *
 * @scenario admin_gdpr_policy_version_snapshot_open_policy_page_link
 * @effects snapshot_modal_opens, policy_page_link_href_matches_page_module_url_pattern
 *
 * 배경: 정책 버전 snapshot 모달의 본문 페이지 링크가 `/{{slug}}` 로 조합되어 페이지 모듈
 * (sirsoft-page) 의 실제 URL 패턴 `/page/{slug}` 와 불일치, 클릭 시 404 가 발생하던 결함.
 * 마이그레이션이 시드하는 v1 initial 정책 버전의 snapshot 에는 항상 기본 슬러그 'privacy' 가
 * 포함되므로 (GdprPolicyVersionMigrationSmokeTest 참조), 별도 설정 저장 없이도 v배지 클릭 →
 * 모달의 본문 페이지 링크 href 를 검증할 수 있다.
 *
 * 검증:
 *  1. 환경설정 화면에서 v배지 옆 "본문 보기" 버튼 클릭 시 snapshot 모달이 열린다
 *  2. 모달의 본문 페이지 링크 href 가 `/page/{slug}` 형식으로 조합되어 페이지 모듈 URL 패턴과 일치한다
 *     (프리픽스 누락으로 `/{slug}` 형태가 되는 결함 패턴이 재발하지 않았는지 회귀 가드)
 */
import { test, expect, authenticatePage } from '../../fixtures/gdpr-auth';

const CARD_COOKIE_BANNER = '#card_cookie_banner';
const SNAPSHOT_VIEW_BUTTON = '#policy_version_current_snapshot_view_button';
const OPEN_POLICY_PAGE_LINK = '#policy_version_snapshot_open_policy_page_link';

/** 관리자 GDPR 환경설정 진입 후 쿠키 배너 탭(정책 버전 UI 포함)으로 스크롤 이동 */
async function gotoGdprSettings(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/admin/plugins/sirsoft-gdpr/settings');
  await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
  await expect(page.locator('#settings_tab_navigation')).toBeAttached({ timeout: 20_000 });

  // TabNavigationScroll 은 URL query 가 아니라 클릭 시 해당 카드로 스크롤하는 방식이다.
  await page.locator(CARD_COOKIE_BANNER).scrollIntoViewIfNeeded();
  await expect(page.locator(SNAPSHOT_VIEW_BUTTON)).toBeAttached({ timeout: 20_000 });
}

// @scenario tab=card_cookie_banner, permitted=yes
// @effects snapshot_modal_opens, policy_page_link_href_matches_page_module_url_pattern
test('#509 - 정책 버전 snapshot 모달의 본문 페이지 링크가 /page/{slug} 로 조합된다', async ({ page, privacyManageToken }) => {
  await authenticatePage(page, privacyManageToken);

  await gotoGdprSettings(page);
  expect(page.url()).not.toMatch(/\/admin\/login/);

  await page.locator(SNAPSHOT_VIEW_BUTTON).click();

  const link = page.locator(OPEN_POLICY_PAGE_LINK);
  await expect(link).toBeAttached({ timeout: 10_000 });

  const href = await link.getAttribute('href');
  expect(href).not.toBeNull();
  // 결함 패턴(/{slug}, /page/ 프리픽스 누락) 재발 방지 — 페이지 모듈 URL 패턴 /page/{slug} 와 일치해야 한다.
  expect(href).toMatch(/^\/page\/.+/);
  expect(href).not.toMatch(/^\/(?!page\/)/);
});
