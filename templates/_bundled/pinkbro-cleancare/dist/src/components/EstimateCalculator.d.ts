import { default as React } from 'react';
import { DiscountStep, ServiceItem, SiteData } from '../lib/types';
/**
 * 견적 계산기 (SPEC 5.5 — React composite 로 완전 재구현).
 *
 * 계산은 전부 `lib/estimate.ts` 의 순수 함수에 위임한다. 컴포넌트에서
 * 합계·할인을 다시 구현하지 않는다.
 *
 * 3단 폴백 계약(SPEC 5.4):
 * - `services`/`steps` 가 `null` 이면 로딩 스켈레톤(`estimate-skeleton`)
 * - `services` 가 `[]` 면 빈 상태(`estimate-empty`)
 * - 배열이면 렌더
 *
 * 카피는 전부 copy 도메인 키와 1:1 인 props 로 받는다(COPY POLICY):
 * `eyebrow`(estimator_eyebrow) · `heading`(estimator_heading) · `sub`(estimator_sub) ·
 * `summaryHeading`(estimator_summary_heading) · `summaryTotalLabel`(estimator_summary_total_label) ·
 * `summaryNote`(estimator_summary_note) · `airLabel`(estimator_air_label) ·
 * `rowCountLabel`/`rowBaseLabel`/`rowDiscountLabel`/`rowDiscountAmountLabel`
 * (estimator_row_*) · `ctaSubmitLabel`(estimator_cta_submit) · `ctaKakaoLabel`(estimator_cta_kakao).
 * 값이 null 인 문구는 리터럴로 대체하지 않고 조용히 생략한다.
 * 외부 이미지 URL 을 쓰지 않는다 — 이 위젯은 사진 슬롯이 없다.
 */
export interface EstimateCalculatorProps {
    /** 섹션 eyebrow (copy.estimator_eyebrow). 원문 `.estimator section-head .eyebrow`(275행). null 이면 생략한다. */
    eyebrow: string | null;
    /** 섹션 제목 (copy.estimator_heading). null 이면 제목을 생략한다. */
    heading: string | null;
    /** 섹션 보조 문구 (copy.estimator_sub). null 이면 생략한다. */
    sub: string | null;
    /** 요약 박스 제목 (copy.estimator_summary_heading). null 이면 생략한다. */
    summaryHeading: string | null;
    /** 요약 박스 합계 라벨 (copy.estimator_summary_total_label). 원문 `.summary-total > b`(309행). null 이면 생략한다. */
    summaryTotalLabel: string | null;
    /** 요약 박스 안내 문구 (copy.estimator_summary_note). null 이면 생략한다. */
    summaryNote: string | null;
    /** 에어컨 종류 선택 라벨 (copy.estimator_air_label). 원문 `.air-select label`(291행). null 이면 생략한다. */
    airLabel: string | null;
    /** 요약 행 라벨 — 선택한 서비스 (copy.estimator_row_count). null 이면 생략한다. */
    rowCountLabel: string | null;
    /** 요약 행 라벨 — 기본가 합계 (copy.estimator_row_base). null 이면 생략한다. */
    rowBaseLabel: string | null;
    /** 요약 행 라벨 — 적용 할인 (copy.estimator_row_discount). null 이면 생략한다. */
    rowDiscountLabel: string | null;
    /** 요약 행 라벨 — 할인 금액 (copy.estimator_row_discount_amount). null 이면 생략한다. */
    rowDiscountAmountLabel: string | null;
    /** 1차 CTA 라벨 (copy.estimator_cta_submit). 원문 `.summary-actions a.btn.primary`(314행). */
    ctaSubmitLabel: string | null;
    /** 카카오 CTA 라벨 (copy.estimator_cta_kakao). 원문 `.summary-actions a.btn.kakao`(315행). */
    ctaKakaoLabel: string | null;
    /** 서비스 목록. null = 로딩 중, [] = 빈 목록. */
    services: ServiceItem[] | null;
    /** 동시작업 할인 단계. null = 로딩 중. */
    steps: DiscountStep[] | null;
    /** 사이트 기본 정보 — 카카오채널 링크에 쓴다. */
    site: SiteData | null;
}
export declare function EstimateCalculator({ eyebrow, heading, sub, summaryHeading, summaryTotalLabel, summaryNote, airLabel, rowCountLabel, rowBaseLabel, rowDiscountLabel, rowDiscountAmountLabel, ctaSubmitLabel, ctaKakaoLabel, services, steps, site, }: EstimateCalculatorProps): React.ReactElement;
export default EstimateCalculator;
