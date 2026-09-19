import { default as React } from 'react';
import { CopyData, MediaSlots } from '../lib/types';
export interface AboutSectionProps {
    /** 페이지 카피. null = 아직 로딩 중(스켈레톤). */
    copy: CopyData | null;
    /** 미디어 슬롯 키 → 슬롯. null = 아직 로딩 중. `why_stage` 가 이 섹션의 스테이지 이미지다. */
    media: MediaSlots | null;
}
/**
 * About (원문 "Why Pinkbro" 섹션).
 *
 * 폴백 계약:
 *   - `copy` null → 로딩 스켈레톤 (data-testid="about-skeleton")
 *   - `media.why_stage.url` 없음 → 중립 CSS 폴백 (data-testid="about-media-fallback")
 *   - URL 있음 → <img>
 *   - `about_perspectives` null → 관점 카드 영역 미렌더(데이터 도착 대기)
 *   - `about_perspectives` [] → 카드 없이 빈 콘텐츠 열
 *   - 배열 → .pb-why-card 로 렌더
 *
 * 섹션 앵커(`#about`)는 컴포넌트가 아니라 레이아웃이 소유한다 — 섹션 id 를
 * 컴포넌트가 직접 달면 레이아웃과 중복 id 가 생긴다.
 *
 * 문구는 전부 copy props 에서 온다: stage 오버레이는 `about_heading`(h3) +
 * `about_message`(p), why-content 는 `about_side_heading`(h2) + 관점 카드.
 * 원문의 eyebrow 라벨("Why Pinkbro"/"Brand Perspective")은 copy 도메인에 키가 없어
 * 렌더하지 않는다 — 카피 하드코딩 금지(COPY POLICY). 리포트의 COPY REQUIRED 항목 참조.
 */
export declare function AboutSection({ copy, media }: AboutSectionProps): React.ReactElement;
export default AboutSection;
