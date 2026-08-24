import React from 'react';
import { A, Div, H1, H2, Li, P, Ul } from './basic';
import Container from './Container';
import SectionEyebrow from './SectionEyebrow';
import Status from './Status';
import Tag from './Tag';
import type { SuperBifyItem, EditorAttrs } from '../types/template';

export interface SuperBifyListProps {
    items?: SuperBifyItem[];
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function SuperBifyList({ items = [], className, editorAttrs }: SuperBifyListProps): React.ReactElement {
    const isEmpty = items.length === 0;

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
                        marginBottom: 'var(--20ft-spacing-xl, 2.5rem)',
                        fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                        fontWeight: 800,
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        color: 'var(--20ft-deep-indigo, #102A4C)',
                    }}
                >
                    그누보드 7 확장
                </H1>

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
                            gap: 'var(--20ft-spacing-lg, 1.5rem)',
                        }}
                    >
                        {items.map((item) => (
                            <Li key={item.id}>
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
                                    <Tag label={item.type} />
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
                                </A>
                            </Li>
                        ))}
                    </Ul>
                )}
            </Container>
        </Div>
    );
}

export default SuperBifyList;
