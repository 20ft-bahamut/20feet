import '../styles/FaqList.css';
import type { FaqItem } from '../lib/types';

export interface FaqListProps {
  /** 섹션 eyebrow(원문 `FAQ`, 326행 / copy: faq_eyebrow). null 이면 생략한다. */
  eyebrow?: string | null;
  /** FAQ 도입 문구(copy: faq_intro). null 이면 문단을 숨긴다. */
  intro: string | null;
  /** FAQ 도입 보조 문구(copy: faq_intro_sub). null 이면 문단을 숨긴다. */
  introSub: string | null;
  /** FAQ 항목. null = 로딩 중(스켈레톤), [] = 빈 목록. */
  items: FaqItem[] | null;
}

function Skeleton() {
  return (
    <div className="pb-faq-skeleton" data-testid="faq-skeleton">
      <span className="pb-faq-skeleton-line" style={{ width: '90%' }} />
      <span className="pb-faq-skeleton-line" style={{ width: '76%' }} />
      <span className="pb-faq-skeleton-line" style={{ width: '84%' }} />
      <span className="pb-faq-skeleton-line" style={{ width: '68%' }} />
    </div>
  );
}

/**
 * FAQ 섹션 — 원본 #faq. 아코디언 JS 없이 네이티브 <details>/<summary> 를 쓴다.
 *
 * 3단 폴백: items === null → 스켈레톤, [] → 빈 상태, 배열 → 렌더.
 * 문구는 전부 props 로 받는다(COPY POLICY — 하드코딩 금지).
 * intro(copy: faq_intro)는 원본 .h2 제목 — <h2> 로 렌더하며, 시더 값의 \n 이
 * 줄바꿈이 된다(원본 <br> 대응). introSub(copy: faq_intro_sub)는 .sub 문단.
 * eyebrow(copy: faq_eyebrow)는 원문 326행의 눈금이며, 값이 없으면 생략한다.
 */
export function FaqList({ eyebrow, intro, introSub, items }: FaqListProps) {
  return (
    <section className="pb-faq-section">
      <div className="pb-faq-grid">
        <div className="pb-faq-intro">
          {eyebrow ? (
            <span className="pb-faq-eyebrow" data-testid="faq-eyebrow">
              {eyebrow}
            </span>
          ) : null}
          {intro !== null && (
            <h2 className="pb-faq-h2" data-testid="faq-heading">
              {intro}
            </h2>
          )}
          {introSub !== null && (
            <p className="pb-faq-sub" data-testid="faq-intro-sub">
              {introSub}
            </p>
          )}
        </div>

        <div className="pb-faq-list">
          {items === null ? (
            <Skeleton />
          ) : items.length === 0 ? (
            <div className="pb-faq-empty" data-testid="faq-empty" />
          ) : (
            items.map((item, i) => (
              <details className="pb-faq-item" open={i === 0} key={`${item.question}-${i}`}>
                <summary>{item.question}</summary>
                <div className="pb-faq-answer">{item.answer}</div>
              </details>
            ))
          )}
        </div>
      </div>
    </section>
  );
}