import React from 'react';
import { A, Div, Footer, Li, Span, Ul } from './basic';

export interface StoreFooterProps {
    brandName?: string;
    tagline?: string;
    copyright?: string;
    className?: string;
    navItems?: { href: string; label: string }[];
}

const DEFAULT_NAV: { href: string; label: string }[] = [
    { href: '/shop', label: 'Shop' },
    { href: '/shop/story', label: 'Story' },
    { href: '/shop/notice', label: 'Notice' },
    { href: '/cart', label: 'Cart' },
];

export function StoreFooter({
    brandName = 'Still Form',
    tagline = '조용한 일상의 물건들',
    copyright = '© 2026 Still Form — demo store built on Gnuboard 7',
    className,
    navItems = DEFAULT_NAV,
}: StoreFooterProps): React.ReactElement {
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
                                fontSize: '1.125rem',
                                fontWeight: 700,
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {brandName}
                        </Span>
                        <Span
                            style={{
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.8125rem',
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
                            gap: 'var(--scm-spacing-lg, 1.5rem)',
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
                                        fontSize: '0.875rem',
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
                {/* Row 2: hairline divider + copyright */}
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
                            fontSize: '0.75rem',
                            opacity: 0.55,
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
