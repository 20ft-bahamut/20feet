import '../styles/FaqList.css';
import type { FaqItem } from '../lib/types';

export interface FaqListProps {
  /** FAQ 도입 문구(copy: faq_intro). null 이면 문단을 숨긴다. */
  intro: string | null;
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
 * 질문·답변 문구는 전부 props 로 받는다(COPY POLICY — 하드코딩 금지).
 */
export function FaqList({ intro, items }: FaqListProps) {
  return (
    <section className="pb-faq-section">
      <div className="pb-faq-grid">
        <div className="pb-faq-intro">
          <span className="pb-faq-eyebrow">FAQ</span>
          {intro !== null && <p className="pb-faq-sub">{intro}</p>}
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