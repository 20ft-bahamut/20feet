import { default as React } from 'react';
export interface CartItemRowItem {
    id: number | string;
    quantity: number;
    unit_price?: number | string;
    line_total?: number | string;
    product?: {
        id?: number | string;
        code?: string;
        name?: string;
        name_localized?: string;
        thumbnail_url?: string | null;
        thumbnail_slot?: string | null;
        selling_price?: number | string;
        selling_price_formatted?: string;
    } | null;
    option?: {
        id?: number | string;
        name?: string;
    } | null;
}
export interface CartItemRowProps {
    item: CartItemRowItem;
    /** event detail payload shape consumed by the page-level cart handler. */
    quantityLabel?: string;
    deleteLabel?: string;
    decreaseLabel?: string;
    increaseLabel?: string;
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
export declare function CartItemRow({ item, quantityLabel, deleteLabel, decreaseLabel, increaseLabel, minQuantity, maxQuantity, className, }: CartItemRowProps): React.ReactElement;
export default CartItemRow;
