import React from 'react';
import { A, Div, Nav, Span, Ul, Li } from './basic';
import type { CategoryItem } from '../types/template';

export interface CategoryNavProps {
    items?: CategoryItem[] | null;
    /** Slug of the currently active category (for `aria-current`). */
    activeSlug?: string;
    className?: string;
    title?: string;
    /** Label for the "all" link that resolves to /shop. */
    allLabel?: string;
}

export function CategoryNav({ items, activeSlug, className, title, allLabel = 'All' }: CategoryNavProps): React.ReactElement {
    const list = Array.isArray(items) ? items.filter((it) => it && it.isFixture !== true) : [];
    return (
        <Nav
            className={className}
            aria-label={title ?? 'Categories'}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--scm-spacing-sm, 0.75rem)',
            }}
            data-testid="category-nav"
        >
            {title ? (
                <Span
                    style={{
                        fontFamily: 'var(--scm-font-body, system-ui)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--scm-text-muted, #8A837B)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                    }}
                >
                    {title}
                </Span>
            ) : null}
            <Ul
                style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-2xs, 0.25rem)',
                }}
            >
                <Li>
                    <A
                        href="/shop"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            minHeight: 'var(--scm-touch-min, 44px)',
                            padding: '0 var(--scm-spacing-sm, 0.75rem)',
                            borderRadius: 'var(--scm-radius-sm, 4px)',
                            color: activeSlug == null ? 'var(--scm-text-primary, #26221E)' : 'var(--scm-text-body, #4A4643)',
                            backgroundColor: activeSlug == null ? 'var(--scm-bg-secondary, #F4F0E6)' : 'transparent',
                            textDecoration: 'none',
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.9375rem',
                            fontWeight: activeSlug == null ? 600 : 500,
                        }}
                    >
                        {allLabel}
                    </A>
                </Li>
                {list.map((cat) => {
                    const nameText = cat.name_localized ?? cat.name;
                    const isActive = activeSlug === cat.slug;
                    return (
                        <Li key={String(cat.id)}>
                            <A
                                href={`/shop/category/${cat.slug}`}
                                aria-current={isActive ? 'page' : undefined}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    minHeight: 'var(--scm-touch-min, 44px)',
                                    padding: '0 var(--scm-spacing-sm, 0.75rem)',
                                    borderRadius: 'var(--scm-radius-sm, 4px)',
                                    color: isActive ? 'var(--scm-text-primary, #26221E)' : 'var(--scm-text-body, #4A4643)',
                                    backgroundColor: isActive ? 'var(--scm-bg-secondary, #F4F0E6)' : 'transparent',
                                    textDecoration: 'none',
                                    fontFamily: 'var(--scm-font-body, system-ui)',
                                    fontSize: '0.9375rem',
                                    fontWeight: isActive ? 600 : 500,
                                }}
                            >
                                <Span>{nameText}</Span>
                                {typeof cat.products_count === 'number' ? (
                                    <Span
                                        style={{
                                            color: 'var(--scm-text-muted, #8A837B)',
                                            fontSize: '0.8125rem',
                                        }}
                                    >
                                        {cat.products_count}
                                    </Span>
                                ) : null}
                            </A>
                        </Li>
                    );
                })}
            </Ul>
            {list.length === 0 ? (
                <Div
                    style={{
                        fontFamily: 'var(--scm-font-body, system-ui)',
                        fontSize: '0.875rem',
                        color: 'var(--scm-text-muted, #8A837B)',
                        padding: 'var(--scm-spacing-sm, 0.75rem)',
                    }}
                >
                    (no categories)
                </Div>
            ) : null}
        </Nav>
    );
}

export default CategoryNav;
