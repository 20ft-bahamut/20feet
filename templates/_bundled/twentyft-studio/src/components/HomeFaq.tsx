import React from 'react';
import { Div, H2, H3, P, Section, Span } from './basic';
import Container from './Container';
import { FAQ_ITEMS } from '../content/process';
import { useInView } from '../hooks/useInView';
import type { EditorAttrs } from '../types/template';

export interface HomeFaqProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

/**
 * 자주 묻는 질문.
 *
 * details/summary를 써서 자바스크립트 없이도 열리고 닫힌다.
 * 키보드와 화면 낭독기에서 기본 동작을 그대로 쓸 수 있다.
 */
export function HomeFaq({ className, editorAttrs }: HomeFaqProps): React.ReactElement {
    const { ref: revealRef, isInView } = useInView({ once: true, threshold: 0.05 });

    const revealClass = (stagger: number): string =>
        `reveal ${isInView ? 'is-visible' : 'is-hidden'} reveal-stagger-${stagger}`;

    return (
        <Section
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-section-py-lg, 4.5rem)',
                backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
            }}
            data-testid="home-faq"
        >
            <Container>
                <div ref={revealRef}>
                    <Div
                        className={revealClass(1)}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'var(--20ft-faq-columns, 1fr)',
                            gap: 'var(--20ft-spacing-2xl, 3rem)',
                            alignItems: 'start',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        <Div
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
                                    lineHeight: 1.16,
                                    fontSize: 'clamp(1.625rem, 3.2vw, 2.5rem)',
                                    color: 'var(--20ft-deep-indigo, #102A4C)',
                                    wordBreak: 'keep-all',
                                }}
                            >
                                자주 묻는 질문
                            </H2>
                        </Div>

                        <Div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                                minWidth: 0,
                                borderTop: '1px solid var(--20ft-line, #D8D0BF)',
                            }}
                            data-testid="home-faq-list"
                        >
                            {FAQ_ITEMS.map((item) => (
                                <FaqRow key={item.question} question={item.question} answer={item.answer} />
                            ))}
                        </Div>
                    </Div>
                </div>
            </Container>
        </Section>
    );
}

function FaqRow({ question, answer }: { question: string; answer: string }): React.ReactElement {
    return (
        <details
            style={{
                borderBottom: '1px solid var(--20ft-line, #D8D0BF)',
                width: '100%',
                minWidth: 0,
            }}
            data-testid="home-faq-item"
        >
            <summary
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 'var(--20ft-spacing-sm, 0.75rem)',
                    padding: 'var(--20ft-spacing-md, 1rem) 0',
                    cursor: 'pointer',
                    listStyle: 'none',
                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    lineHeight: 1.6,
                    color: 'var(--20ft-deep-indigo, #102A4C)',
                    wordBreak: 'keep-all',
                }}
            >
                <Span
                    aria-hidden="true"
                    style={{
                        flexShrink: 0,
                        fontFamily: 'var(--20ft-font-mono, monospace)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--20ft-heritage-gold, #B69B5F)',
                    }}
                >
                    Q
                </Span>
                <H3
                    style={{
                        margin: 0,
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        fontWeight: 'inherit',
                        lineHeight: 'inherit',
                        color: 'inherit',
                    }}
                >
                    {question}
                </H3>
            </summary>
            <P
                style={{
                    margin: 0,
                    padding: '0 0 var(--20ft-spacing-md, 1rem) 1.5rem',
                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.8,
                    letterSpacing: '-0.005em',
                    color: 'var(--20ft-text-muted, #5E6063)',
                    wordBreak: 'keep-all',
                    overflowWrap: 'break-word',
                }}
            >
                {answer}
            </P>
        </details>
    );
}

export default HomeFaq;
