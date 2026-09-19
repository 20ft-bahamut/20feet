import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AboutSection from '../../src/components/AboutSection';

describe('AboutSection', () => {
  it('renders the message and each perspective', () => {
    render(<AboutSection copy={{
      about_message: '좋은 매장은 공간의 컨디션까지 다릅니다.',
      about_perspectives: [
        { title: '업종에 맞는 핵심 서비스', body: '설명 1' },
        { title: '기본가격 공개', body: '설명 2' },
      ],
    } as any} />);
    expect(screen.getByText('좋은 매장은 공간의 컨디션까지 다릅니다.')).toBeInTheDocument();
    expect(screen.getByText('업종에 맞는 핵심 서비스')).toBeInTheDocument();
  });

  it('renders a loading skeleton when copy is null', () => {
    render(<AboutSection copy={null} />);
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
      />,
    );

    // stage 오버레이: h3 = about_heading, p = about_message
    expect(screen.getByTestId('about-heading')).toHaveTextContent(
      '좋은 매장은 공간의 컨디션까지 다릅니다.',
    );
    expect(screen.getByTestId('about-heading').tagName).toBe('H3');
    expect(screen.getByTestId('about-message')).toHaveTextContent('보조 설명 문구');
    expect(screen.getByTestId('about-message').tagName).toBe('P');

    // why-content h2 = about_side_heading (원문 \n 은 CSS pre-line 으로 보존)
    const sideHeading = screen.getByTestId('about-side-heading');
    expect(sideHeading.tagName).toBe('H2');
    expect(sideHeading.textContent).toBe('매장에 꼭 필요한 위생관리만\n더 분명하게 제안합니다.');
    expect(container.querySelector('.pb-why-heading')).not.toBeNull();
  });

  it('omits the stage heading and why-content heading when the copy keys are null', () => {
    render(<AboutSection copy={{ about_message: '본문', about_perspectives: [] } as any} />);
    expect(screen.queryByTestId('about-heading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('about-side-heading')).not.toBeInTheDocument();
    expect(screen.getByTestId('about-message')).toHaveTextContent('본문');
  });
});