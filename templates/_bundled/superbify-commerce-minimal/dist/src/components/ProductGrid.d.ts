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
    /** Optional base href override; defaults to `/shop/product/{product_code|id}`. */
    itemHrefBuilder?: (item: ProductItem) => string;
}
export declare function ProductGrid({ items, loading, limit, emptyTitle, emptyMessage, className, itemHrefBuilder, }: ProductGridProps): React.ReactElement;
export default ProductGrid;
