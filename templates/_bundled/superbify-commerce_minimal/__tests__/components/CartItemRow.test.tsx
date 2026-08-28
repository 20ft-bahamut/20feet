import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartItemRow } from '../../src/components/CartItemRow';

const baseItem = {
    id: 100,
    quantity: 2,
    unit_price: 5000,
    product: {
        id: 7,
        code: 'SKU-1',
        name: 'Demo Product',
        thumbnail_slot: 'product-1',
        selling_price: 5000,
    },
};

describe('CartItemRow', () => {
    it('renders product name and price', () => {
        render(<CartItemRow item={baseItem} />);
        expect(screen.getByText('Demo Product')).toBeInTheDocument();
        expect(screen.getByText('SKU-1')).toBeInTheDocument();
    });

    it('renders thumbnail via fallback slot', () => {
        render(<CartItemRow item={baseItem} />);
        const img = screen.getByRole('img') as HTMLImageElement;
        // Data URI starts with data:image/svg+xml
        expect(img.src.startsWith('data:image/svg+xml')).toBe(true);
    });

    it('fires scm:cart-delete with the item id when delete clicked', () => {
        const listener = vi.fn();
        window.addEventListener('scm:cart-delete', listener as EventListener);
        render(<CartItemRow item={baseItem} deleteLabel="삭제" />);
        fireEvent.click(screen.getByTestId('cart-item-delete'));
        expect(listener).toHaveBeenCalled();
        const evt = listener.mock.calls[0][0] as CustomEvent;
        expect(evt.detail.ids).toEqual([100]);
        window.removeEventListener('scm:cart-delete', listener as EventListener);
    });

    it('fires scm:cart-qty-change on blur when quantity changed', () => {
        const listener = vi.fn();
        window.addEventListener('scm:cart-qty-change', listener as EventListener);
        render(<CartItemRow item={baseItem} />);
        const input = screen.getByTestId('cart-qty-input');
        fireEvent.change(input, { target: { value: '5' } });
        fireEvent.blur(input);
        expect(listener).toHaveBeenCalled();
        const evt = listener.mock.calls[0][0] as CustomEvent;
        expect(evt.detail.id).toBe(100);
        expect(evt.detail.quantity).toBe(5);
        window.removeEventListener('scm:cart-qty-change', listener as EventListener);
    });

    it('clamps quantity to maxQuantity on increment', () => {
        render(<CartItemRow item={{ ...baseItem, quantity: 98 }} minQuantity={1} maxQuantity={99} />);
        const inc = screen.getByLabelText('increase quantity');
        fireEvent.click(inc);
        const input = screen.getByTestId('cart-qty-input') as HTMLInputElement;
        expect(input.value).toBe('99');
        // Increment past max keeps it at 99
        fireEvent.click(inc);
        expect(input.value).toBe('99');
    });
});
