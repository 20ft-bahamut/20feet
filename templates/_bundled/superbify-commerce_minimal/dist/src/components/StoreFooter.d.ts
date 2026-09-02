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
    /** Primary nav labels from lang (superbify.nav.*). Defaults keep the English nav. */
    shopLabel?: string;
    storyLabel?: string;
    noticeLabel?: string;
    cartLabel?: string;
    /**
     * Test/diagnostic injection point for the resolved field list.
     * When supplied, the StoreFooter renders exactly this list and skips
     * both the static seed AND the live admin fetch. Production layouts
     * never set this prop; tests and Storybook do.
     */
    infoFields?: BusinessField[];
    /**
     * Disable the live admin basic_info fetch even when `infoFields` is not
     * supplied. Useful for SSR snapshots and test environments where the
     * /shop-info endpoint is unreachable.
     */
    disableLiveShopInfo?: boolean;
    /**
     * Override the /shop-info endpoint URL. Defaults to
     * `/api/plugins/superbify-commerce-compat/shop-info`. Tests may inject
     * a per-test stub here.
     */
    shopInfoEndpoint?: string;
    /**
     * Test-only injection point for the fetch implementation.
     * Signature: (url, init) => Promise<Response> (matches global fetch).
     * Defaults to globalThis.fetch. Production never sets this.
     */
    fetchImpl?: typeof fetch;
    /** Override the shop base URL. Defaults to getShopBase(). */
    shopBase?: string;
}
export declare function StoreFooter({ brandName, tagline, copyright, className, navItems, demoNotice, termsLabel, privacyLabel, shippingLabel, verificationLabel, shopLabel, storyLabel, noticeLabel, cartLabel, infoFields, disableLiveShopInfo, shopInfoEndpoint, fetchImpl, shopBase, }: StoreFooterProps): React.ReactElement;
export default StoreFooter;
