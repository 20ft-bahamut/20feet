import React from 'react';
import { Div, H2, P, Section, Span } from './basic';
import Container from './Container';
import SectionEyebrow from './SectionEyebrow';
import { useInView } from '../hooks/useInView';
import type { EditorAttrs } from '../types/template';

export interface HomeWhatWeBuildProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

interface BuildItem {
    index: string;
    title: string;
    description: string;
}

const buildItems: BuildItem[] = [
    {
        index: '01',
        title: 'WEB',
        description: '기업·브랜드 웹사이트부터 실제 서비스되는 웹서비스까지 기획하고 개발합니다.',
    },
    {
        index: '02',
        title: 'COMMERCE',
        description: '상품, 주문, 결제와 운영 흐름을 실제 비즈니스에 맞게 연결하는 커머스 시스템을 만듭니다.',
    },
    {
        index: '03',
        title: 'SOFTWARE',
        description: '반복 업무를 줄이는 관리자 시스템, B2B SaaS, 업무용 소프트웨어를 설계하고 개발합니다.',
    },
    {
        index: '04',
        title: 'GNUBOARD 7',
        description: 'Gnuboard 7 기반 Template, Module, Plugin과 재사용 가능한 확장 제품을 개발합니다.',
    },
];

export function HomeWhatWeBuild({ className, editorAttrs }: HomeWhatWeBuildProps): React.ReactElement {
    const { ref: revealRef, isInView } = useInView({ once: true, threshold: 0.05 });

    const revealClass = (stagger: number): string => {
        const hidden = isInView ? 'is-visible' : 'is-hidden';
        return `reveal ${hidden} reveal-stagger-${stagger}`;
    };

    return (
        <Section
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-section-py-xl, 5rem)',
                backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
            }}
            data-testid="home-what-we-build"
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
                        <SectionEyebrow text="WHAT WE BUILD" />
                        <H2
                            style={{
                                margin: 0,
                                fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                                lineHeight: 1.12,
                                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                                color: 'var(--20ft-deep-indigo, #102A4C)',
                                wordBreak: 'keep-all',
                                overflowWrap: 'break-word',
                            }}
                        >
                            필요한 것을 직접 만듭니다.
                        </H2>
                    </Div>

                    <Div
                        className={revealClass(2)}
                        role="list"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'var(--20ft-home-build-columns, 1fr)',
                            gap: 'var(--20ft-spacing-lg, 1.5rem)',
                            marginTop: 'var(--20ft-content-gap-lg, 1.75rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        {buildItems.map((item) => (
                            <Div
                                key={item.title}
                                role="listitem"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--20ft-spacing-xs, 0.5rem)',
                                    paddingBlock: 'var(--20ft-spacing-md, 1rem)',
                                    borderTop: '1px solid var(--20ft-line, #D8D0BF)',
                                    width: '100%',
                                    minWidth: 0,
                                }}
                            >
                                <Div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'baseline',
                                        gap: 'var(--20ft-spacing-md, 1rem)',
                                        width: '100%',
                                        minWidth: 0,
                                    }}
                                >
                                    <Span
                                        style={{
                                            fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                            fontSize: 'clamp(1.375rem, 2.5vw, 1.875rem)',
                                            fontWeight: 700,
                                            letterSpacing: '-0.02em',
                                            color: 'var(--20ft-deep-indigo, #102A4C)',
                                        }}
                                    >
                                        {item.title}
                                    </Span>
                                    <Span
                                        style={{
                                            fontFamily: 'var(--20ft-font-mono, monospace)',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            letterSpacing: '0.08em',
                                            color: 'var(--20ft-heritage-gold, #B69B5F)',
                                        }}
                                    >
                                        {item.index}
                                    </Span>
                                </Div>
                                <P
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                        fontSize: '1rem',
                                        lineHeight: 1.7,
                                        letterSpacing: '-0.01em',
                                        color: 'var(--20ft-text-muted, #5E6063)',
                                        wordBreak: 'keep-all',
                                        overflowWrap: 'break-word',
                                    }}
                                >
                                    {item.description}
                                </P>
                            </Div>
                        ))}
                    </Div>
                </div>
            </Container>
        </Section>
    );
}

export default HomeWhatWeBuild;