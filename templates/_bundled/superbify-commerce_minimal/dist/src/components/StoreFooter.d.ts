import { default as React } from 'react';
export interface StoreFooterProps {
    brandName?: string;
    copyright?: string;
    className?: string;
    navItems?: {
        href: string;
        label: string;
    }[];
}
export declare function StoreFooter({ brandName, copyright, className, navItems, }: StoreFooterProps): React.ReactElement;
export default StoreFooter;
