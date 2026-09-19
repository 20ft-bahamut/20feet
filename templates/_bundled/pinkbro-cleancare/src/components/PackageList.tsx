import React from 'react';
import '../styles/PackageList.css';
import type { DiscountStep, PackageItem } from '../lib/types';

export interface PackageListProps {
  /** 섹션 도입 문구. copy 데이터에서 온다 — 하드코딩하지 않는다. */
  intro: string | null;
  /** 섹션 보조 문구(copy: package_intro_sub). null 이면 생략한다. */
  introSub: string | null;
  /** 동시작업 혜택 박스 제목(copy: benefit_heading). null 이면 제목을 생략한다. */
  benefitHeading: string | null;
  /** 동시작업 혜택 박스 안내 문구(copy: benefit_sub). */
  benefitSub: string | null;
  /** 동시작업 할인 표(copy: benefit_items — 원문 benefit-grid 4행). null = 로딩 중, [] = 행 없음. */
  benefitItems: DiscountStep[] | null;
  /** 패키지 목록. null = 로딩 중, [] = 데이터 없음. */
  items: PackageItem[] | null;
}

/**
 * 패키지 그리드 — 3카드. is_featured 면 강조(다크) 카드.
 *
 * 원문 `#package` 는 패키지 카드 아래에 동시작업 혜택 박스(benefit-box)를 둔다
 * (body.html 229–243) — 그래서 그 표(`benefit_items`)를 이 컴포넌트가 렌더한다.
 * 문구는 전부 props 로 받는다(COPY POLICY — 하드코딩 금지).
 * 원문의 eyebrow(`Pinkbro F&B Package`/`Multi-Service Benefit`)와 카드 라벨
 * (`A Package` 등)은 copy 도메인에 키가 없어 렌더하지 않는다 — 리포트의 COPY REQUIRED 참조.
 */
export function PackageList({
  intro,
  introSub,
  benefitHeading,
  benefitSub,
  benefitItems,
  items,
}: PackageListProps): React.ReactElement {
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

  const hasBenefit =
    Boolean(benefitHeading) ||
    Boolean(benefitSub) ||
    (Array.isArray(benefitItems) && benefitItems.length > 0);

  return (
    <div className="pb-packages">
      {intro ? <p className="pb-packages-intro">{intro}</p> : null}
      {introSub ? (
        <p className="pb-packages-sub" data-testid="packages-intro-sub">
          {introSub}
        </p>
      ) : null}
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

      {hasBenefit && (
        <div className="pb-benefit-box" data-testid="benefit-box">
          <div className="pb-benefit-top">
            <div>
              {benefitHeading && (
                <h3 className="pb-benefit-heading" data-testid="benefit-heading">
                  {benefitHeading}
                </h3>
              )}
            </div>
            {benefitSub && (
              <p className="pb-benefit-sub" data-testid="benefit-sub">
                {benefitSub}
              </p>
            )}
          </div>

          {Array.isArray(benefitItems) && benefitItems.length > 0 && (
            <div className="pb-benefit-grid">
              {benefitItems.map((step, index) => (
                <div
                  className="pb-benefit-item"
                  data-testid="benefit-item"
                  key={`${step.condition}-${index}`}
                >
                  <small>{step.condition}</small>
                  <strong>{step.amount_label}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PackageList;