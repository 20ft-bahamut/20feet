import React from 'react';
import { A, Article, Div, H1, H2, Li, P, Section, Span, Ul } from './basic';
import Container from './Container';
import LoadingRows from './LoadingRows';
import PrimaryButton from './PrimaryButton';
import Status from './Status';
import Tag from './Tag';
import { getDemoDisplay, screenshotKind } from '../content/demos';
import ZoomableImage from './ZoomableImage';
import { detailMeta } from '../content/seo';
import { usePageMeta } from '../hooks/usePageMeta';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import type { SuperBifyItem, EditorAttrs } from '../types/template';

export interface SuperBifyDetailProps {
    item?: SuperBifyItem | null;
    /** True while the detail data source is still loading. */
    loading?: boolean;
    className?: string;
    editorAttrs?: EditorAttrs;
}

const TYPE_LABEL: Record<string, string> = {
    MODULE: '확장 모듈',
    PLUGIN: '확장 플러그인',
    TEMPLATE: '쇼핑몰 템플릿',
    INTEGRATION: '연동 도구',
    DEVELOPER_TOOL: '개발 도구',
    OPEN_SOURCE: '오픈소스',
};

const STATUS_LABEL: Record<string, string> = {
    IDEA: '구상',
    RESEARCH: '검토 중',
    BUILDING: '개발 중',
    RELEASED: '공개',
    MAINTENANCE: '유지보수 중',
    ARCHIVED: '종료',
};

/**
 * 자체 개발 제품 상세.
 *
 * 일반 고객이 "이게 무엇이고 다음에 무엇을 할 수 있는지"를 알 수 있게 하되,
 * 버전·호환성·라이선스와 저장소 링크 같은 개발자용 정보는 그대로 유지한다.
 * 확인되지 않은 데모 주소나 기능은 만들지 않는다.
 */
export function SuperBifyDetail({
    item = null,
    loading = false,
    className,
    editorAttrs,
}: SuperBifyDetailProps): React.ReactElement {
    usePageMeta(detailMeta(item?.title, '/superbify', item?.summary));

    const display = item ? getDemoDisplay(item.slug, item.title, item.summary) : null;
    const screenshots = item?.screenshotImageUrls ?? [];
    const uiScreens = screenshots.filter((url) => screenshotKind(url) === 'ui');

    return (
        <Article
            className={className}
            {...editorAttrs}
            style={{ backgroundColor: 'var(--20ft-paper-white, #FAF8F3)' }}
            data-testid="superbify-detail-page"
        >
            <Section
                style={{
                    paddingTop: 'var(--20ft-hero-py, 4rem)',
                    paddingBottom: 'var(--20ft-section-py-lg, 4.5rem)',
                }}
            >
                <Container>
                    {loading ? (
                        <LoadingRows rows={3} testId="superbify-detail-loading" mediaAspect="16 / 9" />
                    ) : !item ? (
                        <Div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--20ft-spacing-md, 1rem)',
                            }}
                            data-testid="superbify-detail-missing"
                        >
                            <Status
                                title="제품을 찾을 수 없습니다"
                                message="해당 제품이 존재하지 않거나 아직 공개되지 않았습니다."
                            />
                            <Div>
                                <PrimaryButton href="/superbify" variant="secondary">
                                    자체 개발 제품 목록으로
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
                                        gap: 'var(--20ft-spacing-xs, 0.5rem)',
                                    }}
                                >
                                    <Tag label="자체 개발 제품" />
                                    {item.type && <Tag label={TYPE_LABEL[item.type] ?? item.type} />}
                                    {item.status && <Tag label={STATUS_LABEL[item.status] ?? item.status} />}
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
                                    {display?.title ?? item.title}
                                </H1>

                                {display?.summary && (
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
                                        data-testid="superbify-detail-summary"
                                    >
                                        {display.summary}
                                    </P>
                                )}

                                <Span
                                    style={{
                                        fontFamily: 'var(--20ft-font-mono, monospace)',
                                        fontSize: '0.75rem',
                                        letterSpacing: '0.04em',
                                        color: 'var(--20ft-gray-500, #777A7D)',
                                    }}
                                    data-testid="superbify-detail-product-name"
                                >
                                    제품명 {item.title}
                                </Span>
                            </Div>

                            {item.coverImageUrl && (
                                <ZoomableImage
                                    src={item.coverImageUrl}
                                    alt={`${display?.title ?? item.title} 화면`}
                                    caption="대표 화면"
                                    loading="eager"
                                    testId="superbify-detail-cover"
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        aspectRatio: '16 / 9',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--20ft-radius, 6px)',
                                        border: '1px solid var(--20ft-border, rgba(16, 42, 76, 0.12))',
                                    }}
                                />
                            )}

                            {/*
                             * 문의를 기술 정보보다 앞에 둔다. 대표 화면을 본 직후가 문의 동선이다.
                             * 아래쪽에는 같은 안내와 버튼을 다시 두지 않는다.
                             */}
                            <Div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--20ft-spacing-md, 1rem)',
                                    width: '100%',
                                    minWidth: 0,
                                }}
                                data-testid="superbify-detail-inquiry-block"
                            >
                                <Span
                                    style={{
                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.75,
                                        color: 'var(--20ft-text-muted, #5E6063)',
                                        wordBreak: 'keep-all',
                                    }}
                                >
                                    이런 쇼핑몰이 필요하다면 문의해주세요.
                                </Span>
                                <Div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 'var(--20ft-spacing-sm, 0.75rem)',
                                    }}
                                >
                                    <PrimaryButton
                                        href="/inquiry?type=COMMERCE"
                                        variant="primary"
                                        size="medium"
                                        data-testid="superbify-detail-inquiry"
                                    >
                                        쇼핑몰 제작 문의
                                    </PrimaryButton>
                                </Div>
                            </Div>

                            {uiScreens.length > 0 && (
                                <DetailBlock heading="화면">
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
                                        data-testid="superbify-detail-screens"
                                    >
                                        {uiScreens.map((url, index) => (
                                            <Li key={`${url}-${index}`} style={{ minWidth: 0 }}>
                                                <ZoomableImage
                                                    src={url}
                                                    alt={`${display?.title ?? item.title} 화면 ${index + 1}`}
                                                    testId={`superbify-detail-shot-${index}`}
                                                    style={{
                                                        display: 'block',
                                                        width: '100%',
                                                        aspectRatio: '16 / 9',
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

                            {/*
                             * 브랜드 로고·상품 사진 모음은 두지 않는다.
                             * 이 페이지를 보는 외주 고객에게는 제작 범위를 판단할 정보가 필요한데,
                             * 소재 사진은 그 판단에 기여하지 않는다. 원본 첨부는 게시판에 그대로 남아 있다.
                             * 브랜드 제작 결과를 별도로 보여줄 목적과 확인된 담당 범위가 정해지면
                             * 그때 이 자리에 되살린다.
                             */}

                            {item.description && (
                                <DetailBlock heading="제품 설명">
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

                            {/*
                              개발자용 정보. 일반 고객용 요약과 섞지 않고 별도 블록에 모아 둔다.
                              값은 게시판에 등록된 실제 자료를 그대로 쓰며 추정하지 않는다.
                            */}
                            {(item.version || item.compatibility || item.license) && (
                                <DetailBlock heading="제품 정보">
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
                                        data-testid="superbify-detail-meta"
                                    >
                                        {item.version && <MetaRow label="버전" value={item.version} />}
                                        {item.compatibility && (
                                            <MetaRow label="호환" value={`그누보드 ${item.compatibility}`} />
                                        )}
                                        {item.license && <MetaRow label="라이선스" value={item.license} />}
                                    </Div>
                                </DetailBlock>
                            )}

                            {item.links && hasAnyLink(item.links) && (
                                <DetailBlock heading="링크">
                                    <Ul
                                        style={{
                                            listStyle: 'none',
                                            margin: 0,
                                            padding: 0,
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 'var(--20ft-spacing-md, 1rem)',
                                        }}
                                        data-testid="superbify-detail-links"
                                    >
                                        {item.links.github && <ExternalLink label="GitHub" url={item.links.github} />}
                                        {item.links.sir && <ExternalLink label="SIR" url={item.links.sir} />}
                                        {item.links.docs && <ExternalLink label="문서" url={item.links.docs} />}
                                        {item.links.release && <ExternalLink label="릴리스" url={item.links.release} />}
                                        {item.links.download && <ExternalLink label="다운로드" url={item.links.download} />}
                                        {item.links.purchase && <ExternalLink label="구매" url={item.links.purchase} />}
                                        {/* 데모 주소는 등록된 값이 있을 때만 노출한다 — 추측해서 만들지 않는다. */}
                                        {item.links.demo && <ExternalLink label="데모 보기" url={item.links.demo} />}
                                    </Ul>
                                </DetailBlock>
                            )}

                            <Div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--20ft-spacing-md, 1rem)',
                                    paddingTop: 'var(--20ft-spacing-lg, 1.5rem)',
                                    borderTop: '1px solid var(--20ft-line, #D8D0BF)',
                                    width: '100%',
                                    minWidth: 0,
                                }}
                                data-testid="superbify-detail-next"
                            >
                                <Div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 'var(--20ft-spacing-sm, 0.75rem)',
                                    }}
                                >
                                    <PrimaryButton
                                        href="/services/commerce"
                                        variant="secondary"
                                        size="medium"
                                        data-testid="superbify-detail-service"
                                    >
                                        쇼핑몰 제작 안내
                                    </PrimaryButton>
                                    <PrimaryButton
                                        href="/portfolio"
                                        variant="secondary"
                                        size="medium"
                                        data-testid="superbify-detail-cases"
                                    >
                                        제작 사례 보기
                                    </PrimaryButton>
                                </Div>
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

function MetaRow({ label, value }: { label: string; value: string }): React.ReactElement {
    return (
        <Div style={{ minWidth: 0 }}>
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
    );
}

function ExternalLink({ label, url }: { label: string; url: string }): React.ReactElement {
    return (
        <Li>
            <A
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                style={{
                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                    fontSize: '0.9375rem',
                    color: 'var(--20ft-indigo, #183B6B)',
                    textDecoration: 'underline',
                }}
            >
                {label} →
            </A>
        </Li>
    );
}

function hasAnyLink(links: NonNullable<SuperBifyItem['links']>): boolean {
    return Boolean(
        links.github ||
            links.sir ||
            links.docs ||
            links.release ||
            links.download ||
            links.purchase ||
            links.demo,
    );
}

export default SuperBifyDetail;
