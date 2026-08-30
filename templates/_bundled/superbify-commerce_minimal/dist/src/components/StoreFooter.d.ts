import { default as React } from 'react';
import { BusinessField } from '../config/businessInfo';
export interface StoreFooterProps {
    brandName?: string;
    tagline?: string;
    copyright?: string;
    className?: string;
    navItems?: {
        href: string;
        label: string;
    }[];
    /** Muted footer line shown when no business info is configured (from lang). */
    demoNotice?: string;
    /** Policy link labels from lang. 개인정보처리방침 uses the same size as the others. */
    termsLabel?: string;
    privacyLabel?: string;
    shippingLabel?: string;
    /** Label of the external 사업자정보확인 link (from lang); only rendered when configured. */
    verificationLabel?: string;
    /** Test/diagnostic injection point; defaults to businessFields() from config/business-info.json. */
    infoFields?: BusinessField[];
}
export declare function StoreFooter({ brandName, tagline, copyright, className, navItems, demoNotice, termsLabel, privacyLabel, shippingLabel, verificationLabel, infoFields, }: StoreFooterProps): React.ReactElement;
export default StoreFooter;
