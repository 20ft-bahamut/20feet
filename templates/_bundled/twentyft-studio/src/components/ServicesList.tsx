import React from 'react';
import { Div, H1, H2, Li, P, Section, Span, Ul } from './basic';
import Container from './Container';
import PrimaryButton from './PrimaryButton';
import SectionEyebrow from './SectionEyebrow';
import { SERVICES } from '../content/services';
import { PAGE_META } from '../content/seo';
import { usePageMeta } from '../hooks/usePageMeta';
import type { EditorAttrs } from '../types/template';

export interface ServicesListProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function ServicesList({ className, editorAttrs }: ServicesListProps): React.ReactElement {
    usePageMeta(PAGE_META['/services']);

    return (
        <Div
            className={className}
            {...editorAttrs}
            style={{
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="services-list-page"
        >
            <Section
                style={{
                    paddingTop: 'var(--20ft-hero-py, 4rem)',
                    paddingBottom: 'var(--20ft-spacing-xl, 2.5rem)',
                }}
            >
                <Container>
                    <SectionEyebrow text="제작 서비스" />
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
                        사업에 필요한 웹사이트를 제작합니다.
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
                        홈페이지, 쇼핑몰, 맞춤형 웹프로그램 중 필요한 분야를 살펴보세요. 여러 기능을 함께
                        구성해야 하는 경우에도 상담할 수 있습니다.
                    </P>
                </Container>
            </Section>

            <Section style={{ paddingBottom: 'var(--20ft-section-py-lg, 4.5rem)' }}>
                <Container>
                    <Ul
                        style={{
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            display: 'grid',
                            gridTemplateColumns: 'var(--20ft-services-columns, 1fr)',
                            gap: 'var(--20ft-spacing-xl, 2.5rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                        data-testid="services-list"
                    >
                        {SERVICES.map((service) => (
                            <Li key={service.key} style={{ display: 'flex', minWidth: 0 }}>
                                <Section
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 'var(--20ft-content-gap-md, 1.25rem)',
                                        width: '100%',
                                        minWidth: 0,
                                        height: '100%',
                                        paddingTop: 'var(--20ft-spacing-lg, 1.5rem)',
                                        borderTop: '2px solid var(--20ft-indigo, #183B6B)',
                                    }}
                                    data-testid={`service-${service.key}`}
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
                                        {service.label}
                                    </H2>

                                    <P
                                        style={{
                                            margin: 0,
                                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                                            fontSize: '1rem',
                                            lineHeight: 1.8,
                                            letterSpacing: '-0.005em',
                                            color: 'var(--20ft-text-muted, #5E6063)',
                                            maxWidth: '56ch',
                                            wordBreak: 'keep-all',
                                            overflowWrap: 'break-word',
                                        }}
                                    >
                                        {service.lead}
                                    </P>

                                    {service.sections[0]?.items && (
                                        <Div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 'var(--20ft-spacing-2xs, 0.25rem)',
                                                width: '100%',
                                                minWidth: 0,
                                            }}
                                        >
                                            <Span
                                                style={{
                                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                                    fontSize: '0.8125rem',
                                                    fontWeight: 600,
                                                    letterSpacing: '0.04em',
                                                    color: 'var(--20ft-heritage-gold, #B69B5F)',
                                                }}
                                            >
                                                {service.sections[0].heading}
                                            </Span>
                                            <Ul
                                                style={{
                                                    listStyle: 'none',
                                                    margin: 0,
                                                    padding: 0,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.125rem',
                                                }}
                                            >
                                                {service.sections[0].items.map((item) => (
                                                    <Li
                                                        key={item}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'baseline',
                                                            gap: 'var(--20ft-spacing-xs, 0.5rem)',
                                                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                                                            fontSize: '0.9375rem',
                                                            lineHeight: 1.75,
                                                            color: 'var(--20ft-text-primary, #1A1A1A)',
                                                            wordBreak: 'keep-all',
                                                            overflowWrap: 'break-word',
                                                        }}
                                                    >
                                                        <Span
                                                            aria-hidden="true"
                                                            style={{
                                                                color: 'var(--20ft-heritage-gold, #B69B5F)',
                                                            }}
                                                        >
                                                            —
                                                        </Span>
                                                        {item}
                                                    </Li>
                                                ))}
                                            </Ul>
                                        </Div>
                                    )}

                                    <Div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 'var(--20ft-spacing-sm, 0.75rem)',
                                            marginTop: 'auto',
                                            paddingTop: 'var(--20ft-spacing-xs, 0.5rem)',
                                        }}
                                    >
                                        <PrimaryButton
                                            href={service.path}
                                            variant="secondary"
                                            size="medium"
                                            data-testid={`service-${service.key}-detail`}
                                        >
                                            {service.shortLabel} 상세 보기
                                        </PrimaryButton>
                                        <PrimaryButton
                                            href={`/inquiry?type=${service.inquiryType}`}
                                            variant="primary"
                                            size="medium"
                                            data-testid={`service-${service.key}-inquiry`}
                                        >
                                            {service.ctaLabel}
                                        </PrimaryButton>
                                    </Div>
                                </Section>
                            </Li>
                        ))}
                    </Ul>
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
                            필요한 기능이 아직 정해지지 않아도 괜찮습니다.
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
                            지금 상황과 만들고 싶은 것을 알려주시면 필요한 기능을 함께 검토합니다.
                        </P>
                        <Div style={{ marginTop: 'var(--20ft-spacing-xs, 0.5rem)' }}>
                            <PrimaryButton href="/inquiry" variant="primary" data-testid="services-inquiry-cta">
                                제작 문의하기
                            </PrimaryButton>
                        </Div>
                    </Div>
                </Container>
            </Section>
        </Div>
    );
}

export default ServicesList;
