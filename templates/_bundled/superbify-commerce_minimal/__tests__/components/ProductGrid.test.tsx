import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductGrid } from '../../src/components/ProductGrid';
import type { ProductItem } from '../../src/types/template';

const items: ProductItem[] = [
    {
        id: 1,
        name: 'A',
        product_code: 'AAA0000000001',
        selling_price: 10000,
        selling_price_formatted: '10,000원',
        sales_status: 'ONSALE',
    },
    {
        id: 2,
        name: 'B',
        product_code: 'BBB0000000002',
        selling_price: 20000,
        selling_price_formatted: '20,000원',
        sales_status: 'ONSALE',
    },
    {
        id: 3,
        name: 'FIX',
        product_code: 'FIX0000000003',
        selling_price: 0,
        selling_price_formatted: '0원',
        sales_status: 'ONSALE',
        isFixture: true,
    },
];

describe('ProductGrid', () => {
    it('shows EmptyState when items array is empty', () => {
        render(<ProductGrid items={[]} />);
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('shows EmptyState when items prop is null/undefined', () => {
        render(<ProductGrid items={null as unknown as ProductItem[]} />);
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('renders loading skeleton while loading', () => {
        render(<ProductGrid items={[]} loading={true} />);
        expect(screen.getByTestId('product-grid')).toHaveAttribute('data-loading', 'true');
        expect(screen.getAllByTestId('product-card-skeleton').length).toBeGreaterThan(0);
    });

    it('filters out isFixture items', () => {
        render(<ProductGrid items={items} />);
        const cards = screen.getAllByTestId('product-card');
        expect(cards).toHaveLength(2);
    });

    it('respects limit prop', () => {
        render(<ProductGrid items={items} limit={1} />);
        expect(screen.getAllByTestId('product-card')).toHaveLength(1);
    });
});
