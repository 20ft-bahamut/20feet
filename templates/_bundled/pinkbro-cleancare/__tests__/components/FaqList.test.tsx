import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FaqList } from '../../src/components/FaqList';

describe('FaqList', () => {
  it('renders native details/summary pairs (no javascript accordion)', () => {
    const { container } = render(
      <FaqList
        intro="소개"
        introSub={null} items={[
          { question: 'Q1', answer: 'A1' },
          { question: 'Q2', answer: 'A2' },
        ]}
      />,
    );
    expect(container.querySelectorAll('details')).toHaveLength(2);
    expect(container.querySelectorAll('summary')).toHaveLength(2);
    expect(screen.getByText('Q1')).toBeInTheDocument();
  });

  it('renders an empty state for an empty faq list', () => {
    render(<FaqList intro="소개" introSub={null} items={[]} />);
    expect(screen.getByTestId('faq-empty')).toBeInTheDocument();
  });

  it('renders a skeleton when items is null', () => {
    render(<FaqList intro={null} introSub={null} items={null} />);
    expect(screen.getByTestId('faq-skeleton')).toBeInTheDocument();
  });

  it('renders the answer text inside the matching details item', () => {
    render(<FaqList intro={null} introSub={null} items={[{ question: 'Q1', answer: 'A1' }]} />);
    expect(screen.getByText('A1')).toBeInTheDocument();
  });

  it('renders the intro copy as the section h2 heading (faq_intro)', () => {
    render(
      <FaqList
        eyebrow="FAQ"
        intro={'견적 전에 많이 묻는 내용을\n먼저 확인해 보세요.'}
        introSub="가격, 작업 기준, 출장지역처럼 상담 전에 가장 많이 확인하는 내용을 짧고 분명하게 정리했습니다."
        items={[{ question: 'Q1', answer: 'A1' }]}
      />,
    );

    const heading = screen.getByRole('heading', { level: 2, name: /견적 전에 많이 묻는 내용을/ });
    expect(heading).toHaveClass('pb-faq-h2');
    expect(screen.getByTestId('faq-heading')).toBe(heading);
    expect(screen.getByTestId('faq-eyebrow')).toHaveTextContent('FAQ');
    expect(screen.getByTestId('faq-eyebrow').className).toContain('pb-faq-eyebrow');
    expect(screen.getByTestId('faq-intro-sub')).toHaveTextContent(
      '상담 전에 가장 많이 확인하는 내용을 짧고 분명하게 정리했습니다.',
    );
  });

  it('omits the intro heading and sub copy when the keys are null', () => {
    render(<FaqList intro={null} introSub={null} items={[{ question: 'Q1', answer: 'A1' }]} />);
    expect(screen.queryByTestId('faq-heading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('faq-intro-sub')).not.toBeInTheDocument();
  });

  it('renders the source eyebrow only when its copy key is present (faq_eyebrow)', () => {
    const { unmount } = render(
      <FaqList eyebrow="FAQ" intro={null} introSub={null} items={[{ question: 'Q1', answer: 'A1' }]} />,
    );
    expect(screen.getByTestId('faq-eyebrow')).toHaveTextContent('FAQ');
    unmount();

    render(<FaqList eyebrow={null} intro={null} introSub={null} items={[{ question: 'Q1', answer: 'A1' }]} />);
    // 리터럴 `FAQ` 로 되돌아가지 않는다
    expect(screen.queryByTestId('faq-eyebrow')).not.toBeInTheDocument();
    expect(document.querySelector('.pb-faq-eyebrow')).toBeNull();
  });
});