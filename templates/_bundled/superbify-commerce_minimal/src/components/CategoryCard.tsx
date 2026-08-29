import React from 'react';
import { A, Div, Img, Span } from './basic';
import { resolveSlotImage } from './imageSlots';
import { resolveDemoCategoryAsset } from './demoAssets';
import type { CategoryItem } from '../types/template';

export interface CategoryCardProps {
    item: CategoryItem;
    className?: string;
    fallbackSlot?: string;
}

function resolveImageSrc(item: CategoryItem, fallbackSlot: string): { src: string; isFallback: boolean } {
    const imageUrl = (item as { image_url?: string | null }).image_url;
    // Server-provided relative URL: keep it.
    if (imageUrl && imageUrl.startsWith('/') && /^https?:\/\//.test(imageUrl) === false) {
        return { src: imageUrl, isFallback: false };
    }
    // Real bundled demo photo for the 8 demo categories.
    const demo = resolveDemoCategoryAsset(item.slug, item.name_localized ?? item.name);
    if (demo) return { src: demo, isFallback: false };
    // External http(s) or no URL: use bundled slot data-URI (never 404).
    return { src: resolveSlotImage(fallbackSlot), isFallback: true };
}

export function CategoryCard({ item, className, fallbackSlot }: CategoryCardProps): React.ReactElement | null {
    if (item.isFixture === true) return null;
    const slot = fallbackSlot ?? `category-${item.slug}`;
    const nameText = item.name_localized ?? item.name;
    const initial = resolveImageSrc(item, slot);
    const [src, setSrc] = React.useState(initial.src);

    // If the asset somehow fails, swap to the kind default. resolveSlotImage
    // returns data URIs so this branch is rare — but keep it as a safety net.
    const onError = React.useCallback(() => {
        const fallback = resolveSlotImage('category-fallback');
        setSrc((prev) => (prev === fallback ? prev : fallback));
    }, []);

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
