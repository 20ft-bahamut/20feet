import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';

describe('ConfirmDialog', () => {
    it('renders nothing when closed', () => {
        const { container } = render(
            <ConfirmDialog open={false} title="t" onConfirm={vi.fn()} onCancel={vi.fn()} />
        );
        expect(container.querySelector('[data-testid="confirm-dialog"]')).toBeNull();
    });

    it('renders title and message when open', () => {
        render(
            <ConfirmDialog
                open
                title="삭제할까요?"
                message="삭제됩니다."
                confirmLabel="삭제"
                cancelLabel="취소"
                onConfirm={vi.fn()}
                onCancel={vi.fn()}
            />
        );
        expect(screen.getByText('삭제할까요?')).toBeInTheDocument();
        expect(screen.getByText('삭제됩니다.')).toBeInTheDocument();
        expect(screen.getByText('삭제')).toBeInTheDocument();
        expect(screen.getByText('취소')).toBeInTheDocument();
    });

    it('fires onConfirm and onCancel', () => {
        const onConfirm = vi.fn();
        const onCancel = vi.fn();
        render(
            <ConfirmDialog
                open
                title="t"
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        );
        fireEvent.click(screen.getByTestId('confirm-ok'));
        fireEvent.click(screen.getByTestId('confirm-cancel'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape key', () => {
        const onCancel = vi.fn();
        render(<ConfirmDialog open title="t" onConfirm={vi.fn()} onCancel={onCancel} />);
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onCancel).toHaveBeenCalled();
    });
});
