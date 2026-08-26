import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BrandLogo from '../../src/components/BrandLogo';

describe('BrandLogo', () => {
    it('renders the full dark SVG as an inline data URI by default', () => {
        render(<BrandLogo />);
        const img = screen.getByTestId('brand-logo') as HTMLImageElement;
        expect(img).toBeInTheDocument();
        expect(img.src).toContain('data:image/svg+xml,');
        expect(img.src).toContain('%3Csvg');
        expect(img.alt).toBe('20ft');
        expect(img.textContent).toBe('');
    });

    it('renders the white logo on dark surfaces', () => {
        render(<BrandLogo variant="full" surface="dark" />);
        const img = screen.getByTestId('brand-logo') as HTMLImageElement;
        expect(img.src).toContain('data:image/svg+xml,');
        expect(img.src).toContain('%3Csvg');
        // The dark-surface logo uses white fills.
        expect(img.src).toContain('fill%3A%20%23fff');
    });

    it('renders compact, symbol, and badge variants', () => {
        const { rerender } = render(<BrandLogo variant="compact" surface="dark" />);
        const compactImg = screen.getByTestId('brand-logo') as HTMLImageElement;
        expect(compactImg.src).toContain('data:image/svg+xml,');
        expect(compactImg.src).toContain('%3Csvg');

        rerender(<BrandLogo variant="symbol" surface="light" />);
        const symbolImg = screen.getByTestId('brand-logo') as HTMLImageElement;
        expect(symbolImg.src).toContain('data:image/svg+xml,');
        expect(symbolImg.src).toContain('%3Csvg');

        rerender(<BrandLogo variant="badge" surface="dark" />);
        const badgeImg = screen.getByTestId('brand-logo') as HTMLImageElement;
        expect(badgeImg.src).toContain('data:image/svg+xml,');
        expect(badgeImg.src).toContain('%3Csvg');
    });

    it('does not depend on the G7 template engine asset endpoint', () => {
        (window as any).G7Core = {
            templateEngine: {
                getAssetUrl: () => 'should-not-be-used',
            },
        };

        render(<BrandLogo variant="compact" surface="dark" />);
        const img = screen.getByTestId('brand-logo') as HTMLImageElement;
        expect(img.src).toContain('data:image/svg+xml,');
        expect(img.src).not.toContain('should-not-be-used');
        delete (window as any).G7Core;
    });
});
