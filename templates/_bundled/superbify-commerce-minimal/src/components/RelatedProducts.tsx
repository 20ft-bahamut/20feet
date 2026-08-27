import React from 'react';
import { Div, H2, Span } from './basic';
import { ProductGrid } from './ProductGrid';
import type { ProductItem } from '../types/template';

export interface RelatedProductsProps {
    items?: ProductItem[] | null;
    title?: string;
    eyebrow?: string;
    limit?: number;
    className?: string;
}

export function RelatedProducts({
    items,
    title = 'Related items',
    eyebrow,
    limit = 4,
    className,
}: RelatedProductsProps): React.ReactElement {
    return (
        <Div
            className={className}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--scm-spacing-md, 1rem)',
                paddingBlock: 'var(--scm-section-py-sm, 2rem)',
            }}
            data-testid="related-products"
        >
            <Div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-2xs, 0.25rem)',
                }}
            >
                {eyebrow ? (
                    <Span
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.75rem',
                            color: 'var(--scm-text-muted, #8A837B)',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                        }}
                    >
                        {eyebrow}
                    </Span>
                ) : null}
                <H2
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '1.375rem',
                        fontWeight: 600,
                        color: 'var(--scm-text-primary, #26221E)',
                        margin: 0,
                    }}
                >
                    {title}
                </H2>
            </Div>
            <ProductGrid items={items} limit={limit} emptyTitle="" emptyMessage="" />
        </Div>
    );
}

export default RelatedProducts;
