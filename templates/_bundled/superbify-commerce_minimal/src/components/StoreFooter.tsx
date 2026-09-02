import React, { useEffect, useState } from 'react';
import { A, Div, Footer, Li, Span, Ul } from './basic';
import {
    applyShopInfoOverride,
    businessFields,
    getShopInfoEndpoint,
    POLICY_ROUTES,
    type BusinessField,
    type PolicyDocumentKey,
    type ShopInfo,
    type ShopInfoApiResponse,
} from '../config/businessInfo';
import { getShopBase } from '../config/shopBase';

export interface StoreFooterProps {
    brandName?: string;
    tagline?: string;
    copyright?: string;
    className?: string;
    navItems?: { href: string; label: string }[];
    /** Muted footer line shown when no business info is configured (from lang). */
    demoNotice?: string;
    /** Policy link labels from lang. 개인정보처리방침 uses the same size as the others. */
    termsLabel?: string;
    privacyLabel?: string;
    shippingLabel?: string;
    /** Label of the external 사업자정보확인 link (from lang); only rendered when configured. */
    verificationLabel?: string;
    /** Primary nav labels from lang (superbify.nav.*). Defaults keep the English nav. */
    shopLabel?: string;
    storyLabel?: string;
    noticeLabel?: string;
    cartLabel?: string;
    /**
     * Test/diagnostic injection point for the resolved field list.
     * When supplied, the StoreFooter renders exactly this list and skips
     * both the static seed AND the live admin fetch. Production layouts
     * never set this prop; tests and Storybook do.
     */
    infoFields?: BusinessField[];
    /**
     * Disable the live admin basic_info fetch even when `infoFields` is not
     * supplied. Useful for SSR snapshots and test environments where the
     * /shop-info endpoint is unreachable.
     */
    disableLiveShopInfo?: boolean;
    /**
     * Override the /shop-info endpoint URL. Defaults to
     * `/api/plugins/superbify-commerce-compat/shop-info`. Tests may inject
     * a per-test stub here.
     */
    shopInfoEndpoint?: string;
    /**
     * Test-only injection point for the fetch implementation.
     * Signature: (url, init) => Promise<Response> (matches global fetch).
     * Defaults to globalThis.fetch. Production never sets this.
     */
    fetchImpl?: typeof fetch;
    /** Override the shop base URL. Defaults to getShopBase(). */
    shopBase?: string;
}

/** Build the default primary-nav links for a given shop base. */
function buildDefaultNav(
    shopBase: string,
    labels: { shop: string; story: string; notice: string; cart: string },
): { href: string; label: string }[] {
    const base = shopBase === '/' ? '' : shopBase;
    return [
        { href: `${base}/`, label: labels.shop },
        { href: `${base}/story`, label: labels.story },
        { href: `${base}/notice`, label: labels.notice },
        { href: `${base}/cart`, label: labels.cart },
    ];
}

/** Policy page links — labels come from lang, hrefs from the single POLICY_ROUTES source. */
const POLICY_LINKS: { key: PolicyDocumentKey; labelProp: keyof StoreFooterProps; fallback: string }[] = [
    { key: 'terms', labelProp: 'termsLabel', fallback: '이용약관' },
    { key: 'privacy', labelProp: 'privacyLabel', fallback: '개인정보처리방침' },
    { key: 'shipping', labelProp: 'shippingLabel', fallback: '배송·교환·반품 안내' },
];

const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--scm-font-body, system-ui)',
    fontSize: 'var(--scm-footer-info-label, 0.6875rem)',
    color: 'rgba(250, 248, 243, 0.55)',
    letterSpacing: '0.03em',
    display: 'block',
    marginBottom: 'var(--scm-spacing-3xs, 0.125rem)',
};

const valueStyle: React.CSSProperties = {
    fontFamily: 'var(--scm-font-body, system-ui)',
    fontSize: 'var(--scm-footer-info-value, 0.8125rem)',
    color: 'var(--scm-text-inverse, #FAF8F3)',
    opacity: 0.85,
    lineHeight: 1.5,
    overflowWrap: 'anywhere',
    minWidth: 0,
};

const linkStyle: React.CSSProperties = {
    color: 'var(--scm-text-inverse, #FAF8F3)',
    textDecoration: 'none',
    opacity: 0.8,
};

export function StoreFooter({
    brandName = 'Still Form',
    tagline = '조용한 일상의 물건들',
    copyright = '© 2026 Still Form — demo store built on Gnuboard 7',
    className,
    navItems,
    demoNotice,
    termsLabel,
    privacyLabel,
    shippingLabel,
    verificationLabel,
    shopLabel = 'Shop',
    storyLabel = 'Story',
    noticeLabel = 'Notice',
    cartLabel = 'Cart',
    infoFields,
    disableLiveShopInfo = false,
    shopInfoEndpoint,
    fetchImpl,
    shopBase,
}: StoreFooterProps): React.ReactElement {
    const resolvedShopBase = shopBase ?? getShopBase();
    const resolvedNavItems =
        navItems ?? buildDefaultNav(resolvedShopBase, { shop: shopLabel, story: storyLabel, notice: noticeLabel, cart: cartLabel });
    // Live admin basic_info overlay. Kept as state so the footer re-renders
    // when the async fetch resolves without disturbing the rest of the layout.
    // null = not yet resolved OR fetch is disabled; empty object = resolved
    // with no admin fields set (static seed still applies).
    const [adminOverride, setAdminOverride] = useState<Partial<ShopInfo> | null>(null);

    useEffect(() => {
        // Two opt-outs: explicit disable, or the test-only infoFields prop
        // (which bypasses both static seed and admin overlay entirely).
        if (disableLiveShopInfo || infoFields) {
            return;
        }
        // SSR / non-browser environment — fetch is unavailable, fall back
        // to the static seed silently.
        if (typeof globalThis.fetch !== 'function') {
            return;
        }
        const endpoint = shopInfoEndpoint ?? getShopInfoEndpoint();
        const fetcher = fetchImpl ?? globalThis.fetch.bind(globalThis);

        let cancelled = false;
        (async () => {
            try {
                const res = await fetcher(endpoint, {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                if (!res || !res.ok) {
                    // Plugin offline / 4xx / 5xx → silent fallback to static.
                    return;
                }
                const json = await res.json();
                if (cancelled) return;
                const payload = json?.data;
                if (payload && typeof payload === 'object') {
                    setAdminOverride(applyShopInfoOverride(payload as ShopInfoApiResponse));
                }
            } catch {
                // Network error / parse error / plugin disabled → silent fallback.
                // Per spec: no console noise.
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [disableLiveShopInfo, infoFields, shopInfoEndpoint, fetchImpl]);

    // Single source of truth: config/business-info.json via businessInfo.ts,
    // with the admin basic_info overlay applied (per-field priority:
    // admin non-empty > static seed non-empty > empty).
    // infoFields is only an injection point for tests; it is never passed by layouts.
    const fields = infoFields ?? businessFields('ko', adminOverride);
    const resolved = fields.filter((field) => !field.external);
    const verification = fields.find((field) => field.external);
    const hasInfo = resolved.length > 0;

    return (
        <Footer
            className={className}
            style={{
                backgroundColor: 'var(--scm-charcoal, #26221E)',
                color: 'var(--scm-text-inverse, #FAF8F3)',
                marginTop: 'auto',
            }}
            data-testid="store-footer"
        >
            <Div
                className="scm-footer-inner"
                style={{
                    maxWidth: 'var(--scm-max-width, 1200px)',
                    marginInline: 'auto',
                    paddingInline: 'var(--scm-gutter, 1rem)',
                    paddingBlock: 'var(--scm-spacing-xl, 2.5rem)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-lg, 1.5rem)',
                }}
            >
                {/* Row 1: brand mark + tagline (left) | nav links (right) */}
                <Div
                    className="scm-footer-top"
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 'var(--scm-spacing-lg, 1.5rem)',
                    }}
                >
                    <Div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--scm-spacing-2xs, 0.25rem)',
                        }}
                    >
                        <Span
                            style={{
                                fontFamily: 'var(--scm-font-display, system-ui)',
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {brandName}
                        </Span>
                        <Span
                            style={{
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.875rem',
                                opacity: 0.7,
                                letterSpacing: '0.02em',
                            }}
                        >
                            {tagline}
                        </Span>
                    </Div>
                    <Ul
                        className="scm-footer-nav"
                        style={{
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 'var(--scm-spacing-xl, 2rem)',
                            alignItems: 'center',
                        }}
                    >
                        {resolvedNavItems.map((item) => (
                            <Li key={item.href}>
                                <A
                                    href={item.href}
                                    style={{
                                        color: 'var(--scm-text-inverse, #FAF8F3)',
                                        textDecoration: 'none',
                                        fontFamily: 'var(--scm-font-body, system-ui)',
                                        fontSize: '0.9375rem',
                                        fontWeight: 500,
                                        opacity: 0.9,
                                    }}
                                >
                                    {item.label}
                                </A>
                            </Li>
                        ))}
                    </Ul>
                </Div>

                {/* Row 2: business info grid — rendered only when at least one
                    non-external field has a value in config/business-info.json. */}
                {hasInfo ? (
                    <Div
                        className="scm-footer-info-grid"
                        data-testid="footer-business-info"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                            columnGap: 'var(--scm-spacing-lg, 1.5rem)',
                            rowGap: 'var(--scm-spacing-md, 1rem)',
                            minWidth: 0,
                        }}
                    >
                        {resolved.map((field) => (
                            <Div key={field.label_key} data-testid="footer-business-field" style={{ minWidth: 0 }}>
                                <Span data-scm-footer-label="" style={labelStyle}>{field.label}</Span>
                                {field.href ? (
                                    <A
                                        href={field.href}
                                        style={{ ...valueStyle, textDecoration: 'none', color: 'var(--scm-text-inverse, #FAF8F3)' }}
                                    >
                                        {field.value}
                                    </A>
                                ) : (
                                    <Span style={valueStyle}>{field.value}</Span>
                                )}
                            </Div>
                        ))}
                    </Div>
                ) : null}

                {/* Demo-store notice: a single muted guidance line shown alongside business info
                    (shipping values are demo seed) or standalone when nothing is configured.
                    Never N/A placeholders. */}
                {demoNotice ? (
                    <Span
                        data-testid="footer-demo-notice"
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: 'var(--scm-footer-info-label, 0.6875rem)',
                            color: 'rgba(250, 248, 243, 0.55)',
                            letterSpacing: '0.02em',
                        }}
                    >
                        {demoNotice}
                    </Span>
                ) : null}

                {/* Row 3: policy links + optional 외부 사업자정보확인 */}
                <Div
                    data-testid="footer-policy-row"
                    style={{
                        borderTop: '1px solid rgba(250, 248, 243, 0.15)',
                        paddingTop: 'var(--scm-spacing-md, 1rem)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        columnGap: 'var(--scm-spacing-xl, 2rem)',
                        rowGap: 'var(--scm-spacing-xs, 0.5rem)',
                    }}
                >
                    {POLICY_LINKS.map((policy) => {
                        const label = (policy.labelProp === 'termsLabel'
                            ? termsLabel
                            : policy.labelProp === 'privacyLabel'
                                ? privacyLabel
                                : shippingLabel) ?? policy.fallback;
                        return (
                            <A
                                key={policy.key}
                                href={POLICY_ROUTES[policy.key]}
                                data-testid={`footer-policy-${policy.key}`}
                                style={{
                                    ...linkStyle,
                                    fontFamily: 'var(--scm-font-body, system-ui)',
                                    fontSize: '0.8125rem',
                                    letterSpacing: '0.01em',
                                }}
                            >
                                {label}
                            </A>
                        );
                    })}
                    {verification ? (
                        <A
                            href={verification.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="footer-business-verification"
                            style={{
                                ...linkStyle,
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.8125rem',
                                letterSpacing: '0.01em',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'var(--scm-spacing-3xs, 0.125rem)',
                            }}
                        >
                            {verificationLabel ?? verification.label}
                            <Span
                                aria-hidden
                                style={{ fontSize: '0.625rem', transform: 'translateY(-1px)' }}
                            >
                                ↗
                            </Span>
                        </A>
                    ) : null}
                </Div>

                {/* Row 4: hairline divider + copyright */}
                <Div
                    style={{
                        borderTop: '1px solid rgba(250, 248, 243, 0.15)',
                        paddingTop: 'var(--scm-spacing-md, 1rem)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                    }}
                >
                    <Span
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.8125rem',
                            opacity: 0.65,
                            letterSpacing: '0.01em',
                        }}
                    >
                        {copyright}
                    </Span>
                </Div>
            </Div>
        </Footer>
    );
}

export default StoreFooter;