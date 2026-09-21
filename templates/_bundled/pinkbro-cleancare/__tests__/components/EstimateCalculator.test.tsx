import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  EstimateCalculator,
  type EstimateCalculatorProps,
} from '../../src/components/EstimateCalculator';
import type { ServiceItem, SiteData } from '../../src/lib/types';

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

/**
 * 원문 body.html 275·291·301~315행 그대로의 라벨 — 모듈 copy 도메인 키에 1:1 대응한다.
 * 컴포넌트가 리터럴을 갖지 않으므로 테스트가 이 값을 넘겨 주지 않으면 라벨은 사라진다.
 */
const LABELS = {
  eyebrow: 'Expected Estimate',
  summaryTotalLabel: 'Estimated Base Price',
  airLabel: '에어컨 종류 선택',
  rowCountLabel: '선택한 서비스',
  rowBaseLabel: '기본가 합계',
  rowDiscountLabel: '적용 할인',
  rowDiscountAmountLabel: '할인 금액',
  ctaSubmitLabel: '이 구성으로 견적 문의하기',
  ctaKakaoLabel: '카카오채널 문의하기',
};

/** 레이아웃이 바인딩하는 props 모양 그대로 — 개별 테스트는 필요한 슬롯만 덮어쓴다 */
function renderCalculator(overrides: Partial<EstimateCalculatorProps> = {}) {
  const props: EstimateCalculatorProps = {
    eyebrow: LABELS.eyebrow,
    heading: 'h',
    sub: 's',
    summaryHeading: 'm',
    summaryTotalLabel: LABELS.summaryTotalLabel,
    summaryNote: 'n',
    airLabel: LABELS.airLabel,
    rowCountLabel: LABELS.rowCountLabel,
    rowBaseLabel: LABELS.rowBaseLabel,
    rowDiscountLabel: LABELS.rowDiscountLabel,
    rowDiscountAmountLabel: LABELS.rowDiscountAmountLabel,
    ctaSubmitLabel: LABELS.ctaSubmitLabel,
    ctaKakaoLabel: LABELS.ctaKakaoLabel,
    services,
    steps,
    site: null,
    ...overrides,
  };

  return render(<EstimateCalculator {...props} />);
}

describe('EstimateCalculator', () => {
  it('renders a skeleton when services is null', () => {
    renderCalculator({ services: null, steps: null, site: null });
    expect(screen.getByTestId('estimate-skeleton')).toBeInTheDocument();
  });

  it('renders the section head and summary copy from props (estimator_*)', () => {
    renderCalculator({ heading: '섹션 제목', sub: '섹션 보조 문구', summaryHeading: '요약 제목', summaryNote: '요약 안내 문구' });

    expect(screen.getByTestId('estimator-heading')).toHaveTextContent('섹션 제목');
    expect(screen.getByTestId('estimator-sub')).toHaveTextContent('섹션 보조 문구');
    expect(screen.getByTestId('estimator-summary-heading')).toHaveTextContent('요약 제목');
    expect(screen.getByTestId('estimator-summary-note')).toHaveTextContent('요약 안내 문구');
  });

  it('omits every copy slot that is null (no literal fallback text)', () => {
    renderCalculator({
      eyebrow: null,
      heading: null,
      sub: null,
      summaryHeading: null,
      summaryTotalLabel: null,
      summaryNote: null,
      airLabel: null,
      rowCountLabel: null,
      rowBaseLabel: null,
      rowDiscountLabel: null,
      rowDiscountAmountLabel: null,
      ctaSubmitLabel: null,
      ctaKakaoLabel: null,
    });

    expect(screen.queryByTestId('estimator-heading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('estimator-sub')).not.toBeInTheDocument();
    expect(screen.queryByTestId('estimator-summary-heading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('estimator-summary-note')).not.toBeInTheDocument();
    expect(screen.queryByTestId('estimator-eyebrow')).not.toBeInTheDocument();
    expect(screen.queryByTestId('summary-final-label')).not.toBeInTheDocument();
    expect(screen.queryByTestId('estimator-row-count-label')).not.toBeInTheDocument();
    expect(screen.queryByTestId('estimator-row-base-label')).not.toBeInTheDocument();
    expect(screen.queryByTestId('estimator-row-discount-label')).not.toBeInTheDocument();
    expect(screen.queryByTestId('estimator-row-discount-amount-label')).not.toBeInTheDocument();
    expect(screen.queryByTestId('estimator-cta-submit')).not.toBeInTheDocument();

    // 금액 자체는 라벨과 무관하게 남는다 — 값은 데이터에서 온다
    expect(screen.getByTestId('summary-count')).toHaveTextContent('0개');
    expect(screen.getByTestId('summary-final')).toBeInTheDocument();
  });

  it('renders the source eyebrow only when its copy key is present (estimator_eyebrow)', () => {
    const { unmount } = renderCalculator({ eyebrow: 'Expected Estimate' });
    // 원문 section-head eyebrow — 대시(::before)는 CSS 이므로 요소 존재만 검증
    expect(screen.getByTestId('estimator-eyebrow')).toHaveTextContent('Expected Estimate');
    unmount();

    renderCalculator({ eyebrow: null });
    expect(screen.queryByTestId('estimator-eyebrow')).not.toBeInTheDocument();
  });

  it('renders the summary row labels and the total label from copy', () => {
    renderCalculator();

    expect(screen.getByTestId('estimator-row-count-label')).toHaveTextContent('선택한 서비스');
    expect(screen.getByTestId('estimator-row-base-label')).toHaveTextContent('기본가 합계');
    expect(screen.getByTestId('estimator-row-discount-label')).toHaveTextContent('적용 할인');
    expect(screen.getByTestId('estimator-row-discount-amount-label')).toHaveTextContent('할인 금액');
    // 원문 .summary-total b 라벨
    expect(screen.getByTestId('summary-final-label')).toHaveTextContent('Estimated Base Price');
  });

  it('renders an empty state when services is an empty array', () => {
    renderCalculator({ services: [], steps, site: null });
    expect(screen.getByTestId('estimate-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('estimate-skeleton')).not.toBeInTheDocument();
  });

  it('starts at zero', () => {
    renderCalculator();
    expect(screen.getByTestId('summary-count')).toHaveTextContent('0개');
    expect(screen.getByTestId('summary-base')).toHaveTextContent('0원');
    expect(screen.getByTestId('summary-final')).toHaveTextContent('0원');
  });

  it('adds up checked services and applies the 3% tier at two items', () => {
    renderCalculator();

    fireEvent.click(screen.getByLabelText('바닥 기계세척'));
    fireEvent.click(screen.getByLabelText('유리창 세척'));

    expect(screen.getByTestId('summary-count')).toHaveTextContent('2개');
    expect(screen.getByTestId('summary-base')).toHaveTextContent('350,000원');
    expect(screen.getByTestId('summary-discount')).toHaveTextContent('3%');
    expect(screen.getByTestId('summary-final')).toHaveTextContent('339,500원');
  });

  it('uses the selected air conditioner type price, defaulting to 4WAY', () => {
    renderCalculator();

    // 기본 선택이 4WAY(150,000) 이므로 체크만 하면 150,000 이 잡힌다
    fireEvent.click(screen.getByLabelText('에어컨 분해세척'));
    expect(screen.getByTestId('summary-base')).toHaveTextContent('150,000원');

    // select 를 벽걸이로 바꾸면 80,000 으로 바뀐다
    fireEvent.change(screen.getByLabelText('에어컨 종류 선택'), {
      target: { value: '벽걸이 에어컨' },
    });
    expect(screen.getByTestId('summary-base')).toHaveTextContent('80,000원');
  });

  it('never renders an external image url', () => {
    const { container } = renderCalculator();
    expect(container.innerHTML).not.toMatch(/unsplash\.com/);
  });

  it('points the primary cta at the estimate anchor the layout provides', () => {
    const { container } = renderCalculator();

    expect(screen.getByRole('link', { name: '이 구성으로 견적 문의하기' })).toHaveAttribute(
      'href',
      '#estimate',
    );
    // 죽은 앵커(#inquiry)는 어디에도 남지 않는다
    expect(container.querySelectorAll('a[href="#inquiry"]')).toHaveLength(0);
  });

  it('splits the final value into a big number and a small 원 unit (원문 .value 구조)', () => {
    renderCalculator();

    const value = screen.getByTestId('summary-final');
    expect(value.tagName).toBe('SPAN');
    expect(value.querySelector('small')).not.toBeNull();
    expect(value.textContent).toBe('0원');
  });

  it('styles the summary actions as real pill buttons (원문 .btn.primary / .btn.kakao)', () => {
    renderCalculator({
      site: {
        brand_name: null,
        brand_name_en: null,
        tagline: null,
        eyebrow: null,
        phone: null,
        kakao_channel: 'http://pf.kakao.com/_gmcuG',
        region: null,
        og_image_slot: null,
      } as SiteData,
    });

    const primary = screen.getByTestId('estimator-cta-submit');
    expect(primary).toHaveClass('pb-btn');
    expect(primary).toHaveClass('pb-estimate-btn-primary');
    expect(primary).toHaveTextContent('이 구성으로 견적 문의하기');

    const kakao = screen.getByTestId('estimator-cta-kakao');
    expect(kakao).toHaveClass('pb-btn');
    expect(kakao).toHaveClass('pb-btn--kakao');
    expect(kakao).toHaveTextContent('카카오채널 문의하기');
    expect(kakao).toHaveAttribute('href', 'http://pf.kakao.com/_gmcuG');
    expect(kakao).toHaveAttribute('target', '_blank');
  });

  it('omits the kakao cta when there is no channel or no label', () => {
    renderCalculator({ ctaKakaoLabel: null, site: null });
    expect(screen.queryByTestId('estimator-cta-kakao')).not.toBeInTheDocument();
  });

  it('uses the air-select label from copy (estimator_air_label)', () => {
    renderCalculator();

    // 원문 .air-select label — "에어컨 종류 선택" (select 는 air-care 선택 시 렌더된다)
    fireEvent.click(screen.getByLabelText('에어컨 분해세척'));
    expect(screen.getByLabelText('에어컨 종류 선택')).toBeInTheDocument();
    // 옵션 라벨은 종류 · 금액 형식을 유지한다
    expect(screen.getByRole('option', { name: '천장형 4WAY · 150,000원' })).toBeInTheDocument();
  });
});
