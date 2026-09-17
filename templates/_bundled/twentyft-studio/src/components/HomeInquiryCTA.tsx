import React from 'react';
import { Div, H2, P, Section } from './basic';
import BrandLogo from './BrandLogo';
import Container from './Container';
import PrimaryButton from './PrimaryButton';
import { useInView } from '../hooks/useInView';
import type { EditorAttrs } from '../types/template';

export interface HomeInquiryCTAProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

/**
 * 문의 직전 안내 영역.
 *
 * 상담을 망설이게 만드는 조건(기획서, 예산 확정)을 요구하지 않는다.
 * 회신 시간이나 무료 상담 횟수처럼 확인되지 않은 약속은 넣지 않는다.
 */
export function HomeInquiryCTA({ className, editorAttrs }: HomeInquiryCTAProps): React.ReactElement {
    const { ref: sectionRef, isInView } = useInView({ once: true, threshold: 0.05 });

    const revealClass = (stagger: number): string =>
        `reveal ${isInView ? 'is-visible' : 'is-hidden'} reveal-stagger-${stagger}`;

    return (
        <Section
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-section-py-lg, 4.5rem)',
                backgroundColor: 'var(--20ft-deep-indigo, #102A4C)',
                color: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="home-inquiry-cta"
        >
            <Container>
                <div ref={sectionRef}>
                    <Div
                        className={revealClass(1)}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'var(--20ft-inquiry-columns, 1fr)',
                            gap: 'var(--20ft-spacing-2xl, 3rem)',
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
                        <H2
                            style={{
                                margin: 0,
                                fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                fontWeight: 700,
                                fontSize: 'var(--20ft-home-h2-size, clamp(1.375rem, 2.4vw, 1.875rem))',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.2,
                                wordBreak: 'keep-all',
                                color: 'var(--20ft-paper-white, #FAF8F3)',
                            }}
                        >
                            {/* 문장 의미 단위로 끊는다 — 폭에 따라 문장 가운데가 잘리지 않게. */}
                            만들고 싶은
                            <br />{' '}
                            웹사이트가 있나요?
                        </H2>

                        <P
                            style={{
                                margin: 0,
                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                fontSize: '1rem',
                                lineHeight: 1.85,
                                letterSpacing: '-0.005em',
                                opacity: 0.92,
                                maxWidth: '48ch',
                                wordBreak: 'keep-all',
                                overflowWrap: 'break-word',
                            }}
                        >
                            {/* 두 문장을 각각 한 줄로 둔다 — 문장 중간에서 끊기면 읽기 어렵다. */}
                            제작 목적이나 현재 불편한 점을 알려주세요.
                            <br />{' '}
                            필요한 기능부터 함께 살펴보겠습니다.
                        </P>

                        <Div style={{ marginTop: 'var(--20ft-spacing-sm, 0.75rem)' }}>
                            <PrimaryButton
                                href="/inquiry"
                                variant="primary"
                                size="medium"
                                data-testid="home-inquiry-cta-button"
                            >
                                제작 문의하기
                            </PrimaryButton>
                        </Div>
                    </Div>

                    {/*
                      넓은 화면에서 오른쪽이 비지 않도록 브랜드 마크를 둔다.
                      문의할 수 있는 분야는 바로 위 서비스 섹션에 이미 있으므로 되풀이하지 않는다.
                    */}
                    <Div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--20ft-spacing-lg, 1.5rem)',
                            alignItems: 'flex-start',
                            width: '100%',
                            minWidth: 0,
                        }}
                        data-testid="home-inquiry-scope"
                    >
                        {/*
                          푸터가 워드마크(compact)를 쓰므로 여기서는 원형 배지를 쓴다.
                          같은 마크를 두 번 두면 로고가 반복된 것처럼 보인다.
                        */}
                        <BrandLogo
                            variant="badge"
                            surface="dark"
                            height="clamp(5.5rem, 10vw, 8.5rem)"
                            aria-hidden="true"
                        />

                    </Div>
                </Div>
                </div>
            </Container>
        </Section>
    );
}

export default HomeInquiryCTA;
