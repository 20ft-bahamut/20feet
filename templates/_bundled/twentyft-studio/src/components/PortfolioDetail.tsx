import React from 'react';
import { Article, Div, H1, P, Span } from './basic';
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
                            <P
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    lineHeight: 1.7,
                                    color: 'var(--20ft-text-primary, #1A1A1A)',
                                }}
                            >
                                {item.description}
                            </P>
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

export default PortfolioDetail;
