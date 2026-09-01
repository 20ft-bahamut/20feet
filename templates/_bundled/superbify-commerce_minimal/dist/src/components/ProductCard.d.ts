import { default as React } from 'react';
import { ProductItem } from '../types/template';
export interface ProductCardProps {
    item: ProductItem;
    /** Override the link target, e.g. for fixture demos pointing at a static route. */
    href?: string;
    /**
     * Override the shop base URL. Defaults to `getShopBase()` so the
     * template honors admin basic_info (no_route / route_path) without
     * layouts having to pass the prop explicitly. Layouts may still bind
     * `{{_global.shopBase}}` for static href interpolation.
     */
    shopBase?: string;
    className?: string;
    /** Optional quick-add label shown on hover/focus. Falls back to $t:superbify.product.quick_add. */
    quickAddLabel?: string;
    /** Optional override handler. If absent the card only navigates. */
    onQuickAdd?: (item: ProductItem, event: React.MouseEvent | React.KeyboardEvent) => void;
    /** When true, render the card as a large featured tile (col-span 2, larger image, bigger name). */
    featured?: boolean;
    /** When true, the card is rendered inside the featured grid's secondary area;
     *  uses a slightly taller image aspect to balance the layout. */
    compactFeatured?: boolean;
    /** Inline style override forwarded to the outer anchor. */
    style?: React.CSSProperties;
    /** Featured-only inline CTA label (e.g. "자세히 보기 →"). */
    featuredCtaLabel?: string;
    /** Featured-only eyebrow above the category, e.g. "대표 상품". */
    featuredEyebrow?: string;
}
export declare function ProductCard({ item, href, shopBase, className, quickAddLabel, onQuickAdd, featured, compactFeatured, style, featuredCtaLabel, featuredEyebrow, }: ProductCardProps): React.ReactElement | null;
export default ProductCard;
