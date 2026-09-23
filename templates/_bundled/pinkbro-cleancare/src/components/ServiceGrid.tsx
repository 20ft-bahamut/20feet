import React from 'react';
import '../styles/ServiceGrid.css';
import { servicePhotoFor } from '../lib/serviceAssets';
import { renderCopyText } from '../lib/copyText';
import { usePbRevealRef } from '../lib/reveal';
import type { MediaSlots, ServiceItem } from '../lib/types';

export interface ServiceGridProps {
  /** 섹션 제목(copy: service_intro). 원문 .section-head .copy > .h2. \n 은 줄바꿈으로 렌더한다. */
  intro: string | null;
  /** 섹션 보조 문구(copy: service_intro_sub). 원문 .section-head > .sub — 제목과 아래정렬 오른쪽 열. */
  introSub: string | null;
  /** 섹션 eyebrow(copy: service_eyebrow). 원문 `.section-head .copy > .eyebrow`(100행). null 이면 생략한다. */
  eyebrow?: string | null;
  /** 서비스 카드의 상세 펼침 라벨(copy: service_detail_label). null 이면 ＋ 마커만 남는다. */
  detailLabel: string | null;
  /** 목록에 없는 서비스 안내 박스 제목(copy: extra_box_heading). null 이면 박스를 숨긴다. */
  extraHeading: string | null;
  /** 목록에 없는 서비스 안내 박스 본문(copy: extra_box_body). */
  extraBody: string | null;
  /** extra-box CTA 라벨(copy: extra_box_cta). 원문 `.extra-box > a.btn.primary`(166행) — `기타 서비스 문의하기`. */
  extraCtaLabel?: string | null;
  /** extra-box CTA 링크 대상. 원문 앵커는 #estimate 이다. */
  extraCtaHref?: string | null;
  /** 서비스 목록. null = 로딩 중, [] = 데이터 없음. */
  items: ServiceItem[] | null;
  /** 모듈 이미지 슬롯. */
  media: MediaSlots | null;
}

/**
 * "250,000원~" → 숫자부와 단위부(원~)로 분리한다.
 * 원문 .price-row 는 숫자를 Manrope 900 34px 로, 단위를 Noto 15px 로 따로 렌더한다
 * (.price-row strong > span). 모듈 값은 한 문자열이므로 표시 계층에서만 나눈다.
 */
function splitPrice(value: string): { amount: string; unit: string | null } {
  const match = /^(.+?)(원~?)$/.exec(value);
  return match ? { amount: match[1], unit: match[2] } : { amount: value, unit: null };
}

/**
 * 서비스 카드 리빌 시차 — 원문 body.html 106/115/124/133/142/151행 순서 그대로
 * (.02/.06/.10/.14/.18/.22). 원문 카드는 6장이다 — 7번째 항목부터는 원문에 근거가
 * 없으므로 시차를 만들지 않는다(0s).
 */
const SERVICE_CARD_DELAYS = ['0.02s', '0.06s', '0.10s', '0.14s', '0.18s', '0.22s'];

/**
 * 서비스 그리드 — 사진 우선순위: 슬롯 URL → 번들 템플릿 자산 → 중립 CSS 블록.
 * (D7 + D9 결합: 서비스 6종은 기본 탑재 사진이 있으므로 폴백이 중립 블록이 아니다)
 *
 * 문구는 전부 props 로 받는다(COPY POLICY — 하드코딩 금지).
 * 섹션 eyebrow(`Core Service`)와 extra-box CTA(`기타 서비스 문의하기`)는
 * copy 도메인 키(service_eyebrow / extra_box_cta)로 배선됐다 — 값이 없으면
 * 각각 조용히 생략된다.
 */
export function ServiceGrid({
  intro,
  introSub,
  eyebrow,
  detailLabel,
  extraHeading,
  extraBody,
  extraCtaLabel,
  extraCtaHref,
  items,
  media,
}: ServiceGridProps): React.ReactElement {
  // 리빌 — 원문 body.html 99(copy)·103(sub right)·106~151(카드 6장)·161(extra-box
  // --delay:.08)행. ref key 는 슬롯 slug 를 쓴다(데이터 순서가 바뀌어도 같은 카드다).
  const reveal = usePbRevealRef<HTMLElement>();
  if (items === null) {
    return (
      <div className="pb-services" data-testid="services-skeleton">
        <div className="pb-wrap">
          <div className="pb-service-grid" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pb-service-card pb-service-card--skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pb-services" data-testid="services-empty">
        <div className="pb-wrap">
          <div className="pb-services-empty-block" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-services">
      <div className="pb-wrap">
        <div className="pb-section-head">
          {/* 원문 body.html 99행 — .copy reveal */}
        <div className="pb-section-copy pb-reveal" ref={reveal('service-copy')}>
            {eyebrow ? (
              <div className="pb-services-eyebrow" data-testid="services-eyebrow">
                {renderCopyText(eyebrow)}
              </div>
            ) : null}
            {intro ? (
              <h2 className="pb-services-title" data-testid="services-title">
                {renderCopyText(intro)}
              </h2>
            ) : null}
          </div>
          {/* 원문 body.html 103행 — .sub reveal right */}
          {introSub ? (
            <p
              className="pb-services-sub pb-reveal pb-reveal--right"
              ref={reveal('service-sub')}
              data-testid="services-intro-sub"
            >
              {renderCopyText(introSub)}
            </p>
          ) : null}
        </div>

        <div className="pb-service-grid">
          {items.map((item, index) => {
            const photoUrl = servicePhotoFor(item.slug, media);
            const price = splitPrice(item.base_price);
            // 원문 body.html 106~151행 — .service-card reveal, 시차 .02→.22 (6장).
            const cardDelay = SERVICE_CARD_DELAYS[index] ?? '0s';
            return (
              <article
                key={item.slug}
                className="pb-service-card pb-reveal"
                style={{ '--pb-delay': cardDelay } as React.CSSProperties}
                ref={reveal(`service-card-${item.slug}`)}
                data-testid="service-card"
              >
                <div className="pb-service-photo">
                  {photoUrl ? (
                    <img
                      data-testid="service-photo"
                      className="pb-service-photo-img"
                      src={photoUrl}
                      alt={item.photo.alt ?? item.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="pb-service-photo-fallback" data-testid="service-photo-fallback" />
                  )}
                  <span className="pb-service-tag">{item.tag}</span>
                </div>
                <div className="pb-service-body">
                  <div className="pb-service-head">
                    <h3>{item.title}</h3>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <p>{renderCopyText(item.summary)}</p>
                  <div className="pb-price-row">
                    <strong>
                      {price.amount}
                      {price.unit ? <span>{price.unit}</span> : null}
                    </strong>
                    <small>{renderCopyText(item.extra_note)}</small>
                  </div>
                  <details className="pb-service-detail">
                    <summary aria-label={item.criteria}>
                      {detailLabel ? renderCopyText(detailLabel) : null}
                      <span aria-hidden="true" className="pb-service-detail-marker">
                        ＋
                      </span>
                    </summary>
                    <div className="pb-detail-body">{renderCopyText(item.criteria)}</div>
                  </details>
                </div>
              </article>
            );
          })}
        </div>

        {/* 원문 body.html 161행 — .extra-box reveal --delay:.08s */}
        {(extraHeading || extraBody) && (
          <div
            className="pb-extra-box pb-reveal"
            style={{ '--pb-delay': '0.08s' } as React.CSSProperties}
            ref={reveal('service-extra')}
            data-testid="extra-box"
          >
            <div>
              {extraHeading && <b data-testid="extra-box-heading">{renderCopyText(extraHeading)}</b>}
              {extraBody && <p data-testid="extra-box-body">{renderCopyText(extraBody)}</p>}
            </div>
            {extraCtaLabel ? (
              <a
                className="pb-extra-cta"
                data-testid="extra-box-cta"
                href={extraCtaHref ?? '#estimate'}
              >
                {renderCopyText(extraCtaLabel)}
              </a>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceGrid;