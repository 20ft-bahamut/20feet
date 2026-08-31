import React, { useCallback, useMemo } from 'react';
import { Button, Div, P, Span } from './basic';

export interface OrderCompleteOrderData {
    order_number?: string;
    total_amount_formatted?: string;
    mc_total_amount?: Record<string, { formatted?: string }>;
    subtotal_amount_formatted?: string;
    total_shipping_amount?: number | string;
    total_shipping_amount_formatted?: string;
    total_discount_amount_formatted?: string;
    order_status?: string;
    shipping_address?: {
        recipient_name?: string;
        recipient_phone?: string;
        recipient_country_code?: string;
        zipcode?: string;
        address?: string;
        address_detail?: string;
        city?: string;
        state?: string;
    };
    payment?: {
        payment_method?: string;
        depositor_name?: string;
        deposit_due_at_formatted?: string;
        dbank_name?: string;
        dbank_account?: string;
        dbank_holder?: string;
        vbank_name?: string;
        vbank_number?: string;
        vbank_holder?: string;
        vbank_due_at_formatted?: string;
    };
    options?: Array<{
        product_name?: string | Record<string, string>;
        product_option_name?: string | Record<string, string>;
        option_snapshot?: { option_name?: string | Record<string, string> };
        thumbnail_url?: string | null;
        quantity?: number;
        unit_price_formatted?: string;
        subtotal_price_formatted?: string;
        /** 주문 시점 동결 스냅샷(OrderOptionResource) — 이름/추가금/커스텀 텍스트 */
        additional_options?: Array<{
            name?: string;
            price_adjustment?: number | string;
            custom_text?: string | null;
        }>;
        additional_options_total_formatted?: string;
    }>;
    orderer_email?: string;
}

export interface OrderCompletePageProps {
    orderData?: { data?: OrderCompleteOrderData | null; loading?: boolean; error?: unknown } | null;
    isLoggedIn?: boolean;
    shopBase?: string;
    // i18n labels
    title?: string;
    successMessage?: string;
    bankDepositMessage?: string;
    bankDepositInfoTitle?: string;
    depositBankLabel?: string;
    depositAccountLabel?: string;
    depositHolderLabel?: string;
    depositorNameLabel?: string;
    depositAmountLabel?: string;
    depositDueLabel?: string;
    vbankNotice?: string;
    guestNoticeTitle?: string;
    guestNoticeLookup?: string;
    guestNoticeSave?: string;
    guestEmailSent?: string;
    orderNumberLabel?: string;
    orderedItemsLabel?: string;
    shippingAddressLabel?: string;
    subtotalLabel?: string;
    shippingFeeLabel?: string;
    discountLabel?: string;
    totalLabel?: string;
    viewDetailLabel?: string;
    continueShoppingLabel?: string;
    loadingLabel?: string;
    errorTitle?: string;
}

function resolveLabel(value: string | Record<string, string> | null | undefined, locale: string = 'ko'): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        return (value as Record<string, string>)[locale] ?? Object.values(value)[0] ?? '';
    }
    return '';
}

export function OrderCompletePage(props: OrderCompletePageProps): React.ReactElement {
    const {
        orderData,
        isLoggedIn = false,
        shopBase = '/shop',
    } = props;

    const order = orderData?.data ?? null;
    const isLoading = !!orderData?.loading;
    const locale = 'ko';

    const title = props.title ?? '주문이 접수되었습니다';
    const successMessage = props.successMessage ?? '주문이 정상적으로 접수되었습니다.';
    const bankDepositMessage =
        props.bankDepositMessage ??
        '입금 확인 후 배송이 시작됩니다. 아래 계좌로 입금 기한까지 금액을 입금해 주세요.';

    const orderNumber = order?.order_number ?? '';
    const isBankTransfer = order?.payment?.payment_method === 'dbank';
    const isVbank = order?.payment?.payment_method === 'vbank';
    const totalText = useMemo(() => {
        const mc = order?.mc_total_amount?.['KRW']?.formatted;
        if (mc) return mc;
        return order?.total_amount_formatted ?? '';
    }, [order]);

    const continueShopping = useCallback(() => {
        window.location.assign('/shop');
    }, []);

    const viewDetail = useCallback(() => {
        if (!orderNumber) return;
        const path = isLoggedIn
            ? `/mypage/orders/${orderNumber}`
            : `${shopBase}/guest/orders/${orderNumber}`;
        window.location.assign(path);
    }, [isLoggedIn, orderNumber, shopBase]);

    if (isLoading && !order) {
        return (
            <Div
                data-testid="order-complete-loading"
                style={{
                    padding: 'var(--scm-section-py-md, 4rem) 0',
                    textAlign: 'center',
                    color: 'var(--scm-text-muted, #8A837B)',
                }}
            >
                <P style={{ margin: 0 }}>{props.loadingLabel ?? '주문 정보를 불러오는 중…'}</P>
            </Div>
        );
    }

    if (!order) {
        return (
            <Div
                data-testid="order-complete-error"
                style={{
                    padding: 'var(--scm-section-py-md, 4rem) var(--scm-gutter, 1rem)',
                    textAlign: 'center',
                }}
            >
                <h2
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        margin: 0,
                        marginBottom: 'var(--scm-spacing-md, 1rem)',
                    }}
                >
                    {props.errorTitle ?? '주문 정보를 찾을 수 없습니다'}
                </h2>
                <Button
                    type="button"
                    onClick={continueShopping}
                    data-scm-interactive
                    style={{
                        padding: '0.625rem 1.25rem',
                        backgroundColor: 'var(--scm-charcoal, #26221E)',
                        color: 'var(--scm-text-inverse, #FAF8F3)',
                        border: '1px solid var(--scm-charcoal, #26221E)',
                        borderRadius: 'var(--scm-radius, 8px)',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    {props.continueShoppingLabel ?? '쇼핑 계속하기'}
                </Button>
            </Div>
        );
    }

    return (
        <Div
            data-testid="order-complete-root"
            style={{
                paddingBlock: 'var(--scm-section-py-md, 4rem)',
                maxWidth: '720px',
                marginInline: 'auto',
                paddingInline: 'var(--scm-gutter, 1rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--scm-spacing-lg, 1.5rem)',
            }}
        >
            {/* Header */}
            <header
                style={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-md, 1rem)',
                    alignItems: 'center',
                }}
            >
                <div
                    aria-hidden
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        backgroundColor: isBankTransfer || isVbank
                            ? 'var(--scm-bg-secondary, #F4F0E6)'
                            : '#DCE9DC',
                        border: '1px solid var(--scm-line, #E4DCCE)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '1.5rem',
                        color: isBankTransfer || isVbank ? 'var(--scm-text-primary, #26221E)' : '#3D6B47',
                    }}
                >
                    {isBankTransfer || isVbank ? '⏳' : '✓'}
                </div>
                <h1
                    data-testid="order-complete-title"
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        margin: 0,
                        color: 'var(--scm-text-primary, #26221E)',
                    }}
                >
                    {title}
                </h1>
                <P
                    style={{
                        margin: 0,
                        color: 'var(--scm-text-body, #4A4643)',
                        maxWidth: '52ch',
                    }}
                >
                    {isBankTransfer || isVbank ? bankDepositMessage : successMessage}
                </P>
            </header>

            {/* Order number */}
            <Div
                data-testid="order-complete-order-number"
                style={{
                    padding: 'var(--scm-spacing-md, 1rem)',
                    border: '1px solid var(--scm-line, #E4DCCE)',
                    borderRadius: 'var(--scm-radius, 8px)',
                    backgroundColor: 'var(--scm-paper, #FAF8F3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 'var(--scm-spacing-md, 1rem)',
                }}
            >
                <Span style={{ fontSize: '0.875rem', color: 'var(--scm-text-muted, #8A837B)' }}>
                    {props.orderNumberLabel ?? '주문번호'}
                </Span>
                <Span
                    style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--scm-text-primary, #26221E)',
                    }}
                >
                    {orderNumber}
                </Span>
            </Div>

            {/* Bank transfer / vbank info */}
            {isBankTransfer || isVbank ? (
                <Div
                    data-testid="order-complete-bank-info"
                    style={{
                        padding: 'var(--scm-spacing-md, 1rem)',
                        border: '1px solid var(--scm-line, #E4DCCE)',
                        borderRadius: 'var(--scm-radius, 8px)',
                        backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'var(--scm-text-primary, #26221E)',
                        }}
                    >
                        {isBankTransfer
                            ? (props.bankDepositInfoTitle ?? '입금 안내')
                            : '가상계좌 입금 안내'}
                    </h3>
                    {isBankTransfer && order.payment?.dbank_name ? (
                        <BankRow label={props.depositBankLabel ?? '은행'} value={order.payment.dbank_name} />
                    ) : null}
                    {isBankTransfer && order.payment?.dbank_account ? (
                        <BankRow label={props.depositAccountLabel ?? '계좌번호'} value={order.payment.dbank_account} />
                    ) : null}
                    {isBankTransfer && order.payment?.dbank_holder ? (
                        <BankRow label={props.depositHolderLabel ?? '예금주'} value={order.payment.dbank_holder} />
                    ) : null}
                    {isBankTransfer && order.payment?.depositor_name ? (
                        <BankRow label={props.depositorNameLabel ?? '입금자명'} value={order.payment.depositor_name} />
                    ) : null}
                    {isVbank && order.payment?.vbank_name ? (
                        <BankRow label={props.depositBankLabel ?? '은행'} value={order.payment.vbank_name} />
                    ) : null}
                    {isVbank && order.payment?.vbank_number ? (
                        <BankRow label={props.depositAccountLabel ?? '계좌번호'} value={order.payment.vbank_number} />
                    ) : null}
                    {isVbank && order.payment?.vbank_holder ? (
                        <BankRow label={props.depositHolderLabel ?? '예금주'} value={order.payment.vbank_holder} />
                    ) : null}
                    <BankRow
                        label={props.depositAmountLabel ?? '입금 금액'}
                        value={totalText}
                        accent
                    />
                    {(order.payment?.deposit_due_at_formatted || order.payment?.vbank_due_at_formatted) ? (
                        <BankRow
                            label={props.depositDueLabel ?? '입금 기한'}
                            value={
                                order.payment.deposit_due_at_formatted ??
                                order.payment.vbank_due_at_formatted ??
                                ''
                            }
                            tone="warning"
                        />
                    ) : null}
                    <P
                        style={{
                            margin: 0,
                            fontSize: '0.8125rem',
                            color: 'var(--scm-text-muted, #8A837B)',
                        }}
                    >
                        {props.vbankNotice ?? '입금 기한 내 미입금 시 주문이 자동 취소될 수 있습니다.'}
                    </P>
                </Div>
            ) : null}

            {/* Guest lookup notice */}
            {!isLoggedIn ? (
                <Div
                    data-testid="order-complete-guest-notice"
                    style={{
                        padding: 'var(--scm-spacing-md, 1rem)',
                        border: '1px solid var(--scm-line, #E4DCCE)',
                        borderRadius: 'var(--scm-radius, 8px)',
                        backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-2xs, 0.25rem)',
                    }}
                >
                    <P
                        style={{
                            margin: 0,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--scm-text-primary, #26221E)',
                        }}
                    >
                        {props.guestNoticeTitle ?? '비회원 주문 안내'}
                    </P>
                    <P
                        style={{
                            margin: 0,
                            fontSize: '0.8125rem',
                            color: 'var(--scm-text-body, #4A4643)',
                        }}
                    >
                        {props.guestNoticeLookup ??
                            '주문번호와 가입하신 휴대폰, 조회 비밀번호로 비회원 주문 조회 페이지에서 다시 확인할 수 있습니다.'}
                    </P>
                </Div>
            ) : null}

            {/* Items list */}
            {order.options && order.options.length > 0 ? (
                <Div
                    data-testid="order-complete-items"
                    style={{
                        padding: 'var(--scm-spacing-md, 1rem)',
                        border: '1px solid var(--scm-line, #E4DCCE)',
                        borderRadius: 'var(--scm-radius, 8px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-md, 1rem)',
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'var(--scm-text-primary, #26221E)',
                        }}
                    >
                        {props.orderedItemsLabel ?? '주문 상품'}
                    </h3>
                    {order.options.map((item, idx) => (
                        <Div
                            key={idx}
                            data-testid="order-complete-item-row"
                            style={{
                                display: 'flex',
                                gap: 'var(--scm-spacing-md, 1rem)',
                                paddingTop: idx === 0 ? 0 : 'var(--scm-spacing-md, 1rem)',
                                borderTop: idx === 0 ? 'none' : '1px solid var(--scm-line, #E4DCCE)',
                            }}
                        >
                            {item.thumbnail_url ? (
                                <img
                                    src={item.thumbnail_url}
                                    alt={resolveLabel(item.product_name, locale)}
                                    style={{
                                        width: 56,
                                        height: 56,
                                        objectFit: 'cover',
                                        borderRadius: 'var(--scm-radius, 8px)',
                                        backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                                    }}
                                />
                            ) : (
                                <Div
                                    style={{
                                        width: 56,
                                        height: 56,
                                        backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                                        borderRadius: 'var(--scm-radius, 8px)',
                                    }}
                                />
                            )}
                            <Div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <Span style={{ fontWeight: 500, color: 'var(--scm-text-primary, #26221E)' }}>
                                    {resolveLabel(item.product_name, locale)}
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
                                {item.product_option_name ? (
                                    <Span
                                        data-testid="order-complete-item-option"
                                        style={{
                                            fontSize: '0.8125rem',
                                            color: 'var(--scm-text-muted, #8A837B)',
                                        }}
                                    >
                                        {resolveLabel(item.product_option_name, locale)}
                                    </Span>
                                ) : null}
                                {/* 추가옵션 — OrderOptionResource.additional_options 계약 */}
                                {(item.additional_options ?? []).length > 0 ? (
                                    <Div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                                        {(item.additional_options ?? []).map((ao, aoIdx) => (
                                            <Span
                                                key={aoIdx}
                                                data-testid="order-complete-item-additional-option"
                                                style={{
                                                    fontSize: '0.8125rem',
                                                    color: 'var(--scm-text-muted, #8A837B)',
                                                }}
                                            >
                                                + {ao.name ?? ''}
                                                {ao.custom_text ? `: ${ao.custom_text}` : ''}
                                                {ao.price_adjustment ? ` (+${Number(ao.price_adjustment).toLocaleString()}원)` : ''}
                                            </Span>
                                        ))}
                                    </Div>
                                ) : null}
                            </Div>
                            <Span
                                style={{
                                    fontWeight: 600,
                                    fontVariantNumeric: 'tabular-nums',
                                    color: 'var(--scm-text-primary, #26221E)',
                                }}
                            >
                                {item.subtotal_price_formatted ?? ''}
                            </Span>
                        </Div>
                    ))}
                </Div>
            ) : null}

            {/* Shipping address */}
            {order.shipping_address ? (
                <Div
                    data-testid="order-complete-shipping"
                    style={{
                        padding: 'var(--scm-spacing-md, 1rem)',
                        border: '1px solid var(--scm-line, #E4DCCE)',
                        borderRadius: 'var(--scm-radius, 8px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-2xs, 0.25rem)',
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            marginBottom: 'var(--scm-spacing-xs, 0.5rem)',
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'var(--scm-text-primary, #26221E)',
                        }}
                    >
                        {props.shippingAddressLabel ?? '배송지'}
                    </h3>
                    <P style={{ margin: 0, color: 'var(--scm-text-primary, #26221E)' }}>
                        {order.shipping_address.recipient_name} ({order.shipping_address.recipient_phone})
                    </P>
                    <P style={{ margin: 0, fontSize: '0.875rem', color: 'var(--scm-text-body, #4A4643)' }}>
                        ({order.shipping_address.zipcode ?? ''}) {order.shipping_address.address ?? ''}{' '}
                        {order.shipping_address.address_detail ?? ''}
                    </P>
                </Div>
            ) : null}

            {/* Total */}
            <Div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    paddingBlock: 'var(--scm-spacing-md, 1rem)',
                    paddingInline: 'var(--scm-spacing-md, 1rem)',
                    backgroundColor: 'var(--scm-charcoal, #26221E)',
                    color: 'var(--scm-text-inverse, #FAF8F3)',
                    borderRadius: 'var(--scm-radius, 8px)',
                }}
            >
                <Span style={{ fontWeight: 600 }}>{props.totalLabel ?? '총 결제금액'}</Span>
                <Span
                    data-testid="order-complete-total"
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {totalText}
                </Span>
            </Div>

            {/* CTAs */}
            <Div
                style={{
                    display: 'flex',
                    gap: 'var(--scm-spacing-md, 1rem)',
                    flexWrap: 'wrap',
                }}
            >
                <Button
                    type="button"
                    onClick={viewDetail}
                    data-scm-interactive
                    style={{
                        flex: 1,
                        minHeight: '52px',
                        padding: '0 var(--scm-spacing-lg, 1.5rem)',
                        backgroundColor: 'var(--scm-charcoal, #26221E)',
                        color: 'var(--scm-text-inverse, #FAF8F3)',
                        border: '1px solid var(--scm-charcoal, #26221E)',
                        borderRadius: 'var(--scm-radius, 8px)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--scm-font-body, system-ui)',
                        fontSize: '0.9375rem',
                    }}
                >
                    {props.viewDetailLabel ?? '주문 상세 보기'}
                </Button>
                <Button
                    type="button"
                    onClick={continueShopping}
                    data-scm-interactive
                    style={{
                        flex: 1,
                        minHeight: '52px',
                        padding: '0 var(--scm-spacing-lg, 1.5rem)',
                        background: 'transparent',
                        border: '1px solid var(--scm-charcoal, #26221E)',
                        color: 'var(--scm-text-primary, #26221E)',
                        borderRadius: 'var(--scm-radius, 8px)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--scm-font-body, system-ui)',
                        fontSize: '0.9375rem',
                    }}
                >
                    {props.continueShoppingLabel ?? '쇼핑 계속하기'}
                </Button>
            </Div>
        </Div>
    );
}

function BankRow(props: { label: string; value: string; accent?: boolean; tone?: 'warning' }): React.ReactElement {
    return (
        <Div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 'var(--scm-spacing-md, 1rem)',
            }}
        >
            <Span style={{ fontSize: '0.8125rem', color: 'var(--scm-text-muted, #8A837B)' }}>{props.label}</Span>
            <Span
                style={{
                    fontSize: '0.9375rem',
                    fontWeight: props.accent ? 700 : 500,
                    fontVariantNumeric: 'tabular-nums',
                    color: props.tone === 'warning' ? '#A14530' : 'var(--scm-text-primary, #26221E)',
                }}
            >
                {props.value}
            </Span>
        </Div>
    );
}

export default OrderCompletePage;
