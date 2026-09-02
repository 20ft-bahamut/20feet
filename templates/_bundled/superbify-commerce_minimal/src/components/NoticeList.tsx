import React from 'react';
import { A, Div, Span } from './basic';
import { EmptyState } from './EmptyState';
import type { NoticeItem } from '../types/template';

export interface NoticeListProps {
    items?: NoticeItem[] | null;
    loading?: boolean;
    /** Max number of items to render. Items past the limit are not shown. */
    limit?: number;
    emptyTitle?: string;
    emptyMessage?: string;
    /** Localized label for the pinned (공지) row badge. */
    fixedLabel?: string;
    /** Row link base path. Defaults to `/shop/notice`; rows link to `{base}/{id}`. */
    detailBasePath?: string;
    /** Localized aria label for a row link (`:t` is replaced with the post title). */
    rowAriaLabel?: string;
    className?: string;
}

function SkeletonRow(): React.ReactElement {
    return (
        <Div
            aria-hidden
            data-testid="notice-row-skeleton"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--scm-spacing-md, 1rem)',
                padding: 'var(--scm-spacing-md, 1rem) 0',
                borderBottom: '1px solid var(--scm-line, #E4DCCE)',
                minHeight: 'var(--scm-touch-min, 44px)',
            }}
        >
            <Div
                style={{
                    width: '3rem',
                    height: '0.75rem',
                    backgroundColor: 'var(--scm-line, #E4DCCE)',
                    borderRadius: 'var(--scm-radius-sm, 4px)',
                    flexShrink: 0,
                }}
            />
            <Div
                style={{
                    height: '1rem',
                    width: '55%',
                    backgroundColor: 'var(--scm-line, #E4DCCE)',
                    borderRadius: 'var(--scm-radius-sm, 4px)',
                }}
            />
        </Div>
    );
}

export function NoticeList({
    items,
    loading,
    limit,
    emptyTitle = 'No notices yet',
    emptyMessage,
    fixedLabel = '고정',
    detailBasePath = '/shop/notice',
    rowAriaLabel,
    className,
}: NoticeListProps): React.ReactElement {
    const safeItems = Array.isArray(items) ? items.filter((it) => it && it.isFixture !== true) : [];
    const visible = typeof limit === 'number' ? safeItems.slice(0, limit) : safeItems;

    const isPending = items === undefined; // undefined = 데이터 미로딩
    if (!loading && !isPending && visible.length === 0) {
        return (
            <Div className={className} data-testid="notice-list" data-state="empty">
                <EmptyState title={emptyTitle} message={emptyMessage} />
            </Div>
        );
    }

    return (
        <Div
            className={className}
            style={{
                display: 'flex',
                flexDirection: 'column',
                borderTop: '1px solid var(--scm-line, #E4DCCE)',
            }}
            data-testid="notice-list"
            data-loading={loading || isPending ? 'true' : 'false'}
        >
            {loading || isPending
                ? Array.from({ length: 4 }).map((_, idx) => <SkeletonRow key={`skeleton-${idx}`} />)
                : visible.map((item) => (
                      <A
                          key={String(item.id)}
                          href={`${detailBasePath}/${item.id}`}
                          data-testid="notice-row"
                          aria-label={
                              rowAriaLabel && rowAriaLabel.includes(':t')
                                  ? rowAriaLabel.replace(':t', String(item.title ?? ''))
                                  : rowAriaLabel
                          }
                          className="scm-notice-row-link"
                          style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: 'var(--scm-spacing-md, 1rem)',
                              padding: 'var(--scm-spacing-md, 1rem) 0',
                              borderBottom: '1px solid var(--scm-line, #E4DCCE)',
                              minHeight: 'var(--scm-touch-min, 44px)',
                              textDecoration: 'none',
                              color: 'inherit',
                          }}
                      >
                          <Span
                              style={{
                                  fontFamily: 'var(--scm-font-body, system-ui)',
                                  fontSize: '0.8125rem',
                                  color: 'var(--scm-text-muted, #8A837B)',
                                  flexShrink: 0,
                                  minWidth: '3.5rem',
                                  fontVariantNumeric: 'tabular-nums',
                              }}
                          >
                              {item.created_at_formatted ?? (item.created_at ?? '').slice(5, 10)}
                          </Span>
                          <Div
                              style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--scm-spacing-xs, 0.5rem)',
                                  minWidth: 0,
                              }}
                          >
                              {item.is_notice ? (
                                  <Span
                                      data-testid="notice-fixed-badge"
                                      style={{
                                          fontFamily: 'var(--scm-font-body, system-ui)',
                                          fontSize: '0.6875rem',
                                          fontWeight: 600,
                                          letterSpacing: '0.04em',
                                          color: 'var(--scm-text-inverse, #FAF8F3)',
                                          backgroundColor: 'var(--scm-charcoal, #26221E)',
                                          borderRadius: 'var(--scm-radius-sm, 4px)',
                                          padding: '0.125rem 0.375rem',
                                          lineHeight: 1.4,
                                          flexShrink: 0,
                                      }}
                                  >
                                      {fixedLabel}
                                  </Span>
                              ) : null}
                              <Span
                                  className="scm-notice-row-title"
                                  style={{
                                      fontFamily: 'var(--scm-font-body, system-ui)',
                                      fontSize: '0.9375rem',
                                      fontWeight: item.is_notice ? 600 : 400,
                                      color: 'var(--scm-text-primary, #26221E)',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                  }}
                              >
                                  {item.title}
                              </Span>
                          </Div>
                          <Span
                              aria-hidden
                              className="scm-notice-row-arrow"
                              style={{
                                  marginLeft: 'auto',
                                  flexShrink: 0,
                                  alignSelf: 'center',
                                  fontFamily: 'var(--scm-font-body, system-ui)',
                                  fontSize: '0.875rem',
                                  color: 'var(--scm-text-muted, #8A837B)',
                              }}
                          >
                              →
                          </Span>
                      </A>
                  ))}
        </Div>
    );
}

export default NoticeList;