import React from 'react';
import { A, Div, Footer, Nav, P, Span } from './basic';
import BrandLogo from './BrandLogo';
import type { EditorAttrs } from '../types/template';

export interface SiteFooterProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

export const CAPABILITY_LINE = 'WEB / COMMERCE / SOFTWARE / GNUBOARD 7';
const SIGNATURE = 'A SMALL SPACE. INFINITE POSSIBILITIES.';

export function SiteFooter({ className, editorAttrs }: SiteFooterProps): React.ReactElement {
    return (
        <Footer
            className={className}
            {...editorAttrs}
            style={{
                backgroundColor: 'var(--20ft-deep-indigo, #102A4C)',
                color: 'var(--20ft-paper-white, #FAF8F3)',
                paddingBlock: 'var(--20ft-spacing-2xl, 4rem)',
            }}
            data-testid="site-footer"
        >
            <Div
                style={{
                    width: '100%',
                    maxWidth: 'var(--20ft-max-width, 1280px)',
                    marginInline: 'auto',
                    paddingInline: 'var(--20ft-spacing-md, 1rem)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--20ft-spacing-lg, 1.5rem)',
                }}
            >
                <Div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 'var(--20ft-spacing-lg, 1.5rem)',
                    }}
                >
                    <Div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--20ft-spacing-sm, 0.5rem)' }}>
                        <BrandLogo variant="compact" surface="dark" height="1.25rem" />
                        <Span
                            style={{
                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                fontSize: '0.75rem',
                                letterSpacing: '0.08em',
                                color: 'var(--20ft-heritage-gold, #B69B5F)',
                            }}
                            data-testid="footer-signature"
                        >
                            {SIGNATURE}
                        </Span>
                        <Span
                            style={{
                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                fontSize: '0.75rem',
                                letterSpacing: '0.08em',
                                color: 'var(--20ft-heritage-gold, #B69B5F)',
                            }}
                            data-testid="footer-capability-line"
                        >
                            {CAPABILITY_LINE}
                        </Span>
                    </Div>

                    <Nav
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--20ft-spacing-sm, 0.5rem)',
                        }}
                        data-testid="footer-nav"
                    >
                        <A
                            href="/portfolio"
                            style={{
                                color: 'var(--20ft-paper-white, #FAF8F3)',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                            }}
                        >
                            Portfolio
                        </A>
                        <A
                            href="/superbify"
                            style={{
                                color: 'var(--20ft-paper-white, #FAF8F3)',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                            }}
                        >
                            SuperBify
                        </A>
                        <A
                            href="/inquiry"
                            style={{
                                color: 'var(--20ft-paper-white, #FAF8F3)',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                            }}
                        >
                            Project Inquiry
                        </A>
                    </Nav>
                </Div>

                <Div
                    style={{
                        borderTop: '1px solid rgba(244, 240, 230, 0.12)',
                        paddingTop: 'var(--20ft-spacing-md, 1rem)',
                    }}
                >
                    <P
                        style={{
                            margin: 0,
                            fontSize: '0.75rem',
                            color: 'rgba(244, 240, 230, 0.6)',
                        }}
                        data-testid="footer-copyright"
                    >
                        © {new Date().getFullYear()} 20ft. All rights reserved.
                    </P>
                </Div>
            </Div>
        </Footer>
    );
}

export { SIGNATURE };
export default SiteFooter;
