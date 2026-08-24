import React from 'react';
import { Div, H1, P, Section, Span } from './basic';
import BrandLogo from './BrandLogo';
import Container from './Container';
import PrimaryButton from './PrimaryButton';
import type { EditorAttrs } from '../types/template';

export interface HomeHeroProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

export const CAPABILITY_LINE = 'WEB / COMMERCE / SOFTWARE / GNUBOARD 7';

export function HomeHero({ className, editorAttrs }: HomeHeroProps): React.ReactElement {
    return (
        <Section
            className={className}
            {...editorAttrs}
            style={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="home-hero"
        >
            <Container>
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-spacing-lg, 1.5rem)',
                        maxWidth: '840px',
                    }}
                >
                    <Span
                        style={{
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--20ft-heritage-gold, #B69B5F)',
                        }}
                        data-testid="hero-eyebrow"
                    >
                        20FT / SOFTWARE STUDIO
                    </Span>

                    <BrandLogo
                        variant="symbol"
                        surface="light"
                        height="6rem"
                        data-testid="hero-symbol"
                    />

                    <H1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                            fontWeight: 800,
                            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                            lineHeight: 1.08,
                            color: 'var(--20ft-deep-indigo, #102A4C)',
                        }}
                    >
                        작은 공간에서, 큰 가능성을 만듭니다.
                    </H1>

                    <P
                        style={{
                            margin: 0,
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                            lineHeight: 1.6,
                            color: 'var(--20ft-text-muted, #5E6063)',
                            maxWidth: '640px',
                        }}
                    >
                        웹사이트와 쇼핑몰, 웹서비스와 그누보드 7 확장까지. 필요한 것을 이해하고, 실제로 운영되는 결과물로 만듭니다.
                    </P>

                    <Div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 'var(--20ft-spacing-md, 1rem)',
                            marginTop: 'var(--20ft-spacing-sm, 0.5rem)',
                        }}
                    >
                        <PrimaryButton
                            href="/portfolio"
                            variant="secondary"
                            data-testid="hero-cta-portfolio"
                        >
                            Portfolio 보기 →
                        </PrimaryButton>
                        <PrimaryButton
                            href="/inquiry"
                            variant="primary"
                            data-testid="hero-cta-inquiry"
                        >
                            프로젝트 문의
                        </PrimaryButton>
                    </Div>

                    <Span
                        style={{
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--20ft-heritage-gold, #B69B5F)',
                            marginTop: 'var(--20ft-spacing-md, 1rem)',
                        }}
                        data-testid="hero-capability-line"
                    >
                        {CAPABILITY_LINE}
                    </Span>
                </Div>
            </Container>
        </Section>
    );
}

export default HomeHero;
