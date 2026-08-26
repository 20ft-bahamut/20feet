import React from 'react';
import { A, Div, H2, H3, Li, P, Section, Span, Ul } from './basic';
import Container from './Container';
import PrimaryButton from './PrimaryButton';
import Status from './Status';
import Tag from './Tag';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { SuperBifyItem, EditorAttrs } from '../types/template';

export interface SuperBifyPreviewProps {
    items?: SuperBifyItem[];
    className?: string;
    editorAttrs?: EditorAttrs;
}

function getVisibleItems(items: SuperBifyItem[] | undefined): SuperBifyItem[] {
    return items && items.length > 0 ? items : [];
}

export function SuperBifyPreview({
    items,
    className,
    editorAttrs,
}: SuperBifyPreviewProps): React.ReactElement {
    const visibleItems = getVisibleItems(items);
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
                backgroundColor: 'var(--20ft-bg-secondary, #F4F0E6)',
            }}
            data-testid="superbify-preview"
        >
            <Container>
                <div ref={sectionRef}>
                    <Div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'var(--20ft-superbify-layout-columns, 1fr)',
                            gap: 'var(--20ft-spacing-2xl, 3.5rem)',
                            alignItems: 'start',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        <Div
                            className={revealClass(1)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--20ft-content-gap-md, 1.25rem)',
                                width: '100%',
                                minWidth: 0,
                                maxWidth: 'var(--20ft-superbify-intro-max, 100%)',
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
                                Open Source / G7
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
                                SuperBify
                            </H2>

                            <Div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--20ft-content-gap-md, 1.25rem)',
                                    width: '100%',
                                    minWidth: 0,
                                }}
                            >
                                <P
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                        fontSize: 'clamp(1rem, 1.3vw, 1.125rem)',
                                        lineHeight: 1.75,
                                        letterSpacing: '-0.01em',
                                        color: 'var(--20ft-text-muted, #5E6063)',
                                    }}
                                >
                                    사용하는 도구가 부족하면 직접 만들기도 합니다.
                                </P>
                                <P
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                        fontSize: '1rem',
                                        lineHeight: 1.75,
                                        letterSpacing: '-0.005em',
                                        color: 'var(--20ft-text-muted, #5E6063)',
                                    }}
                                >
                                    SuperBify는 Gnuboard 7을 더 편하게 확장하고 활용하기 위한 Extension, Developer Tool, Experiment를 만드는 20ft의 프로젝트입니다.
                                </P>
                            </Div>

                            <Div style={{ marginTop: 'var(--20ft-spacing-xs, 0.5rem)' }}>
                                <PrimaryButton href="/superbify" variant="secondary" data-testid="superbify-preview-cta">
                                    SuperBify 보기 →
                                </PrimaryButton>
                            </Div>
                        </Div>

                        <Div className={revealClass(2)}>
                            {isEmpty ? (
                                <Status
                                    title="첫 프로젝트를 만들고 있습니다."
                                    message="실제로 쓸 수 있을 때 공개합니다."
                                />
                            ) : (
                                <Ul
                                    style={{
                                        listStyle: 'none',
                                        margin: 0,
                                        padding: 0,
                                        display: 'grid',
                                        gridTemplateColumns: 'var(--20ft-superbify-columns, 1fr)',
                                        gap: 'var(--20ft-superbify-gap, 1rem)',
                                        width: '100%',
                                        minWidth: 0,
                                    }}
                                    data-testid="superbify-preview-list"
                                >
                                    {visibleItems.map((item, index) => {
                                        const cardClass = revealClass(index < 2 ? index + 1 : 3);
                                        return (
                                            <Li key={item.id} data-testid="superbify-preview-item">
                                                <SuperBifyCard item={item} className={cardClass} />
                                            </Li>
                                        );
                                    })}
                                </Ul>
                            )}
                        </Div>
                    </Div>
                </div>
            </Container>
        </Section>
    );
}

function SuperBifyCard({
    item,
    className,
}: {
    item: SuperBifyItem;
    className?: string;
}): React.ReactElement {
    const [isHovered, setIsHovered] = React.useState(false);
    const prefersReducedMotion = useReducedMotion();

    return (
        <A
            href={item.slug ? `/superbify/${item.slug}` : '/superbify'}
            className={className}
            style={{
                height: '100%',
                width: '100%',
                minWidth: 0,
                padding: 'var(--20ft-spacing-lg, 1.75rem)',
                borderRadius: '0 var(--20ft-radius, 6px) var(--20ft-radius, 6px) 0',
                borderLeft: '3px solid',
                borderLeftColor: isHovered
                    ? 'var(--20ft-heritage-gold, #B69B5F)'
                    : 'var(--20ft-indigo, #183B6B)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--20ft-spacing-md, 1rem)',
                transform: isHovered && !prefersReducedMotion ? 'translateY(-3px)' : 'translateY(0)',
                boxShadow: isHovered
                    ? '0 5px 16px rgba(16, 42, 76, 0.08)'
                    : '0 1px 4px rgba(16, 42, 76, 0.04)',
                transition: `transform var(--20ft-duration-base) var(--20ft-ease-out), box-shadow var(--20ft-duration-base) var(--20ft-ease-out), border-color var(--20ft-duration-base) var(--20ft-ease-out)`,
                textDecoration: 'none',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--20ft-spacing-sm, 0.75rem)',
                    flexWrap: 'wrap',
                    width: '100%',
                    minWidth: 0,
                }}
            >
                <Span
                    style={{
                        fontFamily: 'var(--20ft-font-mono, monospace)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--20ft-heritage-gold, #B69B5F)',
                    }}
                >
                    {item.type}
                </Span>
                {item.status && <Tag label={item.status} />}
            </Div>

            <Div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--20ft-spacing-xs, 0.5rem)',
                    width: '100%',
                    minWidth: 0,
                }}
            >
                <H3
                    style={{
                        margin: 0,
                        fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                        fontSize: '1.125rem',
                        letterSpacing: '-0.01em',
                        lineHeight: 1.3,
                        color: 'var(--20ft-indigo, #183B6B)',
                    }}
                >
                    {item.title}
                </H3>
                {item.summary && (
                    <P
                        style={{
                            margin: 0,
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            fontSize: '0.9375rem',
                            lineHeight: 1.7,
                            letterSpacing: '-0.005em',
                            color: 'var(--20ft-text-muted, #5E6063)',
                        }}
                    >
                        {item.summary}
                    </P>
                )}
            </Div>

            {item.compatibility && (
                <Div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--20ft-spacing-2xs, 0.25rem)',
                        fontFamily: 'var(--20ft-font-mono, monospace)',
                        fontSize: '0.8125rem',
                        color: 'var(--20ft-gray-500, #777A7D)',
                        marginTop: 'auto',
                        paddingTop: 'var(--20ft-spacing-xs, 0.5rem)',
                    }}
                >
                    <Span style={{ opacity: 0.7 }}>Compatibility:</Span>
                    <Span>{item.compatibility}</Span>
                </Div>
            )}
        </A>
    );
}

export default SuperBifyPreview;
