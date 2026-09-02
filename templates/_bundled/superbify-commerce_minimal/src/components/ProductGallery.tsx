import React from 'react';
import { Button, Div, Img, Ul, Li } from './basic';
import { resolveSlotImage } from './imageSlots';
import { pickStillLifeSlot } from './stillLifeSlot';
import type { ProductItem } from '../types/template';

export interface ProductGalleryImage {
    id?: number | string;
    url?: string;
    /** Public product-image API field (`/product-image/{hash}` relative URL). */
    download_url?: string;
    alt_text?: string | { ko?: string; en?: string } | null;
    /** Pre-localized alt text (PublicProductResource.alt_text_current). */
    alt_text_current?: string | null;
    /** Local asset slot id used as fallback when the URL is missing. */
    slot?: string;
}

export interface ProductGalleryProps {
    images?: ProductGalleryImage[] | null;
    productName?: string;
    className?: string;
    /** True while the product data source is still loading — renders a skeleton tile. */
    loading?: boolean;
    /** Slot id of the primary image (used when no images are present). */
    fallbackSlot?: string;
    /** Optional product data; used to derive a category-aware still-life slot
     *  when `images` is empty and `fallbackSlot` is omitted. */
    product?: ProductItem | null;
}

// deriveCategorySlot is centralised in ./stillLifeSlot.ts so the same product
// resolves to the same still-life on every page.

// Image source resolution strategy:
//  - Server-provided relative URL (`download_url` or `url`): keep it.
//  - External http(s) URL: ignored (NoExternalUrls rule).
//  - No URL at all: resolve to the bundled slot data-URI — never 404.
// Bundled demo JPGs are never used as product data; the DB is the only
// product image source.

function galleryUrl(img: ProductGalleryImage): string {
    return img.download_url ?? img.url ?? '';
}

function isSameOriginRelativeUrl(value: string): boolean {
    return value.startsWith('/') && !value.startsWith('//') && !/^https?:\/\//i.test(value);
}

function galleryAlt(img: ProductGalleryImage, productName: string | undefined): string {
    if (img.alt_text_current) return img.alt_text_current;
    const alt = img.alt_text;
    if (typeof alt === 'string' && alt) return alt;
    if (alt && typeof alt === 'object') {
        const localized = alt.ko ?? alt.en;
        if (localized) return localized;
    }
    return productName ?? 'product';
}

function pickSrc(
    img: ProductGalleryImage,
    idx: number,
    fallbackSlot?: string,
    derivedSlot?: string | null
): { src: string; isFallback: boolean } {
    const url = galleryUrl(img);
    if (isSameOriginRelativeUrl(url)) {
        return { src: url, isFallback: false };
    }
    const slot = img.slot ?? fallbackSlot ?? derivedSlot ?? (idx === 0 ? 'product-1' : `detail-${idx + 1}`);
    return { src: resolveSlotImage(slot), isFallback: true };
}

export function ProductGallery({ images, productName, className, fallbackSlot, product, loading }: ProductGalleryProps): React.ReactElement {
    if (loading) {
        return (
            <Div
                className={className}
                data-testid="product-gallery-skeleton"
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 'var(--scm-spacing-sm, 0.75rem)',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                }}
            >
                <Div
                    aria-hidden
                    style={{
                        aspectRatio: '1 / 1',
                        width: '100%',
                        backgroundColor: 'var(--scm-ivory, #F4F0E6)',
                        borderRadius: 'var(--scm-radius, 4px)',
                    }}
                />
            </Div>
        );
    }
    const derived = fallbackSlot ? null : pickStillLifeSlot(product ?? null);
    const dbImages: ProductGalleryImage[] =
        Array.isArray(images)
            ? images.filter((img) => img && isSameOriginRelativeUrl(galleryUrl(img as ProductGalleryImage)))
            : [];
    // DB images only — show what exists, up to 3. When the product has zero
    // DB images we render exactly one neutral still-life tile (honest empty
    // state for template buyers), never synthesized lifestyle views.
    const list: ProductGalleryImage[] = dbImages.length > 0
        ? dbImages
        : [{ slot: fallbackSlot ?? derived ?? 'product-1' }];
    // Cap thumbs at 3 to match approved preview rhythm; extra images stay reachable via main only.
    const thumbCount = Math.min(list.length, 3);
    const [activeIdx, setActiveIdx] = React.useState(0);
    const active = list[Math.min(activeIdx, list.length - 1)];
    const { src } = pickSrc(active ?? list[0], activeIdx, fallbackSlot, derived);

    return (
        <Div
            className={className}
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 'var(--scm-spacing-sm, 0.75rem)',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
            }}
            data-testid="product-gallery"
        >
            <Div
                style={{
                    aspectRatio: '1 / 1',
                    width: '100%',
                    maxWidth: '100%',
                    backgroundColor: 'var(--scm-ivory, #F4F0E6)',
                    borderRadius: 'var(--scm-radius, 4px)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Img
                    src={src}
                    alt={galleryAlt(active ?? list[0], productName)}
                    data-fallback={pickSrc(active ?? list[0], activeIdx, fallbackSlot, derived).isFallback ? 'true' : 'false'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                />
            </Div>
            {list.length > 1 ? (
                <Ul
                    style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${thumbCount}, 1fr)`,
                        gap: 'var(--scm-spacing-xs, 0.5rem)',
                    }}
                >
                    {list.slice(0, thumbCount).map((img, idx) => {
                        const { src: thumbSrc } = pickSrc(img, idx, fallbackSlot, derived);
                        const isActive = idx === activeIdx;
                        return (
                            <Li key={String(img.id ?? idx)}>
                                <Button
                                    type="button"
                                    aria-label={`Image ${idx + 1}`}
                                    aria-pressed={isActive}
                                    onClick={() => setActiveIdx(idx)}
                                    style={{
                                        width: '100%',
                                        aspectRatio: '1 / 1',
                                        padding: 0,
                                        border: `1px solid ${isActive ? 'var(--scm-charcoal, #26221E)' : 'var(--scm-line, #E4DCCE)'}`,
                                        borderRadius: 'var(--scm-radius-sm, 4px)',
                                        backgroundColor: 'var(--scm-ivory, #F4F0E6)',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Img
                                        src={thumbSrc}
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                                    />
                                </Button>
                            </Li>
                        );
                    })}
                </Ul>
            ) : null}
        </Div>
    );
}

export default ProductGallery;
