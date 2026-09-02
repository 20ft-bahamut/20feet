import React from 'react';
import { A, Div, Nav, Span, Ul, Li } from './basic';
import { getShopBase } from '../config/shopBase';
import type { CategoryItem } from '../types/template';

export interface CategoryNavProps {
    items?: CategoryItem[] | null;
    /** Slug of the currently active category (for `aria-current`). */
    activeSlug?: string;
    className?: string;
    title?: string;
    /** Label for the "all" link that resolves to /shop. */
    allLabel?: string;
    /** Sort select options. If omitted no select is rendered. */
    sortOptions?: { value: string; label: string }[];
    /** Currently selected sort value. */
    sortValue?: string;
    /** Sort change handler. */
    onSortChange?: (value: string) => void;
    sortLabel?: string;
    /** Override the shop base URL. Defaults to getShopBase(). */
    shopBase?: string;
}

export function CategoryNav({
    items,
    activeSlug,
    className,
    title,
    allLabel = 'All',
    sortOptions,
    sortValue,
    onSortChange,
    sortLabel,
    shopBase,
}: CategoryNavProps): React.ReactElement {
    const isPending = items === undefined; // undefined = 데이터 미로딩 — 빈 empty가 아니라 skeleton 표시
    const list = Array.isArray(items) ? items.filter((it) => it && it.isFixture !== true) : [];
    const showSort = Array.isArray(sortOptions) && sortOptions.length > 0;
    const resolvedBase = shopBase ?? getShopBase();
    const baseForLink = resolvedBase === '/' ? '' : resolvedBase;
    const allHref = `${baseForLink}/`;
    return (
        <Nav
            className={className}
            aria-label={title ?? 'Categories'}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--scm-spacing-md, 1rem)',
            }}
            data-testid="category-nav"
        >
            {(title || showSort) ? (
                <Div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    {title ? (
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
                            {title}
                        </Span>
                    ) : null}
                    {showSort ? (
                        <label
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'var(--scm-spacing-xs, 0.5rem)',
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.8125rem',
                                color: 'var(--scm-text-muted, #8A837B)',
                            }}
                        >
                            {sortLabel ? <span>{sortLabel}</span> : null}
                            <select
                                value={sortValue}
                                onChange={(e) => onSortChange?.(e.target.value)}
                                data-testid="category-nav-sort"
                                style={{
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    MozAppearance: 'none',
                                    padding: '0.4rem 1.8rem 0.4rem 0.7rem',
                                    border: '1px solid var(--scm-line, #E4DCCE)',
                                    borderRadius: 'var(--scm-radius-sm, 4px)',
                                    backgroundColor: 'var(--scm-paper, #FAF8F3)',
                                    color: 'var(--scm-text-primary, #26221E)',
                                    fontFamily: 'var(--scm-font-body, system-ui)',
                                    fontSize: '0.8125rem',
                                    cursor: 'pointer',
                                    backgroundImage:
                                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none'><path d='M1 1.5L6 6.5L11 1.5' stroke='%2326221E' stroke-width='1.2'/></svg>\")",
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.55rem center',
                                    backgroundSize: '10px 6px',
                                }}
                            >
                                {sortOptions!.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ) : null}
                </Div>
            ) : null}
            <Ul
                style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--scm-spacing-xs, 0.5rem)',
                }}
                role="list"
            >
                <Li>
                    <A
                        href={allHref}
                        data-testid="category-nav-pill"
                        style={pillStyle(activeSlug == null)}
                    >
                        <span>{allLabel}</span>
                    </A>
                </Li>
                {list.map((cat) => {
                    const nameText = cat.name_localized ?? cat.name;
                    const isActive = activeSlug === cat.slug;
                    return (
                        <Li key={String(cat.id)}>
                            <A
                                href={`${baseForLink}/category/${cat.slug}`}
                                aria-current={isActive ? 'page' : undefined}
                                data-testid="category-nav-pill"
                                style={pillStyle(isActive)}
                            >
                                <span>{nameText}</span>
                                {typeof cat.products_count === 'number' ? (
                                    <span style={{ marginLeft: 6, opacity: 0.7, fontSize: '0.75em' }}>{cat.products_count}</span>
                                ) : null}
                            </A>
                        </Li>
                    );
                })}
            </Ul>
            {isPending ? (
                <Div
                    aria-hidden
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--scm-spacing-2xs, 0.25rem)',
                        padding: 'var(--scm-spacing-sm, 0.75rem) 0',
                    }}
                    data-testid="category-nav-skeleton"
                >
                    {[64, 88, 72, 80].map((w, i) => (
                        <Span
                            key={i}
                            style={{
                                display: 'inline-block',
                                width: w,
                                height: 36,
                                borderRadius: 'var(--scm-radius-pill, 9999px)',
                                backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                            }}
                        />
                    ))}
                </Div>
            ) : list.length === 0 ? (
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

function pillStyle(active: boolean): React.CSSProperties {
    return {
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: '36px',
        padding: '0 var(--scm-spacing-sm, 0.75rem)',
        borderRadius: 'var(--scm-radius-pill, 9999px)',
        border: '1px solid ' + (active ? 'var(--scm-charcoal, #26221E)' : 'var(--scm-line, #E4DCCE)'),
        backgroundColor: active ? 'var(--scm-charcoal, #26221E)' : 'var(--scm-paper, #FAF8F3)',
        color: active ? 'var(--scm-text-inverse, #FAF8F3)' : 'var(--scm-text-body, #4A4643)',
        textDecoration: 'none',
        fontFamily: 'var(--scm-font-body, system-ui)',
        fontSize: '0.875rem',
        fontWeight: active ? 600 : 500,
        lineHeight: 1.2,
    };
}

export default CategoryNav;
