import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuperBifyList from '../../src/components/SuperBifyList';
import SuperBifyDetail from '../../src/components/SuperBifyDetail';
import type { SuperBifyItem } from '../../src/types/template';

describe('superbify layout components', () => {
    it('list route renders empty state and no fake projects', () => {
        render(<SuperBifyList items={[]} />);

        expect(screen.getByTestId('superbify-list-page')).toBeInTheDocument();
        expect(screen.getByTestId('status')).toBeInTheDocument();
        expect(screen.queryByTestId('superbify-preview-item')).not.toBeInTheDocument();
    });

    it('list route renders loading skeleton while data source is pending', () => {
        render(<SuperBifyList />);

        expect(screen.getByTestId('superbify-list-loading')).toBeInTheDocument();
        expect(screen.queryByTestId('status')).not.toBeInTheDocument();
    });

    it('detail route renders empty state with null data', () => {
        render(<SuperBifyDetail item={null} />);

        expect(screen.getByTestId('superbify-detail-page')).toBeInTheDocument();
        expect(screen.getByText('제품을 찾을 수 없습니다')).toBeInTheDocument();
    });

    it('detail route renders loading skeleton while data source is pending', () => {
        render(<SuperBifyDetail item={null} loading />);

        expect(screen.getByTestId('superbify-detail-loading')).toBeInTheDocument();
        expect(screen.queryByText('제품을 찾을 수 없습니다')).not.toBeInTheDocument();
    });

    it('describes SuperBify as an in-house product without repeating the disclaimer', () => {
        render(<SuperBifyList />);

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('직접 개발한 제품과 템플릿');
        expect(screen.getByTestId('superbify-list-page')).toHaveTextContent(
            '이십피트가 직접 만드는 그누보드 7 확장 제품군입니다.'
        );
        expect(screen.getByTestId('superbify-list-page').textContent).not.toContain('납품한 결과물이 아니라');
    });

    it('renders the board HTML body as markup rather than showing raw tags', () => {
        const item: SuperBifyItem = {
            id: 's1',
            slug: 'demo',
            title: 'SuperBify Demo',
            type: 'TEMPLATE',
            description: '<p><strong>Gnuboard 7</strong>용 템플릿</p>',
        };

        const { container } = render(<SuperBifyDetail item={item} />);

        expect(container.querySelector('strong')).not.toBeNull();
        expect(container.textContent).not.toContain('<p>');
    });

    it('strips scripts out of the board body', () => {
        const item: SuperBifyItem = {
            id: 's2',
            slug: 'demo-2',
            title: 'SuperBify Demo 2',
            type: 'TEMPLATE',
            description: '<p>정상 본문</p><script>alert(1)</script>',
        };

        const { container } = render(<SuperBifyDetail item={item} />);

        expect(container.querySelector('script')).toBeNull();
        expect(container.textContent).toContain('정상 본문');
    });
});
