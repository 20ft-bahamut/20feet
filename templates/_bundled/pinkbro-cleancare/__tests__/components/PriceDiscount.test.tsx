import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PriceDiscount } from '../../src/components/PriceDiscount';

describe('PriceDiscount', () => {
  it('renders a skeleton when steps is null', () => {
    render(<PriceDiscount notice={null} flow={null} heading={null} sub={null} noticeSub={null} field={null} flowLabel={null} steps={null} />);
    expect(screen.getByTestId('discount-skeleton')).toBeInTheDocument();
  });

  it('renders each discount step with condition and amount', () => {
    render(
      <PriceDiscount
        notice="안내"
        flow="흐름"
        heading={null} sub={null} noticeSub={null} field={null} flowLabel={null} steps={[
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

  it('orders each step condition-first and amount-second (원문 .benefit-item 순서)', () => {
    render(
      <PriceDiscount
        notice={null}
        flow={null}
        heading={null} sub={null} noticeSub={null} field={null} flowLabel={null}
        steps={[{ condition: '2개 항목', amount_label: '3%' }]}
      />,
    );

    const step = screen.getByTestId('discount-step');
    const condition = step.querySelector('.pb-pricing-step-condition');
    const amount = step.querySelector('.pb-pricing-step-amount');
    expect(condition).not.toBeNull();
    expect(amount).not.toBeNull();
    // 원문 benefit-item — small(조건) 이 strong(금액) 보다 먼저 온다
    expect(condition!.compareDocumentPosition(amount!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders the source "Pricing" eyebrow above the heading (원문 복원)', () => {
    render(
      <PriceDiscount
        heading="가격은 투명하게,\n견적은 더 분명하게 안내합니다."
        sub={null}
        notice={null} noticeSub={null} field={null} flow={null} flowLabel={null} steps={[]}
      />,
    );

    const eyebrow = screen.getByTestId('pricing-eyebrow');
    expect(eyebrow).toHaveTextContent('Pricing');
    // 대시는 CSS ::before 이므로 요소 텍스트에는 섞이지 않는다
    expect(eyebrow.textContent).toBe('Pricing');
    // notice-c 의 Estimate Flow 라벨과 달리 대시를 갖는 변형이 아니다
    expect(eyebrow.className).not.toContain('pb-pricing-eyebrow--plain');
  });

  it('renders an empty state for an empty steps list', () => {
    render(<PriceDiscount notice={null} flow={null} heading={null} sub={null} noticeSub={null} field={null} flowLabel={null} steps={[]} />);
    expect(screen.getByTestId('discount-empty')).toBeInTheDocument();
  });

  it('hides notice and flow blocks when they are null', () => {
    const { container } = render(
      <PriceDiscount notice={null} flow={null} heading={null} sub={null} noticeSub={null} field={null} flowLabel={null} steps={[]} />,
    );
    expect(container.querySelector('.pb-pricing-notice-a')).toBeNull();
    expect(container.querySelector('.pb-pricing-notice-c')).toBeNull();
  });

  it('renders the section head copy (pricing_heading / pricing_sub)', () => {
    render(
      <PriceDiscount
        heading={'가격은 투명하게,\n견적은 더 분명하게 안내합니다.'}
        sub="홈페이지에서는 기본 작업 기준가를 먼저 보여드립니다."
        notice={null}
        noticeSub={null}
        field={null}
        flow={null}
        flowLabel={null}
        steps={[]}
      />,
    );

    const heading = screen.getByTestId('pricing-heading');
    expect(heading.tagName).toBe('H2');
    expect(heading.textContent).toBe('가격은 투명하게,\n견적은 더 분명하게 안내합니다.');
    expect(screen.getByTestId('pricing-sub')).toHaveTextContent('기본 작업 기준가를 먼저 보여드립니다');
  });

  it('renders the notice sub copy and the field block (pricing_notice_sub / pricing_field)', () => {
    const { container } = render(
      <PriceDiscount
        heading={null}
        sub={null}
        notice={'표기 금액은 모두\n기본 작업 기준가입니다.'}
        noticeSub="대략적인 예산을 쉽게 가늠할 수 있도록 시작가를 먼저 공개합니다."
        field="확정 견적은 현장확인 원칙으로 진행합니다."
        flow={null}
        flowLabel={null}
        steps={[]}
      />,
    );

    expect(screen.getByTestId('pricing-notice-sub')).toHaveTextContent(
      '시작가를 먼저 공개합니다',
    );
    expect(container.querySelector('.pb-pricing-notice-b')).not.toBeNull();
    expect(screen.getByTestId('pricing-field')).toHaveTextContent(
      '확정 견적은 현장확인 원칙으로 진행합니다.',
    );
  });

  it('renders the flow label from copy instead of a literal (pricing_flow_label)', () => {
    render(
      <PriceDiscount
        heading={null}
        sub={null}
        notice={null}
        noticeSub={null}
        field={null}
        flow={'기본가 확인\n→ 문의 접수\n→ 현장확인 후 확정견적'}
        flowLabel="Estimate Flow"
        steps={[]}
      />,
    );

    expect(screen.getByTestId('pricing-flow-label')).toHaveTextContent('Estimate Flow');
    expect(screen.getByText(/기본가 확인/)).toBeInTheDocument();
  });

  it('marks the flow eyebrow as the plain variant (원문 notice-c span — 대시 없음)', () => {
    render(
      <PriceDiscount
        heading={null}
        sub={null}
        notice={null}
        noticeSub={null}
        field={null}
        flow="기본가 확인"
        flowLabel="Estimate Flow"
        steps={[]}
      />,
    );

    expect(screen.getByTestId('pricing-flow-label').className).toContain(
      'pb-pricing-eyebrow--plain',
    );
  });
});