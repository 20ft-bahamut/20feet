import React from 'react';
import { Div, H1, H2, H3, Li, Ol, P, Section, Span } from './basic';
import Container from './Container';
import PrimaryButton from './PrimaryButton';
import SectionEyebrow from './SectionEyebrow';
import { FAQ_ITEMS, PROCESS_STEPS } from '../content/process';
import { PAGE_META } from '../content/seo';
import { usePageMeta } from '../hooks/usePageMeta';
import type { EditorAttrs } from '../types/template';

export interface ProcessPageProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function ProcessPage({ className, editorAttrs }: ProcessPageProps): React.ReactElement {
    usePageMeta(PAGE_META['/process']);

    return (
        <Div
            className={className}
            {...editorAttrs}
            style={{ backgroundColor: 'var(--20ft-paper-white, #FAF8F3)' }}
            data-testid="process-page"
        >
            <Section
                style={{
                    paddingTop: 'var(--20ft-hero-py, 4rem)',
                    paddingBottom: 'var(--20ft-spacing-xl, 2.5rem)',
                }}
            >
                <Container>
                    <SectionEyebrow text="진행 안내" />
                    <H1
                        style={{
                            margin: 0,
                            marginBottom: 'var(--20ft-spacing-md, 1rem)',
                            fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                            fontWeight: 700,
                            fontSize: 'clamp(1.75rem, 3.6vw, 2.75rem)',
                            lineHeight: 1.2,
                            letterSpacing: '-0.02em',
                            color: 'var(--20ft-deep-indigo, #102A4C)',
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word',
                        }}
                    >
                        문의부터 제작까지의 진행 안내
                    </H1>
                    <P
                        style={{
                            margin: 0,
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            fontSize: '1.0625rem',
                            lineHeight: 1.8,
                            letterSpacing: '-0.01em',
                            color: 'var(--20ft-text-muted, #5E6063)',
                            maxWidth: '58ch',
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word',
                        }}
                    >
                        문의를 보내면 상담부터 시작합니다. 각 단계에서 무엇을 하는지 미리
                        확인하실 수 있습니다.
                    </P>
                </Container>
            </Section>

            <Section style={{ paddingBottom: 'var(--20ft-process-heading-gap, 3rem)' }}>
                <Container>
                    <Ol
                        style={{
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--20ft-process-step-gap, 1.75rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                        data-testid="process-steps"
                    >
                        {PROCESS_STEPS.map((step, index) => (
                            <Li
                                key={step.title}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--20ft-spacing-xs, 0.5rem)',
                                    paddingTop: 'var(--20ft-spacing-md, 1rem)',
                                    borderTop: '2px solid var(--20ft-indigo, #183B6B)',
                                    width: '100%',
                                    minWidth: 0,
                                }}
                                data-testid={`process-step-${index}`}
                            >
                                <Div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: 'var(--20ft-spacing-sm, 0.75rem)',
                                    }}
                                >
                                    <Span
                                        style={{
                                            fontFamily: 'var(--20ft-font-mono, monospace)',
                                            fontSize: '0.8125rem',
                                            fontWeight: 600,
                                            letterSpacing: '0.08em',
                                            color: 'var(--20ft-heritage-gold, #B69B5F)',
                                        }}
                                        aria-hidden="true"
                                    >
                                        {String(index + 1).padStart(2, '0')}
                                    </Span>
                                    <H2
                                        style={{
                                            margin: 0,
                                            fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                            fontWeight: 600,
                                            fontSize: 'var(--20ft-h2-size, 1.5rem)',
                                            letterSpacing: '-0.015em',
                                            lineHeight: 1.3,
                                            color: 'var(--20ft-deep-indigo, #102A4C)',
                                            wordBreak: 'keep-all',
                                        }}
                                    >
                                        {step.title}
                                    </H2>
                                </Div>

                                <P
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                        fontSize: '1rem',
                                        lineHeight: 1.8,
                                        color: 'var(--20ft-text-muted, #5E6063)',
                                        wordBreak: 'keep-all',
                                    }}
                                >
                                    {step.summary}
                                </P>

                            </Li>
                        ))}
                    </Ol>
                </Container>
            </Section>

            <Section
                style={{
                    paddingBlock: 'var(--20ft-section-py-lg, 4.5rem)',
                    backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
                }}
            >
                <Container>
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
                                fontWeight: 600,
                                fontSize: 'var(--20ft-h2-size, 1.5rem)',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.25,
                                color: 'var(--20ft-deep-indigo, #102A4C)',
                                wordBreak: 'keep-all',
                            }}
                        >
                            자주 묻는 질문
                        </H2>

                        {FAQ_ITEMS.map((item) => (
                            <Div
                                key={item.question}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--20ft-spacing-2xs, 0.25rem)',
                                    paddingTop: 'var(--20ft-spacing-md, 1rem)',
                                    borderTop: '1px solid var(--20ft-line, #D8D0BF)',
                                    width: '100%',
                                    minWidth: 0,
                                }}
                                data-testid="process-faq-item"
                            >
                                <H3
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        lineHeight: 1.6,
                                        color: 'var(--20ft-deep-indigo, #102A4C)',
                                        wordBreak: 'keep-all',
                                    }}
                                >
                                    {item.question}
                                </H3>
                                <P
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.8,
                                        color: 'var(--20ft-text-muted, #5E6063)',
                                        maxWidth: '68ch',
                                        wordBreak: 'keep-all',
                                        overflowWrap: 'break-word',
                                    }}
                                >
                                    {item.answer}
                                </P>
                            </Div>
                        ))}
                    </Div>
                </Container>
            </Section>

            <Section style={{ paddingBlock: 'var(--20ft-section-py-lg, 4.5rem)' }}>
                <Container>
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
                                fontWeight: 600,
                                fontSize: 'var(--20ft-h2-size, 1.5rem)',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.25,
                                color: 'var(--20ft-deep-indigo, #102A4C)',
                                wordBreak: 'keep-all',
                            }}
                        >
                            첫 상담을 시작해보세요.
                        </H2>
                        <P
                            style={{
                                margin: 0,
                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                fontSize: '1rem',
                                lineHeight: 1.8,
                                color: 'var(--20ft-text-muted, #5E6063)',
                                maxWidth: '58ch',
                                wordBreak: 'keep-all',
                            }}
                        >
                            만들고 싶은 것과 현재 상황을 알려주시면 확인 후 회신드립니다.
                        </P>
                        <Div style={{ marginTop: 'var(--20ft-spacing-xs, 0.5rem)' }}>
                            <PrimaryButton href="/inquiry" variant="primary" data-testid="process-inquiry-cta">
                                제작 문의하기
                            </PrimaryButton>
                        </Div>
                    </Div>
                </Container>
            </Section>
        </Div>
    );
}

export default ProcessPage;
