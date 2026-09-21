import { default as React } from 'react';
import { CopyData, MediaSlots, SiteData } from '../lib/types';
export interface SiteHeaderProps {
    site: SiteData | null;
    media: MediaSlots | null;
    /**
     * 페이지 카피(null = 아직 로딩 중). CTA 라벨은 원문 그대로 copy 도메인에서 온다 —
     * 데스크톱 CTA 는 `header_cta`(원문 15행), 좁은 화면용 `.mobile-link` 는
     * `mobile_cta_estimate`(원문 16행, 모바일바 498행과 같은 문자열)다.
     * 값이 없으면 그 링크만 조용히 생략한다(리터럴 대체 금지).
     */
    copy: CopyData | null;
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
export declare function SiteHeader({ site, media: _media, copy }: SiteHeaderProps): React.ReactElement;
