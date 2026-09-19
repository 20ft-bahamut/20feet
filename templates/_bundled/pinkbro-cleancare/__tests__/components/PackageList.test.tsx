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
    render(<PackageList intro={null} introSub={null} benefitHeading={null} benefitSub={null} benefitItems={null} media={null} items={null} />);
    expect(screen.getByTestId('packages-skeleton')).toBeInTheDocument();
  });

  it('renders an empty state when items is an empty array', () => {
    render(<PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null} benefitItems={null} media={null} items={[]} />);
    expect(screen.getByTestId('packages-empty')).toBeInTheDocument();
  });

  it('renders one card per package with price, base_total and discount_rate', () => {
    render(<PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null} benefitItems={null} media={null} items={items} />);

    expect(screen.getAllByTestId('package-card')).toHaveLength(2);
    expect(screen.getByText('380,000원')).toBeInTheDocument();
    expect(screen.getByText('400,000원')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders the includes array as a list', () => {
    render(<PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null} benefitItems={null} media={null} items={items} />);
    expect(screen.getByText('i1')).toBeInTheDocument();
    expect(screen.getByText('i2')).toBeInTheDocument();
    expect(screen.getAllByRole('list')).toHaveLength(2);
  });

  it('marks the featured package with an emphasis class', () => {
    render(<PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null} benefitItems={null} media={null} items={items} />);
    const cards = screen.getAllByTestId('package-card');
    expect(cards[0]).not.toHaveClass('pb-pkg-card--featured');
    expect(cards[1]).toHaveClass('pb-pkg-card--featured');
  });

  it('renders the section sub copy from the copy domain (package_intro_sub)', () => {
    render(
      <PackageList
        intro="도입 문구"
        introSub="첫인상, 주방, 공조환경까지 자주 선택하는 조합을 패키지 기준으로 정리했습니다."
        benefitHeading={null}
        benefitSub={null}
        benefitItems={null}
        media={null}
        items={items}
      />,
    );
    expect(screen.getByTestId('packages-intro-sub')).toHaveTextContent(
      '패키지 기준으로 정리했습니다',
    );
  });

  it('renders the multi-service benefit table from benefit_* copy', () => {
    render(
      <PackageList
        intro="도입 문구"
        introSub={null}
        benefitHeading={'같은 매장, 같은 일정이라면\n함께 맡길수록 더 효율적입니다.'}
        benefitSub="서비스 종류 기준으로 항목을 계산합니다."
        benefitItems={[
          { condition: '1개 항목', amount_label: '정상가' },
          { condition: '2개 항목', amount_label: '3%' },
          { condition: '3~4개 항목', amount_label: '5%' },
          { condition: '5개 이상', amount_label: '10%' },
        ]}
        media={null}
        items={items}
      />,
    );

    expect(screen.getByTestId('benefit-box')).toBeInTheDocument();
    expect(screen.getByTestId('benefit-heading')).toHaveTextContent('함께 맡길수록 더 효율적입니다.');
    expect(screen.getByTestId('benefit-sub')).toHaveTextContent('서비스 종류 기준으로');
    // 원문 benefit-grid 는 4행(1개 항목 정상가 포함)이다
    const rows = screen.getAllByTestId('benefit-item');
    expect(rows).toHaveLength(4);
    expect(rows[0]).toHaveTextContent('1개 항목');
    expect(rows[0]).toHaveTextContent('정상가');
    expect(rows[3]).toHaveTextContent('5개 이상');
    expect(rows[3]).toHaveTextContent('10%');
  });

  it('omits the benefit box when no benefit copy and no rows are given', () => {
    render(
      <PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null}
        benefitItems={null} media={null} items={items} />,
    );
    expect(screen.queryByTestId('benefit-box')).not.toBeInTheDocument();
  });

  it('renders the stage image from the package_stage media slot when the admin uploaded one', () => {
    render(
      <PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null}
        benefitItems={null} items={items}
        media={{ package_stage: { url: '/uploads/package.webp', alt: '패키지' } }} />,
    );

    const img = screen.getByTestId('package-stage-media');
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', '/uploads/package.webp');
    expect(img).toHaveAttribute('alt', '패키지');
    expect(screen.queryByTestId('package-stage-fallback')).not.toBeInTheDocument();
  });

  it('falls back to the neutral css block when package_stage is empty or media is null', () => {
    const { unmount } = render(
      <PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null}
        benefitItems={null} items={items}
        media={{ package_stage: { url: null, alt: null } }} />,
    );
    expect(screen.getByTestId('package-stage-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('package-stage-media')).not.toBeInTheDocument();
    unmount();

    render(
      <PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null}
        benefitItems={null} items={items} media={null} />,
    );
    expect(screen.getByTestId('package-stage-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('package-stage-media')).not.toBeInTheDocument();
  });
});