import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartSummary } from '../../src/components/CartSummary';

describe('CartSummary', () => {
    it('renders item count and formatted prices from calculation', () => {
        render(
            <CartSummary
                itemCount={3}
                calculation={{
                    subtotal: 15000,
                    shipping_fee: 3000,
                    total: 18000,
                }}
            />
        );
        expect(screen.getByTestId('cart-summary')).toBeInTheDocument();
        // Item count label
        expect(screen.getByText(/3개/)).toBeInTheDocument();
        // Total formatted (KRW no decimals)
        expect(screen.getByTestId('cart-summary-total').textContent).toContain('18,000');
    });

    it('prefers formatted strings when provided', () => {
        render(
            <CartSummary
                itemCount={1}
                calculation={{
                    subtotal_formatted: '₩9,000',
                    shipping_fee_formatted: '무료',
                    total_formatted: '₩9,000',
                }}
            />
        );
        expect(screen.getAllByText('₩9,000').length).toBeGreaterThan(0);
        expect(screen.getByText('무료')).toBeInTheDocument();
    });

    it('disables checkout button when itemCount is 0', () => {
        render(<CartSummary itemCount={0} />);
        const btn = screen.getByTestId('cart-summary-checkout');
        expect(btn).toBeDisabled();
    });

    it('calls onCheckout when provided', () => {
        const onCheckout = vi.fn();
        render(<CartSummary itemCount={2} onCheckout={onCheckout} />);
        fireEvent.click(screen.getByTestId('cart-summary-checkout'));
        expect(onCheckout).toHaveBeenCalled();
    });
});
