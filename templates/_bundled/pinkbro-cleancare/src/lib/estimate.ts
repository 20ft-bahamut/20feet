import type { DiscountStep, EstimateOption } from './types';

export interface EstimateResult {
  count: number;
  base: number;
  rate: number;
  discountAmount: number;
  final: number;
}

function parseRate(label: string): number {
  const match = label.match(/(\d+)\s*%/);
  return match ? Number(match[1]) : 0;
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
export function discountRateFor(count: number, steps: DiscountStep[]): number {
  if (count <= 0 || steps.length === 0) return 0;

  for (const step of steps) {
    const c = step.condition;
    // "3~4개 항목" 같은 범위
    const range = c.match(/(\d+)\s*[~-]\s*(\d+)/);
    if (range) {
      const lo = Number(range[1]);
      const hi = Number(range[2]);
      if (count >= lo && count <= hi) return parseRate(step.amount_label);
      continue;
    }
    // "5개 이상"
    const atLeast = c.match(/(\d+)\s*개?\s*이상/);
    if (atLeast) {
      if (count >= Number(atLeast[1])) return parseRate(step.amount_label);
      continue;
    }
    // "2개 항목" 같은 정확한 개수
    const exact = c.match(/(\d+)\s*개/);
    if (exact && count === Number(exact[1])) return parseRate(step.amount_label);
  }

  return 0;
}

export function calculateEstimate(
  options: EstimateOption[],
  selectedKeys: string[],
  steps: DiscountStep[],
): EstimateResult {
  const selected = new Set(selectedKeys);
  const chosen = options.filter((o) => selected.has(o.key));

  const count = chosen.length;
  const base = chosen.reduce((sum, o) => sum + o.price, 0);
  const rate = discountRateFor(count, steps);
  const discountAmount = Math.round((base * rate) / 100);

  return { count, base, rate, discountAmount, final: base - discountAmount };
}

export function formatWon(n: number): string {
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
}

/**
 * "250,000원" / "1,000원 ~" / "35만원" 같은 한국어 표시 문자열을 정수로 파싱한다.
 * Task 9 의 서비스 파서가 base_price("250,000원" 형태)를 price 로 바꿀 때 쓴다.
 * 숫자를 찾지 못하면 0, 빈 문자열도 0.
 */
export function parsePrice(label: string): number {
  if (!label) return 0;

  const won = label.match(/([\d,]+)\s*(만)?\s*원?/);
  if (!won || !won[1]) return 0;

  const digits = Number(won[1].replace(/,/g, ''));
  if (!Number.isFinite(digits)) return 0;

  // "35만원" → 350000
  return won[2] ? digits * 10000 : digits;
}