import React from 'react';
import { A, Div, Img, Span } from './basic';
import { resolveSlotImage } from './imageSlots';
import { resolveDemoCategoryAsset } from './demoAssets';
import type { CategoryItem } from '../types/template';

export interface CategoryPreviewStripProps {
    items?: CategoryItem[] | null;
    title?: string;
    eyebrow?: string;
    className?: string;
    emptyLabel?: string;
    /** Slot id used when a category lacks a usable image. */
    fallbackSlot?: string;
}

function resolveImageSrc(item: CategoryItem, fallbackSlot: string): { src: string; isFallback: boolean } {
    const imageUrl = (item as { image_url?: string | null }).image_url;
    if (imageUrl && imageUrl.startsWith('/') && /^https?:\/\//.test(imageUrl) === false) {
        return { src: imageUrl, isFallback: false };
    }
    // Prefer bundled demo photo for the 8 demo categories.
    const demo = resolveDemoCategoryAsset(item.slug, item.name_localized ?? item.name);
    if (demo) return { src: demo, isFallback: false };
    return { src: resolveSlotImage(fallbackSlot), isFallback: true };
}

export function CategoryPreviewStrip({
    items,
    title,
    eyebrow,
    className,
    emptyLabel,
    fallbackSlot,
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
                        gap: 'var(--scm-spacing-sm, 0.75rem) var(--scm-spacing-md, 1rem)',
                        overflowX: 'visible',
                        paddingBottom: 'var(--scm-spacing-xs, 0.5rem)',
                    }}
                    data-testid="category-preview-strip-list"
                >
                    {list.slice(0, 12).map((cat) => {
                        const slot = fallbackSlot ?? `category-${cat.slug}`;
                        const nameText = cat.name_localized ?? cat.name;
                        const { src, isFallback } = resolveImageSrc(cat, slot);
                        return (
                            <A
                                key={String(cat.id)}
                                href={`/shop/category/${cat.slug}`}
                                aria-label={nameText}
                                data-testid="category-preview-tile"
                                data-slug={cat.slug}
                                className="scm-category-strip-tile"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--scm-spacing-sm, 0.75rem)',
                                    padding: '0.45rem 0.65rem',
                                    borderRadius: 'var(--scm-radius, 8px)',
                                    backgroundColor: 'transparent',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    transition: 'border-color var(--scm-duration-fast, 180ms) var(--scm-ease-out, ease)',
                                }}
                            >
                                <Div
                                    aria-hidden
                                    style={{
                                        width: '52px',
                                        height: '52px',
                                        flex: '0 0 52px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                                        border: '1px solid var(--scm-line, #E4DCCE)',
                                    }}
                                >
                                    <Img
                                        src={src}
                                        alt=""
                                        loading="lazy"
                                        data-fallback={isFallback ? 'true' : 'false'}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                </Div>
                                <Div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px',
                                        minWidth: 0,
                                    }}
                                >
                                    <Span
                                        style={{
                                            fontFamily: 'var(--scm-font-display, system-ui)',
                                            fontSize: '0.8125rem',
                                            fontWeight: 600,
                                            color: 'var(--scm-text-primary, #26221E)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            lineHeight: 1.2,
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
                                            }}
                                        >
                                            {cat.products_count}
                                        </Span>
                                    ) : null}
                                </Div>
                            </A>
                        );
                    })}
                </Div>
            )}
        </Div>
    );
}

export default CategoryPreviewStrip;
