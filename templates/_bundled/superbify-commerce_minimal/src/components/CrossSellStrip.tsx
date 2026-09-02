import React from 'react';
import { A, Div, Span } from './basic';
import { ProductCard } from './ProductCard';
import { Price } from './Price';
import { resolveSlotImage } from './imageSlots';
import type { ProductItem } from '../types/template';

export interface CrossSellStripProps {
    items?: ProductItem[] | null;
    title?: string;
    eyebrow?: string;
    className?: string;
    /** Optional handler invoked when the user clicks "담기" on a card. */
    onQuickAdd?: (item: ProductItem, event: React.MouseEvent | React.KeyboardEvent) => void;
    quickAddLabel?: string;
    loading?: boolean;
    /** Maximum items to show. */
    limit?: number;
}

export function CrossSellStrip({
    items,
    title = '함께 보면 좋은 상품',
    eyebrow = 'RELATED',
    className,
    onQuickAdd,
    quickAddLabel,
    loading,
    limit = 4,
}: CrossSellStripProps): React.ReactElement | null {
    const safe = Array.isArray(items) ? items.filter((it) => it && it.isFixture !== true) : [];
    const visible = safe.slice(0, limit);
    if (safe.length === 0 && !loading) return null;

    return (
        <Div
            className={className}
            data-testid="cross-sell-strip"
            style={{
                marginTop: 'var(--scm-spacing-lg, 1.5rem)',
                paddingTop: 'var(--scm-spacing-lg, 1.5rem)',
                borderTop: '1px solid var(--scm-line, #E4DCCE)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--scm-spacing-md, 1rem)',
            }}
        >
            <Div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-2xs, 0.25rem)',
                }}
            >
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
                <Span
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: 'var(--scm-text-primary, #26221E)',
                    }}
                >
                    {title}
                </Span>
            </Div>
            <Div
                data-testid="cross-sell-grid"
                style={{
                    display: 'grid',
                    gap: 'var(--scm-spacing-md, 1rem)',
                }}
            >
                {visible.map((item) => (
                    <ProductCard
                        key={String(item.id)}
                        item={item}
                        onQuickAdd={onQuickAdd}
                        quickAddLabel={quickAddLabel}
                    />
                ))}
            </Div>
        </Div>
    );
}

// Keep named import paths alive for tooling even when unused.
export { resolveSlotImage, Price, A, Div, Span };

export default CrossSellStrip;
