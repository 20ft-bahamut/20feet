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

  it('renders the intro sub copy from the copy domain (faq_intro_sub)', () => {
    render(
      <FaqList
        intro={'견적 전에 많이 묻는 내용을\n먼저 확인해 보세요.'}
        introSub="가격, 작업 기준, 출장지역처럼 상담 전에 가장 많이 확인하는 내용을 짧고 분명하게 정리했습니다."
        items={[{ question: 'Q1', answer: 'A1' }]}
      />,
    );

    expect(screen.getByText(/견적 전에 많이 묻는 내용을/)).toBeInTheDocument();
    expect(screen.getByTestId('faq-intro-sub')).toHaveTextContent(
      '상담 전에 가장 많이 확인하는 내용을 짧고 분명하게 정리했습니다.',
    );
  });

  it('omits the intro sub copy when the key is null', () => {
    render(<FaqList intro={null} introSub={null} items={[{ question: 'Q1', answer: 'A1' }]} />);
    expect(screen.queryByTestId('faq-intro-sub')).not.toBeInTheDocument();
  });
});