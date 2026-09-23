import { default as React } from 'react';
import { CopyData, MediaSlots, SiteData } from '../lib/types';
/**
 * 카피 렌더 함수는 `lib/copyText.tsx` 로 옮겼다 — copy 도메인 문자열을 내보내는
 * 모든 컴포넌트가 쓰는 공용 util 이다. 기존 import(`./Hero`)가 깨지지 않게
 * 여기서 재export 한다.
 */
export { renderCopyText } from '../lib/copyText';
export interface HeroProps {
    /** 사이트 기본 정보. null = 아직 로딩 중(스켈레톤). */
    site: SiteData | null;
    /** 페이지 카피. null = 아직 로딩 중(스켈레톤). */
    copy: CopyData | null;
    /** 미디어 슬롯 키 → 슬롯. null = 아직 로딩 중. */
    media: MediaSlots | null;
}
/**
 * Hero (#top).
 *
 * 3단 폴백 계약:
 *   - `site` 또는 `copy` 가 null → 로딩 스켈레톤 (data-testid="hero-skeleton")
 *   - `media.hero_main.url` 없음 → 번들 자리표시자 사진 (SLOT_PHOTO.hero_main)
 *   - 슬롯도 번들 자산도 없음 → 중립 CSS 폴백 (data-testid="hero-media-fallback")
 *   - 슬롯 URL 있음 → 그 URL (업로드가 항상 이긴다)
 *
 * 셸 배경(hero_sub 슬롯)은 원문 `.hero-shell::before` 스택의 사진 레이어와 같은 자리다
 * (원문 styles.css 67~70행 — 그라디언트 스크림 아래에 사진이 깔린다):
 *   - `media.hero_sub.url` 있음 → 그 URL (업로드가 항상 이긴다)
 *   - 슬롯 없음 → 번들 자리표시자 배경 (SLOT_PHOTO.hero_sub)
 *   - 둘 다 없음 → 배경 없음 (셸 베이스 컬러만 남는다)
 * 사진은 .pb-hero-shell 의 inline 배경, 스크림(::before)이 그 위, 콘텐츠(.pb-hero-grid,
 * z-index:1)가 그 위 — 원문과 같은 3단 순서다.
 *
 * 원문 hero-actions(CTA 2개 — `간편견적 문의하기` / `가격 · 예상견적 보기`)와
 * visual-bottom 의 `BRAND MESSAGE` 라벨은 copy 도메인 키
 * (hero_cta_primary / hero_cta_secondary / hero_visual_message_label)로 배선됐다.
 * 값이 없으면 그 CTA·라벨만 조용히 생략한다 — 리터럴로 대체하지 않는다.
 */
export declare function Hero({ site, copy, media }: HeroProps): React.ReactElement;
export default Hero;
