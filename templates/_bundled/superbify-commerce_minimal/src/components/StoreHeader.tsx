import React from 'react';
import { A, Div, Header, Img, Li, Nav, Span, Ul } from './basic';
import { resolveSlotImage } from './imageSlots';

export interface StoreHeaderProps {
    brandName?: string;
    tagline?: string;
    /** Cart count for the cart badge; undefined hides the badge. */
    cartCount?: number;
    className?: string;
}

const NAV_ITEMS: { href: string; key: 'shop' | 'cart' | 'story' | 'notice' }[] = [
    { href: '/shop', key: 'shop' },
    { href: '/shop/story', key: 'story' },
    { href: '/shop/notice', key: 'notice' },
    { href: '/cart', key: 'cart' },
];

function displayCount(n: number): string {
    if (n <= 0) return '0';
    if (n > 99) return '99+';
    return String(n);
}

export function StoreHeader({
    brandName = 'Still Form',
    tagline,
    cartCount,
    className,
}: StoreHeaderProps): React.ReactElement {
    const logoSrc = resolveSlotImage('logo');
    return (
        <Header
            className={className}
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 20,
                backgroundColor: 'var(--scm-paper, #FAF8F3)',
                borderBottom: '1px solid var(--scm-line, #E4DCCE)',
            }}
            data-testid="store-header"
        >
            <Div
                style={{
                    maxWidth: 'var(--scm-max-width, 1200px)',
                    marginInline: 'auto',
                    paddingInline: 'var(--scm-gutter, 1rem)',
                    paddingBlock: 'var(--scm-spacing-sm, 0.75rem)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--scm-spacing-md, 1rem)',
                }}
            >
                <A
                    href="/"
                    aria-label={brandName}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--scm-spacing-xs, 0.5rem)',
                        textDecoration: 'none',
                        color: 'inherit',
                    }}
                >
                    <Img
                        src={logoSrc}
                        alt=""
                        width={36}
                        height={36}
                        style={{ width: 36, height: 36, display: 'block' }}
                    />
                    <Div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                        <Span
                            style={{
                                fontFamily: 'var(--scm-font-display, system-ui)',
                                fontSize: '1.0625rem',
                                fontWeight: 700,
                                color: 'var(--scm-text-primary, #26221E)',
                                letterSpacing: '-0.005em',
                            }}
                        >
                            {brandName}
                        </Span>
                        {tagline ? (
                            <Span
                                style={{
                                    fontFamily: 'var(--scm-font-body, system-ui)',
                                    fontSize: '0.6875rem',
                                    color: 'var(--scm-text-muted, #8A837B)',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                {tagline}
                            </Span>
                        ) : null}
                    </Div>
                </A>
                <Nav aria-label="Primary">
                    <Ul
                        style={{
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--scm-spacing-sm, 0.75rem)',
                        }}
                    >
                        {NAV_ITEMS.map((it) => {
                            const isCart = it.key === 'cart';
                            return (
                                <Li key={it.key}>
                                    <A
                                        href={it.href}
                                        aria-label={isCart && cartCount ? `Cart, ${cartCount} items` : undefined}
                                        style={{
                                            position: 'relative',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            minHeight: 'var(--scm-touch-min, 44px)',
                                            padding: '0 var(--scm-spacing-md, 1rem)',
                                            borderRadius: 'var(--scm-radius-sm, 4px)',
                                            textDecoration: 'none',
                                            color: 'var(--scm-text-body, #4A4643)',
                                            fontFamily: 'var(--scm-font-body, system-ui)',
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                            letterSpacing: '0.005em',
                                        }}
                                        data-testid={isCart ? 'nav-cart' : `nav-${it.key}`}
                                    >
                                        {it.key === 'shop' ? 'Shop' : it.key === 'story' ? 'Story' : it.key === 'notice' ? 'Notice' : 'Cart'}
                                        {isCart && typeof cartCount === 'number' ? (
                                            <Span
                                                aria-hidden
                                                style={{
                                                    marginLeft: 6,
                                                    minWidth: 20,
                                                    height: 20,
                                                    padding: '0 6px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: 'var(--scm-radius-pill, 9999px)',
                                                    backgroundColor: 'var(--scm-charcoal, #26221E)',
                                                    color: 'var(--scm-text-inverse, #FAF8F3)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                }}
                                                data-testid="cart-count"
                                            >
                                                {displayCount(cartCount)}
                                            </Span>
                                        ) : null}
                                    </A>
                                </Li>
                            );
                        })}
                    </Ul>
                </Nav>
            </Div>
        </Header>
    );
}

export default StoreHeader;
