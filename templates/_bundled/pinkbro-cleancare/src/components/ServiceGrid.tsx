import React from 'react';
import '../styles/ServiceGrid.css';
import { servicePhotoFor } from '../lib/serviceAssets';
import type { MediaSlots, ServiceItem } from '../lib/types';

export interface ServiceGridProps {
  /** 섹션 도입 문구. copy 데이터에서 온다 — 하드코딩하지 않는다. */
  intro: string | null;
  /** 서비스 목록. null = 로딩 중, [] = 데이터 없음. */
  items: ServiceItem[] | null;
  /** 모듈 이미지 슬롯. */
  media: MediaSlots | null;
}

/**
 * 서비스 그리드 — 사진 우선순위: 슬롯 URL → 번들 템플릿 자산 → 중립 CSS 블록.
 * (D7 + D9 결합: 서비스 6종은 기본 탑재 사진이 있으므로 폴백이 중립 블록이 아니다)
 */
export function ServiceGrid({ intro, items, media }: ServiceGridProps): React.ReactElement {
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
                  <summary aria-label={item.criteria}>&plus;</summary>
                  <div className="pb-detail-body">{item.criteria}</div>
                </details>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default ServiceGrid;