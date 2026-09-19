import React from 'react';
import '../styles/PackageList.css';
import type { PackageItem } from '../lib/types';

export interface PackageListProps {
  /** 섹션 도입 문구. copy 데이터에서 온다 — 하드코딩하지 않는다. */
  intro: string | null;
  /** 패키지 목록. null = 로딩 중, [] = 데이터 없음. */
  items: PackageItem[] | null;
}

/**
 * 패키지 그리드 — 3카드. is_featured 면 강조(다크) 카드.
 */
export function PackageList({ intro, items }: PackageListProps): React.ReactElement {
  if (items === null) {
    return (
      <div className="pb-packages" data-testid="packages-skeleton">
        <div className="pb-package-grid" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="pb-pkg-card pb-pkg-card--skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pb-packages" data-testid="packages-empty">
        <div className="pb-packages-empty-block" />
      </div>
    );
  }

  return (
    <div className="pb-packages">
      {intro ? <p className="pb-packages-intro">{intro}</p> : null}
      <div className="pb-package-grid">
        {items.map((item) => (
          <article
            key={item.title}
            className={
              item.is_featured ? 'pb-pkg-card pb-pkg-card--featured' : 'pb-pkg-card'
            }
            data-testid="package-card"
          >
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <ul className="pb-pkg-list">
              {item.includes.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="pb-pkg-total">
              <div className="pb-pkg-old">{item.base_total}</div>
              <div className="pb-pkg-new">{item.price}</div>
              <div className="pb-pkg-note">
                <span className="pb-pkg-discount">
                  <span data-testid="package-discount">{item.discount_rate}</span>%
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default PackageList;