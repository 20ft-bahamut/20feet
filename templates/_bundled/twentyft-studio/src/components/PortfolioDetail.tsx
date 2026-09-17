import React from 'react';
import { A, Article, Div, H1, H2, Li, P, Section, Span, Ul } from './basic';
import Container from './Container';
import LoadingRows from './LoadingRows';
import PrimaryButton from './PrimaryButton';
import Status from './Status';
import ZoomableImage from './ZoomableImage';
import { detailMeta } from '../content/seo';
import { usePageMeta } from '../hooks/usePageMeta';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import type { PortfolioItem, EditorAttrs } from '../types/template';

export interface PortfolioDetailProps {
    item?: PortfolioItem | null;
    /**
     * 대표 주소. 이전 주소로 열린 화면은 대표 주소를 canonical 로 가리킨다.
     * 지정하지 않으면 현재 경로를 그대로 쓴다.
     */
    canonicalPath?: string;
    /** True while the detail data source is still loading. */
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

/** 어떤 유형으로 문의를 이어갈지, 버튼에 무엇이라고 쓸지 정한다. */
const TYPE_TO_INQUIRY: Record<string, { type: string; label: string }> = {
    WEB: { type: 'WEB', label: '홈페이지 제작 문의' },
    COMMERCE: { type: 'COMMERCE', label: '쇼핑몰 제작 문의' },
    SOFTWARE: { type: 'INTERNAL_SYSTEM', label: '웹프로그램 개발 문의' },
    OPEN_SOURCE: { type: 'OTHER', label: '제작 문의하기' },
};

const DEFAULT_INQUIRY = { type: 'OTHER', label: '제작 문의하기' };

export function PortfolioDetail({
    item = null,
    canonicalPath,
    loading = false,
    className,
    editorAttrs,
}: PortfolioDetailProps): React.ReactElement {
    usePageMeta({
        ...detailMeta(item?.title, '/portfolio', item?.summary),
        canonicalPath,
    });

    return (
        <Article
            className={className}
            {...editorAttrs}
            style={{ backgroundColor: 'var(--20ft-paper-white, #FAF8F3)' }}
            data-testid="portfolio-detail-page"
        >
            <Section
                style={{
                    paddingTop: 'var(--20ft-hero-py, 4rem)',
                    paddingBottom: 'var(--20ft-section-py-lg, 4.5rem)',
                }}
            >
                <Container>
                    {loading ? (
                        <LoadingRows rows={3} testId="portfolio-detail-loading" mediaAspect="16 / 9" />
                    ) : !item ? (
                        <Div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--20ft-spacing-md, 1rem)',
                            }}
                            data-testid="portfolio-detail-missing"
                        >
                            <Status
                                title="프로젝트를 찾을 수 없습니다"
                                message="해당 프로젝트가 존재하지 않거나 아직 공개되지 않았습니다."
                            />
                            <Div>
                                <PrimaryButton href="/portfolio" variant="secondary">
                                    제작 사례 목록으로
                                </PrimaryButton>
                            </Div>
                        </Div>
                    ) : (
                        <Div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--20ft-spacing-xl, 2.5rem)',
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
                                            padding: '0.1875rem 0.5rem',
                                            borderRadius: 'var(--20ft-radius-sm, 2px)',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            borderColor: 'var(--20ft-indigo, #183B6B)',
                                            color: 'var(--20ft-indigo, #183B6B)',
                                            fontFamily: 'var(--20ft-font-mono, monospace)',
                                            fontSize: '0.6875rem',
                                            fontWeight: 600,
                                            letterSpacing: '0.06em',
                                            whiteSpace: 'nowrap',
                                        }}
                                        data-testid="portfolio-detail-kind"
                                    >
                                        고객 프로젝트
                                    </Span>
                                    <Span
                                        style={{
                                            fontFamily: 'var(--20ft-font-mono, monospace)',
                                            fontSize: '0.6875rem',
                                            letterSpacing: '0.06em',
                                            color: 'var(--20ft-gray-500, #777A7D)',
                                        }}
                                    >
                                        {[
                                            item.types?.map((t) => FIELD_LABEL[t] ?? t).join(' · '),
                                            item.year,
                                        ]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </Span>
                                </Div>

                                <H1
                                    style={{
                                        margin: 0,
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
                                    {item.title}
                                </H1>

                                {item.summary && (
                                    <Div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 'var(--20ft-content-gap-sm, 0.75rem)',
                                            width: '100%',
                                            minWidth: 0,
                                        }}
                                        data-testid="portfolio-detail-purpose"
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
                                            어떤 업무를 위한 시스템인가
                                        </H2>
                                        <P
                                            style={{
                                                margin: 0,
                                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                                fontSize: '1.0625rem',
                                                lineHeight: 1.8,
                                                letterSpacing: '-0.01em',
                                                color: 'var(--20ft-text-muted, #5E6063)',
                                                maxWidth: '62ch',
                                                wordBreak: 'keep-all',
                                                overflowWrap: 'break-word',
                                            }}
                                        >
                                            {item.summary}
                                        </P>
                                    </Div>
                                )}
                            </Div>

                            {item.coverImageUrl && (
                                <ZoomableImage
                                    src={item.coverImageUrl}
                                    alt={`${item.title} 화면`}
                                    loading="eager"
                                    testId="portfolio-detail-cover"
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        aspectRatio: 'var(--20ft-detail-hero-aspect, 16 / 9)',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--20ft-radius, 6px)',
                                        border: '1px solid var(--20ft-border, rgba(16, 42, 76, 0.12))',
                                    }}
                                />
                            )}

                            <DetailBlock heading="프로젝트 정보">
                                <MetaTable item={item} />
                            </DetailBlock>

                            {item.description && (
                                <DetailBlock heading="프로젝트 설명">
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 'var(--20ft-spacing-sm, 0.75rem)',
                                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                                            fontSize: '1rem',
                                            lineHeight: 1.85,
                                            color: 'var(--20ft-text-primary, #1A1A1A)',
                                            wordBreak: 'keep-all',
                                            overflowWrap: 'break-word',
                                        }}
                                        // 관리자 게시판 본문. sanitizeHtml이 허용 태그·속성만 남긴다.
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description) }}
                                    />
                                </DetailBlock>
                            )}

                            {item.galleryImageUrls && item.galleryImageUrls.length > 0 && (
                                <DetailBlock heading="실제 화면">
                                    <Ul
                                        style={{
                                            listStyle: 'none',
                                            margin: 0,
                                            padding: 0,
                                            display: 'grid',
                                            gridTemplateColumns: 'var(--20ft-detail-gallery-columns, 1fr)',
                                            gap: 'var(--20ft-spacing-md, 1rem)',
                                            width: '100%',
                                            minWidth: 0,
                                        }}
                                    >
                                        {item.galleryImageUrls.map((url, index) => (
                                            <Li key={`${url}-${index}`} style={{ minWidth: 0 }}>
                                                <ZoomableImage
                                                    src={url}
                                                    alt={`${item.title} 화면 ${index + 1}`}
                                                    testId={`portfolio-detail-shot-${index}`}
                                                    style={{
                                                        display: 'block',
                                                        width: '100%',
                                                        aspectRatio: 'var(--20ft-detail-gallery-aspect, 16 / 9)',
                                                        objectFit: 'cover',
                                                        borderRadius: 'var(--20ft-radius, 6px)',
                                                        border: '1px solid var(--20ft-border, rgba(16, 42, 76, 0.12))',
                                                    }}
                                                />
                                            </Li>
                                        ))}
                                    </Ul>
                                </DetailBlock>
                            )}

                            {item.relatedUrl && (
                                <DetailBlock heading="관련 링크">
                                    <A
                                        href={item.relatedUrl}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'baseline',
                                            gap: 'var(--20ft-spacing-xs, 0.5rem)',
                                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                                            fontSize: '1rem',
                                            color: 'var(--20ft-indigo, #183B6B)',
                                            textDecoration: 'underline',
                                            overflowWrap: 'anywhere',
                                        }}
                                    >
                                        <Span
                                            style={{
                                                fontFamily: 'var(--20ft-font-mono, monospace)',
                                                fontSize: '0.75rem',
                                                letterSpacing: '0.06em',
                                                textTransform: 'uppercase',
                                                color: 'var(--20ft-gray-500, #777A7D)',
                                            }}
                                        >
                                            서비스 주소
                                        </Span>
                                        {item.relatedUrl}
                                    </A>
                                </DetailBlock>
                            )}

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
                                    href={`/inquiry?type=${
                                        (TYPE_TO_INQUIRY[item.types?.[0] ?? ''] ?? DEFAULT_INQUIRY).type
                                    }`}
                                    variant="primary"
                                    size="medium"
                                    data-testid="portfolio-detail-inquiry"
                                >
                                    {(TYPE_TO_INQUIRY[item.types?.[0] ?? ''] ?? DEFAULT_INQUIRY).label}
                                </PrimaryButton>
                                <PrimaryButton
                                    href="/portfolio"
                                    variant="secondary"
                                    size="medium"
                                    data-testid="portfolio-detail-back"
                                >
                                    제작 사례 목록으로
                                </PrimaryButton>
                            </Div>
                        </Div>
                    )}
                </Container>
            </Section>
        </Article>
    );
}

function DetailBlock({
    heading,
    children,
}: {
    heading: string;
    children: React.ReactNode;
}): React.ReactElement {
    return (
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
                {heading}
            </H2>
            {children}
        </Div>
    );
}

/**
 * 프로젝트 정보.
 *
 * `role` 은 게시판에 적힌 직함이다. 실제 담당 범위를 뜻하지 않으므로
 * '역할'로 표기하고, 확인되지 않은 기여 범위는 덧붙이지 않는다.
 */
function MetaTable({ item }: { item: PortfolioItem }): React.ReactElement | null {
    const rows: Array<[string, string]> = [];

    if (item.role && item.role.length > 0) {
        rows.push(['역할', item.role.join(' · ')]);
    }
    if (item.year) {
        rows.push(['진행 시기', item.year]);
    }
    if (item.techStack && item.techStack.length > 0) {
        rows.push(['사용 기술', item.techStack.join(' · ')]);
    }
    if (rows.length === 0) {
        return null;
    }

    return (
        <Div
            style={{
                display: 'grid',
                gridTemplateColumns: 'var(--20ft-detail-meta-columns, 1fr)',
                gap: 'var(--20ft-spacing-md, 1rem)',
                padding: 'var(--20ft-spacing-lg, 1.5rem)',
                borderRadius: 'var(--20ft-radius, 6px)',
                backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
                width: '100%',
                minWidth: 0,
            }}
            data-testid="portfolio-detail-meta"
        >
            {rows.map(([label, value]) => (
                <Div key={label} style={{ minWidth: 0 }}>
                    <Span
                        style={{
                            display: 'block',
                            fontFamily: 'var(--20ft-font-mono, monospace)',
                            fontSize: '0.6875rem',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            color: 'var(--20ft-gray-500, #777A7D)',
                        }}
                    >
                        {label}
                    </Span>
                    <Span
                        style={{
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            fontSize: '0.9375rem',
                            fontWeight: 600,
                            color: 'var(--20ft-text-primary, #1A1A1A)',
                        }}
                    >
                        {value}
                    </Span>
                </Div>
            ))}
        </Div>
    );
}

export default PortfolioDetail;
