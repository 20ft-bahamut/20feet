import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PortfolioList from '../../src/components/PortfolioList';
import PortfolioDetail from '../../src/components/PortfolioDetail';

describe('portfolio layout components', () => {
    it('list route renders empty state', () => {
        render(<PortfolioList items={[]} />);

        expect(screen.getByTestId('portfolio-list-page')).toBeInTheDocument();
        expect(screen.getByTestId('status')).toBeInTheDocument();
        expect(screen.getByText('공개할 수 있는 프로젝트를 준비하고 있습니다.')).toBeInTheDocument();
    });

    it('list route renders loading skeleton while data source is pending', () => {
        render(<PortfolioList />);

        expect(screen.getByTestId('portfolio-list-loading')).toBeInTheDocument();
        expect(screen.queryByTestId('status')).not.toBeInTheDocument();
    });

    it('detail route renders loading skeleton while data source is pending', () => {
        render(<PortfolioDetail item={null} loading />);

        expect(screen.getByTestId('portfolio-detail-loading')).toBeInTheDocument();
        expect(screen.queryByText('프로젝트를 찾을 수 없습니다')).not.toBeInTheDocument();
    });

    it('detail route renders not found fallback with null data', () => {
        render(<PortfolioDetail item={null} />);

        expect(screen.getByTestId('portfolio-detail-page')).toBeInTheDocument();
        expect(screen.getByText('프로젝트를 찾을 수 없습니다')).toBeInTheDocument();
    });
});
