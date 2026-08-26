import React from 'react';
import { A, Div, Footer as FooterEl, Nav, Span } from './basic';
import BrandLogo from './BrandLogo';
import Container from './Container';
import type { EditorAttrs } from '../types/template';

export interface SiteFooterProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

const navLinks = [
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'SuperBify', href: '/superbify' },
    { label: 'About', href: '/about' },
    { label: 'Project Inquiry', href: '/inquiry' },
];

function FooterLink({ label, href }: { label: string; href: string }): React.ReactElement {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <A
            href={href}
            style={{
                color: isHovered ? 'var(--20ft-heritage-gold, #B69B5F)' : 'inherit',
                textDecoration: 'none',
                fontFamily: 'var(--20ft-font-body, sans-serif)',
                fontSize: '0.875rem',
                fontWeight: 600,
                lineHeight: 1.5,
                transition: `color var(--20ft-duration-base) var(--20ft-ease-out)`,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {label}
        </A>
    );
}

export function SiteFooter({ className, editorAttrs }: SiteFooterProps): React.ReactElement {
    return (
        <FooterEl
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-section-py-md, 4rem)',
                backgroundColor: 'var(--20ft-charcoal, #1A1A1A)',
                color: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="site-footer"
        >
            <Container>
                <Div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'var(--20ft-footer-columns, 1fr)',
                        gap: 'var(--20ft-spacing-xl, 2.5rem)',
                        alignItems: 'start',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    <Div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--20ft-spacing-sm, 0.75rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        <BrandLogo variant="compact" surface="dark" height="1.75rem" />

                        <Span
                            style={{
                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                fontSize: '0.9375rem',
                                opacity: 0.72,
                                lineHeight: 1.65,
                                letterSpacing: '-0.005em',
                            }}
                        >
                            Software Studio / Digital Garage
                        </Span>

                        <Span
                            style={{
                                fontFamily: 'var(--20ft-font-mono, monospace)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                                color: 'var(--20ft-heritage-gold, #B69B5F)',
                                opacity: 0.85,
                            }}
                            data-testid="footer-tagline"
                        >
                            A SMALL SPACE. INFINITE POSSIBILITIES.
                        </Span>

                        <Span
                            style={{
                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                fontSize: '0.75rem',
                                opacity: 0.5,
                                letterSpacing: '-0.005em',
                            }}
                            data-testid="footer-signature"
                        >
                            © {new Date().getFullYear()} 20ft. All rights reserved.
                        </Span>
                    </Div>

                    <Nav
                        aria-label="Footer navigation"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--20ft-spacing-xs, 0.5rem)',
                            alignItems: 'var(--20ft-footer-nav-align, flex-start)',
                        }}
                    >
                        {navLinks.map((link) => (
                            <FooterLink key={link.href} label={link.label} href={link.href} />
                        ))}
                    </Nav>
                </Div>

                <Div
                    style={{
                        marginTop: 'var(--20ft-spacing-xl, 2.5rem)',
                        paddingTop: 'var(--20ft-spacing-lg, 1.5rem)',
                        borderTop: '1px solid var(--20ft-border-inverse, rgba(244, 240, 230, 0.12))',
                    }}
                >
                    <Span
                        style={{
                            display: 'block',
                            fontFamily: 'var(--20ft-font-mono, monospace)',
                            fontSize: '0.75rem',
                            letterSpacing: '0.08em',
                            opacity: 0.5,
                        }}
                        data-testid="footer-capability"
                    >
                        WEB / COMMERCE / SOFTWARE / GNUBOARD 7
                    </Span>
                </Div>
            </Container>
        </FooterEl>
    );
}

export default SiteFooter;
