import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProcessPage from '../../src/components/ProcessPage';
import { FAQ_ITEMS, PROCESS_STEPS } from '../../src/content/process';

describe('process page', () => {
    it('renders every step from the shared definition', () => {
        render(<ProcessPage />);

        for (let index = 0; index < PROCESS_STEPS.length; index += 1) {
            expect(screen.getByTestId(`process-step-${index}`)).toBeInTheDocument();
        }
    });

    it('describes each step with one sentence for the customer', () => {
        const { container } = render(<ProcessPage />);
        const text = container.textContent ?? '';

        expect(text).toContain('제작 목적과 필요한 기능, 현재 사이트나 업무 상황을 듣습니다.');
        expect(text).toContain('합의한 내용을 바탕으로 제작하고 중간 결과물을 확인합니다.');
        // 내부 작업 목록은 고객 산출물이 아니므로 화면에 두지 않는다.
        expect(text).not.toContain('고객이 알려줄 것');
        expect(text).not.toContain('이십피트가 정리할 것');
        expect(text).not.toContain('상담 메모');
    });

    it('does not explain the obvious about sending an inquiry', () => {
        const { container } = render(<ProcessPage />);

        expect(container.textContent).not.toContain('확정된 상태가 아니어도');
    });

    it('never says a scope is not promised', () => {
        const { container } = render(<ProcessPage />);

        expect(container.textContent).not.toContain('약속하지 않습니다');
        expect(container.textContent).not.toContain('약속하지는 않습니다');
    });

    it('renders the four documented FAQ answers', () => {
        render(<ProcessPage />);

        const rendered = screen.getAllByTestId('process-faq-item');
        expect(rendered).toHaveLength(FAQ_ITEMS.length);
        expect(screen.getByText('기획서가 없어도 문의할 수 있나요?')).toBeInTheDocument();
        expect(screen.getByText('오픈 후 관리도 포함되나요?')).toBeInTheDocument();
    });

    it('avoids unverified service promises', () => {
        const { container } = render(<ProcessPage />);
        const text = container.textContent ?? '';

        expect(text).not.toMatch(/무료\s*(수정|보수|유지)|무제한|24시간 이내|100%|최저가|원스톱/);
    });

    it('ends with an inquiry call to action', () => {
        render(<ProcessPage />);

        expect(screen.getByTestId('process-inquiry-cta')).toHaveAttribute('href', '/inquiry');
    });
});
