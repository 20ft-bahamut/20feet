import { default as React } from 'react';
export interface AddToCartPanelProps {
    productId: number | string;
    productName?: string;
    /** 'on_sale' | 'sold_out' | 'stopped' | ... */
    salesStatus?: string | null;
    salesStatusLabel?: string | null;
    /** Optional override labels (from $t: keys resolved server-side). */
    addToCartLabel?: string;
    buyNowLabel?: string;
    quantityLabel?: string;
    soldOutLabel?: string;
    stoppedLabel?: string;
    minQuantity?: number;
    maxQuantity?: number;
    className?: string;
}
/**
 * Product detail purchase panel: quantity stepper + add-to-cart + buy-now.
 *
 * Action shape mirrors sirsoft-basic's `_product_purchase_card.json` but uses
 * template-styled controls and template tokens. Cart mutation is performed by
 * the G7 layout `apiCall` handler that this component dispatches via DOM
 * CustomEvents — the layout's actions array reads the event detail and posts
 * to `/api/modules/sirsoft-ecommerce/cart`.
 *
 * Why events instead of inline `actions` array on the Button?
 *  - Keeps this component reusable in non-purchase contexts (preview, etc.).
 *  - Lets the layout author decide the exact endpoint/headers/messages in JSON.
 */
export declare function AddToCartPanel({ productId, productName, salesStatus, salesStatusLabel: _salesStatusLabel, addToCartLabel, buyNowLabel, quantityLabel, soldOutLabel, stoppedLabel, minQuantity, maxQuantity, className, }: AddToCartPanelProps): React.ReactElement;
export default AddToCartPanel;
