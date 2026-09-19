import '../styles/PriceDiscount.css';
import type { DiscountStep } from '../lib/types';

export interface PriceDiscountProps {
  /** 섹션 제목(copy: pricing_heading). null 이면 제목을 생략한다. */
  heading: string | null;
  /** 섹션 보조 문구(copy: pricing_sub). null 이면 생략한다. */
  sub: string | null;
  /** 표기 금액 관련 안내 문구(copy: pricing_notice). null 이면 블록을 숨긴다. */
  notice: string | null;
  /** 안내 블록 보조 문구(copy: pricing_notice_sub). null 이면 생략한다. */
  noticeSub: string | null;
  /** 확정 견적 원칙 본문(copy: pricing_field). null 이면 가운데 블록을 숨긴다. */
  field: string | null;
  /** 견적 진행 흐름 라벨(copy: pricing_flow_label). null 이면 라벨을 생략한다. */
  flowLabel: string | null;
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
 * 가격 안내 섹션 — 원본 #pricing 의 section-head + notice-box 3블록
 * (notice-a 가격 고지 / notice-b 확정 견적 원칙 / notice-c 진행 흐름)과
 * 동시작업 할인 단계.
 *
 * 3단 폴백: steps === null → 스켈레톤, [] → 빈 상태, 배열 → 렌더.
 * 문구는 전부 props 로 받는다(COPY POLICY — 하드코딩 금지).
 * 원문 notice-a 의 eyebrow(`Pricing Notice`)는 copy 도메인에 키가 없어
 * 리터럴로 남아 있다 — 리포트의 COPY REQUIRED 항목 참조.
 */
export function PriceDiscount({
  heading,
  sub,
  notice,
  noticeSub,
  field,
  flowLabel,
  flow,
  steps,
}: PriceDiscountProps) {
  const hasNotice = notice !== null || noticeSub !== null || field !== null || flow !== null;

  return (
    <section className="pb-pricing">
      <div className="pb-pricing-inner">
        {(heading !== null || sub !== null) && (
          <div className="pb-pricing-head">
            <div className="pb-pricing-head-copy">
              {heading !== null && (
                <h2 className="pb-pricing-heading" data-testid="pricing-heading">
                  {heading}
                </h2>
              )}
            </div>
            {sub !== null && (
              <p className="pb-pricing-sub" data-testid="pricing-sub">
                {sub}
              </p>
            )}
          </div>
        )}

        {hasNotice && (
          <div className="pb-pricing-notice">
            {notice !== null && (
              <div className="pb-pricing-notice-a">
                <span className="pb-pricing-eyebrow">Pricing Notice</span>
                <b className="pb-pricing-notice-title">{notice}</b>
                {noticeSub !== null && (
                  <p className="pb-pricing-notice-sub" data-testid="pricing-notice-sub">
                    {noticeSub}
                  </p>
                )}
              </div>
            )}
            {field !== null && (
              <div className="pb-pricing-notice-b" data-testid="pricing-field">
                <div>{field}</div>
              </div>
            )}
            {flow !== null && (
              <div className="pb-pricing-notice-c">
                {flowLabel !== null && (
                  <span className="pb-pricing-eyebrow" data-testid="pricing-flow-label">
                    {flowLabel}
                  </span>
                )}
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
