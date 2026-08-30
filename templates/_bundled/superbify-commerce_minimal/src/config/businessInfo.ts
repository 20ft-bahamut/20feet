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

import businessInfoData from '../../config/business-info.json';

/* ------------------------------------------------------------------ types */

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

/* ------------------------------------------------------------------ data */

/**
 * Bundled business information. The JSON import is inlined by Vite, so this
 * object is the single runtime source of truth.
 */
export const businessInfo: BusinessInfo = businessInfoData as unknown as BusinessInfo;

/* Field definition order = render order. label_key mirrors the lang
   `superbify.business.field.*` keys (kept for future admin binding). */
interface FieldDefinition {
    key: keyof ShopInfo;
    label_key: string;
    labels: Record<TemplateLocale, string>;
}

const FIELD_DEFINITIONS: FieldDefinition[] = [
    { key: 'shopName', label_key: 'superbify.business.field.shop_name', labels: { ko: '상점명', en: 'Shop name' } },
    { key: 'companyName', label_key: 'superbify.business.field.company_name', labels: { ko: '상호', en: 'Company name' } },
    { key: 'representative', label_key: 'superbify.business.field.representative', labels: { ko: '대표자', en: 'Representative' } },
    { key: 'businessRegistrationNumber', label_key: 'superbify.business.field.business_registration_number', labels: { ko: '사업자등록번호', en: 'Business registration no.' } },
    { key: 'ecommerceRegistrationNumber', label_key: 'superbify.business.field.ecommerce_registration_number', labels: { ko: '통신판매업신고번호', en: 'E-commerce registration no.' } },
    { key: 'ecommerceRegistrationAuthority', label_key: 'superbify.business.field.ecommerce_registration_authority', labels: { ko: '신고 관할기관', en: 'Registration authority' } },
    { key: 'businessAddress', label_key: 'superbify.business.field.business_address', labels: { ko: '사업장 주소', en: 'Business address' } },
    { key: 'customerServicePhone', label_key: 'superbify.business.field.customer_service_phone', labels: { ko: '고객센터 전화', en: 'Customer service phone' } },
    { key: 'customerServiceEmail', label_key: 'superbify.business.field.customer_service_email', labels: { ko: '고객센터 이메일', en: 'Customer service email' } },
    { key: 'hostingProvider', label_key: 'superbify.business.field.hosting_provider', labels: { ko: '호스팅 제공', en: 'Hosting provider' } },
    { key: 'businessVerificationUrl', label_key: 'superbify.business.field.business_verification', labels: { ko: '사업자정보확인', en: 'Verify business info' } },
];

/* --------------------------------------------------------------- helpers */

function isNonEmpty(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

function formatPhoneHref(value: string): string {
    // tel: href keeps digits and a leading plus only; display text keeps the
    // original formatting (dashes, spaces) untouched.
    const digits = value.replace(/[^+\d]/g, '');
    return `tel:${digits}`;
}

/**
 * Current template locale. KO is the template default (per the design system);
 * `en` is resolved from the document language attribute set by the G7 shell.
 */
export function resolveTemplateLocale(): TemplateLocale {
    if (typeof document !== 'undefined') {
        const lang = (document.documentElement?.lang ?? '').toLowerCase();
        if (lang.startsWith('en')) return 'en';
    }
    return 'ko';
}

/** Read the ko/en mirror for template scaffolding text. */
export function localText(text: LocalizedText | null | undefined, locale: TemplateLocale = resolveTemplateLocale()): string {
    if (!text) return '';
    const value = text[locale];
    if (isNonEmpty(value)) return value;
    // Fall back to the other locale rather than rendering nothing.
    return (locale === 'ko' ? text.en : text.ko) ?? '';
}

/**
 * Non-empty business fields in display order.
 * - Empty / whitespace-only values are skipped entirely.
 * - The verification URL is returned as an `external` field (opens in a new
 *   tab with rel="noopener noreferrer" — it is a user-controlled URL).
 */
export function businessFields(locale: TemplateLocale = resolveTemplateLocale()): BusinessField[] {
    const shop = businessInfo.shop ?? ({} as ShopInfo);
    const fields: BusinessField[] = [];
    for (const definition of FIELD_DEFINITIONS) {
        const value = shop[definition.key];
        if (!isNonEmpty(value)) continue;
        const field: BusinessField = {
            label_key: definition.label_key,
            label: definition.labels[locale],
            value,
        };
        if (definition.key === 'businessVerificationUrl') {
            field.href = value;
            field.external = true;
        } else if (definition.key === 'customerServicePhone') {
            field.href = formatPhoneHref(value);
        } else if (definition.key === 'customerServiceEmail') {
            field.href = `mailto:${value}`;
        }
        fields.push(field);
    }
    return fields;
}

/** True when at least one business field has a non-empty value. */
export function hasBusinessInfo(): boolean {
    return businessFields().length > 0;
}

/** Resolve a policy document by page key ('shipping' maps to shippingReturns). */
export function getPolicyDocument(key: PolicyDocumentKey): PolicyDocument {
    if (key === 'terms') return businessInfo.policies.terms;
    if (key === 'privacy') return businessInfo.policies.privacy;
    return businessInfo.policies.shippingReturns;
}

/** Policy page hrefs (single place so the footer and routes stay in sync). */
export const POLICY_ROUTES: Record<PolicyDocumentKey, string> = {
    terms: '/shop/terms',
    privacy: '/shop/privacy',
    shipping: '/shop/shipping-policy',
};

export default businessInfo;