import { default as React } from 'react';
import { CheckoutFormCheckoutPayload, CheckoutFormPaymentSettings, CheckoutFormShippingSettings, CheckoutPaymentMethod } from './CheckoutForm';
export interface CheckoutPageCheckoutData extends CheckoutFormCheckoutPayload {
    temp_order_id?: string | number | null;
}
export interface CheckoutPageSettings {
    payment_methods?: CheckoutPaymentMethod[];
}
export interface CheckoutPageProps {
    /** data_source.checkoutData (unwrapped: { data: response.data.data }) */
    checkoutData?: {
        data?: CheckoutPageCheckoutData;
        loading?: boolean;
        error?: unknown;
    } | null;
    paymentSettings?: {
        data?: CheckoutFormPaymentSettings | null;
        loading?: boolean;
    } | null;
    shippingSettings?: {
        data?: CheckoutFormShippingSettings | null;
        loading?: boolean;
    } | null;
    /** userAddresses data source (회원 저장 배송지) — 게이트는 CheckoutForm 이 isLoggedIn 으로 처리 */
    userAddresses?: {
        data?: {
            addresses?: {
                data?: unknown[];
            };
        };
        loading?: boolean;
        error?: unknown;
    } | null;
    /** Address-manage modal id — "배송지 관리" 클릭 시 G7Core.modal.open 대상. */
    addressManageModalId?: string;
    /** Downloadable-coupon modal id. */
    couponDownloadModalId?: string;
    isLoggedIn?: boolean;
    currentUserName?: string;
    currentUserPhone?: string;
    currentUserEmail?: string;
    locale?: string;
    /** Override the shop base URL. Defaults to getShopBase(). */
    shopBase?: string;
    title?: string;
    backToShopLabel?: string;
    loadingLabel?: string;
    emptyTempOrderTitle?: string;
    emptyTempOrderMessage?: string;
    submitErrorTitle?: string;
    orderFailedFallback?: string;
    redirectingLabel?: string;
    /** Progress indicator labels — cart › checkout › complete. */
    progressCartLabel?: string;
    progressCheckoutLabel?: string;
    progressCompleteLabel?: string;
    /** daum extension_point 주입 노드 — CheckoutForm 의 우편번호 행으로 통과한다. */
    children?: React.ReactNode;
}
export declare function CheckoutPage(props: CheckoutPageProps): React.ReactElement;
export default CheckoutPage;
