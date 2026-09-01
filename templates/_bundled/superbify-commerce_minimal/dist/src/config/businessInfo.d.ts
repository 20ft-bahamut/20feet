/**
 * SuperBify Commerce Minimal — Business Information (single edit point access)
 *
 * `config/business-info.json` is the ONLY place store operators edit business
 * information and policy documents. Vite inlines the import, so a one-file
 * edit + rebuild + `template:update` reflects everywhere (footer info row,
 * policy page routes).
 *
 * Rules enforced here:
 *  - Business fields ship as EMPTY strings in the repo default (no fake data).
 *  - `businessFields()` returns ONLY non-empty fields (whitespace-only counts
 *    as empty) so the footer never renders "N/A" / "-" placeholders.
 *  - Number-like values (사업자등록번호 etc.) stay JSON strings so leading
 *    zeros / dashes are preserved — never coerced to numbers.
 */
export type TemplateLocale = 'ko' | 'en';
/** Localized text mirror used by template scaffolding content. */
export interface LocalizedText {
    ko: string;
    en: string;
}
export interface PolicySection {
    heading: LocalizedText;
    paragraphs: LocalizedText[];
}
export interface PolicyDocument {
    title: LocalizedText;
    /** ISO date string; ships empty — rendered only when non-empty. */
    updated: string;
    sections: PolicySection[];
}
export interface ShopInfo {
    shopName: string;
    companyName: string;
    representative: string;
    businessRegistrationNumber: string;
    ecommerceRegistrationNumber: string;
    ecommerceRegistrationAuthority: string;
    businessAddress: string;
    customerServicePhone: string;
    customerServiceEmail: string;
    hostingProvider: string;
    /** User-controlled target URL; only rendered with rel="noopener noreferrer". */
    businessVerificationUrl: string;
}
export interface BusinessInfo {
    shop: ShopInfo;
    policies: {
        terms: PolicyDocument;
        privacy: PolicyDocument;
        shippingReturns: PolicyDocument;
    };
}
/** Policy page selector used by layouts (`documentKey` prop). */
export type PolicyDocumentKey = 'terms' | 'privacy' | 'shipping';
/**
 * One resolvable business field. `label` is the locale-resolved label for
 * immediate rendering; `label_key` is the stable key for future i18n /
 * admin-settings bindings.
 */
export interface BusinessField {
    label_key: string;
    label: string;
    value: string;
    href?: string;
    external?: boolean;
}
/**
 * Bundled business information. The JSON import is inlined by Vite, so this
 * object is the single runtime source of truth.
 */
export declare const businessInfo: BusinessInfo;
/**
 * Current template locale. KO is the template default (per the design system);
 * `en` is resolved from the document language attribute set by the G7 shell.
 */
export declare function resolveTemplateLocale(): TemplateLocale;
/** Read the ko/en mirror for template scaffolding text. */
export declare function localText(text: LocalizedText | null | undefined, locale?: TemplateLocale): string;
/**
 * Non-empty business fields in display order.
 * - Empty / whitespace-only values are skipped entirely.
 * - The verification URL is returned as an `external` field (opens in a new
 *   tab with rel="noopener noreferrer" — it is a user-controlled URL).
 *
 * If `override` is provided, non-empty fields on it win over the static
 * `businessInfo.shop` seed. This is how the StoreFooter overlays admin-
 * configured values onto the demo seed without re-fetching the static JSON
 * at runtime. The mapping mirrors the public read-model exposed by
 * /api/plugins/superbify-commerce-compat/shop-info.
 */
export declare function businessFields(locale?: TemplateLocale, override?: Partial<ShopInfo> | null): BusinessField[];
/**
 * Public-safe basic_info payload shape returned by
 * GET /api/plugins/superbify-commerce-compat/shop-info.
 *
 * Mirrors the controller's PUBLIC_SAFE_FIELDS whitelist. Anything outside
 * this shape is ignored by `applyShopInfoOverride()`.
 */
export interface ShopInfoApiResponse {
    shop_name?: string;
    company_name?: string;
    business_number?: string;
    ceo_name?: string;
    business_type?: string;
    business_category?: string;
    zipcode?: string;
    base_address?: string;
    detail_address?: string;
    phone?: string;
    fax?: string;
    email?: string;
    privacy_officer?: string;
    privacy_officer_email?: string;
    mail_order_number?: string;
    telecom_number?: string;
}
/**
 * Project a raw /shop-info API payload onto the ShopInfo shape the footer
 * renders. Only fields consumed by StoreFooter are mapped; everything else
 * (privacy_officer, telecom_number, business_type, business_category) is
 * ignored for now but exposed in the type for forward compatibility.
 *
 * The output uses empty strings (not null) for unset values so the
 * mergeShopInfo() priority rule treats them as "no admin value".
 */
export declare function applyShopInfoOverride(payload: ShopInfoApiResponse | null | undefined): Partial<ShopInfo>;
/**
 * Default endpoint for the admin shop-info overlay. Override in tests via
 * `__setShopInfoEndpoint` or by passing `shopInfoEndpoint` to <StoreFooter>.
 */
export declare const DEFAULT_SHOP_INFO_ENDPOINT = "/api/plugins/superbify-commerce-compat/shop-info";
export declare function __setShopInfoEndpoint(url: string | null): void;
export declare function getShopInfoEndpoint(): string;
/** True when at least one business field has a non-empty value. */
export declare function hasBusinessInfo(): boolean;
/** Resolve a policy document by page key ('shipping' maps to shippingReturns). */
export declare function getPolicyDocument(key: PolicyDocumentKey): PolicyDocument;
export declare const POLICY_ROUTES: Record<PolicyDocumentKey, string>;
export default businessInfo;
