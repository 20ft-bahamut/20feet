import React from 'react';
import { A, Div, Span, Img } from './basic';
import { Price } from './Price';
import { Badge } from './Badge';
import type { ProductItem } from '../types/template';

export interface ProductCardProps {
    item: ProductItem;
    /** Override the link target, e.g. for fixture demos pointing at a static route. */
    href?: string;
    className?: string;
}

const PRODUCT_FALLBACK = 'product-fallback.svg';

function isStopStatus(sales_status?: string | null): boolean {
    if (!sales_status) return false;
    const s = String(sales_status).toUpperCase();
    return s === 'SOLD_OUT' || s === 'STOPPED' || s === 'HIDDEN';
}

function isOnSale(sales_status?: string | null): boolean {
    if (!sales_status) return true;
    return String(sales_status).toUpperCase() === 'ONSALE';
}

function resolveThumbnail(item: ProductItem): { src: string; isFallback: boolean } {
    if (item.thumbnail_url && /^https?:\/\//.test(item.thumbnail_url) === false && item.thumbnail_url.startsWith('/')) {
        return { src: item.thumbnail_url, isFallback: false };
    }
    if (item.thumbnail_url && /^https?:\/\//.test(item.thumbnail_url)) {
        // External URL detected — prefer local fallback per NoExternalUrls rule.
        return { src: `/assets/images/${item.thumbnail_slot ? `${item.thumbnail_slot}.svg` : PRODUCT_FALLBACK}`, isFallback: true };
    }
    if (item.thumbnail_slot) {
        return { src: `/assets/images/${item.thumbnail_slot}.svg`, isFallback: true };
    }
    return { src: `/assets/images/${PRODUCT_FALLBACK}`, isFallback: true };
}

export function ProductCard({ item, href, className }: ProductCardProps): React.ReactElement | null {
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
    return (
        <A
            href={link}
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
                transition: 'border-color var(--scm-duration-base, 220ms) var(--scm-ease-out, ease)',
            }}
            data-testid="product-card"
            data-product-id={String(item.id)}
        >
            <Div
                style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    backgroundColor: 'var(--scm-ivory, #F4F0E6)',
                    overflow: 'hidden',
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
                        objectFit: 'cover',
                        display: 'block',
                    }}
                />
                <Div
                    style={{
                        position: 'absolute',
                        top: 'var(--scm-spacing-xs, 0.5rem)',
                        left: 'var(--scm-spacing-xs, 0.5rem)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-2xs, 0.25rem)',
                    }}
                >
                    {item.discount_rate != null && Number(item.discount_rate) > 0 ? (
                        <Badge tone="discount" label={`-${Math.round(Number(item.discount_rate))}%`} />
                    ) : null}
                    {showNew ? <Badge tone="new" label="NEW" /> : null}
                    {stopped ? <Badge tone="soldout" label={item.sales_status_label ?? 'STOPPED'} /> : null}
                </Div>
            </Div>
            <Div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-2xs, 0.25rem)',
                    padding: 'var(--scm-spacing-md, 1rem)',
                }}
            >
                {item.primary_category || item.category_name ? (
                    <Span
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.75rem',
                            color: 'var(--scm-text-muted, #8A837B)',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}
                    >
                        {item.primary_category ?? item.category_name}
                    </Span>
                ) : null}
                <Span
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: 'var(--scm-text-primary, #26221E)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '2.6em',
                    }}
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
