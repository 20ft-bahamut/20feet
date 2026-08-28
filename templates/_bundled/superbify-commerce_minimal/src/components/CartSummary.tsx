import React from 'react';
import { Button, Div, Span } from './basic';

export interface CartSummaryCalc {
    subtotal?: number | string | null;
    shipping_fee?: number | string | null;
    total?: number | string | null;
    /** server-provided formatted strings take precedence */
    subtotal_formatted?: string | null;
    shipping_fee_formatted?: string | null;
    total_formatted?: string | null;
}

export interface CartSummaryProps {
    itemCount?: number;
    calculation?: CartSummaryCalc | null;
    items?: unknown[];
    summaryTitle?: string;
    itemsLabel?: string;
    subtotalLabel?: string;
    shippingLabel?: string;
    totalLabel?: string;
    checkoutLabel?: string;
    continueShoppingLabel?: string;
    isOrdering?: boolean;
    onCheckout?: () => void;
    onContinueShopping?: () => void;
    className?: string;
}

function formatPrice(value: number | string | null | undefined, formatted?: string | null): string {
    if (formatted) return formatted;
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string') return value;
    try {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value);
    } catch {
        return String(value);
    }
}

export function CartSummary({
    itemCount,
    calculation,
    items,
    summaryTitle = '주문 요약',
    itemsLabel = '상품 수',
    subtotalLabel = '소계',
    shippingLabel = '배송비',
    totalLabel = '총 결제금액',
    checkoutLabel = '결제하기',
    continueShoppingLabel = '쇼핑 계속하기',
    isOrdering,
    onCheckout,
    onContinueShopping,
    className,
}: CartSummaryProps): React.ReactElement {
    const count = itemCount ?? (Array.isArray(items) ? items.length : 0);
    const subtotal = formatPrice(calculation?.subtotal, calculation?.subtotal_formatted);
    const shipping = formatPrice(calculation?.shipping_fee, calculation?.shipping_fee_formatted);
    const total = formatPrice(calculation?.total, calculation?.total_formatted);

    const checkout = onCheckout ?? (() => {
        window.location.assign('/shop/checkout');
    });
    const continueShopping = onContinueShopping ?? (() => {
        window.location.assign('/shop');
    });

    return (
        <Div
            className={className}
            data-testid="cart-summary"
            style={{
                position: 'sticky',
                top: 'var(--scm-spacing-lg, 1.5rem)',
                padding: 'var(--scm-spacing-md, 1rem)',
                backgroundColor: 'var(--scm-surface, #FAF8F3)',
                border: '1px solid var(--scm-line, #E4DCCE)',
                borderRadius: 'var(--scm-radius, 8px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--scm-spacing-md, 1rem)',
            }}
        >
            <Span
                style={{
                    fontFamily: 'var(--scm-font-display, system-ui)',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--scm-text-primary, #26221E)',
                }}
            >
                {summaryTitle}
            </Span>

            <SummaryRow label={itemsLabel} value={`${count}개`} />
            <SummaryRow label={subtotalLabel} value={subtotal} />
            <SummaryRow label={shippingLabel} value={shipping} />

            <Div
                style={{
                    borderTop: '1px solid var(--scm-line, #E4DCCE)',
                    paddingTop: 'var(--scm-spacing-sm, 0.75rem)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                }}
            >
                <Span
                    style={{
                        fontFamily: 'var(--scm-font-body, system-ui)',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'var(--scm-text-primary, #26221E)',
                    }}
                >
                    {totalLabel}
                </Span>
                <Span
                    data-testid="cart-summary-total"
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'var(--scm-text-primary, #26221E)',
                    }}
                >
                    {total}
                </Span>
            </Div>

            <Button
                type="button"
                onClick={checkout}
                disabled={isOrdering || count === 0}
                data-testid="cart-summary-checkout"
                style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--scm-wood, #C9B08D)',
                    color: 'var(--scm-text-inverse, #FAF8F3)',
                    border: '1px solid var(--scm-wood, #C9B08D)',
                    borderRadius: 'var(--scm-radius, 8px)',
                    fontWeight: 600,
                    fontFamily: 'var(--scm-font-body, system-ui)',
                    fontSize: '0.95rem',
                    cursor: isOrdering || count === 0 ? 'not-allowed' : 'pointer',
                    opacity: isOrdering || count === 0 ? 0.6 : 1,
                }}
            >
                {checkoutLabel}
            </Button>
            <Button
                type="button"
                onClick={continueShopping}
                data-testid="cart-summary-continue"
                style={{
                    padding: '0.7rem 1rem',
                    background: 'transparent',
                    border: '1px solid var(--scm-line, #E4DCCE)',
                    borderRadius: 'var(--scm-radius, 8px)',
                    color: 'var(--scm-text-body, #4A4643)',
                    fontWeight: 500,
                    fontFamily: 'var(--scm-font-body, system-ui)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                }}
            >
                {continueShoppingLabel}
            </Button>
        </Div>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }): React.ReactElement {
    return (
        <Div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
            }}
        >
            <Span
                style={{
                    fontFamily: 'var(--scm-font-body, system-ui)',
                    fontSize: '0.85rem',
                    color: 'var(--scm-text-muted, #8A837B)',
                }}
            >
                {label}
            </Span>
            <Span
                style={{
                    fontFamily: 'var(--scm-font-body, system-ui)',
                    fontSize: '0.9rem',
                    color: 'var(--scm-text-body, #4A4643)',
                }}
            >
                {value}
            </Span>
        </Div>
    );
}

export default CartSummary;
