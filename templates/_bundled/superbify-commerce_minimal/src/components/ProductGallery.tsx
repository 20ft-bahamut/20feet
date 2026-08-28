import React from 'react';
import { Button, Div, Img, Ul, Li } from './basic';
import { resolveSlotImage } from './imageSlots';

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
}

// Image source resolution strategy:
//  - Server-provided relative URL: keep it (real uploaded asset).
//  - External http(s) URL: ignored (NoExternalUrls rule).
//  - No URL at all: resolve to the bundled slot data-URI — never 404.

function pickSrc(img: ProductGalleryImage, idx: number, fallbackSlot?: string): { src: string; isFallback: boolean } {
    if (img.url && img.url.startsWith('/') && /^https?:\/\//.test(img.url) === false) {
        return { src: img.url, isFallback: false };
    }
    const slot = img.slot ?? fallbackSlot ?? (idx === 0 ? 'product-1' : `detail-${idx + 1}`);
    return { src: resolveSlotImage(slot), isFallback: true };
}

export function ProductGallery({ images, productName, className, fallbackSlot }: ProductGalleryProps): React.ReactElement {
    const list: ProductGalleryImage[] = Array.isArray(images) && images.length > 0
        ? images
        : [{ slot: fallbackSlot ?? 'product-1' }];
    const [activeIdx, setActiveIdx] = React.useState(0);
    const active = list[Math.min(activeIdx, list.length - 1)];
    const { src } = pickSrc(active ?? list[0], activeIdx, fallbackSlot);

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
                    maxHeight: 'min(560px, 70vh)',
                    maxWidth: '100%',
                    backgroundColor: 'var(--scm-ivory, #F4F0E6)',
                    borderRadius: 'var(--scm-radius, 8px)',
                    overflow: 'hidden',
                }}
            >
                <Img
                    src={src}
                    alt={active?.alt_text ?? productName ?? 'product'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            </Div>
            {list.length > 1 ? (
                <Ul
                    style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.min(list.length, 5)}, 1fr)`,
                        gap: 'var(--scm-spacing-2xs, 0.25rem)',
                    }}
                >
                    {list.map((img, idx) => {
                        const { src: thumbSrc } = pickSrc(img, idx, fallbackSlot);
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
                                    }}
                                >
                                    <Img
                                        src={thumbSrc}
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
