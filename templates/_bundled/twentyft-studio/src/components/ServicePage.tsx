import React from 'react';
import { A, Div, H1, H2, H3, Li, P, Section, Span, Ul } from './basic';
import Container from './Container';
import LoadingRows from './LoadingRows';
import PrimaryButton from './PrimaryButton';
import SectionEyebrow from './SectionEyebrow';
import Status from './Status';
import { getService, type ServiceKey, type ServiceSection } from '../content/services';
import { getDemoDisplay } from '../content/demos';
import { PAGE_META } from '../content/seo';
import { usePageMeta } from '../hooks/usePageMeta';
import type { PortfolioItem, SuperBifyItem, EditorAttrs } from '../types/template';

export interface ServicePageProps {
    /** 어떤 서비스 상세인지. 레이아웃 JSON의 props로 지정한다. */
    service: ServiceKey;
    /** 커머스 상세에서 보여줄 자체 제작 데모. */
    demos?: SuperBifyItem[] | null;
    /** 웹프로그램 상세에서 보여줄 실제 사례. */
    cases?: PortfolioItem[] | null;
    className?: string;
    editorAttrs?: EditorAttrs;
}

/**
 * 제작 서비스 상세.
 *
 * 각 섹션은 '제목 → 설명 → 실제 자료 → 상세 링크' 순서를 지킨다.
 * 자료가 붙는 섹션은 서비스 정의에서 `evidence` 로 표시하므로,
 * 카드가 설명보다 먼저 나오는 일이 없다.
 */
export function ServicePage({
    service,
    demos,
    cases,
    className,
    editorAttrs,
}: ServicePageProps): React.ReactElement {
    const definition = getService(service);
    usePageMeta(PAGE_META[definition.path] ?? PAGE_META['/services']);

    return (
        <Div
            className={className}
            {...editorAttrs}
            style={{ backgroundColor: 'var(--20ft-paper-white, #FAF8F3)' }}
            data-testid={`service-page-${definition.key}`}
        >
            <Section
                style={{
                    paddingTop: 'var(--20ft-hero-py, 4rem)',
                    paddingBottom: 'var(--20ft-spacing-xl, 2.5rem)',
                }}
            >
                <Container>
                    <SectionEyebrow text={`제작 서비스 · ${definition.label}`} />
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
                            maxWidth: '26ch',
                        }}
                    >
                        {definition.heading}
                    </H1>
                    <P
                        style={{
                            margin: 0,
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            fontSize: '1.0625rem',
                            lineHeight: 1.8,
                            letterSpacing: '-0.01em',
                            color: 'var(--20ft-text-muted, #5E6063)',
                            maxWidth: '52ch',
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word',
                        }}
                    >
                        {definition.lead}
                    </P>
                </Container>
            </Section>

            <Section style={{ paddingBottom: 'var(--20ft-section-py-lg, 4.5rem)' }}>
                <Container>
                    <Div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--20ft-service-block-gap, 3rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        {definition.sections.map((item, index) => (
                            <ServiceBlock
                                key={item.heading}
                                item={item}
                                index={index}
                                demos={demos}
                                cases={cases}
                            />
                        ))}

                        <Div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 'var(--20ft-spacing-sm, 0.75rem)',
                                paddingTop: 'var(--20ft-spacing-lg, 1.5rem)',
                                borderTop: '1px solid var(--20ft-line, #D8D0BF)',
                            }}
                        >
                            <PrimaryButton
                                href={`/inquiry?type=${definition.inquiryType}`}
                                variant="primary"
                                size="medium"
                                data-testid="service-page-inquiry"
                            >
                                {definition.ctaLabel}
                            </PrimaryButton>
                            <PrimaryButton
                                href="/services"
                                variant="secondary"
                                size="medium"
                                data-testid="service-page-back"
                            >
                                다른 제작 분야 보기
                            </PrimaryButton>
                        </Div>
                    </Div>
                </Container>
            </Section>
        </Div>
    );
}

function ServiceBlock({
    item,
    index,
    demos,
    cases,
}: {
    item: ServiceSection;
    index: number;
    demos?: SuperBifyItem[] | null;
    cases?: PortfolioItem[] | null;
}): React.ReactElement {
    return (
        <Div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--20ft-content-gap-md, 1.25rem)',
                width: '100%',
                minWidth: 0,
                paddingTop: 'var(--20ft-spacing-lg, 1.5rem)',
                borderTop: '2px solid var(--20ft-indigo, #183B6B)',
            }}
            data-testid={`service-section-${index}`}
        >
            <Div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--20ft-content-gap-sm, 0.75rem)',
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
                        letterSpacing: '-0.015em',
                        lineHeight: 1.3,
                        color: 'var(--20ft-deep-indigo, #102A4C)',
                        wordBreak: 'keep-all',
                    }}
                >
                    {item.heading}
                </H2>

                {item.lead && (
                    <P
                        style={{
                            margin: 0,
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            fontSize: '1rem',
                            lineHeight: 1.8,
                            letterSpacing: '-0.005em',
                            color: 'var(--20ft-text-muted, #5E6063)',
                            maxWidth: '58ch',
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word',
                        }}
                    >
                        {item.lead}
                    </P>
                )}
            </Div>

            {item.items && (
                <Ul
                    style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        display: 'grid',
                        gridTemplateColumns: 'var(--20ft-service-item-columns, 1fr)',
                        gap: '0 var(--20ft-spacing-xl, 2.5rem)',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    {item.items.map((entry) => (
                        <Li
                            key={entry}
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: 'var(--20ft-spacing-xs, 0.5rem)',
                                paddingBlock: 'var(--20ft-spacing-sm, 0.75rem)',
                                borderBottom: '1px solid var(--20ft-line, #D8D0BF)',
                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                fontSize: '1rem',
                                lineHeight: 1.7,
                                color: 'var(--20ft-text-primary, #1A1A1A)',
                                wordBreak: 'keep-all',
                                overflowWrap: 'break-word',
                            }}
                        >
                            <Span aria-hidden="true" style={{ color: 'var(--20ft-heritage-gold, #B69B5F)' }}>
                                —
                            </Span>
                            {entry}
                        </Li>
                    ))}
                </Ul>
            )}

            {item.note && (
                <P
                    style={{
                        margin: 0,
                        padding: 'var(--20ft-spacing-md, 1rem)',
                        borderRadius: 'var(--20ft-radius, 6px)',
                        backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                        fontSize: '0.9375rem',
                        lineHeight: 1.8,
                        letterSpacing: '-0.005em',
                        color: 'var(--20ft-text-primary, #1A1A1A)',
                        maxWidth: '62ch',
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word',
                    }}
                >
                    {item.note}
                </P>
            )}

            {/* 자료는 설명 뒤에 온다. 링크는 카드 안에 있으므로 순서가 '설명 → 자료 → 링크'로 유지된다. */}
            {item.evidence === 'demos' && <DemoEvidence demos={demos} />}
            {item.evidence === 'cases' && <CaseEvidence cases={cases} />}
        </Div>
    );
}

function DemoEvidence({ demos }: { demos?: SuperBifyItem[] | null }): React.ReactElement {
    const isPending = demos === undefined || demos === null;
    const list = Array.isArray(demos) ? demos : [];

    if (isPending) {
        return <LoadingRows rows={1} testId="service-demo-loading" mediaAspect="16 / 9" />;
    }

    if (list.length === 0) {
        return (
            <Status
                title="공개할 수 있는 화면을 준비하고 있습니다."
                message="공개된 화면이 준비되면 이 자리에 추가됩니다."
            />
        );
    }

    return (
        <Ul
            style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'grid',
                gridTemplateColumns: 'var(--20ft-service-evidence-columns, 1fr)',
                gap: 'var(--20ft-spacing-lg, 1.5rem)',
                width: '100%',
                minWidth: 0,
            }}
            data-testid="service-demo-evidence"
        >
            {list.map((item) => {
                const display = getDemoDisplay(item.slug, item.title, item.summary);
                return (
                    <Li key={item.id} style={{ display: 'flex', minWidth: 0 }}>
                        <EvidenceCard
                            href={`/superbify/${item.slug}`}
                            kindLabel="자체 제작 데모"
                            title={display.title}
                            summary={display.summary}
                            footnote={`제품명 ${item.title}`}
                            linkLabel="제품 자세히 보기"
                            coverImageUrl={item.coverImageUrl}
                        />
                    </Li>
                );
            })}
        </Ul>
    );
}

function CaseEvidence({ cases }: { cases?: PortfolioItem[] | null }): React.ReactElement {
    const isPending = cases === undefined || cases === null;
    const list = Array.isArray(cases) ? cases : [];

    if (isPending) {
        return <LoadingRows rows={1} testId="service-case-loading" mediaAspect="16 / 9" />;
    }

    if (list.length === 0) {
        return (
            <Status
                title="공개할 수 있는 사례를 준비하고 있습니다."
                message="공개된 사례가 준비되면 이 자리에 추가됩니다."
            />
        );
    }

    return (
        <Ul
            style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'grid',
                gridTemplateColumns: 'var(--20ft-service-evidence-columns, 1fr)',
                gap: 'var(--20ft-spacing-lg, 1.5rem)',
                width: '100%',
                minWidth: 0,
            }}
            data-testid="service-case-evidence"
        >
            {list.map((item) => (
                <Li key={item.id} style={{ display: 'flex', minWidth: 0 }}>
                    <EvidenceCard
                        href={`/portfolio/${item.slug}`}
                        kindLabel="고객 프로젝트"
                        title={item.title}
                        summary={item.summary}
                        footnote={
                            item.role && item.role.length > 0 ? `역할 ${item.role.join(' · ')}` : undefined
                        }
                        linkLabel="사례 자세히 보기"
                        coverImageUrl={item.coverImageUrl}
                    />
                </Li>
            ))}
        </Ul>
    );
}

function EvidenceCard({
    href,
    kindLabel,
    title,
    summary,
    footnote,
    linkLabel,
    coverImageUrl,
}: {
    href: string;
    kindLabel: string;
    title: string;
    summary?: string;
    footnote?: string;
    linkLabel: string;
    coverImageUrl?: string;
}): React.ReactElement {
    return (
        <A
            href={href}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--20ft-spacing-sm, 0.75rem)',
                width: '100%',
                minWidth: 0,
                padding: 'var(--20ft-spacing-md, 1rem)',
                borderRadius: 'var(--20ft-radius, 6px)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--20ft-border, rgba(16, 42, 76, 0.12))',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
                textDecoration: 'none',
            }}
            data-testid="service-evidence-card"
        >
            {coverImageUrl && (
                <img
                    src={coverImageUrl}
                    alt={`${title} 화면`}
                    style={{
                        display: 'block',
                        width: '100%',
                        aspectRatio: '16 / 9',
                        objectFit: 'cover',
                        borderRadius: 'var(--20ft-radius-sm, 2px)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--20ft-border, rgba(16, 42, 76, 0.08))',
                    }}
                    loading="lazy"
                />
            )}

            <Span
                style={{
                    display: 'inline-flex',
                    alignSelf: 'flex-start',
                    padding: '0.1875rem 0.5rem',
                    borderRadius: 'var(--20ft-radius-sm, 2px)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--20ft-heritage-gold, #B69B5F)',
                    color: 'var(--20ft-heritage-gold, #B69B5F)',
                    fontFamily: 'var(--20ft-font-mono, monospace)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                }}
            >
                {kindLabel}
            </Span>

            <H3
                style={{
                    margin: 0,
                    fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.35,
                    color: 'var(--20ft-indigo, #183B6B)',
                    wordBreak: 'keep-all',
                }}
            >
                {title}
            </H3>

            {summary && (
                <P
                    style={{
                        margin: 0,
                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                        fontSize: '0.9375rem',
                        lineHeight: 1.75,
                        color: 'var(--20ft-text-muted, #5E6063)',
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word',
                    }}
                >
                    {summary}
                </P>
            )}

            {footnote && (
                <Span
                    style={{
                        fontFamily: 'var(--20ft-font-mono, monospace)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.04em',
                        color: 'var(--20ft-gray-500, #777A7D)',
                    }}
                >
                    {footnote}
                </Span>
            )}

            <Span
                style={{
                    marginTop: 'auto',
                    paddingTop: 'var(--20ft-spacing-2xs, 0.25rem)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: 'var(--20ft-indigo, #183B6B)',
                }}
            >
                {linkLabel}
                <Span aria-hidden="true">→</Span>
            </Span>
        </A>
    );
}

export default ServicePage;
