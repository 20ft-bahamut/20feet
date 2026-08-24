import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InquiryForm from '../../src/components/InquiryForm';

describe('InquiryForm component', () => {
    it('does not submit because no handler is wired', () => {
        render(<InquiryForm />);

        const form = screen.getByTestId('inquiry-form');
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

        fireEvent(form, submitEvent);

        // The internal guard calls preventDefault but the submit button remains disabled,
        // so the form is intentionally non-functional.
        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(screen.getByTestId('inquiry-submit-button')).toBeDisabled();
    });

    it('shows the coming soon state visibly', () => {
        render(<InquiryForm />);

        const notice = screen.getByTestId('coming-soon-notice');
        expect(notice).toBeVisible();
        expect(notice).toHaveTextContent(/준비 중입니다/i);
    });
});
