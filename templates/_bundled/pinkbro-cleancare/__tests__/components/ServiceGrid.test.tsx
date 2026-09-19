import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ServiceGrid } from '../../src/components/ServiceGrid';

describe('ServiceGrid', () => {
  it('renders a skeleton when items is null', () => {
    render(<ServiceGrid intro={null} items={null} media={null} />);
    expect(screen.getByTestId('services-skeleton')).toBeInTheDocument();
  });

  it('renders an empty state when items is an empty array', () => {
    render(<ServiceGrid intro="소개" items={[]} media={null} />);
    expect(screen.getByTestId('services-empty')).toBeInTheDocument();
  });

  it('renders one card per service item with price and criteria', () => {
    const items = [
      { slug: 'floor-care', title: '바닥 기계세척', tag: 'Floor Care', summary: '요약',
        criteria: '기준', base_price: '250,000원~', extra_note: '데코타일 기준',
        photo: { url: null, alt: null } },
      { slug: 'glass-care', title: '유리창 세척', tag: 'Glass Care', summary: '요약2',
        criteria: '기준2', base_price: '100,000원~', extra_note: '1층 기준',
        photo: { url: '/g.webp', alt: '유리' } },
    ];
    render(<ServiceGrid intro="소개" items={items} media={null} />);

    expect(screen.getByText('바닥 기계세척')).toBeInTheDocument();
    expect(screen.getByText('250,000원~')).toBeInTheDocument();
    expect(screen.getAllByTestId('service-card')).toHaveLength(2);
  });

  it('falls back to a css block per card when the photo slot is empty', () => {
    const items = [{ slug: 'a', title: 'A', tag: 'T', summary: 's', criteria: 'c',
      base_price: '1원~', extra_note: 'n', photo: { url: null, alt: null } }];
    render(<ServiceGrid intro="i" items={items} media={null} />);
    expect(screen.getByTestId('service-photo-fallback')).toBeInTheDocument();
  });

  it('uses the bundled template asset for a known service when no slot is uploaded', () => {
    const item = { slug: 'floor-care', title: '바닥 기계세척', tag: 'Floor Care', summary: 's',
      criteria: 'c', base_price: '250,000원~', extra_note: 'n', photo: { url: null, alt: null } };
    render(<ServiceGrid intro="i" items={[item]} media={null} />);
    expect(screen.getByTestId('service-photo').getAttribute('src'))
      .toContain('/api/templates/assets/pinkbro-cleancare?file=images/service-floor-care.webp');
  });

  it('prefers the uploaded slot image over the bundled asset', () => {
    const item = { slug: 'floor-care', title: '바닥 기계세척', tag: 'Floor Care', summary: 's',
      criteria: 'c', base_price: '250,000원~', extra_note: 'n', photo: { url: null, alt: null } };
    render(<ServiceGrid intro="i" items={[item]}
      media={{ services_floor: { url: '/up.webp', alt: '현장' } }} />);
    expect(screen.getByTestId('service-photo')).toHaveAttribute('src', '/up.webp');
  });

  it('never renders an external image url', () => {
    const item = { slug: 'floor-care', title: 'T', tag: 'T', summary: 's', criteria: 'c',
      base_price: '1원~', extra_note: 'n', photo: { url: null, alt: null } };
    const { container } = render(<ServiceGrid intro="i" items={[item]} media={null} />);
    expect(container.innerHTML).not.toMatch(/unsplash\.com/);
  });
});