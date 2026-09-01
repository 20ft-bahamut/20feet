import { default as React } from 'react';
export interface CouponDownloadBadgesCoupon {
    coupon_id: number | string;
    localized_name?: string;
    benefit_formatted?: string;
    multi_currency_benefit_formatted?: Record<string, {
        formatted?: string;
    } | string>;
    target_type_short_label?: string;
    is_downloaded?: boolean;
}
export interface CouponDownloadBadgesProps {
    coupons: CouponDownloadBadgesCoupon[];
    isLoggedIn: boolean;
    guestMessage?: string;
    memberLoginRedirectPath?: string;
    loginRequiredToastMessage?: string;
    downloadSuccessMessage?: string;
    downloadFailedMessage?: string;
    maxVisible?: number;
    className?: string;
}
/**
 * Coupon download badge list on product detail.
 *
 * Mirrors sirsoft-basic _info_summary.json coupon chip block, rendered as a
 * composite so the layout engine does not have to express the POST action.
 *
 * Guest → toast '로그인이 필요합니다.' + redirect /login.
 * Member → POST /api/modules/sirsoft-ecommerce/user/coupons/{coupon_id}/download.
 * On success, refetch the `productDownloadableCoupons` data source so the
 * badge flips to the downloaded state and any other open modal stays in sync.
 *
 * Style uses Still Form design tokens (--scm-*). The list is hidden when
 * `coupons` is empty so the parent layout does not need a guard.
 */
export declare function CouponDownloadBadges(props: CouponDownloadBadgesProps): React.ReactElement | null;
export default CouponDownloadBadges;
