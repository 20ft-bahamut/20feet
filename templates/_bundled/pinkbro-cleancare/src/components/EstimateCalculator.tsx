import React from 'react';
import '../styles/EstimateCalculator.css';
import { calculateEstimate, formatWon, parsePrice } from '../lib/estimate';
import type { DiscountStep, EstimateOption, ServiceItem, SiteData } from '../lib/types';

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

/** 에어컨 항목의 slug — 모듈 시더가 쓰는 원문 slug */
const AIR_SLUG = 'air-care';

function defaultAirKind(service: ServiceItem): string {
  const types = service.air_types ?? [];
  return types.find((t) => t.default_selected)?.kind ?? types[0]?.kind ?? '';
}

/**
 * 서비스 목록 → 계산 입력(EstimateOption).
 * air-care 는 선택된 종류의 price_value, 나머지는 base_price 를 파싱한다.
 */
function toOptions(services: ServiceItem[], airKind: string): EstimateOption[] {
  return services.map((service) => {
    if (service.slug === AIR_SLUG) {
      const types = service.air_types ?? [];
      const chosen =
        types.find((t) => t.kind === airKind) ??
        types.find((t) => t.default_selected) ??
        types[0];
      return { key: service.slug, label: service.title, price: chosen?.price_value ?? 0 };
    }
    return { key: service.slug, label: service.title, price: parsePrice(service.base_price) };
  });
}

export function EstimateCalculator({
  eyebrow,
  heading,
  sub,
  summaryHeading,
  summaryTotalLabel,
  summaryNote,
  airLabel,
  rowCountLabel,
  rowBaseLabel,
  rowDiscountLabel,
  rowDiscountAmountLabel,
  ctaSubmitLabel,
  ctaKakaoLabel,
  services,
  steps,
  site,
}: EstimateCalculatorProps): React.ReactElement {
  const isLoading = services === null || steps === null;

  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());
  const [airKind, setAirKind] = React.useState<string>('');

  const airService = React.useMemo(
    () => (services ? services.find((s) => s.slug === AIR_SLUG) ?? null : null),
    [services],
  );

  // services 가 도착하면(로딩 완료) 에어컨 종류 기본값을 잡는다
  React.useEffect(() => {
    if (airService) setAirKind(defaultAirKind(airService));
  }, [airService]);

  const options = React.useMemo(
    () => (services ? toOptions(services, airKind) : []),
    [services, airKind],
  );

  const result = React.useMemo(
    () => calculateEstimate(options, Array.from(selected), steps ?? []),
    [options, selected, steps],
  );

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="pb-estimate-skeleton" data-testid="estimate-skeleton" aria-busy="true">
        <div>
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="pb-estimate-skeleton-panel" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="pb-estimate-empty" data-testid="estimate-empty" role="status">
        표시할 서비스 항목이 없습니다.
      </div>
    );
  }

  const showAirSelect =
    airService !== null && selected.has(AIR_SLUG) && (airService.air_types?.length ?? 0) > 0;

  return (
    <section className="pb-estimator" data-testid="estimate-calculator">
      {(heading || sub) && (
        <div className="pb-estimator-head">
          <div className="pb-estimator-head-copy">
            {eyebrow && (
              <span className="pb-estimator-eyebrow" data-testid="estimator-eyebrow">
                {eyebrow}
              </span>
            )}
            {heading && (
              <h3 className="pb-estimator-heading" data-testid="estimator-heading">
                {heading}
              </h3>
            )}
          </div>
          {sub && (
            <p className="pb-estimator-sub" data-testid="estimator-sub">
              {sub}
            </p>
          )}
        </div>
      )}

      <div className="pb-estimator-grid">
        <div>
          <ul className="pb-estimator-list">
            {options.map((option) => (
              <li key={option.key} className="pb-estimate-option">
                <div className="pb-estimate-option-left">
                  <input
                    type="checkbox"
                    id={`pb-estimate-${option.key}`}
                    checked={selected.has(option.key)}
                    onChange={() => toggle(option.key)}
                  />
                  <label htmlFor={`pb-estimate-${option.key}`}>{option.label}</label>
                </div>
                <span className="pb-estimate-option-price">{formatWon(option.price)}</span>
              </li>
            ))}
          </ul>

          {showAirSelect ? (
            <div className="pb-estimate-air">
              {airLabel ? <label htmlFor="pb-estimate-air-kind">{airLabel}</label> : null}
              <select
                id="pb-estimate-air-kind"
                value={airKind}
                onChange={(e) => setAirKind(e.target.value)}
              >
                {(airService?.air_types ?? []).map((t) => (
                  <option key={t.kind} value={t.kind}>
                    {t.kind} · {formatWon(t.price_value)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div className="pb-estimate-summary">
          {summaryHeading ? (
            <h3 className="pb-estimate-summary-title" data-testid="estimator-summary-heading">
              {summaryHeading}
            </h3>
          ) : null}
          <div className="pb-estimate-summary-meta">
            <div className="pb-estimate-summary-row">
              {rowCountLabel ? <span data-testid="estimator-row-count-label">{rowCountLabel}</span> : null}
              <strong data-testid="summary-count">{result.count}개</strong>
            </div>
            <div className="pb-estimate-summary-row">
              {rowBaseLabel ? <span data-testid="estimator-row-base-label">{rowBaseLabel}</span> : null}
              <strong data-testid="summary-base">{formatWon(result.base)}</strong>
            </div>
            <div className="pb-estimate-summary-row">
              {rowDiscountLabel ? (
                <span data-testid="estimator-row-discount-label">{rowDiscountLabel}</span>
              ) : null}
              <strong data-testid="summary-discount">{result.rate}%</strong>
            </div>
            <div className="pb-estimate-summary-row">
              {rowDiscountAmountLabel ? (
                <span data-testid="estimator-row-discount-amount-label">
                  {rowDiscountAmountLabel}
                </span>
              ) : null}
              <strong data-testid="summary-discount-amount">
                {formatWon(result.discountAmount)}
              </strong>
            </div>
          </div>

          <div className="pb-estimate-summary-total">
            {/* 원문 .summary-total — b(라벨, copy: estimator_summary_total_label) +
                span.value(숫자+small 원). 라벨이 null 이면 생략한다. */}
            {summaryTotalLabel ? (
              <b className="pb-estimate-summary-total-label" data-testid="summary-final-label">
                {summaryTotalLabel}
              </b>
            ) : null}
            <span className="pb-estimate-summary-value" data-testid="summary-final">
              {formatWon(result.final).replace(/원$/, '')}
              <small>원</small>
            </span>
            {summaryNote ? (
              <div className="pb-estimate-summary-note" data-testid="estimator-summary-note">
                {summaryNote}
              </div>
            ) : null}
          </div>

          <div className="pb-estimate-summary-actions">
            {/* 앵커 목적지는 견적/문의 섹션(#estimate)이다 — 레이아웃이 그 id 를 소유한다.
                라벨은 copy 도메인(estimator_cta_submit / estimator_cta_kakao)에서 온다. */}
            {ctaSubmitLabel ? (
              <a
                className="pb-btn pb-estimate-btn-primary"
                data-testid="estimator-cta-submit"
                href="#estimate"
              >
                {ctaSubmitLabel}
              </a>
            ) : null}
            {site?.kakao_channel && ctaKakaoLabel ? (
              <a
                className="pb-btn pb-btn--kakao"
                data-testid="estimator-cta-kakao"
                href={site.kakao_channel}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ctaKakaoLabel}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EstimateCalculator;