import { FaqItem } from '../lib/types';
export interface FaqListProps {
    /** FAQ 도입 문구(copy: faq_intro). null 이면 문단을 숨긴다. */
    intro: string | null;
    /** FAQ 항목. null = 로딩 중(스켈레톤), [] = 빈 목록. */
    items: FaqItem[] | null;
}
/**
 * FAQ 섹션 — 원본 #faq. 아코디언 JS 없이 네이티브 <details>/<summary> 를 쓴다.
 *
 * 3단 폴백: items === null → 스켈레톤, [] → 빈 상태, 배열 → 렌더.
 * 질문·답변 문구는 전부 props 로 받는다(COPY POLICY — 하드코딩 금지).
 */
export declare function FaqList({ intro, items }: FaqListProps): import("react").JSX.Element;
