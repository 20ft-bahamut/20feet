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
        // Item count label (plain number, no Korean counter)
        expect(screen.getByText('3')).toBeInTheDocument();
        // Total formatted (KRW no decimals)
        expect(screen.getByTestId('cart-summary-total').textContent).toContain('18,000');
    });

    it('prefers formatted strings when provided', () => {
        render(
            <CartSummary
                itemCount={1}
                calculation={{
                    subtotal_formatted: '₩9,000',
                    shipping_fee: 0,
                    total_formatted: '₩9,000',
                }}
            />
        );
        expect(screen.getAllByText('₩9,000').length).toBeGreaterThan(0);
        // shipping is 0 — row should be omitted, no '—' or '₩0' shown
        expect(screen.queryByText('₩0')).not.toBeInTheDocument();
    });

    it('hides shipping row when total_shipping is 0', () => {
        render(
            <CartSummary
                itemCount={2}
                calculation={{
                    subtotal: 20000,
                    total_shipping: 0,
                    final_amount: 20000,
                    final_amount_formatted: '₩20,000',
                }}
            />
        );
        expect(screen.getByTestId('cart-summary-total').textContent).toContain('20,000');
        // No shipping row (no '₩0' or '—')
        expect(screen.queryByText('₩0')).not.toBeInTheDocument();
    });

    it('shows shipping row when total_shipping > 0', () => {
        render(
            <CartSummary
                itemCount={1}
                calculation={{
                    subtotal: 10000,
                    total_shipping: 2500,
                    shipping_fee_formatted: '₩2,500',
                    final_amount: 12500,
                    final_amount_formatted: '₩12,500',
                }}
            />
        );
        expect(screen.getByText('₩2,500')).toBeInTheDocument();
        expect(screen.getByTestId('cart-summary-total').textContent).toContain('12,500');
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
