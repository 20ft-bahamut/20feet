import React from 'react';
import { Button, Div, Img, Input, Span } from './basic';
import { resolveStillLifeThumb } from './stillLifeSlot';

export interface CartItemRowItem {
    id: number | string;
    quantity: number;
    unit_price?: number | string;
    unit_price_formatted?: string;
    line_total?: number | string;
    line_total_formatted?: string;
    /** CartItemResource exposes subtotal/subtotal_formatted directly on the item. */
    subtotal?: number | string;
    subtotal_formatted?: string;
    product?: {
        id?: number | string;
        code?: string;
        name?: string;
        name_localized?: string;
        thumbnail_url?: string | null;
        thumbnail_slot?: string | null;
        selling_price?: number | string;
        selling_price_formatted?: string;
        product_code?: string;
    } | null;
    option?: {
        id?: number | string;
        name?: string;
    } | null;
    product_option?: {
        id?: number | string;
        option_name?: string;
        option_name_localized?: string;
        selling_price?: number | string;
        selling_price_formatted?: string;
    } | null;
}

export interface CartItemRowProps {
    item: CartItemRowItem;
    /** event detail payload shape consumed by the page-level cart handler. */
    quantityLabel?: string;
    deleteLabel?: string;
    decreaseLabel?: string;
    increaseLabel?: string;
    applyLabel?: string;
    minQuantity?: number;
    maxQuantity?: number;
    className?: string;
}

/**
 * Composites row used in /cart list. Emits CustomEvents on the window:
 *   scm:cart-qty-change  -> { id, quantity }
 *   scm:cart-delete       -> { ids: [id] }
 *
 * Page-level handler dispatches the actual apiCall / refetch. This keeps the
 * component event-only, mirroring the AddToCartPanel pattern.
 */
export function CartItemRow({
    item,
    quantityLabel = '수량',
    deleteLabel = '삭제',
    decreaseLabel = 'decrease quantity',
    increaseLabel = 'increase quantity',
    applyLabel = '변경',
    minQuantity = 1,
    maxQuantity = 99,
    className,
}: CartItemRowProps): React.ReactElement {
    const [localQty, setLocalQty] = React.useState<number>(item.quantity);
    const [busy, setBusy] = React.useState(false);

    React.useEffect(() => {
        setLocalQty(item.quantity);
    }, [item.quantity]);

    const clamp = (n: number) => Math.max(minQuantity, Math.min(maxQuantity, Math.floor(n)));

    const fire = (name: string, detail: Record<string, unknown>) => {
        try {
            window.dispatchEvent(new CustomEvent(name, { detail }));
        } catch {
            /* ignore */
        }
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = parseInt(e.target.value, 10);
        setLocalQty(clamp(Number.isNaN(v) ? minQuantity : v));
    };

    const onBlur = () => {
        if (localQty !== item.quantity) {
            setBusy(true);
            fire('scm:cart-qty-change', { id: item.id, quantity: localQty });
            window.setTimeout(() => setBusy(false), 1200);
        }
    };

    const onDelete = () => {
        fire('scm:cart-delete', { ids: [item.id] });
    };

    const name = item.product?.name_localized ?? item.product?.name ?? 'Product';
    const code = item.product?.product_code ?? item.product?.code;
    const { src: thumbSrc } = resolveStillLifeThumb({
        id: item.product?.id ?? item.id,
        product_code: item.product?.product_code ?? item.product?.code ?? code,
        thumbnail_url: item.product?.thumbnail_url ?? null,
        thumbnail_slot: item.product?.thumbnail_slot ?? null,
    });
    const unitPrice = item.unit_price ?? item.product_option?.selling_price ?? item.product?.selling_price;
    const unitPriceFormatted = item.unit_price_formatted
        ?? item.product_option?.selling_price_formatted
        ?? item.product?.selling_price_formatted;
    const lineTotal = item.subtotal ?? item.line_total ?? (unitPrice !== undefined ? Number(unitPrice) * item.quantity : undefined);
    const lineTotalFormatted = item.subtotal_formatted ?? item.line_total_formatted;
    const optionName = item.product_option?.option_name_localized || item.product_option?.option_name || item.option?.name;

    return (
        <Div
            className={className}
            data-testid="cart-item-row"
            data-item-id={item.id}
            style={{
                display: 'grid',
                gridTemplateColumns: '5.25rem 1fr auto',
                gap: 'var(--scm-spacing-md, 1rem)',
                padding: 'var(--scm-spacing-lg, 1.5rem) 0',
                borderBottom: '1px solid var(--scm-line, #E4DCCE)',
                alignItems: 'flex-start',
            }}
        >
            <Div
                style={{
                    width: '5.25rem',
                    aspectRatio: '1 / 1',
                    borderRadius: 'var(--scm-radius-sm, 4px)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                    border: '1px solid var(--scm-line, #E4DCCE)',
                }}
            >
                <Img
                    src={thumbSrc}
                    alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            </Div>
            <Div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-2xs, 0.25rem)',
                    minWidth: 0,
                }}
            >
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                    }}
                >
                    <Span
                        style={{
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: '0.9375rem',
                            fontWeight: 600,
                            color: 'var(--scm-text-primary, #26221E)',
                            wordBreak: 'break-word',
                            lineHeight: 1.4,
                        }}
                    >
                        {name}
                    </Span>
                    {code ? (
                        <Span
                            style={{
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                fontSize: '0.6875rem',
                                color: 'var(--scm-text-muted, #8A837B)',
                                letterSpacing: '0.04em',
                            }}
                        >
                            {code}
                        </Span>
                    ) : null}
                </Div>
                {optionName ? (
                    <Span
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.75rem',
                            color: 'var(--scm-text-muted, #8A837B)',
                        }}
                    >
                        옵션: {optionName}
                    </Span>
                ) : null}
                <Span
                    style={{
                        fontFamily: 'var(--scm-font-body, system-ui)',
                        fontSize: '0.875rem',
                        color: 'var(--scm-text-body, #4A4643)',
                        marginTop: '2px',
                    }}
                >
                    {unitPriceFormatted ?? formatPrice(unitPrice)}
                </Span>
                <Div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                        marginTop: 'var(--scm-spacing-sm, 0.75rem)',
                    }}
                >
                    <Div
                        role="group"
                        aria-label={quantityLabel}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'stretch',
                            border: '1px solid var(--scm-line, #E4DCCE)',
                            borderRadius: 'var(--scm-radius-sm, 4px)',
                            overflow: 'hidden',
                            backgroundColor: 'var(--scm-paper, #FAF8F3)',
                        }}
                    >
                        <Button
                            type="button"
                            aria-label={decreaseLabel}
                            onClick={() => setLocalQty((q) => clamp(q - 1))}
                            disabled={localQty <= minQuantity}
                            data-scm-interactive
                            style={{
                                padding: '0 0.6rem',
                                minHeight: '36px',
                                background: 'transparent',
                                border: 'none',
                                cursor: localQty <= minQuantity ? 'not-allowed' : 'pointer',
                                color: 'var(--scm-text-primary, #26221E)',
                                fontSize: '0.95rem',
                                fontFamily: 'var(--scm-font-body, system-ui)',
                            }}
                        >
                            −
                        </Button>
                        <Input
                            type="number"
                            inputMode="numeric"
                            min={minQuantity}
                            max={maxQuantity}
                            value={localQty}
                            onChange={onChange}
                            onBlur={onBlur}
                            aria-label={quantityLabel}
                            data-testid="cart-qty-input"
                            style={{
                                width: '2.75rem',
                                padding: '0.35rem 0.25rem',
                                textAlign: 'center',
                                border: 'none',
                                borderLeft: '1px solid var(--scm-line, #E4DCCE)',
                                borderRight: '1px solid var(--scm-line, #E4DCCE)',
                                background: 'transparent',
                                color: 'var(--scm-text-primary, #26221E)',
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                MozAppearance: 'textfield',
                            }}
                        />
                        <Button
                            type="button"
                            aria-label={increaseLabel}
                            onClick={() => setLocalQty((q) => clamp(q + 1))}
                            disabled={localQty >= maxQuantity}
                            data-scm-interactive
                            style={{
                                padding: '0 0.6rem',
                                minHeight: '36px',
                                background: 'transparent',
                                border: 'none',
                                cursor: localQty >= maxQuantity ? 'not-allowed' : 'pointer',
                                color: 'var(--scm-text-primary, #26221E)',
                                fontSize: '0.95rem',
                                fontFamily: 'var(--scm-font-body, system-ui)',
                            }}
                        >
                            +
                        </Button>
                    </Div>
                    <Button
                        type="button"
                        onClick={onBlur}
                        disabled={busy || localQty === item.quantity}
                        data-testid="cart-qty-apply"
                        data-scm-interactive
                        style={{
                            minHeight: '36px',
                            padding: '0 var(--scm-spacing-sm, 0.75rem)',
                            background: 'transparent',
                            border: '1px solid var(--scm-line, #E4DCCE)',
                            borderRadius: 'var(--scm-radius-sm, 4px)',
                            color: 'var(--scm-text-primary, #26221E)',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            cursor: busy || localQty === item.quantity ? 'not-allowed' : 'pointer',
                            opacity: busy || localQty === item.quantity ? 0.5 : 1,
                        }}
                    >
                        {applyLabel}
                    </Button>
                </Div>
            </Div>
            <Div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: 'var(--scm-spacing-sm, 0.75rem)',
                    minHeight: '5.25rem',
                }}
            >
                <Span
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--scm-text-primary, #26221E)',
                    }}
                >
                    {lineTotalFormatted ?? formatPrice(lineTotal)}
                </Span>
                <Button
                    type="button"
                    onClick={onDelete}
                    aria-label={deleteLabel}
                    data-testid="cart-item-delete"
                    data-scm-interactive
                    style={{
                        minHeight: '36px',
                        padding: '0 var(--scm-spacing-sm, 0.75rem)',
                        background: 'transparent',
                        border: '1px solid var(--scm-line, #E4DCCE)',
                        borderRadius: 'var(--scm-radius-sm, 4px)',
                        color: 'var(--scm-text-muted, #8A837B)',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                    }}
                >
                    {deleteLabel}
                </Button>
            </Div>
        </Div>
    );
}

function formatPrice(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    try {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value);
    } catch {
        return String(value);
    }
}

export default CartItemRow;
