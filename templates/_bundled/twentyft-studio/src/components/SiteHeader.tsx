import React from 'react';
import { A, Button, Div, Header, Nav } from './basic';
import BrandLogo from './BrandLogo';
import Container from './Container';
import PrimaryButton from './PrimaryButton';
import TextLink from './TextLink';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { EditorAttrs } from '../types/template';

export interface SiteHeaderProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function SiteHeader({ className, editorAttrs }: SiteHeaderProps): React.ReactElement {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const prefersReducedMotion = useReducedMotion();

    return (
        <Header
            className={className}
            {...editorAttrs}
            style={{
                position: 'relative',
                marginTop: 'var(--20ft-header-top-spacing, 1rem)',
                paddingBlock: 'var(--20ft-header-padding-block, 1rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
                borderBottom: 'var(--20ft-hairline, 1px solid rgba(16, 42, 76, 0.10))',
                transition: `background-color var(--20ft-duration-base) var(--20ft-ease-out),
                             border-color var(--20ft-duration-base) var(--20ft-ease-out)`,
            }}
            data-testid="site-header"
        >
            <Container>
                <Div
                    style={{
                        height: 'auto',
                        minHeight: '2.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 'var(--20ft-spacing-md, 1rem)',
                    }}
                >
                    <A
                        href="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                            flexShrink: 0,
                            transform: prefersReducedMotion ? 'none' : 'translateY(0.5px)',
                        }}
                        data-testid="header-logo-link"
                    >
                        <BrandLogo variant="full" surface="light" height="1.875rem" />
                    </A>

                    <Div
                        style={{
                            display: 'var(--20ft-desktop-only, none)',
                            alignItems: 'center',
                            gap: 'var(--20ft-spacing-xl, 2.5rem)',
                        }}
                        data-testid="header-desktop-group"
                    >
                        <Nav
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--20ft-spacing-xl, 2.5rem)',
                            }}
                            data-testid="header-nav"
                            aria-label="Main"
                        >
                            <TextLink href="/portfolio" data-testid="header-nav-portfolio">
                                Portfolio
                            </TextLink>
                            <TextLink href="/superbify" data-testid="header-nav-superbify">
                                SuperBify
                            </TextLink>
                        </Nav>

                        <PrimaryButton href="/inquiry" variant="primary" size="small" data-testid="header-cta">
                            프로젝트 문의
                        </PrimaryButton>
                    </Div>

                    <Button
                        type="button"
                        aria-label="메뉴 열기"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((s) => !s)}
                        style={{
                            display: 'var(--20ft-mobile-only, inline-flex)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '2.75rem',
                            height: '2.75rem',
                            padding: 0,
                            background: 'transparent',
                            border: '1px solid var(--20ft-border, rgba(16, 42, 76, 0.12))',
                            borderRadius: 'var(--20ft-radius-sm, 2px)',
                            cursor: 'pointer',
                            color: 'var(--20ft-text-primary, #1A1A1A)',
                            transition: `border-color var(--20ft-duration-base) var(--20ft-ease-out),
                                         background-color var(--20ft-duration-base) var(--20ft-ease-out)`,
                        }}
                        data-testid="header-menu-trigger"
                    >
                        <MenuIcon />
                    </Button>
                </Div>
            </Container>

            {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
        </Header>
    );
}

function MenuIcon(): React.ReactElement {
    return (
        <svg width="22" height="16" viewBox="0 0 20 14" fill="none" aria-hidden="true" focusable="false">
            <path d="M0 1H20" stroke="currentColor" strokeWidth="1.5" />
            <path d="M0 7H20" stroke="currentColor" strokeWidth="1.5" />
            <path d="M0 13H20" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}

function MobileMenu({ onClose }: { onClose: () => void }): React.ReactElement {
    return (
        <Div
            style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
                borderBottom: '1px solid var(--20ft-border, rgba(16, 42, 76, 0.12))',
                padding: 'var(--20ft-spacing-lg, 1.5rem) var(--20ft-gutter, 1rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--20ft-spacing-md, 1rem)',
                zIndex: 50,
            }}
            data-testid="header-mobile-menu"
        >
            <MobileNavLink href="/portfolio" onClick={onClose}>
                Portfolio
            </MobileNavLink>
            <MobileNavLink href="/superbify" onClick={onClose}>
                SuperBify
            </MobileNavLink>
            <MobileNavLink href="/inquiry" onClick={onClose}>
                Project Inquiry
            </MobileNavLink>
        </Div>
    );
}

function MobileNavLink({
    href,
    onClick,
    children,
}: {
    href: string;
    onClick: () => void;
    children: React.ReactNode;
}): React.ReactElement {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <A
            href={href}
            onClick={onClick}
            style={{
                display: 'block',
                paddingBlock: 'var(--20ft-spacing-sm, 0.75rem)',
                fontFamily: 'var(--20ft-font-body, sans-serif)',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: isHovered ? 'var(--20ft-heritage-gold, #B69B5F)' : 'var(--20ft-text-primary, #1A1A1A)',
                textDecoration: 'none',
                transition: `color var(--20ft-duration-base) var(--20ft-ease-out)`,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
        </A>
    );
}

export default SiteHeader;
