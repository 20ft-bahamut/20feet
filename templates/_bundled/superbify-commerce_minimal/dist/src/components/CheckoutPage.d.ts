import { default as React } from 'react';
import { CheckoutFormCheckoutPayload, CheckoutPaymentMethod } from './CheckoutForm';
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
        data?: {
            order_settings?: CheckoutPageSettings;
        } | null;
        loading?: boolean;
    } | null;
    shippingSettings?: {
        data?: {
            shipping?: {
                default_country?: string;
                international_shipping_enabled?: boolean;
            };
        } | null;
        loading?: boolean;
    } | null;
    isLoggedIn?: boolean;
    currentUserName?: string;
    currentUserPhone?: string;
    currentUserEmail?: string;
    locale?: string;
    title?: string;
    backToShopLabel?: string;
    loadingLabel?: string;
    emptyTempOrderTitle?: string;
    emptyTempOrderMessage?: string;
    submitErrorTitle?: string;
    orderFailedFallback?: string;
    redirectingLabel?: string;
}
export declare function CheckoutPage(props: CheckoutPageProps): React.ReactElement;
export default CheckoutPage;
