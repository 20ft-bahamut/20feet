import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuperBifyList from '../../src/components/SuperBifyList';
import SuperBifyDetail from '../../src/components/SuperBifyDetail';

describe('superbify layout components', () => {
    it('list route renders empty state and no fake projects', () => {
        render(<SuperBifyList />);

        expect(screen.getByTestId('superbify-list-page')).toBeInTheDocument();
        expect(screen.getByTestId('status')).toBeInTheDocument();
        expect(screen.getByText('첫 프로젝트를 만들고 있습니다.')).toBeInTheDocument();
        expect(screen.queryByTestId('superbify-preview-item')).not.toBeInTheDocument();
    });

    it('detail route renders empty state with null data', () => {
        render(<SuperBifyDetail item={null} />);

        expect(screen.getByTestId('superbify-detail-page')).toBeInTheDocument();
        expect(screen.getByText('제품을 찾을 수 없습니다')).toBeInTheDocument();
    });

    it('detail route resolves slug context placeholder', () => {
        const slug = 'sample-module';
        render(<SuperBifyDetail context={{ slug }} />);

        expect(screen.getByTestId('superbify-detail-page')).toBeInTheDocument();
        expect(screen.getByTestId('superbify-detail-slug')).toHaveTextContent(`slug: ${slug}`);
    });
});
