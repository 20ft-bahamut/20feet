import React from 'react';
import type { CaseItem, MediaSlots } from '../lib/types';
import { slotPhotoFor } from '../lib/serviceAssets';
import { renderCopyText } from '../lib/copyText';
import { usePbRevealRef } from '../lib/reveal';
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
   * 값을 받으면 `blog_url` 여부와 무관하게 렌더한다 — 원문도 링크가 비어 있어도
   * `.project-link` 라벨을 항상 보여준다 (body.html 379행 / styles.css 276행).
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
 * 카드 커버는 2단 폴백이다:
 *   1. 항목이 이미 해석해 온 슬롯 결과(`item.cover.url`) — 있으면 그 URL 이 이긴다
 *   2. 카드 순번의 슬롯(`case_1`…`case_4`)에 관리자가 올린 URL
 *   둘 다 없으면 사진을 렌더하지 않는다 — `.pb-project-thumb` 자체의 CSS 그라디언트
 *   원문 배경이 그대로 보인다 (원문 styles.css 269-270행. 원본도 사례 커버를
 *   사진으로 채우지 않는다 — body.html 379행의 썸은 그라디언트 + `Case 01` 라벨뿐이다).
 *
 * 슬롯 키는 항목이 `cover_slot` 을 들고 오면 그 키를, 아니면 카드 순번을 쓴다.
 * 공개 API(CaseResource)는 아직 `cover_slot` 을 내려주지 않으므로 현재는 순번으로
 * 해석된다 — 관리자가 순서를 바꾸면 그 순번의 슬롯 사진이 그 자리에 온다.
 *
 * `blog_url` 이 비면 `<a>` 대신 `<div aria-disabled="true">` 로 렌더한다 —
 * 소스가 `href="#"` 플레이스홀더로 두었던 문제를 없앤다 (SPEC §12 사용자 대기 항목).
 * 링크 문구(`.pb-project-link`)는 이 결정과 무관하게 항상 렌더한다 — 원문도
 * `blog_url` 이 비어 있어도 라벨을 보여준다 (body.html 379행).
 *
 * 눈금(`Recent Projects`)·카드 킥커(`PINKBRO PROJECT`)·링크 문구
 * (`작업사례 자세히 보기`)는 원문에 있는 문구이며 copy 도메인 키
 * (projects_eyebrow / projects_card_kicker / projects_link_label)로 배선됐다.
 * 값이 없으면 리터럴로 대체하지 않고 조용히 생략한다 (COPY POLICY).
 */
/**
 * 프로젝트 카드 리빌 시차 — 원문 body.html 377(–)·381(.04)·385(.08)·389(.12)행
 * 그대로다. 원문 카드는 4장이다 — 5번째 항목부터는 원문에 근거가 없으므로 시차를
 * 만들지 않는다(0s).
 */
const PROJECT_CARD_DELAYS = ['0s', '0.04s', '0.08s', '0.12s'];

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
  // 리빌 — 원문 body.html 370(copy)·374(sub right)·377~391(project-card ×4)행.
  const reveal = usePbRevealRef<HTMLElement>();
  return (
    <section className="pb-projects" data-testid="cases">
      <div className="pb-projects__wrap">
        <div className="pb-projects__head">
          {/* 원문 body.html 370행 — .copy reveal */}
          <div className="pb-projects__copy pb-reveal" ref={reveal('projects-copy')}>
            {eyebrow ? (
              <span className="pb-projects__eyebrow" data-testid="projects-eyebrow">
                {renderCopyText(eyebrow)}
              </span>
            ) : null}
            {intro ? <h2 className="pb-projects__intro">{renderCopyText(intro)}</h2> : null}
          </div>
          {/* 원문 body.html 374행 — .sub reveal right */}
          {sub ? (
            <p
              className="pb-projects__sub pb-reveal pb-reveal--right"
              ref={reveal('projects-sub')}
              data-testid="projects-sub"
            >
              {renderCopyText(sub)}
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
                cardRef={reveal(`project-card-${index}`)}
                delay={PROJECT_CARD_DELAYS[index] ?? '0s'}
              />
            ))}
          </div>
        )}

        {note ? <p className="pb-project-note">{renderCopyText(note)}</p> : null}
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
  cardRef,
  delay,
}: {
  item: CaseItem;
  index: number;
  media: MediaSlots | null;
  cardKicker?: string | null;
  linkLabel?: string | null;
  /** 리빌 ref — 원문 body.html 377~391행의 .project-card reveal */
  cardRef: React.RefCallback<HTMLElement>;
  /** 원문 --delay 값 ('0s' 포함) */
  delay: string;
}): React.ReactElement {
  const hasLink = typeof item.blog_url === 'string' && item.blog_url.length > 0;
  // 항목이 cover_slot 을 들고 오면 그 키, 아니면 카드 순번(case_1…)이 이 카드의 슬롯이다.
  const coverSlotKey = item.cover_slot ?? `case_${index + 1}`;
  // 항목이 해석해 온 cover → 슬롯 업로드 순으로 이긴다. 슬롯이 비면 null 이 정상 경로다 —
  // 그때는 사진을 렌더하지 않고 .pb-project-thumb 의 그라디언트 원문 배경만 남긴다.
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
        ) : null}
        <span className="pb-project-index">Case {String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="pb-project-body">
        {cardKicker ? <span className="pb-project-kicker" data-testid="case-card-kicker">{renderCopyText(cardKicker)}</span> : null}
        <h3>{item.title}</h3>
        <p>{renderCopyText(item.summary)}</p>
        {/* 원문은 blog_url 이 비어도 .project-link 라벨을 항상 보여준다
            (body.html 379행 / styles.css 276-277행) — 라벨은 링크 여부와 무관하게 렌더하고
            링크 여부는 카드 엘리먼트 결정에만 쓴다. */}
        {linkLabel ? (
          <span className="pb-project-link" data-testid="case-card-link" aria-hidden="true">
            {renderCopyText(linkLabel)}
          </span>
        ) : null}
      </div>
    </>
  );

  const className = 'pb-project-card pb-reveal';
  const cardStyle = { '--pb-delay': delay } as React.CSSProperties;

  if (!hasLink) {
    return (
      <div
        className={className}
        style={cardStyle}
        ref={cardRef}
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
      style={cardStyle}
      ref={cardRef}
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