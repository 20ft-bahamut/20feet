import { default as React } from 'react';
import { CopyData, MediaSlots, SiteData } from '../lib/types';
export interface HeroProps {
    /** 사이트 기본 정보. null = 아직 로딩 중(스켈레톤). */
    site: SiteData | null;
    /** 페이지 카피. null = 아직 로딩 중(스켈레톤). */
    copy: CopyData | null;
    /** 미디어 슬롯 키 → 슬롯. null = 아직 로딩 중. */
    media: MediaSlots | null;
}
export declare function renderCopyText(text: string): React.ReactNode[];
/**
 * Hero (#top).
 *
 * 3단 폴백 계약:
 *   - `site` 또는 `copy` 가 null → 로딩 스켈레톤 (data-testid="hero-skeleton")
 *   - `media.hero_main.url` 없음 → 중립 CSS 폴백 (data-testid="hero-media-fallback")
 *   - URL 있음 → <img>
 *
 * 원문 hero-actions(CTA 2개 — `간편견적 문의하기` / `가격 · 예상견적 보기`)와
 * visual-bottom 의 `BRAND MESSAGE` 라벨은 copy 도메인 키
 * (hero_cta_primary / hero_cta_secondary / hero_visual_message_label)로 배선됐다.
 * 값이 없으면 그 CTA·라벨만 조용히 생략한다 — 리터럴로 대체하지 않는다.
 */
export declare function Hero({ site, copy, media }: HeroProps): React.ReactElement;
export default Hero;
