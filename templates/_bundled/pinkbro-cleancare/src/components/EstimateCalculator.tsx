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
 * 카피는 `intro`(섹션 도입 문구)와 `note`(요약 박스 안내 문구)로만 받는다.
 * 외부 이미지 URL 을 쓰지 않는다 — 이 위젯은 사진 슬롯이 없다.
 */

export interface EstimateCalculatorProps {
  /** 섹션 도입 문구 (copy.estimate_intro). null 이면 문구 블록을 생략한다. */
  intro: string | null;
  /** 요약 박스 안내 문구 (copy.estimate_note). null 이면 생략한다. */
  note: string | null;
  /** 서비스 목록. null = 로딩 중, [] = 빈 목록. */
  services: ServiceItem[] | null;
  /** 동시작업 할인 단계. null = 로딩 중. */
  steps: DiscountStep[] | null;
  /** 사이트 기본 정보 — 카카오채널 링크에 쓴다. */
  site: SiteData | null;
}

/** 에어컨 항목의 slug — 모듈 시더가 쓰는 원문 slug */
const AIR_SLUG = 'air-care';

/** 에어컨 종류 선택 라벨 — 위젯 내부 폼 라벨(브랜드 카피 아님) */
const AIR_KIND_LABEL = '에어컨 종류';

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
  intro,
  note,
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
      {intro ? (
        <div className="pb-estimator-intro">
          <p className="pb-estimator-sub">{intro}</p>
        </div>
      ) : null}

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
            <b data-testid="summary-final">{formatWon(result.final)}</b>
            {note ? <div className="pb-estimate-summary-note">{note}</div> : null}
          </div>

          <div className="pb-estimate-summary-actions">
            <a className="pb-estimate-option-price" href="#inquiry">
              이 구성으로 견적 문의하기
            </a>
            {site?.kakao_channel ? (
              <a
                className="pb-estimate-option-price"
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