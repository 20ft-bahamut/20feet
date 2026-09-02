import React from 'react';
import { Div, H1, P, Section, Span } from './basic';
import BrandLogo from './BrandLogo';
import Container from './Container';
import PrimaryButton from './PrimaryButton';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInView } from '../hooks/useInView';
import type { EditorAttrs } from '../types/template';

export interface HomeHeroProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function HomeHero({ className, editorAttrs }: HomeHeroProps): React.ReactElement {
    const prefersReducedMotion = useReducedMotion();
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
                        width: '100%',
                        minWidth: 0,
                        paddingTop: 'var(--20ft-hero-py, 5rem)',
                        paddingBottom: 'var(--20ft-hero-pb, 4rem)',
                        gap: 'var(--20ft-content-gap-xl, 2.5rem)',
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
                        <H1
                            style={{
                                fontFamily: 'var(--20ft-font-display, serif)',
                                fontSize: 'var(--20ft-hero-heading-size, clamp(2rem, 8vw, 4.5rem))',
                                fontWeight: 500,
                                lineHeight: 1.08,
                                letterSpacing: '-0.028em',
                                color: 'var(--20ft-deep-indigo, #102A4C)',
                                width: '100%',
                                minWidth: 0,
                                maxWidth: 'var(--20ft-hero-heading-max, 100%)',
                                wordBreak: 'keep-all',
                                overflowWrap: 'break-word',
                            }}
                            data-testid="hero-heading"
                        >
                            작은 공간에서,
                            <br />
                            큰 가능성을 만듭니다
                        </H1>

                        <P
                            style={{
                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                                lineHeight: 1.7,
                                letterSpacing: '-0.01em',
                                color: 'var(--20ft-text-secondary, rgba(26, 26, 26, 0.72))',
                                width: '100%',
                                minWidth: 0,
                                maxWidth: 'var(--20ft-hero-body-max, 100%)',
                            }}
                            data-testid="hero-description"
                        >
                            웹사이트, 커머스, 업무 시스템, 그누보드 7 확장 제품을
                            직접 기획하고 개발하는 Software Studio입니다.
                            <br />
                            필요한 것을 이해하고, 실제로 운영되는 결과물로 만듭니다.
                        </P>
                    </Div>

                    <Div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--20ft-content-gap-sm, 0.75rem)',
                            width: '100%',
                            minWidth: 0,
                            alignItems: 'flex-start',
                        }}
                    >
                        <Div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 'var(--20ft-content-gap-sm, 0.75rem)',
                                alignItems: 'center',
                                width: '100%',
                                minWidth: 0,
                            }}
                        >
                            <PrimaryButton href="/portfolio" variant="primary" size="medium" data-testid="hero-cta">
                                프로젝트 보기
                            </PrimaryButton>
                            <PrimaryButton href="/inquiry" variant="secondary" size="medium" data-testid="hero-cta-inquiry">
                                프로젝트 문의
                            </PrimaryButton>
                        </Div>

                        <Span
                            style={{
                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                fontSize: '0.8125rem',
                                lineHeight: 1.5,
                                color: 'var(--20ft-text-tertiary, rgba(26, 26, 26, 0.48))',
                                letterSpacing: '0.01em',
                                maxWidth: '100%',
                                wordBreak: 'keep-all',
                            }}
                        >
                            20ft / Software Studio
                        </Span>
                    </Div>
                </div>
            </Container>

            <BrandLogo
                variant="symbol"
                surface="light"
                aria-hidden="true"
                data-testid="hero-symbol"
                style={{
                    position: 'absolute',
                    top: '55%',
                    right: 'var(--20ft-hero-symbol-right, var(--20ft-gutter, 1rem))',
                    transform: `translateY(-50%) ${prefersReducedMotion ? 'scale(1)' : 'scale(1.05)'}`,
                    height: 'var(--20ft-hero-symbol-size, min(36vw, 10rem))',
                    width: 'auto',
                    opacity: 0.06,
                    color: 'var(--20ft-deep-indigo, #102A4C)',
                    pointerEvents: 'none',
                    display: 'var(--20ft-hero-symbol-display, block)',
                }}
            />
        </Section>
    );
}

export default HomeHero;
