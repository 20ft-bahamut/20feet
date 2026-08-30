import React from 'react';
import { A, Div, Footer, Li, Span, Ul } from './basic';
import {
    businessFields,
    POLICY_ROUTES,
    type BusinessField,
    type PolicyDocumentKey,
} from '../config/businessInfo';

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
    /** Test/diagnostic injection point; defaults to businessFields() from config/business-info.json. */
    infoFields?: BusinessField[];
}

const DEFAULT_NAV: { href: string; label: string }[] = [
    { href: '/shop', label: 'Shop' },
    { href: '/shop/story', label: 'Story' },
    { href: '/shop/notice', label: 'Notice' },
    { href: '/cart', label: 'Cart' },
];

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
    navItems = DEFAULT_NAV,
    demoNotice,
    termsLabel,
    privacyLabel,
    shippingLabel,
    verificationLabel,
    infoFields,
}: StoreFooterProps): React.ReactElement {
    // Single source of truth: config/business-info.json via businessInfo.ts.
    // infoFields is only an injection point for tests; it is never passed by layouts.
    const resolved = (infoFields ?? businessFields()).filter((field) => !field.external);
    const verification = (infoFields ?? businessFields()).find((field) => field.external);
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
                        {navItems.map((item) => (
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
                                <Span style={labelStyle}>{field.label}</Span>
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