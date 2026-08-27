/**
 * SuperBify Commerce Minimal — Template Type Declarations
 *
 * These shapes mirror the JSON returned by `sirsoft-ecommerce` public
 * resources (ProductListResource, PublicProductResource, PublicCategoryResource,
 * PublicCategoryDetailResource) so that React components stay in sync with the
 * actual API contract verified at integration time.
 *
 * Only the fields we read at render time are declared here. Add new fields
 * when the API introduces them — do not invent shapes.
 */

export interface EditorAttrs {
    id?: string;
    'data-testid'?: string;
    'data-block-id'?: string;
    'data-component'?: string;
    [key: `data-${string}`]: string | undefined;
}

export type SalesStatus = 'ONSALE' | 'SOLD_OUT' | 'STOPPED' | 'HIDDEN' | string;
export type DisplayStatus = 'VISIBLE' | 'HIDDEN' | string;

export interface ProductImage {
    id?: number | string;
    url?: string;
    download_url?: string;
    alt_text?: string;
}

export interface ProductItem {
    id: number | string;
    name: string;
    /** i18n-resolved label; falls back to `name` when no localizer is registered. */
    name_localized?: string | null;
    product_code?: string;
    sku?: string;
    /** Public thumbnail URL (may be null on legacy fixtures). */
    thumbnail_url?: string | null;
    /** Optional image list; only loaded on detail responses. */
    images?: ProductImage[];

    list_price?: number | null;
    list_price_formatted?: string | null;
    selling_price?: number | null;
    selling_price_formatted?: string | null;
    discount_rate?: number | string | null;

    sales_status?: SalesStatus;
    sales_status_label?: string;
    sales_status_variant?: string;
    display_status?: DisplayStatus;
    display_status_label?: string;
    display_status_variant?: string;

    stock_quantity?: number | null;
    is_below_safe_stock?: boolean;

    brand_name?: string | null;
    category_name?: string | null;
    primary_category?: string | null;
    review_count?: number | null;
    rating_avg?: number | null;

    short_description?: string | null;
    short_description_localized?: string | null;
    description?: string | null;
    description_localized?: string | null;

    /** Development-only fixture marker. Never render at runtime. */
    isFixture?: boolean;

    /** Localized thumbnail slot id (used by demo fixtures that map to local SVG assets). */
    thumbnail_slot?: string;
    detail_image_slots?: string[];
}

export interface CategoryItem {
    id: number | string;
    name: string;
    name_localized?: string | null;
    slug: string;
    depth: number;
    parent_id?: number | string | null;
    products_count?: number;
    description?: string | null;
    description_localized?: string | null;
    /** Recursive children for tree rendering. */
    children?: CategoryItem[];
    /** Fixture marker — must not appear in real API output. */
    isFixture?: boolean;
}

export interface CartItem {
    id?: number | string;
    product_id?: number | string;
    name?: string;
    name_localized?: string | null;
    quantity?: number;
    unit_price?: number;
    unit_price_formatted?: string;
    line_total?: number;
    line_total_formatted?: string;
    thumbnail_url?: string | null;
}

export interface CartSummary {
    items?: CartItem[];
    item_count?: number;
    subtotal?: number;
    subtotal_formatted?: string;
    shipping_fee?: number;
    shipping_fee_formatted?: string;
    total?: number;
    total_formatted?: string;
    cart_key?: string;
}

export interface CartCount {
    count: number;
}

export interface RouteContext {
    slug?: string;
}

export interface DataSourceResponse<T> {
    data?: T;
    loading?: boolean;
    error?: Error | null;
}

/**
 * Best-effort localized string reader used in layout JSON templates. Returns
 * the supplied fallback when the value is missing or not a string.
 */
export type LocalizedString = string | { ko?: string; en?: string } | null | undefined;
