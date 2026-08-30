import React from 'react';
import { Div, Span } from './basic';
import { Badge } from './Badge';

export interface PriceProps {
    /** Number or pre-formatted string from API (e.g. "32,000원"). */
    sellingPrice?: number | string | null;
    listPrice?: number | string | null;
    /** Pre-formatted helper if the API already gave us a string. */
    sellingPriceFormatted?: string | null;
    listPriceFormatted?: string | null;
    /** 0–100 percent or already-formatted string. */
    discountRate?: number | string | null;
    className?: string;
    /** When true, suppress the inline discount percent badge (used when
     *  the parent already renders a discount chip on the image). */
    hideDiscountBadge?: boolean;
    /** 'compact' fits product cards (smaller sale price, tighter gaps);
     *  default suits detail/checkout surfaces. */
    size?: 'default' | 'compact';
}

function toFormatted(value: number | string | null | undefined, fallback?: string | null): string {
    if (fallback && typeof fallback === 'string') return fallback;
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') {
        try {
            return new Intl.NumberFormat('ko-KR').format(value) + '원';
        } catch {
            return `${value}`;
        }
    }
    return '';
}

function normalizeDiscount(value: number | string | null | undefined): number | null {
    if (value == null) return null;
    if (typeof value === 'number') return value;
    const parsed = Number(String(value).replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
}

export function Price({
    sellingPrice,
    listPrice,
    sellingPriceFormatted,
    listPriceFormatted,
    discountRate,
    className,
    hideDiscountBadge = false,
    size = 'default',
}: PriceProps): React.ReactElement {
    const selling = toFormatted(sellingPrice, sellingPriceFormatted);
    const list = toFormatted(listPrice, listPriceFormatted);
    const discount = normalizeDiscount(discountRate);
    const showList = list && list !== selling;
    const compact = size === 'compact';
    return (
        <Div
            className={className}
            style={{
                display: 'flex',
                alignItems: 'baseline',
                flexWrap: 'wrap',
                gap: compact ? 'var(--scm-spacing-2xs, 0.25rem)' : 'var(--scm-spacing-xs, 0.5rem)',
            }}
            data-testid="price"
        >
            <Span
                style={{
                    fontFamily: 'var(--scm-font-body, system-ui)',
                    fontSize: compact ? 'var(--scm-price-md, 1.1875rem)' : 'var(--scm-price-lg, 1.5rem)',
                    fontWeight: 700,
                    color: 'var(--scm-text-primary, #26221E)',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: compact ? '-0.005em' : '-0.01em',
                }}
            >
                {selling || '—'}
            </Span>
            {showList ? (
                <Span
                    style={{
                        fontFamily: 'var(--scm-font-body, system-ui)',
                        fontSize: compact ? '0.75rem' : '0.8125rem',
                        color: 'var(--scm-text-muted, #8A837B)',
                        textDecoration: 'line-through',
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '0',
                    }}
                    data-testid="price-list"
                >
                    {list}
                </Span>
            ) : null}
            {discount && discount > 0 && !hideDiscountBadge ? (
                <Badge tone="discount-soft" label={`-${Math.round(discount)}%`} />
            ) : null}
        </Div>
    );
}

export default Price;
