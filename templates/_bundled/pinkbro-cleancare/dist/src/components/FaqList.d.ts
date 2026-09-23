import { FaqItem } from '../lib/types';
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
export declare function FaqList({ eyebrow, intro, introSub, items }: FaqListProps): import("react").JSX.Element;
