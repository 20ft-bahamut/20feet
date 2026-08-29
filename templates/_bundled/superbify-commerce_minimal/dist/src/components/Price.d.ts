import { default as React } from 'react';
export interface PriceProps {
    /** Number or pre-formatted string from API (e.g. "32,000원"). */
    sellingPrice?: number | string | null;
    listPrice?: number | string | null;
    /** Pre-formatted helper if the API already gave us a string. */
    sellingPriceFormatted?: string | null;
    listPriceFormatted?: string | null;
    /** 0–100 percent or already-formatted string. */
    discountRate?: number | string | null;
    className?: string;
    /** When true, suppress the inline discount percent badge (used when
     *  the parent already renders a discount chip on the image). */
    hideDiscountBadge?: boolean;
}
export declare function Price({ sellingPrice, listPrice, sellingPriceFormatted, listPriceFormatted, discountRate, className, hideDiscountBadge, }: PriceProps): React.ReactElement;
export default Price;
