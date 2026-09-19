import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PriceDiscount } from '../../src/components/PriceDiscount';

describe('PriceDiscount', () => {
  it('renders a skeleton when steps is null', () => {
    render(<PriceDiscount notice={null} flow={null} steps={null} />);
    expect(screen.getByTestId('discount-skeleton')).toBeInTheDocument();
  });

  it('renders each discount step with condition and amount', () => {
    render(
      <PriceDiscount
        notice="안내"
        flow="흐름"
        steps={[
          { condition: '2개 항목', amount_label: '3%' },
          { condition: '3~4개 항목', amount_label: '5%' },
          { condition: '5개 이상', amount_label: '10%' },
        ]}
      />,
    );
    expect(screen.getByText('2개 항목')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getAllByTestId('discount-step')).toHaveLength(3);
  });

  it('renders an empty state for an empty steps list', () => {
    render(<PriceDiscount notice={null} flow={null} steps={[]} />);
    expect(screen.getByTestId('discount-empty')).toBeInTheDocument();
  });

  it('hides notice and flow blocks when they are null', () => {
    const { container } = render(
      <PriceDiscount notice={null} flow={null} steps={[]} />,
    );
    expect(container.querySelector('.pb-pricing-notice-a')).toBeNull();
    expect(container.querySelector('.pb-pricing-notice-c')).toBeNull();
  });
});