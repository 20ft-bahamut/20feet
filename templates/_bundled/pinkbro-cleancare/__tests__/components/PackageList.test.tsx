import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PackageList } from '../../src/components/PackageList';

const items = [
  {
    title: 'A', summary: 'sa', includes: ['i1', 'i2'],
    base_total: '400,000원', price: '380,000원', discount_rate: 5, is_featured: false,
  },
  {
    title: 'B', summary: 'sb', includes: ['i3'],
    base_total: '900,000원', price: '810,000원', discount_rate: 10, is_featured: true,
  },
];

describe('PackageList', () => {
  it('renders a skeleton when items is null', () => {
    render(<PackageList intro={null} items={null} />);
    expect(screen.getByTestId('packages-skeleton')).toBeInTheDocument();
  });

  it('renders an empty state when items is an empty array', () => {
    render(<PackageList intro="소개" items={[]} />);
    expect(screen.getByTestId('packages-empty')).toBeInTheDocument();
  });

  it('renders one card per package with price, base_total and discount_rate', () => {
    render(<PackageList intro="소개" items={items} />);

    expect(screen.getAllByTestId('package-card')).toHaveLength(2);
    expect(screen.getByText('380,000원')).toBeInTheDocument();
    expect(screen.getByText('400,000원')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders the includes array as a list', () => {
    render(<PackageList intro="소개" items={items} />);
    expect(screen.getByText('i1')).toBeInTheDocument();
    expect(screen.getByText('i2')).toBeInTheDocument();
    expect(screen.getAllByRole('list')).toHaveLength(2);
  });

  it('marks the featured package with an emphasis class', () => {
    render(<PackageList intro="소개" items={items} />);
    const cards = screen.getAllByTestId('package-card');
    expect(cards[0]).not.toHaveClass('pb-pkg-card--featured');
    expect(cards[1]).toHaveClass('pb-pkg-card--featured');
  });
});