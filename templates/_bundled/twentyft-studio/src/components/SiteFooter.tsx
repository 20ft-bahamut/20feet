import React from 'react';
import { A, Div, Footer as FooterEl, Nav, Span } from './basic';
import BrandLogo from './BrandLogo';
import Container from './Container';
import { FOOTER_COLUMNS } from '../content/nav';
import type { EditorAttrs } from '../types/template';

export interface SiteFooterProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

function FooterLink({ label, href }: { label: string; href: string }): React.ReactElement {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <A
            href={href}
            style={{
                display: 'inline-block',
                paddingBlock: '0.3125rem',
                color: isHovered ? 'var(--20ft-heritage-gold, #B69B5F)' : 'inherit',
                textDecoration: 'none',
                fontFamily: 'var(--20ft-font-body, sans-serif)',
                fontSize: '0.875rem',
                fontWeight: 500,
                lineHeight: 1.5,
                whiteSpace: 'nowrap',
                transition: 'color var(--20ft-duration-base) var(--20ft-ease-out)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {label}
        </A>
    );
}

/**
 * 공통 푸터.
 *
 * 왼쪽은 로고·사업 설명 한 문장·저작권만, 오른쪽은 세 개의 짧은 링크 열.
 * 확인된 연락처가 없으므로 연락처 줄은 두지 않는다.
 * 문의 유도 버튼을 되풀이하지 않아 본문보다 강조되지 않게 한다.
 */
export function SiteFooter({ className, editorAttrs }: SiteFooterProps): React.ReactElement {
    return (
        <FooterEl
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-footer-py, 3.5rem)',
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
                        gap: 'var(--20ft-footer-gap, 2rem)',
                        alignItems: 'start',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    <Div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--20ft-spacing-xs, 0.5rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        <BrandLogo variant="compact" surface="dark" height="1.625rem" />

                        <Span
                            style={{
                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                fontSize: '0.9375rem',
                                opacity: 0.78,
                                lineHeight: 1.7,
                                letterSpacing: '-0.005em',
                                maxWidth: 'var(--20ft-footer-intro-max, 32ch)',
                                wordBreak: 'keep-all',
                            }}
                            data-testid="footer-intro"
                        >
                            홈페이지·쇼핑몰과 맞춤형 웹프로그램을 제작합니다.
                        </Span>

                        <Span
                            style={{
                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                fontSize: '0.75rem',
                                opacity: 0.45,
                                letterSpacing: '-0.005em',
                            }}
                            data-testid="footer-signature"
                        >
                            © {new Date().getFullYear()} 20ft. All rights reserved.
                        </Span>
                    </Div>

                    <Div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'var(--20ft-footer-link-columns, 1fr)',
                            gap: 'var(--20ft-footer-link-gap, 1.5rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        {FOOTER_COLUMNS.map((column) => (
                            <Nav
                                key={column.heading}
                                aria-label={column.heading}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    width: '100%',
                                    minWidth: 0,
                                }}
                            >
                                <Span
                                    style={{
                                        marginBottom: 'var(--20ft-spacing-xs, 0.5rem)',
                                        fontFamily: 'var(--20ft-font-mono, monospace)',
                                        fontSize: '0.6875rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        color: 'var(--20ft-heritage-gold, #B69B5F)',
                                        opacity: 0.85,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {column.heading}
                                </Span>
                                {column.items.map((item) => (
                                    <FooterLink
                                        key={`${column.heading}-${item.href}`}
                                        label={item.label}
                                        href={item.href}
                                    />
                                ))}
                            </Nav>
                        ))}
                    </Div>
                </Div>
            </Container>
        </FooterEl>
    );
}

export default SiteFooter;
