import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FaqList } from '../../src/components/FaqList';

describe('FaqList', () => {
  it('renders native details/summary pairs (no javascript accordion)', () => {
    const { container } = render(
      <FaqList
        intro="소개"
        items={[
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
    render(<FaqList intro="소개" items={[]} />);
    expect(screen.getByTestId('faq-empty')).toBeInTheDocument();
  });

  it('renders a skeleton when items is null', () => {
    render(<FaqList intro={null} items={null} />);
    expect(screen.getByTestId('faq-skeleton')).toBeInTheDocument();
  });

  it('renders the answer text inside the matching details item', () => {
    render(<FaqList intro={null} items={[{ question: 'Q1', answer: 'A1' }]} />);
    expect(screen.getByText('A1')).toBeInTheDocument();
  });
});