import React from 'react';
import { A, Div, H1, H2, H3, Li, P, Section, Span, Ul } from './basic';
import Container from './Container';
import BrandLogo from './BrandLogo';
import PrimaryButton from './PrimaryButton';
import LoadingRows from './LoadingRows';
import Status from './Status';
import { PAGE_META } from '../content/seo';
import { useInView } from '../hooks/useInView';
import { usePageMeta } from '../hooks/usePageMeta';
import type { PortfolioItem, EditorAttrs } from '../types/template';

export interface AboutPageProps {
    /** 실제로 담당한 프로젝트. */
    cases?: PortfolioItem[] | null;
    className?: string;
    editorAttrs?: EditorAttrs;
}

interface RevealGroupProps {
    children: React.ReactNode;
    stagger?: 1 | 2 | 3 | 4;
    style?: React.CSSProperties;
    'data-testid'?: string;
}

function RevealGroup({
    children,
    stagger = 1,
    style,
    'data-testid': dataTestId,
}: RevealGroupProps): React.ReactElement {
    const { ref, isInView } = useInView({ once: true, threshold: 0.05 });

    return (
        <div
            ref={ref}
            className={`reveal ${isInView ? 'is-visible' : 'is-hidden'} reveal-stagger-${stagger}`}
            style={style}
            data-testid={dataTestId}
        >
            {children}
        </div>
    );
}

const bodyTextStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: 'var(--20ft-font-body, sans-serif)',
    fontSize: 'clamp(1rem, 1.25vw, 1.0625rem)',
    lineHeight: 1.85,
    letterSpacing: '-0.01em',
    color: 'var(--20ft-text-muted, #5E6063)',
    wordBreak: 'keep-all',
    overflowWrap: 'break-word',
};

const headingStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: 'var(--20ft-font-display, Georgia, serif)',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.18,
    color: 'var(--20ft-deep-indigo, #102A4C)',
    wordBreak: 'keep-all',
};

const utilityLabelStyle: React.CSSProperties = {
    fontFamily: 'var(--20ft-font-mono, monospace)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--20ft-heritage-gold, #B69B5F)',
};

function AboutHero(): React.ReactElement {
    return (
        <Section
            style={{
                paddingTop: 'var(--20ft-hero-py, 4rem)',
                paddingBottom: 'var(--20ft-hero-pb, 3.5rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
                overflow: 'hidden',
            }}
            data-testid="about-hero"
        >
            <Container>
                <RevealGroup
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'var(--20ft-about-hero-columns, 1fr)',
                        gap: 'var(--20ft-about-hero-gap, 1.5rem)',
                        alignItems: 'center',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    <Div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--20ft-content-gap-md, 1.25rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        <Span style={utilityLabelStyle}>이십피트 소개</Span>
                        <H1
                            style={{
                                ...headingStyle,
                                fontSize: 'var(--20ft-about-hero-heading-size, clamp(1.75rem, 6vw, 3.25rem))',
                            }}
                        >
                            홈페이지와 업무 시스템을 기획하고 개발합니다.
                        </H1>
                        <P
                            style={{
                                ...bodyTextStyle,
                                maxWidth: '52ch',
                            }}
                        >
                            필요한 기능을 정리하고, 사용할 화면을 설계해 개발합니다.
                        </P>
                    </Div>

                    <Div
                        style={{
                            display: 'flex',
                            justifyContent: 'var(--20ft-about-hero-symbol-align, flex-start)',
                            width: '100%',
                            minWidth: 0,
                        }}
                        aria-hidden="true"
                    >
                        <BrandLogo
                            variant="symbol"
                            surface="light"
                            height="clamp(6rem, 18vw, 12rem)"
                            data-testid="about-hero-symbol"
                        />
                    </Div>
                </RevealGroup>
            </Container>
        </Section>
    );
}

function WhatIHaveDone(): React.ReactElement {
    return (
        <Section
            style={{
                paddingBlock: 'var(--20ft-section-py-lg, 4.5rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="about-experience"
        >
            <Container>
                <RevealGroup
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'var(--20ft-about-columns, 1fr)',
                        gap: 'var(--20ft-spacing-2xl, 3rem)',
                        alignItems: 'start',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    <Div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--20ft-content-gap-md, 1.25rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        <H2 style={{ ...headingStyle, fontWeight: 600, fontSize: 'var(--20ft-h2-size, 1.5rem)' }}>
                            20년 넘게 웹을 만들어왔습니다.
                        </H2>
                    </Div>

                    <Div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--20ft-content-gap-md, 1.25rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        <P style={bodyTextStyle}>
                            개발자로 시작해 서비스 기획과 프로젝트 관리, 제품 구축까지 함께 해왔습니다.
                            웹사이트를 만들고, 서비스를 운영하고, 시스템을 설계하고, 문제가 생기면 다시
                            고치는 일을 계속해왔습니다.
                        </P>
                        <P style={bodyTextStyle}>
                            PHP를 기반으로 다양한 웹 시스템을 개발해왔고, 프로젝트에 따라 Node.js와
                            현대적인 프런트엔드 기술을 함께 사용합니다.
                        </P>
                        <P style={bodyTextStyle}>
                            기술과 도구는 계속 바뀌었지만, 아무것도 없던 곳에 실제로 작동하는 무언가가
                            생기는 순간이 가장 재미있다는 점은 그대로입니다.
                        </P>

                        <Div
                            role="list"
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 'var(--20ft-spacing-xs, 0.5rem)',
                                width: '100%',
                                minWidth: 0,
                            }}
                        >
                            {[
                                '웹사이트 · 커머스',
                                '업무 시스템 · 관리자 화면',
                                '기획 · 개발 · 운영',
                            ].map((label) => (
                                <Span
                                    key={label}
                                    role="listitem"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '0.375rem 0.75rem',
                                        borderRadius: 'var(--20ft-radius-sm, 0.25rem)',
                                        border: '1px solid var(--20ft-line, #D8D0BF)',
                                        fontFamily: 'var(--20ft-font-mono, monospace)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.08em',
                                        color: 'var(--20ft-indigo, #183B6B)',
                                    }}
                                >
                                    {label}
                                </Span>
                            ))}
                        </Div>
                    </Div>
                </RevealGroup>
            </Container>
        </Section>
    );
}

function ProjectRoles({ cases }: { cases?: PortfolioItem[] | null }): React.ReactElement {
    const isPending = cases === undefined || cases === null;
    const list = Array.isArray(cases) ? cases : [];

    return (
        <Section
            style={{
                paddingBlock: 'var(--20ft-section-py-lg, 4.5rem)',
                backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
            }}
            data-testid="about-projects"
        >
            <Container>
                <RevealGroup
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-content-gap-lg, 1.75rem)',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                                        <H2 style={{ ...headingStyle, fontWeight: 600, fontSize: 'var(--20ft-h2-size, 1.5rem)' }}>
                        주요 프로젝트
                    </H2>

                    {isPending ? (
                        <LoadingRows rows={2} testId="about-projects-loading" />
                    ) : list.length === 0 ? (
                        <Status
                            title="공개할 수 있는 프로젝트를 준비하고 있습니다."
                            message="아직 공개된 프로젝트가 없습니다."
                        />
                    ) : (
                        <Ul
                            style={{
                                listStyle: 'none',
                                margin: 0,
                                padding: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--20ft-spacing-md, 1rem)',
                                width: '100%',
                                minWidth: 0,
                            }}
                            data-testid="about-projects-list"
                        >
                            {list.map((item) => (
                                <Li key={item.id} style={{ width: '100%', minWidth: 0 }}>
                                    <A
                                        href={`/portfolio/${item.slug}`}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'var(--20ft-about-project-columns, 1fr)',
                                            gap: 'var(--20ft-spacing-md, 1rem)',
                                            paddingTop: 'var(--20ft-spacing-md, 1rem)',
                                            borderTop: '1px solid var(--20ft-line, #D8D0BF)',
                                            textDecoration: 'none',
                                            width: '100%',
                                            minWidth: 0,
                                        }}
                                    >
                                        <Div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 'var(--20ft-spacing-2xs, 0.25rem)',
                                                minWidth: 0,
                                            }}
                                        >
                                            <H3
                                                style={{
                                                    margin: 0,
                                                    fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                                    fontSize: '1.125rem',
                                                    fontWeight: 700,
                                                    letterSpacing: '-0.01em',
                                                    color: 'var(--20ft-indigo, #183B6B)',
                                                    wordBreak: 'keep-all',
                                                }}
                                            >
                                                {item.title}
                                            </H3>
                                            {item.role && item.role.length > 0 && (
                                                <Span
                                                    style={{
                                                        fontFamily: 'var(--20ft-font-mono, monospace)',
                                                        fontSize: '0.75rem',
                                                        letterSpacing: '0.04em',
                                                        color: 'var(--20ft-gray-500, #777A7D)',
                                                    }}
                                                >
                                                    역할 {item.role.join(' · ')}
                                                </Span>
                                            )}
                                        </Div>

                                        <Div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 'var(--20ft-spacing-2xs, 0.25rem)',
                                                minWidth: 0,
                                            }}
                                        >
                                            {item.summary && <P style={bodyTextStyle}>{item.summary}</P>}
                                            {item.techStack && item.techStack.length > 0 && (
                                                <Span
                                                    style={{
                                                        fontFamily: 'var(--20ft-font-mono, monospace)',
                                                        fontSize: '0.75rem',
                                                        letterSpacing: '0.04em',
                                                        color: 'var(--20ft-gray-500, #777A7D)',
                                                    }}
                                                >
                                                    사용 기술 {item.techStack.join(' · ')}
                                                </Span>
                                            )}
                                        </Div>
                                    </A>
                                </Li>
                            ))}
                        </Ul>
                    )}
                </RevealGroup>
            </Container>
        </Section>
    );
}

function NameStory(): React.ReactElement {
    return (
        <Section
            style={{
                paddingBlock: 'var(--20ft-section-py-lg, 4.5rem)',
                backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
            }}
            data-testid="about-name"
        >
            <Container>
                <RevealGroup
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-content-gap-lg, 1.75rem)',
                        maxWidth: 'var(--20ft-about-body-max, 64ch)',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                                        <H2 style={{ ...headingStyle, fontWeight: 600, fontSize: 'var(--20ft-h2-size, 1.5rem)' }}>
                        이십피트라는 이름에 담은 뜻
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
                        <P style={bodyTextStyle}>
                            이십피트라는 이름은 20피트 공간에서 시작했습니다. 작은 공간에서 아이디어를
                            나누고, 코드를 쓰고, 직접 만드는 일을 이어가고 있습니다.
                        </P>
                    </Div>
                </RevealGroup>
            </Container>
        </Section>
    );
}

function SuperBifyStory(): React.ReactElement {
    return (
        <Section
            style={{
                paddingBlock: 'var(--20ft-section-py-lg, 4.5rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="about-superbify"
        >
            <Container>
                <RevealGroup
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-content-gap-lg, 1.75rem)',
                        maxWidth: 'var(--20ft-about-body-max, 64ch)',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                                        <H2 style={{ ...headingStyle, fontWeight: 600, fontSize: 'var(--20ft-h2-size, 1.5rem)' }}>
                        직접 개발하는 제품, SuperBify
                    </H2>
                    <P style={bodyTextStyle}>
                        SuperBify는 이십피트가 직접 개발하는 쇼핑몰 템플릿과 그누보드 7 확장
                        제품입니다. 공개된 제품과 화면 예시를 살펴볼 수 있습니다.
                    </P>
                    <Div style={{ marginTop: 'var(--20ft-spacing-xs, 0.5rem)' }}>
                        <PrimaryButton href="/superbify" variant="secondary" data-testid="about-superbify-cta">
                            SuperBify 보기 →
                        </PrimaryButton>
                    </Div>
                </RevealGroup>
            </Container>
        </Section>
    );
}

function FinalCTA(): React.ReactElement {
    return (
        <Section
            style={{
                paddingBlock: 'var(--20ft-about-final-py, 3rem)',
                backgroundColor: 'var(--20ft-deep-indigo, #102A4C)',
                color: 'var(--20ft-paper-white, #FAF8F3)',
                position: 'relative',
                overflow: 'hidden',
            }}
            data-testid="about-final-cta"
        >
            <Container>
                <RevealGroup
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-content-gap-lg, 1.75rem)',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    {/* 슬로건 없이 링크 묶음만 둔다. 제목·영문 문구가 있던 자리는 비워 두지 않는다. */}
                    <Div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 'var(--20ft-spacing-md, 1rem)',
                        }}
                    >
                        <PrimaryButton href="/inquiry" variant="primary" data-testid="about-final-inquiry">
                            제작 문의하기
                        </PrimaryButton>
                        <PrimaryButton href="/portfolio" variant="inverse" data-testid="about-final-portfolio">
                            제작 사례 보기
                        </PrimaryButton>
                        <PrimaryButton href="/process" variant="inverse" data-testid="about-final-process">
                            진행 안내 보기
                        </PrimaryButton>
                    </Div>
                </RevealGroup>
            </Container>

            <Div
                style={{
                    position: 'absolute',
                    right: 'var(--20ft-gutter, 1.25rem)',
                    bottom: 'var(--20ft-section-py-lg, 4.5rem)',
                    opacity: 0.08,
                    pointerEvents: 'none',
                    display: 'var(--20ft-desktop-only, none)',
                }}
                aria-hidden="true"
            >
                <BrandLogo variant="symbol" surface="dark" height="clamp(8rem, 14vw, 13rem)" />
            </Div>
        </Section>
    );
}

export function AboutPage({ cases, className, editorAttrs }: AboutPageProps): React.ReactElement {
    usePageMeta(PAGE_META['/about']);

    return (
        <Div
            className={className}
            {...editorAttrs}
            style={{ width: '100%', minWidth: 0 }}
            data-testid="about-page"
        >
            <AboutHero />
            <WhatIHaveDone />
            <ProjectRoles cases={cases} />
            <NameStory />
            <SuperBifyStory />
            <FinalCTA />
        </Div>
    );
}

export default AboutPage;
