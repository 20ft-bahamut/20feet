import React from 'react';
import { Button, Div, Img, Ul, Li } from './basic';
import { resolveSlotImage } from './imageSlots';
import { pickStillLifeSlot } from './stillLifeSlot';
import type { ProductItem } from '../types/template';

export interface ProductGalleryImage {
    id?: number | string;
    url?: string;
    alt_text?: string;
    /** Local asset slot id used as fallback when the URL is missing. */
    slot?: string;
}

export interface ProductGalleryProps {
    images?: ProductGalleryImage[] | null;
    productName?: string;
    className?: string;
    /** Slot id of the primary image (used when no images are present). */
    fallbackSlot?: string;
    /** Optional product data; used to derive a category-aware still-life slot
     *  when `images` is empty and `fallbackSlot` is omitted. */
    product?: ProductItem | null;
}

// deriveCategorySlot is centralised in ./stillLifeSlot.ts so the same product
// resolves to the same still-life on every page.

// Image source resolution strategy:
//  - Server-provided relative URL: keep it (real uploaded asset).
//  - External http(s) URL: ignored (NoExternalUrls rule).
//  - No URL at all: resolve to the bundled slot data-URI — never 404.

function pickSrc(
    img: ProductGalleryImage,
    idx: number,
    fallbackSlot?: string,
    derivedSlot?: string | null
): { src: string; isFallback: boolean } {
    if (img.url && img.url.startsWith('/') && /^https?:\/\//.test(img.url) === false) {
        return { src: img.url, isFallback: false };
    }
    const slot = img.slot ?? fallbackSlot ?? derivedSlot ?? (idx === 0 ? 'product-1' : `detail-${idx + 1}`);
    return { src: resolveSlotImage(slot), isFallback: true };
}

export function ProductGallery({ images, productName, className, fallbackSlot, product }: ProductGalleryProps): React.ReactElement {
    const derived = fallbackSlot ? null : pickStillLifeSlot(product ?? null);
    const list: ProductGalleryImage[] = Array.isArray(images) && images.length > 0
        ? images
        : [
            { slot: fallbackSlot ?? derived ?? 'product-1' },
            { slot: fallbackSlot ?? derived ?? 'product-1' },
            { slot: fallbackSlot ?? derived ?? 'product-1' },
        ];
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
                    aspectRatio: '4 / 3',
                    width: '100%',
                    maxHeight: '560px',
                    maxWidth: '100%',
                    backgroundColor: 'var(--scm-ivory, #F4F0E6)',
                    borderRadius: 'var(--scm-radius, 8px)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Img
                    src={src}
                    alt={active?.alt_text ?? productName ?? 'product'}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
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
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
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
