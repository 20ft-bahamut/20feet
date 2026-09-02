import { default as React } from 'react';
export interface CheckoutItemAdditionalOption {
    group_name?: string | string[] | Record<string, string> | null;
    name?: string | string[] | Record<string, string> | null;
    custom_text?: string | null;
    price_adjustment?: number | string | null;
}
export interface CheckoutCoupon {
    id?: number | string;
    target_type?: 'order_amount' | 'shipping_fee' | string;
    target_type_short_label?: string | string[] | Record<string, string>;
    localized_name?: string | string[] | Record<string, string>;
    benefit_formatted?: string;
    multi_currency_benefit_formatted?: Record<string, string>;
}
export interface CheckoutItem {
    product?: {
        id?: number | string;
        product_code?: string;
        code?: string;
        name?: string | string[] | Record<string, string>;
        thumbnail_url?: string | null;
    };
    product_id?: number | string;
    product_option_id?: number | string;
    product_option?: {
        option_name?: string | string[] | Record<string, string> | null;
        option_name_localized?: string | string[] | Record<string, string> | null;
    } | null;
    option?: {
        name?: string;
    } | null;
    quantity?: number;
    unit_price_formatted?: string;
    subtotal_formatted?: string;
    multi_currency_subtotal?: Record<string, {
        formatted?: string;
    }>;
    /** 추가옵션 (CheckoutItemResource) — group_name/name/custom_text/price_adjustment */
    additional_options?: CheckoutItemAdditionalOption[];
    additional_options_total?: number;
    available_coupons?: CheckoutCoupon[];
    disabled_coupon_ids?: (number | string)[];
    product_coupon_discount_amount?: number;
    product_coupon_discount_formatted?: string;
    is_shippable_to_selected_country?: boolean;
}
export interface CheckoutMileage {
    enabled?: boolean;
    usable?: boolean;
    available?: number;
    max_usable?: number;
    available_formatted?: string;
    max_usable_formatted?: string;
}
export interface CheckoutAddressBookEntry {
    id?: number | string;
    name?: string | string[] | Record<string, string>;
    recipient_name?: string;
    recipient_phone?: string;
    country_code?: string;
    zipcode?: string;
    address?: string;
    address_detail?: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    is_default?: boolean;
}
export interface CheckoutCountryOption {
    code?: string;
    name?: string | string[] | Record<string, string> | null;
    is_active?: boolean;
}
export interface CheckoutPaymentMethod {
    id: string;
    is_active?: boolean;
    needs_pg?: boolean;
    requires_ios?: boolean;
    core_payment_method?: string;
    _cached_name?: string | Record<string, string>;
    _cached_description?: string | Record<string, string>;
    _cached_icon?: string;
}
export interface CheckoutBankAccount {
    id?: number | string;
    /** getPublicPaymentSettings 가 banks[*].name({ko,en}) 을 주입 — 로컬라이즈 객체 가능 */
    bank_name?: string | Record<string, string> | null;
    bank_code?: string;
    account_number?: string;
    account_holder?: string;
    is_active?: boolean;
    is_default?: boolean;
}
export interface CheckoutBankOption {
    code?: string;
    name?: string | Record<string, string> | null;
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
    points_used?: number | string | null;
    points_used_formatted?: string | null;
    order_coupon_discount?: number | string | null;
    order_coupon_discount_formatted?: string | null;
    shipping_coupon_discount?: number | string | null;
    shipping_coupon_discount_formatted?: string | null;
}
export interface CheckoutFormCalculation {
    items?: CheckoutItem[];
    summary?: CheckoutFormSummary;
}
export interface CheckoutFormCheckoutPayload {
    /** Enriched order items (CheckoutItemResource) — GET /checkout returns them top-level. */
    items?: CheckoutItem[];
    calculation?: CheckoutFormCalculation;
    temp_order_id?: string | number | null;
    has_unshippable_items?: boolean;
    unavailable_items?: unknown[];
    available_coupons?: CheckoutCoupon[];
    mileage?: CheckoutMileage | null;
}
export interface CheckoutFormPaymentSettings {
    order_settings?: {
        payment_methods?: CheckoutPaymentMethod[];
        /** code → {code,name} 목록 — vbank/dbank 환불계좌 은행 Select */
        banks?: CheckoutBankOption[];
        bank_accounts?: CheckoutBankAccount[];
        cash_receipt_provider?: string | null;
        auto_cancel_days?: number;
    } | null;
}
/** settings/shipping 의 shipping 그룹 (available_countries 포함). */
export interface CheckoutFormShippingSettings {
    shipping?: {
        default_country?: string;
        international_shipping_enabled?: boolean;
        available_countries?: CheckoutCountryOption[];
    } | null;
}
/** PUT /checkout 재계산 필드 — UpdateCheckoutRequest 계약 그대로. */
export interface CheckoutRecomputeFields {
    zipcode?: string;
    country_code?: string;
    use_points?: number;
    order_coupon_issue_id?: number | string | null;
    shipping_coupon_issue_id?: number | string | null;
    item_coupons?: Record<string, (number | string | null)[]>;
    discount_code?: string | null;
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
        region?: string;
        zipcode: string;
        address: string;
        address_detail: string;
        address_line_1?: string;
        address_line_2?: string;
        intl_city?: string;
        intl_state?: string;
        intl_postal_code?: string;
    };
    payment_method: string;
    shipping_memo: string;
    depositor_name: string;
    dbank: {
        bank_code: string;
        account_number: string;
        account_holder: string;
    } | null;
    refund_bank: {
        bank_code: string;
        account_number: string;
        holder: string;
    } | null;
    cash_receipt: {
        requested: boolean;
        type?: string;
        identifier_type?: string;
        identifier?: string;
    };
    save_shipping_address: boolean;
    expected_total_amount: number;
    /** 비회원 조회 비밀번호 — 회원이면 null(CreateOrderRequest guest-only 계약). */
    guest_lookup_password: string | null;
    guest_lookup_password_confirmation: string | null;
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
/**
 * checkout "배송지 관리" 모달이 저장 배송지를 선택했을 때 기록하는 prefill.
 * 모달 액션이 _global.checkoutShippingPrefill 로 전체 필드를 setState 하면 이
 * 컴포지트가 구독으로 React 상태에 반영한다(UserAddress → checkout 폼 매핑은
 * sirsoft-basic _checkout_shipping.json B3 규칙과 동일).
 */
export interface CheckoutFormPrefillShipping {
    recipient_name?: string;
    recipient_phone?: string;
    country_code?: string;
    zipcode?: string;
    address?: string;
    address_detail?: string;
    region?: string;
    address_line_1?: string;
    address_line_2?: string;
    intl_city?: string;
    intl_state?: string;
    intl_postal_code?: string;
}
export interface CheckoutFormProps {
    /** Unwrapped checkout data (response.data.data) */
    checkoutData?: CheckoutFormCheckoutPayload | null;
    checkoutLoading?: boolean;
    checkoutError?: string | null;
    paymentSettings?: CheckoutFormPaymentSettings | null;
    shippingSettings?: CheckoutFormShippingSettings | null;
    /** Unwrapped userAddresses data source (GET /user/addresses) — member only. */
    userAddresses?: {
        data?: {
            addresses?: {
                data?: CheckoutAddressBookEntry[];
            };
        };
    } | null;
    /** Form section titles + labels — Korean fallback. */
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
    savedAddressTitle?: string;
    manageAddressesLabel?: string;
    sameAsOrdererLabel?: string;
    saveAddressLabel?: string;
    recipientNameLabel?: string;
    recipientNamePlaceholder?: string;
    recipientPhoneLabel?: string;
    recipientPhonePlaceholder?: string;
    countryLabel?: string;
    zipcodeLabel?: string;
    zipcodePlaceholder?: string;
    addressLabel?: string;
    addressPlaceholder?: string;
    addressDetailLabel?: string;
    addressDetailPlaceholder?: string;
    intlAddressLabel?: string;
    intlAddress1Placeholder?: string;
    intlAddress2Label?: string;
    intlAddress2Placeholder?: string;
    intlCityLabel?: string;
    intlCityPlaceholder?: string;
    intlStateLabel?: string;
    intlStatePlaceholder?: string;
    intlPostalCodeLabel?: string;
    intlPostalCodePlaceholder?: string;
    memoLabel?: string;
    memoPlaceholder?: string;
    paymentMethodTitle?: string;
    depositorNameLabel?: string;
    depositorNamePlaceholder?: string;
    bankAccountsTitle?: string;
    bankSelectLabel?: string;
    dbankHelperLabel?: string;
    vbankHelperLabel?: string;
    depositDueSuffixLabel?: string;
    refundBankTitle?: string;
    refundBankCodeLabel?: string;
    refundBankAccountLabel?: string;
    refundBankHolderLabel?: string;
    cashReceiptRequestLabel?: string;
    cashReceiptPurposeLabel?: string;
    cashReceiptIncomeLabel?: string;
    cashReceiptExpenseLabel?: string;
    cashReceiptIdentifierTypeLabel?: string;
    cashReceiptIdentifierLabel?: string;
    cashReceiptIdentifierPlaceholder?: string;
    cashReceiptIdentifierPhoneLabel?: string;
    cashReceiptIdentifierCardLabel?: string;
    cashReceiptIdentifierBusinessLabel?: string;
    discountSectionTitle?: string;
    couponDownloadLabel?: string;
    orderCouponLabel?: string;
    shippingCouponLabel?: string;
    couponNoAvailableLabel?: string;
    couponCountSuffixLabel?: string;
    couponAlreadyUsedLabel?: string;
    couponSelectPlaceholder?: string;
    discountCodeLabel?: string;
    discountCodePlaceholder?: string;
    discountCodeApplyLabel?: string;
    mileageSectionTitle?: string;
    mileageAvailableLabel?: string;
    mileageUseAllLabel?: string;
    mileageApplyLabel?: string;
    mileageInputPlaceholder?: string;
    pointsUsedLabel?: string;
    shippingCouponDiscountLabel?: string;
    unavailableTitle?: string;
    unavailableMessage?: string;
    quantityLabel?: string;
    summaryTitle?: string;
    subtotalLabel?: string;
    discountLabel?: string;
    shippingFeeLabel?: string;
    totalAmountLabel?: string;
    termsAgreement?: string;
    payButtonLabel?: string;
    submittingLabel?: string;
    /** Resolves payment method label for the current locale. */
    resolvePaymentLabel?: (method: CheckoutPaymentMethod) => string;
    /** Optional callback for navigation events. */
    onNavigateBack?: () => void;
    /** PUT /checkout 재계산(배송지/국가 변경, 쿠폰·적립금 적용). 성공 시 true. */
    onRecomputeCheckout?: (fields: CheckoutRecomputeFields, opts?: {
        successMessage?: string;
    }) => Promise<boolean>;
    /** 배송지 관리 모달을 연다(레이아웃 모달 + G7Core.modal.open). */
    onOpenAddressManager?: () => void;
    /** 쿠폰 다운로드 모달을 연다. */
    onOpenCouponDownload?: () => void;
    /** Bypass — call when user clicks "Pay". Receives the assembled payload. */
    onSubmit?: (payload: CheckoutSubmitPayload) => void;
    isSubmitting?: boolean;
    submitError?: string | null;
    /** i18n error/empty map (Korean fallback). */
    emptyMethodsTitle?: string;
    emptyMethodsMessage?: string;
    /** Optional isLoggedIn flag — guest password fields show, member-only features hide. */
    isLoggedIn?: boolean;
    /** Logged-in member profile passed from the layout (_global.currentUser) — orderer prefill. */
    currentUserName?: string;
    currentUserPhone?: string;
    currentUserEmail?: string;
    /** Locale for label resolution (payment method names, countries). */
    locale?: string;
    /**
     * daum 우편번호 extension_point 주입 노드 — zipcode 입력 옆에 렌더링되는 슬롯.
     */
    children?: React.ReactNode;
}
export declare function CheckoutForm(props: CheckoutFormProps): React.ReactElement;
export default CheckoutForm;
