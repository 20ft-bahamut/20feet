import { DiscountStep } from '../lib/types';
export interface PriceDiscountProps {
    /** 표기 금액 관련 안내 문구(copy: pricing_notice). null 이면 블록을 숨긴다. */
    notice: string | null;
    /** 견적 진행 흐름 문구(copy: pricing_flow). null 이면 블록을 숨긴다. */
    flow: string | null;
    /** 동시작업 할인 단계. null = 로딩 중(스켈레톤), [] = 빈 목록. */
    steps: DiscountStep[] | null;
}
/**
 * 가격 안내 섹션 — 원본 #pricing 의 notice-box 와 동시작업 할인 단계.
 *
 * 3단 폴백: steps === null → 스켈레톤, [] → 빈 상태, 배열 → 렌더.
 * 문구는 전부 props 로 받는다(COPY POLICY — 하드코딩 금지).
 */
export declare function PriceDiscount({ notice, flow, steps }: PriceDiscountProps): import("react").JSX.Element;
