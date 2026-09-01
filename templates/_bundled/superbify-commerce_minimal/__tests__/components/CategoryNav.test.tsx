import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryNav } from '../../src/components/CategoryNav';
import type { CategoryItem } from '../../src/types/template';

const items: CategoryItem[] = [
    { id: 1, name: 'Cups', name_localized: '컵', slug: 'cups', depth: 1, products_count: 2 },
    { id: 2, name: 'Lighting', name_localized: '조명', slug: 'lighting', depth: 1, products_count: 1 },
];

describe('CategoryNav', () => {
    it('renders the default "All" label when allLabel is not provided', () => {
        render(<CategoryNav items={items} />);
        const nav = screen.getByTestId('category-nav');
        expect(nav).toHaveTextContent('All');
    });

    it('renders the provided allLabel', () => {
        render(<CategoryNav items={items} allLabel="전체" />);
        const nav = screen.getByTestId('category-nav');
        expect(nav).toHaveTextContent('전체');
        expect(nav).not.toHaveTextContent('All');
    });

    it('renders each category as a link to /shop/category/{slug}', () => {
        // shopBase falls back to '/shop' in test env where G7Core is not seeded.
        render(<CategoryNav items={items} />);
        const links = screen.getAllByRole('link');
        const hrefs = links.map((l) => l.getAttribute('href'));
        expect(hrefs).toContain('/shop/');
        expect(hrefs).toContain('/shop/category/cups');
        expect(hrefs).toContain('/shop/category/lighting');
    });

    it('marks the active category with aria-current=page', () => {
        render(<CategoryNav items={items} activeSlug="cups" />);
        const active = screen.getByText('컵').closest('a');
        expect(active).toHaveAttribute('aria-current', 'page');
    });

    it('filters out isFixture items', () => {
        const withFixture: CategoryItem[] = [
            ...items,
            { id: 3, name: 'Fixture', name_localized: '픽스처', slug: 'fixture', depth: 1, isFixture: true },
        ];
        render(<CategoryNav items={withFixture} />);
        expect(screen.queryByText('픽스처')).not.toBeInTheDocument();
    });
});
