import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Price } from '../../src/components/Price';

describe('Price', () => {
    it('renders only selling price when no list price', () => {
        render(<Price sellingPrice={10000} sellingPriceFormatted="10,000원" />);
        expect(screen.getByText('10,000원')).toBeInTheDocument();
        expect(screen.queryByTestId('price-list')).not.toBeInTheDocument();
    });

    it('renders list strike-through when list differs from selling', () => {
        render(
            <Price
                sellingPrice={10000}
                sellingPriceFormatted="10,000원"
                listPrice={12000}
                listPriceFormatted="12,000원"
            />
        );
        expect(screen.getByTestId('price-list')).toHaveTextContent('12,000원');
    });

    it('does not render list strike when equal', () => {
        render(
            <Price
                sellingPrice={10000}
                sellingPriceFormatted="10,000원"
                listPrice={10000}
                listPriceFormatted="10,000원"
            />
        );
        expect(screen.queryByTestId('price-list')).not.toBeInTheDocument();
    });

    it('renders discount badge when discountRate > 0', () => {
        render(<Price sellingPrice={10000} sellingPriceFormatted="10,000원" discountRate={20} />);
        expect(screen.getByText('-20%')).toBeInTheDocument();
    });
});
