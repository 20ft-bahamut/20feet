import React from 'react';
import { Div, H1, H2, Main, P, Section, Span } from './basic';
import Container from './Container';
import SectionEyebrow from './SectionEyebrow';
import BrandLogo from './BrandLogo';
import PrimaryButton from './PrimaryButton';
import { useInView } from '../hooks/useInView';
import type { EditorAttrs } from '../types/template';

export interface AboutPageProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

interface RevealGroupProps {
    children: React.ReactNode;
    className?: string;
    stagger?: 1 | 2 | 3 | 4;
    style?: React.CSSProperties;
    'data-testid'?: string;
}

function RevealGroup({
    children,
    className,
    stagger = 1,
    style,
    'data-testid': dataTestId,
}: RevealGroupProps): React.ReactElement {
    const { ref, isInView } = useInView({ once: true, threshold: 0.05 });
    const hiddenClass = isInView ? 'is-visible' : 'is-hidden';

    return (
        <div
            ref={ref}
            className={`reveal ${hiddenClass} reveal-stagger-${stagger} ${className ?? ''}`}
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
    fontSize: 'clamp(1rem, 1.25vw, 1.125rem)',
    lineHeight: 1.75,
    letterSpacing: '-0.01em',
    color: 'var(--20ft-text-muted, #5E6063)',
};

const headingStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: 'var(--20ft-font-display, Georgia, serif)',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.12,
    color: 'var(--20ft-deep-indigo, #102A4C)',
    wordBreak: 'keep-all',
};

const utilityLabelStyle: React.CSSProperties = {
    fontFamily: 'var(--20ft-font-mono, monospace)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--20ft-heritage-gold, #B69B5F)',
};

const darkSurfaceStyle: React.CSSProperties = {
    backgroundColor: 'var(--20ft-deep-indigo, #102A4C)',
    color: 'var(--20ft-paper-white, #FAF8F3)',
};

function AboutHero(): React.ReactElement {
    return (
        <Section
            style={{
                paddingTop: 'var(--20ft-hero-py, 5rem)',
                paddingBottom: 'var(--20ft-hero-pb, 3.5rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
                overflow: 'hidden',
            }}
            data-testid="about-hero"
        >
            <Container>
                <RevealGroup
                    stagger={1}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'var(--20ft-about-hero-columns, 1fr)',
                        gap: 'var(--20ft-spacing-2xl, 4rem)',
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
                            maxWidth: 'var(--20ft-about-hero-body-max, 100%)',
                        }}
                    >
                        <Span style={utilityLabelStyle}>ABOUT 20FT</Span>
                        <H1
                            style={{
                                ...headingStyle,
                                fontSize: 'var(--20ft-about-hero-heading-size, clamp(2rem, 7vw, 4rem))',
                            }}
                        >
                            작은 공간에서 가능성을 만듭니다.
                        </H1>
                        <Span
                            style={{
                                display: 'block',
                                fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                                fontWeight: 700,
                                letterSpacing: '-0.01em',
                                lineHeight: 1.3,
                                color: 'var(--20ft-indigo, #183B6B)',
                                maxWidth: '38ch',
                                width: '100%',
                                minWidth: 0,
                            }}
                        >
                            A SMALL SPACE.
                            <br />
                            INFINITE POSSIBILITIES.
                        </Span>
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
                            height="clamp(8rem, 22vw, 16rem)"
                            data-testid="about-hero-symbol"
                        />
                    </Div>
                </RevealGroup>
            </Container>
        </Section>
    );
}

function Why20ft(): React.ReactElement {
    return (
        <Section
            style={{
                paddingBlock: 'var(--20ft-section-py-xl, 5rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="about-why"
        >
            <Container>
                <RevealGroup
                    stagger={1}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-content-gap-lg, 1.75rem)',
                        maxWidth: 'var(--20ft-about-body-max, 64ch)',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    <SectionEyebrow text="WHY 20FT" />
                    <H2
                        style={{
                            ...headingStyle,
                            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                        }}
                    >
                        왜 20ft인가.
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
                            20ft라는 이름은 작은 20피트 공간에서 시작했습니다.
                        </P>
                        <P style={bodyTextStyle}>
                            큰 사무실이나 많은 사람이 필요한 것은 아니었습니다. 작은 공간에서 아이디어를
                            이야기하고, 코드를 쓰고, 직접 무언가를 만들어내는 일이 시작됐습니다.
                        </P>
                        <P style={bodyTextStyle}>
                            20피트 컨테이너는 크지 않습니다. 하지만 필요한 것을 담을 수 있고, 어디든
                            옮겨갈 수 있으며, 새로운 용도로 다시 사용할 수도 있습니다.
                        </P>
                        <P style={bodyTextStyle}>
                            그래서 20ft라는 이름에는 처음부터 하나의 생각이 있었습니다.
                        </P>
                        <P
                            style={{
                                ...bodyTextStyle,
                                color: 'var(--20ft-deep-indigo, #102A4C)',
                                fontWeight: 600,
                            }}
                        >
                            작게 시작해도, 가능성까지 작을 필요는 없습니다.
                        </P>
                    </Div>
                </RevealGroup>
            </Container>
        </Section>
    );
}

function PersonStory(): React.ReactElement {
    return (
        <Section
            style={{
                paddingBlock: 'var(--20ft-section-py-xl, 5rem)',
                backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
            }}
            data-testid="about-person"
        >
            <Container>
                <RevealGroup
                    stagger={1}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-content-gap-lg, 1.75rem)',
                        maxWidth: 'var(--20ft-about-body-max, 64ch)',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    <SectionEyebrow text="THE PERSON BEHIND 20FT" />
                    <H2
                        style={{
                            ...headingStyle,
                            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                        }}
                    >
                        오랫동안 웹을 만들어왔습니다.
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
                            20ft는 개발에서 시작했습니다.
                        </P>
                        <P style={bodyTextStyle}>
                            웹사이트를 만들고, 서비스를 운영하고, 시스템을 설계하고, 문제가 생기면
                            다시 고쳤습니다.
                        </P>
                        <P style={bodyTextStyle}>
                            시간이 지나면서 하는 일도 조금씩 넓어졌습니다. 무엇을 만들 것인지
                            기획하고, 어떻게 운영할 것인지 설계하고, 실제로 사용할 수 있는 상태까지
                            구현하는 일을 해왔습니다.
                        </P>
                        <P style={bodyTextStyle}>
                            기술과 도구는 계속 바뀌었지만 가장 재미있는 순간은 지금도 비슷합니다.
                            아무것도 없던 곳에 실제로 작동하는 무언가가 생기는 순간입니다.
                        </P>
                        <P style={bodyTextStyle}>
                            20년 넘게 웹을 만들었습니다. 개발자로 시작해 서비스 기획과 프로젝트
                            관리, 제품 구축까지 함께 해왔습니다.
                        </P>
                        <P style={bodyTextStyle}>
                            PHP를 기반으로 다양한 웹 시스템을 개발해왔고, 프로젝트에 따라
                            Node.js와 현대적인 Frontend 기술을 함께 사용합니다.
                        </P>
                    </Div>

                    <Div
                        role="list"
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 'var(--20ft-spacing-sm, 0.75rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        {['20+ YEARS / WEB DEVELOPMENT', 'DEVELOPMENT / PLANNING / PM', 'WEB / PRODUCT / SYSTEM'].map(
                            (label) => (
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
                            ),
                        )}
                    </Div>
                </RevealGroup>
            </Container>
        </Section>
    );
}

function DigitalGarage(): React.ReactElement {
    return (
        <Section
            style={{
                paddingBlock: 'var(--20ft-section-py-xl, 5rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="about-garage"
        >
            <Container>
                <RevealGroup
                    stagger={1}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-content-gap-lg, 1.75rem)',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    <SectionEyebrow text="DIGITAL GARAGE" />
                    <H2
                        style={{
                            ...headingStyle,
                            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                            maxWidth: 'var(--20ft-about-heading-max, 100%)',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        이제 20ft는 Digital Garage입니다.
                    </H2>
                    <Div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'var(--20ft-about-garage-columns, 1fr)',
                            gap: 'var(--20ft-spacing-xl, 2.5rem)',
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
                            <Span
                                style={{
                                    ...utilityLabelStyle,
                                    color: 'var(--20ft-gray-500, #777A7D)',
                                }}
                            >
                                20FT THEN
                            </Span>
                            <P style={{ ...bodyTextStyle, color: 'var(--20ft-text-primary, #1A1A1A)' }}>
                                작은 물리적 공간
                            </P>
                            <P style={bodyTextStyle}>
                                도구와 아이디어가 모이는 작은 공간에서 직접 만들고 실험했습니다.
                            </P>
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
                            <Span style={utilityLabelStyle}>20FT NOW</Span>
                            <P style={{ ...bodyTextStyle, color: 'var(--20ft-text-primary, #1A1A1A)' }}>
                                Digital Garage
                            </P>
                            <P style={bodyTextStyle}>
                                브라우저, 에디터, 서버, 필요한 개발 도구가 있으면 어디서든 만들 수
                                있습니다.
                            </P>
                        </Div>
                    </Div>
                    <P
                        style={{
                            ...bodyTextStyle,
                            color: 'var(--20ft-deep-indigo, #102A4C)',
                            fontWeight: 600,
                            maxWidth: '52ch',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        아이디어를 꺼내 실제로 작동시켜보는 Digital Garage. 그것이 지금의 20ft입니다.
                    </P>
                </RevealGroup>
            </Container>
        </Section>
    );
}

const whatWeBuildItems = [
    {
        index: '01',
        title: 'WEB',
        description: '웹사이트와 웹서비스',
    },
    {
        index: '02',
        title: 'COMMERCE',
        description: '판매와 운영이 실제로 이루어지는 시스템',
    },
    {
        index: '03',
        title: 'SOFTWARE',
        description: '업무를 줄이고 문제를 해결하는 소프트웨어',
    },
    {
        index: '04',
        title: 'GNUBOARD 7',
        description: 'Template / Module / Plugin / Developer Tool',
    },
];

function WhatWeBuild(): React.ReactElement {
    return (
        <Section
            style={{
                paddingBlock: 'var(--20ft-section-py-xl, 5rem)',
                backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
            }}
            data-testid="about-what-we-build"
        >
            <Container>
                <RevealGroup
                    stagger={1}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-content-gap-lg, 1.75rem)',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    <SectionEyebrow text="WHAT WE BUILD" />
                    <H2
                        style={{
                            ...headingStyle,
                            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                            maxWidth: 'var(--20ft-about-heading-max, 100%)',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        필요한 것을 직접 만듭니다.
                    </H2>
                    <P style={bodyTextStyle}>
                        분야를 정해놓고 일을 찾기보다, 해결하고 싶은 문제가 생기면 필요한 기술을
                        선택합니다.
                    </P>

                    <Div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'var(--20ft-about-what-columns, 1fr)',
                            gap: 'var(--20ft-spacing-lg, 1.5rem)',
                            width: '100%',
                            minWidth: 0,
                        }}
                        role="list"
                    >
                        {whatWeBuildItems.map((item) => (
                            <WhatWeBuildItem key={item.title} item={item} />
                        ))}
                    </Div>

                    <P style={bodyTextStyle}>
                        웹사이트, SaaS, 커머스 시스템, 업무 도구, Gnuboard 확장. 결과물의 형태는
                        달라질 수 있습니다.
                    </P>
                </RevealGroup>
            </Container>
        </Section>
    );
}

interface WhatWeBuildItemProps {
    item: (typeof whatWeBuildItems)[number];
}

function WhatWeBuildItem({ item }: WhatWeBuildItemProps): React.ReactElement {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <Div
            role="listitem"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--20ft-spacing-xs, 0.5rem)',
                paddingBlock: 'var(--20ft-spacing-md, 1rem)',
                borderBottom: '1px solid var(--20ft-line, #D8D0BF)',
                width: '100%',
                minWidth: 0,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 'var(--20ft-spacing-md, 1rem)',
                    width: '100%',
                    minWidth: 0,
                }}
            >
                <Span
                    style={{
                        fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                        fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        color: isHovered
                            ? 'var(--20ft-indigo, #183B6B)'
                            : 'var(--20ft-deep-indigo, #102A4C)',
                        transition: `color var(--20ft-duration-base) var(--20ft-ease-out)`,
                    }}
                >
                    {item.title}
                </Span>
                <Span
                    style={{
                        fontFamily: 'var(--20ft-font-mono, monospace)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        color: 'var(--20ft-heritage-gold, #B69B5F)',
                    }}
                >
                    {item.index}
                </Span>
            </Div>
            <Span
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--20ft-spacing-xs, 0.5rem)',
                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    color: 'var(--20ft-text-muted, #5E6063)',
                    width: '100%',
                    minWidth: 0,
                }}
            >
                {item.description}
                <Span
                    aria-hidden="true"
                    style={{
                        display: 'inline-block',
                        transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                        transition: `transform var(--20ft-duration-base) var(--20ft-ease-out)`,
                        color: 'var(--20ft-heritage-gold, #B69B5F)',
                    }}
                >
                    →
                </Span>
            </Span>
            <Span
                aria-hidden="true"
                style={{
                    display: 'block',
                    width: isHovered ? '100%' : '0%',
                    height: '1px',
                    backgroundColor: 'var(--20ft-heritage-gold, #B69B5F)',
                    transition: `width var(--20ft-duration-base) var(--20ft-ease-out)`,
                }}
            />
        </Div>
    );
}

function SuperBifyStory(): React.ReactElement {
    return (
        <Section
            style={{
                paddingBlock: 'var(--20ft-section-py-xl, 5rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="about-superbify"
        >
            <Container>
                <RevealGroup
                    stagger={1}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-content-gap-lg, 1.75rem)',
                        maxWidth: 'var(--20ft-about-body-max, 64ch)',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    <SectionEyebrow text="SUPERBIFY" />
                    <H2
                        style={{
                            ...headingStyle,
                            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                        }}
                    >
                        한 번 만든 것을, 한 번만 쓰고 싶지는 않습니다.
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
                            프로젝트를 진행하면 반복해서 필요한 기능이 생깁니다.
                        </P>
                        <P style={bodyTextStyle}>
                            예전에는 프로젝트 내부에서 사용하고 끝냈던 기능들을 다른 사람도 다시
                            사용할 수 있는 형태로 만들기 시작했습니다.
                        </P>
                        <P style={bodyTextStyle}>
                            SuperBify는 20ft의 Gnuboard 7 확장 프로젝트입니다. Template, Module,
                            Plugin, Developer Tool, Open Source 형태의 결과물을 실제로 쓸 수 있는
                            상태가 된 것부터 하나씩 공개합니다.
                        </P>
                    </Div>
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

function JustForFun(): React.ReactElement {
    return (
        <Section
            style={{
                paddingBlock: 'var(--20ft-section-py-xl, 5rem)',
                ...darkSurfaceStyle,
                position: 'relative',
                overflow: 'hidden',
            }}
            data-testid="about-just-for-fun"
        >
            <Container>
                <RevealGroup
                    stagger={1}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-content-gap-lg, 1.75rem)',
                        maxWidth: 'var(--20ft-about-body-max, 64ch)',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    <H2
                        style={{
                            ...headingStyle,
                            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                            color: 'var(--20ft-paper-white, #FAF8F3)',
                        }}
                    >
                        JUST FOR FUN.
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
                        <P
                            style={{
                                ...bodyTextStyle,
                                color: 'rgba(244, 240, 230, 0.8)',
                            }}
                        >
                            재미있다는 이유로 시작하는 작업도 있습니다.
                        </P>
                        <P
                            style={{
                                ...bodyTextStyle,
                                color: 'rgba(244, 240, 230, 0.8)',
                            }}
                        >
                            필요해서 만든 것, 돈이 될 것 같아 시작한 것, 그냥 만들어보면
                            재미있을 것 같아서 시작한 것. 모든 실험이 제품이 되는 것은 아닙니다.
                            하지만 직접 만들어봐야 알 수 있는 것이 있습니다.
                        </P>
                        <P
                            style={{
                                ...bodyTextStyle,
                                color: 'var(--20ft-paper-white, #FAF8F3)',
                                fontWeight: 600,
                            }}
                        >
                            아이디어를 너무 오래 설명하기보다, 일단 작동하는 것으로 만들어봅니다.
                        </P>
                    </Div>
                    <Div
                        style={{
                            position: 'absolute',
                            right: 'var(--20ft-gutter, 1.25rem)',
                            bottom: 'var(--20ft-section-py-xl, 5rem)',
                            opacity: 0.08,
                            pointerEvents: 'none',
                            display: 'var(--20ft-desktop-only, none)',
                        }}
                        aria-hidden="true"
                    >
                        <BrandLogo variant="symbol" surface="dark" height="clamp(12rem, 20vw, 18rem)" />
                    </Div>
                </RevealGroup>
            </Container>
        </Section>
    );
}

function FinalBrandCTA(): React.ReactElement {
    return (
        <Section
            style={{
                paddingBlock: 'var(--20ft-section-py-xl, 5rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="about-final-cta"
        >
            <Container>
                <RevealGroup
                    stagger={1}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-content-gap-lg, 1.75rem)',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    <H2
                        style={{
                            ...headingStyle,
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        }}
                    >
                        A SMALL SPACE.
                        <br />
                        INFINITE POSSIBILITIES.
                    </H2>
                    <P
                        style={{
                            ...bodyTextStyle,
                            color: 'var(--20ft-deep-indigo, #102A4C)',
                            fontWeight: 600,
                            fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                        }}
                    >
                        작은 공간에서, 큰 가능성을 만듭니다.
                    </P>
                    <Div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 'var(--20ft-spacing-md, 1rem)',
                            marginTop: 'var(--20ft-spacing-sm, 0.75rem)',
                        }}
                    >
                        <PrimaryButton href="/portfolio" variant="primary" data-testid="about-final-portfolio">
                            Portfolio 보기
                        </PrimaryButton>
                        <PrimaryButton href="/inquiry" variant="secondary" data-testid="about-final-inquiry">
                            프로젝트 문의
                        </PrimaryButton>
                    </Div>
                </RevealGroup>
            </Container>
        </Section>
    );
}

export function AboutPage({ className, editorAttrs }: AboutPageProps): React.ReactElement {
    return (
        <Main
            className={className}
            {...editorAttrs}
            style={{
                flex: '1 1 auto',
                width: '100%',
                minWidth: 0,
            }}
            data-testid="about-page"
        >
            <AboutHero />
            <Why20ft />
            <PersonStory />
            <DigitalGarage />
            <WhatWeBuild />
            <SuperBifyStory />
            <JustForFun />
            <FinalBrandCTA />
        </Main>
    );
}

export default AboutPage;
