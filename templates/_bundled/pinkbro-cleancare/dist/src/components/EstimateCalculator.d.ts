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
 * 카피는 `heading`(estimator_heading) · `sub`(estimator_sub) ·
 * `summaryHeading`(estimator_summary_heading) · `summaryNote`(estimator_summary_note)
 * 네 슬롯으로만 받는다 — 전부 copy 도메인 키와 1:1 이다(COPY POLICY).
 * 외부 이미지 URL 을 쓰지 않는다 — 이 위젯은 사진 슬롯이 없다.
 */
export interface EstimateCalculatorProps {
    /** 섹션 제목 (copy.estimator_heading). null 이면 제목을 생략한다. */
    heading: string | null;
    /** 섹션 보조 문구 (copy.estimator_sub). null 이면 생략한다. */
    sub: string | null;
    /** 요약 박스 제목 (copy.estimator_summary_heading). null 이면 생략한다. */
    summaryHeading: string | null;
    /** 요약 박스 안내 문구 (copy.estimator_summary_note). null 이면 생략한다. */
    summaryNote: string | null;
    /** 서비스 목록. null = 로딩 중, [] = 빈 목록. */
    services: ServiceItem[] | null;
    /** 동시작업 할인 단계. null = 로딩 중. */
    steps: DiscountStep[] | null;
    /** 사이트 기본 정보 — 카카오채널 링크에 쓴다. */
    site: SiteData | null;
}
export declare function EstimateCalculator({ heading, sub, summaryHeading, summaryNote, services, steps, site, }: EstimateCalculatorProps): React.ReactElement;
export default EstimateCalculator;
