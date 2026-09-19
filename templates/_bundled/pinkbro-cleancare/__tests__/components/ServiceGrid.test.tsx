import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ServiceGrid } from '../../src/components/ServiceGrid';

describe('ServiceGrid', () => {
  it('renders a skeleton when items is null', () => {
    render(<ServiceGrid intro={null} items={null} introSub={null} detailLabel={null} extraHeading={null} extraBody={null} media={null} />);
    expect(screen.getByTestId('services-skeleton')).toBeInTheDocument();
  });

  it('renders an empty state when items is an empty array', () => {
    render(<ServiceGrid intro="소개" items={[]} introSub={null} detailLabel={null} extraHeading={null} extraBody={null} media={null} />);
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
    render(<ServiceGrid intro="소개" items={items} introSub={null} detailLabel={null} extraHeading={null} extraBody={null} media={null} />);

    expect(screen.getByText('바닥 기계세척')).toBeInTheDocument();
    expect(screen.getByText('250,000원~')).toBeInTheDocument();
    expect(screen.getAllByTestId('service-card')).toHaveLength(2);
  });

  it('falls back to a css block per card when the photo slot is empty', () => {
    const items = [{ slug: 'a', title: 'A', tag: 'T', summary: 's', criteria: 'c',
      base_price: '1원~', extra_note: 'n', photo: { url: null, alt: null } }];
    render(<ServiceGrid intro="i" items={items} introSub={null} detailLabel={null} extraHeading={null} extraBody={null} media={null} />);
    expect(screen.getByTestId('service-photo-fallback')).toBeInTheDocument();
  });

  it('uses the bundled template asset for a known service when no slot is uploaded', () => {
    const item = { slug: 'floor-care', title: '바닥 기계세척', tag: 'Floor Care', summary: 's',
      criteria: 'c', base_price: '250,000원~', extra_note: 'n', photo: { url: null, alt: null } };
    render(<ServiceGrid intro="i" items={[item]} introSub={null} detailLabel={null} extraHeading={null} extraBody={null} media={null} />);
    expect(screen.getByTestId('service-photo').getAttribute('src'))
      .toContain('/api/templates/assets/pinkbro-cleancare?file=images/service-floor-care.webp');
  });

  it('prefers the uploaded slot image over the bundled asset', () => {
    const item = { slug: 'floor-care', title: '바닥 기계세척', tag: 'Floor Care', summary: 's',
      criteria: 'c', base_price: '250,000원~', extra_note: 'n', photo: { url: null, alt: null } };
    render(<ServiceGrid intro="i" items={[item]}
      introSub={null} detailLabel={null} extraHeading={null} extraBody={null} media={{ services_floor: { url: '/up.webp', alt: '현장' } }} />);
    expect(screen.getByTestId('service-photo')).toHaveAttribute('src', '/up.webp');
  });

  it('never renders an external image url', () => {
    const item = { slug: 'floor-care', title: 'T', tag: 'T', summary: 's', criteria: 'c',
      base_price: '1원~', extra_note: 'n', photo: { url: null, alt: null } };
    const { container } = render(<ServiceGrid intro="i" items={[item]} introSub={null} detailLabel={null} extraHeading={null} extraBody={null} media={null} />);
    expect(container.innerHTML).not.toMatch(/unsplash\.com/);
  });

  it('renders the section sub copy and the extra-box copy from props', () => {
    const item = { slug: 'floor-care', title: '바닥 기계세척', tag: 'Floor Care', summary: 's',
      criteria: 'c', base_price: '1원~', extra_note: 'n', photo: { url: null, alt: null } };
    render(
      <ServiceGrid
        intro="도입 문구"
        introSub="서비스별 기본 작업 조건과 시작가를 먼저 확인할 수 있습니다."
        detailLabel="자세한 작업기준 확인"
        extraHeading="찾으시는 서비스가 목록에 없나요?"
        extraBody="메인에 안내된 항목 외에도 문의해 주세요."
        items={[item]}
        media={null}
      />,
    );

    expect(screen.getByTestId('services-intro-sub')).toHaveTextContent(
      '서비스별 기본 작업 조건과 시작가를 먼저 확인할 수 있습니다.',
    );
    expect(screen.getByTestId('extra-box-heading')).toHaveTextContent(
      '찾으시는 서비스가 목록에 없나요?',
    );
    expect(screen.getByTestId('extra-box-body')).toHaveTextContent(
      '메인에 안내된 항목 외에도 문의해 주세요.',
    );
  });

  it('uses the detail label as the summary label of each service card', () => {
    const item = { slug: 'floor-care', title: '바닥 기계세척', tag: 'Floor Care', summary: 's',
      criteria: '기준 본문', base_price: '1원~', extra_note: 'n', photo: { url: null, alt: null } };
    const { container } = render(
      <ServiceGrid intro={null} introSub={null} detailLabel="자세한 작업기준 확인"
        extraHeading={null} extraBody={null} items={[item]} media={null} />,
    );

    const summary = container.querySelector('.pb-service-detail summary');
    expect(summary).toHaveTextContent('자세한 작업기준 확인');
    expect(summary).toHaveAttribute('aria-label', '기준 본문');
  });

  it('omits the extra box, the sub copy and the detail label when their keys are null', () => {
    const item = { slug: 'floor-care', title: 'T', tag: 'T', summary: 's', criteria: 'c',
      base_price: '1원~', extra_note: 'n', photo: { url: null, alt: null } };
    const { container } = render(
      <ServiceGrid intro={null} introSub={null} detailLabel={null} extraHeading={null}
        extraBody={null} items={[item]} media={null} />,
    );

    expect(screen.queryByTestId('extra-box')).not.toBeInTheDocument();
    expect(screen.queryByTestId('services-intro-sub')).not.toBeInTheDocument();
    expect(container.querySelector('.pb-service-detail summary')).toHaveTextContent('＋');
  });
});