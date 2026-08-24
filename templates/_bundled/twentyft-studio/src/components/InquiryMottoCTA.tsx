import React from 'react';
import { Div, H2, P, Section, Span } from './basic';
import Container from './Container';
import PrimaryButton from './PrimaryButton';
import type { EditorAttrs } from '../types/template';

export interface InquiryMottoCTAProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function InquiryMottoCTA({ className, editorAttrs }: InquiryMottoCTAProps): React.ReactElement {
    return (
        <Section
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-spacing-3xl, 6rem)',
                backgroundColor: 'var(--20ft-indigo, #183B6B)',
                color: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="inquiry-motto-cta"
        >
            <Container>
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 'var(--20ft-spacing-lg, 1.5rem)',
                        maxWidth: '720px',
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
                    >
                        JUST FOR FUN.
                    </Span>

                    <P
                        style={{
                            margin: 0,
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            lineHeight: 1.7,
                            opacity: 0.9,
                        }}
                    >
                        재미있는 문제를 발견하고, 직접 만들어보고, 실제로 작동하게 만드는 것.
                        그게 20ft가 계속 만드는 이유입니다.
                    </P>

                    <H2
                        style={{
                            margin: 0,
                            fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                            fontWeight: 700,
                            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                        }}
                    >
                        만들고 싶은 것이 있으신가요?
                    </H2>

                    <P
                        style={{
                            margin: 0,
                            fontFamily: 'var(--20ft-font-body, sans-serif)',
                            lineHeight: 1.7,
                            opacity: 0.9,
                        }}
                    >
                        홈페이지, 쇼핑몰, 웹서비스, 그누보드 7 개발이나 기존 시스템 개선까지. 필요한 것을 편하게 이야기해주세요.
                    </P>

                    <PrimaryButton
                        href="/inquiry"
                        variant="primary"
                        data-testid="inquiry-motto-button"
                    >
                        프로젝트 문의
                    </PrimaryButton>
                </Div>
            </Container>
        </Section>
    );
}

export default InquiryMottoCTA;
