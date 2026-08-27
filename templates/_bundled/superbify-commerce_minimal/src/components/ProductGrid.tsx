import React from 'react';
import { Div } from './basic';
import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';
import type { ProductItem } from '../types/template';

export interface ProductGridProps {
    items?: ProductItem[] | null;
    loading?: boolean;
    /** Max number of items to render. Items past the limit are not shown. */
    limit?: number;
    emptyTitle?: string;
    emptyMessage?: string;
    className?: string;
    /** Optional base href override; defaults to `/shop/product/{product_code|id}`. */
    itemHrefBuilder?: (item: ProductItem) => string;
}

function SkeletonCard(): React.ReactElement {
    return (
        <Div
            aria-hidden
            data-testid="product-card-skeleton"
            style={{
                border: '1px solid var(--scm-line, #E4DCCE)',
                borderRadius: 'var(--scm-radius, 8px)',
                overflow: 'hidden',
                backgroundColor: 'var(--scm-paper, #FAF8F3)',
            }}
        >
            <Div
                style={{
                    aspectRatio: '1 / 1',
                    backgroundColor: 'var(--scm-ivory, #F4F0E6)',
                }}
            />
            <Div
                style={{
                    padding: 'var(--scm-spacing-md, 1rem)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-xs, 0.5rem)',
                }}
            >
                <Div
                    style={{
                        height: '0.75rem',
                        width: '40%',
                        backgroundColor: 'var(--scm-line, #E4DCCE)',
                        borderRadius: 'var(--scm-radius-sm, 4px)',
                    }}
                />
                <Div
                    style={{
                        height: '1rem',
                        width: '80%',
                        backgroundColor: 'var(--scm-line, #E4DCCE)',
                        borderRadius: 'var(--scm-radius-sm, 4px)',
                    }}
                />
                <Div
                    style={{
                        height: '1rem',
                        width: '50%',
                        backgroundColor: 'var(--scm-line, #E4DCCE)',
                        borderRadius: 'var(--scm-radius-sm, 4px)',
                    }}
                />
            </Div>
        </Div>
    );
}

export function ProductGrid({
    items,
    loading,
    limit,
    emptyTitle = 'No products yet',
    emptyMessage,
    className,
    itemHrefBuilder,
}: ProductGridProps): React.ReactElement {
    const safeItems = Array.isArray(items) ? items.filter((it) => it && it.isFixture !== true) : [];
    const visible = typeof limit === 'number' ? safeItems.slice(0, limit) : safeItems;

    if (!loading && visible.length === 0) {
        return (
            <Div className={className} data-testid="product-grid">
                <EmptyState title={emptyTitle} message={emptyMessage} />
            </Div>
        );
    }

    return (
        <Div
            className={className}
            style={{
                display: 'grid',
                gridTemplateColumns: 'var(--scm-grid-columns, 1fr)',
                gap: 'var(--scm-grid-gap, 1rem)',
            }}
            data-testid="product-grid"
            data-loading={loading ? 'true' : 'false'}
        >
            {loading
                ? Array.from({ length: 4 }).map((_, idx) => <SkeletonCard key={`skeleton-${idx}`} />)
                : visible.map((item) => (
                      <ProductCard
                          key={String(item.id)}
                          item={item}
                          href={itemHrefBuilder ? itemHrefBuilder(item) : undefined}
                      />
                  ))}
        </Div>
    );
}

export default ProductGrid;
