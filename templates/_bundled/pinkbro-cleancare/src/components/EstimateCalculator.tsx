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

/** 에어컨 항목의 slug — 모듈 시더가 쓰는 원문 slug */
const AIR_SLUG = 'air-care';

/** 에어컨 종류 선택 라벨 — 위젯 내부 폼 라벨(원문 .air-select label 과 같은 문구) */
const AIR_KIND_LABEL = '에어컨 종류 선택';

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
  heading,
  sub,
  summaryHeading,
  summaryNote,
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
            {/* 원문 .estimator section-head 의 eyebrow(`Expected Estimate`) — copy
                도메인에 키가 없어 원문 그대로 리터럴로 복구했다. 모듈 키 추가 시
                props 로 교체할 것(리포트 copy_required 참조). */}
            <span className="pb-estimator-eyebrow" data-testid="estimator-eyebrow">
              Expected Estimate
            </span>
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
              <label htmlFor="pb-estimate-air-kind">{AIR_KIND_LABEL}</label>
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
              <span>선택한 서비스</span>
              <strong data-testid="summary-count">{result.count}개</strong>
            </div>
            <div className="pb-estimate-summary-row">
              <span>기본가 합계</span>
              <strong data-testid="summary-base">{formatWon(result.base)}</strong>
            </div>
            <div className="pb-estimate-summary-row">
              <span>적용 할인</span>
              <strong data-testid="summary-discount">{result.rate}%</strong>
            </div>
            <div className="pb-estimate-summary-row">
              <span>할인 금액</span>
              <strong data-testid="summary-discount-amount">
                {formatWon(result.discountAmount)}
              </strong>
            </div>
          </div>

          <div className="pb-estimate-summary-total">
            {/* 원문 .summary-total — b(라벨 `Estimated Base Price`) + span.value(숫자+small 원).
                라벨은 copy 도메인에 키가 없어 원문 그대로 리터럴로 복구했다(모듈 키 추가 시
                props 로 교체 — 리포트 copy_required 참조). */}
            <b className="pb-estimate-summary-total-label" data-testid="summary-final-label">
              Estimated Base Price
            </b>
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
            {/* 앵커 목적지는 견적/문의 섹션(#estimate)이다 — 레이아웃이 그 id 를 소유한다 */}
            <a className="pb-btn pb-estimate-btn-primary" href="#estimate">
              이 구성으로 견적 문의하기
            </a>
            {site?.kakao_channel ? (
              <a
                className="pb-btn pb-btn--kakao"
                href={site.kakao_channel}
                target="_blank"
                rel="noopener noreferrer"
              >
                카카오채널 문의하기
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EstimateCalculator;