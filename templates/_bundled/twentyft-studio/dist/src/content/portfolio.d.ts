/**
 * 제작 사례의 이전 공개 주소.
 *
 * 배경 (2026-09-16 확인):
 * - portfolio 게시판의 공개 글은 `퓨어폴 SaaS` 한 건이고, 저장된 slug 메타는 `saas` 다.
 *   그래서 현재 상세 주소는 /portfolio/saas 이다.
 * - 예전 공개 사이트의 주소는 /portfolio/purepol-saas 였다. 그 값은 slug 메타가 아니라
 *   제목에서 만들어지는 fallback slug 다 — 모듈의 PortfolioController::slugFromTitle() 이
 *   제목 `PUREPOL SaaS` 를 `purepol-saas` 로 바꾼다. 이후 제목이 `퓨어폴 SaaS` 로 바뀌면서
 *   fallback 값도 `퓨어폴-saas` 가 되어 예전 주소가 더 이상 매칭되지 않는다.
 *
 * 여기서 하는 일은 데이터를 고치거나 식별자를 바꾸는 것이 아니라,
 * 예전 주소로 들어온 방문자를 현재 사례 주소로 안내하는 것뿐이다.
 * (게시글·메타·slug 는 그대로 둔다.)
 */
export declare const LEGACY_PORTFOLIO_SLUGS: Record<string, string>;
export declare function resolveLegacySlug(slug: string): string | null;
