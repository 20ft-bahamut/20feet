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
import { getShopBase } from './shopBase';

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
   `superbify.business.field.*` keys (kept for future admin binding).
   hostingProvider intentionally omitted — admin basic_info has no matching
   input, so the template never renders it. The config/business-info.json
   field is kept for forward compatibility (admin may add the input later)
   but never projected onto the render list. */
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
 *
 * If `override` is provided, non-empty fields on it win over the static
 * `businessInfo.shop` seed. This is how the StoreFooter overlays admin-
 * configured values onto the demo seed without re-fetching the static JSON
 * at runtime. The mapping mirrors the public read-model exposed by
 * /api/plugins/superbify-commerce-compat/shop-info.
 */
export function businessFields(
    locale: TemplateLocale = resolveTemplateLocale(),
    override?: Partial<ShopInfo> | null,
): BusinessField[] {
    const baseShop = businessInfo.shop ?? ({} as ShopInfo);
    const shop: ShopInfo = override ? mergeShopInfo(baseShop, override) : baseShop;
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

/**
 * Merge admin-supplied basic_info over the static seed.
 *
 * Priority per field: admin non-empty > static seed non-empty > empty.
 * - `companyName` falls back to `shopName` if admin did not set it.
 * - `businessAddress` is trim-joined from zipcode + base_address + detail_address.
 * - `businessVerificationUrl` is never set by admin (not part of basic_info),
 *   so the static seed is preserved verbatim.
 *
 * Returns a new ShopInfo — does not mutate either input.
 */
function mergeShopInfo(base: ShopInfo, override: Partial<ShopInfo>): ShopInfo {
    const pick = (key: keyof ShopInfo): string => {
        const fromOverride = override[key];
        if (typeof fromOverride === 'string' && fromOverride.trim() !== '') {
            return fromOverride;
        }
        const fromBase = base[key];
        return typeof fromBase === 'string' ? fromBase : '';
    };

    const shopName = pick('shopName');
    // companyName falls back to shopName (admin or static) when not explicitly set.
    const companyNameExplicit = override.companyName;
    const companyName =
        typeof companyNameExplicit === 'string' && companyNameExplicit.trim() !== ''
            ? companyNameExplicit
            : shopName;

    return {
        shopName,
        companyName,
        representative: pick('representative'),
        businessRegistrationNumber: pick('businessRegistrationNumber'),
        ecommerceRegistrationNumber: pick('ecommerceRegistrationNumber'),
        ecommerceRegistrationAuthority: pick('ecommerceRegistrationAuthority'),
        businessAddress: pick('businessAddress'),
        customerServicePhone: pick('customerServicePhone'),
        customerServiceEmail: pick('customerServiceEmail'),
        hostingProvider: pick('hostingProvider'),
        businessVerificationUrl: pick('businessVerificationUrl'),
    };
}

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
export function applyShopInfoOverride(payload: ShopInfoApiResponse | null | undefined): Partial<ShopInfo> {
    if (!payload || typeof payload !== 'object') {
        return {};
    }
    const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

    // businessAddress = trim-joined zipcode + base_address + detail_address.
    // Missing parts collapse cleanly so the footer never renders leading
    // or trailing whitespace.
    const addressParts = [payload.zipcode, payload.base_address, payload.detail_address]
        .map(str)
        .filter((part) => part !== '');
    const businessAddress = addressParts.join(' ');

    return {
        shopName: str(payload.shop_name),
        companyName: str(payload.company_name),
        representative: str(payload.ceo_name),
        businessRegistrationNumber: str(payload.business_number),
        ecommerceRegistrationNumber: str(payload.mail_order_number),
        businessAddress,
        customerServicePhone: str(payload.phone),
        customerServiceEmail: str(payload.email),
        // hostingProvider and businessVerificationUrl are not part of the
        // admin basic_info schema; the static seed is preserved for them.
    };
}

/**
 * Default endpoint for the admin shop-info overlay. Override in tests via
 * `__setShopInfoEndpoint` or by passing `shopInfoEndpoint` to <StoreFooter>.
 */
export const DEFAULT_SHOP_INFO_ENDPOINT = '/api/plugins/superbify-commerce-compat/shop-info';

/** Test-only injection point for the endpoint URL. */
let shopInfoEndpointOverride: string | null = null;
export function __setShopInfoEndpoint(url: string | null): void {
    shopInfoEndpointOverride = url;
}
export function getShopInfoEndpoint(): string {
    return shopInfoEndpointOverride ?? DEFAULT_SHOP_INFO_ENDPOINT;
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

/** Policy page hrefs (single place so the footer and routes stay in sync).
 *  Values are derived from getShopBase() so admin basic_info (no_route /
 *  route_path) flows through. The exported object is computed lazily —
 *  StoreFooter reads POLICY_ROUTES at render time and reads through to
 *  the latest shopBase. */
function policyPath(key: PolicyDocumentKey): string {
    const base = getShopBase();
    const prefix = base === '/' ? '' : base;
    if (key === 'terms') return `${prefix}/terms`;
    if (key === 'privacy') return `${prefix}/privacy`;
    return `${prefix}/shipping-policy`;
}

export const POLICY_ROUTES: Record<PolicyDocumentKey, string> = new Proxy({} as Record<PolicyDocumentKey, string>, {
    get(_target, prop: string) {
        if (prop === 'terms' || prop === 'privacy' || prop === 'shipping') {
            return policyPath(prop);
        }
        return undefined;
    },
    ownKeys() {
        return ['terms', 'privacy', 'shipping'];
    },
    getOwnPropertyDescriptor(_target, prop: string) {
        if (prop === 'terms' || prop === 'privacy' || prop === 'shipping') {
            return { configurable: true, enumerable: true, value: policyPath(prop as PolicyDocumentKey), writable: false };
        }
        return undefined;
    },
});

export default businessInfo;