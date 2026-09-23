import '../styles/PriceDiscount.css';
import { renderCopyText } from '../lib/copyText';
import { usePbRevealRef } from '../lib/reveal';

export interface PriceDiscountProps {
  /** 섹션 eyebrow(copy: pricing_eyebrow). 원문 `.section-head .copy > .eyebrow`(251행). null 이면 생략한다. */
  eyebrow: string | null;
  /** 섹션 제목(copy: pricing_heading). null 이면 제목을 생략한다. */
  heading: string | null;
  /** 섹션 보조 문구(copy: pricing_sub). null 이면 생략한다. */
  sub: string | null;
  /** 표기 금액 관련 안내 문구(copy: pricing_notice). null 이면 notice-a 블록을 숨긴다. */
  notice: string | null;
  /** notice-a eyebrow(copy: pricing_notice_label). 원문 `.notice-a .eyebrow`(259행). null 이면 생략한다. */
  noticeLabel: string | null;
  /** 안내 블록 보조 문구(copy: pricing_notice_sub). null 이면 생략한다. */
  noticeSub: string | null;
  /** 확정 견적 원칙 본문(copy: pricing_field). 원문 264행처럼 <strong> 인라인 마크업을 담는다. null 이면 가운데 블록을 숨긴다. */
  field: string | null;
  /** 견적 진행 흐름 라벨(copy: pricing_flow_label). null 이면 라벨을 생략한다. */
  flowLabel: string | null;
  /** 견적 진행 흐름 문구(copy: pricing_flow). null 이면 블록을 숨긴다. */
  flow: string | null;
}

/**
 * 가격 안내 섹션 — 원본 #pricing 의 section-head + notice-box 3블록
 * (notice-a 가격 고지 / notice-b 확정 견적 원칙 / notice-c 진행 흐름).
 *
 * 동시작업 할인 표는 **여기 없다.** 원본 #pricing(body.html 247~321행)에는
 * 할인 단계 표가 없고, 그 표는 #package 의 `.benefit-box`(229~243행) 안에만 있다.
 * 이 컴포넌트가 `discount` 데이터로 다시 그리던 중복 렌더는 제거했다 —
 * 표는 PackageList(benefit_items)가 한 번만 그린다.
 *
 * 문구는 전부 props 로 받는다(COPY POLICY — 하드코딩 금지).
 * 값이 null 인 블록은 조용히 생략한다(3단 폴백의 문자열 판).
 */
export function PriceDiscount({
  eyebrow,
  heading,
  sub,
  notice,
  noticeLabel,
  noticeSub,
  field,
  flowLabel,
  flow,
}: PriceDiscountProps) {
  // 리빌 — 원문 body.html 250(copy)·254(sub right)·257(notice-box)행.
  // .estimator(--delay:.08)는 EstimateCalculator 루트가 담당한다.
  const reveal = usePbRevealRef<HTMLDivElement>();
  const hasHead = eyebrow !== null || heading !== null || sub !== null;
  const hasNotice = notice !== null || noticeSub !== null || field !== null || flow !== null;

  return (
    <section className="pb-pricing">
      <div className="pb-pricing-inner">
        {hasHead && (
          <div className="pb-pricing-head">
            {/* 원문 body.html 250행 — .copy reveal */}
            <div className="pb-pricing-head-copy pb-reveal" ref={reveal('pricing-copy')}>
              {eyebrow !== null && (
                <span className="pb-pricing-eyebrow" data-testid="pricing-eyebrow">
                  {renderCopyText(eyebrow)}
                </span>
              )}
              {heading !== null && (
                <h2 className="pb-pricing-heading" data-testid="pricing-heading">
                  {renderCopyText(heading)}
                </h2>
              )}
            </div>
            {/* 원문 body.html 254행 — .sub reveal right */}
            {sub !== null && (
              <p
                className="pb-pricing-sub pb-reveal pb-reveal--right"
                ref={reveal('pricing-sub')}
                data-testid="pricing-sub"
              >
                {renderCopyText(sub)}
              </p>
            )}
          </div>
        )}

        {/* 원문 body.html 257행 — .notice-box reveal */}
        {hasNotice && (
          <div className="pb-pricing-notice pb-reveal" ref={reveal('pricing-notice')}>
            {notice !== null && (
              <div className="pb-pricing-notice-a">
                {noticeLabel !== null && (
                  <span className="pb-pricing-eyebrow" data-testid="pricing-notice-label">
                    {renderCopyText(noticeLabel)}
                  </span>
                )}
                <b className="pb-pricing-notice-title">{renderCopyText(notice)}</b>
                {noticeSub !== null && (
                  <p className="pb-pricing-notice-sub" data-testid="pricing-notice-sub">
                    {renderCopyText(noticeSub)}
                  </p>
                )}
              </div>
            )}
            {field !== null && (
              <div className="pb-pricing-notice-b" data-testid="pricing-field">
                {/* 원문 264행이 첫 문장을 <strong> 으로 감싼다 — 시더가 저장한 마크업을
                    요소로 렌더한다(리터럴 노출 금지). */}
                <div>{renderCopyText(field)}</div>
              </div>
            )}
            {flow !== null && (
              <div className="pb-pricing-notice-c">
                {flowLabel !== null && (
                  <span
                    className="pb-pricing-eyebrow pb-pricing-eyebrow--plain"
                    data-testid="pricing-flow-label"
                  >
                    {renderCopyText(flowLabel)}
                  </span>
                )}
                <b className="pb-pricing-notice-flow">{renderCopyText(flow)}</b>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default PriceDiscount;
