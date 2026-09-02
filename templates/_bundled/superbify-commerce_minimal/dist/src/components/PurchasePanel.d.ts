import { default as React } from 'react';
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
    values_localized?: string[];
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
export declare const PurchasePanel: (props: PurchasePanelProps) => React.ReactElement;
export default PurchasePanel;
