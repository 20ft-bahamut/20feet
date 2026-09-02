import React from 'react';
import { A, Article, Div, H2, H3, Li, P, Section, Span, Ul } from './basic';
import BrandLogo from './BrandLogo';
import Container from './Container';
import LoadingRows from './LoadingRows';
import Status from './Status';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { PortfolioItem, EditorAttrs } from '../types/template';

export interface SelectedPortfolioProps {
    /** undefined/null = data source not resolved yet → skeleton (empty-state flash 방지). */
    items?: PortfolioItem[] | null;
    /** True while the featured-portfolio data source is still loading. */
    loading?: boolean;
    className?: string;
    editorAttrs?: EditorAttrs;
}

function getVisibleItems(items: PortfolioItem[] | null | undefined): PortfolioItem[] {
    return Array.isArray(items) ? items : [];
}

export function SelectedPortfolio({
    items,
    loading = false,
    className,
    editorAttrs,
}: SelectedPortfolioProps): React.ReactElement {
    const visibleItems = getVisibleItems(items);
    const isPending = loading || items === undefined || items === null;
    const isEmpty = visibleItems.length === 0;
    const { ref: sectionRef, isInView } = useInView({ once: true, threshold: 0.05 });

    const revealClass = (stagger: number): string => {
        const hidden = isInView ? 'is-visible' : 'is-hidden';
        return `reveal ${hidden} reveal-stagger-${stagger}`;
    };

    return (
        <Section
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-section-py-xl, 6rem)',
                backgroundColor: 'var(--20ft-bg-primary, #FAF8F3)',
            }}
            data-testid="selected-portfolio"
        >
            <Container>
                <div ref={sectionRef}>
                    <Div
                        className={revealClass(1)}
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                            gap: 'var(--20ft-content-gap-md, 1.25rem)',
                            marginBottom: 'var(--20ft-content-gap-xl, 2.5rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        <Div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--20ft-content-gap-sm, 0.75rem)',
                                flex: 'var(--20ft-portfolio-header-left-flex, 1 1 auto)',
                                minWidth: 0,
                            }}
                        >
                            <Span
                                style={{
                                    fontFamily: 'var(--20ft-font-mono, monospace)',
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: 'var(--20ft-heritage-gold, #B69B5F)',
                                }}
                            >
                                Selected Portfolio
                            </Span>

                            <H2
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                    fontWeight: 700,
                                    fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1.15,
                                    color: 'var(--20ft-deep-indigo, #102A4C)',
                                }}
                            >
                                만든 것들.
                            </H2>
                            <P
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    fontSize: 'clamp(1rem, 1.25vw, 1.125rem)',
                                    lineHeight: 1.75,
                                    letterSpacing: '-0.01em',
                                    color: 'var(--20ft-text-muted, #5E6063)',
                                    maxWidth: '52ch',
                                    width: '100%',
                                    minWidth: 0,
                                }}
                            >
                                어떤 일을 하는지는 결과물로 보여주는 편이 가장 정확하다고 생각합니다.
                            </P>
                        </Div>

                        <PortfolioLink />
                    </Div>

                    {isPending ? (
                        <LoadingRows rows={2} testId="selected-portfolio-loading" mediaAspect="21 / 9" />
                    ) : isEmpty ? (
                        <Status
                            title="공개할 수 있는 프로젝트를 준비하고 있습니다."
                            message="전체 Portfolio는 곧 보여드릴 수 있을 것 같습니다."
                        />
                    ) : (
                        <Ul
                            style={{
                                listStyle: 'none',
                                margin: 0,
                                padding: 0,
                                display: 'grid',
                                gridTemplateColumns: 'var(--20ft-portfolio-columns, 1fr)',
                                gap: 'var(--20ft-portfolio-gap, 2rem)',
                                width: '100%',
                                minWidth: 0,
                            }}
                            data-testid="portfolio-list"
                        >
                            {visibleItems.map((item, index) => (
                                <Li
                                    key={item.id}
                                    data-testid="portfolio-item"
                                    className={revealClass(index === 0 ? 2 : 3)}
                                    style={{
                                        gridColumn: index === 0
                                            ? '1 / -1'
                                            : index === 1
                                              ? 'var(--20ft-portfolio-item-start, auto)'
                                              : 'var(--20ft-portfolio-item-span, auto)',
                                        minWidth: 0,
                                    }}
                                >
                                    <Article
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 'var(--20ft-content-gap-md, 1.25rem)',
                                            width: '100%',
                                            minWidth: 0,
                                        }}
                                    >
                                        <PortfolioCover item={item} featured={index === 0} />

                                        <Div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 'var(--20ft-content-gap-sm, 0.75rem)',
                                                width: '100%',
                                                minWidth: 0,
                                            }}
                                        >
                                            <Div
                                                style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'baseline',
                                                    justifyContent: 'space-between',
                                                    gap: 'var(--20ft-spacing-sm, 0.75rem)',
                                                    width: '100%',
                                                    minWidth: 0,
                                                }}
                                            >
                                                <H3
                                                    style={{
                                                        margin: 0,
                                                        fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                                        fontSize: index === 0
                                                            ? 'clamp(1.375rem, 2.25vw, 2rem)'
                                                            : 'clamp(1.125rem, 1.75vw, 1.5rem)',
                                                        letterSpacing: '-0.015em',
                                                        lineHeight: 1.2,
                                                        color: 'var(--20ft-indigo, #183B6B)',
                                                    }}
                                                >
                                                    {item.title}
                                                </H3>

                                                {item.year && (
                                                    <Span
                                                        style={{
                                                            fontFamily: 'var(--20ft-font-mono, monospace)',
                                                            fontSize: '0.8125rem',
                                                            color: 'var(--20ft-gray-500, #777A7D)',
                                                        }}
                                                    >
                                                        {item.year}
                                                    </Span>
                                                )}
                                            </Div>

                                            {item.summary && (
                                                <P
                                                    style={{
                                                        margin: 0,
                                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                                        fontSize: index === 0 ? '1rem' : '0.9375rem',
                                                        lineHeight: 1.7,
                                                        letterSpacing: '-0.005em',
                                                        color: 'var(--20ft-text-muted, #5E6063)',
                                                        maxWidth: index === 0 ? '60ch' : '48ch',
                                                    }}
                                                >
                                                    {item.summary}
                                                </P>
                                            )}

                                            <Div
                                                style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'center',
                                                    gap: 'var(--20ft-spacing-sm, 0.75rem)',
                                                    marginTop: 'var(--20ft-spacing-2xs, 0.25rem)',
                                                }}
                                            >
                                                {item.types && item.types.length > 0 && (
                                                    <Span
                                                        style={{
                                                            fontFamily: 'var(--20ft-font-mono, monospace)',
                                                            fontSize: '0.8125rem',
                                                            letterSpacing: '0.06em',
                                                            textTransform: 'uppercase',
                                                            color: 'var(--20ft-heritage-gold, #B69B5F)',
                                                        }}
                                                    >
                                                        {item.types.join(' / ')}
                                                    </Span>
                                                )}
                                                {item.status && (
                                                    <Span
                                                        style={{
                                                            fontFamily: 'var(--20ft-font-mono, monospace)',
                                                            fontSize: '0.8125rem',
                                                            color: 'var(--20ft-gray-500, #777A7D)',
                                                        }}
                                                    >
                                                        {item.status}
                                                    </Span>
                                                )}
                                            </Div>

                                            <DetailLink slug={item.slug} />
                                        </Div>
                                    </Article>
                                </Li>
                            ))}
                        </Ul>
                    )}
                </div>
            </Container>
        </Section>
    );
}

function PortfolioLink(): React.ReactElement {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <A
            href="/portfolio"
            style={{
                display: 'inline-flex',
                fontFamily: 'var(--20ft-font-body, sans-serif)',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: isHovered ? 'var(--20ft-heritage-gold, #B69B5F)' : 'var(--20ft-indigo, #183B6B)',
                textDecoration: 'none',
                paddingBlock: 'var(--20ft-spacing-xs, 0.5rem)',
                transition: `color var(--20ft-duration-base) var(--20ft-ease-out)`,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            Portfolio 전체 보기 →
        </A>
    );
}

function DetailLink({ slug }: { slug: string }): React.ReactElement {
    const [isHovered, setIsHovered] = React.useState(false);
    const prefersReducedMotion = useReducedMotion();

    return (
        <A
            href={`/portfolio/${slug}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--20ft-spacing-2xs, 0.25rem)',
                marginTop: 'var(--20ft-spacing-sm, 0.75rem)',
                fontFamily: 'var(--20ft-font-body, sans-serif)',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: isHovered ? 'var(--20ft-heritage-gold, #B69B5F)' : 'var(--20ft-indigo, #183B6B)',
                textDecoration: 'none',
                transition: `color var(--20ft-duration-base) var(--20ft-ease-out)`,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Span>자세히 보기</Span>
            <Span
                style={{
                    display: 'inline-block',
                    transform: isHovered && !prefersReducedMotion ? 'translateX(4px)' : 'translateX(0)',
                    transition: `transform var(--20ft-duration-base) var(--20ft-ease-out)`,
                }}
            >
                →
            </Span>
        </A>
    );
}

function PortfolioCover({
    item,
    featured = false,
}: {
    item: PortfolioItem;
    featured?: boolean;
}): React.ReactElement {
    const [isHovered, setIsHovered] = React.useState(false);
    const prefersReducedMotion = useReducedMotion();
    const aspectRatio = featured ? '21 / 9' : '16 / 9';

    if (item.coverImageUrl) {
        return (
            <Div
                style={{
                    position: 'relative',
                    aspectRatio,
                    borderRadius: 'var(--20ft-radius, 6px)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--20ft-bg-secondary, #F4F0E6)',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img
                    src={item.coverImageUrl}
                    alt={`${item.title} preview`}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: isHovered && !prefersReducedMotion ? 'scale(1.02)' : 'scale(1)',
                        transition: `transform var(--20ft-duration-reveal) var(--20ft-ease-out)`,
                    }}
                    loading="lazy"
                />
            </Div>
        );
    }

    return (
        <Div
            style={{
                position: 'relative',
                aspectRatio,
                borderRadius: 'var(--20ft-radius, 6px)',
                backgroundColor: 'var(--20ft-bg-secondary, #F4F0E6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--20ft-spacing-lg, 1.5rem)',
                textAlign: 'center',
                overflow: 'hidden',
            }}
            data-testid="portfolio-cover-placeholder"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.04,
                    pointerEvents: 'none',
                }}
                aria-hidden="true"
            >
                <BrandLogo variant="symbol" surface="light" height="clamp(3rem, 12%, 5rem)" />
            </Div>

            <Span
                style={{
                    position: 'relative',
                    fontFamily: 'var(--20ft-font-mono, monospace)',
                    fontSize: '0.8125rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--20ft-gray-500, #777A7D)',
                }}
            >
                {'Screenshot Preview'}
            </Span>
        </Div>
    );
}

export default SelectedPortfolio;
