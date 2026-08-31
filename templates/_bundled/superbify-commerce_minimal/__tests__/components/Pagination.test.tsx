import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../../src/components/Pagination';

describe('Pagination', () => {
    it('renders nothing when totalPages is 1 or less', () => {
        const { container } = render(<Pagination currentPage={1} totalPages={1} />);
        expect(container.querySelector('[data-testid="pagination"]')).toBeNull();
        expect(container.querySelector('[role="navigation"]')).toBeNull();
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when totalPages is unknown (null/undefined)', () => {
        const { container } = render(<Pagination currentPage={1} totalPages={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders page numbers with the active page marked charcoal', () => {
        render(<Pagination currentPage={2} totalPages={2} pageLabel="Page :n" />);

        const pages = screen.getAllByTestId('pagination-page');
        expect(pages).toHaveLength(2);
        expect(pages[0]).toHaveAttribute('data-active', 'false');
        expect(pages[1]).toHaveAttribute('data-active', 'true');
        expect(pages[1]).toHaveAttribute('aria-current', 'page');
        expect(pages[1]).toHaveAttribute('aria-label', 'Page 2');
        expect(pages[1]).toHaveStyle({ backgroundColor: 'var(--scm-charcoal, #26221E)' });
    });

    it('emits onPageChange for valid page clicks', () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={1} totalPages={2} onPageChange={onPageChange} />);

        fireEvent.click(screen.getAllByTestId('pagination-page')[1]);
        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('does not emit onPageChange for the current page', () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={1} totalPages={2} onPageChange={onPageChange} />);

        fireEvent.click(screen.getAllByTestId('pagination-page')[0]);
        expect(onPageChange).not.toHaveBeenCalled();
    });

    it('disables prev on first page and next on last page', () => {
        const onPageChange = vi.fn();
        const { rerender } = render(
            <Pagination currentPage={1} totalPages={2} onPageChange={onPageChange} />
        );
        expect(screen.getByTestId('pagination-prev')).toBeDisabled();
        expect(screen.getByTestId('pagination-next')).toBeEnabled();

        rerender(<Pagination currentPage={2} totalPages={2} onPageChange={onPageChange} />);
        expect(screen.getByTestId('pagination-prev')).toBeEnabled();
        expect(screen.getByTestId('pagination-next')).toBeDisabled();
    });

    it('collapses long page ranges with an ellipsis', () => {
        render(<Pagination currentPage={9} totalPages={20} />);
        expect(screen.getAllByTestId('pagination-ellipsis')).toHaveLength(2);
        const labeled = screen
            .getAllByTestId('pagination-page')
            .map((p) => Number(p.getAttribute('data-page')));
        expect(labeled[0]).toBe(1);
        expect(labeled[labeled.length - 1]).toBe(20);
        expect(labeled).toContain(9);
    });
});