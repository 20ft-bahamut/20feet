import { default as React } from 'react';
export interface StoreFooterProps {
    brandName?: string;
    tagline?: string;
    copyright?: string;
    className?: string;
    navItems?: {
        href: string;
        label: string;
    }[];
}
export declare function StoreFooter({ brandName, tagline, copyright, className, navItems, }: StoreFooterProps): React.ReactElement;
export default StoreFooter;
