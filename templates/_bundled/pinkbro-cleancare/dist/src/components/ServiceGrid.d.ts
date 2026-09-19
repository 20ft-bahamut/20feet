import { default as React } from 'react';
import { MediaSlots, ServiceItem } from '../lib/types';
export interface ServiceGridProps {
    /** 섹션 도입 문구. copy 데이터에서 온다 — 하드코딩하지 않는다. */
    intro: string | null;
    /** 서비스 목록. null = 로딩 중, [] = 데이터 없음. */
    items: ServiceItem[] | null;
    /** 모듈 이미지 슬롯. */
    media: MediaSlots | null;
}
/**
 * 서비스 그리드 — 사진 우선순위: 슬롯 URL → 번들 템플릿 자산 → 중립 CSS 블록.
 * (D7 + D9 결합: 서비스 6종은 기본 탑재 사진이 있으므로 폴백이 중립 블록이 아니다)
 */
export declare function ServiceGrid({ intro, items, media }: ServiceGridProps): React.ReactElement;
export default ServiceGrid;
