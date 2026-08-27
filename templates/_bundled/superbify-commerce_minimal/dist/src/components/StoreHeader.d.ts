import { default as React } from 'react';
export interface StoreHeaderProps {
    brandName?: string;
    tagline?: string;
    /** Cart count for the cart badge; undefined hides the badge. */
    cartCount?: number;
    className?: string;
}
export declare function StoreHeader({ brandName, tagline, cartCount, className, }: StoreHeaderProps): React.ReactElement;
export default StoreHeader;
