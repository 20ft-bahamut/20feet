import '../styles/PriceDiscount.css';
import type { DiscountStep } from '../lib/types';

export interface PriceDiscountProps {
  /** 표기 금액 관련 안내 문구(copy: pricing_notice). null 이면 블록을 숨긴다. */
  notice: string | null;
  /** 견적 진행 흐름 문구(copy: pricing_flow). null 이면 블록을 숨긴다. */
  flow: string | null;
  /** 동시작업 할인 단계. null = 로딩 중(스켈레톤), [] = 빈 목록. */
  steps: DiscountStep[] | null;
}

function Skeleton() {
  return (
    <div className="pb-pricing-skeleton" data-testid="discount-skeleton">
      <span className="pb-pricing-skeleton-line" style={{ width: '38%' }} />
      <span className="pb-pricing-skeleton-line" style={{ width: '82%' }} />
      <span className="pb-pricing-skeleton-line" style={{ width: '64%' }} />
      <span className="pb-pricing-skeleton-line" style={{ width: '46%' }} />
    </div>
  );
}

/**
 * 가격 안내 섹션 — 원본 #pricing 의 notice-box 와 동시작업 할인 단계.
 *
 * 3단 폴백: steps === null → 스켈레톤, [] → 빈 상태, 배열 → 렌더.
 * 문구는 전부 props 로 받는다(COPY POLICY — 하드코딩 금지).
 */
export function PriceDiscount({ notice, flow, steps }: PriceDiscountProps) {
  return (
    <section className="pb-pricing">
      <div className="pb-pricing-inner">
        {(notice !== null || flow !== null) && (
          <div className="pb-pricing-notice">
            {notice !== null && (
              <div className="pb-pricing-notice-a">
                <span className="pb-pricing-eyebrow">Pricing Notice</span>
                <b className="pb-pricing-notice-title">{notice}</b>
              </div>
            )}
            {flow !== null && (
              <div className="pb-pricing-notice-c">
                <span className="pb-pricing-eyebrow">Estimate Flow</span>
                <b className="pb-pricing-notice-flow">{flow}</b>
              </div>
            )}
          </div>
        )}

        {steps === null ? (
          <Skeleton />
        ) : steps.length === 0 ? (
          <div className="pb-pricing-empty" data-testid="discount-empty" />
        ) : (
          <ul className="pb-pricing-steps">
            {steps.map((step, i) => (
              <li className="pb-pricing-step" data-testid="discount-step" key={`${step.condition}-${i}`}>
                <b className="pb-pricing-step-amount">{step.amount_label}</b>
                <span className="pb-pricing-step-condition">{step.condition}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}