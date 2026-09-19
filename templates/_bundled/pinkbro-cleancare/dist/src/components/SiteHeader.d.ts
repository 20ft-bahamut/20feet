import { default as React } from 'react';
import { MediaSlots, SiteData } from '../lib/types';
/**
 * 소스 원문 헤더 CTA 라벨(source/body.html 원문 이식).
 * 컴포넌트 리터럴이 아니라 소스 카피 이관 값이다 — 관리자 copy 로 옮길 수
 * 있게 optional props 로도 받는다(기본값은 소스 원문).
 */
export interface SiteHeaderProps {
    site: SiteData | null;
    media: MediaSlots | null;
    /** CTA 라벨 오버라이드(생략 시 소스 원문 라벨 사용) */
    estimateLabel?: string;
    mobileEstimateLabel?: string;
}
/**
 * 전화번호에서 하이픈 등 숫자·국가번호·특수 다이얼 문자 외를 제거해 tel: href 를 만든다.
 * 비어 있으면 페이지 내 이동 없는 `#` 을 돌려준다.
 */
export declare function telHref(phone: string | null | undefined): string;
/**
 * 상단 고정 헤더.
 *
 * 로고는 모듈 미디어 슬롯이 아니라 브랜드 고정 템플릿 자산이다
 * (스펙 5.4 — templateAsset('images/brand-logo.webp')). `media` 는 계약
 * 유지를 위해 받지만 로고에는 쓰지 않는다.
 */
export declare function SiteHeader({ site, media: _media, estimateLabel, mobileEstimateLabel }: SiteHeaderProps): React.ReactElement;
