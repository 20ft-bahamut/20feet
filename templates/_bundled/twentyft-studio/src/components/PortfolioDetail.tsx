import React from 'react';
import { A, Article, Div, H1, H2, Img, Li, P, Span, Ul } from './basic';
import Container from './Container';
import Status from './Status';
import type { PortfolioItem, RouteContext, EditorAttrs } from '../types/template';

export interface PortfolioDetailProps {
    item?: PortfolioItem | null;
    context?: RouteContext;
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function PortfolioDetail({ item = null, context, className, editorAttrs }: PortfolioDetailProps): React.ReactElement {
    const isNotFound = item === null || item === undefined;

    return (
        <Article
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-spacing-3xl, 6rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
                minHeight: '60vh',
            }}
            data-testid="portfolio-detail-page"
        >
            <Container>
                {isNotFound ? (
                    <Div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--20ft-spacing-md, 1rem)' }}>
                        <Status
                            title="프로젝트를 찾을 수 없습니다"
                            message="해당 프로젝트가 존재하지 않거나 아직 공개되지 않았습니다."
                        />
                        {context?.slug && (
                            <Span
                                data-testid="portfolio-detail-slug"
                                style={{
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    fontSize: '0.75rem',
                                    color: 'var(--20ft-text-muted, #5A5A5A)',
                                }}
                            >
                                slug: {context.slug}
                            </Span>
                        )}
                    </Div>
                ) : (
                    <Div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--20ft-spacing-lg, 1.5rem)' }}>
                        <Span
                            style={{
                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: 'var(--20ft-heritage-gold, #B69B5F)',
                            }}
                        >
                            Portfolio
                        </Span>

                        {item.types && item.types.length > 0 && item.year && (
                            <Span
                                style={{
                                    fontFamily: 'var(--20ft-font-mono, monospace)',
                                    fontSize: '0.8125rem',
                                    color: 'var(--20ft-gray-500, #777A7D)',
                                }}
                            >
                                {item.types.join(' / ')} / {item.year}
                            </Span>
                        )}

                        <H1
                            style={{
                                margin: 0,
                                fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                fontWeight: 800,
                                fontSize: 'clamp(2rem, 4vw, 3rem)',
                                color: 'var(--20ft-deep-indigo, #102A4C)',
                            }}
                        >
                            {item.title}
                        </H1>

                        {item.summary && (
                            <P
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    fontSize: '1.125rem',
                                    color: 'var(--20ft-text-muted, #5A5A5A)',
                                }}
                            >
                                {item.summary}
                            </P>
                        )}

                        {item.coverImageUrl && (
                            <Img
                                src={item.coverImageUrl}
                                alt={`${item.title} hero`}
                                style={{
                                    width: '100%',
                                    aspectRatio: '21 / 9',
                                    objectFit: 'cover',
                                    borderRadius: 'var(--20ft-radius, 0.5rem)',
                                }}
                            />
                        )}

                        {(item.clientName || item.role?.length || item.techStack?.length || item.status || item.relatedUrl) && (
                            <Div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: 'var(--20ft-spacing-md, 1rem)',
                                    padding: 'var(--20ft-spacing-md, 1rem)',
                                    borderRadius: 'var(--20ft-radius, 0.5rem)',
                                    backgroundColor: 'var(--20ft-bg-secondary, #F4F0E6)',
                                }}
                            >
                                {item.clientName && (
                                    <MetaRow label="Client" value={item.clientName} />
                                )}
                                {item.role && item.role.length > 0 && (
                                    <MetaRow label="Role" value={item.role.join(', ')} />
                                )}
                                {item.techStack && item.techStack.length > 0 && (
                                    <MetaRow label="Tech" value={item.techStack.join(', ')} />
                                )}
                                {item.status && <MetaRow label="Status" value={item.status} />}
                                {item.relatedUrl && (
                                    <Div>
                                        <Span
                                            style={{
                                                display: 'block',
                                                fontFamily: 'var(--20ft-font-mono, monospace)',
                                                fontSize: '0.75rem',
                                                color: 'var(--20ft-gray-500, #777A7D)',
                                            }}
                                        >
                                            Related URL
                                        </Span>
                                        <A
                                            href={item.relatedUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                                fontSize: '0.9375rem',
                                                color: 'var(--20ft-indigo, #183B6B)',
                                                textDecoration: 'underline',
                                            }}
                                        >
                                            {item.relatedUrl}
                                        </A>
                                    </Div>
                                )}
                            </Div>
                        )}

                        {item.description && (
                            <Div
                                style={{
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    lineHeight: 1.7,
                                    color: 'var(--20ft-text-primary, #1A1A1A)',
                                }}
                            >
                                <H2 style={{ fontSize: '1.25rem', color: 'var(--20ft-indigo, #183B6B)' }}>Project Story</H2>
                                <P style={{ margin: 0 }}>{item.description}</P>
                            </Div>
                        )}

                        {item.galleryImageUrls && item.galleryImageUrls.length > 0 && (
                            <Div>
                                <H2 style={{ fontSize: '1.25rem', color: 'var(--20ft-indigo, #183B6B)' }}>Gallery</H2>
                                <Ul
                                    style={{
                                        listStyle: 'none',
                                        margin: 0,
                                        padding: 0,
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                        gap: 'var(--20ft-spacing-md, 1rem)',
                                    }}
                                >
                                    {item.galleryImageUrls.map((url, index) => (
                                        <Li key={index}>
                                            <Img
                                                src={url}
                                                alt={`${item.title} gallery ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    aspectRatio: '16 / 9',
                                                    objectFit: 'cover',
                                                    borderRadius: 'var(--20ft-radius, 0.5rem)',
                                                }}
                                            />
                                        </Li>
                                    ))}
                                </Ul>
                            </Div>
                        )}

                        {context?.slug && (
                            <Span
                                data-testid="portfolio-detail-slug"
                                style={{
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    fontSize: '0.75rem',
                                    color: 'var(--20ft-text-muted, #5A5A5A)',
                                }}
                            >
                                slug: {context.slug}
                            </Span>
                        )}
                    </Div>
                )}
            </Container>
        </Article>
    );
}

function MetaRow({ label, value }: { label: string; value: string }): React.ReactElement {
    return (
        <Div>
            <Span
                style={{
                    display: 'block',
                    fontFamily: 'var(--20ft-font-mono, monospace)',
                    fontSize: '0.75rem',
                    color: 'var(--20ft-gray-500, #777A7D)',
                }}
            >
                {label}
            </Span>
            <Span
                style={{
                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                    fontSize: '0.9375rem',
                    color: 'var(--20ft-text-primary, #1A1A1A)',
                }}
            >
                {value}
            </Span>
        </Div>
    );
}

export default PortfolioDetail;
