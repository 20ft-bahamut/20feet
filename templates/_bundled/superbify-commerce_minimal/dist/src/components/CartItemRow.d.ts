import { default as React } from 'react';
export interface CartItemRowItem {
    id: number | string;
    quantity: number;
    unit_price?: number | string;
    unit_price_formatted?: string;
    line_total?: number | string;
    line_total_formatted?: string;
    /** CartItemResource exposes subtotal/subtotal_formatted directly on the item. */
    subtotal?: number | string;
    subtotal_formatted?: string;
    product?: {
        id?: number | string;
        code?: string;
        name?: string;
        name_localized?: string;
        thumbnail_url?: string | null;
        thumbnail_slot?: string | null;
        selling_price?: number | string;
        selling_price_formatted?: string;
        product_code?: string;
    } | null;
    option?: {
        id?: number | string;
        name?: string;
    } | null;
    product_option?: {
        id?: number | string;
        option_name?: string;
        option_name_localized?: string;
        selling_price?: number | string;
        selling_price_formatted?: string;
    } | null;
}
export interface CartItemRowProps {
    item: CartItemRowItem;
    /** event detail payload shape consumed by the page-level cart handler. */
    quantityLabel?: string;
    deleteLabel?: string;
    decreaseLabel?: string;
    increaseLabel?: string;
    applyLabel?: string;
    minQuantity?: number;
    maxQuantity?: number;
    className?: string;
}
/**
 * Composites row used in /cart list. Emits CustomEvents on the window:
 *   scm:cart-qty-change  -> { id, quantity }
 *   scm:cart-delete       -> { ids: [id] }
 *
 * Page-level handler dispatches the actual apiCall / refetch. This keeps the
 * component event-only, mirroring the AddToCartPanel pattern.
 */
export declare function CartItemRow({ item, quantityLabel, deleteLabel, decreaseLabel, increaseLabel, applyLabel, minQuantity, maxQuantity, className, }: CartItemRowProps): React.ReactElement;
export default CartItemRow;
