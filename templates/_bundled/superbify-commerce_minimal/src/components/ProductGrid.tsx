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
    /** Layout variant: 'standard' (uniform grid) or 'featured' (first item spans 2 cols). */
    variant?: 'standard' | 'featured';
    /** Forwarded to ProductCard for hover-revealed quick-add action. */
    onQuickAdd?: (item: ProductItem, event: React.MouseEvent | React.KeyboardEvent) => void;
    /** Localized label for the quick-add button. */
    quickAddLabel?: string;
}

function SkeletonCard({ featured = false }: { featured?: boolean }): React.ReactElement {
    return (
        <Div
            aria-hidden
            data-testid="product-card-skeleton"
            data-featured={featured ? 'true' : 'false'}
            style={{
                border: '1px solid var(--scm-line, #E4DCCE)',
                borderRadius: 'var(--scm-radius, 8px)',
                overflow: 'hidden',
                backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                gridColumn: featured ? 'span 2' : undefined,
            }}
        >
            <Div
                style={{
                    aspectRatio: featured ? '16 / 11' : '1 / 1',
                    backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                }}
            />
            <Div
                style={{
                    padding: featured ? 'var(--scm-spacing-lg, 1.5rem)' : 'var(--scm-spacing-md, 1rem)',
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
    variant = 'standard',
    onQuickAdd,
    quickAddLabel,
}: ProductGridProps): React.ReactElement {
    const safeItems = Array.isArray(items) ? items.filter((it) => it && it.isFixture !== true) : [];
    const visible = typeof limit === 'number' ? safeItems.slice(0, limit) : safeItems;

    if (!loading && visible.length === 0) {
        return (
            <Div className={className} data-testid="product-grid" data-variant={variant}>
                <EmptyState title={emptyTitle} message={emptyMessage} />
            </Div>
        );
    }

    return (
        <Div
            className={className}
            style={{
                display: 'grid',
                gridTemplateColumns: variant === 'featured'
                    ? 'repeat(2, minmax(0, 1fr))'
                    : 'var(--scm-grid-columns, 1fr)',
                gap: 'var(--scm-grid-gap, 1rem)',
            }}
            data-testid="product-grid"
            data-loading={loading ? 'true' : 'false'}
            data-variant={variant}
        >
            {loading
                ? Array.from({ length: 4 }).map((_, idx) => (
                      <SkeletonCard key={`skeleton-${idx}`} featured={variant === 'featured' && idx === 0} />
                  ))
                : visible.map((item, idx) => {
                      const isFeatured = variant === 'featured' && idx === 0;
                      return (
                          <ProductCard
                              key={String(item.id)}
                              item={item}
                              href={itemHrefBuilder ? itemHrefBuilder(item) : undefined}
                              featured={isFeatured}
                              onQuickAdd={onQuickAdd}
                              quickAddLabel={quickAddLabel}
                              style={isFeatured ? { gridColumn: 'span 2' } : undefined}
                          />
                      );
                  })}
        </Div>
    );
}

export default ProductGrid;
