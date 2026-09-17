import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import InquiryForm from '../../src/components/InquiryForm';

describe('inquiry layout component', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders the inquiry page with a working form', () => {
        render(<InquiryForm />);

        expect(screen.getByTestId('inquiry-form-page')).toBeInTheDocument();
        expect(screen.getByTestId('inquiry-form')).toBeInTheDocument();
    });

    it('states what can be asked about without requiring a finished plan', () => {
        render(<InquiryForm />);

        expect(screen.getByTestId('inquiry-form-page')).toHaveTextContent(
            '만들고 싶은 것과 현재 상황을 알려주세요.'
        );
        expect(screen.getByTestId('inquiry-form-page')).toHaveTextContent('아직 정리되지 않은 부분이 있어도 괜찮습니다.');
    });

    it('no longer shows the previous coming-soon notice', () => {
        render(<InquiryForm />);

        expect(screen.queryByTestId('coming-soon-notice')).not.toBeInTheDocument();
        expect(screen.queryByText(/준비 중입니다/)).not.toBeInTheDocument();
    });

    it('uses the five documented inquiry types', () => {
        render(<InquiryForm />);

        const select = screen.getByTestId('inquiry-select-type');
        const values = Array.from(select.querySelectorAll('option')).map((option) => option.getAttribute('value'));

        expect(values).toEqual(['', 'WEB', 'COMMERCE', 'INTERNAL_SYSTEM', 'SYSTEM_IMPROVEMENT', 'OTHER']);
    });

    it('does not publish a price bracket selector', () => {
        render(<InquiryForm />);

        expect(screen.queryByTestId(/budget/)).not.toBeInTheDocument();
        expect(screen.getByTestId('inquiry-form-page').textContent).not.toMatch(/만원|견적 금액|예산 구간/);
    });

    it('does not preselect the privacy consent checkbox', () => {
        render(<InquiryForm />);

        expect(screen.getByTestId('inquiry-input-privacy')).not.toBeChecked();
    });

    it('labels every input and connects it to its control', () => {
        render(<InquiryForm />);

        for (const id of [
            'inquiry-name',
            'inquiry-email',
            'inquiry-type',
            'inquiry-description',
            'inquiry-current-site',
            'inquiry-schedule',
            'inquiry-privacy',
        ]) {
            expect(document.querySelector(`label[for="${id}"]`)).not.toBeNull();
        }
    });
});
