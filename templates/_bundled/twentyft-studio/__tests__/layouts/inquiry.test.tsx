import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InquiryForm from '../../src/components/InquiryForm';

describe('inquiry layout component', () => {
    it('renders the inquiry form layout', () => {
        render(<InquiryForm />);

        expect(screen.getByTestId('inquiry-form-page')).toBeInTheDocument();
        expect(screen.getByTestId('inquiry-form')).toBeInTheDocument();
    });

    it('form inputs are disabled', () => {
        render(<InquiryForm />);

        expect(screen.getByTestId('inquiry-input-name')).toBeDisabled();
        expect(screen.getByTestId('inquiry-input-email')).toBeDisabled();
        expect(screen.getByTestId('inquiry-select-type')).toBeDisabled();
        expect(screen.getByTestId('inquiry-textarea-message')).toBeDisabled();
        expect(screen.getByTestId('inquiry-submit-button')).toBeDisabled();
    });

    it('displays a coming soon notice', () => {
        render(<InquiryForm />);

        expect(screen.getByTestId('coming-soon-notice')).toBeInTheDocument();
    });
});
