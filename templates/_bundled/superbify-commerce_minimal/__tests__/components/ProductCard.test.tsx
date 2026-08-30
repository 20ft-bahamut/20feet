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

    it('falls back to the neutral still-life SVG when the product has no DB image', () => {
        // baseItem has thumbnail_url: null and no images[] — bundled demo JPGs
        // are never used as product data, so the SVG slot is the empty state.
        render(<ProductCard item={baseItem} />);
        const img = screen.getByRole('img', { hidden: true });
        const src = img.getAttribute('src') ?? '';
        expect(src.startsWith('data:image/svg+xml')).toBe(true);
        expect(img).toHaveAttribute('data-fallback', 'true');
    });

    it('uses the first DB image when thumbnail_url is null', () => {
        const withImages: ProductItem = {
            ...baseItem,
            images: [{ id: 1, download_url: '/api/modules/sirsoft-ecommerce/product-image/abc123' }],
        };
        render(<ProductCard item={withImages} />);
        const img = screen.getByRole('img', { hidden: true });
        expect(img.getAttribute('src')).toBe('/api/modules/sirsoft-ecommerce/product-image/abc123');
        expect(img).toHaveAttribute('data-fallback', 'false');
    });

    it('falls back to a SVG data URI when the product_code is unknown', () => {
        // Unknown product code → still-life slot resolver kicks in (id-based fallback)
        // which resolves to a bundled SVG. Confirm the original fallback path still works.
        const unknown: ProductItem = {
            ...baseItem,
            product_code: 'UNKNOWN-CODE-XXX',
        };
        render(<ProductCard item={unknown} />);
        const img = screen.getByRole('img', { hidden: true });
        const src = img.getAttribute('src') ?? '';
        expect(src.startsWith('data:image/svg+xml')).toBe(true);
        expect(img).toHaveAttribute('data-fallback', 'true');
    });

    it('honours an explicit server-provided relative thumbnail_url', () => {
        const withThumb: ProductItem = {
            ...baseItem,
            thumbnail_url: '/uploads/sample-product.jpg',
        };
        render(<ProductCard item={withThumb} />);
        const img = screen.getByRole('img', { hidden: true });
        const src = img.getAttribute('src') ?? '';
        expect(src).toBe('/uploads/sample-product.jpg');
        expect(img).toHaveAttribute('data-fallback', 'false');
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
