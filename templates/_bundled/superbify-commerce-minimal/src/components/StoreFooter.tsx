import React from 'react';
import { A, Div, Footer, Li, Span, Ul } from './basic';

export interface StoreFooterProps {
    brandName?: string;
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
                    gap: 'var(--scm-spacing-md, 1rem)',
                }}
            >
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-xs, 0.5rem)',
                    }}
                >
                    <Span
                        style={{
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: '1.125rem',
                            fontWeight: 700,
                        }}
                    >
                        {brandName}
                    </Span>
                    <Ul
                        style={{
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 'var(--scm-spacing-md, 1rem)',
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
                                        opacity: 0.85,
                                    }}
                                >
                                    {item.label}
                                </A>
                            </Li>
                        ))}
                    </Ul>
                </Div>
                <Span
                    style={{
                        fontFamily: 'var(--scm-font-body, system-ui)',
                        fontSize: '0.75rem',
                        opacity: 0.6,
                    }}
                >
                    {copyright}
                </Span>
            </Div>
        </Footer>
    );
}

export default StoreFooter;
