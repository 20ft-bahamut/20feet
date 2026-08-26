import React from 'react';
import { A, Article, Div, H1, H2, Img, Li, P, Span, Ul } from './basic';
import Container from './Container';
import Status from './Status';
import Tag from './Tag';
import type { SuperBifyItem, RouteContext, EditorAttrs } from '../types/template';

export interface SuperBifyDetailProps {
    item?: SuperBifyItem | null;
    context?: RouteContext;
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function SuperBifyDetail({ item = null, context, className, editorAttrs }: SuperBifyDetailProps): React.ReactElement {
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
            data-testid="superbify-detail-page"
        >
            <Container>
                {isNotFound ? (
                    <Div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--20ft-spacing-md, 1rem)' }}>
                        <Status
                            title="제품을 찾을 수 없습니다"
                            message="해당 SuperBify 제품이 존재하지 않거나 아직 공개되지 않았습니다."
                        />
                        {context?.slug && (
                            <Span
                                data-testid="superbify-detail-slug"
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
                        <Div style={{ display: 'flex', gap: 'var(--20ft-spacing-sm, 0.5rem)', flexWrap: 'wrap' }}>
                            {item.type && <Tag label={item.type} />}
                            {item.status && <Tag label={item.status} />}
                        </Div>

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

                        {(item.version || item.compatibility || item.license) && (
                            <Div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                    gap: 'var(--20ft-spacing-md, 1rem)',
                                    padding: 'var(--20ft-spacing-md, 1rem)',
                                    borderRadius: 'var(--20ft-radius, 0.5rem)',
                                    backgroundColor: 'var(--20ft-bg-secondary, #F4F0E6)',
                                }}
                            >
                                {item.version && <MetaRow label="Version" value={item.version} />}
                                {item.compatibility && <MetaRow label="Compatibility" value={item.compatibility} />}
                                {item.license && <MetaRow label="License" value={item.license} />}
                            </Div>
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

                        {item.description && (
                            <Div
                                style={{
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    lineHeight: 1.7,
                                    color: 'var(--20ft-text-primary, #1A1A1A)',
                                }}
                            >
                                <H2 style={{ fontSize: '1.25rem', color: 'var(--20ft-indigo, #183B6B)' }}>Overview</H2>
                                <P style={{ margin: 0 }}>{item.description}</P>
                            </Div>
                        )}

                        {item.screenshotImageUrls && item.screenshotImageUrls.length > 0 && (
                            <Div>
                                <H2 style={{ fontSize: '1.25rem', color: 'var(--20ft-indigo, #183B6B)' }}>Screenshots</H2>
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
                                    {item.screenshotImageUrls.map((url, index) => (
                                        <Li key={index}>
                                            <Img
                                                src={url}
                                                alt={`${item.title} screenshot ${index + 1}`}
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

                        {item.links && hasAnyLink(item.links) && (
                            <Div>
                                <H2 style={{ fontSize: '1.25rem', color: 'var(--20ft-indigo, #183B6B)' }}>Links</H2>
                                <Ul
                                    style={{
                                        listStyle: 'none',
                                        margin: 0,
                                        padding: 0,
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 'var(--20ft-spacing-md, 1rem)',
                                    }}
                                >
                                    {item.links.github && (
                                        <ExternalLink label="GitHub" url={item.links.github} />
                                    )}
                                    {item.links.sir && (
                                        <ExternalLink label="SIR" url={item.links.sir} />
                                    )}
                                    {item.links.docs && (
                                        <ExternalLink label="Documentation" url={item.links.docs} />
                                    )}
                                    {item.links.release && (
                                        <ExternalLink label="Release" url={item.links.release} />
                                    )}
                                    {item.links.download && (
                                        <ExternalLink label="Download" url={item.links.download} />
                                    )}
                                    {item.links.purchase && (
                                        <ExternalLink label="Purchase" url={item.links.purchase} />
                                    )}
                                    {item.links.demo && <ExternalLink label="Demo" url={item.links.demo} />}
                                </Ul>
                            </Div>
                        )}

                        {context?.slug && (
                            <Span
                                data-testid="superbify-detail-slug"
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

function ExternalLink({ label, url }: { label: string; url: string }): React.ReactElement {
    return (
        <Li>
            <A
                href={url}
                target="_blank"
                rel="noreferrer"
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
        links.demo
    );
}

export default SuperBifyDetail;
