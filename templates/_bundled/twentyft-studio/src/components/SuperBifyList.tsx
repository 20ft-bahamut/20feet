import React from 'react';
import { A, Article, Div, H1, H2, Img, Li, P, Span, Ul } from './basic';
import Container from './Container';
import LoadingRows from './LoadingRows';
import SectionEyebrow from './SectionEyebrow';
import Status from './Status';
import Tag from './Tag';
import type { SuperBifyItem, EditorAttrs } from '../types/template';

export interface SuperBifyListProps {
    /** undefined/null = data source not resolved yet → skeleton (empty-state flash 방지). */
    items?: SuperBifyItem[] | null;
    /** True while the superbify data source is still loading. */
    loading?: boolean;
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function SuperBifyList({ items, loading = false, className, editorAttrs }: SuperBifyListProps): React.ReactElement {
    const safeItems = Array.isArray(items) ? items : [];
    const isPending = loading || items === undefined || items === null;
    const isEmpty = safeItems.length === 0;

    return (
        <Div
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-spacing-3xl, 6rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
                minHeight: '60vh',
            }}
            data-testid="superbify-list-page"
        >
            <Container>
                <SectionEyebrow text="SuperBify" />
                <H1
                    style={{
                        margin: 0,
                        fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                        fontWeight: 800,
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        color: 'var(--20ft-deep-indigo, #102A4C)',
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word',
                    }}
                >
                    그누보드 7 확장
                </H1>
                <P
                    style={{
                        margin: 0,
                        marginBottom: 'var(--20ft-spacing-xl, 2.5rem)',
                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                        fontSize: '1rem',
                        lineHeight: 1.7,
                        letterSpacing: '-0.01em',
                        color: 'var(--20ft-text-muted, #5E6063)',
                        maxWidth: '56ch',
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word',
                    }}
                >
                    SuperBify는 20ft가 만드는 Gnuboard 7 확장 제품군입니다.
                    실제 프로젝트에서 필요한 Template, Module, Plugin과
                    재사용 가능한 개발 도구를 만들고 공개합니다.
                </P>

                {isPending ? (
                    <LoadingRows rows={3} testId="superbify-list-loading" mediaAspect="21 / 9" />
                ) : isEmpty ? (
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
                            gap: 'var(--20ft-spacing-lg, 1.5rem)',
                        }}
                    >
                        {safeItems.map((item) => (
                            <Li key={item.id}>
                                <Article>
                                    <A
                                        href={`/superbify/${item.slug}`}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 'var(--20ft-spacing-sm, 0.5rem)',
                                            padding: 'var(--20ft-spacing-lg, 1.5rem)',
                                            borderRadius: 'var(--20ft-radius, 0.5rem)',
                                            border: '1px solid var(--20ft-border, rgba(16, 42, 76, 0.12))',
                                            backgroundColor: 'var(--20ft-bg-secondary, #F4F0E6)',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        <Div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: 'var(--20ft-spacing-sm, 0.5rem)',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            <Tag label={item.type} />
                                            {item.status && <Tag label={item.status} />}
                                        </Div>
                                        {item.coverImageUrl && (
                                            <Img
                                                src={item.coverImageUrl}
                                                alt={`${item.title} cover`}
                                                style={{
                                                    width: '100%',
                                                    aspectRatio: '21 / 9',
                                                    objectFit: 'cover',
                                                    borderRadius: 'var(--20ft-radius-sm, 0.25rem)',
                                                }}
                                            />
                                        )}
                                        <H2
                                            style={{
                                                margin: 0,
                                                fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                                fontSize: '1.5rem',
                                                color: 'var(--20ft-indigo, #183B6B)',
                                            }}
                                        >
                                            {item.title}
                                        </H2>
                                        {item.summary && (
                                            <P style={{ margin: 0, color: 'var(--20ft-text-muted, #5A5A5A)' }}>{item.summary}</P>
                                        )}
                                        {item.compatibility && (
                                            <Span
                                                style={{
                                                    fontFamily: 'var(--20ft-font-mono, monospace)',
                                                    fontSize: '0.8125rem',
                                                    color: 'var(--20ft-gray-500, #777A7D)',
                                                }}
                                            >
                                                Compatibility: {item.compatibility}
                                            </Span>
                                        )}
                                    </A>
                                </Article>
                            </Li>
                        ))}
                    </Ul>
                )}
            </Container>
        </Div>
    );
}

export default SuperBifyList;
