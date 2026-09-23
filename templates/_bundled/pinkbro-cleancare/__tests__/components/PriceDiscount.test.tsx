import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PriceDiscount } from '../../src/components/PriceDiscount';

/**
 * PriceDiscount — 원문 #pricing(247~321행)의 section-head + notice-box 3블록.
 *
 * 이 컴포넌트에는 목록 데이터가 없다: 동시작업 할인 표는 원문 #package 의
 * .benefit-box(229~243행)에만 있고 PackageList 가 그린다(중복 렌더 제거).
 */
describe('PriceDiscount', () => {
  it('renders the section head copy (pricing_eyebrow / pricing_heading / pricing_sub)', () => {
    render(
      <PriceDiscount
        eyebrow="Pricing"
        heading={'가격은 투명하게,\n견적은 더 분명하게 안내합니다.'}
        sub="홈페이지에서는 기본 작업 기준가를 먼저 보여드립니다."
        notice={null}
        noticeLabel={null}
        noticeSub={null}
        field={null}
        flow={null}
        flowLabel={null}
      />,
    );

    const eyebrow = screen.getByTestId('pricing-eyebrow');
    expect(eyebrow).toHaveTextContent('Pricing');
    // 대시는 CSS ::before 이므로 요소 텍스트에는 섞이지 않는다
    expect(eyebrow.textContent).toBe('Pricing');
    // notice-c 의 Estimate Flow 라벨과 달리 대시를 갖는 변형이 아닌 쪽은 flowLabel 이다
    expect(eyebrow.className).not.toContain('pb-pricing-eyebrow--plain');

    const heading = screen.getByTestId('pricing-heading');
    expect(heading.tagName).toBe('H2');
    // 시더 값의 \n 은 <br> 요소로 렌더된다 — 날 newline 은 남지 않는다
    expect(heading.textContent).toBe('가격은 투명하게,견적은 더 분명하게 안내합니다.');
    expect(heading.querySelectorAll('br')).toHaveLength(1);
    expect(screen.getByTestId('pricing-sub')).toHaveTextContent('기본 작업 기준가를 먼저 보여드립니다');
  });

  it('omits the eyebrow when its copy key is null — 리터럴로 대체하지 않는다', () => {
    render(
      <PriceDiscount
        eyebrow={null}
        heading="가격 안내"
        sub={null}
        notice={null}
        noticeLabel={null}
        noticeSub={null}
        field={null}
        flow={null}
        flowLabel={null}
      />,
    );

    expect(screen.getByTestId('pricing-heading')).toBeInTheDocument();
    expect(screen.queryByTestId('pricing-eyebrow')).not.toBeInTheDocument();
  });

  it('renders the notice eyebrow from copy (pricing_notice_label)', () => {
    render(
      <PriceDiscount
        eyebrow={null}
        heading={null}
        sub={null}
        notice={'표기 금액은 모두\n기본 작업 기준가입니다.'}
        noticeLabel="Pricing Notice"
        noticeSub={null}
        field={null}
        flow={null}
        flowLabel={null}
      />,
    );

    const label = screen.getByTestId('pricing-notice-label');
    expect(label).toHaveTextContent('Pricing Notice');
    expect(label.className).toContain('pb-pricing-eyebrow');
  });

  it('omits the notice eyebrow when its copy key is null', () => {
    render(
      <PriceDiscount
        eyebrow={null}
        heading={null}
        sub={null}
        notice="표기 금액 안내"
        noticeLabel={null}
        noticeSub={null}
        field={null}
        flow={null}
        flowLabel={null}
      />,
    );

    expect(screen.getByText('표기 금액 안내')).toBeInTheDocument();
    expect(screen.queryByTestId('pricing-notice-label')).not.toBeInTheDocument();
  });

  it('hides notice and flow blocks when they are null', () => {
    const { container } = render(
      <PriceDiscount
        eyebrow={null}
        heading={null}
        sub={null}
        notice={null}
        noticeLabel={null}
        noticeSub={null}
        field={null}
        flow={null}
        flowLabel={null}
      />,
    );

    expect(container.querySelector('.pb-pricing-notice-a')).toBeNull();
    expect(container.querySelector('.pb-pricing-notice-b')).toBeNull();
    expect(container.querySelector('.pb-pricing-notice-c')).toBeNull();
    // 섹션 자체는 남는다 — 목록 데이터가 없으므로 스켈레톤/빈 상태도 없다
    expect(container.querySelector('.pb-pricing')).not.toBeNull();
  });

  it('renders the notice sub copy and the field block (pricing_notice_sub / pricing_field)', () => {
    const { container } = render(
      <PriceDiscount
        eyebrow={null}
        heading={null}
        sub={null}
        notice={'표기 금액은 모두\n기본 작업 기준가입니다.'}
        noticeLabel="Pricing Notice"
        noticeSub="대략적인 예산을 쉽게 가늠할 수 있도록 시작가를 먼저 공개합니다."
        field="확정 견적은 현장확인 원칙으로 진행합니다."
        flow={null}
        flowLabel={null}
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

  it('renders the stored <strong> markup of the field as an element — 리터럴 노출 금지 (원문 264행)', () => {
    const { container } = render(
      <PriceDiscount
        eyebrow={null}
        heading={null}
        sub={null}
        notice={null}
        noticeLabel={null}
        noticeSub={null}
        field="<strong>확정 견적은 현장확인 원칙</strong>으로 진행합니다."
        flow={null}
        flowLabel={null}
      />,
    );

    const strong = container.querySelector('[data-testid="pricing-field"] strong');
    expect(strong?.textContent).toBe('확정 견적은 현장확인 원칙');
    expect(screen.getByTestId('pricing-field')).toHaveTextContent(
      '확정 견적은 현장확인 원칙으로 진행합니다.',
    );
    // 태그 문자열이 화면 텍스트로 새어 나오지 않는다
    expect(screen.getByTestId('pricing-field').textContent).not.toContain('<strong>');
  });

  it('renders the flow label from copy instead of a literal (pricing_flow_label)', () => {
    render(
      <PriceDiscount
        eyebrow={null}
        heading={null}
        sub={null}
        notice={null}
        noticeLabel={null}
        noticeSub={null}
        field={null}
        flow={'기본가 확인\n→ 문의 접수\n→ 현장확인 후 확정견적'}
        flowLabel="Estimate Flow"
      />,
    );

    expect(screen.getByTestId('pricing-flow-label')).toHaveTextContent('Estimate Flow');
    expect(screen.getByText(/기본가 확인/)).toBeInTheDocument();
  });

  it('marks the flow eyebrow as the plain variant (원문 notice-c span — 대시 없음)', () => {
    render(
      <PriceDiscount
        eyebrow={null}
        heading={null}
        sub={null}
        notice={null}
        noticeLabel={null}
        noticeSub={null}
        field={null}
        flow="기본가 확인"
        flowLabel="Estimate Flow"
      />,
    );

    expect(screen.getByTestId('pricing-flow-label').className).toContain(
      'pb-pricing-eyebrow--plain',
    );
  });

  it('renders no discount-step table — 원문 #pricing(247~321행)에 할인 표가 없다', () => {
    const { container } = render(
      <PriceDiscount
        eyebrow="Pricing"
        heading="가격 안내"
        sub="보조 문구"
        notice="고지"
        noticeLabel="Pricing Notice"
        noticeSub="보조 고지"
        field="현장확인 원칙"
        flow="기본가 확인"
        flowLabel="Estimate Flow"
      />,
    );

    // 표는 PackageList(benefit_items)가 한 번만 그린다 — 여기에는 어떤 형태로도 없다
    expect(container.querySelector('.pb-pricing-steps')).toBeNull();
    expect(screen.queryByTestId('discount-step')).not.toBeInTheDocument();
    expect(screen.queryByTestId('discount-skeleton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('discount-empty')).not.toBeInTheDocument();
  });
});
