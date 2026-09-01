import { default as React } from 'react';
import { ProductItem } from '../types/template';
export interface ProductGridProps {
    items?: ProductItem[] | null;
    loading?: boolean;
    /** Max number of items to render. Items past the limit are not shown. */
    limit?: number;
    emptyTitle?: string;
    emptyMessage?: string;
    className?: string;
    /** Optional base href override; defaults to `/shop/products/{product_code|id}`. */
    itemHrefBuilder?: (item: ProductItem) => string;
    /** Layout variant: 'standard' (uniform grid) or 'featured' (first item spans 2 cols). */
    variant?: 'standard' | 'featured';
    /** Forwarded to ProductCard for hover-revealed quick-add action. */
    onQuickAdd?: (item: ProductItem, event: React.MouseEvent | React.KeyboardEvent) => void;
    /** Localized label for the quick-add button. */
    quickAddLabel?: string;
    /** Featured-only: CTA label (e.g. "자세히 보기"). */
    featuredCtaLabel?: string;
    /** Featured-only: eyebrow above category (e.g. "대표 상품"). */
    featuredEyebrow?: string;
}
export declare function ProductGrid({ items, loading, limit, emptyTitle, emptyMessage, className, itemHrefBuilder, variant, onQuickAdd, quickAddLabel, featuredCtaLabel, featuredEyebrow, }: ProductGridProps): React.ReactElement;
export default ProductGrid;
