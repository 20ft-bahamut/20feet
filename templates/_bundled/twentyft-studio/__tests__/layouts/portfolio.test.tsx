import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PortfolioList from '../../src/components/PortfolioList';
import PortfolioDetail from '../../src/components/PortfolioDetail';

describe('portfolio layout components', () => {
    it('list route renders empty state', () => {
        render(<PortfolioList />);

        expect(screen.getByTestId('portfolio-list-page')).toBeInTheDocument();
        expect(screen.getByTestId('status')).toBeInTheDocument();
        expect(screen.getByText('공개할 수 있는 프로젝트를 준비하고 있습니다.')).toBeInTheDocument();
    });

    it('detail route resolves slug context placeholder', () => {
        const slug = 'sample-project';
        render(<PortfolioDetail context={{ slug }} />);

        expect(screen.getByTestId('portfolio-detail-page')).toBeInTheDocument();
        expect(screen.getByTestId('portfolio-detail-slug')).toHaveTextContent(`slug: ${slug}`);
    });

    it('detail route renders not found fallback with null data', () => {
        render(<PortfolioDetail item={null} />);

        expect(screen.getByTestId('portfolio-detail-page')).toBeInTheDocument();
        expect(screen.getByText('프로젝트를 찾을 수 없습니다')).toBeInTheDocument();
    });
});
