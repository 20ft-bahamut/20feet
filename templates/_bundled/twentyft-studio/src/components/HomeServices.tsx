import React from 'react';
import { A, H2, H3, Li, P, Section, Span, Ul } from './basic';
import Container from './Container';
import { SERVICES } from '../content/services';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { EditorAttrs } from '../types/template';

export interface HomeServicesProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

/**
 * 제작 서비스.
 *
 * 세 줄짜리 목록이라 카드로 감싸지 않는다. 위쪽 괘선과 여백만으로 구분한다.
 * 고객이 '내 상황이 여기 해당하는지' 판단할 만큼만 쓰고 상세는 각 페이지로 넘긴다.
 */
export function HomeServices({ className, editorAttrs }: HomeServicesProps): React.ReactElement {
    const { ref: revealRef, isInView } = useInView({ once: true, threshold: 0.05 });

    const revealClass = (stagger: number): string =>
        `reveal ${isInView ? 'is-visible' : 'is-hidden'} reveal-stagger-${stagger}`;

    return (
        <Section
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-home-section-py, 4rem)',
                backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
            }}
            data-testid="home-services"
        >
            <Container>
                <div ref={revealRef}>
                    <H2
                        className={revealClass(1)}
                        style={{
                            margin: 0,
                            marginBottom: 'var(--20ft-home-heading-gap, 1.75rem)',
                            fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.25,
                            fontSize: 'var(--20ft-home-h2-size, clamp(1.375rem, 2.4vw, 1.875rem))',
                            color: 'var(--20ft-deep-indigo, #102A4C)',
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word',
                        }}
                    >
                        어떤 웹사이트가 필요하신가요?
                    </H2>

                    <Ul
                        className={revealClass(2)}
                        style={{
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            display: 'grid',
                            gridTemplateColumns: 'var(--20ft-home-service-columns, 1fr)',
                            gap: 'var(--20ft-home-service-gap, 1.5rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                        data-testid="home-services-list"
                    >
                        {SERVICES.map((service) => (
                            <Li key={service.key} style={{ display: 'flex', minWidth: 0 }}>
                                <ServiceRow service={service} />
                            </Li>
                        ))}
                    </Ul>
                </div>
            </Container>
        </Section>
    );
}

function ServiceRow({ service }: { service: (typeof SERVICES)[number] }): React.ReactElement {
    const [isHovered, setIsHovered] = React.useState(false);
    const prefersReducedMotion = useReducedMotion();

    return (
        <A
            href={service.path}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--20ft-spacing-xs, 0.5rem)',
                width: '100%',
                minWidth: 0,
                paddingTop: 'var(--20ft-spacing-md, 1rem)',
                borderTopWidth: '2px',
                borderTopStyle: 'solid',
                borderTopColor: isHovered
                    ? 'var(--20ft-heritage-gold, #B69B5F)'
                    : 'var(--20ft-indigo, #183B6B)',
                textDecoration: 'none',
                transform: isHovered && !prefersReducedMotion ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'transform var(--20ft-duration-base) var(--20ft-ease-out), border-color var(--20ft-duration-base) var(--20ft-ease-out)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            data-testid={`home-service-${service.key}`}
        >
            <H3
                style={{
                    margin: 0,
                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.4,
                    color: 'var(--20ft-deep-indigo, #102A4C)',
                    wordBreak: 'keep-all',
                }}
            >
                {service.label}
            </H3>

            <P
                style={{
                    margin: 0,
                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.75,
                    letterSpacing: '-0.005em',
                    color: 'var(--20ft-text-muted, #5E6063)',
                    wordBreak: 'keep-all',
                    overflowWrap: 'break-word',
                }}
            >
                {service.homeBlurb}
            </P>

            <Span
                style={{
                    marginTop: 'auto',
                    paddingTop: 'var(--20ft-spacing-xs, 0.5rem)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: isHovered ? 'var(--20ft-heritage-gold, #B69B5F)' : 'var(--20ft-indigo, #183B6B)',
                    transition: 'color var(--20ft-duration-base) var(--20ft-ease-out)',
                }}
                data-testid={`home-service-${service.key}-link`}
            >
                {service.shortLabel} 알아보기
                <Span
                    aria-hidden="true"
                    style={{
                        display: 'inline-block',
                        transform: isHovered && !prefersReducedMotion ? 'translateX(4px)' : 'translateX(0)',
                        transition: 'transform var(--20ft-duration-base) var(--20ft-ease-out)',
                    }}
                >
                    →
                </Span>
            </Span>
        </A>
    );
}

export default HomeServices;
