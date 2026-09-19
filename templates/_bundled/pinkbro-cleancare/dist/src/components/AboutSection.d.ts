import { default as React } from 'react';
import { CopyData } from '../lib/types';
export interface AboutSectionProps {
    /** 페이지 카피. null = 아직 로딩 중(스켈레톤). */
    copy: CopyData | null;
}
/**
 * About (#about, 원문 "Why Pinkbro" 섹션).
 *
 * 폴백 계약:
 *   - `copy` null → 로딩 스켈레톤 (data-testid="about-skeleton")
 *   - `about_perspectives` null → 관점 카드 영역 미렌더(데이터 도착 대기)
 *   - `about_perspectives` [] → 카드 없이 빈 콘텐츠 열
 *   - 배열 → .pb-why-card 로 렌더
 *
 * 원문의 stage 오버레이 보조 문구(p)·why-content h2·eyebrow 라벨("Why Pinkbro"/
 * "Brand Perspective")은 CopyData 계약에 해당 필드가 없어 렌더하지 않는다 —
 * 카피 하드코딩 금지(COPY POLICY). 계약 확장은 리포트의 COPY REQUIRED 항목 참조.
 */
export declare function AboutSection({ copy }: AboutSectionProps): React.ReactElement;
export default AboutSection;
