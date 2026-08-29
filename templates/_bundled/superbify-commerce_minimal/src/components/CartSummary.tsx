import React from 'react';
import { Button, Div, Span } from './basic';

export interface CartSummaryCalc {
    subtotal?: number | string | null;
    subtotal_formatted?: string | null;
    /** total_shipping alias — server field */
    total_shipping?: number | string | null;
    /** payment_amount / final_amount */
    payment_amount?: number | string | null;
    final_amount?: number | string | null;
    payment_amount_formatted?: string | null;
    final_amount_formatted?: string | null;
    /** legacy/optional overrides */
    shipping_fee?: number | string | null;
    total?: number | string | null;
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

/** Returns the formatted string or null when the value is missing/zero. */
function pickPrice(
    value: number | string | null | undefined,
    formatted: string | null | undefined,
): string | null {
    if (formatted && formatted.trim() !== '' && formatted.trim() !== '₩0' && formatted.trim() !== '₩0') {
        return formatted;
    }
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') return value;
    try {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value);
    } catch {
        return String(value);
    }
}

/** True when shipping has a non-zero value to display. */
function hasShipping(c: CartSummaryCalc | null | undefined): boolean {
    if (!c) return false;
    const v = c.total_shipping ?? c.shipping_fee;
    if (typeof v === 'number') return v > 0;
    if (typeof v === 'string') return parseInt(v, 10) > 0;
    const f = c.shipping_fee_formatted ?? '';
    if (!f) return false;
    const m = f.match(/[\d,]+/);
    return m ? parseInt(m[0].replace(/,/g, ''), 10) > 0 : false;
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

    const subtotalStr = pickPrice(
        calculation?.subtotal,
        calculation?.subtotal_formatted,
    ) ?? '—';

    const shippingStr = hasShipping(calculation)
        ? pickPrice(
            calculation?.total_shipping ?? calculation?.shipping_fee,
            calculation?.shipping_fee_formatted,
          ) ?? '—'
        : null;

    const totalStr = pickPrice(
        calculation?.payment_amount ?? calculation?.final_amount ?? calculation?.total,
        calculation?.payment_amount_formatted ?? calculation?.final_amount_formatted ?? calculation?.total_formatted,
    ) ?? subtotalStr;

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
                padding: 'var(--scm-spacing-lg, 1.5rem)',
                backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
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
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    letterSpacing: '-0.005em',
                    color: 'var(--scm-text-primary, #26221E)',
                }}
            >
                {summaryTitle}
            </Span>

            <Div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
                }}
            >
                <SummaryRow label={itemsLabel} value={`${count}`} />
                <SummaryRow label={subtotalLabel} value={subtotalStr} />
                {shippingStr !== null ? <SummaryRow label={shippingLabel} value={shippingStr} /> : null}
            </Div>

            <Div
                style={{
                    borderTop: '1px solid var(--scm-charcoal, #26221E)',
                    paddingTop: 'var(--scm-spacing-md, 1rem)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 'var(--scm-spacing-sm, 0.75rem)',
                }}
            >
                <Span
                    style={{
                        fontFamily: 'var(--scm-font-body, system-ui)',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'var(--scm-text-primary, #26221E)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                    }}
                >
                    {totalLabel}
                </Span>
                <Span
                    data-testid="cart-summary-total"
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '1.375rem',
                        fontWeight: 700,
                        color: 'var(--scm-text-primary, #26221E)',
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'right',
                    }}
                >
                    {totalStr}
                </Span>
            </Div>

            <Button
                type="button"
                onClick={checkout}
                disabled={isOrdering || count === 0}
                data-testid="cart-summary-checkout"
                data-scm-interactive
                style={{
                    width: '100%',
                    minHeight: 'var(--scm-touch-min, 44px)',
                    padding: '0 var(--scm-spacing-md, 1rem)',
                    backgroundColor: 'var(--scm-charcoal, #26221E)',
                    color: 'var(--scm-text-inverse, #FAF8F3)',
                    border: '1px solid var(--scm-charcoal, #26221E)',
                    borderRadius: 'var(--scm-radius, 8px)',
                    fontWeight: 600,
                    fontFamily: 'var(--scm-font-body, system-ui)',
                    fontSize: '0.9375rem',
                    letterSpacing: '0.02em',
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
                data-scm-interactive
                style={{
                    width: '100%',
                    minHeight: 'var(--scm-touch-min, 44px)',
                    padding: '0 var(--scm-spacing-md, 1rem)',
                    background: 'transparent',
                    border: '1px solid var(--scm-charcoal, #26221E)',
                    borderRadius: 'var(--scm-radius, 8px)',
                    color: 'var(--scm-text-primary, #26221E)',
                    fontWeight: 500,
                    fontFamily: 'var(--scm-font-body, system-ui)',
                    fontSize: '0.9375rem',
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
                paddingBlock: 'var(--scm-spacing-xs, 0.5rem)',
                borderBottom: '1px solid var(--scm-line, #E4DCCE)',
                gap: 'var(--scm-spacing-sm, 0.75rem)',
            }}
        >
            <Span
                style={{
                    fontFamily: 'var(--scm-font-body, system-ui)',
                    fontSize: '0.875rem',
                    color: 'var(--scm-text-muted, #8A837B)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                }}
            >
                {label}
            </Span>
            <Span
                style={{
                    fontFamily: 'var(--scm-font-body, system-ui)',
                    fontSize: '0.9375rem',
                    color: 'var(--scm-text-primary, #26221E)',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    fontVariantNumeric: 'tabular-nums',
                    textAlign: 'right',
                    minWidth: 0,
                }}
            >
                {value}
            </Span>
        </Div>
    );
}

export default CartSummary;
