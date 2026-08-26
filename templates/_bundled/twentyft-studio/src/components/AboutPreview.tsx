import React from 'react';
import { Div, H2, P, Section, Span } from './basic';
import BrandLogo from './BrandLogo';
import Container from './Container';
import PrimaryButton from './PrimaryButton';
import { useInView } from '../hooks/useInView';
import type { EditorAttrs } from '../types/template';

export interface AboutPreviewProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function AboutPreview({ className, editorAttrs }: AboutPreviewProps): React.ReactElement {
    const { ref: sectionRef, isInView } = useInView({ once: true, threshold: 0.05 });

    const revealClass = (stagger: number): string => {
        const hidden = isInView ? 'is-visible' : 'is-hidden';
        return `reveal ${hidden} reveal-stagger-${stagger}`;
    };

    return (
        <Section
            id="about"
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-section-py-xl, 6rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="about-preview"
        >
            <Container>
                <div ref={sectionRef}>
                    <Div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'var(--20ft-about-columns, 1fr)',
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
                                maxWidth: 'var(--20ft-about-intro-max, 100%)',
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
                                About 20ft
                            </Span>

                            <H2
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                    fontWeight: 700,
                                    fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1.15,
                                    color: 'var(--20ft-deep-indigo, #102A4C)',
                                    wordBreak: 'keep-all',
                                    width: '100%',
                                    minWidth: 0,
                                    maxWidth: 'var(--20ft-about-heading-max, 100%)',
                                }}
                            >
                                작은 공간에서 가능성을{' '}만듭니다.
                            </H2>

                            <Div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--20ft-content-gap-md, 1.25rem)',
                                    width: '100%',
                                    minWidth: 0,
                                }}
                            >
                                <P
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                        fontSize: 'clamp(1rem, 1.3vw, 1.125rem)',
                                        lineHeight: 1.75,
                                        letterSpacing: '-0.01em',
                                        color: 'var(--20ft-text-muted, #5E6063)',
                                    }}
                                >
                                    20ft는 작은 공간에서 시작한 Software Studio입니다.
                                </P>
                                <P
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                        fontSize: '1rem',
                                        lineHeight: 1.75,
                                        letterSpacing: '-0.005em',
                                        color: 'var(--20ft-text-muted, #5E6063)',
                                    }}
                                >
                                    웹과 커머스, 소프트웨어와 필요한 도구를 직접 기획하고 만들며,
                                    작은 아이디어를 실제로 작동하는 결과물로 바꿉니다.
                                </P>
                            </Div>

                            <Div style={{ marginTop: 'var(--20ft-spacing-xs, 0.5rem)' }}>
                                <PrimaryButton href="/about" variant="secondary" data-testid="about-cta">
                                    20ft에 대하여 →
                                </PrimaryButton>
                            </Div>
                        </Div>

                        <Div
                            className={revealClass(2)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'center',
                                gap: 'var(--20ft-spacing-lg, 1.5rem)',
                                width: '100%',
                                minWidth: 0,
                            }}
                            aria-hidden="true"
                        >
                            <Div style={{ width: '100%', minWidth: 0 }}>
                                <BrandLogo variant="badge" surface="light" height="clamp(5rem, 8vw, 7rem)" />
                            </Div>

                            <Div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--20ft-spacing-xs, 0.5rem)',
                                    maxWidth: '28ch',
                                    width: '100%',
                                    minWidth: 0,
                                }}
                            >
                                <Span
                                    style={{
                                        fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                        fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
                                        fontWeight: 700,
                                        color: 'var(--20ft-deep-indigo, #102A4C)',
                                        lineHeight: 1.25,
                                        letterSpacing: '-0.01em',
                                    }}
                                >
                                    A SMALL SPACE.
                                    <br />
                                    INFINITE POSSIBILITIES.
                                </Span>

                                <Span
                                    style={{
                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.7,
                                        letterSpacing: '-0.005em',
                                        color: 'var(--20ft-text-muted, #5E6063)',
                                    }}
                                >
                                    작은 시작이 큰 가능성이 되는 곳.
                                </Span>
                            </Div>
                        </Div>
                    </Div>
                </div>
            </Container>
        </Section>
    );
}

export default AboutPreview;
