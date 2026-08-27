import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../../src/components/ProductCard';
import type { ProductItem } from '../../src/types/template';

const baseItem: ProductItem = {
    id: 1,
    name: 'Stoneware Mug',
    name_localized: '머그컵',
    product_code: 'STLMUG0001AB12CD',
    selling_price: 24000,
    selling_price_formatted: '24,000원',
    list_price: 28000,
    list_price_formatted: '28,000원',
    discount_rate: 14,
    sales_status: 'ONSALE',
    sales_status_label: '판매중',
    thumbnail_url: null,
    thumbnail_slot: 'product-1',
    primary_category: 'cups',
};

describe('ProductCard', () => {
    it('renders product name and price', () => {
        render(<ProductCard item={baseItem} />);
        const card = screen.getByTestId('product-card');
        expect(card).toBeInTheDocument();
        expect(card).toHaveTextContent('머그컵');
        expect(card).toHaveTextContent('24,000원');
    });

    it('renders fallback image when no thumbnail_url is present', () => {
        render(<ProductCard item={baseItem} />);
        const img = screen.getByRole('img', { hidden: true });
        expect(img).toHaveAttribute('src', '/assets/images/product-1.svg');
        expect(img).toHaveAttribute('data-fallback', 'true');
    });

    it('does not render when item is a fixture', () => {
        const { container } = render(<ProductCard item={{ ...baseItem, isFixture: true }} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders discount badge when discount_rate is present', () => {
        render(<ProductCard item={baseItem} />);
        expect(screen.getAllByText('-14%').length).toBeGreaterThan(0);
    });
});
