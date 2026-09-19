import React from 'react';
import '../styles/ServiceGrid.css';
import { servicePhotoFor } from '../lib/serviceAssets';
import type { MediaSlots, ServiceItem } from '../lib/types';

export interface ServiceGridProps {
  /** 섹션 도입 문구. copy 데이터에서 온다 — 하드코딩하지 않는다. */
  intro: string | null;
  /** 섹션 보조 문구(copy: service_intro_sub). null 이면 생략한다. */
  introSub: string | null;
  /** 서비스 카드의 상세 펼침 라벨(copy: service_detail_label). null 이면 ＋ 마커만 남는다. */
  detailLabel: string | null;
  /** 목록에 없는 서비스 안내 박스 제목(copy: extra_box_heading). null 이면 박스를 숨긴다. */
  extraHeading: string | null;
  /** 목록에 없는 서비스 안내 박스 본문(copy: extra_box_body). */
  extraBody: string | null;
  /** 서비스 목록. null = 로딩 중, [] = 데이터 없음. */
  items: ServiceItem[] | null;
  /** 모듈 이미지 슬롯. */
  media: MediaSlots | null;
}

/**
 * 서비스 그리드 — 사진 우선순위: 슬롯 URL → 번들 템플릿 자산 → 중립 CSS 블록.
 * (D7 + D9 결합: 서비스 6종은 기본 탑재 사진이 있으므로 폴백이 중립 블록이 아니다)
 *
 * 문구는 전부 props 로 받는다(COPY POLICY — 하드코딩 금지).
 * 원문 extra-box 의 CTA(`기타 서비스 문의하기`)는 copy 도메인에 키가 없어 렌더하지 않는다 —
 * 리포트의 COPY REQUIRED 항목 참조.
 */
export function ServiceGrid({
  intro,
  introSub,
  detailLabel,
  extraHeading,
  extraBody,
  items,
  media,
}: ServiceGridProps): React.ReactElement {
  if (items === null) {
    return (
      <div className="pb-services" data-testid="services-skeleton">
        <div className="pb-service-grid" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="pb-service-card pb-service-card--skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pb-services" data-testid="services-empty">
        <div className="pb-services-empty-block" />
      </div>
    );
  }

  return (
    <div className="pb-services">
      {intro ? <p className="pb-services-intro">{intro}</p> : null}
      {introSub ? (
        <p className="pb-services-sub" data-testid="services-intro-sub">
          {introSub}
        </p>
      ) : null}
      <div className="pb-service-grid">
        {items.map((item, index) => {
          const photoUrl = servicePhotoFor(item.slug, media);
          return (
            <article key={item.slug} className="pb-service-card" data-testid="service-card">
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
                <p>{item.summary}</p>
                <div className="pb-price-row">
                  <strong>{item.base_price}</strong>
                  <small>{item.extra_note}</small>
                </div>
                <details className="pb-service-detail">
                  <summary aria-label={item.criteria}>
                    {detailLabel ? (
                      <>
                        {detailLabel}{' '}
                        <span aria-hidden="true" className="pb-service-detail-marker">
                          ＋
                        </span>
                      </>
                    ) : (
                      '＋'
                    )}
                  </summary>
                  <div className="pb-detail-body">{item.criteria}</div>
                </details>
              </div>
            </article>
          );
        })}
      </div>

      {(extraHeading || extraBody) && (
        <div className="pb-extra-box" data-testid="extra-box">
          <div>
            {extraHeading && <b data-testid="extra-box-heading">{extraHeading}</b>}
            {extraBody && <p data-testid="extra-box-body">{extraBody}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceGrid;