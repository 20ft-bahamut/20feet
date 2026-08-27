import React from 'react';
import { A, Div, Img, Span } from './basic';
import type { CategoryItem } from '../types/template';

export interface CategoryCardProps {
    item: CategoryItem;
    className?: string;
    fallbackSlot?: string;
}

// Local category-card assets live under /assets/images/. The component
// resolves to `category-{slug}.svg` and falls back to the caller-provided
// `fallbackSlot` when no slug-specific asset exists.

const CATEGORY_FALLBACK = 'category-fallback.svg';

function resolveImageSrc(item: CategoryItem, fallbackSlot: string): { src: string; isFallback: boolean } {
    const localSlot = fallbackSlot ?? `category-${item.slug}`;
    const imageUrl = (item as { image_url?: string | null }).image_url;
    if (imageUrl && /^https?:\/\//.test(imageUrl) === false && imageUrl.startsWith('/')) {
        return { src: imageUrl, isFallback: false };
    }
    if (imageUrl && /^https?:\/\//.test(imageUrl)) {
        // External URL detected — prefer local fallback per NoExternalUrls rule.
        return { src: `/assets/images/${localSlot}.svg`, isFallback: true };
    }
    return { src: `/assets/images/${localSlot}.svg`, isFallback: true };
}

export function CategoryCard({ item, className, fallbackSlot }: CategoryCardProps): React.ReactElement | null {
    if (item.isFixture === true) return null;
    const slot = fallbackSlot ?? `category-${item.slug}`;
    const nameText = item.name_localized ?? item.name;
    const initial = resolveImageSrc(item, slot);
    const [src, setSrc] = React.useState(initial.src);

    // If the local asset is missing/broken, fall back to category-fallback.svg
    // (the same external-URL/local-slot fallback pattern ProductCard uses).
    const onError = React.useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            const fallback = `/assets/images/${CATEGORY_FALLBACK}`;
            if (e.currentTarget.src !== fallback) {
                setSrc(fallback);
            }
        },
        []
    );

    return (
        <A
            href={`/shop/category/${item.slug}`}
            className={className}
            aria-label={nameText}
            style={{
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                color: 'inherit',
                backgroundColor: 'var(--scm-paper, #FAF8F3)',
                border: '1px solid var(--scm-line, #E4DCCE)',
                borderRadius: 'var(--scm-radius, 8px)',
                overflow: 'hidden',
            }}
            data-testid="category-card"
            data-slug={item.slug}
        >
            <Div
                style={{
                    aspectRatio: '4 / 3',
                    backgroundColor: 'var(--scm-ivory, #F4F0E6)',
                }}
            >
                <Img
                    src={src}
                    alt={nameText}
                    loading="lazy"
                    onError={onError}
                    data-fallback={initial.isFallback ? 'true' : 'false'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            </Div>
            <Div
                style={{
                    padding: 'var(--scm-spacing-sm, 0.75rem) var(--scm-spacing-md, 1rem)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--scm-spacing-xs, 0.5rem)',
                }}
            >
                <Span
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: 'var(--scm-text-primary, #26221E)',
                    }}
                >
                    {nameText}
                </Span>
                {typeof item.products_count === 'number' ? (
                    <Span
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.75rem',
                            color: 'var(--scm-text-muted, #8A837B)',
                        }}
                    >
                        {item.products_count}
                    </Span>
                ) : null}
            </Div>
        </A>
    );
}

export default CategoryCard;
