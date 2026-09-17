import React from 'react';
import { Div, H1, P, Section, Span } from './basic';
import Container from './Container';
import PrimaryButton from './PrimaryButton';
import { PAGE_META } from '../content/seo';
import { useInView } from '../hooks/useInView';
import { usePageMeta } from '../hooks/usePageMeta';
import type { EditorAttrs } from '../types/template';

export interface HomeHeroProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

/**
 * 첫 화면.
 *
 * 제목·설명·행동만 남긴다. 강조 라벨(eyebrow)은 제목과 같은 말을 반복하므로 두지 않는다.
 * 실제 작업 화면은 바로 다음 섹션에서 크게 보여준다 — 같은 이미지를 두 번 쓰지 않는다.
 *
 * 데스크톱은 문장 의미 단위로 줄을 나누고, 좁은 화면에서는 강제 줄바꿈을 끄고
 * 자연스럽게 접히게 한다(`.hero-line-break`).
 * <br> 뒤의 {' '} 는 줄바꿈을 껐을 때 앞 문장과 붙어 버리는 것을 막는다.
 */
export function HomeHero({ className, editorAttrs }: HomeHeroProps): React.ReactElement {
    // 홈 레이아웃의 첫 섹션이라 문서 메타도 여기서 한 번만 적용한다.
    usePageMeta(PAGE_META['/']);

    const { ref: revealRef, isInView } = useInView({ threshold: 0.12, once: true });

    return (
        <Section
            className={className}
            {...editorAttrs}
            style={{
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="home-hero"
        >
            <Container>
                <div
                    ref={revealRef}
                    className={['reveal', isInView ? 'is-visible' : 'is-hidden'].join(' ')}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 'var(--20ft-hero-stack-gap, 1.5rem)',
                        width: '100%',
                        minWidth: 0,
                        paddingTop: 'var(--20ft-hero-py, 4rem)',
                        paddingBottom: 'var(--20ft-hero-pb, 3rem)',
                    }}
                >
                    <H1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--20ft-font-display, serif)',
                            fontSize: 'var(--20ft-hero-heading-size, clamp(1.6875rem, 7vw, 3.25rem))',
                            fontWeight: 700,
                            lineHeight: 1.22,
                            letterSpacing: '-0.03em',
                            color: 'var(--20ft-deep-indigo, #102A4C)',
                            width: '100%',
                            minWidth: 0,
                            maxWidth: 'var(--20ft-hero-heading-max, 100%)',
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word',
                        }}
                        data-testid="hero-heading"
                    >
                        홈페이지와 쇼핑몰,
                        <br className="hero-line-break" />{' '}
                        업무에 맞는 웹프로그램을 만듭니다.
                    </H1>

                    <P
                        style={{
                            margin: 0,
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            fontSize: 'var(--20ft-hero-body-size, 1.0625rem)',
                            lineHeight: 1.75,
                            letterSpacing: '-0.01em',
                            color: 'var(--20ft-text-secondary, rgba(26, 26, 26, 0.72))',
                            width: '100%',
                            minWidth: 0,
                            maxWidth: 'var(--20ft-hero-body-max, 100%)',
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word',
                        }}
                        data-testid="hero-description"
                    >
                        회사 소개부터 온라인 판매,{' '}
                        <Span style={{ whiteSpace: 'nowrap' }}>고객·계약·업무</Span> 관리까지.
                        <br className="hero-line-break" />{' '}
                        필요한 기능을 정리해 기획하고 개발합니다.
                    </P>

                    <Div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 'var(--20ft-content-gap-sm, 0.75rem)',
                            alignItems: 'center',
                            marginTop: 'var(--20ft-hero-cta-gap, 0.5rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        <PrimaryButton
                            href="/inquiry"
                            variant="primary"
                            size="medium"
                            data-testid="hero-cta-inquiry"
                        >
                            제작 문의하기
                        </PrimaryButton>
                        <PrimaryButton href="/portfolio" variant="secondary" size="medium" data-testid="hero-cta">
                            제작 사례 보기
                        </PrimaryButton>
                    </Div>

                    <Span
                        style={{
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            fontSize: '0.875rem',
                            lineHeight: 1.65,
                            color: 'var(--20ft-text-tertiary, rgba(26, 26, 26, 0.56))',
                            letterSpacing: '0.01em',
                            maxWidth: '100%',
                            wordBreak: 'keep-all',
                        }}
                        data-testid="hero-note"
                    >
                        기획서가 없어도 괜찮습니다.
                    </Span>
                </div>
            </Container>
        </Section>
    );
}

export default HomeHero;
