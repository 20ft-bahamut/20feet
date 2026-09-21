import React from 'react';
import { Div, Img } from './basic';
import '../styles/PackageList.css';
import { slotPhotoFor } from '../lib/serviceAssets';
import type { DiscountStep, MediaSlots, PackageItem } from '../lib/types';

export interface PackageListProps {
  /** 스테이지 눈금(copy: package_stage_eyebrow, 원문 175행). null 이면 생략한다. */
  stageEyebrow?: string | null;
  /** 섹션 도입 문구(copy: package_intro — 원문 .package-copy 안의 h2). null 이면 생략한다. */
  intro: string | null;
  /** 섹션 보조 문구(copy: package_intro_sub — 원문 .sub). null 이면 생략한다. */
  introSub: string | null;
  /**
   * 카드 라벨(copy: package_a_label / package_b_label / package_c_label, 원문 .pkg-label).
   * 원문 카드 순서(A·B·C)와 모듈 `sort`(1·2·3)가 같으므로 카드 index 로 대응한다.
   * null 이면 그 카드의 라벨만 생략한다.
   */
  labelA?: string | null;
  labelB?: string | null;
  labelC?: string | null;
  /**
   * 카드 가격 아래 원문 노트(copy: package_a_note / package_a_note_sub …).
   * 원문 .pkg-note 는 `기본가 합계 …<br>… 동시작업 … 적용` 한 줄이라
   * 두 값을 사이에 <br> 을 두고 렌더한다. null 이면 그 카드의 노트만 생략한다.
   */
  noteA?: string | null;
  noteASub?: string | null;
  noteB?: string | null;
  noteBSub?: string | null;
  noteC?: string | null;
  noteCSub?: string | null;
  /** 동시작업 혜택 박스 눈금(copy: benefit_eyebrow, 원문 232행). null 이면 생략한다. */
  benefitEyebrow?: string | null;
  /** 동시작업 혜택 박스 제목(copy: benefit_heading). null 이면 제목을 생략한다. */
  benefitHeading: string | null;
  /** 동시작업 혜택 박스 안내 문구(copy: benefit_sub). */
  benefitSub: string | null;
  /** 동시작업 할인 표(copy: benefit_items — 원문 benefit-grid 4행). null = 로딩 중, [] = 행 없음. */
  benefitItems: DiscountStep[] | null;
  /** 패키지 목록. null = 로딩 중, [] = 데이터 없음. */
  items: PackageItem[] | null;
  /** 미디어 슬롯 키 → 슬롯. null = 아직 로딩 중. `package_stage` 가 이 섹션의 스테이지 이미지다. */
  media: MediaSlots | null;
}

/**
 * 패키지 그리드 — 3카드. is_featured 면 강조(다크) 카드.
 *
 * 원문 `#package` 는 패키지 카드 위에 스테이지(.package-stage)를 두고 그 안에
 * 도입 카피를 얹는다(body.html 171–180). 그 스테이지가 모듈 슬롯 `package_stage` 의
 * 자리다 — 슬롯 URL 이 있으면 그 이미지, 없으면 번들 자리표시자 사진(SLOT_PHOTO.package_stage),
 * 둘 다 없으면 중립 CSS 폴백(원문 Unsplash 제거, 스펙 §8).
 * 카드 아래에는 동시작업 혜택 박스(benefit-box)를 둔다(body.html 229–243).
 *
 * 문구는 전부 props 로 받는다(COPY POLICY — 하드코딩 금지).
 * 원문의 눈금(`Pinkbro F&B Package` / `Multi-Service Benefit`, 175·232행),
 * 카드 라벨(`A Package` 등, 182·197·212행), 카드 가격 아래 노트
 * (`기본가 합계 400,000원` / `3개 항목 동시작업 5% 적용`, 193·208·225행)는
 * copy 도메인 키로 배선됐다 — 값이 없으면 리터럴로 대체하지 않고 조용히 생략한다.
 */
/**
 * 원문 .pkg-total 은 금액 본체(42px)와 접미사 `원~`(16px small, body.html 191)를
 * 크기를 나눠 렌더한다. price prop 은 `380,000원~` 한 문자열이므로 숫자 본문과
 * 원 단위 접미사를 나눠 작은 글씨로 내린다 — 문구는 추가하지 않는다.
 */
function splitPriceSuffix(price: string): { amount: string; suffix: string | null } {
  const match = price.match(/^(.*\d)\s*(원.*)$/s);
  if (!match) {
    return { amount: price, suffix: null };
  }
  return { amount: match[1], suffix: match[2] };
}

export function PackageList({
  stageEyebrow,
  intro,
  introSub,
  labelA,
  labelB,
  labelC,
  noteA,
  noteASub,
  noteB,
  noteBSub,
  noteC,
  noteCSub,
  benefitEyebrow,
  benefitHeading,
  benefitSub,
  benefitItems,
  items,
  media,
}: PackageListProps): React.ReactElement {
  if (items === null) {
    return (
      <div className="pb-packages" data-testid="packages-skeleton">
        <div className="pb-wrap">
          <div className="pb-package-grid" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pb-pkg-card pb-pkg-card--skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pb-packages" data-testid="packages-empty">
        <div className="pb-wrap">
          <div className="pb-packages-empty-block" />
        </div>
      </div>
    );
  }

  const stage = media?.package_stage ?? null;
  // 슬롯 URL 이 있으면 그 URL, 없으면 번들 자리표시자(service-awning-care) — 완성된 URL 이다.
  const stageUrl = slotPhotoFor('package_stage', media);

  const hasBenefit =
    Boolean(benefitHeading) ||
    Boolean(benefitSub) ||
    (Array.isArray(benefitItems) && benefitItems.length > 0);

  return (
    <div className="pb-packages">
      <div className="pb-wrap">
        <div className="pb-package-stage" data-testid="package-stage">
          {stageUrl ? (
            <Img
              className="pb-package-stage-media"
              data-testid="package-stage-media"
              src={stageUrl}
              alt={stage?.alt ?? ''}
              loading="lazy"
            />
          ) : (
            <Div
              className="pb-package-stage-fallback"
              data-testid="package-stage-fallback"
              aria-hidden="true"
            />
          )}
          <div className="pb-package-copy">
            {stageEyebrow ? (
              <div className="pb-package-copy-eyebrow" data-testid="package-stage-eyebrow">
                {stageEyebrow}
              </div>
            ) : null}
            {intro ? (
              <h2 className="pb-package-copy-title" data-testid="packages-intro">
                {intro}
              </h2>
            ) : null}
            {introSub ? (
              <p className="pb-package-copy-sub" data-testid="packages-intro-sub">
                {introSub}
              </p>
            ) : null}
          </div>
        </div>
        <div className="pb-package-grid">
          {items.map((item, index) => {
            const { amount, suffix } = splitPriceSuffix(item.price);
            // 원문 카드 순서(A·B·C) = 모듈 sort 순서(1·2·3) — index 로 대응한다.
            // 키가 비어 있으면 그 카드의 라벨/노트만 생략한다(리터럴 대체 금지).
            const label = [labelA, labelB, labelC][index] ?? null;
            const note = [noteA, noteB, noteC][index] ?? null;
            const noteSub = [noteASub, noteBSub, noteCSub][index] ?? null;
            return (
              <article
                key={item.title}
                className={
                  item.is_featured ? 'pb-pkg-card pb-pkg-card--featured' : 'pb-pkg-card'
                }
                data-testid="package-card"
              >
                {label ? (
                  <div className="pb-pkg-label" data-testid="package-label">
                    {label}
                  </div>
                ) : null}
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <ul className="pb-pkg-list">
                  {item.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <div className="pb-pkg-total">
                  <div className="pb-pkg-old">{item.base_total}</div>
                  <div className="pb-pkg-new">
                    {amount}
                    {suffix && (
                      <small className="pb-pkg-new-suffix" data-testid="package-price-suffix">
                        {suffix}
                      </small>
                    )}
                  </div>
                  {note || noteSub ? (
                    <div className="pb-pkg-note" data-testid="package-note">
                      {note}
                      {note && noteSub ? <br /> : null}
                      {noteSub}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        {hasBenefit && (
          <div className="pb-benefit-box" data-testid="benefit-box">
            <div className="pb-benefit-top">
              <div>
                {benefitEyebrow && (
                  <div className="pb-benefit-eyebrow" data-testid="benefit-eyebrow">
                    {benefitEyebrow}
                  </div>
                )}
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
    </div>
  );
}

export default PackageList;