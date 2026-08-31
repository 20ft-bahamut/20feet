import { default as React } from 'react';
export interface CheckoutItem {
    product?: {
        id?: number | string;
        product_code?: string;
        name?: string | string[] | Record<string, string>;
        thumbnail_url?: string | null;
    };
    product_id?: number | string;
    product_option_id?: number | string;
    quantity?: number;
    unit_price_formatted?: string;
    subtotal_formatted?: string;
    multi_currency_subtotal?: Record<string, {
        formatted?: string;
    }>;
}
export interface CheckoutPaymentMethod {
    id: string;
    is_active?: boolean;
    needs_pg?: boolean;
    _cached_name?: string | Record<string, string>;
    _cached_description?: string | Record<string, string>;
    _cached_icon?: string;
}
export interface CheckoutFormSummary {
    subtotal?: number | string | null;
    subtotal_formatted?: string | null;
    total_shipping?: number | string | null;
    total_shipping_formatted?: string | null;
    final_amount?: number | string | null;
    final_amount_formatted?: string | null;
    total_discount?: number | string | null;
    total_discount_formatted?: string | null;
}
export interface CheckoutFormCalculation {
    items?: CheckoutItem[];
    summary?: CheckoutFormSummary;
}
export interface CheckoutFormCheckoutPayload {
    items?: CheckoutItem[];
    calculation?: CheckoutFormCalculation;
    temp_order_id?: string | number | null;
    has_unshippable_items?: boolean;
    unavailable_items?: unknown[];
}
export interface CheckoutFormSettings {
    paymentMethods?: CheckoutPaymentMethod[];
    defaultCountry?: string;
    internationalShippingEnabled?: boolean;
}
export interface CheckoutFormProps {
    /** Unwrapped checkout data (response.data.data) */
    checkoutData?: CheckoutFormCheckoutPayload | null;
    checkoutLoading?: boolean;
    checkoutError?: string | null;
    /** Unwrapped payment settings (response.data.data) */
    paymentSettings?: {
        order_settings?: {
            payment_methods?: CheckoutPaymentMethod[];
        };
    } | null;
    /** Unwrapped shipping settings (response.data.data) */
    shippingSettings?: {
        shipping?: {
            default_country?: string;
            international_shipping_enabled?: boolean;
        };
    } | null;
    /** Form labels — Korean */
    title?: string;
    ordererInfoTitle?: string;
    ordererNameLabel?: string;
    ordererNamePlaceholder?: string;
    ordererPhoneLabel?: string;
    ordererPhonePlaceholder?: string;
    ordererEmailLabel?: string;
    ordererEmailPlaceholder?: string;
    guestLookupPasswordLabel?: string;
    guestLookupPasswordPlaceholder?: string;
    guestLookupConfirmLabel?: string;
    guestLookupConfirmPlaceholder?: string;
    guestLookupHint?: string;
    guestLookupSectionTitle?: string;
    shippingInfoTitle?: string;
    recipientNameLabel?: string;
    recipientNamePlaceholder?: string;
    recipientPhoneLabel?: string;
    recipientPhonePlaceholder?: string;
    zipcodeLabel?: string;
    zipcodePlaceholder?: string;
    addressLabel?: string;
    addressPlaceholder?: string;
    addressDetailLabel?: string;
    addressDetailPlaceholder?: string;
    memoLabel?: string;
    memoPlaceholder?: string;
    paymentMethodTitle?: string;
    depositorNameLabel?: string;
    depositorNamePlaceholder?: string;
    termsAgreement?: string;
    payButtonLabel?: string;
    backToCartLabel?: string;
    submittingLabel?: string;
    /** Resolves payment method label for the current locale. */
    resolvePaymentLabel?: (method: CheckoutPaymentMethod) => string;
    /** Optional callback for navigation events. */
    onNavigateBack?: () => void;
    /** Bypass — call when user clicks "Pay". Receives the assembled payload. */
    onSubmit?: (payload: CheckoutSubmitPayload) => void;
    isSubmitting?: boolean;
    submitError?: string | null;
    /** i18n error/empty map (Korean fallback). */
    emptyMethodsTitle?: string;
    emptyMethodsMessage?: string;
    /** Optional isLoggedIn flag — when false, guest password fields show. */
    isLoggedIn?: boolean;
    /** Logged-in member profile passed from the layout (_global.currentUser) — used to prefill the orderer section. */
    currentUserName?: string;
    currentUserPhone?: string;
    currentUserEmail?: string;
    /**
     * Address-search slot — daum 우편번호 extension_point 주입 노드가
     * zipcode/address 입력 옆에 렌더링되도록 통과시키는 슬롯.
     * (server-injected extension node renders inside the composite)
     */
    children?: React.ReactNode;
}
/**
 * daum 우편번호 extension_point 가 G7 전역 상태 `_global.checkoutAddress` 에
 * 기록한 주소 정보(onAddressSelect setState payload). 플러그인 핸들러는
 * DOM input 에 값을 쓰지 않고 G7 액션만 디스패치하므로, controlled input 을
 * 쓰는 이 컴포지트는 state 구독 브리지로만 주소를 받을 수 있다.
 */
export interface CheckoutFormBridgedAddress {
    zipcode?: string;
    address?: string;
    region?: string;
    city?: string;
    country_code?: string;
    countryCode?: string;
}
export interface CheckoutSubmitPayload {
    temp_order_id?: string | number | null;
    orderer: {
        name: string;
        phone: string;
        email: string;
    };
    shipping: {
        recipient_name: string;
        recipient_phone: string;
        country_code: string;
        zipcode: string;
        address: string;
        address_detail: string;
    };
    payment_method: string;
    shipping_memo: string;
    shipping_memo_custom: string;
    depositor_name: string;
    expected_total_amount: number;
    guest_lookup_password: string | null;
    guest_lookup_password_confirmation: string | null;
}
export declare function CheckoutForm(props: CheckoutFormProps): React.ReactElement;
export default CheckoutForm;
