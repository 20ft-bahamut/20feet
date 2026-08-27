import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryCard } from '../../src/components/CategoryCard';
import type { CategoryItem } from '../../src/types/template';

const cat: CategoryItem = {
    id: 1,
    name: 'Cups',
    name_localized: '컵',
    slug: 'cups',
    depth: 1,
    products_count: 3,
};

describe('CategoryCard', () => {
    it('renders anchor to /shop/category/{slug}', () => {
        render(<CategoryCard item={cat} />);
        const link = screen.getByTestId('category-card');
        expect(link).toHaveAttribute('href', '/shop/category/cups');
        expect(link).toHaveAttribute('data-slug', 'cups');
    });

    it('renders product count when present', () => {
        render(<CategoryCard item={cat} />);
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('does not render when item is a fixture', () => {
        const { container } = render(<CategoryCard item={{ ...cat, isFixture: true }} />);
        expect(container.firstChild).toBeNull();
    });

    it('falls back to category-fallback.svg when the local image errors', () => {
        const { container } = render(<CategoryCard item={cat} />);
        const img = container.querySelector('img');
        expect(img).not.toBeNull();
        fireEvent.error(img!);
        // After onError, the <img> src should be the category-fallback path.
        const imgAfter = container.querySelector('img');
        expect(imgAfter?.getAttribute('src')).toBe('/assets/images/category-fallback.svg');
    });
});
