import React from 'react';
import { A, Button, Div, Header, Img, Li, Nav, Span, Ul } from './basic';
import { brandAssets, brandLogoInk } from './demoAssets';

export interface StoreHeaderProps {
    brandName?: string;
    tagline?: string;
    /** Cart count for the cart badge; undefined hides the badge. */
    cartCount?: number;
    /** Logged-in user display name (nick_name ?? name ?? email). Empty/null/missing => logged out. */
    user?: string | null;
    loginLabel?: string;
    signupLabel?: string;
    mypageLabel?: string;
    logoutLabel?: string;
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

/* ------------------------------------------------------------------
   Brand lockup geometry
   The wordmark PNG is a 1254x1254 canvas with ~41% transparent
   padding top/bottom. We size by INK height and clip the transparent
   padding with an overflow-hidden wrapper sized to the ink box, so the
   rendered mark matches its visual size without cropping the asset.
   All geometry derives from the ink metrics (relative to the ink
   height, `--scm-logo-h`) so breakpoint size overrides in
   design-tokens.css just retune that single variable.
------------------------------------------------------------------ */
const LOGO_INK = brandLogoInk.wordmark;
const LOGO_SRC = brandAssets.wordmark;
const imgScale = LOGO_INK.canvas / LOGO_INK.h; // square img box per 1px ink height
const R = {
    img: imgScale,
    left: (LOGO_INK.x / LOGO_INK.canvas) * imgScale,
    top: (LOGO_INK.y / LOGO_INK.canvas) * imgScale,
    width: (LOGO_INK.w / LOGO_INK.canvas) * imgScale,
};

function BrandLogo({ alt }: { alt: string }): React.ReactElement {
    const h = 'var(--scm-logo-h, 34px)';
    const img = `calc(${h} * ${R.img})`;
    return (
        <Span
            aria-hidden
            style={{
                position: 'relative',
                display: 'block',
                width: `calc(${h} * ${R.width})`,
                height: h,
                overflow: 'hidden',
                flex: '0 0 auto',
            }}
            data-scm-logo
        >
            <Img
                src={LOGO_SRC}
                alt={alt}
                width={1254}
                height={1254}
                style={{
                    position: 'absolute',
                    left: `calc(${h} * -${R.left})`,
                    top: `calc(${h} * -${R.top})`,
                    width: img,
                    height: img,
                    display: 'block',
                }}
            />
        </Span>
    );
}

/** Visually hidden text — keeps the brand name / tagline in the a11y tree. */
function SrOnly({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
        <Span
            style={{
                position: 'absolute',
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: 0,
            }}
        >
            {children}
        </Span>
    );
}

/**
 * Logout — the component never calls the auth API directly. It forwards the
 * whole flow to the engine ActionDispatcher as a sequence:
 *   1. logout (AuthManager clears the session)
 *   2. refetchDataSource cart_count (guest cart after member-cart merge reset)
 *   3. navigate to /
 * Optional chaining keeps this a no-op when G7Core is not mounted (tests, SSR).
 */
function dispatchLogoutSequence(): void {
    (window as any).G7Core?.getActionDispatcher?.()?.dispatchAction?.({
        handler: 'sequence',
        actions: [
            { handler: 'logout', target: 'user' },
            { handler: 'refetchDataSource', params: { dataSourceId: 'cart_count' } },
            { handler: 'navigate', params: { path: '/' } },
        ],
    });
}

/** Shared nav typography — matches the primary nav links (scm-header-nav-link). */
const NAV_LINK_STYLE: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 'var(--scm-touch-min, 44px)',
    padding: '0 var(--scm-spacing-xs, 0.5rem)',
    borderRadius: 'var(--scm-radius-sm, 4px)',
    textDecoration: 'none',
    color: 'var(--scm-text-body, #4A4643)',
    fontFamily: 'var(--scm-font-body, system-ui)',
    fontSize: 'var(--scm-header-nav-size, 0.9375rem)',
    fontWeight: 500,
    letterSpacing: '0.005em',
    whiteSpace: 'nowrap',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
};

export function StoreHeader({
    brandName = 'Still Form',
    tagline,
    cartCount,
    user,
    loginLabel = 'Login',
    signupLabel = 'Sign up',
    mypageLabel = 'My page',
    logoutLabel = 'Logout',
    className,
}: StoreHeaderProps): React.ReactElement {
    const isLoggedIn = typeof user === 'string' && user.trim().length > 0;
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
                className="scm-header-bar"
                style={{
                    maxWidth: 'var(--scm-max-width, 1320px)',
                    marginInline: 'auto',
                    paddingInline: 'var(--scm-gutter, 1rem)',
                    minHeight: 'var(--scm-header-height, 72px)',
                    paddingBlock: 'var(--scm-header-py, 0.875rem)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--scm-spacing-md, 1rem)',
                }}
            >
                <A
                    href="/"
                    aria-label={`${brandName} Home`}
                    className="scm-header-brand"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--scm-spacing-xs, 0.5rem)',
                        textDecoration: 'none',
                        color: 'inherit',
                        minWidth: 0,
                    }}
                >
                    <BrandLogo alt={brandName} />
                    <SrOnly>{brandName}</SrOnly>
                    {tagline ? <SrOnly>{tagline}</SrOnly> : null}
                </A>
                <Nav aria-label="Primary">
                    <Ul
                        className="scm-header-nav"
                        style={{
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--scm-spacing-2xs, 0.25rem)',
                        }}
                    >
                        {NAV_ITEMS.map((it) => {
                            const isCart = it.key === 'cart';
                            return (
                                <Li key={it.key}>
                                    <A
                                        href={it.href}
                                        aria-label={isCart && cartCount ? `Cart, ${cartCount} items` : undefined}
                                        className="scm-header-nav-link"
                                        style={NAV_LINK_STYLE}
                                        data-testid={isCart ? 'nav-cart' : `nav-${it.key}`}
                                    >
                                        {it.key === 'shop' ? 'Shop' : it.key === 'story' ? 'Story' : it.key === 'notice' ? 'Notice' : 'Cart'}
                                        {isCart && typeof cartCount === 'number' ? (
                                            <Span
                                                aria-hidden
                                                className="scm-header-cart-badge"
                                                style={{
                                                    marginLeft: 8,
                                                    alignSelf: 'center',
                                                    minWidth: 20,
                                                    height: 20,
                                                    padding: '0 6px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: 'var(--scm-radius-pill, 9999px)',
                                                    backgroundColor: 'var(--scm-charcoal, #26221E)',
                                                    color: 'var(--scm-text-inverse, #FAF8F3)',
                                                    fontSize: '0.6875rem',
                                                    fontWeight: 600,
                                                    lineHeight: 1,
                                                    transform: 'translateY(0.5px)',
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
                        {isLoggedIn ? (
                            <>
                                <Li>
                                    <A
                                        href="/mypage"
                                        className="scm-header-nav-link"
                                        style={NAV_LINK_STYLE}
                                        data-testid="nav-mypage"
                                    >
                                        {mypageLabel}
                                    </A>
                                </Li>
                                <Li>
                                    <Span
                                        className="scm-header-nav-user"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            minHeight: 'var(--scm-touch-min, 44px)',
                                            padding: '0 var(--scm-spacing-2xs, 0.25rem)',
                                            fontFamily: 'var(--scm-font-body, system-ui)',
                                            fontSize: 'var(--scm-header-nav-size, 0.9375rem)',
                                            fontWeight: 500,
                                            letterSpacing: '0.005em',
                                            color: 'var(--scm-text-muted, #7A736B)',
                                            whiteSpace: 'nowrap',
                                            maxWidth: '10rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                        data-testid="nav-user-name"
                                    >
                                        {user}
                                    </Span>
                                </Li>
                                <Li>
                                    <Button
                                        type="button"
                                        onClick={dispatchLogoutSequence}
                                        aria-label={logoutLabel}
                                        className="scm-header-nav-link"
                                        style={NAV_LINK_STYLE}
                                        data-testid="nav-logout"
                                    >
                                        {logoutLabel}
                                    </Button>
                                </Li>
                            </>
                        ) : (
                            <>
                                <Li>
                                    <A
                                        href="/login"
                                        className="scm-header-nav-link"
                                        style={NAV_LINK_STYLE}
                                        data-testid="nav-login"
                                    >
                                        {loginLabel}
                                    </A>
                                </Li>
                                <Li>
                                    <A
                                        href="/register"
                                        className="scm-header-nav-link"
                                        style={NAV_LINK_STYLE}
                                        data-testid="nav-signup"
                                    >
                                        {signupLabel}
                                    </A>
                                </Li>
                            </>
                        )}
                    </Ul>
                </Nav>
            </Div>
        </Header>
    );
}

export default StoreHeader;