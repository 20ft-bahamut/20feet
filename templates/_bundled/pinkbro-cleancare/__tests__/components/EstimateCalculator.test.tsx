import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EstimateCalculator } from '../../src/components/EstimateCalculator';
import type { ServiceItem } from '../../src/lib/types';

/** 브리프 더미 데이터 — 브랜드 문구가 아니라 테스트용 짧은 문자열/원문 가격 라벨 */
const services = [
  {
    slug: 'floor-care',
    title: '바닥 기계세척',
    tag: '',
    summary: '',
    criteria: '',
    base_price: '250,000원~',
    extra_note: '',
    photo: { url: null, alt: null },
  },
  {
    slug: 'glass-care',
    title: '유리창 세척',
    tag: '',
    summary: '',
    criteria: '',
    base_price: '100,000원~',
    extra_note: '',
    photo: { url: null, alt: null },
  },
  {
    slug: 'air-care',
    title: '에어컨 분해세척',
    tag: '',
    summary: '',
    criteria: '',
    base_price: '80,000원~',
    extra_note: '',
    photo: { url: null, alt: null },
    air_types: [
      { kind: '벽걸이 에어컨', price_label: '80,000원', price_value: 80000 },
      { kind: '스탠드 에어컨', price_label: '120,000원', price_value: 120000 },
      { kind: '천장형 1WAY', price_label: '100,000원', price_value: 100000 },
      {
        kind: '천장형 4WAY',
        price_label: '150,000원',
        price_value: 150000,
        default_selected: true,
      },
    ],
  },
] as unknown as ServiceItem[];

const steps = [
  { condition: '2개 항목', amount_label: '3%' },
  { condition: '3~4개 항목', amount_label: '5%' },
  { condition: '5개 이상', amount_label: '10%' },
];

describe('EstimateCalculator', () => {
  it('renders a skeleton when services is null', () => {
    render(
      <EstimateCalculator heading={null} sub={null} summaryHeading={null} summaryNote={null} services={null} steps={null} site={null} />,
    );
    expect(screen.getByTestId('estimate-skeleton')).toBeInTheDocument();
  });

  it('renders the section head and summary copy from props (estimator_*)', () => {
    render(
      <EstimateCalculator
        heading="섹션 제목"
        sub="섹션 보조 문구"
        summaryHeading="요약 제목"
        summaryNote="요약 안내 문구"
        services={services}
        steps={steps}
        site={null}
      />,
    );

    expect(screen.getByTestId('estimator-heading')).toHaveTextContent('섹션 제목');
    expect(screen.getByTestId('estimator-sub')).toHaveTextContent('섹션 보조 문구');
    expect(screen.getByTestId('estimator-summary-heading')).toHaveTextContent('요약 제목');
    expect(screen.getByTestId('estimator-summary-note')).toHaveTextContent('요약 안내 문구');
  });

  it('omits every copy slot that is null (no literal fallback text)', () => {
    render(
      <EstimateCalculator
        heading={null}
        sub={null}
        summaryHeading={null}
        summaryNote={null}
        services={services}
        steps={steps}
        site={null}
      />,
    );

    expect(screen.queryByTestId('estimator-heading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('estimator-sub')).not.toBeInTheDocument();
    expect(screen.queryByTestId('estimator-summary-heading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('estimator-summary-note')).not.toBeInTheDocument();
  });

  it('renders an empty state when services is an empty array', () => {
    render(
      <EstimateCalculator heading={null} sub={null} summaryHeading={null} summaryNote={null} services={[]} steps={steps} site={null} />,
    );
    expect(screen.getByTestId('estimate-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('estimate-skeleton')).not.toBeInTheDocument();
  });

  it('starts at zero', () => {
    render(
      <EstimateCalculator
        heading="h"
        sub="s"
        summaryHeading="m"
        summaryNote="n"
        services={services}
        steps={steps}
        site={null}
      />,
    );
    expect(screen.getByTestId('summary-count')).toHaveTextContent('0개');
    expect(screen.getByTestId('summary-base')).toHaveTextContent('0원');
    expect(screen.getByTestId('summary-final')).toHaveTextContent('0원');
  });

  it('adds up checked services and applies the 3% tier at two items', () => {
    render(
      <EstimateCalculator
        heading="h"
        sub="s"
        summaryHeading="m"
        summaryNote="n"
        services={services}
        steps={steps}
        site={null}
      />,
    );

    fireEvent.click(screen.getByLabelText('바닥 기계세척'));
    fireEvent.click(screen.getByLabelText('유리창 세척'));

    expect(screen.getByTestId('summary-count')).toHaveTextContent('2개');
    expect(screen.getByTestId('summary-base')).toHaveTextContent('350,000원');
    expect(screen.getByTestId('summary-discount')).toHaveTextContent('3%');
    expect(screen.getByTestId('summary-final')).toHaveTextContent('339,500원');
  });

  it('uses the selected air conditioner type price, defaulting to 4WAY', () => {
    render(
      <EstimateCalculator
        heading="h"
        sub="s"
        summaryHeading="m"
        summaryNote="n"
        services={services}
        steps={steps}
        site={null}
      />,
    );

    // 기본 선택이 4WAY(150,000) 이므로 체크만 하면 150,000 이 잡힌다
    fireEvent.click(screen.getByLabelText('에어컨 분해세척'));
    expect(screen.getByTestId('summary-base')).toHaveTextContent('150,000원');

    // select 를 벽걸이로 바꾸면 80,000 으로 바뀐다
    fireEvent.change(screen.getByLabelText('에어컨 종류'), {
      target: { value: '벽걸이 에어컨' },
    });
    expect(screen.getByTestId('summary-base')).toHaveTextContent('80,000원');
  });

  it('never renders an external image url', () => {
    const { container } = render(
      <EstimateCalculator
        heading="h"
        sub="s"
        summaryHeading="m"
        summaryNote="n"
        services={services}
        steps={steps}
        site={null}
      />,
    );
    expect(container.innerHTML).not.toMatch(/unsplash\.com/);
  });

  it('points the primary cta at the estimate anchor the layout provides', () => {
    const { container } = render(
      <EstimateCalculator
        heading="h"
        sub="s"
        summaryHeading="m"
        summaryNote="n"
        services={services}
        steps={steps}
        site={null}
      />,
    );

    expect(screen.getByRole('link', { name: '이 구성으로 견적 문의하기' })).toHaveAttribute(
      'href',
      '#estimate',
    );
    // 죽은 앵커(#inquiry)는 어디에도 남지 않는다
    expect(container.querySelectorAll('a[href="#inquiry"]')).toHaveLength(0);
  });
});