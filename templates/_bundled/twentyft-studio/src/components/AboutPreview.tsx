import React from 'react';
import { Div, H2, P, Section, Span } from './basic';
import Container from './Container';
import PrimaryButton from './PrimaryButton';
import SectionEyebrow from './SectionEyebrow';
import type { EditorAttrs } from '../types/template';

export interface AboutPreviewProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function AboutPreview({ className, editorAttrs }: AboutPreviewProps): React.ReactElement {
    return (
        <Section
            id="about"
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-spacing-3xl, 6rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="about-preview"
        >
            <Container>
                <SectionEyebrow text="ABOUT 20FT" />
                <Div
                    style={{
                        display: 'grid',
                        gap: 'var(--20ft-spacing-xl, 2.5rem)',
                        maxWidth: '720px',
                    }}
                >
                    <H2
                        style={{
                            margin: 0,
                            fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                            fontWeight: 700,
                            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                            color: 'var(--20ft-deep-indigo, #102A4C)',
                        }}
                    >
                        작은 공간에서 계속 만듭니다.
                    </H2>

                    <Div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--20ft-spacing-md, 1rem)',
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            color: 'var(--20ft-text-muted, #5E6063)',
                            lineHeight: 1.7,
                        }}
                    >
                        <P style={{ margin: 0 }}>
                            20ft라는 이름은 작은 20피트 공간에서 시작했습니다. 지금은 웹과 소프트웨어, 필요한 도구와 아이디어를 만드는 Digital Garage로 이어가고 있습니다.
                        </P>
                    </Div>

                    <Span
                        style={{
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--20ft-heritage-gold, #B69B5F)',
                        }}
                        data-testid="about-proof"
                    >
                        20+ YEARS / WEB DEVELOPMENT
                    </Span>

                    <Div>
                        <PrimaryButton href="/#about" variant="secondary" data-testid="about-cta">
                            20ft에 대하여 →
                        </PrimaryButton>
                    </Div>
                </Div>
            </Container>
        </Section>
    );
}

export default AboutPreview;
