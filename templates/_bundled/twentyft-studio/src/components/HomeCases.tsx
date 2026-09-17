import React from 'react';
import { A, Article, Div, H2, H3, Li, P, Section, Span, Ul } from './basic';
import Container from './Container';
import LoadingRows from './LoadingRows';
import Status from './Status';
import { getDemoDisplay } from '../content/demos';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { PortfolioItem, SuperBifyItem, EditorAttrs } from '../types/template';

export interface HomeCasesProps {
    /** 공개된 제작 사례. undefined/null = 아직 로딩 중. */
    items?: PortfolioItem[] | null;
    /** 자체 제작 제품·데모. undefined/null = 아직 로딩 중. */
    demos?: SuperBifyItem[] | null;
    loading?: boolean;
    className?: string;
    editorAttrs?: EditorAttrs;
}

const FIELD_LABEL: Record<string, string> = {
    WEB: '홈페이지',
    COMMERCE: '쇼핑몰',
    SOFTWARE: '업무 시스템',
    OPEN_SOURCE: '오픈소스',
};

interface CaseEntry {
    key: string;
    /** 고객 프로젝트 / 자체 제작 데모 */
    kind: 'client' | 'own';
    kindLabel: string;
    /** 분야·시기 같은 짧은 정보 */
    meta: string;
    title: string;
    /** 무엇에 쓰는지 한 문장 */
    summary?: string;
    /** 자체 제작 데모의 실제 제품명. 보조 정보. */
    productName?: string;
    href: string;
    linkLabel: string;
    coverImageUrl?: string;
}

function toClientCase(item: PortfolioItem): CaseEntry {
    const field = FIELD_LABEL[item.types?.[0] ?? ''] ?? '제작';
    return {
        key: `portfolio-${item.id}`,
        kind: 'client',
        kindLabel: '고객 프로젝트',
        meta: [field, item.year].filter(Boolean).join(' · '),
        title: item.title,
        summary: item.summary,
        href: `/portfolio/${item.slug}`,
        linkLabel: '사례 자세히 보기',
        coverImageUrl: item.coverImageUrl,
    };
}

function toDemoCase(item: SuperBifyItem): CaseEntry {
    const field = item.type === 'TEMPLATE' ? '쇼핑몰' : '자체 개발 제품';
    const display = getDemoDisplay(item.slug, item.title, item.summary);
    return {
        key: `demo-${item.id}`,
        kind: 'own',
        kindLabel: '자체 제작 데모',
        meta: field,
        title: display.title,
        summary: display.summary,
        productName: item.title,
        href: `/superbify/${item.slug}`,
        linkLabel: '제품 자세히 보기',
        coverImageUrl: item.coverImageUrl,
    };
}

/**
 * 제작 사례.
 *
 * 한 건씩 화면 폭을 모두 쓰는 행으로 쌓는다. 두 칸으로 나누면 실제 화면이 작아져
 * 무엇을 만들었는지 읽히지 않는다. 이미지는 원본 비율(16:9)을 그대로 쓴다.
 */
export function HomeCases({
    items,
    demos,
    loading = false,
    className,
    editorAttrs,
}: HomeCasesProps): React.ReactElement {
    const { ref: sectionRef, isInView } = useInView({ once: true, threshold: 0.05 });

    const isPending =
        loading || items === undefined || items === null || demos === undefined || demos === null;

    const entries: CaseEntry[] = [
        ...(Array.isArray(items) ? items : []).map(toClientCase),
        ...(Array.isArray(demos) ? demos : []).map(toDemoCase),
    ];

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
            data-testid="home-cases"
        >
            <Container>
                <div ref={sectionRef}>
                    <H2
                        className={revealClass(1)}
                        style={{
                            margin: 0,
                            marginBottom: 'var(--20ft-home-heading-gap, 1.75rem)',
                            fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                            fontWeight: 700,
                            fontSize: 'var(--20ft-home-h2-size, clamp(1.375rem, 2.4vw, 1.875rem))',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.25,
                            color: 'var(--20ft-deep-indigo, #102A4C)',
                            wordBreak: 'keep-all',
                        }}
                    >
                        주요 제작 사례
                    </H2>

                    {isPending ? (
                        <LoadingRows rows={2} testId="home-cases-loading" mediaAspect="16 / 9" />
                    ) : entries.length === 0 ? (
                        <Status
                            title="공개할 수 있는 작업을 준비하고 있습니다."
                            message="아직 공개된 작업이 없습니다."
                        />
                    ) : (
                        <Ul
                            style={{
                                listStyle: 'none',
                                margin: 0,
                                padding: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--20ft-home-case-gap, 3rem)',
                                width: '100%',
                                minWidth: 0,
                            }}
                            data-testid="home-cases-list"
                        >
                            {entries.map((entry, index) => (
                                <Li
                                    key={entry.key}
                                    className={revealClass(index === 0 ? 2 : 3)}
                                    style={{ display: 'flex', width: '100%', minWidth: 0 }}
                                    data-testid="home-case"
                                >
                                    <CaseRow entry={entry} />
                                </Li>
                            ))}
                        </Ul>
                    )}
                </div>
            </Container>
        </Section>
    );
}

/**
 * 사례 한 건 — 화면 → 구분선·제목 → 한 문장 → 링크.
 * 설명이 화면보다 먼저 오지 않게 순서를 고정한다.
 */
function CaseRow({ entry }: { entry: CaseEntry }): React.ReactElement {
    const [isHovered, setIsHovered] = React.useState(false);
    const prefersReducedMotion = useReducedMotion();

    return (
        <Article
            style={{
                display: 'grid',
                // 고객 사례는 이미지가 화면 폭을 다 쓴다(업무 화면을 읽을 수 있어야 한다).
                // 자체 제작 데모만 넓은 화면에서 설명을 옆에 두고 낮춰 쌓는다.
                gridTemplateColumns:
                    entry.kind === 'own'
                        ? 'var(--20ft-home-demo-columns, 1fr)'
                        : 'var(--20ft-home-case-columns, 1fr)',
                gap: 'var(--20ft-home-case-row-gap, 1.25rem)',
                alignItems: 'start',
                width: '100%',
                minWidth: 0,
            }}
        >
            <A
                href={entry.href}
                style={{
                    display: 'block',
                    width: '100%',
                    minWidth: 0,
                    borderRadius: 'var(--20ft-radius, 6px)',
                    overflow: 'hidden',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--20ft-border, rgba(16, 42, 76, 0.12))',
                    backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
                    textDecoration: 'none',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                tabIndex={-1}
                aria-hidden="true"
            >
                {entry.coverImageUrl ? (
                    <img
                        src={entry.coverImageUrl}
                        alt=""
                        style={{
                            display: 'block',
                            width: '100%',
                            aspectRatio: 'var(--20ft-home-case-aspect, 16 / 9)',
                            objectFit: 'cover',
                            transform: isHovered && !prefersReducedMotion ? 'scale(1.005)' : 'scale(1)',
                            transition: 'transform var(--20ft-duration-reveal) var(--20ft-ease-out)',
                        }}
                        loading="lazy"
                    />
                ) : (
                    <Div
                        style={{
                            width: '100%',
                            aspectRatio: 'var(--20ft-home-case-aspect, 16 / 9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Span
                            style={{
                                fontFamily: 'var(--20ft-font-mono, monospace)',
                                fontSize: '0.75rem',
                                letterSpacing: '0.08em',
                                color: 'var(--20ft-gray-500, #777A7D)',
                            }}
                        >
                            화면 준비 중
                        </Span>
                    </Div>
                )}
            </A>

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
                        fontFamily: 'var(--20ft-font-mono, monospace)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        color: 'var(--20ft-heritage-gold, #B69B5F)',
                    }}
                    data-testid="home-case-label"
                >
                    {entry.kindLabel} · {entry.meta}
                </Span>

                <H3
                    style={{
                        margin: 0,
                        fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                        fontSize: 'var(--20ft-home-case-title-size, clamp(1.25rem, 2vw, 1.5rem))',
                        fontWeight: 700,
                        letterSpacing: '-0.015em',
                        lineHeight: 1.3,
                        color: 'var(--20ft-indigo, #183B6B)',
                        wordBreak: 'keep-all',
                    }}
                >
                    {entry.title}
                </H3>

                {entry.summary && (
                    <P
                        style={{
                            margin: 0,
                            marginTop: 'var(--20ft-spacing-2xs, 0.25rem)',
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            fontSize: '1rem',
                            lineHeight: 1.75,
                            letterSpacing: '-0.005em',
                            color: 'var(--20ft-text-muted, #5E6063)',
                            maxWidth: '70ch',
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word',
                        }}
                    >
                        {entry.summary}
                    </P>
                )}

                {entry.productName && (
                    <Span
                        style={{
                            fontFamily: 'var(--20ft-font-mono, monospace)',
                            fontSize: '0.75rem',
                            letterSpacing: '0.04em',
                            color: 'var(--20ft-gray-500, #777A7D)',
                        }}
                        data-testid="home-case-product"
                    >
                        제품명 {entry.productName}
                    </Span>
                )}

                <A
                    href={entry.href}
                    style={{
                        alignSelf: 'flex-start',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        marginTop: 'var(--20ft-spacing-xs, 0.5rem)',
                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: 'var(--20ft-indigo, #183B6B)',
                        textDecoration: 'none',
                        paddingBlock: 'var(--20ft-spacing-2xs, 0.25rem)',
                    }}
                    data-testid="home-case-link"
                >
                    {entry.linkLabel}
                    <Span aria-hidden="true">→</Span>
                </A>
            </Div>
        </Article>
    );
}

export default HomeCases;
