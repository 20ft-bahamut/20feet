import React from 'react';
import { A, Div, H1, H2, Li, P, Ul } from './basic';
import Container from './Container';
import SectionEyebrow from './SectionEyebrow';
import Status from './Status';
import type { PortfolioItem, EditorAttrs } from '../types/template';

export interface PortfolioListProps {
    items?: PortfolioItem[];
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function PortfolioList({ items = [], className, editorAttrs }: PortfolioListProps): React.ReactElement {
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
            data-testid="portfolio-list-page"
        >
            <Container>
                <SectionEyebrow text="Portfolio" />
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
                    만든 것들
                </H1>

                {isEmpty ? (
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
                            gap: 'var(--20ft-spacing-xl, 2.5rem)',
                        }}
                    >
                        {items.map((item) => (
                            <Li key={item.id}>
                                <A
                                    href={`/portfolio/${item.slug}`}
                                    style={{
                                        display: 'grid',
                                        gap: 'var(--20ft-spacing-sm, 0.5rem)',
                                        textDecoration: 'none',
                                    }}
                                >
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

export default PortfolioList;
