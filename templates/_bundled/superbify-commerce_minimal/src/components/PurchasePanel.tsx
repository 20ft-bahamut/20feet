import React, { useCallback, useMemo, useState } from 'react';
import { Button, Div, Input, Label, P, Select, Span } from './basic';

// ---------------------------------------------------------------------------
// Types — mirror PublicProductResource contract. See modules/_bundled/
// sirsoft-ecommerce/src/Http/Resources/PublicProductResource.php:99-129 and
// modules/_bundled/sirsoft-ecommerce/src/Http/Requests/Public/
// BulkAddToCartRequest.php:43-56 for the server contract this component emits.
// ---------------------------------------------------------------------------

export interface PurchasePanelOptionValue {
    id?: number | string;
    key?: string | string[] | Record<string, string> | null;
    value?: string | string[] | Record<string, string> | null;
    name?: string | string[] | Record<string, string> | null;
    is_sold_out?: boolean;
    stock_quantity?: number | null;
    price_adjustment?: number | string | null;
}

export interface PurchasePanelOptionGroup {
    id?: number | string;
    key?: string | null;
    name?: string | string[] | Record<string, string> | null;
    name_localized?: string | string[] | Record<string, string> | null;
    values?: PurchasePanelOptionValue[];
    values_localized?: string[]; // OPT-020 UI fallback strings
}

export interface PurchasePanelOption {
    id?: number | string;
    /** Array of value identifiers in canonical order (per group). */
    option_values?: Array<string | number | null>;
    /** Localized labels in the same order (some APIs merge here). */
    option_values_localized?: Array<string | string[] | Record<string, string> | null>;
    is_sold_out?: boolean;
    stock_quantity?: number | null;
    is_active?: boolean;
    /** Numeric price adjustment for this combination. */
    additional_price?: number | string | null;
    price_adjustment?: number | string | null;
}

export interface PurchasePanelAdditionalValue {
    id?: number | string;
    name?: string | string[] | Record<string, string> | null;
    price_adjustment?: number | string | null;
    price_adjustment_formatted?: string;
    is_default?: boolean;
    allow_custom_text?: boolean;
}

export interface PurchasePanelAdditionalOption {
    id?: number | string;
    name?: string | string[] | Record<string, string> | null;
    is_required?: boolean;
    values?: PurchasePanelAdditionalValue[];
    sort_order?: number;
}

export interface PurchasePanelProductData {
    id?: number | string;
    /** 2D option model. */
    option_groups?: PurchasePanelOptionGroup[];
    /** Combination enumeration — each row matches one tuple of option values. */
    options?: PurchasePanelOption[];
    /** POST /cart bulk items additional options. */
    additional_options?: PurchasePanelAdditionalOption[];
    /** Numeric caps. */
    max_purchase_qty?: number | null;
    min_purchase_qty?: number | null;
    stock_quantity?: number | null;
    /** Numeric price for the base product. */
    selling_price?: number | string | null;
    selling_price_formatted?: string;
}

export interface PurchasePanelItem {
    product_option_id?: number | string | null;
    quantity: number;
    additional_option_selections?: PurchasePanelAdditionalSelection[];
}

export interface PurchasePanelAdditionalSelection {
    additional_option_id: number | string;
    value_id: number | string;
    custom_text?: string | null;
}

export interface PurchasePanelDispatchDetail {
    productId: number | string;
    productName?: string;
    mode: 'add' | 'buy';
    items: PurchasePanelItem[];
}

export interface PurchasePanelProps {
    productId: number | string;
    productName?: string;
    salesStatus?: string | null;
    productData?: PurchasePanelProductData | null;
    /** True while product data source is loading — renders skeleton. */
    loading?: boolean;
    // Optional override labels (from $t: keys resolved server-side)
    addToCartLabel?: string;
    buyNowLabel?: string;
    quantityLabel?: string;
    soldOutLabel?: string;
    stoppedLabel?: string;
    totalLabel?: string;
    optionsGuideLabel?: string;
    selectOptionSuffixLabel?: string;
    selectUpperOptionFirstLabel?: string;
    soldOutSuffixLabel?: string;
    requiredMarker?: string;
    additionalOptionPlaceholder?: string;
    customTextLabel?: string;
    customTextPlaceholder?: string;
    additionalOptionsAmountLabel?: string;
    soldOutGroupValueLabel?: string;
    className?: string;
}

const DEFAULT_LOCALE = 'ko';

function resolveLabel(
    value: string | string[] | Record<string, string> | null | undefined,
    locale: string = DEFAULT_LOCALE
): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
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

function numericValue(v: unknown): number {
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    if (typeof v === 'string') {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
}

interface SelectedBlock {
    /** Index in the option row match (used for stable React keys). */
    optionId: string;
    /** Resolved combo labels in group order. */
    labels: string[];
    /** Stock from option row. */
    stockQuantity: number;
    /** Initial quantity from product.min/max caps. */
    quantity: number;
    /** Additional selections: additionalOptionId → { valueId, customText }. */
    additionalSelections: Record<string, { valueId: string; customText: string }>;
}

/**
 * Derive option groups. If `option_groups` is present use it as-is.
 * Otherwise derive from options[].option_values/option_values_localized for
 * the UI fallback path (OPT-020 UI fallback).
 */
function deriveOptionGroups(productData: PurchasePanelProductData | null | undefined): {
    groups: PurchasePanelOptionGroup[];
    derivedFromValues: boolean;
} {
    if (productData?.option_groups && productData.option_groups.length > 0) {
        return { groups: productData.option_groups, derivedFromValues: false };
    }
    const options = productData?.options ?? [];
    if (options.length <= 1) {
        // 1D/no-option path — do not synthesize groups.
        return { groups: [], derivedFromValues: false };
    }
    const first = options[0];
    const valuesArr = first?.option_values_localized ?? first?.option_values ?? [];
    if (!Array.isArray(valuesArr) || valuesArr.length === 0) {
        return { groups: [], derivedFromValues: false };
    }
    return {
        groups: [
            {
                id: 'derived_0',
                key: 'option_0',
                name: '옵션',
                name_localized: '옵션',
                values_localized: valuesArr.map((v) => (typeof v === 'string' ? v : resolveLabel(String(v)))),
            },
        ],
        derivedFromValues: true,
    };
}

/**
 * Read the value at position g of an option row. option_values may be:
 *   - a flat array of ids/labels (string | number)
 *   - an array of [id, label] tuples
 *   - an array of {key, value} localized-name objects (PublicProductResource
 *     sends {key: {ko, en}, value: {ko, en}} per dimension — resolveLabel maps
 *     them to the localized label so row matching works against group labels)
 *   - null/undefined entries
 * Returns the stringified candidate for matching, or null if not found.
 */
function readOptionValueAt(opt: PurchasePanelOption, g: number): string | null {
    const ov = opt.option_values ?? [];
    const cand: unknown = ov[g];
    if (cand == null) return null;
    if (typeof cand === 'object' && !Array.isArray(cand)) {
        const rec = cand as Record<string, unknown>;
        return resolveLabel((rec.value ?? rec.name ?? rec) as never) || null;
    }
    if (Array.isArray(cand)) {
        const v = cand[0];
        if (v == null) return null;
        return String(v);
    }
    return String(cand);
}

/**
 * Returns true when no row of `options` matches the partial selection with the
 * final value AND every candidate-matching row is sold-out (so the user cannot
 * complete any in-stock combination through this value).
 *
 * `selection[g]` is first passed through `resolvePriorId` which collapses the
 * stored number (either the underlying value id or the row index) into the
 * canonical candidate string the option row tuples use.
 */
function isValueSoldOutForGroup(
    groupIndex: number,
    candidateId: string,
    selection: Record<number, number>,
    options: PurchasePanelOption[],
    resolvePriorId: (g: number, sel: number) => string,
): boolean {
    if (options.length === 0) return false;
    let hasCandidate = false;
    let allCandidateSoldOut = true;
    for (const opt of options) {
        let priorMatches = true;
        for (let g = 0; g < groupIndex; g++) {
            const wantVal = resolvePriorId(g, selection[g] as number);
            const have = readOptionValueAt(opt, g);
            if (have === wantVal) continue;
            const labels = opt.option_values_localized ?? [];
            if (String(labels[g] ?? '') === wantVal) continue;
            priorMatches = false;
            break;
        }
        if (!priorMatches) continue;
        const cand = readOptionValueAt(opt, groupIndex);
        if (cand !== candidateId) continue;
        hasCandidate = true;
        const isSoldOut = opt.is_sold_out === true;
        const stock = numericValue(opt.stock_quantity);
        if (!isSoldOut && stock > 0) {
            allCandidateSoldOut = false;
            break;
        }
    }
    return hasCandidate && allCandidateSoldOut;
}

function PurchasePanelSkeleton({ className }: { className?: string }): React.ReactElement {
    const bar = (w: string, h: number): React.CSSProperties => ({
        display: 'block',
        width: w,
        height: h,
        borderRadius: 'var(--scm-radius-sm, 4px)',
        backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
    });
    return (
        <Div
            className={className}
            data-testid="purchase-panel-skeleton"
            aria-hidden
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--scm-spacing-md, 1rem)',
            }}
        >
            <Div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--scm-spacing-sm, 0.75rem)' }}>
                <Span style={bar('40%', 14)} />
                <Span style={bar('24%', 14)} />
            </Div>
            <Div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Span style={bar('30%', 14)} />
                <Span style={bar('20%', 20)} />
            </Div>
            <Div style={{ display: 'flex', gap: 'var(--scm-spacing-sm, 0.75rem)' }}>
                <Div style={{ ...bar('50%', 52), borderRadius: 'var(--scm-radius, 4px)' }} />
                <Div style={{ ...bar('24%', 52), borderRadius: 'var(--scm-radius, 4px)', border: '1px solid var(--scm-line, #E4DCCE)', backgroundColor: 'transparent' }} />
            </Div>
        </Div>
    );
}

function PurchasePanelImpl(props: PurchasePanelProps): React.ReactElement {
    const {
        productId,
        productName,
        salesStatus,
        productData,
        addToCartLabel = '장바구니 담기',
        buyNowLabel = '바로구매',
        quantityLabel = '수량',
        soldOutLabel = '품절',
        stoppedLabel = '판매중지',
        totalLabel = '총 결제 예상금액',
        optionsGuideLabel = '옵션을 선택해 주세요.',
        selectOptionSuffixLabel = ' 선택',
        selectUpperOptionFirstLabel = '상위 옵션을 먼저 선택해 주세요',
        soldOutSuffixLabel = ' (품절)',
        requiredMarker = ' *',
        additionalOptionPlaceholder = '추가 옵션을 선택해 주세요',
        customTextLabel = '직접 입력',
        customTextPlaceholder = '직접 입력 (최대 255자)',
        className,
    } = props;

    const isOnSale = salesStatus === 'on_sale' || salesStatus === undefined || salesStatus === null;
    const isSoldOut = salesStatus === 'sold_out';
    const isStopped = salesStatus === 'stopped';

    // Plain-product mode (no cascading options).
    const options = productData?.options ?? [];
    const plainHasOptionId = options.length === 1 && options[0]?.id != null;
    const isPlain = options.length <= 1 && (!productData?.option_groups || productData.option_groups.length === 0);

    const { groups } = useMemo(() => deriveOptionGroups(productData), [productData]);
    const groupValueCounts: number[] = useMemo(
        () =>
            groups.map((g) => {
                if (Array.isArray(g.values) && g.values.length > 0) return g.values.length;
                if (Array.isArray(g.values_localized) && g.values_localized.length > 0) return g.values_localized.length;
                return 0;
            }),
        [groups],
    );

    const [currentSelection, setCurrentSelection] = useState<Record<number, number>>({});
    const [blocks, setBlocks] = useState<SelectedBlock[]>([]);
    const [plainQuantity, setPlainQuantity] = useState(1);
    const [submitting, setSubmitting] = useState<'add' | 'buy' | null>(null);
    const [errorText, setErrorText] = useState<string | null>(null);

    const maxPurchase = numericValue(productData?.max_purchase_qty);
    const minPurchase = productData?.min_purchase_qty && numericValue(productData.min_purchase_qty) > 0
        ? numericValue(productData.min_purchase_qty)
        : 1;
    const stockQuantity = numericValue(productData?.stock_quantity);

    const clampQty = useCallback(
        (next: number, stockOverride?: number): number => {
            if (Number.isNaN(next)) return minPurchase;
            const cappedStock = stockOverride != null ? stockOverride : stockQuantity;
            const cap = maxPurchase > 0 ? maxPurchase : (cappedStock > 0 ? cappedStock : 999);
            return Math.max(minPurchase, Math.min(cap, Math.floor(next)));
        },
        [minPurchase, maxPurchase, stockQuantity],
    );

    const groupLabel = useCallback(
        (group: PurchasePanelOptionGroup, idx: number): string => {
            return resolveLabel(group.name_localized ?? group.name) || `옵션 ${idx + 1}`;
        },
        [],
    );

    const valueLabel = useCallback(
        (group: PurchasePanelOptionGroup, valueIndex: number): string => {
            const vals = group.values;
            if (Array.isArray(vals) && vals[valueIndex]) {
                const v = vals[valueIndex] as Record<string, unknown>;
                // API shape values[]: {ko, en, ...} localized-name objects (values_localized mirrors them).
                const label = resolveLabel((v.value ?? v.name ?? v) as never) || '';
                return label || String(valueIndex);
            }
            const vl = group.values_localized;
            if (Array.isArray(vl) && vl[valueIndex] != null) return String(vl[valueIndex]);
            return String(valueIndex);
        },
        [],
    );

    /**
     * Resolve `sel[g]` (which may be an index or the underlying value id) to
     * the canonical candidate-id string used by the option row tuples.
     */
    const resolveSelectionId = useCallback(
        (g: number, sel: number): string => {
            const grp = groups[g];
            const vals = grp?.values;
            if (Array.isArray(vals) && vals.length > 0) {
                // Stored value may be either the numeric id or the row index.
                const byId = vals.find((v) => v.id != null && String(v.id) === String(sel));
                if (byId) return String(byId.id);
                const row = vals[sel];
                if (row) {
                    if (row.id != null) return String(row.id);
                    // Localized-name object values ({ko, en}) — match option rows by label.
                    const rec = row as Record<string, unknown>;
                    const label = resolveLabel((rec.value ?? rec.name ?? rec) as never);
                    if (label) return label;
                }
                return String(sel);
            }
            return String(sel);
        },
        [groups],
    );

    const valueSoldOut = useCallback(
        (groupIndex: number, valueIndex: number): boolean => {
            // Resolve select index → underlying value id (when groups.values[] is used).
            // For OPT-020 UI fallback path (values_localized only), the index is
            // compared directly because option_values_localized mirrors it.
            const grp = groups[groupIndex];
            const vals = grp?.values;
            let candidateId: string;
            if (Array.isArray(vals) && vals[valueIndex]) {
                const v = vals[valueIndex] as Record<string, unknown>;
                if (v.id != null) candidateId = String(v.id);
                else candidateId = resolveLabel((v.value ?? v.name ?? v) as never) || String(valueIndex);
            } else {
                candidateId = String(valueIndex);
            }
            return isValueSoldOutForGroup(
                groupIndex,
                candidateId,
                currentSelection,
                options,
                resolveSelectionId,
            );
        },
        [currentSelection, options, groups, resolveSelectionId],
    );

    /**
     * Find the option row matching the full selection across all groups.
     * Returns the row + labels for display.
     */
    const findMatchingOption = useCallback(
        (sel: Record<number, number>): { row: PurchasePanelOption | null; labels: string[] } => {
            if (options.length === 0) return { row: null, labels: [] };
            const groupOrder = Object.keys(sel).map((k) => Number(k)).sort((a, b) => a - b);
            // All groups selected?
            if (groupOrder.length !== groups.length) return { row: null, labels: [] };
            const labels: string[] = [];
            for (let g = 0; g < groups.length; g++) {
                labels.push(valueLabel(groups[g], sel[g] ?? 0));
            }
            const candidates = groupOrder.map((g) => resolveSelectionId(g, sel[g] as number));
            const row = options.find((opt) => {
                for (let gi = 0; gi < groupOrder.length; gi++) {
                    const g = groupOrder[gi];
                    const wantVal = candidates[gi];
                    const have = readOptionValueAt(opt, g);
                    if (have === wantVal) continue;
                    const labels = opt.option_values_localized ?? [];
                    if (String(labels[g] ?? '') === wantVal) continue;
                    return false;
                }
                return true;
            }) ?? null;
            return { row, labels };
        },
        [groups, options, valueLabel, resolveSelectionId],
    );

    const handleGroupChange = useCallback(
        (groupIndex: number, raw: string) => {
            setErrorText(null);
            if (raw === '') {
                setCurrentSelection((prev) => {
                    const next: Record<number, number> = { ...prev };
                    delete next[groupIndex];
                    return next;
                });
                return;
            }
            const valueIndex = Number(raw);
            // Map select index → underlying value id (when groups.values[] is used)
            const grp = groups[groupIndex];
            const vals = grp?.values;
            // Always keep currentSelection numeric (option row comparison happens
            // via string comparison in findMatchingOption / isValueSoldOutForGroup
            // — `selection[g]` is coerced with String() before matching).
            let storedValue: number = valueIndex;
            if (Array.isArray(vals) && vals[valueIndex]) {
                const v = vals[valueIndex];
                if (v.id != null) {
                    const parsed = Number(v.id);
                    if (Number.isFinite(parsed)) {
                        storedValue = parsed;
                    }
                }
            }
            const sel = { ...currentSelection, [groupIndex]: storedValue };
            setCurrentSelection(sel);
            // Cascading: clear later groups when earlier group changes.
            for (let g = groupIndex + 1; g < groups.length; g++) {
                if (sel[g] !== undefined) delete sel[g];
            }
            setCurrentSelection(sel);
            // If all groups are now selected, add a new block.
            const filled = groups.every((_, idx) => sel[idx] !== undefined);
            if (filled) {
                const { row, labels } = findMatchingOption(sel);
                if (row && !row.is_sold_out) {
                    const stockRow = numericValue(row.stock_quantity);
                    const block: SelectedBlock = {
                        optionId: String(row.id ?? `${labels.join('/')}`),
                        labels,
                        stockQuantity: stockRow,
                        quantity: clampQty(1, stockRow),
                        additionalSelections: {},
                    };
                    setBlocks((prev) => [...prev, block]);
                    // Reset selection for next combination.
                    setCurrentSelection({});
                }
            }
        },
        [currentSelection, groups, findMatchingOption, clampQty],
    );

    const isGroupDisabled = useCallback(
        (groupIndex: number): boolean => {
            if (groupIndex === 0) return false;
            return currentSelection[groupIndex - 1] === undefined;
        },
        [currentSelection],
    );

    const updateBlockQty = useCallback(
        (idx: number, delta: number) => {
            setBlocks((prev) =>
                prev.map((b, i) => {
                    if (i !== idx) return b;
                    const stockCap = b.stockQuantity > 0 ? b.stockQuantity : 999;
                    const cap = maxPurchase > 0 ? Math.min(maxPurchase, stockCap) : stockCap;
                    const next = Math.max(minPurchase, Math.min(cap, b.quantity + delta));
                    return { ...b, quantity: next };
                }),
            );
        },
        [minPurchase, maxPurchase],
    );

    const setBlockQty = useCallback(
        (idx: number, raw: string) => {
            const n = Number(raw);
            setBlocks((prev) =>
                prev.map((b, i) => {
                    if (i !== idx) return b;
                    const stockCap = b.stockQuantity > 0 ? b.stockQuantity : 999;
                    const cap = maxPurchase > 0 ? Math.min(maxPurchase, stockCap) : stockCap;
                    const next = Math.max(minPurchase, Math.min(cap, Number.isFinite(n) ? Math.floor(n) : minPurchase));
                    return { ...b, quantity: next };
                }),
            );
        },
        [minPurchase, maxPurchase],
    );

    const removeBlock = useCallback((idx: number) => {
        setBlocks((prev) => prev.filter((_, i) => i !== idx));
    }, []);

    const setBlockAdditional = useCallback(
        (idx: number, additionalOptionId: string, valueId: string, customText?: string) => {
            setBlocks((prev) =>
                prev.map((b, i) => {
                    if (i !== idx) return b;
                    const existing = b.additionalSelections[additionalOptionId];
                    const next: SelectedBlock['additionalSelections'] = { ...b.additionalSelections };
                    if (!valueId) {
                        delete next[additionalOptionId];
                    } else {
                        next[additionalOptionId] = {
                            valueId,
                            customText: customText ?? (existing?.customText ?? ''),
                        };
                    }
                    return { ...b, additionalSelections: next };
                }),
            );
        },
        [],
    );

    /**
     * Validate selected blocks (catches missing required additional options).
     */
    const validate = useCallback((): string | null => {
        const additional = productData?.additional_options ?? [];
        for (let i = 0; i < blocks.length; i++) {
            const b = blocks[i];
            for (const addOpt of additional) {
                if (!addOpt.is_required) continue;
                const sel = b.additionalSelections[String(addOpt.id ?? '')];
                if (!sel || !sel.valueId) {
                    return `'${resolveLabel(addOpt.name)}' 필수 추가 옵션을 선택해 주세요.`;
                }
                const val = (addOpt.values ?? []).find((v) => String(v.id) === String(sel.valueId));
                if (val?.allow_custom_text === true && !sel.customText.trim()) {
                    return `'${resolveLabel(addOpt.name)}' 직접 입력 값을 입력해 주세요.`;
                }
            }
        }
        return null;
    }, [blocks, productData]);

    /**
     * Build dispatch payload from blocks (or plain quantity fallback).
     */
    const buildItems = useCallback((): PurchasePanelItem[] => {
        if (isPlain) {
            const item: PurchasePanelItem = { quantity: clampQty(plainQuantity) };
            if (plainHasOptionId && options[0]?.id != null) {
                item.product_option_id = options[0].id;
            }
            return [item];
        }
        return blocks.map((b) => {
            const additional: PurchasePanelAdditionalSelection[] = [];
            for (const [addOptIdRaw, sel] of Object.entries(b.additionalSelections)) {
                if (!sel.valueId) continue;
                const entry: PurchasePanelAdditionalSelection = {
                    additional_option_id: addOptIdRaw,
                    value_id: sel.valueId,
                };
                if (sel.customText && sel.customText.trim()) entry.custom_text = sel.customText;
                additional.push(entry);
            }
            const item: PurchasePanelItem = {
                product_option_id: b.optionId,
                quantity: b.quantity,
            };
            if (additional.length > 0) item.additional_option_selections = additional;
            return item;
        });
    }, [isPlain, plainHasOptionId, options, blocks, plainQuantity, clampQty]);

    /**
     * Estimated total (for client-side display only; server re-validates).
     */
    const estimatedTotal = useMemo((): number => {
        const base = numericValue(productData?.selling_price);
        if (isPlain) {
            return clampQty(plainQuantity) * base;
        }
        const additional = productData?.additional_options ?? [];
        let sum = 0;
        for (const b of blocks) {
            const blockAdd = additional.reduce((acc, ao) => {
                const sel = b.additionalSelections[String(ao.id ?? '')];
                if (!sel?.valueId) return acc;
                const v = (ao.values ?? []).find((vv) => String(vv.id) === String(sel.valueId));
                return acc + numericValue(v?.price_adjustment);
            }, 0);
            sum += (base + blockAdd) * b.quantity;
        }
        return sum;
    }, [productData, isPlain, plainQuantity, blocks, clampQty]);

    const dispatch = useCallback(
        (mode: 'add' | 'buy') => {
            if (!isOnSale || submitting !== null) return;
            if (!isPlain && blocks.length === 0) {
                setErrorText('옵션을 선택해 주세요.');
                return;
            }
            const err = validate();
            if (err) {
                setErrorText(err);
                return;
            }
            setErrorText(null);
            setSubmitting(mode);
            const items = buildItems();
            const detail: PurchasePanelDispatchDetail = {
                productId,
                productName,
                mode,
                items,
            };
            try {
                window.dispatchEvent(new CustomEvent('scm:add-to-cart', { detail }));
            } finally {
                window.setTimeout(() => setSubmitting(null), 1200);
            }
        },
        [isOnSale, submitting, isPlain, blocks, validate, buildItems, productId, productName],
    );

    // ------- Render ----------------------------------------------------------

    const plainQty = clampQty(plainQuantity);
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
            {/* Option selector (groups present + multi-row options) */}
            {!isPlain && groups.length > 0 ? (
                <Div
                    data-testid="option-selector"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                    }}
                >
                    {blocks.length === 0 ? (
                        <P
                            style={{
                                fontSize: '0.85rem',
                                color: 'var(--scm-text-body, #4A4643)',
                                margin: 0,
                            }}
                        >
                            {optionsGuideLabel}
                        </P>
                    ) : null}
                    {groups.map((g, gi) => {
                        const totalValues = groupValueCounts[gi] ?? 0;
                        const disabled = isGroupDisabled(gi);
                        return (
                            <Div
                                key={`option-group-${gi}`}
                                data-testid={`option-group-${gi}`}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--scm-spacing-xs, 0.5rem)',
                                }}
                            >
                                <Label
                                    htmlFor={`scm-option-select-${gi}`}
                                    style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--scm-text-muted, #8A837B)',
                                        fontWeight: 500,
                                    }}
                                >
                                    {groupLabel(g, gi)}
                                </Label>
                                <Select
                                    id={`scm-option-select-${gi}`}
                                    name={`option_${gi}`}
                                    data-testid={`option-group-select-${gi}`}
                                    disabled={disabled}
                                    value={currentSelection[gi] != null ? String(currentSelection[gi]) : ''}
                                    onChange={(e) => handleGroupChange(gi, (e.target as HTMLSelectElement).value)}
                                    style={{
                                        padding: '0.55rem 0.75rem',
                                        border: '1px solid var(--scm-line, #E4DCCE)',
                                        borderRadius: 'var(--scm-radius-sm, 4px)',
                                        background: disabled ? 'var(--scm-surface-2, #F4EFE6)' : 'var(--scm-surface, #FAF8F3)',
                                        color: 'var(--scm-text-body, #4A4643)',
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    <option value="">
                                        {disabled
                                            ? selectUpperOptionFirstLabel
                                            : `${groupLabel(g, gi)}${selectOptionSuffixLabel}`}
                                    </option>
                                    {Array.from({ length: totalValues }).map((_, vi) => {
                                        const sold = valueSoldOut(gi, vi);
                                        return (
                                            <option key={`opt-${gi}-${vi}`} value={String(vi)} disabled={sold}>
                                                {valueLabel(g, vi)}{sold ? soldOutSuffixLabel : ''}
                                            </option>
                                        );
                                    })}
                                </Select>
                            </Div>
                        );
                    })}
                </Div>
            ) : null}

            {/* Selected option blocks */}
            {!isPlain && blocks.length > 0 ? (
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                    }}
                >
                    {blocks.map((b, idx) => {
                        const blockCap = b.stockQuantity > 0 ? Math.min(maxPurchase > 0 ? maxPurchase : b.stockQuantity, b.stockQuantity) : (maxPurchase > 0 ? maxPurchase : 999);
                        void blockCap;
                        const additional = productData?.additional_options ?? [];
                        const blockAddSum = additional.reduce((acc, ao) => {
                            const sel = b.additionalSelections[String(ao.id ?? '')];
                            if (!sel?.valueId) return acc;
                            const v = (ao.values ?? []).find((vv) => String(vv.id) === String(sel.valueId));
                            return acc + numericValue(v?.price_adjustment);
                        }, 0);
                        const lineTotal = (numericValue(productData?.selling_price) + blockAddSum) * b.quantity;
                        const lineFormatted = `${lineTotal.toLocaleString()}원`;
                        return (
                            <Div
                                key={`block-${idx}`}
                                data-testid={`option-block`}
                                data-option-id={b.optionId}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--scm-spacing-xs, 0.5rem)',
                                    padding: 'var(--scm-spacing-sm, 0.75rem)',
                                    border: '1px solid var(--scm-line, #E4DCCE)',
                                    borderRadius: 'var(--scm-radius-sm, 4px)',
                                    background: 'var(--scm-surface, #FAF8F3)',
                                }}
                            >
                                <Div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                                    }}
                                >
                                    <Span
                                        style={{
                                            fontSize: '0.875rem',
                                            color: 'var(--scm-text-body, #4A4643)',
                                            fontWeight: 500,
                                            flex: 1,
                                            minWidth: 0,
                                        }}
                                    >
                                        {b.labels.join(' / ')}
                                    </Span>
                                    <Button
                                        type="button"
                                        onClick={() => removeBlock(idx)}
                                        aria-label="remove block"
                                        data-testid={`option-block-remove-${idx}`}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            background: 'transparent',
                                            border: '1px solid var(--scm-line, #E4DCCE)',
                                            borderRadius: 'var(--scm-radius-sm, 4px)',
                                            color: 'var(--scm-text-muted, #8A837B)',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        ✕
                                    </Button>
                                </Div>

                                {/* Additional options for this block */}
                                {additional.length > 0 ? (
                                    <Div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 'var(--scm-spacing-xs, 0.5rem)',
                                        }}
                                    >
                                        {additional.map((ao) => {
                                            const selKey = String(ao.id ?? '');
                                            const sel = b.additionalSelections[selKey];
                                            const selVal = (ao.values ?? []).find((v) => String(v.id) === String(sel?.valueId ?? ''));
                                            const showCustom = selVal?.allow_custom_text === true;
                                            return (
                                                <Div
                                                    key={`addopt-${idx}-${selKey}`}
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '0.25rem',
                                                    }}
                                                >
                                                    <Label
                                                        htmlFor={`scm-add-${idx}-${selKey}`}
                                                        style={{
                                                            fontSize: '0.78rem',
                                                            color: 'var(--scm-text-muted, #8A837B)',
                                                        }}
                                                    >
                                                        {resolveLabel(ao.name)}
                                                        {ao.is_required ? (
                                                            <Span
                                                                style={{
                                                                    color: 'var(--scm-error, #B85450)',
                                                                    marginLeft: '0.15rem',
                                                                }}
                                                                aria-hidden="true"
                                                            >
                                                                {requiredMarker}
                                                            </Span>
                                                        ) : null}
                                                    </Label>
                                                    <Select
                                                        id={`scm-add-${idx}-${selKey}`}
                                                        name={`add_option_${idx}_${selKey}`}
                                                        data-testid={`block-additional-${idx}-${selKey}`}
                                                        value={sel?.valueId ?? ''}
                                                        onChange={(e) =>
                                                            setBlockAdditional(idx, selKey, (e.target as HTMLSelectElement).value)
                                                        }
                                                        style={{
                                                            padding: '0.5rem 0.65rem',
                                                            border: '1px solid var(--scm-line, #E4DCCE)',
                                                            borderRadius: 'var(--scm-radius-sm, 4px)',
                                                            background: 'var(--scm-surface, #FAF8F3)',
                                                            color: 'var(--scm-text-body, #4A4643)',
                                                            fontSize: '0.85rem',
                                                        }}
                                                    >
                                                        <option value="">{additionalOptionPlaceholder}</option>
                                                        {(ao.values ?? []).map((v) => {
                                                            const pa = numericValue(v.price_adjustment);
                                                            const base = resolveLabel(v.name);
                                                            const adj = pa > 0 ? ` (+${pa.toLocaleString()}원)` : '';
                                                            return (
                                                                <option key={`v-${v.id}`} value={String(v.id ?? '')}>
                                                                    {`${base}${adj}`}
                                                                </option>
                                                            );
                                                        })}
                                                    </Select>
                                                    {showCustom ? (
                                                        <Div
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '0.25rem',
                                                            }}
                                                        >
                                                            <Label
                                                                htmlFor={`scm-add-text-${idx}-${selKey}`}
                                                                style={{
                                                                    fontSize: '0.78rem',
                                                                    color: 'var(--scm-text-muted, #8A837B)',
                                                                }}
                                                            >
                                                                {customTextLabel}
                                                            </Label>
                                                            <Input
                                                                id={`scm-add-text-${idx}-${selKey}`}
                                                                type="text"
                                                                maxLength={255}
                                                                value={sel?.customText ?? ''}
                                                                placeholder={customTextPlaceholder}
                                                                onChange={(e) =>
                                                                    setBlockAdditional(
                                                                        idx,
                                                                        selKey,
                                                                        sel?.valueId ?? '',
                                                                        (e.target as HTMLInputElement).value,
                                                                    )
                                                                }
                                                                data-testid={`block-additional-text-${idx}-${selKey}`}
                                                                style={{
                                                                    padding: '0.5rem 0.65rem',
                                                                    border: '1px solid var(--scm-line, #E4DCCE)',
                                                                    borderRadius: 'var(--scm-radius-sm, 4px)',
                                                                    background: 'var(--scm-surface, #FAF8F3)',
                                                                    color: 'var(--scm-text-body, #4A4643)',
                                                                    fontSize: '0.85rem',
                                                                }}
                                                            />
                                                        </Div>
                                                    ) : null}
                                                </Div>
                                            );
                                        })}
                                    </Div>
                                ) : null}

                                {/* Qty stepper + line total */}
                                <Div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                                        marginTop: '0.25rem',
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
                                            backgroundColor: 'var(--scm-surface, #FAF8F3)',
                                        }}
                                    >
                                        <Button
                                            type="button"
                                            aria-label="decrease quantity"
                                            onClick={() => updateBlockQty(idx, -1)}
                                            disabled={b.quantity <= minPurchase}
                                            style={{
                                                padding: '0.4rem 0.7rem',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: b.quantity <= minPurchase ? 'not-allowed' : 'pointer',
                                                color: 'var(--scm-text-body, #4A4643)',
                                                fontSize: '0.95rem',
                                            }}
                                        >
                                            −
                                        </Button>
                                        <Input
                                            type="number"
                                            inputMode="numeric"
                                            min={minPurchase}
                                            max={b.stockQuantity > 0 ? Math.min(maxPurchase > 0 ? maxPurchase : b.stockQuantity, b.stockQuantity) : (maxPurchase > 0 ? maxPurchase : 999)}
                                            value={b.quantity}
                                            onChange={(e) => setBlockQty(idx, (e.target as HTMLInputElement).value)}
                                            aria-label="quantity"
                                            data-testid={`block-qty-${idx}`}
                                            style={{
                                                width: '3rem',
                                                padding: '0.4rem 0.25rem',
                                                textAlign: 'center',
                                                border: 'none',
                                                borderLeft: '1px solid var(--scm-line, #E4DCCE)',
                                                borderRight: '1px solid var(--scm-line, #E4DCCE)',
                                                background: 'transparent',
                                                color: 'var(--scm-text-body, #4A4643)',
                                                fontSize: '0.85rem',
                                                MozAppearance: 'textfield',
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            aria-label="increase quantity"
                                            onClick={() => updateBlockQty(idx, +1)}
                                            disabled={(() => {
                                                const stockCap = b.stockQuantity > 0 ? b.stockQuantity : 999;
                                                const cap = maxPurchase > 0 ? Math.min(maxPurchase, stockCap) : stockCap;
                                                return b.quantity >= cap;
                                            })()}
                                            style={{
                                                padding: '0.4rem 0.7rem',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--scm-text-body, #4A4643)',
                                                fontSize: '0.95rem',
                                            }}
                                        >
                                            +
                                        </Button>
                                    </Div>
                                    <Span
                                        data-testid={`block-line-total-${idx}`}
                                        style={{
                                            fontSize: '0.875rem',
                                            color: 'var(--scm-text-body, #4A4643)',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {lineFormatted}
                                    </Span>
                                </Div>
                            </Div>
                        );
                    })}
                </Div>
            ) : null}

            {/* Plain quantity stepper (1D / no-option path) */}
            {isPlain && isOnSale ? (
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
                            onClick={() => setPlainQuantity((q) => clampQty(q - 1))}
                            disabled={plainQty <= minPurchase}
                            style={{
                                padding: '0.5rem 0.85rem',
                                background: 'transparent',
                                border: 'none',
                                cursor: plainQty <= minPurchase ? 'not-allowed' : 'pointer',
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
                            min={minPurchase}
                            max={maxPurchase > 0 ? maxPurchase : (stockQuantity > 0 ? stockQuantity : 999)}
                            value={plainQty}
                            onChange={(e) => setPlainQuantity(clampQty(Number((e.target as HTMLInputElement).value)))}
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
                            onClick={() => setPlainQuantity((q) => clampQty(q + 1))}
                            disabled={plainQty >= (maxPurchase > 0 ? maxPurchase : (stockQuantity > 0 ? stockQuantity : 999))}
                            style={{
                                padding: '0.5rem 0.85rem',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
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

            {/* Estimated total */}
            {isOnSale ? (
                <Div
                    data-testid="purchase-total"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--scm-spacing-sm, 0.75rem) var(--scm-spacing-md, 1rem)',
                        borderTop: '1px solid var(--scm-line, #E4DCCE)',
                        borderBottom: '1px solid var(--scm-line, #E4DCCE)',
                    }}
                >
                    <Span
                        style={{
                            fontSize: '0.85rem',
                            color: 'var(--scm-text-muted, #8A837B)',
                        }}
                    >
                        {totalLabel}
                    </Span>
                    <Span
                        style={{
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: '1.05rem',
                            fontWeight: 600,
                            color: 'var(--scm-text-primary, #26221E)',
                        }}
                    >
                        {estimatedTotal.toLocaleString()}원
                    </Span>
                </Div>
            ) : null}

            {/* Error message */}
            {errorText ? (
                <P
                    role="alert"
                    data-testid="purchase-error"
                    style={{
                        fontSize: '0.85rem',
                        color: 'var(--scm-error, #B85450)',
                        margin: 0,
                    }}
                >
                    {errorText}
                </P>
            ) : null}

            {/* CTA buttons */}
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
                    disabled={!isOnSale || submitting !== null}
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
                        cursor: !isOnSale || submitting !== null ? 'not-allowed' : 'pointer',
                        opacity: !isOnSale || submitting !== null ? 0.55 : 1,
                    }}
                >
                    {ctaLabel ?? (submitting === 'add' ? '담는 중…' : addToCartLabel)}
                </Button>
                {isOnSale ? (
                    <Button
                        type="button"
                        onClick={() => dispatch('buy')}
                        disabled={submitting !== null}
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
                            cursor: submitting !== null ? 'not-allowed' : 'pointer',
                            opacity: submitting !== null ? 0.55 : 1,
                        }}
                    >
                        {submitting === 'buy' ? '이동 중…' : buyNowLabel}
                    </Button>
                ) : null}
            </Div>
        </Div>
    );
}

export const PurchasePanel = (props: PurchasePanelProps): React.ReactElement =>
    props.loading ? <PurchasePanelSkeleton className={props.className} /> : <PurchasePanelImpl {...props} />;
export default PurchasePanel;