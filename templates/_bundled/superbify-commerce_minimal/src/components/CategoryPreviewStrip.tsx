import React from 'react';
import { A, Div, Span } from './basic';
import type { CategoryItem } from '../types/template';

export interface CategoryPreviewStripProps {
    items?: CategoryItem[] | null;
    title?: string;
    eyebrow?: string;
    className?: string;
    emptyLabel?: string;
    /** Label for the "all categories" chip (falls back to generic label). */
    allLabel?: string;
}

/**
 * Typographic category rail — no image dependency.
 *
 * Data-driven from the public category API (name/slug/products_count), so any
 * admin-side category change is reflected without template edits. Visual
 * language mirrors the shop page's CategoryNav pills for consistency.
 */
export function CategoryPreviewStrip({
    items,
    title,
    eyebrow,
    className,
    emptyLabel,
    allLabel,
}: CategoryPreviewStripProps): React.ReactElement {
    const list = Array.isArray(items) ? items.filter((it) => it && it.isFixture !== true) : [];
    return (
        <Div
            className={className}
            data-testid="category-preview-strip"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--scm-spacing-md, 1rem)',
            }}
        >
            {(eyebrow || title) ? (
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-2xs, 0.25rem)',
                    }}
                >
                    {eyebrow ? (
                        <Span
                            style={{
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.75rem',
                                color: 'var(--scm-wood-dark, #A8916F)',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                            }}
                        >
                            {eyebrow}
                        </Span>
                    ) : null}
                    {title ? (
                        <Span
                            style={{
                                fontFamily: 'var(--scm-font-display, system-ui)',
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                color: 'var(--scm-text-primary, #26221E)',
                            }}
                        >
                            {title}
                        </Span>
                    ) : null}
                </Div>
            ) : null}
            {list.length === 0 ? (
                <Div
                    style={{
                        fontFamily: 'var(--scm-font-body, system-ui)',
                        fontSize: '0.875rem',
                        color: 'var(--scm-text-muted, #8A837B)',
                        padding: 'var(--scm-spacing-md, 1rem) 0',
                    }}
                >
                    {emptyLabel ?? ''}
                </Div>
            ) : (
                <Div
                    className="scm-category-strip-list"
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                        paddingBlock: '0.25rem',
                    }}
                    data-testid="category-preview-strip-list"
                >
                    {allLabel ? (
                        <A
                            href="/shop"
                            data-testid="category-preview-tile"
                            data-slug="all"
                            className="scm-category-strip-tile"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'baseline',
                                gap: '0.4rem',
                                padding: '0.625rem 1.25rem',
                                borderRadius: 'var(--scm-radius-pill, 9999px)',
                                border: '1px solid var(--scm-charcoal, #26221E)',
                                backgroundColor: 'var(--scm-charcoal, #26221E)',
                                color: 'var(--scm-text-inverse, #FAF8F3)',
                                textDecoration: 'none',
                                minHeight: 'var(--scm-touch-min, 44px)',
                                transition:
                                    'transform var(--scm-duration-fast, 180ms) var(--scm-ease-out, ease)',
                            }}
                        >
                            <Span
                                style={{
                                    fontFamily: 'var(--scm-font-display, system-ui)',
                                    fontSize: '0.9375rem',
                                    fontWeight: 600,
                                    lineHeight: 1.2,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {allLabel}
                            </Span>
                        </A>
                    ) : null}
                    {list.slice(0, 12).map((cat) => {
                        const nameText = cat.name_localized ?? cat.name;
                        return (
                            <A
                                key={String(cat.id)}
                                href={`/shop/category/${cat.slug}`}
                                aria-label={nameText}
                                data-testid="category-preview-tile"
                                data-slug={cat.slug}
                                className="scm-category-strip-tile"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'baseline',
                                    gap: '0.4rem',
                                    padding: '0.625rem 1.25rem',
                                    borderRadius: 'var(--scm-radius-pill, 9999px)',
                                    border: '1px solid var(--scm-line, #E4DCCE)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--scm-text-primary, #26221E)',
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    minHeight: 'var(--scm-touch-min, 44px)',
                                    transition:
                                        'border-color var(--scm-duration-fast, 180ms) var(--scm-ease-out, ease), background-color var(--scm-duration-fast, 180ms) var(--scm-ease-out, ease), transform var(--scm-duration-fast, 180ms) var(--scm-ease-out, ease)',
                                }}
                            >
                                <Span
                                    style={{
                                        fontFamily: 'var(--scm-font-display, system-ui)',
                                        fontSize: '0.9375rem',
                                        fontWeight: 500,
                                        lineHeight: 1.2,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {nameText}
                                </Span>
                                {typeof cat.products_count === 'number' ? (
                                    <Span
                                        style={{
                                            fontFamily: 'var(--scm-font-body, system-ui)',
                                            fontSize: '0.6875rem',
                                            color: 'var(--scm-text-muted, #8A837B)',
                                            letterSpacing: '0.04em',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {cat.products_count}
                                    </Span>
                                ) : null}
                            </A>
                        );
                    })}
                </Div>
            )}
        </Div>
    );
}

export default CategoryPreviewStrip;