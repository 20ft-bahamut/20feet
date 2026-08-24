import React from 'react';
import { Article, H2, H3, Li, P, Section, Ul } from './basic';
import Container from './Container';
import SectionEyebrow from './SectionEyebrow';
import Status from './Status';
import type { PortfolioItem, EditorAttrs } from '../types/template';

export interface SelectedPortfolioProps {
    items?: PortfolioItem[];
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function SelectedPortfolio({ items = [], className, editorAttrs }: SelectedPortfolioProps): React.ReactElement {
    const isEmpty = items.length === 0;

    return (
        <Section
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-spacing-3xl, 6rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="selected-portfolio"
        >
            <Container>
                <SectionEyebrow text="SELECTED PORTFOLIO" />
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
                    만든 것들.
                </H2>

                <P
                    style={{
                        margin: 0,
                        marginBottom: 'var(--20ft-spacing-xl, 2.5rem)',
                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                        fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                        lineHeight: 1.6,
                        color: 'var(--20ft-text-muted, #5E6063)',
                        maxWidth: '640px',
                    }}
                >
                    어떤 일을 하는지는 결과물로 보여주는 편이 가장 정확하다고 생각합니다.
                </P>

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
                        data-testid="portfolio-list"
                    >
                        {items.map((item) => (
                            <Li key={item.id} data-testid="portfolio-item">
                                <Article
                                    style={{
                                        display: 'grid',
                                        gap: 'var(--20ft-spacing-md, 1rem)',
                                    }}
                                >
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
            </Container>
        </Section>
    );
}

export default SelectedPortfolio;
