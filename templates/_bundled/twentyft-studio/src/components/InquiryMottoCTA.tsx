import React from 'react';
import { Div, H2, P, Section, Span } from './basic';
import BrandLogo from './BrandLogo';
import Container from './Container';
import PrimaryButton from './PrimaryButton';
import { useInView } from '../hooks/useInView';
import type { EditorAttrs } from '../types/template';

export interface InquiryMottoCTAProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function InquiryMottoCTA({ className, editorAttrs }: InquiryMottoCTAProps): React.ReactElement {
    const { ref: sectionRef, isInView } = useInView({ once: true, threshold: 0.05 });

    const revealClass = (stagger: number): string => {
        const hidden = isInView ? 'is-visible' : 'is-hidden';
        return `reveal ${hidden} reveal-stagger-${stagger}`;
    };

    return (
        <Section
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-section-py-xl, 6rem)',
                backgroundColor: 'var(--20ft-deep-indigo, #102A4C)',
                color: 'var(--20ft-paper-white, #FAF8F3)',
                position: 'relative',
                overflow: 'hidden',
            }}
            data-testid="inquiry-motto-cta"
        >
            <Container>
                <div ref={sectionRef}>
                    <Div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'var(--20ft-inquiry-columns, 1fr)',
                            gap: 'var(--20ft-spacing-2xl, 3.5rem)',
                            alignItems: 'start',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        <Div
                            className={revealClass(1)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--20ft-content-gap-md, 1.25rem)',
                                width: '100%',
                                minWidth: 0,
                                maxWidth: 'var(--20ft-inquiry-col-max, 100%)',
                            }}
                        >
                            <Span
                                style={{
                                    fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                    fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                                    fontWeight: 700,
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1.2,
                                    color: 'var(--20ft-heritage-gold, #B69B5F)',
                                }}
                            >
                                JUST FOR FUN.
                            </Span>

                            <P
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    fontSize: 'clamp(1rem, 1.3vw, 1.125rem)',
                                    lineHeight: 1.75,
                                    letterSpacing: '-0.005em',
                                    opacity: 0.9,
                                }}
                            >
                                재미있는 문제를 발견하고, 직접 만들어보고, 실제로 작동하게 만드는 것.
                                그게 20ft가 계속 만드는 이유입니다.
                            </P>
                        </Div>

                        <Div
                            className={revealClass(2)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--20ft-content-gap-md, 1.25rem)',
                                width: '100%',
                                minWidth: 0,
                                maxWidth: 'var(--20ft-inquiry-col-max, 100%)',
                            }}
                        >
                            <Span
                                style={{
                                    fontFamily: 'var(--20ft-font-mono, monospace)',
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: 'var(--20ft-heritage-gold, #B69B5F)',
                                }}
                            >
                                Project Inquiry
                            </Span>

                            <H2
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                    fontWeight: 700,
                                    fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1.2,
                                    wordBreak: 'keep-all',
                                    color: 'var(--20ft-paper-white, #FAF8F3)',
                                }}
                            >
                                만들고 싶은 것이 있으신가요?
                            </H2>

                            <P
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    fontSize: 'clamp(1rem, 1.3vw, 1.125rem)',
                                    lineHeight: 1.75,
                                    letterSpacing: '-0.005em',
                                    opacity: 0.9,
                                }}
                            >
                                홈페이지, 쇼핑몰, 웹서비스, 그누보드 7 개발이나 기존 시스템 개선까지. 필요한 것을 편하게 이야기해주세요.
                            </P>

                            <Div style={{ marginTop: 'var(--20ft-spacing-sm, 0.75rem)' }}>
                                <PrimaryButton
                                    href="/inquiry"
                                    variant="primary"
                                    data-testid="inquiry-motto-button"
                                >
                                    프로젝트 문의
                                </PrimaryButton>
                            </Div>
                        </Div>
                    </Div>
                </div>
            </Container>

            <Div
                style={{
                    position: 'absolute',
                    top: '55%',
                    right: 'var(--20ft-gutter, 1rem)',
                    transform: 'translateY(-50%)',
                    opacity: 0.08,
                    pointerEvents: 'none',
                    display: 'var(--20ft-desktop-only, none)',
                }}
                aria-hidden="true"
            >
                <BrandLogo variant="symbol" surface="dark" height="clamp(8rem, 12vw, 12rem)" />
            </Div>
        </Section>
    );
}

export default InquiryMottoCTA;
