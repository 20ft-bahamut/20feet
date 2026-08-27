import { default as React } from 'react';
import { ProductItem } from '../types/template';
export interface ProductCardProps {
    item: ProductItem;
    /** Override the link target, e.g. for fixture demos pointing at a static route. */
    href?: string;
    className?: string;
}
export declare function ProductCard({ item, href, className }: ProductCardProps): React.ReactElement | null;
export default ProductCard;
