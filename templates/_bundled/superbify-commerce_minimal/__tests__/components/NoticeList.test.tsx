import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NoticeList } from '../../src/components/NoticeList';
import type { NoticeItem } from '../../src/types/template';

const items: NoticeItem[] = [
    { id: 8, title: '배송 및 수령 안내', is_notice: true, created_at: '2026-08-27 19:07:07', created_at_formatted: '08-28' },
    { id: 10, title: '신규 상품 입고 안내', is_notice: false, created_at: '2026-08-19 19:07:08', created_at_formatted: '08-20' },
];

describe('NoticeList', () => {
    it('renders one row per item with title and formatted date', () => {
        render(<NoticeList items={items} />);
        const rows = screen.getAllByTestId('notice-row');
        expect(rows).toHaveLength(2);
        expect(screen.getByText('배송 및 수령 안내')).toBeInTheDocument();
        expect(screen.getByText('신규 상품 입고 안내')).toBeInTheDocument();
        expect(screen.getByText('08-28')).toBeInTheDocument();
    });

    it('renders pinned badge only for is_notice rows', () => {
        render(<NoticeList items={items} fixedLabel="고정" />);
        expect(screen.getAllByTestId('notice-fixed-badge')).toHaveLength(1);
        expect(screen.getByText('고정')).toBeInTheDocument();
    });

    it('shows EmptyState when items array is empty', () => {
        render(<NoticeList items={[]} emptyTitle="등록된 공지가 없습니다" />);
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('shows EmptyState when items prop is null/undefined', () => {
        render(<NoticeList items={null as unknown as NoticeItem[]} />);
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('renders skeleton rows while loading', () => {
        render(<NoticeList items={[]} loading={true} />);
        expect(screen.getByTestId('notice-list')).toHaveAttribute('data-loading', 'true');
        expect(screen.getAllByTestId('notice-row-skeleton').length).toBeGreaterThan(0);
    });

    it('links each row to the notice detail page', () => {
        render(<NoticeList items={items} />);
        const rows = screen.getAllByTestId('notice-row');
        expect(rows.every((r) => r.tagName === 'A')).toBe(true);
        expect(rows[0]).toHaveAttribute('href', '/shop/notice/8');
        expect(rows[1]).toHaveAttribute('href', '/shop/notice/10');
        expect(rows[0]).toHaveTextContent('배송 및 수령 안내');
        expect(rows[0].getAttribute('href')).toContain('/shop/notice/');
    });

    it('supports a custom detail base path', () => {
        render(<NoticeList items={items} detailBasePath="/shop/notice" />);
        expect(screen.getAllByTestId('notice-row')[1]).toHaveAttribute('href', '/shop/notice/10');
    });

    it('builds row aria label from rowAriaLabel with :t placeholder', () => {
        render(<NoticeList items={items} rowAriaLabel="공지 열기: :t" />);
        expect(screen.getAllByTestId('notice-row')[0]).toHaveAttribute(
            'aria-label',
            '공지 열기: 배송 및 수령 안내'
        );
    });
});