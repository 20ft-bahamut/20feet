import { default as React } from 'react';
export interface CartSummaryCalc {
    subtotal?: number | string | null;
    shipping_fee?: number | string | null;
    total?: number | string | null;
    /** server-provided formatted strings take precedence */
    subtotal_formatted?: string | null;
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
    className?: string;
}
export declare function CartSummary({ itemCount, calculation, items, summaryTitle, itemsLabel, subtotalLabel, shippingLabel, totalLabel, checkoutLabel, continueShoppingLabel, isOrdering, onCheckout, onContinueShopping, className, }: CartSummaryProps): React.ReactElement;
export default CartSummary;
