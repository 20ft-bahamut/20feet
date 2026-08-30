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
 */
export declare function businessFields(locale?: TemplateLocale): BusinessField[];
/** True when at least one business field has a non-empty value. */
export declare function hasBusinessInfo(): boolean;
/** Resolve a policy document by page key ('shipping' maps to shippingReturns). */
export declare function getPolicyDocument(key: PolicyDocumentKey): PolicyDocument;
/** Policy page hrefs (single place so the footer and routes stay in sync). */
export declare const POLICY_ROUTES: Record<PolicyDocumentKey, string>;
export default businessInfo;
