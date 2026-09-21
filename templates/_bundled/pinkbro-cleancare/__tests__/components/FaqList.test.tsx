import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FaqList } from '../../src/components/FaqList';

describe('FaqList', () => {
  it('renders native details/summary pairs (no javascript accordion)', () => {
    const { container } = render(
      <FaqList
        intro="소개"
        introSub={null} items={[
          { question: 'Q1', answer: 'A1' },
          { question: 'Q2', answer: 'A2' },
        ]}
      />,
    );
    expect(container.querySelectorAll('details')).toHaveLength(2);
    expect(container.querySelectorAll('summary')).toHaveLength(2);
    expect(screen.getByText('Q1')).toBeInTheDocument();
  });

  it('renders an empty state for an empty faq list', () => {
    render(<FaqList intro="소개" introSub={null} items={[]} />);
    expect(screen.getByTestId('faq-empty')).toBeInTheDocument();
  });

  it('renders a skeleton when items is null', () => {
    render(<FaqList intro={null} introSub={null} items={null} />);
    expect(screen.getByTestId('faq-skeleton')).toBeInTheDocument();
  });

  it('renders the answer text inside the matching details item', () => {
    render(<FaqList intro={null} introSub={null} items={[{ question: 'Q1', answer: 'A1' }]} />);
    expect(screen.getByText('A1')).toBeInTheDocument();
  });

  it('bolds the first sentence of each answer (원문 .faq-answer strong)', () => {
    const answer =
      '바닥 기계세척은 기본 250,000원부터 시작합니다. 데코타일, 20평 미만, 기본 오염 조건 기준입니다.';
    render(<FaqList intro={null} introSub={null} items={[{ question: 'Q1', answer }]} />);

    const lead = screen.getByTestId('faq-answer-lead');
    expect(lead.tagName).toBe('STRONG');
    expect(lead).toHaveTextContent('바닥 기계세척은 기본 250,000원부터 시작합니다.');
    // 나머지는 강조 밖 평문이다
    expect(lead.nextSibling?.textContent).toBe(
      ' 데코타일, 20평 미만, 기본 오염 조건 기준입니다.',
    );
    // 렌더된 텍스트가 저장값과 글자 단위로 같다 (강조는 표현만 바꾼다)
    expect(screen.getByTestId('faq-answer').textContent).toBe(answer);
  });

  it('renders a single-sentence answer plain — 감싸는 <strong> 을 만들지 않는다', () => {
    const answer = '문의는 카카오채널로 보내주세요.';
    const { container } = render(
      <FaqList intro={null} introSub={null} items={[{ question: 'Q1', answer }]} />,
    );

    expect(screen.queryByTestId('faq-answer-lead')).not.toBeInTheDocument();
    expect(container.querySelector('.pb-faq-answer strong')).toBeNull();
    expect(screen.getByTestId('faq-answer').textContent).toBe(answer);
  });

  it('renders an answer with no sentence boundary plain (다른 부호로 대신 나누지 않는다)', () => {
    const answer = '사진 첨부가 필요하신가요? 카카오채널로 보내주세요';
    const { container } = render(
      <FaqList intro={null} introSub={null} items={[{ question: 'Q1', answer }]} />,
    );

    expect(container.querySelector('.pb-faq-answer strong')).toBeNull();
    expect(screen.getByTestId('faq-answer').textContent).toBe(answer);
  });

  it('bolds the first sentence of every seeded answer without dropping text', () => {
    const items = [
      {
        question: 'Q1',
        answer:
          '유리창 세척은 기본 100,000원부터 시작합니다. 1층, 총 가로 10m × 높이 2m 이내입니다.',
      },
      {
        question: 'Q2',
        answer:
          '어느 지역까지 출장 가능한가요? 부산·울산·경남 전 지역을 기본 출장지역으로 안내합니다. 현장 위치에 따라 확인합니다.',
      },
    ];
    render(<FaqList intro={null} introSub={null} items={items} />);

    const answers = screen.getAllByTestId('faq-answer');
    expect(answers[0].querySelector('strong')?.textContent).toBe(
      '유리창 세척은 기본 100,000원부터 시작합니다.',
    );
    // 물음표는 경계가 아니다 — 첫 마침표에서 나뉜다
    expect(answers[1].querySelector('strong')?.textContent).toBe(
      '어느 지역까지 출장 가능한가요? 부산·울산·경남 전 지역을 기본 출장지역으로 안내합니다.',
    );
    expect(answers[0].textContent).toBe(items[0].answer);
    expect(answers[1].textContent).toBe(items[1].answer);
  });

  it('renders the intro copy as the section h2 heading (faq_intro)', () => {
    render(
      <FaqList
        eyebrow="FAQ"
        intro={'견적 전에 많이 묻는 내용을\n먼저 확인해 보세요.'}
        introSub="가격, 작업 기준, 출장지역처럼 상담 전에 가장 많이 확인하는 내용을 짧고 분명하게 정리했습니다."
        items={[{ question: 'Q1', answer: 'A1' }]}
      />,
    );

    const heading = screen.getByRole('heading', { level: 2, name: /견적 전에 많이 묻는 내용을/ });
    expect(heading).toHaveClass('pb-faq-h2');
    expect(screen.getByTestId('faq-heading')).toBe(heading);
    expect(screen.getByTestId('faq-eyebrow')).toHaveTextContent('FAQ');
    expect(screen.getByTestId('faq-eyebrow').className).toContain('pb-faq-eyebrow');
    expect(screen.getByTestId('faq-intro-sub')).toHaveTextContent(
      '상담 전에 가장 많이 확인하는 내용을 짧고 분명하게 정리했습니다.',
    );
  });

  it('omits the intro heading and sub copy when the keys are null', () => {
    render(<FaqList intro={null} introSub={null} items={[{ question: 'Q1', answer: 'A1' }]} />);
    expect(screen.queryByTestId('faq-heading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('faq-intro-sub')).not.toBeInTheDocument();
  });

  it('renders the source eyebrow only when its copy key is present (faq_eyebrow)', () => {
    const { unmount } = render(
      <FaqList eyebrow="FAQ" intro={null} introSub={null} items={[{ question: 'Q1', answer: 'A1' }]} />,
    );
    expect(screen.getByTestId('faq-eyebrow')).toHaveTextContent('FAQ');
    unmount();

    render(<FaqList eyebrow={null} intro={null} introSub={null} items={[{ question: 'Q1', answer: 'A1' }]} />);
    // 리터럴 `FAQ` 로 되돌아가지 않는다
    expect(screen.queryByTestId('faq-eyebrow')).not.toBeInTheDocument();
    expect(document.querySelector('.pb-faq-eyebrow')).toBeNull();
  });
});