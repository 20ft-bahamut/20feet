import React from 'react';
import { Article, Div, H1, H2, P, Span } from './basic';
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
                            <Tag label={item.type} />
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

                        {item.compatibility && (
                            <Div
                                style={{
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    lineHeight: 1.7,
                                }}
                            >
                                <H2 style={{ fontSize: '1.25rem', color: 'var(--20ft-indigo, #183B6B)' }}>Requirements / Compatibility</H2>
                                <P style={{ margin: 0 }}>{item.compatibility}</P>
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

export default SuperBifyDetail;
