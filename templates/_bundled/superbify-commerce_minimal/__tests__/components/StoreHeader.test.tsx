import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreHeader } from '../../src/components/StoreHeader';

describe('StoreHeader', () => {
    it('renders the brand name and tagline', () => {
        render(<StoreHeader brandName="Still Form" tagline="Quiet objects" />);
        expect(screen.getByText('Still Form')).toBeInTheDocument();
        expect(screen.getByText('Quiet objects')).toBeInTheDocument();
    });

    it('renders nav links', () => {
        render(<StoreHeader />);
        expect(screen.getByTestId('nav-shop')).toBeInTheDocument();
        expect(screen.getByTestId('nav-story')).toBeInTheDocument();
        expect(screen.getByTestId('nav-notice')).toBeInTheDocument();
        expect(screen.getByTestId('nav-cart')).toBeInTheDocument();
    });

    it('hides the cart badge when cartCount is undefined', () => {
        render(<StoreHeader cartCount={undefined} />);
        expect(screen.queryByTestId('cart-count')).not.toBeInTheDocument();
    });

    it('shows the cart badge when cartCount is provided', () => {
        render(<StoreHeader cartCount={3} />);
        expect(screen.getByTestId('cart-count')).toHaveTextContent('3');
    });

    it('shows 99+ when cartCount is over 99', () => {
        render(<StoreHeader cartCount={120} />);
        expect(screen.getByTestId('cart-count')).toHaveTextContent('99+');
    });
});
