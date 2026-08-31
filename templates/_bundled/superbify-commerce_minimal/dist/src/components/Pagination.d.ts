import { default as React } from 'react';
export interface PaginationProps {
    /** 현재 페이지 (레이아웃에서 `{{...pagination.current_page}}` 로 바인딩) */
    currentPage: number;
    /** 마지막 페이지 (레이아웃에서 `{{...pagination.last_page}}` 로 바인딩) */
    totalPages: number | null;
    /** 페이지 이동 콜백 (레이아웃 actions onPageChange → navigate 와이어링) */
    onPageChange?: (page: number) => void;
    /** 번호 축약 없이 그릴 최대 페이지 수 */
    maxVisiblePages?: number;
    /** 이전/다음 버튼 라벨 (미지정 시 ‹ › 기호) */
    prevText?: string;
    nextText?: string;
    /** 페이지 번호 접근성 라벨 (`:n` 을 페이지 번호로 치환) */
    pageLabel?: string;
    /** 이전/다음 접근성 라벨 */
    prevLabel?: string;
    nextLabel?: string;
    className?: string;
}
/**
 * Pagination — Still Form 스토어 페이지네이션 composite.
 *
 * sirsoft-basic 공식 Pagination(페이지 산식)을 Still Form 토큰으로 포크:
 * - prev/next + 페이지 번호 (많은 페이지는 `...` 축약)
 * - 현재 페이지 charcoal 반전, 최소 44px 터치 타깃
 * - totalPages(=last_page) 가 1 이하이면 렌더하지 않음
 * - 페이지 산식은 sirsoft-basic Pagination 알고리즘과 동일 규칙
 */
export declare function Pagination({ currentPage, totalPages, onPageChange, maxVisiblePages, prevText, nextText, pageLabel, prevLabel, nextLabel, className, }: PaginationProps): React.ReactElement | null;
export default Pagination;
