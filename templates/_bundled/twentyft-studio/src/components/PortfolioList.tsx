import React from 'react';
import { A, Article, Div, H1, H2, Li, P, Section, Span, Ul } from './basic';
import Container from './Container';
import LoadingRows from './LoadingRows';
import PrimaryButton from './PrimaryButton';
import SectionEyebrow from './SectionEyebrow';
import Status from './Status';
import { getDemoDisplay } from '../content/demos';
import { PAGE_META } from '../content/seo';
import { usePageMeta } from '../hooks/usePageMeta';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { PortfolioItem, SuperBifyItem, EditorAttrs } from '../types/template';

export interface PortfolioListProps {
    /** 고객 프로젝트. undefined/null = 아직 로딩 중. */
    items?: PortfolioItem[] | null;
    /** 자체 제작 데모·제품. undefined/null = 아직 로딩 중. */
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
    /** 분야 · 연도 · 상태 같은 짧은 정보 */
    meta: string;
    title: string;
    summary?: string;
    /** 자체 제작 데모의 실제 제품명. 보조 정보로만 표시한다. */
    productName?: string;
    href: string;
    linkLabel: string;
    coverImageUrl?: string;
}

function toClientEntry(item: PortfolioItem): CaseEntry {
    const field = FIELD_LABEL[item.types?.[0] ?? ''] ?? '제작';
    return {
        key: `portfolio-${item.id}`,
        kind: 'client',
        kindLabel: '고객 프로젝트',
        // 게시 상태(공개/제작 중 등)는 운영 정보라 고객 목록에 넣지 않는다.
        meta: [field, item.year].filter(Boolean).join(' · '),
        title: item.title,
        summary: item.summary,
        href: `/portfolio/${item.slug}`,
        linkLabel: '사례 자세히 보기',
        coverImageUrl: item.coverImageUrl,
    };
}

function toDemoEntry(item: SuperBifyItem): CaseEntry {
    // 일반 고객이 보는 목록이므로 제품명·호환성 대신 만든 화면의 성격을 앞세운다.
    // 제품명과 버전 정보는 SuperBify 제품 상세에 그대로 남아 있다.
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

export function PortfolioList({
    items,
    demos,
    loading = false,
    className,
    editorAttrs,
}: PortfolioListProps): React.ReactElement {
    usePageMeta(PAGE_META['/portfolio']);

    const isPending =
        loading || items === undefined || items === null || demos === undefined || demos === null;

    // 고객 프로젝트를 먼저, 자체 제작 데모를 뒤에 둔다. 같은 목록에서 배지로 구분한다.
    const entries: CaseEntry[] = [
        ...(Array.isArray(items) ? items : []).map(toClientEntry),
        ...(Array.isArray(demos) ? demos : []).map(toDemoEntry),
    ];

    return (
        <Div
            className={className}
            {...editorAttrs}
            style={{ backgroundColor: 'var(--20ft-paper-white, #FAF8F3)' }}
            data-testid="portfolio-list-page"
        >
            <Section
                style={{
                    paddingTop: 'var(--20ft-hero-py, 4rem)',
                    paddingBottom: 'var(--20ft-spacing-xl, 2.5rem)',
                }}
            >
                <Container>
                    <SectionEyebrow text="제작 사례" />
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
                        제작 사례
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
                        웹사이트와 업무 시스템, 직접 개발한 쇼핑몰 화면을 살펴보세요.
                    </P>
                </Container>
            </Section>

            <Section style={{ paddingBottom: 'var(--20ft-section-py-lg, 4.5rem)' }}>
                <Container>
                    {isPending ? (
                        <LoadingRows rows={3} testId="portfolio-list-loading" mediaAspect="16 / 9" />
                    ) : entries.length === 0 ? (
                        <Status
                            title="공개할 수 있는 사례를 준비하고 있습니다."
                            message="아직 공개된 사례가 없습니다."
                        />
                    ) : (
                        <Ul
                            style={{
                                listStyle: 'none',
                                margin: 0,
                                padding: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--20ft-case-row-gap, 2.5rem)',
                                width: '100%',
                                minWidth: 0,
                            }}
                            data-testid="portfolio-list"
                        >
                            {entries.map((entry) => (
                                <Li key={entry.key} style={{ display: 'flex', minWidth: 0 }}>
                                    <CaseRow entry={entry} />
                                </Li>
                            ))}
                        </Ul>
                    )}

                    <Div
                        style={{
                            marginTop: 'var(--20ft-spacing-2xl, 3.5rem)',
                            paddingTop: 'var(--20ft-spacing-lg, 1.5rem)',
                            borderTop: '1px solid var(--20ft-line, #D8D0BF)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 'var(--20ft-spacing-sm, 0.75rem)',
                        }}
                    >
                        <PrimaryButton href="/inquiry" variant="primary" data-testid="portfolio-inquiry-cta">
                            제작 문의하기
                        </PrimaryButton>
                        <PrimaryButton href="/superbify" variant="secondary" data-testid="portfolio-superbify-link">
                            자체 개발 제품 전체 보기
                        </PrimaryButton>
                    </Div>
                </Container>
            </Section>
        </Div>
    );
}

/**
 * 사례 한 건.
 *
 * 데스크톱은 화면과 설명을 나란히 두어 한 줄이 화면 전체를 쓰게 한다.
 * 사례가 한 건이어도 반쪽이 빈 격자가 생기지 않는다.
 */
function CaseRow({ entry }: { entry: CaseEntry }): React.ReactElement {
    const [isHovered, setIsHovered] = React.useState(false);
    const prefersReducedMotion = useReducedMotion();
    const isOwn = entry.kind === 'own';

    return (
        <Article
            style={{
                display: 'grid',
                gridTemplateColumns: 'var(--20ft-case-row-columns, 1fr)',
                gap: 'var(--20ft-case-row-gap-inner, 1.25rem)',
                alignItems: 'start',
                width: '100%',
                minWidth: 0,
            }}
            data-testid="portfolio-item"
        >
            <A
                href={entry.href}
                style={{
                    display: 'block',
                    width: '100%',
                    minWidth: 0,
                    borderRadius: 'var(--20ft-radius, 6px)',
                    overflow: 'hidden',
                    border: '1px solid var(--20ft-border, rgba(16, 42, 76, 0.12))',
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
                            aspectRatio: 'var(--20ft-case-image-aspect, 16 / 10)',
                            objectFit: 'cover',
                            transform: isHovered && !prefersReducedMotion ? 'scale(1.01)' : 'scale(1)',
                            transition: 'transform var(--20ft-duration-reveal) var(--20ft-ease-out)',
                        }}
                        loading="lazy"
                    />
                ) : (
                    <Div
                        style={{
                            width: '100%',
                            aspectRatio: 'var(--20ft-case-image-aspect, 16 / 10)',
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
                                textTransform: 'uppercase',
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
                    gap: 'var(--20ft-spacing-xs, 0.5rem)',
                    width: '100%',
                    minWidth: 0,
                }}
            >
                <Div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 'var(--20ft-spacing-xs, 0.5rem)',
                    }}
                >
                    <Span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.1875rem 0.5rem',
                            borderRadius: 'var(--20ft-radius-sm, 2px)',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: isOwn
                                ? 'var(--20ft-heritage-gold, #B69B5F)'
                                : 'var(--20ft-indigo, #183B6B)',
                            color: isOwn
                                ? 'var(--20ft-heritage-gold, #B69B5F)'
                                : 'var(--20ft-indigo, #183B6B)',
                            fontFamily: 'var(--20ft-font-mono, monospace)',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            whiteSpace: 'nowrap',
                        }}
                        data-testid="portfolio-item-kind"
                    >
                        {entry.kindLabel}
                    </Span>
                    <Span
                        style={{
                            fontFamily: 'var(--20ft-font-mono, monospace)',
                            fontSize: '0.6875rem',
                            letterSpacing: '0.06em',
                            color: 'var(--20ft-gray-500, #777A7D)',
                        }}
                    >
                        {entry.meta}
                    </Span>
                </Div>

                <H2
                    style={{
                        margin: 0,
                        fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                        fontSize: 'var(--20ft-h2-size, 1.5rem)',
                        fontWeight: 700,
                        letterSpacing: '-0.015em',
                        lineHeight: 1.28,
                        color: 'var(--20ft-indigo, #183B6B)',
                        wordBreak: 'keep-all',
                    }}
                >
                    {entry.title}
                </H2>

                {entry.summary && (
                    <P
                        style={{
                            margin: 0,
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            fontSize: '0.9375rem',
                            lineHeight: 1.8,
                            letterSpacing: '-0.005em',
                            color: 'var(--20ft-text-muted, #5E6063)',
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
                        data-testid="portfolio-item-product"
                    >
                        제품명 {entry.productName}
                    </Span>
                )}

                <A
                    href={entry.href}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        marginTop: 'var(--20ft-spacing-2xs, 0.25rem)',
                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: 'var(--20ft-indigo, #183B6B)',
                        textDecoration: 'none',
                        paddingBlock: 'var(--20ft-spacing-xs, 0.5rem)',
                    }}
                    data-testid="portfolio-item-link"
                >
                    {entry.linkLabel}
                    <Span aria-hidden="true">→</Span>
                </A>
            </Div>
        </Article>
    );
}

export default PortfolioList;
