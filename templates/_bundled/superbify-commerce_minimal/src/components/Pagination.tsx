import React from 'react';
import { Button, Div, Span } from './basic';

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
export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    maxVisiblePages = 5,
    prevText,
    nextText,
    pageLabel,
    prevLabel,
    nextLabel,
    className,
}: PaginationProps): React.ReactElement | null {
    const safeCurrent = Number(currentPage) > 0 ? Number(currentPage) : 1;
    const bounded =
        totalPages !== null && totalPages !== undefined && Number.isFinite(Number(totalPages));
    const resolvedTotalPages = bounded ? Number(totalPages) : 0;

    // 마지막 페이지가 1 이하이면 페이지네이션 자체를 렌더하지 않는다.
    if (!bounded || resolvedTotalPages <= 1) {
        return null;
    }

    const canGoPrev = safeCurrent > 1;
    const canGoNext = safeCurrent < resolvedTotalPages;

    // 페이지 번호 목록은 순수 계산이라 훅 없이 그린다 (렌더 조건부 return과 훅 순서 충돌 방지).
    const pageNumbers = ((): (number | 'ellipsis')[] => {
        const pages: (number | 'ellipsis')[] = [];

        if (resolvedTotalPages <= maxVisiblePages + 2) {
            for (let i = 1; i <= resolvedTotalPages; i++) pages.push(i);
            return pages;
        }

        const halfVisible = Math.floor(maxVisiblePages / 2);
        let startPage = Math.max(2, safeCurrent - halfVisible);
        let endPage = Math.min(resolvedTotalPages - 1, safeCurrent + halfVisible);

        if (safeCurrent <= halfVisible + 1) {
            endPage = Math.max(endPage, maxVisiblePages);
        } else if (safeCurrent >= resolvedTotalPages - halfVisible) {
            startPage = Math.min(startPage, resolvedTotalPages - maxVisiblePages + 1);
        }

        pages.push(1);
        if (startPage > 2) pages.push('ellipsis');
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        if (endPage < resolvedTotalPages - 1) pages.push('ellipsis');
        pages.push(resolvedTotalPages);

        return pages;
    })();

    const labelFor = (page: number): string =>
        (pageLabel ?? '{n}').includes(':n')
            ? (pageLabel ?? '').replace(':n', String(page))
            : `${pageLabel ?? 'Page'} ${page}`;

    const controlStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 'var(--scm-touch-min, 44px)',
        minHeight: 'var(--scm-touch-min, 44px)',
        padding: '0.25rem 0.625rem',
        fontFamily: 'var(--scm-font-body, system-ui)',
        fontSize: '0.875rem',
        fontVariantNumeric: 'tabular-nums',
        color: 'var(--scm-text-primary, #26221E)',
        backgroundColor: 'transparent',
        border: '1px solid transparent',
        borderRadius: 'var(--scm-radius-sm, 4px)',
        cursor: 'pointer',
        lineHeight: 1.2,
    };

    const disabledStyle: React.CSSProperties = {
        ...controlStyle,
        color: 'var(--scm-text-muted, #8A837B)',
        cursor: 'not-allowed',
        opacity: 0.45,
    };

    const handleClick = (page: number) => {
        if (!onPageChange) return;
        if (page < 1 || page > resolvedTotalPages || page === safeCurrent) return;
        onPageChange(page);
    };

    return (
        <Div
            className={className}
            role="navigation"
            aria-label="pagination"
            data-testid="pagination"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '0.25rem',
                marginTop: 'var(--scm-spacing-lg, 1.5rem)',
            }}
        >
            <Button
                type="button"
                onClick={() => handleClick(safeCurrent - 1)}
                disabled={!canGoPrev}
                aria-label={prevLabel ?? 'previous page'}
                data-testid="pagination-prev"
                style={canGoPrev ? controlStyle : disabledStyle}
            >
                {prevText ?? '‹'}
            </Button>

            {pageNumbers.map((page, index) => {
                if (page === 'ellipsis') {
                    return (
                        <Span
                            key={`ellipsis-${index}`}
                            aria-hidden
                            data-testid="pagination-ellipsis"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 'var(--scm-touch-min, 44px)',
                                minHeight: 'var(--scm-touch-min, 44px)',
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.875rem',
                                color: 'var(--scm-text-muted, #8A837B)',
                            }}
                        >
                            …
                        </Span>
                    );
                }

                const isActive = page === safeCurrent;

                return (
                    <Button
                        key={page}
                        type="button"
                        onClick={() => handleClick(page)}
                        aria-label={labelFor(page)}
                        aria-current={isActive ? 'page' : undefined}
                        data-testid="pagination-page"
                        data-page={page}
                        data-active={isActive ? 'true' : 'false'}
                        style={
                            isActive
                                ? {
                                      ...controlStyle,
                                      color: 'var(--scm-text-inverse, #FAF8F3)',
                                      backgroundColor: 'var(--scm-charcoal, #26221E)',
                                      fontWeight: 600,
                                  }
                                : controlStyle
                        }
                    >
                        {page}
                    </Button>
                );
            })}

            <Button
                type="button"
                onClick={() => handleClick(safeCurrent + 1)}
                disabled={!canGoNext}
                aria-label={nextLabel ?? 'next page'}
                data-testid="pagination-next"
                style={canGoNext ? controlStyle : disabledStyle}
            >
                {nextText ?? ' ›'}
            </Button>
        </Div>
    );
}

export default Pagination;