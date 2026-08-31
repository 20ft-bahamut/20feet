import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Button,
    Div,
    Form,
    H3,
    Img,
    Input,
    Label,
    P,
    Select,
    Span,
    Textarea,
} from './basic';
import { resolveStillLifeThumb } from './stillLifeSlot';

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
    option?: { name?: string } | null;
    quantity?: number;
    unit_price_formatted?: string;
    subtotal_formatted?: string;
    multi_currency_subtotal?: Record<string, { formatted?: string }>;
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
    orderer: { name: string; phone: string; email: string };
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
    dbank: { bank_code: string; account_number: string; account_holder: string } | null;
    refund_bank: { bank_code: string; account_number: string; holder: string } | null;
    cash_receipt: { requested: boolean; type?: string; identifier_type?: string; identifier?: string };
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
    userAddresses?: { data?: { addresses?: { data?: CheckoutAddressBookEntry[] } } } | null;
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
    onRecomputeCheckout?: (
        fields: CheckoutRecomputeFields,
        opts?: { successMessage?: string }
    ) => Promise<boolean>;
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

const DEFAULT_LOCALE = 'ko';

function resolveLabel(
    value: string | string[] | Record<string, string> | null | undefined,
    locale: string = DEFAULT_LOCALE
): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
        // Multi-locale name array — pick first non-empty
        for (const v of value) {
            const r = resolveLabel(v, locale);
            if (r) return r;
        }
        return '';
    }
    if (typeof value === 'object') {
        return (value as Record<string, string>)[locale] ?? Object.values(value)[0] ?? '';
    }
    return '';
}

export function CheckoutForm(props: CheckoutFormProps): React.ReactElement {
    const {
        checkoutData,
        checkoutLoading,
        checkoutError,
        paymentSettings,
        shippingSettings,
        userAddresses,
        ordererInfoTitle = '주문자 정보',
        ordererNameLabel = '이름',
        ordererNamePlaceholder = '주문자 이름',
        ordererPhoneLabel = '연락처',
        ordererPhonePlaceholder = '010-0000-0000',
        ordererEmailLabel = '이메일',
        ordererEmailPlaceholder = 'name@example.com',
        guestLookupPasswordLabel = '비회원 조회 비밀번호',
        guestLookupPasswordPlaceholder = '8자 이상',
        guestLookupConfirmLabel = '비밀번호 확인',
        guestLookupConfirmPlaceholder = '다시 입력',
        guestLookupHint = '주문 조회 시 사용할 비밀번호 (8자 이상)',
        guestLookupSectionTitle = '비회원 주문 조회 비밀번호',
        shippingInfoTitle = '배송지 정보',
        savedAddressTitle = '저장된 배송지',
        manageAddressesLabel = '배송지 관리',
        sameAsOrdererLabel = '주문자 정보와 동일',
        saveAddressLabel = '입력한 배송지를 저장합니다',
        recipientNameLabel = '받는 분',
        recipientNamePlaceholder = '받는 분 이름',
        recipientPhoneLabel = '연락처',
        recipientPhonePlaceholder = '010-0000-0000',
        countryLabel = '배송국가',
        zipcodeLabel = '우편번호',
        zipcodePlaceholder = '우편번호',
        addressLabel = '주소',
        addressPlaceholder = '기본 주소',
        addressDetailLabel = '상세 주소',
        addressDetailPlaceholder = '동/호수 등',
        intlAddressLabel = '주소 (해외)',
        intlAddress1Placeholder = '주소 (Street address)',
        intlAddress2Label = '주소 상세',
        intlAddress2Placeholder = '아파트/동/호수 등 (Apt, suite, unit)',
        intlCityLabel = '도시',
        intlCityPlaceholder = '도시 (City)',
        intlStateLabel = '주/도/지역',
        intlStatePlaceholder = '주(State) / 도(Province) / 지역',
        intlPostalCodeLabel = '우편번호',
        intlPostalCodePlaceholder = '우편번호 (Postal code)',
        memoLabel = '배송 메모',
        memoPlaceholder = '배송 메모를 선택하세요',
        paymentMethodTitle = '결제 수단',
        depositorNameLabel = '입금자명',
        depositorNamePlaceholder = '입금자명',
        bankAccountsTitle = '입금 계좌',
        bankSelectLabel = '입금 계좌 선택',
        dbankHelperLabel = '입금 확인 후 배송이 시작됩니다.',
        vbankHelperLabel = '입금 기한이 지나면 주문이 자동 취소됩니다.',
        refundBankTitle = '환불 계좌',
        refundBankCodeLabel = '은행',
        refundBankAccountLabel = '계좌번호',
        refundBankHolderLabel = '예금주',
        cashReceiptRequestLabel = '현금영수증 신청',
        cashReceiptPurposeLabel = '증빙 용도',
        cashReceiptIncomeLabel = '소득공제용',
        cashReceiptExpenseLabel = '지출증빙용',
        cashReceiptIdentifierTypeLabel = '발급 수단',
        cashReceiptIdentifierLabel = '현금영수증 번호',
        cashReceiptIdentifierPlaceholder = '휴대폰 번호 또는 카드 번호',
        cashReceiptIdentifierPhoneLabel = '휴대폰번호',
        cashReceiptIdentifierCardLabel = '현금영수증카드',
        cashReceiptIdentifierBusinessLabel = '사업자등록번호',
        discountSectionTitle = '할인 · 쿠폰',
        couponDownloadLabel = '쿠폰 다운로드',
        orderCouponLabel = '주문 쿠폰',
        shippingCouponLabel = '배송비 쿠폰',
        couponNoAvailableLabel = '사용 가능한 쿠폰이 없습니다',
        couponCountSuffixLabel = '개 보유',
        couponAlreadyUsedLabel = '이미 적용됨',
        couponSelectPlaceholder = '쿠폰을 선택하세요',
        discountCodeLabel = '할인코드',
        discountCodePlaceholder = '할인코드를 입력하세요',
        discountCodeApplyLabel = '적용',
        mileageSectionTitle = '적립금',
        mileageAvailableLabel = '보유 적립금',
        mileageUseAllLabel = '전액 사용',
        mileageApplyLabel = '적용',
        mileageInputPlaceholder = '사용할 적립금',
        pointsUsedLabel = '적립금 사용',
        shippingCouponDiscountLabel = '배송비 쿠폰 할인',
        unavailableTitle = '주문할 수 없는 상품이 포함되어 있습니다',
        unavailableMessage = '품절·판매중지된 상품을 장바구니에서 제외한 후 다시 시도해 주세요.',
        quantityLabel = '수량',
        summaryTitle = '주문 요약',
        subtotalLabel = '상품금액',
        discountLabel = '할인',
        shippingFeeLabel = '배송비',
        totalAmountLabel = '총 결제금액',
        termsAgreement = '결제 진행 시 주문 내용 확인 및 결제에 동의합니다.',
        payButtonLabel = '결제하기',
        submittingLabel = '처리 중…',
        resolvePaymentLabel,
        onRecomputeCheckout,
        onOpenAddressManager,
        onOpenCouponDownload,
        onSubmit,
        isSubmitting = false,
        submitError,
        emptyMethodsTitle = '결제 수단이 없습니다',
        emptyMethodsMessage = '관리자에서 결제 설정을 확인해 주세요.',
        isLoggedIn = false,
        currentUserName,
        currentUserPhone,
        currentUserEmail,
        locale = DEFAULT_LOCALE,
        children,
    } = props;

    // Form state
    const [ordererName, setOrdererName] = useState('');
    const [ordererPhone, setOrdererPhone] = useState('');
    const [ordererEmail, setOrdererEmail] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [sameAsOrderer, setSameAsOrderer] = useState(false);
    const [countryCode, setCountryCode] = useState('');
    const [region, setRegion] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [address, setAddress] = useState('');
    const [addressDetail, setAddressDetail] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [intlCity, setIntlCity] = useState('');
    const [intlState, setIntlState] = useState('');
    const [intlPostalCode, setIntlPostalCode] = useState('');
    const [selectedAddressId, setSelectedAddressId] = useState<number | string | null>(null);
    const [saveAddress, setSaveAddress] = useState(false);
    const [shippingMemo, setShippingMemo] = useState('');
    const [shippingMemoCustom, setShippingMemoCustom] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [depositorName, setDepositorName] = useState('');
    const [selectedDbank, setSelectedDbank] = useState<CheckoutBankAccount | null>(null);
    const [refundBankCode, setRefundBankCode] = useState('');
    const [refundBankAccount, setRefundBankAccount] = useState('');
    const [refundBankHolder, setRefundBankHolder] = useState('');
    const [cashReceiptRequested, setCashReceiptRequested] = useState(false);
    const [cashReceiptType, setCashReceiptType] = useState('income');
    const [cashReceiptIdentifierType, setCashReceiptIdentifierType] = useState('phone');
    const [cashReceiptIdentifier, setCashReceiptIdentifier] = useState('');
    const [usePoints, setUsePoints] = useState('');
    const [orderCoupon, setOrderCoupon] = useState<string>('');
    const [shippingCoupon, setShippingCoupon] = useState<string>('');
    const [discountCode, setDiscountCode] = useState('');
    const [itemCoupons, setItemCoupons] = useState<Record<string, [string, string]>>({});
    const [guestPassword, setGuestPassword] = useState('');
    const [guestPasswordConfirm, setGuestPasswordConfirm] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const userTouchedRef = useRef(false);
    // item_coupons 병합 맵의 최신 값(비동기 setState 지연과 무관한 동기 접근용).
    const itemCouponsRef = useRef<Record<string, [string, string]>>({});

    // Member prefill — layout passes _global.currentUser.*; fill the orderer
    // section once when the profile arrives and the member has not edited yet.
    // G7Core.currentUser state updates land after mount because current_user DS
    // is progressive, so this effect re-runs as the values resolve.
    useEffect(() => {
        if (!isLoggedIn || userTouchedRef.current) return;
        if (currentUserName) setOrdererName((prev) => (prev ? prev : currentUserName));
        if (currentUserPhone) setOrdererPhone((prev) => (prev ? prev : currentUserPhone));
    }, [isLoggedIn, currentUserName, currentUserPhone]);

    useEffect(() => {
        if (!userTouchedRef.current && isLoggedIn && currentUserEmail) {
            setOrdererEmail((prev) => (prev ? prev : currentUserEmail));
        }
    }, [isLoggedIn, currentUserEmail]);

    const orderSettings = paymentSettings?.order_settings ?? {};
    const paymentMethods = useMemo<CheckoutPaymentMethod[]>(
        () => orderSettings.payment_methods ?? [],
        [orderSettings.payment_methods],
    );
    // 결제수단 게이트 — 활성 + (iOS 전용 수단은 iOS appConfig 에서만).
    // sirsoft-basic _checkout_payment.json:55 의 필터와 동일 계약.
    const isIos = useMemo(() => {
        try {
            const state = (window as unknown as {
                G7Core?: { state?: { get?: () => { appConfig?: { isIos?: boolean }; _global?: { appConfig?: { isIos?: boolean } } } } };
            }).G7Core?.state?.get?.();
            return !!(state?.appConfig?.isIos ?? state?._global?.appConfig?.isIos);
        } catch {
            return false;
        }
    }, []);
    const activeMethods = useMemo(
        () => paymentMethods.filter((m) => m?.is_active && (!m.requires_ios || isIos)),
        [paymentMethods, isIos],
    );
    // 무통장입금 계좌 목록(settings.bank_accounts) — dbank 라디오 선택 + payload 용.
    const bankAccounts = useMemo<CheckoutBankAccount[]>(
        () => (orderSettings.bank_accounts ?? []).filter((b) => b?.is_active !== false),
        [orderSettings.bank_accounts],
    );
    // vbank/dbank 환불계좌 은행 Select 옵션 (order_settings.banks: {code,name})
    const banksList = useMemo<CheckoutBankOption[]>(() => {
        const raw = orderSettings.banks;
        if (Array.isArray(raw)) return raw as CheckoutBankOption[];
        return [];
    }, [orderSettings.banks]);
    const autoCancelDays = orderSettings.auto_cancel_days;
    const cashReceiptProvider = orderSettings.cash_receipt_provider;

    // 배송 설정 — 국가 선택(international_shipping_enabled) + 기본 국가.
    const shippingConfig = shippingSettings?.shipping ?? null;
    const internationalShippingEnabled = shippingConfig?.international_shipping_enabled === true;
    const countryOptions = useMemo<CheckoutCountryOption[]>(
        () => (shippingConfig?.available_countries ?? []).filter((c) => c?.is_active !== false),
        [shippingConfig],
    );
    // 국가 시드 — preferredShippingCountry → default_country → KR (sirsoft-basic 시드 체인의
    // shippingSettings 버전; _global.modules[...] 값은 settings/shipping 응답과 동일 출처).
    useEffect(() => {
        if (countryCode) return;
        try {
            const state = (window as unknown as {
                G7Core?: { state?: { get?: () => { _global?: { preferredShippingCountry?: string } } } };
            }).G7Core?.state?.get?.();
            const preferred = state?._global?.preferredShippingCountry;
            setCountryCode(preferred ?? shippingConfig?.default_country ?? 'KR');
        } catch {
            setCountryCode(shippingConfig?.default_country ?? 'KR');
        }
    }, [shippingConfig, countryCode]);
    const isKrCountry = (countryCode || 'KR') === 'KR';

    // Mileage / coupons — member-only gates (sirsoft-basic _checkout_mileage/_checkout_discount 참조).
    const mileage = checkoutData?.mileage ?? null;
    const mileageVisible = !!isLoggedIn && !!mileage?.enabled && mileage?.usable !== false;
    const availableCoupons = useMemo<CheckoutCoupon[]>(
        () => checkoutData?.available_coupons ?? [],
        [checkoutData],
    );
    const orderCoupons = useMemo(
        () => availableCoupons.filter((c) => c?.target_type === 'order_amount'),
        [availableCoupons],
    );
    const shippingCoupons = useMemo(
        () => availableCoupons.filter((c) => c?.target_type === 'shipping_fee'),
        [availableCoupons],
    );

    // 저장된 배송지 — userAddresses data source (회원 전용).
    const savedAddresses = useMemo<CheckoutAddressBookEntry[]>(
        () => userAddresses?.data?.addresses?.data ?? [],
        [userAddresses],
    );

    const summary = checkoutData?.calculation?.summary;
    // GET /checkout 은 CheckoutItemResource 로 enrich 된 아이템을 최상위 items 에,
    // 계산용 raw 목록을 calculation.items 에 담는다. 표시는 enriched 쪽을 우선한다.
    const items = checkoutData?.items?.length ? checkoutData.items : checkoutData?.calculation?.items ?? [];
    const finalAmount: number = useMemo(() => {
        const v = summary?.final_amount;
        if (typeof v === 'number') return v;
        if (typeof v === 'string') return Number(v) || 0;
        return 0;
    }, [summary]);

    const subtotalText = summary?.subtotal_formatted ?? '—';
    const shippingText = summary?.total_shipping_formatted ?? '0원';
    const discountText = summary?.total_discount_formatted ?? null;
    const finalText = summary?.final_amount_formatted ?? '—';
    const pointsUsedText: string | null =
        summary?.points_used_formatted ??
        (typeof summary?.points_used === 'number' && summary.points_used > 0
            ? `${summary.points_used.toLocaleString()}원`
            : null);
    const shippingCouponDiscountText: string | null =
        summary?.shipping_coupon_discount_formatted ??
        (typeof summary?.shipping_coupon_discount === 'number' && summary.shipping_coupon_discount > 0
            ? `${summary.shipping_coupon_discount.toLocaleString()}원`
            : null);

    // 선택 결제수단 — 플러그인 method id 를 core enum 로 번역 (sirsoft-basic
    // _computed.selectedCorePaymentMethod 계약). core_payment_method 선언이 없으면 raw id.
    const selectedMethodObject = useMemo(
        () => activeMethods.find((m) => m.id === paymentMethod) ?? null,
        [activeMethods, paymentMethod],
    );
    const corePaymentMethod = selectedMethodObject?.core_payment_method ?? paymentMethod;
    const needsBankMethod = corePaymentMethod === 'dbank' || corePaymentMethod === 'vbank';

    // Pick a default payment method on first load (active methods).
    useEffect(() => {
        if (!paymentMethod && activeMethods.length > 0) {
            setPaymentMethod(activeMethods[0].id);
        }
    }, [activeMethods, paymentMethod]);

    // dbank 선택 시 계좌 기본 선택 — is_default 우선, 없으면 첫 계좌.
    useEffect(() => {
        if (corePaymentMethod === 'dbank' && !selectedDbank && bankAccounts.length > 0) {
            setSelectedDbank(bankAccounts.find((b) => b?.is_default) ?? bankAccounts[0]);
        }
    }, [corePaymentMethod, selectedDbank, bankAccounts]);

    // Auto-fill depositor name from orderer when empty.
    useEffect(() => {
        if (!userTouchedRef.current) {
            setDepositorName(ordererName);
        }
    }, [ordererName]);

    // 주문자 정보와 동일 — orderer 입력이 바뀌면 수취인에 미러(sirsoft-basic blur-mirror 동일).
    useEffect(() => {
        if (sameAsOrderer) {
            setRecipientName(ordererName);
            setRecipientPhone(ordererPhone);
        }
    }, [sameAsOrderer, ordererName, ordererPhone]);

    const handleSameAsOrdererChange = useCallback((checked: boolean) => {
        setSameAsOrderer(checked);
        if (checked) {
            setRecipientName(ordererName);
            setRecipientPhone(ordererPhone);
            setSelectedAddressId(null);
        }
    }, [ordererName, ordererPhone]);

    // daum 우편번호 브리지 — extension_point 의 onAddressSelect 가 G7 전역 상태
    // `_global.checkoutAddress` 로 주소를 기록한다(플러그인은 DOM input 에 값을
    // 쓰지 않는다). 이 컴포지트는 controlled input 을 쓰므로 G7Core.state 구독으로
    // 해당 값을 React 상태로 동기화한다(storageHandlers tolerant-lookup 패턴).
    const applyBridgedAddress = useCallback(
        (addr: CheckoutFormBridgedAddress | null | undefined) => {
            if (!addr || typeof addr !== 'object') return;
            const nextZipcode = typeof addr.zipcode === 'string' ? addr.zipcode : '';
            const nextAddress = typeof addr.address === 'string' ? addr.address : '';
            if (nextZipcode) {
                setZipcode((prev) => (prev === nextZipcode ? prev : nextZipcode));
            }
            if (nextAddress) {
                setAddress((prev) => (prev === nextAddress ? prev : nextAddress));
            }
        },
        [],
    );

    // 저장 배송지 선택 브리지 — "배송지 관리" 모달이 _global.checkoutShippingPrefill 에
    // 전체 필드를 기록하면 React 상태로 반영하고 재계산을 트리거한다.
    const applyPrefillShipping = useCallback(
        (prefill: CheckoutFormPrefillShipping | null | undefined) => {
            if (!prefill || typeof prefill !== 'object') return;
            const hasAny =
                (prefill.recipient_name ?? '') !== '' ||
                (prefill.zipcode ?? '') !== '' ||
                (prefill.address ?? '') !== '' ||
                (prefill.address_line_1 ?? '') !== '';
            if (!hasAny) return;
            if (prefill.recipient_name) setRecipientName(prefill.recipient_name);
            if (prefill.recipient_phone) setRecipientPhone(prefill.recipient_phone);
            if (prefill.country_code) setCountryCode(prefill.country_code);
            setRegion(prefill.region ?? '');
            setZipcode(prefill.zipcode ?? '');
            setAddress(prefill.address ?? '');
            setAddressDetail(prefill.address_detail ?? '');
            setAddressLine1(prefill.address_line_1 ?? '');
            setAddressLine2(prefill.address_line_2 ?? '');
            setIntlCity(prefill.intl_city ?? '');
            setIntlState(prefill.intl_state ?? '');
            setIntlPostalCode(prefill.intl_postal_code ?? '');
            setSelectedAddressId(null);
            setSaveAddress(false);
        },
        [],
    );

    useEffect(() => {
        const G7Core = (
            window as unknown as {
                G7Core?: {
                    state?: {
                        get?: () => Record<string, unknown> | null | undefined;
                        subscribe?: (listener: (state: Record<string, unknown>) => void) => (() => void) | void;
                    };
                };
            }
        ).G7Core;
        if (!G7Core?.state) return;

        // 마운트 시점에 이미 주소가 기록돼 있으면 즉시 반영(재방문/뒤로가기 대응).
        const snapshot = G7Core.state.get?.();
        const snapGlobal = (snapshot ?? {}) as {
            checkoutAddress?: CheckoutFormBridgedAddress;
            checkoutShippingPrefill?: CheckoutFormPrefillShipping;
            _global?: {
                checkoutAddress?: CheckoutFormBridgedAddress;
                checkoutShippingPrefill?: CheckoutFormPrefillShipping;
            };
        };
        applyBridgedAddress(snapGlobal?.checkoutAddress ?? snapGlobal?._global?.checkoutAddress);
        applyPrefillShipping(snapGlobal?.checkoutShippingPrefill ?? snapGlobal?._global?.checkoutShippingPrefill);

        const unsubscribe = G7Core.state.subscribe?.((state) => {
            const scoped = (state ?? {}) as {
                checkoutAddress?: CheckoutFormBridgedAddress;
                checkoutShippingPrefill?: CheckoutFormPrefillShipping;
                _global?: {
                    checkoutAddress?: CheckoutFormBridgedAddress;
                    checkoutShippingPrefill?: CheckoutFormPrefillShipping;
                };
            };
            applyBridgedAddress(scoped?.checkoutAddress ?? scoped?._global?.checkoutAddress);
            applyPrefillShipping(scoped?.checkoutShippingPrefill ?? scoped?._global?.checkoutShippingPrefill);
        });

        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, [applyBridgedAddress, applyPrefillShipping]);

    // 저장 배송지 pill 클릭 — 필드 채우기 + 배송비 재계산(sirsoft-basic 저장배송지 선택 흐름).
    const applySavedAddress = useCallback(
        (addr: CheckoutAddressBookEntry) => {
            setRecipientName(addr.recipient_name ?? '');
            setRecipientPhone(addr.recipient_phone ?? '');
            setCountryCode(addr.country_code ?? 'KR');
            setZipcode(addr.zipcode ?? '');
            setAddress(addr.address ?? '');
            setAddressDetail(addr.address_detail ?? '');
            setAddressLine1(addr.address_line_1 ?? '');
            setAddressLine2(addr.address_line_2 ?? '');
            setIntlCity(addr.city ?? '');
            setIntlState(addr.state ?? '');
            setIntlPostalCode(addr.postal_code ?? '');
            setRegion('');
            setSelectedAddressId(addr.id ?? null);
            setSaveAddress(false);
            setFieldErrors({});
            void onRecomputeCheckout?.({
                zipcode: addr.zipcode ?? '',
                country_code: addr.country_code ?? 'KR',
            });
        },
        [onRecomputeCheckout],
    );

    const labelPayment = useCallback(
        (m: CheckoutPaymentMethod) => {
            if (resolvePaymentLabel) return resolvePaymentLabel(m);
            return resolveLabel(m._cached_name, locale) || m.id;
        },
        [resolvePaymentLabel, locale],
    );

    const couponOptionLabel = useCallback(
        (c: CheckoutCoupon): string => {
            const benefit =
                c?.multi_currency_benefit_formatted?.[locale] ?? c?.benefit_formatted ?? '';
            return `[${resolveLabel(c?.target_type_short_label, locale)}] ${resolveLabel(c?.localized_name, locale)}${benefit ? ` (${benefit})` : ''}`;
        },
        [locale],
    );

    // 배송메모 — 기본 Select enum 커스텀 병합(sirsoft-basic: custom → shipping_memo 단일 필드).
    const onChangeMemo = useCallback((value: string) => {
        setShippingMemo(value);
    }, []);

    const validate = useCallback((): Record<string, string> => {
        const errs: Record<string, string> = {};
        if (!ordererName.trim()) errs['orderer.name'] = '이름을 입력해 주세요.';
        if (!ordererPhone.trim()) errs['orderer.phone'] = '연락처를 입력해 주세요.';
        if (!isLoggedIn && !ordererEmail.trim()) {
            errs['orderer.email'] = '이메일을 입력해 주세요.';
        }
        if (!recipientName.trim()) errs['shipping.recipient_name'] = '받는 분 이름을 입력해 주세요.';
        if (!recipientPhone.trim()) errs['shipping.recipient_phone'] = '받는 분 연락처를 입력해 주세요.';
        if (isKrCountry) {
            if (!zipcode.trim()) errs['shipping.zipcode'] = '우편번호를 입력해 주세요.';
            if (!address.trim()) errs['shipping.address'] = '주소를 입력해 주세요.';
        } else {
            if (!addressLine1.trim()) errs['shipping.address_line_1'] = '주소를 입력해 주세요.';
            if (!intlCity.trim()) errs['shipping.intl_city'] = '도시를 입력해 주세요.';
            if (!intlPostalCode.trim()) errs['shipping.intl_postal_code'] = '우편번호를 입력해 주세요.';
        }
        if (!paymentMethod) errs['payment_method'] = '결제 수단을 선택해 주세요.';
        if (needsBankMethod && !depositorName.trim()) {
            errs['depositor_name'] = '입금자명을 입력해 주세요.';
        }
        if (corePaymentMethod === 'dbank' && bankAccounts.length > 0 && !selectedDbank) {
            errs['dbank.bank_code'] = '입금 계좌를 선택해 주세요.';
        }
        // 환불계좌 — 3필드 all-or-none(CreateOrderRequest withValidator 계약).
        const refundFilled = [refundBankCode, refundBankAccount, refundBankHolder].filter((v) => v.trim());
        if (refundFilled.length > 0 && refundFilled.length < 3) {
            errs['refund_bank'] = '환불 계좌 정보를 모두 입력해 주세요.';
        }
        // 현금영수증 — 신청 시 식별번호 필수(required_if 계약).
        if (cashReceiptRequested && !cashReceiptIdentifier.trim()) {
            errs['cash_receipt_identifier'] = '현금영수증 번호를 입력해 주세요.';
        }
        if (!isLoggedIn) {
            if (guestPassword.length < 8) {
                errs['guest_lookup_password'] = '비밀번호는 8자 이상이어야 합니다.';
            }
            if (guestPassword !== guestPasswordConfirm) {
                errs['guest_lookup_password_confirmation'] = '비밀번호가 일치하지 않습니다.';
            }
        }
        return errs;
    }, [
        ordererName, ordererPhone, ordererEmail, isLoggedIn, recipientName, recipientPhone,
        isKrCountry, zipcode, address, addressLine1, intlCity, intlPostalCode,
        paymentMethod, needsBankMethod, depositorName,
        corePaymentMethod, bankAccounts, selectedDbank,
        refundBankCode, refundBankAccount, refundBankHolder,
        cashReceiptRequested, cashReceiptIdentifier,
        guestPassword, guestPasswordConfirm, isLoggedIn,
    ]);

    // 쿠폰/적립금/주소 재계산 — PUT /checkout(UpdateCheckoutRequest) → checkoutData refetch.
    // 이 컴포지트는 상태만, 실제 호출은 CheckoutPage(계약 유지: 단일 api layer).
    const recompute = useCallback(
        async (fields: CheckoutRecomputeFields, opts?: { successMessage?: string }): Promise<boolean> => {
            if (!onRecomputeCheckout) return false;
            return onRecomputeCheckout(fields, opts);
        },
        [onRecomputeCheckout],
    );

    const handleOrderCouponChange = useCallback((value: string) => {
        setOrderCoupon(value);
        void recompute(
            { order_coupon_issue_id: value || null },
            { successMessage: value ? '주문 쿠폰이 적용되었습니다.' : '주문 쿠폰이 해제되었습니다.' },
        );
    }, [recompute]);

    const handleShippingCouponChange = useCallback((value: string) => {
        setShippingCoupon(value);
        void recompute(
            { shipping_coupon_issue_id: value || null },
            { successMessage: value ? '배송비 쿠폰이 적용되었습니다.' : '배송비 쿠폰이 해제되었습니다.' },
        );
    }, [recompute]);

    // 상품쿠폰 — 상품별 최대 2개(UpdateCheckoutRequest item_coupons 계약).
    // PUT 바디에는 항상 '전체 병합 맵'을 보낸다 — 백엔드는 해당 키 존재 시 기존 맵을
    // 통째로 교체하므로 부분 맵만 보내면 다른 상품의 쿠폰이 조용히 유실된다(default 템플릿도 전체 맵 전송).
    const handleItemCouponChange = useCallback((optionId: string, slot: 0 | 1, value: string) => {
        const prev = itemCouponsRef.current;
        const current = prev[optionId] ?? ['', ''];
        const next: [string, string] = [current[0], current[1]];
        next[slot] = value;
        // 같은 쿠폰 중복 선택 방지(default disabled_coupon_ids 정책에 맞춘 local guard).
        if (slot === 0 && value && next[1] === value) next[1] = '';
        if (slot === 1 && value && next[0] === value) next[0] = '';
        const merged: Record<string, (string | null)[]> = {};
        const withNext: Record<string, [string, string]> = { ...prev, [optionId]: next };
        for (const [pid, pair] of Object.entries(withNext)) {
            merged[pid] = [pair[0] || null, pair[1] || null];
        }
        itemCouponsRef.current = withNext;
        setItemCoupons(withNext);
        void recompute(
            { item_coupons: merged },
            { successMessage: value ? '상품 쿠폰이 적용되었습니다.' : '상품 쿠폰이 해제되었습니다.' },
        );
    }, [recompute]);

    const handleApplyMileage = useCallback((value: string) => {
        const points = Math.max(0, Math.floor(Number(value) || 0));
        void recompute({ use_points: points }, { successMessage: points > 0 ? '적립금이 적용되었습니다.' : '적립금 사용이 취소되었습니다.' });
    }, [recompute]);

    const handleApplyDiscountCode = useCallback(() => {
        if (!discountCode.trim()) return;
        void recompute({ discount_code: discountCode.trim() }, { successMessage: '할인코드가 적용되었습니다.' });
    }, [discountCode, recompute]);

    // 결제수단 전환 — 환불계좌/현금영수증 상태 초기화(sirsoft-basic method switch 정책 동일).
    const handleSelectMethod = useCallback((id: string) => {
        setPaymentMethod(id);
        setFieldErrors((prev) => {
            const next = { ...prev };
            delete next['payment_method'];
            return next;
        });
        const nextCore = (activeMethods.find((m) => m.id === id)?.core_payment_method ?? id);
        if (nextCore !== 'dbank' && nextCore !== 'vbank') {
            setRefundBankCode('');
            setRefundBankAccount('');
            setRefundBankHolder('');
        }
        if (nextCore !== 'dbank') {
            setCashReceiptRequested(false);
            setCashReceiptIdentifier('');
        }
    }, [activeMethods]);

    const handleCountryChange = useCallback((value: string) => {
        // 국가 변경 시 국내/해외 주소 필드 전부 초기화 + 재계산
        // (sirsoft-basic country Select change 정책 동일).
        setCountryCode(value);
        setZipcode('');
        setAddress('');
        setAddressDetail('');
        setAddressLine1('');
        setAddressLine2('');
        setIntlCity('');
        setIntlState('');
        setIntlPostalCode('');
        setRegion('');
        setSelectedAddressId(null);
        setFieldErrors({});
        void recompute({ country_code: value });
    }, [recompute]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (isSubmitting) return;
            const errs = validate();
            setFieldErrors(errs);
            if (Object.keys(errs).length > 0) return;
            if (!onSubmit) return;
            const memoFinal = shippingMemo === 'custom' ? shippingMemoCustom : shippingMemo;
            const refundComplete = refundBankCode.trim() && refundBankAccount.trim() && refundBankHolder.trim();
            onSubmit({
                temp_order_id: checkoutData?.temp_order_id ?? null,
                orderer: { name: ordererName, phone: ordererPhone, email: ordererEmail },
                shipping: {
                    recipient_name: recipientName,
                    recipient_phone: recipientPhone,
                    country_code: countryCode || 'KR',
                    region: region || undefined,
                    zipcode,
                    address,
                    address_detail: addressDetail,
                    address_line_1: addressLine1 || undefined,
                    address_line_2: addressLine2 || undefined,
                    intl_city: intlCity || undefined,
                    intl_state: intlState || undefined,
                    intl_postal_code: intlPostalCode || undefined,
                },
                payment_method: corePaymentMethod,
                shipping_memo: memoFinal,
                depositor_name: depositorName || ordererName,
                dbank:
                    corePaymentMethod === 'dbank' && selectedDbank
                        ? {
                              bank_code: selectedDbank.bank_code ?? '',
                              account_number: selectedDbank.account_number ?? '',
                              account_holder: selectedDbank.account_holder ?? '',
                          }
                        : null,
                refund_bank: refundComplete
                    ? {
                          bank_code: refundBankCode,
                          account_number: refundBankAccount,
                          holder: refundBankHolder,
                      }
                    : null,
                cash_receipt: cashReceiptRequested
                    ? { requested: true, type: cashReceiptType, identifier_type: cashReceiptIdentifierType, identifier: cashReceiptIdentifier }
                    : { requested: false },
                save_shipping_address: !!isLoggedIn && selectedAddressId === null ? saveAddress : false,
                expected_total_amount: finalAmount,
                guest_lookup_password: isLoggedIn ? null : guestPassword,
                guest_lookup_password_confirmation: isLoggedIn ? null : guestPasswordConfirm,
            });
        },
        [
            isSubmitting, validate, onSubmit, checkoutData,
            ordererName, ordererPhone, ordererEmail,
            recipientName, recipientPhone, countryCode, region,
            zipcode, address, addressDetail,
            addressLine1, addressLine2, intlCity, intlState, intlPostalCode,
            paymentMethod, corePaymentMethod, shippingMemo, shippingMemoCustom,
            depositorName, selectedDbank,
            refundBankCode, refundBankAccount, refundBankHolder,
            cashReceiptRequested, cashReceiptType, cashReceiptIdentifierType, cashReceiptIdentifier,
            isLoggedIn, selectedAddressId, saveAddress, finalAmount,
            guestPassword, guestPasswordConfirm,
        ],
    );

    const isEmptyCart = items.length === 0 && !checkoutLoading;
    const hasUnshippable = checkoutData?.has_unshippable_items === true;
    const unavailableItems = Array.isArray(checkoutData?.unavailable_items) ? checkoutData.unavailable_items : [];

    return (
        <Form
            data-testid="checkout-form"
            className="scm-checkout-form"
            onSubmit={handleSubmit}
        >
            {checkoutError ? (
                <Div
                    data-testid="checkout-error-banner"
                    role="alert"
                    className="scm-checkout-alert"
                >
                    {checkoutError}
                </Div>
            ) : null}

            {submitError ? (
                <Div
                    data-testid="checkout-submit-error-banner"
                    role="alert"
                    className="scm-checkout-alert"
                >
                    {submitError}
                </Div>
            ) : null}

            <Div className="scm-checkout-layout">
                {/* ---------------------------------------------------------
                    LEFT — form sections (editorial: heading + hairline)
                    --------------------------------------------------------- */}
                <Div className="scm-checkout-main">
                    {/* Orderer info */}
                    <section data-testid="checkout-section-orderer" className="scm-checkout-section">
                        <H3 className="scm-checkout-section-title">{ordererInfoTitle}</H3>
                        <Div className="scm-checkout-fields">
                            <FieldText
                                label={ordererNameLabel}
                                name="orderer_name"
                                value={ordererName}
                                onChange={setOrdererName}
                                placeholder={ordererNamePlaceholder}
                                error={fieldErrors['orderer.name']}
                                required
                            />
                            <FieldText
                                label={ordererPhoneLabel}
                                name="orderer_phone"
                                value={ordererPhone}
                                onChange={setOrdererPhone}
                                placeholder={ordererPhonePlaceholder}
                                error={fieldErrors['orderer.phone']}
                                type="tel"
                                required
                            />
                            <FieldText
                                className="scm-field-span-2"
                                label={ordererEmailLabel}
                                name="orderer_email"
                                value={ordererEmail}
                                onChange={setOrdererEmail}
                                placeholder={ordererEmailPlaceholder}
                                error={fieldErrors['orderer.email']}
                                type="email"
                                required={!isLoggedIn}
                            />
                        </Div>
                        {!isLoggedIn ? (
                            <Div
                                data-testid="checkout-guest-password"
                                className="scm-checkout-guest-block"
                            >
                                <Div className="scm-checkout-guest-head">
                                    <Span className="scm-checkout-guest-title">{guestLookupSectionTitle}</Span>
                                    <Span className="scm-checkout-guest-hint">{guestLookupHint}</Span>
                                </Div>
                                <Div className="scm-checkout-fields">
                                    <FieldText
                                        label={guestLookupPasswordLabel}
                                        name="guest_lookup_password"
                                        value={guestPassword}
                                        onChange={setGuestPassword}
                                        placeholder={guestLookupPasswordPlaceholder}
                                        error={fieldErrors['guest_lookup_password']}
                                        type="password"
                                        required
                                    />
                                    <FieldText
                                        label={guestLookupConfirmLabel}
                                        name="guest_lookup_password_confirmation"
                                        value={guestPasswordConfirm}
                                        onChange={setGuestPasswordConfirm}
                                        placeholder={guestLookupConfirmPlaceholder}
                                        error={fieldErrors['guest_lookup_password_confirmation']}
                                        type="password"
                                        required
                                    />
                                </Div>
                            </Div>
                        ) : null}
                    </section>

                    {/* Shipping info */}
                    <section data-testid="checkout-section-shipping" className="scm-checkout-section">
                        <Div className="scm-checkout-section-head">
                            <H3 className="scm-checkout-section-title">{shippingInfoTitle}</H3>
                            {isLoggedIn ? (
                                <Button
                                    type="button"
                                    onClick={onOpenAddressManager}
                                    data-testid="checkout-manage-addresses"
                                    data-scm-interactive
                                    className="scm-checkout-link-button"
                                >
                                    {manageAddressesLabel}
                                </Button>
                            ) : null}
                        </Div>

                        {/* 저장된 배송지 pills — 회원 전용(default _checkout_shipping 저장배송지 탭 계약) */}
                        {isLoggedIn && savedAddresses.length > 0 ? (
                            <Div
                                data-testid="checkout-saved-addresses"
                                className="scm-checkout-saved-addresses"
                                role="group"
                                aria-label={savedAddressTitle}
                            >
                                <Span className="scm-checkout-saved-title">{savedAddressTitle}</Span>
                                <Div className="scm-checkout-saved-list">
                                    {savedAddresses.map((addr) => {
                                        const label = [
                                            resolveLabel(addr.name, locale),
                                            addr.recipient_name,
                                            addr.zipcode || addr.address_line_1 || '',
                                            addr.address ?? addr.address_line_1 ?? '',
                                        ].filter(Boolean).join(' · ');
                                        return (
                                            <Button
                                                key={addr.id}
                                                type="button"
                                                onClick={() => applySavedAddress(addr)}
                                                data-testid={`checkout-saved-address-${addr.id}`}
                                                data-scm-interactive
                                                data-selected={selectedAddressId === addr.id ? 'true' : undefined}
                                                className="scm-checkout-saved-pill"
                                            >
                                                {addr.is_default ? (
                                                    <Span className="scm-checkout-saved-default">기본</Span>
                                                ) : null}
                                                <Span className="scm-checkout-saved-text">{label}</Span>
                                            </Button>
                                        );
                                    })}
                                </Div>
                            </Div>
                        ) : null}

                        {/* 주문자 정보와 동일 — default 는 비회원에도 노출 */}
                        <CheckboxField
                            data-testid="checkout-same-as-orderer"
                            name="same_as_orderer"
                            checked={sameAsOrderer}
                            onChange={handleSameAsOrdererChange}
                            label={sameAsOrdererLabel}
                        />

                        {/* 배송국가 — international_shipping_enabled 시(default 국가 Select 계약) */}
                        {internationalShippingEnabled && countryOptions.length > 0 ? (
                            <Div className="scm-checkout-memo">
                                <Label className="scm-checkout-label" htmlFor="scm-country_code">
                                    {countryLabel}
                                    <Span className="scm-checkout-required" aria-hidden="true">*</Span>
                                </Label>
                                <Select
                                    id="scm-country_code"
                                    name="country_code"
                                    className="scm-checkout-input"
                                    value={countryCode}
                                    onChange={(e) => handleCountryChange((e.target as HTMLSelectElement).value)}
                                    data-testid="checkout-shipping-country-select"
                                    data-scm-interactive
                                >
                                    {countryOptions.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {resolveLabel(c.name, locale) || c.code}
                                        </option>
                                    ))}
                                </Select>
                            </Div>
                        ) : null}

                        <Div className="scm-checkout-fields">
                            <FieldText
                                label={recipientNameLabel}
                                name="recipient_name"
                                value={recipientName}
                                onChange={setRecipientName}
                                placeholder={recipientNamePlaceholder}
                                error={fieldErrors['shipping.recipient_name']}
                                required
                            />
                            <FieldText
                                label={recipientPhoneLabel}
                                name="recipient_phone"
                                value={recipientPhone}
                                onChange={setRecipientPhone}
                                placeholder={recipientPhonePlaceholder}
                                error={fieldErrors['shipping.recipient_phone']}
                                type="tel"
                                required
                            />
                        </Div>

                        {/* 국내 주소 — 우편번호 + 주소 검색(daum extension_point) + 기본/상세 */}
                        {isKrCountry ? (
                            <>
                                <Div className="scm-checkout-fields">
                                    <Div
                                        data-testid="checkout-address-search-slot"
                                        className="scm-checkout-zip-row scm-field-span-2"
                                    >
                                        <FieldText
                                            className="scm-checkout-zip-field"
                                            label={zipcodeLabel}
                                            name="zipcode"
                                            value={zipcode}
                                            onChange={setZipcode}
                                            placeholder={zipcodePlaceholder}
                                            error={fieldErrors['shipping.zipcode']}
                                            required
                                        />
                                        {children}
                                    </Div>
                                    <FieldText
                                        className="scm-field-span-2"
                                        label={addressLabel}
                                        name="address"
                                        value={address}
                                        onChange={setAddress}
                                        placeholder={addressPlaceholder}
                                        error={fieldErrors['shipping.address']}
                                        required
                                    />
                                    <FieldText
                                        className="scm-field-span-2"
                                        label={addressDetailLabel}
                                        name="address_detail"
                                        value={addressDetail}
                                        onChange={setAddressDetail}
                                        placeholder={addressDetailPlaceholder}
                                    />
                                </Div>
                            </>
                        ) : (
                            /* 해외 주소 — address_line_1/2 + intl_city/state/postal_code */
                            <Div className="scm-checkout-fields">
                                <FieldText
                                    className="scm-field-span-2"
                                    label={intlAddressLabel}
                                    name="address_line_1"
                                    value={addressLine1}
                                    onChange={setAddressLine1}
                                    placeholder={intlAddress1Placeholder}
                                    error={fieldErrors['shipping.address_line_1']}
                                    required
                                />
                                <FieldText
                                    className="scm-field-span-2"
                                    label={intlAddress2Label}
                                    name="address_line_2"
                                    value={addressLine2}
                                    onChange={setAddressLine2}
                                    placeholder={intlAddress2Placeholder}
                                />
                                <FieldText
                                    label={intlCityLabel}
                                    name="intl_city"
                                    value={intlCity}
                                    onChange={setIntlCity}
                                    placeholder={intlCityPlaceholder}
                                    error={fieldErrors['shipping.intl_city']}
                                    required
                                />
                                <FieldText
                                    label={intlStateLabel}
                                    name="intl_state"
                                    value={intlState}
                                    onChange={setIntlState}
                                    placeholder={intlStatePlaceholder}
                                />
                                <FieldText
                                    label={intlPostalCodeLabel}
                                    name="intl_postal_code"
                                    value={intlPostalCode}
                                    onChange={setIntlPostalCode}
                                    placeholder={intlPostalCodePlaceholder}
                                    error={fieldErrors['shipping.intl_postal_code']}
                                    required
                                />
                            </Div>
                        )}

                        {/* Shipping memo */}
                        <Div className="scm-checkout-memo">
                            <Label className="scm-checkout-label" htmlFor="shipping_memo">
                                {memoLabel}
                            </Label>
                            <Select
                                id="shipping_memo"
                                name="shipping_memo"
                                className="scm-checkout-input"
                                value={shippingMemo}
                                onChange={(e) => onChangeMemo((e.target as HTMLSelectElement).value)}
                                data-scm-interactive
                            >
                                <option value="">{memoPlaceholder}</option>
                                <option value="door">문 앞에 두고 가주세요</option>
                                <option value="security">경비실에 맡겨주세요</option>
                                <option value="parcel_box">택배함에 넣어주세요</option>
                                <option value="call">배송 전 연락 부탁드립니다</option>
                                <option value="custom">{memoLabel} 직접 입력</option>
                            </Select>
                        </Div>
                        {shippingMemo === 'custom' ? (
                            <Textarea
                                name="shipping_memo_custom"
                                value={shippingMemoCustom}
                                onChange={(e) => setShippingMemoCustom((e.target as HTMLTextAreaElement).value)}
                                placeholder="배송 메모를 입력해 주세요"
                                rows={2}
                                data-scm-interactive
                                className="scm-checkout-input scm-checkout-memo-custom"
                            />
                        ) : null}

                        {/* 입력한 배송지를 저장합니다 — 회원 + 직접 입력(default 정책) */}
                        {isLoggedIn && selectedAddressId === null ? (
                            <CheckboxField
                                data-testid="checkout-save-address"
                                name="save_shipping_address"
                                checked={saveAddress}
                                onChange={setSaveAddress}
                                label={saveAddressLabel}
                            />
                        ) : null}
                    </section>

                    {/* 할인 · 쿠폰 — 회원 전용(default _checkout_discount: 쿠폰은 회원 발급) */}
                    {isLoggedIn ? (
                        <section data-testid="checkout-section-discount" className="scm-checkout-section">
                            <Div className="scm-checkout-section-head">
                                <H3 className="scm-checkout-section-title">{discountSectionTitle}</H3>
                                <Button
                                    type="button"
                                    onClick={onOpenCouponDownload}
                                    data-testid="checkout-coupon-download"
                                    data-scm-interactive
                                    className="scm-checkout-link-button"
                                >
                                    {couponDownloadLabel}
                                </Button>
                            </Div>
                            <Div className="scm-checkout-memo">
                                <Label className="scm-checkout-label" htmlFor="scm-order-coupon">
                                    {orderCouponLabel}
                                    {orderCoupons.length > 0 ? (
                                        <Span className="scm-checkout-coupon-count">
                                            {' '}({orderCoupons.length}{couponCountSuffixLabel})
                                        </Span>
                                    ) : null}
                                </Label>
                                <Select
                                    id="scm-order-coupon"
                                    name="order_coupon_issue_id"
                                    className="scm-checkout-input"
                                    value={orderCoupon}
                                    onChange={(e) => handleOrderCouponChange((e.target as HTMLSelectElement).value)}
                                    data-testid="checkout-order-coupon-select"
                                    data-scm-interactive
                                >
                                    <option value="">
                                        {orderCoupons.length > 0 ? couponSelectPlaceholder : couponNoAvailableLabel}
                                    </option>
                                    {orderCoupons.map((c) => (
                                        <option key={c.id} value={String(c.id)}>
                                            {couponOptionLabel(c)}
                                        </option>
                                    ))}
                                </Select>
                            </Div>
                            <Div className="scm-checkout-memo">
                                <Label className="scm-checkout-label" htmlFor="scm-shipping-coupon">
                                    {shippingCouponLabel}
                                    {shippingCoupons.length > 0 ? (
                                        <Span className="scm-checkout-coupon-count">
                                            {' '}({shippingCoupons.length}{couponCountSuffixLabel})
                                        </Span>
                                    ) : null}
                                </Label>
                                <Select
                                    id="scm-shipping-coupon"
                                    name="shipping_coupon_issue_id"
                                    className="scm-checkout-input"
                                    value={shippingCoupon}
                                    onChange={(e) => handleShippingCouponChange((e.target as HTMLSelectElement).value)}
                                    data-testid="checkout-shipping-coupon-select"
                                    data-scm-interactive
                                >
                                    <option value="">
                                        {shippingCoupons.length > 0 ? couponSelectPlaceholder : couponNoAvailableLabel}
                                    </option>
                                    {shippingCoupons.map((c) => (
                                        <option key={c.id} value={String(c.id)}>
                                            {couponOptionLabel(c)}
                                        </option>
                                    ))}
                                </Select>
                            </Div>
                            <Div className="scm-checkout-discount-code">
                                <FieldText
                                    label={discountCodeLabel}
                                    name="discount_code"
                                    value={discountCode}
                                    onChange={setDiscountCode}
                                    placeholder={discountCodePlaceholder}
                                />
                                <Button
                                    type="button"
                                    onClick={handleApplyDiscountCode}
                                    disabled={!discountCode.trim()}
                                    data-testid="checkout-discount-code-apply"
                                    data-scm-interactive
                                    className="scm-checkout-link-button scm-checkout-discount-apply"
                                >
                                    {discountCodeApplyLabel}
                                </Button>
                            </Div>
                        </section>
                    ) : null}

                    {/* 적립금 — 회원 + mileage.enabled (default _checkout_mileage 게이트 계약) */}
                    {mileageVisible ? (
                        <section data-testid="checkout-section-mileage" className="scm-checkout-section">
                            <Div className="scm-checkout-section-head">
                                <H3 className="scm-checkout-section-title">{mileageSectionTitle}</H3>
                                <Span className="scm-checkout-mileage-available">
                                    {mileageAvailableLabel}{' '}
                                    <Span className="scm-checkout-mileage-value">
                                        {(mileage?.available ?? 0).toLocaleString()}
                                    </Span>
                                </Span>
                            </Div>
                            {(mileage?.max_usable ?? 0) > 0 ? (
                                <P className="scm-checkout-mileage-max">
                                    최대 {(mileage?.max_usable ?? 0).toLocaleString()}원까지 사용할 수 있습니다.
                                </P>
                            ) : null}
                            <Div className="scm-checkout-mileage-controls">
                                <Input
                                    type="number"
                                    name="use_points"
                                    id="scm-use-points"
                                    min={0}
                                    max={mileage?.max_usable ?? 0}
                                    value={usePoints}
                                    onChange={(e) => setUsePoints((e.target as HTMLInputElement).value)}
                                    placeholder={mileageInputPlaceholder}
                                    disabled={(mileage?.available ?? 0) === 0}
                                    data-testid="checkout-use-points-input"
                                    data-scm-interactive
                                    className="scm-checkout-input scm-checkout-mileage-input"
                                />
                                <Button
                                    type="button"
                                    onClick={() => setUsePoints(String(mileage?.max_usable ?? 0))}
                                    disabled={(mileage?.max_usable ?? 0) === 0}
                                    data-testid="checkout-use-points-all"
                                    data-scm-interactive
                                    className="scm-checkout-link-button"
                                >
                                    {mileageUseAllLabel}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleApplyMileage(usePoints)}
                                    disabled={(mileage?.max_usable ?? 0) === 0}
                                    data-testid="checkout-use-points-apply"
                                    data-scm-interactive
                                    className="scm-checkout-link-button scm-checkout-mileage-apply"
                                >
                                    {mileageApplyLabel}
                                </Button>
                            </Div>
                        </section>
                    ) : null}

                    {/* Payment methods */}
                    <section data-testid="checkout-section-payment" className="scm-checkout-section">
                        <H3 className="scm-checkout-section-title">{paymentMethodTitle}</H3>
                        {activeMethods.length === 0 ? (
                            <Div
                                data-testid="checkout-empty-methods"
                                className="scm-checkout-methods-empty"
                            >
                                <P className="scm-checkout-methods-empty-title">{emptyMethodsTitle}</P>
                                <P className="scm-checkout-methods-empty-message">{emptyMethodsMessage}</P>
                            </Div>
                        ) : (
                            <Div
                                className="scm-checkout-methods"
                                role="radiogroup"
                                aria-label={paymentMethodTitle}
                            >
                                {activeMethods.map((m) => {
                                    const selected = paymentMethod === m.id;
                                    const mCore = m.core_payment_method ?? m.id;
                                    return (
                                        <Div
                                            key={m.id}
                                            className="scm-checkout-method"
                                            data-selected={selected ? 'true' : undefined}
                                            data-testid={`checkout-method-wrap-${m.id}`}
                                        >
                                            <Button
                                                type="button"
                                                role="radio"
                                                aria-checked={selected}
                                                onClick={() => handleSelectMethod(m.id)}
                                                data-testid={`checkout-payment-method-${m.id}`}
                                                data-scm-interactive
                                                className="scm-checkout-method-head"
                                            >
                                                <Span className="scm-checkout-method-radio" aria-hidden="true" />
                                                <Span className="scm-checkout-method-body">
                                                    <Span className="scm-checkout-method-name">{labelPayment(m)}</Span>
                                                    {m._cached_description ? (
                                                        <Span className="scm-checkout-method-desc">
                                                            {resolveLabel(m._cached_description, locale)}
                                                        </Span>
                                                    ) : null}
                                                </Span>
                                            </Button>
                                            {selected ? (
                                                <Div
                                                    data-testid={
                                                        mCore === 'dbank'
                                                            ? 'checkout-dbank-detail'
                                                            : `checkout-method-detail-${m.id}`
                                                    }
                                                    className="scm-checkout-method-detail"
                                                >
                                                    {/* 무통장입금(dbank) — 입금 계좌 라디오 선택(default selectedDbank 계약) */}
                                                    {mCore === 'dbank' ? (
                                                        <>
                                                            {bankAccounts.length > 0 ? (
                                                                <Div className="scm-checkout-bank-accounts">
                                                                    <P className="scm-checkout-bank-title">{bankAccountsTitle}</P>
                                                                    <Div
                                                                        className="scm-checkout-bank-list"
                                                                        role="radiogroup"
                                                                        aria-label={bankSelectLabel}
                                                                    >
                                                                        {bankAccounts.map((account, i) => (
                                                                            <Label
                                                                                key={account.id ?? i}
                                                                                className="scm-checkout-bank-option"
                                                                            >
                                                                                <Input
                                                                                    type="radio"
                                                                                    name="selected_dbank"
                                                                                    checked={selectedDbank?.id === account.id}
                                                                                    onChange={() => setSelectedDbank(account)}
                                                                                    data-testid={`checkout-dbank-account-${account.id ?? i}`}
                                                                                    data-scm-interactive
                                                                                    className="scm-checkout-radio"
                                                                                />
                                                                                <Span className="scm-checkout-bank-value">
                                                                                    {resolveLabel(account.bank_name, locale) || (account.bank_code ?? '')}
                                                                                    {' '}{account.account_number ?? ''}
                                                                                    {account.account_holder ? ` (${account.account_holder})` : ''}
                                                                                </Span>
                                                                            </Label>
                                                                        ))}
                                                                    </Div>
                                                                    {fieldErrors['dbank.bank_code'] ? (
                                                                        <Span role="alert" className="scm-checkout-field-error">
                                                                            {fieldErrors['dbank.bank_code']}
                                                                        </Span>
                                                                    ) : null}
                                                                </Div>
                                                            ) : null}
                                                            {/* 현금영수증 — module 계약(dbank 전용, provider 설정 시) */}
                                                            {cashReceiptProvider ? (
                                                                <CashReceiptFields
                                                                    requested={cashReceiptRequested}
                                                                    onRequestedChange={(checked) => {
                                                                        setCashReceiptRequested(checked);
                                                                        if (checked && !cashReceiptIdentifier) {
                                                                            setCashReceiptIdentifierType('phone');
                                                                        }
                                                                    }}
                                                                    type={cashReceiptType}
                                                                    onTypeChange={(t) => {
                                                                        setCashReceiptType(t);
                                                                        // 소득공제는 사업자번호를 쓸 수 없음(default M5 규칙)
                                                                        if (t === 'income' && cashReceiptIdentifierType === 'business') {
                                                                            setCashReceiptIdentifierType('phone');
                                                                        }
                                                                    }}
                                                                    identifierType={cashReceiptIdentifierType}
                                                                    onIdentifierTypeChange={setCashReceiptIdentifierType}
                                                                    identifier={cashReceiptIdentifier}
                                                                    onIdentifierChange={setCashReceiptIdentifier}
                                                                    error={fieldErrors['cash_receipt_identifier']}
                                                                    labels={{
                                                                        request: cashReceiptRequestLabel,
                                                                        purpose: cashReceiptPurposeLabel,
                                                                        income: cashReceiptIncomeLabel,
                                                                        expense: cashReceiptExpenseLabel,
                                                                        identifierType: cashReceiptIdentifierTypeLabel,
                                                                        identifier: cashReceiptIdentifierLabel,
                                                                        identifierPlaceholder: cashReceiptIdentifierPlaceholder,
                                                                        phone: cashReceiptIdentifierPhoneLabel,
                                                                        card: cashReceiptIdentifierCardLabel,
                                                                        business: cashReceiptIdentifierBusinessLabel,
                                                                    }}
                                                                />
                                                            ) : null}
                                                        </>
                                                    ) : null}
                                                    {/* 입금자명 — vbank/dbank 공통(required_if 계약) */}
                                                    {(mCore === 'dbank' || mCore === 'vbank') ? (
                                                        <FieldText
                                                            label={depositorNameLabel}
                                                            name="depositor_name"
                                                            value={depositorName}
                                                            onChange={(v) => {
                                                                userTouchedRef.current = true;
                                                                setDepositorName(v);
                                                            }}
                                                            placeholder={depositorNamePlaceholder}
                                                            error={fieldErrors['depositor_name']}
                                                            required
                                                        />
                                                    ) : null}
                                                    {/* 환불 계좌 — vbank/dbank(all-or-none) */}
                                                    {mCore === 'dbank' || mCore === 'vbank' ? (
                                                        <Div className="scm-checkout-refund-bank" data-testid="checkout-refund-bank">
                                                            <P className="scm-checkout-bank-title">{refundBankTitle}</P>
                                                            <Div className="scm-checkout-fields">
                                                                {banksList.length > 0 ? (
                                                                    <Div className="scm-field">
                                                                        <Label className="scm-checkout-label" htmlFor="scm-refund-bank-code">
                                                                            {refundBankCodeLabel}
                                                                        </Label>
                                                                        <Select
                                                                            id="scm-refund-bank-code"
                                                                            name="refund_bank_code"
                                                                            className="scm-checkout-input"
                                                                            value={refundBankCode}
                                                                            onChange={(e) => setRefundBankCode((e.target as HTMLSelectElement).value)}
                                                                            data-testid="checkout-refund-bank-code"
                                                                            data-scm-interactive
                                                                        >
                                                                            <option value="">{refundBankCodeLabel}</option>
                                                                            {banksList.map((b) => (
                                                                                <option key={b.code} value={b.code ?? ''}>
                                                                                    {resolveLabel(b.name, locale) || b.code}
                                                                                </option>
                                                                            ))}
                                                                        </Select>
                                                                    </Div>
                                                                ) : null}
                                                                <FieldText
                                                                    label={refundBankAccountLabel}
                                                                    name="refund_bank_account"
                                                                    value={refundBankAccount}
                                                                    onChange={setRefundBankAccount}
                                                                    error={fieldErrors['refund_bank']}
                                                                    type="tel"
                                                                />
                                                                <FieldText
                                                                    label={refundBankHolderLabel}
                                                                    name="refund_bank_holder"
                                                                    value={refundBankHolder}
                                                                    onChange={setRefundBankHolder}
                                                                    error={fieldErrors['refund_bank']}
                                                                />
                                                            </Div>
                                                        </Div>
                                                    ) : null}
                                                    {mCore === 'dbank' || mCore === 'vbank' ? (
                                                        <P className="scm-checkout-method-helper">
                                                            {mCore === 'vbank' ? vbankHelperLabel : dbankHelperLabel}
                                                            {typeof autoCancelDays === 'number' && autoCancelDays > 0
                                                                ? ` (입금 기한 ${autoCancelDays}일)`
                                                                : ''}
                                                        </P>
                                                    ) : null}
                                                </Div>
                                            ) : null}
                                        </Div>
                                    );
                                })}
                            </Div>
                        )}
                    </section>
                </Div>

                {/* ---------------------------------------------------------
                    RIGHT — order summary card (items + amounts + consent + CTA)
                    --------------------------------------------------------- */}
                <Div className="scm-checkout-aside">
                    <Div
                        data-testid="checkout-section-summary"
                        className="scm-checkout-summary"
                    >
                        <H3 className="scm-checkout-summary-title">{summaryTitle}</H3>

                        {hasUnshippable || unavailableItems.length > 0 ? (
                            <Div
                                data-testid="checkout-unavailable-banner"
                                role="alert"
                                className="scm-checkout-alert"
                            >
                                <P className="scm-checkout-unavailable-title">{unavailableTitle}</P>
                                <P className="scm-checkout-unavailable-message">{unavailableMessage}</P>
                            </Div>
                        ) : null}

                        {items.length > 0 ? (
                            <ul
                                className="scm-checkout-summary-items"
                                data-testid="checkout-summary-items"
                            >
                                {items.map((item: CheckoutItem, idx: number) => {
                                    const name = typeof item.product?.name === 'string'
                                        ? item.product.name
                                        : resolveLabel(item.product?.name, locale);
                                    const optionName = resolveLabel(
                                        (item.product_option?.option_name_localized
                                            ?? item.product_option?.option_name
                                            ?? item.option?.name) as string | string[] | Record<string, string> | null | undefined,
                                        locale,
                                    );
                                    const qty = item.quantity ?? 1;
                                    const optionId = String(item.product_option_id ?? idx);
                                    const itemCouponState = itemCoupons[optionId] ?? ['', ''];
                                    const itemCouponsAvailable = item.available_coupons ?? [];
                                    const disabledIds = item.disabled_coupon_ids ?? [];
                                    const { src: thumbSrc } = resolveStillLifeThumb({
                                        id: item.product?.id ?? item.product_id,
                                        product_code: item.product?.product_code ?? item.product?.code ?? null,
                                        thumbnail_url: item.product?.thumbnail_url ?? null,
                                    });
                                    return (
                                        <li
                                            key={item.product_option_id ?? idx}
                                            data-testid="checkout-item-row"
                                            className="scm-checkout-summary-item"
                                        >
                                            <Div className="scm-checkout-summary-item-thumb">
                                                <Img
                                                    src={thumbSrc}
                                                    alt={name}
                                                    loading="lazy"
                                                />
                                            </Div>
                                            <Div className="scm-checkout-summary-item-info">
                                                <Span className="scm-checkout-summary-item-name">{name}</Span>
                                                <Span className="scm-checkout-summary-item-meta">
                                                    {optionName ? `${optionName} · ` : ''}
                                                    {quantityLabel} {qty}
                                                </Span>
                                                {/* 추가옵션 — group/name/custom_text/price (CheckoutItemResource 계약) */}
                                                {(item.additional_options ?? []).length > 0 ? (
                                                    <Span
                                                        className="scm-checkout-summary-item-addopts"
                                                        data-testid="checkout-item-additional-options"
                                                    >
                                                        {(item.additional_options ?? []).map((ao, aoIdx) => {
                                                            const aoLabel = [
                                                                resolveLabel(ao.group_name, locale),
                                                                resolveLabel(ao.name, locale),
                                                                ao.custom_text,
                                                            ].filter(Boolean).join(':');
                                                            return (
                                                                <Span
                                                                    key={aoIdx}
                                                                    className="scm-checkout-summary-item-addopt"
                                                                >
                                                                    + {aoLabel}
                                                                    {ao.price_adjustment ? ` (+${ao.price_adjustment.toLocaleString()}원)` : ''}
                                                                </Span>
                                                            );
                                                        })}
                                                    </Span>
                                                ) : null}
                                                {/* 상품쿠폰 — 상품별 최대 2개(default _checkout_items item_coupon 계약) */}
                                                {isLoggedIn && itemCouponsAvailable.length > 0 ? (
                                                    <Div className="scm-checkout-item-coupons">
                                                        <Select
                                                            name="item_coupon_1"
                                                            aria-label="상품쿠폰 1"
                                                            value={itemCouponState[0]}
                                                            onChange={(e) => handleItemCouponChange(optionId, 0, (e.target as HTMLSelectElement).value)}
                                                            data-testid="checkout-item-coupon-1"
                                                            data-scm-interactive
                                                            className="scm-checkout-input scm-checkout-item-coupon-select"
                                                        >
                                                            <option value="">
                                                                {itemCouponsAvailable.length > 0 ? couponSelectPlaceholder : couponNoAvailableLabel}
                                                            </option>
                                                            {itemCouponsAvailable.map((c) => {
                                                                const disabled =
                                                                    disabledIds.includes(c.id as string | number) ||
                                                                    (String(itemCouponState[1]) === String(c.id));
                                                                return (
                                                                    <option key={c.id} value={String(c.id)} disabled={disabled}>
                                                                        {couponOptionLabel(c)}
                                                                        {disabledIds.includes(c.id as string | number) ? ` [${couponAlreadyUsedLabel}]` : ''}
                                                                    </option>
                                                                );
                                                            })}
                                                        </Select>
                                                        {itemCouponState[0] ? (
                                                            <Select
                                                                name="item_coupon_2"
                                                                aria-label="상품쿠폰 2"
                                                                value={itemCouponState[1]}
                                                                onChange={(e) => handleItemCouponChange(optionId, 1, (e.target as HTMLSelectElement).value)}
                                                                data-testid="checkout-item-coupon-2"
                                                                data-scm-interactive
                                                                className="scm-checkout-input scm-checkout-item-coupon-select"
                                                            >
                                                                <option value="">{couponSelectPlaceholder}</option>
                                                                {itemCouponsAvailable.map((c) => {
                                                                    const disabled =
                                                                        disabledIds.includes(c.id as string | number) ||
                                                                        (String(itemCouponState[0]) === String(c.id));
                                                                    return (
                                                                        <option key={c.id} value={String(c.id)} disabled={disabled}>
                                                                            {couponOptionLabel(c)}
                                                                            {disabledIds.includes(c.id as string | number) ? ` [${couponAlreadyUsedLabel}]` : ''}
                                                                        </option>
                                                                    );
                                                                })}
                                                            </Select>
                                                        ) : null}
                                                    </Div>
                                                ) : null}
                                            </Div>
                                            <Div className="scm-checkout-summary-item-right">
                                                <Span className="scm-checkout-summary-item-price">
                                                    {item.subtotal_formatted ?? ''}
                                                </Span>
                                                {typeof item.product_coupon_discount_amount === 'number' && item.product_coupon_discount_amount > 0 ? (
                                                    <Span className="scm-checkout-summary-item-discount">
                                                        {discountLabel} -{item.product_coupon_discount_formatted ?? ''}
                                                    </Span>
                                                ) : null}
                                            </Div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : null}

                        <Div className="scm-checkout-amounts">
                            <SummaryRow label={subtotalLabel} value={subtotalText} />
                            {discountText ? (
                                <SummaryRow label={discountLabel} value={`-${discountText}`} tone="discount" />
                            ) : null}
                            {pointsUsedText ? (
                                <SummaryRow
                                    label={pointsUsedLabel}
                                    value={`-${pointsUsedText}`}
                                    tone="discount"
                                    testId="checkout-summary-points-used"
                                />
                            ) : null}
                            {shippingCouponDiscountText ? (
                                <SummaryRow
                                    label={shippingCouponDiscountLabel}
                                    value={`-${shippingCouponDiscountText}`}
                                    tone="discount"
                                    testId="checkout-summary-shipping-coupon"
                                />
                            ) : null}
                            <SummaryRow label={shippingFeeLabel} value={shippingText} />
                            <Div className="scm-checkout-total-row">
                                <Span className="scm-checkout-total-label">{totalAmountLabel}</Span>
                                <Span
                                    data-testid="checkout-summary-final"
                                    className="scm-checkout-total-value"
                                >
                                    {finalText}
                                </Span>
                            </Div>
                        </Div>

                        <Div className="scm-checkout-submit-block">
                            <P className="scm-checkout-consent">{termsAgreement}</P>
                            {fieldErrors['payment_method'] ? (
                                <P role="alert" className="scm-checkout-field-error scm-checkout-consent-error">
                                    {fieldErrors['payment_method']}
                                </P>
                            ) : null}
                            <Button
                                type="submit"
                                disabled={isSubmitting || isEmptyCart || activeMethods.length === 0 || hasUnshippable}
                                data-testid="checkout-pay-button"
                                data-scm-interactive
                                className="scm-checkout-cta"
                            >
                                {isSubmitting ? submittingLabel : `${finalText} ${payButtonLabel}`}
                            </Button>
                        </Div>
                    </Div>
                </Div>
            </Div>
        </Form>
    );
}

function FieldText(props: {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    type?: string;
    required?: boolean;
    className?: string;
}): React.ReactElement {
    const { label, name, value, onChange, placeholder, error, type = 'text', required, className } = props;
    return (
        <Div className={className ? `scm-field ${className}` : 'scm-field'}>
            <Label className="scm-checkout-label" htmlFor={`scm-${name}`}>
                {label}
                {required ? <Span className="scm-checkout-required" aria-hidden="true">*</Span> : null}
            </Label>
            <Input
                id={`scm-${name}`}
                name={name}
                type={type}
                value={value}
                placeholder={placeholder ?? ''}
                onChange={(e) => onChange((e.target as HTMLInputElement).value)}
                required={required}
                data-scm-interactive
                className={error ? 'scm-checkout-input scm-checkout-input-error' : 'scm-checkout-input'}
            />
            {error ? (
                <Span role="alert" className="scm-checkout-field-error">
                    {error}
                </Span>
            ) : null}
        </Div>
    );
}

function CheckboxField(props: {
    label: string;
    name: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    testId?: string;
    className?: string;
}): React.ReactElement {
    const { label, name, checked, onChange, testId, className } = props;
    return (
        <Div className={className ? `scm-checkout-checkbox ${className}` : 'scm-checkout-checkbox'}>
            <Label className="scm-checkout-checkbox-label" htmlFor={`scm-checkout-${name}`}>
                <Input
                    type="checkbox"
                    id={`scm-checkout-${name}`}
                    name={name}
                    checked={checked}
                    onChange={(e) => onChange((e.target as HTMLInputElement).checked)}
                    data-testid={testId ?? `checkout-${name.replace(/_/g, '-')}`}
                    data-scm-interactive
                    className="scm-checkout-checkbox-input"
                />
                <Span className="scm-checkout-checkbox-text">{label}</Span>
            </Label>
        </Div>
    );
}

/** 현금영수증 신청 폼 — module checkout_cash_receipt.json 계약의 Still Form React 이식.
 *  동일 필드(cash_receipt_requested/type/identifier_type/identifier)를 주문 payload 에 실는다. */
function CashReceiptFields(props: {
    requested: boolean;
    onRequestedChange: (checked: boolean) => void;
    type: string;
    onTypeChange: (type: string) => void;
    identifierType: string;
    onIdentifierTypeChange: (type: string) => void;
    identifier: string;
    onIdentifierChange: (value: string) => void;
    error?: string;
    labels: {
        request: string;
        purpose: string;
        income: string;
        expense: string;
        identifierType: string;
        identifier: string;
        identifierPlaceholder: string;
        phone: string;
        card: string;
        business: string;
    };
}): React.ReactElement {
    const { requested, onRequestedChange, type, onTypeChange, identifierType, onIdentifierTypeChange, identifier, onIdentifierChange, error, labels } = props;
    return (
        <Div data-testid="checkout-cash-receipt" className="scm-checkout-cash-receipt">
            <Div className="scm-checkout-cash-receipt-head">
                <Label className="scm-checkout-checkbox-label" htmlFor="scm-cash-receipt-requested">
                    <Input
                        type="checkbox"
                        id="scm-cash-receipt-requested"
                        name="cash_receipt_requested"
                        checked={requested}
                        onChange={(e) => onRequestedChange((e.target as HTMLInputElement).checked)}
                        data-testid="checkout-cash-receipt-requested"
                        data-scm-interactive
                        className="scm-checkout-checkbox-input"
                    />
                    <Span className="scm-checkout-checkbox-text">{labels.request}</Span>
                </Label>
            </Div>
            {requested ? (
                <Div className="scm-checkout-cash-receipt-fields" data-testid="checkout-cash-receipt-fields">
                    <Div className="scm-checkout-cash-receipt-purpose" role="radiogroup" aria-label={labels.purpose}>
                        <Span className="scm-checkout-label">{labels.purpose}</Span>
                        <Label className="scm-checkout-radio-label">
                            <Input
                                type="radio"
                                name="cash_receipt_type"
                                value="income"
                                checked={type === 'income'}
                                onChange={() => onTypeChange('income')}
                                data-testid="checkout-cash-receipt-income"
                                data-scm-interactive
                                className="scm-checkout-radio"
                            />
                            {labels.income}
                        </Label>
                        <Label className="scm-checkout-radio-label">
                            <Input
                                type="radio"
                                name="cash_receipt_type"
                                value="expense"
                                checked={type === 'expense'}
                                onChange={() => onTypeChange('expense')}
                                data-testid="checkout-cash-receipt-expense"
                                data-scm-interactive
                                className="scm-checkout-radio"
                            />
                            {labels.expense}
                        </Label>
                    </Div>
                    <Div className="scm-checkout-cash-receipt-identifier">
                        <Label className="scm-checkout-label" htmlFor="scm-cash-receipt-identifier-type">
                            {labels.identifierType}
                        </Label>
                        <Select
                            id="scm-cash-receipt-identifier-type"
                            name="cash_receipt_identifier_type"
                            className="scm-checkout-input"
                            value={identifierType}
                            onChange={(e) => onIdentifierTypeChange((e.target as HTMLSelectElement).value)}
                            data-testid="checkout-cash-receipt-identifier-type"
                            data-scm-interactive
                        >
                            {type === 'expense' ? (
                                <option value="business">{labels.business}</option>
                            ) : (
                                <>
                                    <option value="phone">{labels.phone}</option>
                                    <option value="card">{labels.card}</option>
                                </>
                            )}
                        </Select>
                        <Label className="scm-checkout-label" htmlFor="scm-cash-receipt-identifier">
                            {labels.identifier}
                        </Label>
                        <Input
                            id="scm-cash-receipt-identifier"
                            name="cash_receipt_identifier"
                            type="text"
                            value={identifier}
                            onChange={(e) => onIdentifierChange((e.target as HTMLInputElement).value)}
                            placeholder={
                                identifierType === 'business'
                                    ? labels.business
                                    : identifierType === 'card'
                                        ? labels.card
                                        : labels.identifierPlaceholder
                            }
                            data-testid="checkout-cash-receipt-identifier"
                            data-scm-interactive
                            className={error ? 'scm-checkout-input scm-checkout-input-error' : 'scm-checkout-input'}
                        />
                        {error ? (
                            <Span role="alert" className="scm-checkout-field-error">
                                {error}
                            </Span>
                        ) : null}
                    </Div>
                </Div>
            ) : null}
        </Div>
    );
}

function SummaryRow(props: { label: string; value: string; tone?: 'discount' | 'normal'; testId?: string }): React.ReactElement {
    const tone = props.tone ?? 'normal';
    return (
        <Div className="scm-checkout-amount-row" data-testid={props.testId}>
            <Span className="scm-checkout-amount-label">{props.label}</Span>
            <Span className={tone === 'discount' ? 'scm-checkout-amount-value scm-checkout-amount-discount' : 'scm-checkout-amount-value'}>
                {props.value}
            </Span>
        </Div>
    );
}

export default CheckoutForm;
