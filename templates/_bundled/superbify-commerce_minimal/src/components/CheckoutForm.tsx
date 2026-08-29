import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Button,
    Div,
    Form,
    H2,
    H3,
    Input,
    Label,
    P,
    Select,
    Span,
    Textarea,
} from './basic';

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
    multi_currency_subtotal?: Record<string, { formatted?: string }>;
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
    paymentSettings?: { order_settings?: { payment_methods?: CheckoutPaymentMethod[] } } | null;
    /** Unwrapped shipping settings (response.data.data) */
    shippingSettings?: { shipping?: { default_country?: string; international_shipping_enabled?: boolean } } | null;
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
}

export interface CheckoutSubmitPayload {
    temp_order_id?: string | number | null;
    orderer: { name: string; phone: string; email: string };
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

// CSS class tokens are exported via the template's stylesheet — see CheckoutForm styles in design-tokens.css
const labelBaseClass = 'scm-checkout-label';

export function CheckoutForm(props: CheckoutFormProps): React.ReactElement {
    const {
        checkoutData,
        checkoutLoading,
        checkoutError,
        paymentSettings,
        title = '결제',
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
        shippingInfoTitle = '배송지',
        recipientNameLabel = '받는 분',
        recipientNamePlaceholder = '받는 분 이름',
        recipientPhoneLabel = '연락처',
        recipientPhonePlaceholder = '010-0000-0000',
        zipcodeLabel = '우편번호',
        zipcodePlaceholder = '우편번호',
        addressLabel = '주소',
        addressPlaceholder = '기본 주소',
        addressDetailLabel = '상세 주소',
        addressDetailPlaceholder = '동/호수 등',
        memoLabel = '배송 메모',
        memoPlaceholder = '배송 메모를 선택하세요',
        paymentMethodTitle = '결제 수단',
        depositorNameLabel = '입금자명',
        depositorNamePlaceholder = '입금자명',
        termsAgreement = '결제 진행 시 주문 내용 확인 및 결제에 동의합니다.',
        payButtonLabel = '결제하기',
        backToCartLabel = '장바구니로 돌아가기',
        submittingLabel = '처리 중…',
        resolvePaymentLabel,
        onNavigateBack,
        onSubmit,
        isSubmitting = false,
        submitError,
        emptyMethodsTitle = '결제 수단이 없습니다',
        emptyMethodsMessage = '관리자에서 결제 설정을 확인해 주세요.',
        isLoggedIn = false,
    } = props;

    // Form state
    const [ordererName, setOrdererName] = useState('');
    const [ordererPhone, setOrdererPhone] = useState('');
    const [ordererEmail, setOrdererEmail] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [address, setAddress] = useState('');
    const [addressDetail, setAddressDetail] = useState('');
    const [shippingMemo, setShippingMemo] = useState('');
    const [shippingMemoCustom, setShippingMemoCustom] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [depositorName, setDepositorName] = useState('');
    const [guestPassword, setGuestPassword] = useState('');
    const [guestPasswordConfirm, setGuestPasswordConfirm] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const userTouchedRef = useRef(false);

    const paymentMethods = useMemo<CheckoutPaymentMethod[]>(
        () => paymentSettings?.order_settings?.payment_methods ?? [],
        [paymentSettings],
    );
    const activeMethods = useMemo(
        () => paymentMethods.filter((m) => m?.is_active),
        [paymentMethods],
    );

    // Pick a default payment method on first load (active methods).
    useEffect(() => {
        if (!paymentMethod && activeMethods.length > 0) {
            setPaymentMethod(activeMethods[0].id);
        }
    }, [activeMethods, paymentMethod]);

    // Auto-fill depositor name from orderer when empty.
    useEffect(() => {
        if (!userTouchedRef.current) {
            setDepositorName(ordererName);
        }
    }, [ordererName]);

    const summary = checkoutData?.calculation?.summary;
    const items = checkoutData?.calculation?.items ?? [];
    const finalAmount: number = useMemo(() => {
        const v = summary?.final_amount;
        if (typeof v === 'number') return v;
        if (typeof v === 'string') return parseInt(v, 10) || 0;
        return 0;
    }, [summary]);

    const subtotalText = summary?.subtotal_formatted ?? '—';
    const shippingText = summary?.total_shipping_formatted ?? '0원';
    const discountText = summary?.total_discount_formatted ?? null;
    const finalText = summary?.final_amount_formatted ?? '—';

    const labelPayment = useCallback(
        (m: CheckoutPaymentMethod) => {
            if (resolvePaymentLabel) return resolvePaymentLabel(m);
            return resolveLabel(m._cached_name) || m.id;
        },
        [resolvePaymentLabel],
    );

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
        if (!zipcode.trim()) errs['shipping.zipcode'] = '우편번호를 입력해 주세요.';
        if (!address.trim()) errs['shipping.address'] = '주소를 입력해 주세요.';
        if (!paymentMethod) errs['payment_method'] = '결제 수단을 선택해 주세요.';
        if (paymentMethod === 'dbank' && !depositorName.trim()) {
            errs['depositor_name'] = '입금자명을 입력해 주세요.';
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
        ordererName,
        ordererPhone,
        ordererEmail,
        recipientName,
        recipientPhone,
        zipcode,
        address,
        paymentMethod,
        depositorName,
        guestPassword,
        guestPasswordConfirm,
        isLoggedIn,
    ]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (isSubmitting) return;
            const errs = validate();
            setFieldErrors(errs);
            if (Object.keys(errs).length > 0) return;
            if (!onSubmit) return;
            const memoFinal = shippingMemo === 'custom' ? shippingMemoCustom : shippingMemo;
            onSubmit({
                temp_order_id: checkoutData?.temp_order_id ?? null,
                orderer: { name: ordererName, phone: ordererPhone, email: ordererEmail },
                shipping: {
                    recipient_name: recipientName,
                    recipient_phone: recipientPhone,
                    country_code: 'KR',
                    zipcode,
                    address,
                    address_detail: addressDetail,
                },
                payment_method: paymentMethod,
                shipping_memo: memoFinal,
                shipping_memo_custom: shippingMemoCustom,
                depositor_name: depositorName || ordererName,
                expected_total_amount: finalAmount,
                guest_lookup_password: isLoggedIn ? null : guestPassword,
                guest_lookup_password_confirmation: isLoggedIn ? null : guestPasswordConfirm,
            });
        },
        [
            isSubmitting,
            validate,
            onSubmit,
            checkoutData,
            ordererName,
            ordererPhone,
            ordererEmail,
            recipientName,
            recipientPhone,
            zipcode,
            address,
            addressDetail,
            paymentMethod,
            shippingMemo,
            shippingMemoCustom,
            depositorName,
            finalAmount,
            isLoggedIn,
            guestPassword,
            guestPasswordConfirm,
        ],
    );

    const isEmptyCart = (checkoutData?.items?.length ?? 0) === 0 && !checkoutLoading;

    return (
        <Form
            data-testid="checkout-form"
            onSubmit={handleSubmit}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--scm-spacing-lg, 1.5rem)',
            }}
        >
            {checkoutError ? (
                <Div
                    data-testid="checkout-error-banner"
                    role="alert"
                    style={{
                        padding: 'var(--scm-spacing-md, 1rem)',
                        border: '1px solid #C8443B',
                        backgroundColor: '#FBEFEC',
                        color: '#8A2B25',
                        borderRadius: 'var(--scm-radius, 8px)',
                        fontSize: '0.875rem',
                    }}
                >
                    {checkoutError}
                </Div>
            ) : null}

            {submitError ? (
                <Div
                    data-testid="checkout-submit-error-banner"
                    role="alert"
                    style={{
                        padding: 'var(--scm-spacing-md, 1rem)',
                        border: '1px solid #C8443B',
                        backgroundColor: '#FBEFEC',
                        color: '#8A2B25',
                        borderRadius: 'var(--scm-radius, 8px)',
                        fontSize: '0.875rem',
                    }}
                >
                    {submitError}
                </Div>
            ) : null}

            {/* Header row: title + back to cart */}
            <Div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--scm-spacing-md, 1rem)',
                }}
            >
                <H2
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        margin: 0,
                        color: 'var(--scm-text-primary, #26221E)',
                    }}
                >
                    {title}
                </H2>
                <Button
                    type="button"
                    onClick={onNavigateBack}
                    data-scm-interactive
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--scm-charcoal, #26221E)',
                        color: 'var(--scm-text-primary, #26221E)',
                        padding: '0.5rem 0.875rem',
                        borderRadius: 'var(--scm-radius, 8px)',
                        fontFamily: 'var(--scm-font-body, system-ui)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                    }}
                >
                    {backToCartLabel}
                </Button>
            </Div>

            {/* Orderer info */}
            <section data-testid="checkout-section-orderer">
                <H3 className={labelBaseClass} style={sectionTitleStyle}>
                    {ordererInfoTitle}
                </H3>
                <Div style={fieldGridStyle}>
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
                        style={{
                            marginTop: 'var(--scm-spacing-md, 1rem)',
                            padding: 'var(--scm-spacing-md, 1rem)',
                            backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                            border: '1px solid var(--scm-line, #E4DCCE)',
                            borderRadius: 'var(--scm-radius, 8px)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--scm-spacing-sm, 0.75rem)',
                        }}
                    >
                        <H3 className={labelBaseClass} style={{ ...sectionTitleStyle, fontSize: '0.95rem', marginBottom: 0 }}>
                            {guestLookupSectionTitle}
                        </H3>
                        <P
                            style={{
                                margin: 0,
                                fontSize: '0.8125rem',
                                color: 'var(--scm-text-muted, #8A837B)',
                            }}
                        >
                            {guestLookupHint}
                        </P>
                        <Div style={fieldGridStyle}>
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
            <section data-testid="checkout-section-shipping">
                <H3 className={labelBaseClass} style={sectionTitleStyle}>
                    {shippingInfoTitle}
                </H3>
                <Div style={fieldGridStyle}>
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
                    <FieldText
                        label={zipcodeLabel}
                        name="zipcode"
                        value={zipcode}
                        onChange={setZipcode}
                        placeholder={zipcodePlaceholder}
                        error={fieldErrors['shipping.zipcode']}
                        required
                    />
                    <FieldText
                        label={addressLabel}
                        name="address"
                        value={address}
                        onChange={setAddress}
                        placeholder={addressPlaceholder}
                        error={fieldErrors['shipping.address']}
                        required
                    />
                    <FieldText
                        label={addressDetailLabel}
                        name="address_detail"
                        value={addressDetail}
                        onChange={setAddressDetail}
                        placeholder={addressDetailPlaceholder}
                    />
                </Div>

                {/* Shipping memo */}
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-2xs, 0.25rem)',
                        marginTop: 'var(--scm-spacing-md, 1rem)',
                    }}
                >
                    <Label className={labelBaseClass} htmlFor="shipping_memo" style={labelStyle}>
                        {memoLabel}
                    </Label>
                    <Select
                        id="shipping_memo"
                        name="shipping_memo"
                        value={shippingMemo}
                        onChange={(e) => onChangeMemo((e.target as HTMLSelectElement).value)}
                        data-scm-interactive
                        style={selectStyle}
                    >
                        <option value="">{memoPlaceholder}</option>
                        <option value="door">문 앞에 두고 가주세요</option>
                        <option value="security">경비실에 맡겨주세요</option>
                        <option value="parcel_box">택배함에 넣어주세요</option>
                        <option value="call">배송 전 연락 부탁드립니다</option>
                        <option value="custom">직접 입력</option>
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
                        style={{
                            marginTop: 'var(--scm-spacing-xs, 0.5rem)',
                            padding: '0.5rem',
                            border: '1px solid var(--scm-line, #E4DCCE)',
                            borderRadius: 'var(--scm-radius, 8px)',
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.875rem',
                            resize: 'vertical',
                        }}
                    />
                ) : null}
            </section>

            {/* Payment methods */}
            <section data-testid="checkout-section-payment">
                <H3 className={labelBaseClass} style={sectionTitleStyle}>
                    {paymentMethodTitle}
                </H3>
                {activeMethods.length === 0 ? (
                    <Div
                        data-testid="checkout-empty-methods"
                        style={{
                            padding: 'var(--scm-spacing-lg, 1.5rem)',
                            border: '1px dashed var(--scm-line, #E4DCCE)',
                            borderRadius: 'var(--scm-radius, 8px)',
                            backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--scm-spacing-xs, 0.5rem)',
                        }}
                    >
                        <P
                            style={{
                                margin: 0,
                                fontWeight: 600,
                                color: 'var(--scm-text-primary, #26221E)',
                            }}
                        >
                            {emptyMethodsTitle}
                        </P>
                        <P
                            style={{
                                margin: 0,
                                fontSize: '0.875rem',
                                color: 'var(--scm-text-muted, #8A837B)',
                            }}
                        >
                            {emptyMethodsMessage}
                        </P>
                    </Div>
                ) : (
                    <Div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: 'var(--scm-spacing-sm, 0.75rem)',
                        }}
                    >
                        {activeMethods.map((m) => {
                            const selected = paymentMethod === m.id;
                            return (
                                <Button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setPaymentMethod(m.id)}
                                    data-testid={`checkout-payment-method-${m.id}`}
                                    data-scm-interactive
                                    style={{
                                        padding: 'var(--scm-spacing-md, 1rem)',
                                        border: selected
                                            ? '1.5px solid var(--scm-charcoal, #26221E)'
                                            : '1px solid var(--scm-line, #E4DCCE)',
                                        borderRadius: 'var(--scm-radius, 8px)',
                                        backgroundColor: selected
                                            ? 'var(--scm-paper, #FAF8F3)'
                                            : 'var(--scm-paper, #FAF8F3)',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontFamily: 'var(--scm-font-body, system-ui)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.25rem',
                                        minHeight: '64px',
                                    }}
                                >
                                    <Span
                                        style={{
                                            fontWeight: 600,
                                            color: 'var(--scm-text-primary, #26221E)',
                                            fontSize: '0.9375rem',
                                        }}
                                    >
                                        {labelPayment(m)}
                                    </Span>
                                    {m._cached_description ? (
                                        <Span
                                            style={{
                                                fontSize: '0.8125rem',
                                                color: 'var(--scm-text-muted, #8A837B)',
                                            }}
                                        >
                                            {resolveLabel(m._cached_description)}
                                        </Span>
                                    ) : null}
                                </Button>
                            );
                        })}
                    </Div>
                )}

                {paymentMethod === 'dbank' ? (
                    <Div
                        style={{
                            marginTop: 'var(--scm-spacing-md, 1rem)',
                            padding: 'var(--scm-spacing-md, 1rem)',
                            backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                            border: '1px solid var(--scm-line, #E4DCCE)',
                            borderRadius: 'var(--scm-radius, 8px)',
                        }}
                    >
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
                    </Div>
                ) : null}
            </section>

            {/* Summary */}
            <section data-testid="checkout-section-summary">
                <H3 className={labelBaseClass} style={sectionTitleStyle}>
                    주문 요약
                </H3>
                <Div
                    style={{
                        padding: 'var(--scm-spacing-md, 1rem)',
                        border: '1px solid var(--scm-line, #E4DCCE)',
                        borderRadius: 'var(--scm-radius, 8px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-xs, 0.5rem)',
                        backgroundColor: 'var(--scm-paper, #FAF8F3)',
                    }}
                >
                    <SummaryRow label="상품 금액" value={subtotalText} />
                    {discountText ? (
                        <SummaryRow
                            label="할인"
                            value={`-${discountText}`}
                            tone="discount"
                        />
                    ) : null}
                    <SummaryRow label="배송비" value={shippingText} />
                    <Div
                        style={{
                            marginTop: 'var(--scm-spacing-xs, 0.5rem)',
                            paddingTop: 'var(--scm-spacing-xs, 0.5rem)',
                            borderTop: '1px solid var(--scm-charcoal, #26221E)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                        }}
                    >
                        <Span style={{ fontWeight: 600 }}>총 결제금액</Span>
                        <Span
                            data-testid="checkout-summary-final"
                            style={{
                                fontFamily: 'var(--scm-font-display, system-ui)',
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                fontVariantNumeric: 'tabular-nums',
                                color: 'var(--scm-text-primary, #26221E)',
                            }}
                        >
                            {finalText}
                        </Span>
                    </Div>
                </Div>
            </section>

            {/* Terms + pay button */}
            <Div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-md, 1rem)',
                }}
            >
                <P
                    style={{
                        margin: 0,
                        fontSize: '0.8125rem',
                        color: 'var(--scm-text-muted, #8A837B)',
                        textAlign: 'center',
                    }}
                >
                    {termsAgreement}
                </P>
                <Button
                    type="submit"
                    disabled={isSubmitting || isEmptyCart || activeMethods.length === 0}
                    data-testid="checkout-pay-button"
                    data-scm-interactive
                    style={{
                        width: '100%',
                        minHeight: '52px',
                        backgroundColor: 'var(--scm-charcoal, #26221E)',
                        color: 'var(--scm-text-inverse, #FAF8F3)',
                        border: '1px solid var(--scm-charcoal, #26221E)',
                        borderRadius: 'var(--scm-radius, 8px)',
                        fontFamily: 'var(--scm-font-body, system-ui)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: isSubmitting || isEmptyCart ? 'not-allowed' : 'pointer',
                        opacity: isSubmitting || isEmptyCart ? 0.6 : 1,
                        letterSpacing: '0.02em',
                    }}
                >
                    {isSubmitting ? submittingLabel : `${finalText} ${payButtonLabel}`}
                </Button>
                {fieldErrors['payment_method'] ? (
                    <P
                        role="alert"
                        style={{
                            margin: 0,
                            color: '#8A2B25',
                            fontSize: '0.8125rem',
                            textAlign: 'center',
                        }}
                    >
                        {fieldErrors['payment_method']}
                    </P>
                ) : null}
            </Div>

            {/* items list (compact) for diagnostic */}
            {items.length > 0 ? (
                <section data-testid="checkout-section-items">
                    <H3 className={labelBaseClass} style={sectionTitleStyle}>
                        주문 상품
                    </H3>
                    <Div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid var(--scm-line, #E4DCCE)',
                            borderRadius: 'var(--scm-radius, 8px)',
                            overflow: 'hidden',
                        }}
                    >
                        {items.map((item: CheckoutItem, idx: number) => (
                            <Div
                                key={item.product_option_id ?? idx}
                                data-testid="checkout-item-row"
                                style={{
                                    display: 'flex',
                                    gap: 'var(--scm-spacing-md, 1rem)',
                                    padding: 'var(--scm-spacing-md, 1rem)',
                                    borderTop: idx === 0 ? 'none' : '1px solid var(--scm-line, #E4DCCE)',
                                    alignItems: 'center',
                                }}
                            >
                                {item.product?.thumbnail_url ? (
                                    <img
                                        src={item.product.thumbnail_url}
                                        alt={typeof item.product.name === 'string' ? item.product.name : ''}
                                        style={{
                                            width: 56,
                                            height: 56,
                                            objectFit: 'cover',
                                            borderRadius: 'var(--scm-radius, 8px)',
                                            backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                                            flexShrink: 0,
                                        }}
                                    />
                                ) : (
                                    <Div
                                        style={{
                                            width: 56,
                                            height: 56,
                                            backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                                            borderRadius: 'var(--scm-radius, 8px)',
                                            flexShrink: 0,
                                        }}
                                    />
                                )}
                                <Div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <Span style={{ fontWeight: 500, color: 'var(--scm-text-primary, #26221E)' }}>
                                        {typeof item.product?.name === 'string'
                                            ? item.product.name
                                            : resolveLabel(item.product?.name)}
                                    </Span>
                                    <Span
                                        style={{
                                            fontSize: '0.8125rem',
                                            color: 'var(--scm-text-muted, #8A837B)',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {item.unit_price_formatted ?? ''} × {item.quantity ?? 1}
                                    </Span>
                                </Div>
                                <Span
                                    style={{
                                        fontWeight: 600,
                                        fontVariantNumeric: 'tabular-nums',
                                        color: 'var(--scm-text-primary, #26221E)',
                                    }}
                                >
                                    {item.subtotal_formatted ?? ''}
                                </Span>
                            </Div>
                        ))}
                    </Div>
                </section>
            ) : null}
        </Form>
    );
}

const sectionTitleStyle: React.CSSProperties = {
    fontFamily: 'var(--scm-font-display, system-ui)',
    fontSize: '1.0625rem',
    fontWeight: 600,
    margin: 0,
    marginBottom: 'var(--scm-spacing-sm, 0.75rem)',
    color: 'var(--scm-text-primary, #26221E)',
    display: 'block',
};

const fieldGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 'var(--scm-spacing-sm, 0.75rem)',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'var(--scm-text-body, #4A4643)',
    marginBottom: 'var(--scm-spacing-2xs, 0.25rem)',
};

const selectStyle: React.CSSProperties = {
    padding: '0.5rem 0.625rem',
    border: '1px solid var(--scm-line, #E4DCCE)',
    borderRadius: 'var(--scm-radius, 8px)',
    fontFamily: 'var(--scm-font-body, system-ui)',
    fontSize: '0.875rem',
    color: 'var(--scm-text-primary, #26221E)',
    backgroundColor: 'var(--scm-paper, #FAF8F3)',
};

function FieldText(props: {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    type?: string;
    required?: boolean;
}): React.ReactElement {
    const { label, name, value, onChange, placeholder, error, type = 'text', required } = props;
    return (
        <Div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--scm-spacing-2xs, 0.25rem)' }}>
            <Label className={labelBaseClass} htmlFor={`scm-${name}`} style={labelStyle}>
                {label}
                {required ? <Span style={{ color: '#C8443B', marginLeft: '0.25rem' }}>*</Span> : null}
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
                style={{
                    padding: '0.5rem 0.625rem',
                    border: error ? '1px solid #C8443B' : '1px solid var(--scm-line, #E4DCCE)',
                    borderRadius: 'var(--scm-radius, 8px)',
                    fontFamily: 'var(--scm-font-body, system-ui)',
                    fontSize: '0.875rem',
                    color: 'var(--scm-text-primary, #26221E)',
                    backgroundColor: 'var(--scm-paper, #FAF8F3)',
                    width: '100%',
                }}
            />
            {error ? (
                <Span
                    role="alert"
                    style={{
                        fontSize: '0.75rem',
                        color: '#8A2B25',
                    }}
                >
                    {error}
                </Span>
            ) : null}
        </Div>
    );
}

function SummaryRow(props: { label: string; value: string; tone?: 'discount' | 'normal' }): React.ReactElement {
    const tone = props.tone ?? 'normal';
    return (
        <Div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                fontVariantNumeric: 'tabular-nums',
            }}
        >
            <Span style={{ fontSize: '0.875rem', color: 'var(--scm-text-body, #4A4643)' }}>{props.label}</Span>
            <Span
                style={{
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    color: tone === 'discount' ? '#8A2B25' : 'var(--scm-text-primary, #26221E)',
                }}
            >
                {props.value}
            </Span>
        </Div>
    );
}

export default CheckoutForm;
