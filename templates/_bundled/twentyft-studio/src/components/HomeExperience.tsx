import React from 'react';
import { A, Div, H2, H3, Li, P, Section, Span, Ul } from './basic';
import Container from './Container';
import LoadingRows from './LoadingRows';
import PrimaryButton from './PrimaryButton';
import { useInView } from '../hooks/useInView';
import type { PortfolioItem, EditorAttrs } from '../types/template';

export interface HomeExperienceProps {
    /** 담당자가 실제로 맡은 프로젝트. 소개 문장의 근거로 연결한다. */
    cases?: PortfolioItem[] | null;
    className?: string;
    editorAttrs?: EditorAttrs;
}

/**
 * 담당자 경험.
 *
 * 추상적인 역량 카드를 나열하지 않는다. 확인된 경력 사실만 짧게 쓰고,
 * 그 근거로 실제 사례와 소개 페이지를 연결한다.
 * 팀 규모·작업 건수·만족도는 확인되지 않았으므로 넣지 않는다.
 */
export function HomeExperience({ cases, className, editorAttrs }: HomeExperienceProps): React.ReactElement {
    const { ref: sectionRef, isInView } = useInView({ once: true, threshold: 0.05 });
    const isPending = cases === undefined || cases === null;
    const list = Array.isArray(cases) ? cases.slice(0, 3) : [];

    const revealClass = (stagger: number): string =>
        `reveal ${isInView ? 'is-visible' : 'is-hidden'} reveal-stagger-${stagger}`;

    return (
        <Section
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-section-py-lg, 4.5rem)',
                backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
            }}
            data-testid="home-experience"
        >
            <Container>
                <div ref={sectionRef}>
                    <Div
                        className={revealClass(1)}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'var(--20ft-experience-columns, 1fr)',
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
                            <H2
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                    fontWeight: 700,
                                    fontSize: 'var(--20ft-home-h2-size, clamp(1.375rem, 2.4vw, 1.875rem))',
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1.25,
                                    color: 'var(--20ft-deep-indigo, #102A4C)',
                                    wordBreak: 'keep-all',
                                }}
                            >
                                20년 넘게 웹을 만들어왔습니다.
                            </H2>
                            <P
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    fontSize: '1rem',
                                    lineHeight: 1.85,
                                    letterSpacing: '-0.01em',
                                    color: 'var(--20ft-text-muted, #5E6063)',
                                    maxWidth: '54ch',
                                    wordBreak: 'keep-all',
                                    overflowWrap: 'break-word',
                                }}
                            >
                                웹사이트 제작부터 서비스 기획, 프로젝트 관리, 업무 시스템 구축과 운영까지
                                해왔습니다. 요구사항을 정리하는 단계부터 실제로 쓰이는 상태까지 직접 맡습니다.
                            </P>

                            <Div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 'var(--20ft-spacing-sm, 0.75rem)',
                                    marginTop: 'var(--20ft-spacing-xs, 0.5rem)',
                                }}
                            >
                                <PrimaryButton href="/about" variant="secondary" data-testid="experience-cta">
                                    이십피트 소개 보기 →
                                </PrimaryButton>
                            </Div>
                        </Div>

                        <Div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--20ft-spacing-sm, 0.75rem)',
                                width: '100%',
                                minWidth: 0,
                            }}
                            data-testid="experience-cases"
                        >
                            <Span
                                style={{
                                    fontFamily: 'var(--20ft-font-mono, monospace)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.08em',
                                    color: 'var(--20ft-heritage-gold, #B69B5F)',
                                }}
                            >
                                관련 사례
                            </Span>

                            {isPending ? (
                                <LoadingRows rows={2} testId="experience-cases-loading" />
                            ) : list.length === 0 ? (
                                <P
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.75,
                                        color: 'var(--20ft-text-muted, #5E6063)',
                                        wordBreak: 'keep-all',
                                    }}
                                >
                                    아직 공개된 사례가 없습니다.
                                </P>
                            ) : (
                                <Ul
                                    style={{
                                        listStyle: 'none',
                                        margin: 0,
                                        padding: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        width: '100%',
                                        minWidth: 0,
                                    }}
                                >
                                    {list.map((item) => (
                                        <Li key={item.id} style={{ width: '100%', minWidth: 0 }}>
                                            <A
                                                href={`/portfolio/${item.slug}`}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 'var(--20ft-spacing-3xs, 0.125rem)',
                                                    paddingBlock: 'var(--20ft-spacing-sm, 0.75rem)',
                                                    borderTop: '1px solid var(--20ft-line, #D8D0BF)',
                                                    textDecoration: 'none',
                                                    width: '100%',
                                                    minWidth: 0,
                                                }}
                                                data-testid="experience-case-link"
                                            >
                                                <H3
                                                    style={{
                                                        margin: 0,
                                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                                        fontSize: '1rem',
                                                        fontWeight: 700,
                                                        lineHeight: 1.5,
                                                        color: 'var(--20ft-indigo, #183B6B)',
                                                        wordBreak: 'keep-all',
                                                    }}
                                                >
                                                    {item.title}
                                                </H3>
                                                <Span
                                                    style={{
                                                        fontFamily: 'var(--20ft-font-mono, monospace)',
                                                        fontSize: '0.75rem',
                                                        letterSpacing: '0.04em',
                                                        color: 'var(--20ft-gray-500, #777A7D)',
                                                    }}
                                                >
                                                    {item.role && item.role.length > 0
                                                        ? `담당 ${item.role.join(' · ')}`
                                                        : '고객 프로젝트'}
                                                </Span>
                                            </A>
                                        </Li>
                                    ))}
                                </Ul>
                            )}

                            <A
                                href="/superbify"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--20ft-spacing-3xs, 0.125rem)',
                                    paddingBlock: 'var(--20ft-spacing-sm, 0.75rem)',
                                    borderTop: '1px solid var(--20ft-line, #D8D0BF)',
                                    textDecoration: 'none',
                                    width: '100%',
                                    minWidth: 0,
                                }}
                                data-testid="experience-superbify-link"
                            >
                                <H3
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        lineHeight: 1.5,
                                        color: 'var(--20ft-indigo, #183B6B)',
                                        wordBreak: 'keep-all',
                                    }}
                                >
                                    자체 개발 제품 · SuperBify
                                </H3>
                                <Span
                                    style={{
                                        fontFamily: 'var(--20ft-font-mono, monospace)',
                                        fontSize: '0.75rem',
                                        letterSpacing: '0.04em',
                                        color: 'var(--20ft-gray-500, #777A7D)',
                                    }}
                                >
                                    직접 개발한 쇼핑몰 템플릿과 확장 제품
                                </Span>
                            </A>
                        </Div>
                    </Div>
                </div>
            </Container>
        </Section>
    );
}

export default HomeExperience;
