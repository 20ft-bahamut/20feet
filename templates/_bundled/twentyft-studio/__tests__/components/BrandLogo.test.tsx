import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BrandLogo from '../../src/components/BrandLogo';

describe('BrandLogo', () => {
    afterEach(() => {
        delete (window as any).G7Core;
    });

    it('renders the full dark SVG for light surfaces by default', () => {
        render(<BrandLogo />);
        const img = screen.getByTestId('brand-logo') as HTMLImageElement;
        expect(img).toBeInTheDocument();
        expect(img.src).toContain('assets/brand/20ft/logo/full.svg');
        expect(img.alt).toBe('20ft');
        expect(img.textContent).toBe('');
    });

    it('renders the white logo on dark surfaces', () => {
        render(<BrandLogo variant="full" surface="dark" />);
        const img = screen.getByTestId('brand-logo') as HTMLImageElement;
        expect(img.src).toContain('assets/brand/20ft/logo/full-white.svg');
    });

    it('renders compact, symbol, and badge variants', () => {
        const { rerender } = render(<BrandLogo variant="compact" surface="dark" />);
        expect((screen.getByTestId('brand-logo') as HTMLImageElement).src).toContain(
            'assets/brand/20ft/logo/compact-white.svg'
        );

        rerender(<BrandLogo variant="symbol" surface="light" />);
        expect((screen.getByTestId('brand-logo') as HTMLImageElement).src).toContain(
            'assets/brand/20ft/logo/symbol.svg'
        );

        rerender(<BrandLogo variant="badge" surface="dark" />);
        expect((screen.getByTestId('brand-logo') as HTMLImageElement).src).toContain(
            'assets/brand/20ft/logo/badge-dark.svg'
        );
    });

    it('resolves src through G7 template engine when available', () => {
        (window as any).G7Core = {
            templateEngine: {
                getAssetUrl: (path: string) => `/templates/twentyft-studio/${path}`,
            },
        };

        render(<BrandLogo variant="compact" surface="dark" />);
        const img = screen.getByTestId('brand-logo') as HTMLImageElement;
        expect(img.src).toContain('/templates/twentyft-studio/assets/brand/20ft/logo/compact-white.svg');
    });
});
