import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AboutSection from '../../src/components/AboutSection';

const css = (): string =>
  readFileSync(join(__dirname, '..', '..', 'src', 'styles', 'AboutSection.css'), 'utf8');

describe('AboutSection', () => {
  it('renders the message and each perspective', () => {
    render(<AboutSection copy={{
      about_message: '좋은 매장은 공간의 컨디션까지 다릅니다.',
      about_perspectives: [
        { title: '업종에 맞는 핵심 서비스', body: '설명 1' },
        { title: '기본가격 공개', body: '설명 2' },
      ],
    } as any} media={null} />);
    expect(screen.getByText('좋은 매장은 공간의 컨디션까지 다릅니다.')).toBeInTheDocument();
    expect(screen.getByText('업종에 맞는 핵심 서비스')).toBeInTheDocument();
  });

  it('renders a loading skeleton when copy is null', () => {
    render(<AboutSection copy={null} media={null} />);
    expect(screen.getByTestId('about-skeleton')).toBeInTheDocument();
  });

  it('renders the stage heading and the why-content heading from the copy domain', () => {
    const { container } = render(
      <AboutSection
        copy={
          {
            about_heading: '좋은 매장은 공간의 컨디션까지 다릅니다.',
            about_message: '보조 설명 문구',
            about_side_heading: '매장에 꼭 필요한 위생관리만\n더 분명하게 제안합니다.',
            about_perspectives: [],
          } as any
        }
        media={null}
      />,
    );

    // stage 오버레이: h3 = about_heading, p = about_message
    expect(screen.getByTestId('about-heading')).toHaveTextContent(
      '좋은 매장은 공간의 컨디션까지 다릅니다.',
    );
    expect(screen.getByTestId('about-heading').tagName).toBe('H3');
    expect(screen.getByTestId('about-message')).toHaveTextContent('보조 설명 문구');
    expect(screen.getByTestId('about-message').tagName).toBe('P');

    // why-content h2 = about_side_heading. 원문 \n 은 <br> 요소로 렌더된다
    // (날 newline 은 HTML 에서 공백으로 접히므로 renderCopyText 가 요소로 바꾼다)
    const sideHeading = screen.getByTestId('about-side-heading');
    expect(sideHeading.tagName).toBe('H2');
    expect(sideHeading.textContent).toBe('매장에 꼭 필요한 위생관리만더 분명하게 제안합니다.');
    expect(sideHeading.querySelectorAll('br')).toHaveLength(1);
    expect(container.querySelector('.pb-why-heading')).not.toBeNull();
  });

  it('omits the stage heading and why-content heading when the copy keys are null', () => {
    render(<AboutSection copy={{ about_message: '본문', about_perspectives: [] } as any} media={null} />);
    expect(screen.queryByTestId('about-heading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('about-side-heading')).not.toBeInTheDocument();
    expect(screen.getByTestId('about-message')).toHaveTextContent('본문');
  });

  it('renders the two source eyebrows from the copy domain (about_stage_eyebrow / about_side_eyebrow)', () => {
    render(
      <AboutSection
        copy={
          {
            about_stage_eyebrow: 'Why Pinkbro',
            about_heading: '좋은 매장은 공간의 컨디션까지 다릅니다.',
            about_message: '보조 설명 문구',
            about_side_eyebrow: 'Brand Perspective',
            about_side_heading: '매장에 꼭 필요한 위생관리만\n더 분명하게 제안합니다.',
            about_perspectives: [],
          } as any
        }
        media={null}
      />,
    );

    // 원문 68행 .why-overlay > .eyebrow — h3 바로 위
    const stageEyebrow = screen.getByTestId('about-stage-eyebrow');
    expect(stageEyebrow).toHaveTextContent('Why Pinkbro');
    expect(stageEyebrow.textContent).toBe('Why Pinkbro');
    expect(
      stageEyebrow.compareDocumentPosition(screen.getByTestId('about-heading')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // 원문 76행 .copy > .eyebrow — h2 바로 위
    const sideEyebrow = screen.getByTestId('about-side-eyebrow');
    expect(sideEyebrow).toHaveTextContent('Brand Perspective');
    expect(
      sideEyebrow.compareDocumentPosition(screen.getByTestId('about-side-heading')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('omits both eyebrows when their copy keys are null — 리터럴로 대체하지 않는다', () => {
    render(
      <AboutSection
        copy={
          {
            about_stage_eyebrow: null,
            about_heading: '제목',
            about_message: '본문',
            about_side_eyebrow: null,
            about_side_heading: '사이드 제목',
            about_perspectives: [],
          } as any
        }
        media={null}
      />,
    );

    expect(screen.queryByTestId('about-stage-eyebrow')).not.toBeInTheDocument();
    expect(screen.queryByTestId('about-side-eyebrow')).not.toBeInTheDocument();
    // 제목·본문은 그대로 남는다
    expect(screen.getByTestId('about-heading')).toBeInTheDocument();
    expect(screen.getByTestId('about-side-heading')).toBeInTheDocument();
  });

  it('renders the stage image from the why_stage media slot when the admin uploaded one', () => {
    render(
      <AboutSection
        copy={{ about_message: '본문', about_perspectives: [] } as any}
        media={{ why_stage: { url: '/uploads/stage.webp', alt: '매장' } }}
      />,
    );

    const img = screen.getByTestId('about-media');
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', '/uploads/stage.webp');
    expect(img).toHaveAttribute('alt', '매장');
    expect(screen.queryByTestId('about-media-fallback')).not.toBeInTheDocument();
  });

  it('renders the bundled placeholder photo when why_stage is empty or media is null', () => {
    // SLOT_PHOTO.why_stage — 원본 페이지의 why 스테이지 사진(_workspace/pinkbro/compare/original.json)
    const placeholder =
      '/api/templates/assets/pinkbro-cleancare?file=images/why-stage.webp';

    const { unmount } = render(
      <AboutSection
        copy={{ about_message: '본문', about_perspectives: [] } as any}
        media={{ why_stage: { url: null, alt: null } }}
      />,
    );
    expect(screen.getByTestId('about-media')).toHaveAttribute('src', placeholder);
    expect(screen.queryByTestId('about-media-fallback')).not.toBeInTheDocument();
    unmount();

    render(
      <AboutSection
        copy={{ about_message: '본문', about_perspectives: [] } as any}
        media={null}
      />,
    );
    expect(screen.getByTestId('about-media')).toHaveAttribute('src', placeholder);
    expect(screen.queryByTestId('about-media-fallback')).not.toBeInTheDocument();
  });

  it('renders no section anchor id — the layout owns anchor targets', () => {
    const { container } = render(
      <AboutSection
        copy={{ about_message: '본문', about_perspectives: [] } as any}
        media={null}
      />,
    );
    expect(container.querySelector('#about')).toBeNull();
  });

  it('keeps the restored original metrics in AboutSection.css', () => {
    const source = css();
    // 원문 section { padding:110px 0 }
    expect(source).toMatch(/\.pb-about\s*{\s*padding:\s*110px 0;\s*}/);
    // 원문 .h2 값 — 사이드 헤딩이 원본보다 작게 렌더되던 결함(clamp 42px)의 회귀 방지
    expect(source).toMatch(
      /\.pb-why-heading\s*{[^}]*font-size:\s*clamp\(34px,\s*4vw,\s*58px\)[^}]*line-height:\s*1\.06[^}]*letter-spacing:\s*-\.055em[^}]*}/,
    );
    // 원문 리셋 h2 { margin:0 } — 카드와의 간격은 grid gap 18px 만 남는다
    expect(source).toMatch(/\.pb-why-heading\s*{[^}]*margin:\s*0;[^}]*}/);
    // 원문 그리드/스테이지/오버레이/카드 원문 값
    expect(source).toMatch(/\.pb-why-grid\s*{[^}]*grid-template-columns:\s*\.95fr 1\.05fr[^}]*}/);
    expect(source).toMatch(/\.pb-why-stage\s*{[^}]*min-height:\s*620px[^}]*}/);
    expect(source).toMatch(/\.pb-why-overlay h3\s*{[^}]*font-size:\s*32px[^}]*}/);
    expect(source).toMatch(/\.pb-why-card\s*{[^}]*padding:\s*30px[^}]*}/);
    // 원문 브레이크포인트
    expect(source).toContain('@media (max-width: 1100px)');
    expect(source).toContain('@media (max-width: 720px)');
  });
});