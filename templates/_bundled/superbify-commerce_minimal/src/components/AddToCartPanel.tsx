import React from 'react';
import { Button, Div, Input, Label } from './basic';

export interface AddToCartPanelProps {
    productId: number | string;
    productName?: string;
    /** 'on_sale' | 'sold_out' | 'stopped' | ... */
    salesStatus?: string | null;
    salesStatusLabel?: string | null;
    /** Optional override labels (from $t: keys resolved server-side). */
    addToCartLabel?: string;
    buyNowLabel?: string;
    quantityLabel?: string;
    soldOutLabel?: string;
    stoppedLabel?: string;
    minQuantity?: number;
    maxQuantity?: number;
    className?: string;
}

/**
 * Product detail purchase panel: quantity stepper + add-to-cart + buy-now.
 *
 * Action shape mirrors sirsoft-basic's `_product_purchase_card.json` but uses
 * template-styled controls and template tokens. Cart mutation is performed by
 * the G7 layout `apiCall` handler that this component dispatches via DOM
 * CustomEvents — the layout's actions array reads the event detail and posts
 * to `/api/modules/sirsoft-ecommerce/cart`.
 *
 * Why events instead of inline `actions` array on the Button?
 *  - Keeps this component reusable in non-purchase contexts (preview, etc.).
 *  - Lets the layout author decide the exact endpoint/headers/messages in JSON.
 */
export function AddToCartPanel({
    productId,
    productName,
    salesStatus,
    salesStatusLabel: _salesStatusLabel,
    addToCartLabel = '장바구니 담기',
    buyNowLabel = '바로구매',
    quantityLabel = '수량',
    soldOutLabel = '품절',
    stoppedLabel = '판매중지',
    minQuantity = 1,
    maxQuantity = 99,
    className,
}: AddToCartPanelProps): React.ReactElement {
    const [quantity, setQuantity] = React.useState<number>(minQuantity);
    const [submitting, setSubmitting] = React.useState<'add' | 'buy' | null>(null);

    const isOnSale = salesStatus === 'on_sale' || salesStatus === undefined || salesStatus === null;
    const isSoldOut = salesStatus === 'sold_out';
    const isStopped = salesStatus === 'stopped';

    const disabled = !isOnSale || submitting !== null;

    const clamped = React.useCallback((next: number): number => {
        if (Number.isNaN(next)) return minQuantity;
        return Math.max(minQuantity, Math.min(maxQuantity, Math.floor(next)));
    }, [minQuantity, maxQuantity]);

    const dispatch = (mode: 'add' | 'buy') => {
        if (disabled) return;
        setSubmitting(mode);
        const detail = {
            productId,
            quantity: clamped(quantity),
            mode,
            productName,
        };
        try {
            window.dispatchEvent(new CustomEvent('scm:add-to-cart', { detail }));
        } finally {
            // Layout action handler will toast and (for buy) navigate.
            // We release the local submitting flag on a short timer so the user
            // gets immediate feedback even if no response event is wired.
            window.setTimeout(() => setSubmitting(null), 1200);
        }
    };

    const dec = () => setQuantity((q) => clamped(q - 1));
    const inc = () => setQuantity((q) => clamped(q + 1));
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = parseInt(e.target.value, 10);
        setQuantity(clamped(v));
    };

    // CTA label policy: on sale → addToCartLabel; sold_out → soldOutLabel; stopped → stoppedLabel.
    // `salesStatusLabel` is a small status indicator near the price, NOT a CTA label.
    const ctaLabel = isSoldOut ? soldOutLabel : isStopped ? stoppedLabel : null;

    return (
        <Div
            className={className}
            data-testid="add-to-cart-panel"
            data-product-id={productId}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--scm-spacing-md, 1rem)',
            }}
        >
            {isOnSale ? (
                <Div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                    }}
                >
                    <Label
                        htmlFor={`scm-qty-${String(productId)}`}
                        style={{
                            fontSize: '0.85rem',
                            color: 'var(--scm-text-muted, #8A837B)',
                            fontWeight: 500,
                            minWidth: '3rem',
                        }}
                    >
                        {quantityLabel}
                    </Label>
                    <Div
                        role="group"
                        aria-label={quantityLabel}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'stretch',
                            border: '1px solid var(--scm-line, #E4DCCE)',
                            borderRadius: 'var(--scm-radius-sm, 4px)',
                            overflow: 'hidden',
                            backgroundColor: 'var(--scm-surface, #FAF8F3)',
                        }}
                    >
                        <Button
                            type="button"
                            aria-label="decrease quantity"
                            onClick={dec}
                            disabled={quantity <= minQuantity}
                            style={{
                                padding: '0.5rem 0.85rem',
                                background: 'transparent',
                                border: 'none',
                                cursor: quantity <= minQuantity ? 'not-allowed' : 'pointer',
                                color: 'var(--scm-text-body, #4A4643)',
                                fontSize: '1rem',
                                lineHeight: 1,
                            }}
                        >
                            −
                        </Button>
                        <Input
                            id={`scm-qty-${String(productId)}`}
                            type="number"
                            inputMode="numeric"
                            min={minQuantity}
                            max={maxQuantity}
                            value={quantity}
                            onChange={onChange}
                            aria-label="quantity"
                            data-testid="quantity-input"
                            style={{
                                width: '3.5rem',
                                padding: '0.5rem 0.25rem',
                                textAlign: 'center',
                                border: 'none',
                                borderLeft: '1px solid var(--scm-line, #E4DCCE)',
                                borderRight: '1px solid var(--scm-line, #E4DCCE)',
                                background: 'transparent',
                                color: 'var(--scm-text-body, #4A4643)',
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.95rem',
                                MozAppearance: 'textfield',
                            }}
                        />
                        <Button
                            type="button"
                            aria-label="increase quantity"
                            onClick={inc}
                            disabled={quantity >= maxQuantity}
                            style={{
                                padding: '0.5rem 0.85rem',
                                background: 'transparent',
                                border: 'none',
                                cursor: quantity >= maxQuantity ? 'not-allowed' : 'pointer',
                                color: 'var(--scm-text-body, #4A4643)',
                                fontSize: '1rem',
                                lineHeight: 1,
                            }}
                        >
                            +
                        </Button>
                    </Div>
                </Div>
            ) : null}

            <Div
                style={{
                    display: 'inline-flex',
                    flexWrap: 'wrap',
                    gap: 'var(--scm-spacing-sm, 0.75rem)',
                    maxWidth: '28rem',
                }}
            >
                <Button
                    type="button"
                    onClick={() => dispatch('add')}
                    disabled={disabled}
                    aria-label={addToCartLabel}
                    data-testid="add-to-cart"
                    data-mode="add"
                    style={{
                        padding: '0.85rem 1.4rem',
                        backgroundColor: 'var(--scm-charcoal, #26221E)',
                        color: 'var(--scm-paper, #FAF8F3)',
                        border: '1px solid var(--scm-charcoal, #26221E)',
                        borderRadius: 'var(--scm-radius, 8px)',
                        fontWeight: 600,
                        fontFamily: 'var(--scm-font-body, system-ui)',
                        fontSize: '0.95rem',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.55 : 1,
                    }}
                >
                    {ctaLabel ?? (submitting === 'add' ? '담는 중…' : addToCartLabel)}
                </Button>
                {isOnSale ? (
                    <Button
                        type="button"
                        onClick={() => dispatch('buy')}
                        disabled={disabled}
                        aria-label={buyNowLabel}
                        data-testid="buy-now"
                        data-mode="buy"
                        style={{
                            padding: '0.85rem 1.4rem',
                            backgroundColor: 'transparent',
                            color: 'var(--scm-charcoal, #26221E)',
                            border: '1px solid var(--scm-charcoal, #26221E)',
                            borderRadius: 'var(--scm-radius, 8px)',
                            fontWeight: 600,
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.95rem',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.55 : 1,
                        }}
                    >
                        {submitting === 'buy' ? '이동 중…' : buyNowLabel}
                    </Button>
                ) : null}
            </Div>
        </Div>
    );
}

export default AddToCartPanel;
