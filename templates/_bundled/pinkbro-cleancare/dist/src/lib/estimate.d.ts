import { DiscountStep, EstimateOption } from './types';
export interface EstimateResult {
    count: number;
    base: number;
    rate: number;
    discountAmount: number;
    final: number;
}
/**
 * 선택한 항목 "종류 수"에 대한 할인율(%).
 *
 * 모듈이 구조화된 임계값(min_count/max_count)을 내려주지 않기 때문에
 * condition 문자열을 파싱한다. 시더가 넣는 원문은
 * `2개 항목` / `3~4개 항목` / `5개 이상` 세 형태뿐이다
 * (reference/content/discount.json).
 *
 * 한계: 관리자가 condition 문자열을 위 세 형태 이외로 바꾸면(예: "두 항목부터")
 * 어떤 구간도 매칭되지 않아 할인율이 0 이 된다. 견고하게 하려면 모듈이
 * 구조화된 임계값을 함께 내려줘야 하며, 그것은 모듈 계약 변경이므로 여기서 하지 않는다.
 *
 * 원본 계산 규칙(source app.js getDiscountRate, 변경 금지):
 * 항목 종류 수 기준 2개 → 3%, 3~4개 → 5%, 5개 이상 → 10%, 그 외 0%.
 */
export declare function discountRateFor(count: number, steps: DiscountStep[]): number;
export declare function calculateEstimate(options: EstimateOption[], selectedKeys: string[], steps: DiscountStep[]): EstimateResult;
export declare function formatWon(n: number): string;
/**
 * "250,000원" / "1,000원 ~" / "35만원" 같은 한국어 표시 문자열을 정수로 파싱한다.
 * Task 9 의 서비스 파서가 base_price("250,000원" 형태)를 price 로 바꿀 때 쓴다.
 * 숫자를 찾지 못하면 0, 빈 문자열도 0.
 */
export declare function parsePrice(label: string): number;
