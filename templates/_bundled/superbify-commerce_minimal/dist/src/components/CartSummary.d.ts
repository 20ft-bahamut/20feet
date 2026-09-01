import { default as React } from 'react';
export interface CartSummaryCalc {
    subtotal?: number | string | null;
    subtotal_formatted?: string | null;
    /** total_shipping alias — server field */
    total_shipping?: number | string | null;
    /** payment_amount / final_amount */
    payment_amount?: number | string | null;
    final_amount?: number | string | null;
    payment_amount_formatted?: string | null;
    final_amount_formatted?: string | null;
    /** legacy/optional overrides */
    shipping_fee?: number | string | null;
    total?: number | string | null;
    shipping_fee_formatted?: string | null;
    total_formatted?: string | null;
}
export interface CartSummaryProps {
    itemCount?: number;
    calculation?: CartSummaryCalc | null;
    items?: unknown[];
    summaryTitle?: string;
    itemsLabel?: string;
    subtotalLabel?: string;
    shippingLabel?: string;
    totalLabel?: string;
    checkoutLabel?: string;
    continueShoppingLabel?: string;
    isOrdering?: boolean;
    onCheckout?: () => void;
    onContinueShopping?: () => void;
    /** Override the shop base URL. Defaults to getShopBase(). */
    shopBase?: string;
    className?: string;
}
export declare function CartSummary({ itemCount, calculation, items, summaryTitle, itemsLabel, subtotalLabel, shippingLabel, totalLabel, checkoutLabel, continueShoppingLabel, isOrdering, onCheckout, onContinueShopping, shopBase, className, }: CartSummaryProps): React.ReactElement;
export default CartSummary;
