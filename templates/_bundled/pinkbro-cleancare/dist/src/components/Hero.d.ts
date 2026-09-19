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
 * 원문 hero-actions(CTA 2개: `간편견적 문의하기` / `가격 · 예상견적 보기`)와
 * visual-bottom 의 `BRAND MESSAGE` 라벨은 copy 도메인에 키가 없어 렌더하지 않는다 —
 * 카피 하드코딩 금지(COPY POLICY). 리포트의 COPY REQUIRED 항목 참조.
 */
export declare function Hero({ site, copy, media }: HeroProps): React.ReactElement;
export default Hero;
