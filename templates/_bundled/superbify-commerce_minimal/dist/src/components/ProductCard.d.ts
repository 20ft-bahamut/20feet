import { default as React } from 'react';
import { ProductItem } from '../types/template';
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
export declare function ProductCard({ item, href, className, quickAddLabel, onQuickAdd, featured, style, }: ProductCardProps): React.ReactElement | null;
export default ProductCard;
