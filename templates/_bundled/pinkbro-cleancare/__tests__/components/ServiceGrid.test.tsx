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

  it('renders one card per service item with a split price and criteria', () => {
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
    // 원문 .price-row — 숫자(Manrope 34px)와 단위 span(Noto 15px)으로 나눠 렌더한다
    expect(screen.getByText('250,000')).toBeInTheDocument();
    expect(screen.getAllByText('원~')).toHaveLength(2);
    expect(screen.getAllByTestId('service-card')).toHaveLength(2);
  });

  it('renders a price without a trailing unit as a single amount', () => {
    const items = [{ slug: 'floor-care', title: 'A', tag: 'T', summary: 's',
      criteria: 'c', base_price: '250,000', extra_note: 'n', photo: { url: null, alt: null } }];
    render(<ServiceGrid intro={null} items={items} introSub={null} detailLabel={null} extraHeading={null} extraBody={null} media={null} />);
    expect(screen.getByText('250,000')).toBeInTheDocument();
    expect(screen.queryByText('원~')).not.toBeInTheDocument();
  });

  it('renders the section head as a heading with the sub copy on the side', () => {
    const items = [{ slug: 'floor-care', title: 'A', tag: 'T', summary: 's',
      criteria: 'c', base_price: '1원~', extra_note: 'n', photo: { url: null, alt: null } }];
    render(
      <ServiceGrid
        intro={'F&B 매장의 핵심 관리 영역을\n한 곳에서 함께 관리합니다.'}
        introSub="서비스별 기본 작업 조건과 시작가를 먼저 확인할 수 있습니다."
        detailLabel={null}
        extraHeading={null}
        extraBody={null}
        items={items}
        media={null}
      />,
    );

    const title = screen.getByTestId('services-title');
    expect(title.tagName).toBe('H2');
    expect(title).toHaveTextContent('F&B 매장의 핵심 관리 영역을');
    expect(screen.getByTestId('services-intro-sub')).toHaveTextContent(
      '서비스별 기본 작업 조건과 시작가를 먼저 확인할 수 있습니다.',
    );
  });

  it('renders the eyebrow only when its prop is provided', () => {
    const items = [{ slug: 'floor-care', title: 'A', tag: 'T', summary: 's',
      criteria: 'c', base_price: '1원~', extra_note: 'n', photo: { url: null, alt: null } }];
    const { rerender } = render(
      <ServiceGrid intro="제목" introSub={null} eyebrow="Core Service" detailLabel={null}
        extraHeading={null} extraBody={null} items={items} media={null} />,
    );
    expect(screen.getByTestId('services-eyebrow')).toHaveTextContent('Core Service');

    rerender(
      <ServiceGrid intro="제목" introSub={null} eyebrow={null} detailLabel={null}
        extraHeading={null} extraBody={null} items={items} media={null} />,
    );
    expect(screen.queryByTestId('services-eyebrow')).not.toBeInTheDocument();
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

  it('renders the extra-box copy and its CTA from props', () => {
    const item = { slug: 'floor-care', title: '바닥 기계세척', tag: 'Floor Care', summary: 's',
      criteria: 'c', base_price: '1원~', extra_note: 'n', photo: { url: null, alt: null } };
    render(
      <ServiceGrid
        intro="도입 문구"
        introSub="서비스별 기본 작업 조건과 시작가를 먼저 확인할 수 있습니다."
        detailLabel="자세한 작업기준 확인"
        extraHeading="찾으시는 서비스가 목록에 없나요?"
        extraBody="메인에 안내된 항목 외에도 문의해 주세요."
        extraCtaLabel="기타 서비스 문의하기"
        extraCtaHref="#estimate"
        items={[item]}
        media={null}
      />,
    );

    expect(screen.getByTestId('extra-box-heading')).toHaveTextContent(
      '찾으시는 서비스가 목록에 없나요?',
    );
    expect(screen.getByTestId('extra-box-body')).toHaveTextContent(
      '메인에 안내된 항목 외에도 문의해 주세요.',
    );
    const cta = screen.getByTestId('extra-box-cta');
    expect(cta).toHaveTextContent('기타 서비스 문의하기');
    expect(cta).toHaveAttribute('href', '#estimate');
  });

  it('omits the extra-box CTA when its label prop is missing', () => {
    const item = { slug: 'floor-care', title: 'T', tag: 'T', summary: 's', criteria: 'c',
      base_price: '1원~', extra_note: 'n', photo: { url: null, alt: null } };
    render(
      <ServiceGrid intro={null} introSub={null} detailLabel={null} extraHeading="제목"
        extraBody="본문" items={[item]} media={null} />,
    );
    expect(screen.getByTestId('extra-box')).toBeInTheDocument();
    expect(screen.queryByTestId('extra-box-cta')).not.toBeInTheDocument();
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
    // 원문 .detail summary — 라벨이 왼쪽, ＋ 마커가 오른쪽이다
    const marker = summary?.querySelector('.pb-service-detail-marker');
    expect(marker).not.toBeNull();
    expect(summary?.firstChild?.textContent).toBe('자세한 작업기준 확인');
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