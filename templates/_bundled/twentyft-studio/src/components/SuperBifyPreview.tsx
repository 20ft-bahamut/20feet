import React from 'react';
import { Article, Div, H2, H3, Li, P, Section, Ul } from './basic';
import Container from './Container';
import PrimaryButton from './PrimaryButton';
import SectionEyebrow from './SectionEyebrow';
import Status from './Status';
import Tag from './Tag';
import type { SuperBifyItem, EditorAttrs } from '../types/template';

export interface SuperBifyPreviewProps {
    items?: SuperBifyItem[];
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function SuperBifyPreview({ items = [], className, editorAttrs }: SuperBifyPreviewProps): React.ReactElement {
    const isEmpty = items.length === 0;

    return (
        <Section
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-spacing-3xl, 6rem)',
                backgroundColor: 'var(--20ft-bg-secondary, #F4F0E6)',
            }}
            data-testid="superbify-preview"
        >
            <Container>
                <SectionEyebrow text="OPEN SOURCE / G7" />
                <H2
                    style={{
                        margin: 0,
                        marginBottom: 'var(--20ft-spacing-md, 1rem)',
                        fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                        fontWeight: 700,
                        fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                        color: 'var(--20ft-deep-indigo, #102A4C)',
                    }}
                >
                    SuperBify
                </H2>

                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-spacing-md, 1rem)',
                        maxWidth: '640px',
                        marginBottom: 'var(--20ft-spacing-xl, 2.5rem)',
                    }}
                >
                    <P
                        style={{
                            margin: 0,
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                            lineHeight: 1.6,
                            color: 'var(--20ft-text-muted, #5E6063)',
                        }}
                    >
                        사용하는 도구가 부족하면 직접 만들기도 합니다.
                    </P>
                    <P
                        style={{
                            margin: 0,
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            lineHeight: 1.7,
                            color: 'var(--20ft-text-muted, #5E6063)',
                        }}
                    >
                        SuperBify는 Gnuboard 7을 더 편하게 확장하고 활용하기 위한 Extension, Developer Tool, Experiment를 만드는 20ft의 프로젝트입니다.
                    </P>
                </Div>

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
                        data-testid="superbify-preview-list"
                    >
                        {items.map((item) => (
                            <Li key={item.id} data-testid="superbify-preview-item">
                                <Article
                                    style={{
                                        padding: 'var(--20ft-spacing-lg, 1.5rem)',
                                        borderRadius: 'var(--20ft-radius, 6px)',
                                        backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 'var(--20ft-spacing-sm, 0.5rem)',
                                    }}
                                >
                                    <Div style={{ display: 'flex', gap: 'var(--20ft-spacing-sm, 0.5rem)', flexWrap: 'wrap' }}>
                                        <Tag label={item.type} />
                                    </Div>
                                    <H3
                                        style={{
                                            margin: 0,
                                            fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                            fontSize: '1.25rem',
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
                                                color: 'var(--20ft-text-muted, #5E6063)',
                                            }}
                                        >
                                            {item.summary}
                                        </P>
                                    )}
                                </Article>
                            </Li>
                        ))}
                    </Ul>
                )}

                <Div style={{ marginTop: 'var(--20ft-spacing-xl, 2.5rem)' }}>
                    <PrimaryButton href="/superbify" variant="secondary" data-testid="superbify-preview-cta">
                        SuperBify 보기 →
                    </PrimaryButton>
                </Div>
            </Container>
        </Section>
    );
}

export default SuperBifyPreview;
