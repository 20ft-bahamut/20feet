import '../styles/FaqList.css';
import { renderCopyText } from '../lib/copyText';
import { usePbRevealRef } from '../lib/reveal';
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
 *
 * 답변의 강조는 데이터에 있다 — 시더가 원문 마크업(body.html 333~361행)을 그대로
 * 저장하므로(<strong> 등), 표시 계층은 그것을 글자로 노출하지 않고 요소로 렌더만
 * 한다(Hero 의 renderCopyText — \n 도 원본 <br> 처럼 줄바꿈으로 렌더한다).
 * 경계를 추정하는 첫 문장 휴리스틱은 제거됐다: 마크업이 데이터에 있으면 추정은
 * 이중 강조가 된다.
 */
export function FaqList({ eyebrow, intro, introSub, items }: FaqListProps) {
  // 리빌 — 원문 body.html 325(faq-intro left)·331~359(faq-item ×8, 시차 없음)행.
  const reveal = usePbRevealRef<HTMLElement>();
  return (
    <section className="pb-faq-section">
      <div className="pb-faq-grid">
        {/* 원문 body.html 325행 — .faq-intro reveal left */}
        <div
          className="pb-faq-intro pb-reveal pb-reveal--left"
          ref={reveal('faq-intro')}
        >
          {eyebrow ? (
            <span className="pb-faq-eyebrow" data-testid="faq-eyebrow">
              {renderCopyText(eyebrow)}
            </span>
          ) : null}
          {intro !== null && (
            <h2 className="pb-faq-h2" data-testid="faq-heading">
              {renderCopyText(intro)}
            </h2>
          )}
          {introSub !== null && (
            <p className="pb-faq-sub" data-testid="faq-intro-sub">
              {renderCopyText(introSub)}
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
              // 답변 강조는 저장된 마크업(<strong>)이 담당한다 — 평문 노출도, 추정도 없다.
              // 원문 body.html 331~359행 — .faq-item reveal (시차 없음, 8문항).
              <details
                className="pb-faq-item pb-reveal"
                ref={reveal(`faq-item-${i}`)}
                open={i === 0}
                key={`${item.question}-${i}`}
              >
                <summary>{item.question}</summary>
                <div className="pb-faq-answer" data-testid="faq-answer">
                  {renderCopyText(item.answer)}
                </div>
              </details>
            ))
          )}
        </div>
      </div>
    </section>
  );
}