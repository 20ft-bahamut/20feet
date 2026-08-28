import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddToCartPanel } from '../../src/components/AddToCartPanel';

describe('AddToCartPanel', () => {
    beforeEach(() => {
        // Each test starts with a clean slate
    });

    it('renders quantity stepper and CTAs when on sale', () => {
        render(<AddToCartPanel productId={7} productName="Demo" salesStatus="on_sale" />);
        expect(screen.getByTestId('add-to-cart-panel')).toBeInTheDocument();
        expect(screen.getByTestId('quantity-input')).toHaveValue(1);
        expect(screen.getByTestId('add-to-cart')).toBeInTheDocument();
        expect(screen.getByTestId('buy-now')).toBeInTheDocument();
    });

    it('disables CTAs and shows sold-out label when sold out', () => {
        render(
            <AddToCartPanel
                productId={7}
                salesStatus="sold_out"
                soldOutLabel="SOLD OUT"
            />
        );
        const addBtn = screen.getByTestId('add-to-cart');
        expect(addBtn).toBeDisabled();
        expect(addBtn.textContent).toContain('SOLD OUT');
        // No buy-now when not on sale
        expect(screen.queryByTestId('buy-now')).toBeNull();
    });

    it('increments and decrements quantity within bounds', () => {
        render(<AddToCartPanel productId={7} salesStatus="on_sale" minQuantity={1} maxQuantity={5} />);
        const input = screen.getByTestId('quantity-input') as HTMLInputElement;
        const inc = screen.getByLabelText('increase quantity');
        const dec = screen.getByLabelText('decrease quantity');
        fireEvent.click(inc);
        fireEvent.click(inc);
        expect(input.value).toBe('3');
        fireEvent.click(dec);
        expect(input.value).toBe('2');
        fireEvent.click(dec);
        fireEvent.click(dec);
        expect(input.value).toBe('1');
        // Decrement past min clamps to min
        fireEvent.click(dec);
        expect(input.value).toBe('1');
    });

    it('dispatches scm:add-to-cart event with productId/quantity/mode', () => {
        const listener = vi.fn();
        window.addEventListener('scm:add-to-cart', listener as EventListener);
        render(<AddToCartPanel productId={42} productName="Pen" salesStatus="on_sale" />);
        fireEvent.click(screen.getByTestId('add-to-cart'));
        expect(listener).toHaveBeenCalled();
        const evt = listener.mock.calls[0][0] as CustomEvent;
        expect(evt.detail.productId).toBe(42);
        expect(evt.detail.quantity).toBe(1);
        expect(evt.detail.mode).toBe('add');
        window.removeEventListener('scm:add-to-cart', listener as EventListener);
    });

    it('buy-now dispatches mode=buy', () => {
        const listener = vi.fn();
        window.addEventListener('scm:add-to-cart', listener as EventListener);
        render(<AddToCartPanel productId={42} salesStatus="on_sale" />);
        fireEvent.click(screen.getByTestId('buy-now'));
        const evt = listener.mock.calls[0][0] as CustomEvent;
        expect(evt.detail.mode).toBe('buy');
        window.removeEventListener('scm:add-to-cart', listener as EventListener);
    });
});
