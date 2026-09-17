import React from 'react';
import { A, Div, H2, Li, Ol, P, Section, Span } from './basic';
import Container from './Container';
import { useInView } from '../hooks/useInView';
import { PROCESS_STEPS } from '../content/process';
import type { EditorAttrs } from '../types/template';

export interface HomeProcessProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function HomeProcess({ className, editorAttrs }: HomeProcessProps): React.ReactElement {
    const { ref: revealRef, isInView } = useInView({ once: true, threshold: 0.05 });

    const revealClass = (stagger: number): string =>
        `reveal ${isInView ? 'is-visible' : 'is-hidden'} reveal-stagger-${stagger}`;

    return (
        <Section
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-home-section-py, 4rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="home-process"
        >
            <Container>
                <div ref={revealRef}>
                    <Div
                        className={revealClass(1)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--20ft-content-gap-md, 1.25rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        <H2
                            style={{
                                margin: 0,
                                fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                                lineHeight: 1.25,
                                fontSize: 'var(--20ft-home-h2-size, clamp(1.375rem, 2.4vw, 1.875rem))',
                                color: 'var(--20ft-deep-indigo, #102A4C)',
                                wordBreak: 'keep-all',
                            }}
                        >
                            상담부터 오픈까지, 이렇게 진행합니다.
                        </H2>
                    </Div>

                    <Ol
                        className={revealClass(2)}
                        style={{
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            display: 'grid',
                            gridTemplateColumns: 'var(--20ft-home-process-columns, 1fr)',
                            gap: 'var(--20ft-spacing-lg, 1.5rem)',
                            marginTop: 'var(--20ft-home-heading-gap, 1.75rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                        data-testid="home-process-list"
                    >
                        {PROCESS_STEPS.map((step, index) => (
                            <Li
                                key={step.title}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--20ft-spacing-xs, 0.5rem)',
                                    paddingTop: 'var(--20ft-spacing-md, 1rem)',
                                    borderTop: '1px solid var(--20ft-line, #D8D0BF)',
                                    width: '100%',
                                    minWidth: 0,
                                }}
                                data-testid="home-process-step"
                            >
                                <Span
                                    style={{
                                        fontFamily: 'var(--20ft-font-mono, monospace)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.08em',
                                        color: 'var(--20ft-heritage-gold, #B69B5F)',
                                    }}
                                    aria-hidden="true"
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </Span>
                                <Span
                                    style={{
                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                        fontSize: '1.0625rem',
                                        fontWeight: 700,
                                        color: 'var(--20ft-deep-indigo, #102A4C)',
                                        wordBreak: 'keep-all',
                                    }}
                                >
                                    {step.title}
                                </Span>
                                <P
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.75,
                                        letterSpacing: '-0.005em',
                                        color: 'var(--20ft-text-muted, #5E6063)',
                                        wordBreak: 'keep-all',
                                        overflowWrap: 'break-word',
                                    }}
                                >
                                    {step.summary}
                                </P>
                            </Li>
                        ))}
                    </Ol>

                    <Div style={{ marginTop: 'var(--20ft-home-heading-gap, 1.75rem)' }}>
                        <A
                            href="/process"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                fontSize: '0.9375rem',
                                fontWeight: 600,
                                color: 'var(--20ft-indigo, #183B6B)',
                                textDecoration: 'none',
                                paddingBlock: 'var(--20ft-spacing-xs, 0.5rem)',
                            }}
                            data-testid="home-process-more"
                        >
                            진행 안내와 자주 묻는 질문 보기 →
                        </A>
                    </Div>
                </div>
            </Container>
        </Section>
    );
}

export default HomeProcess;
