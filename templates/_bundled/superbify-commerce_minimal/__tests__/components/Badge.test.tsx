import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../src/components/Badge';

describe('Badge', () => {
    it('renders the label', () => {
        render(<Badge label="NEW" />);
        expect(screen.getByText('NEW')).toBeInTheDocument();
    });

    it('sets data-tone attribute', () => {
        render(<Badge label="-20%" tone="discount" />);
        expect(screen.getByTestId('badge')).toHaveAttribute('data-tone', 'discount');
    });

    it('supports multiple tones', () => {
        const tones: ('default' | 'discount' | 'soldout' | 'stopped' | 'new')[] = [
            'default',
            'discount',
            'soldout',
            'stopped',
            'new',
        ];
        for (const tone of tones) {
            const { unmount } = render(<Badge label="x" tone={tone} />);
            expect(screen.getByTestId('badge')).toHaveAttribute('data-tone', tone);
            unmount();
        }
    });
});
