import React from 'react';
import { A, Div, Span, Img } from './basic';
import { Price } from './Price';
import { Badge } from './Badge';
import { resolveStillLifeThumb } from './stillLifeSlot';
import type { ProductItem } from '../types/template';

export interface ProductCardProps {
    item: ProductItem;
    /** Override the link target, e.g. for fixture demos pointing at a static route. */
    href?: string;
    className?: string;
    /** Optional quick-add label shown on hover/focus. Falls back to $t:superbify.product.quick_add. */
    quickAddLabel?: string;
    /** Optional override handler. If absent the card only navigates. */
    onQuickAdd?: (item: ProductItem, event: React.MouseEvent | React.KeyboardEvent) => void;
    /** When true, render the card as a large featured tile (col-span 2, larger image, bigger name). */
    featured?: boolean;
    /** Inline style override forwarded to the outer anchor. */
    style?: React.CSSProperties;
}

function isStopStatus(sales_status?: string | null): boolean {
    if (!sales_status) return false;
    const s = String(sales_status).toUpperCase();
    return s === 'SOLD_OUT' || s === 'STOPPED' || s === 'HIDDEN';
}

function isOnSale(sales_status?: string | null): boolean {
    if (!sales_status) return true;
    return String(sales_status).toUpperCase() === 'ONSALE';
}

// Slot picking moved to ./stillLifeSlot.ts so ProductCard, ProductGallery and
// CartItemRow resolve the same still-life image for the same product.

function resolveThumbnail(item: ProductItem): { src: string; isFallback: boolean } {
    return resolveStillLifeThumb(item);
}

export function ProductCard({
    item,
    href,
    className,
    quickAddLabel = '담기',
    onQuickAdd,
    featured = false,
    style,
}: ProductCardProps): React.ReactElement | null {
    if (item.isFixture === true) {
        // Fixtures are dev/test only — never render at runtime.
        return null;
    }
    const link = href ?? `/shop/product/${item.product_code ?? item.id}`;
    const { src, isFallback } = resolveThumbnail(item);
    const stopped = isStopStatus(item.sales_status);
    const onSale = isOnSale(item.sales_status);
    const showNew = onSale && item.discount_rate == null;
    const nameText = item.name_localized ?? item.name;
    const eyebrowText = item.primary_category ?? item.category_name ?? '';

    const handleQuickAdd = (event: React.MouseEvent | React.KeyboardEvent) => {
        if (!onQuickAdd) return;
        event.preventDefault();
        event.stopPropagation();
        onQuickAdd(item, event);
    };

    const onQuickKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            handleQuickAdd(event);
        }
    };

    return (
        <A
            href={link}
            className={className}
            aria-label={nameText}
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                color: 'inherit',
                backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                border: '1px solid var(--scm-line, #E4DCCE)',
                borderRadius: 'var(--scm-radius, 8px)',
                overflow: 'hidden',
                height: '100%',
                minWidth: 0,
                ...(style ?? {}),
            }}
            data-testid="product-card"
            data-product-id={String(item.id)}
            data-featured={featured ? 'true' : 'false'}
        >
            <Div
                style={{
                    position: 'relative',
                    aspectRatio: featured ? '16 / 11' : '1 / 1',
                    backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: featured ? 'var(--scm-spacing-lg, 1.5rem)' : 'var(--scm-spacing-md, 1rem)',
                }}
            >
                <Img
                    src={src}
                    alt={nameText}
                    loading="lazy"
                    data-fallback={isFallback ? 'true' : 'false'}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        transition: 'transform var(--scm-duration-base, 220ms) var(--scm-ease-out, ease)',
                    }}
                    className="scm-product-card-image"
                />
                <Div
                    style={{
                        position: 'absolute',
                        top: 'var(--scm-spacing-xs, 0.5rem)',
                        left: 'var(--scm-spacing-xs, 0.5rem)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-2xs, 0.25rem)',
                        zIndex: 2,
                    }}
                >
                    {item.discount_rate != null && Number(item.discount_rate) > 0 ? (
                        <Badge tone="discount-soft" label={`-${Math.round(Number(item.discount_rate))}%`} />
                    ) : null}
                    {showNew ? <Badge tone="new" label="NEW" /> : null}
                    {stopped ? <Badge tone="soldout" label={item.sales_status_label ?? 'STOPPED'} /> : null}
                </Div>
                {onQuickAdd ? (
                    <button
                        type="button"
                        onClick={handleQuickAdd}
                        onKeyDown={onQuickKeyDown}
                        aria-label={`${nameText} ${quickAddLabel}`}
                        data-testid="product-card-quickadd"
                        style={{
                            position: 'absolute',
                            left: 'var(--scm-spacing-xs, 0.5rem)',
                            right: 'var(--scm-spacing-xs, 0.5rem)',
                            bottom: 'var(--scm-spacing-xs, 0.5rem)',
                            minHeight: '36px',
                            padding: '0 var(--scm-spacing-sm, 0.75rem)',
                            border: 'none',
                            borderRadius: 'var(--scm-radius-sm, 4px)',
                            backgroundColor: 'var(--scm-charcoal, #26221E)',
                            color: 'var(--scm-text-inverse, #FAF8F3)',
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            cursor: 'pointer',
                            opacity: 0,
                            transform: 'translateY(8px)',
                            transition:
                                'opacity var(--scm-duration-fast, 180ms) var(--scm-ease-out, ease), transform var(--scm-duration-fast, 180ms) var(--scm-ease-out, ease)',
                            zIndex: 3,
                            boxShadow: '0 6px 16px -8px rgba(38, 34, 30, 0.45)',
                        }}
                        className="scm-product-card-quickadd"
                    >
                        {quickAddLabel}
                    </button>
                ) : null}
            </Div>
            <Div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-2xs, 0.25rem)',
                    padding: featured ? 'var(--scm-spacing-lg, 1.5rem)' : 'var(--scm-spacing-md, 1rem)',
                }}
            >
                {eyebrowText ? (
                    <Span
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.6875rem',
                            color: 'var(--scm-text-muted, #8A837B)',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            fontWeight: 500,
                        }}
                    >
                        {eyebrowText}
                    </Span>
                ) : null}
                <Span
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: featured ? '1.125rem' : '0.9375rem',
                        fontWeight: 500,
                        color: 'var(--scm-text-primary, #26221E)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minHeight: '1.4em',
                    }}
                    title={nameText ?? undefined}
                >
                    {nameText}
                </Span>
                <Price
                    sellingPrice={item.selling_price}
                    listPrice={item.list_price}
                    sellingPriceFormatted={item.selling_price_formatted}
                    listPriceFormatted={item.list_price_formatted}
                    discountRate={item.discount_rate}
                />
            </Div>
        </A>
    );
}

export default ProductCard;
