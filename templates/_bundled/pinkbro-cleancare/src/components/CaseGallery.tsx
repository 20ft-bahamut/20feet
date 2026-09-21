import React from 'react';
import type { CaseItem, MediaSlots } from '../lib/types';
import { slotPhotoFor } from '../lib/serviceAssets';
import '../styles/CaseGallery.css';

export interface CaseGalleryProps {
  /** 섹션 소개 문구 — copy 도메인에서 온다. null 이면 렌더하지 않는다. */
  intro: string | null;
  /** 섹션 보조 문구(copy: projects_sub). null 이면 렌더하지 않는다. 헤더 오른쪽 하단에 정렬된다. */
  sub: string | null;
  /** 하단 주의 문구 — null 이면 렌더하지 않는다. */
  note: string | null;
  /** 사례 목록. null = 로딩 중(스켈레톤), [] = 빈 상태. */
  items: CaseItem[] | null;
  /**
   * 미디어 슬롯 키 → 슬롯. null = 아직 로딩 중.
   * `case_1`…`case_4` 가 카드 순서대로의 커버 슬롯이다.
   */
  media: MediaSlots | null;
  /**
   * 섹션 눈금(원문 `Recent Projects`, 371행 / copy: projects_eyebrow).
   * 값을 받으면 렌더하고, 없으면 헤더는 소개 문구만 렌더한다.
   */
  eyebrow?: string | null;
  /**
   * 카드 킥커(원문 `PINKBRO PROJECT`, 379·383·387·391행 / copy: projects_card_kicker).
   * 값을 받으면 카드마다 렌더하고, 없으면 생략한다.
   */
  cardKicker?: string | null;
  /**
   * 카드 링크 문구(원문 `작업사례 자세히 보기`, 379행 / copy: projects_link_label).
   * 값을 받고 `blog_url` 이 있을 때만 렌더한다.
   */
  linkLabel?: string | null;
}

/**
 * 작업사례 갤러리 (소스 `#projects` / `.project-*` 이식).
 *
 * 구조는 원문 그대로다: `.section-head`(왼쪽 눈금+소개 / 오른쪽 보조 문구,
 * 하단 정렬 2단) → `.project-grid`(4열 카드) → `.project-note`.
 *
 * 3단계 폴백: items null → 스켈레톤, [] → 빈 상태, 배열 → 카드 렌더.
 *
 * 카드 커버는 3단 폴백이다:
 *   1. 항목이 이미 해석해 온 슬롯 결과(`item.cover.url`) — 있으면 그 URL 이 이긴다
 *   2. 카드 순번의 슬롯(`case_1`…`case_4`)에 관리자가 올린 URL
 *   3. 번들 자리표시자 사진(SLOT_PHOTO) — 슬롯이 비어 있을 때 그 자리를 채운다
 *   4. 셋 다 없으면 `.pb-project-thumb` 의 CSS 그라디언트 폴백
 *
 * 슬롯 키는 항목이 `cover_slot` 을 들고 오면 그 키를, 아니면 카드 순번을 쓴다.
 * 공개 API(CaseResource)는 아직 `cover_slot` 을 내려주지 않으므로 현재는 순번으로
 * 해석된다 — 관리자가 순서를 바꾸면 그 순번의 슬롯 사진이 그 자리에 온다.
 *
 * `blog_url` 이 비면 `<a>` 대신 `<div aria-disabled="true">` 로 렌더한다 —
 * 소스가 `href="#"` 플레이스홀더로 두었던 문제를 없앤다 (SPEC §12 사용자 대기 항목).
 *
 * 눈금(`Recent Projects`)·카드 킥커(`PINKBRO PROJECT`)·링크 문구
 * (`작업사례 자세히 보기`)는 원문에 있는 문구이며 copy 도메인 키
 * (projects_eyebrow / projects_card_kicker / projects_link_label)로 배선됐다.
 * 값이 없으면 리터럴로 대체하지 않고 조용히 생략한다 (COPY POLICY).
 */
export function CaseGallery({
  intro,
  sub,
  note,
  items,
  media,
  eyebrow,
  cardKicker,
  linkLabel,
}: CaseGalleryProps): React.ReactElement {
  return (
    <section className="pb-projects" data-testid="cases">
      <div className="pb-projects__wrap">
        <div className="pb-projects__head">
          <div className="pb-projects__copy">
            {eyebrow ? (
              <span className="pb-projects__eyebrow" data-testid="projects-eyebrow">
                {eyebrow}
              </span>
            ) : null}
            {intro ? <h2 className="pb-projects__intro">{intro}</h2> : null}
          </div>
          {sub ? (
            <p className="pb-projects__sub" data-testid="projects-sub">
              {sub}
            </p>
          ) : null}
        </div>

        {items === null ? (
          <div className="pb-project-grid" data-testid="cases-skeleton" aria-busy="true">
            {[0, 1, 2, 3].map(n => (
              <div key={n} className="pb-project-skeleton" style={{ '--pb-delay': `${n * 0.06}s` } as React.CSSProperties} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="pb-projects__empty" data-testid="cases-empty" />
        ) : (
          <div className="pb-project-grid">
            {items.map((item, index) => (
              <CaseCard
                key={`${item.title}-${index}`}
                item={item}
                index={index}
                media={media}
                cardKicker={cardKicker}
                linkLabel={linkLabel}
              />
            ))}
          </div>
        )}

        {note ? <p className="pb-project-note">{note}</p> : null}
      </div>
    </section>
  );
}

function CaseCard({
  item,
  index,
  media,
  cardKicker,
  linkLabel,
}: {
  item: CaseItem;
  index: number;
  media: MediaSlots | null;
  cardKicker?: string | null;
  linkLabel?: string | null;
}): React.ReactElement {
  const hasLink = typeof item.blog_url === 'string' && item.blog_url.length > 0;
  // 항목이 cover_slot 을 들고 오면 그 키, 아니면 카드 순번(case_1…)이 이 카드의 슬롯이다.
  const coverSlotKey = item.cover_slot ?? `case_${index + 1}`;
  // 슬롯 업로드(항목이 해석해 온 cover → 슬롯 맵)가 번들 자리표시자를 이긴다.
  const coverUrl = item.cover?.url ?? slotPhotoFor(coverSlotKey, media);
  const coverAlt = item.cover?.alt ?? media?.[coverSlotKey]?.alt ?? '';

  const body = (
    <>
      <div className="pb-project-thumb">
        {coverUrl ? (
          <img
            data-testid="case-cover"
            src={coverUrl}
            alt={coverAlt}
            className="pb-project-thumb__img"
            loading="lazy"
          />
        ) : (
          <div className="pb-project-thumb__fallback" data-testid="case-cover-fallback" />
        )}
        <span className="pb-project-index">Case {String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="pb-project-body">
        {cardKicker ? <span className="pb-project-kicker" data-testid="case-card-kicker">{cardKicker}</span> : null}
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
        {hasLink && linkLabel ? (
          <span className="pb-project-link" data-testid="case-card-link" aria-hidden="true">
            {linkLabel}
          </span>
        ) : null}
      </div>
    </>
  );

  const className = 'pb-project-card';

  if (!hasLink) {
    return (
      <div
        className={className}
        data-testid="case-card"
        aria-disabled="true"
      >
        {body}
      </div>
    );
  }

  return (
    <a
      className={className}
      data-testid="case-card"
      href={item.blog_url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {body}
    </a>
  );
}

export default CaseGallery;