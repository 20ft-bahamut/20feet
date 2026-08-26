import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutPage from '../../src/components/AboutPage';

describe('about layout component', () => {
    it('renders the about page wrapper', () => {
        render(<AboutPage />);

        expect(screen.getByTestId('about-page')).toBeInTheDocument();
    });

    it('renders a single h1 with the hero heading', () => {
        render(<AboutPage />);

        const h1 = screen.getByRole('heading', { level: 1 });
        expect(h1).toHaveTextContent('작은 공간에서 가능성을 만듭니다.');
    });

    it('renders all story sections', () => {
        render(<AboutPage />);

        expect(screen.getByTestId('about-hero')).toBeInTheDocument();
        expect(screen.getByTestId('about-why')).toBeInTheDocument();
        expect(screen.getByTestId('about-person')).toBeInTheDocument();
        expect(screen.getByTestId('about-garage')).toBeInTheDocument();
        expect(screen.getByTestId('about-what-we-build')).toBeInTheDocument();
        expect(screen.getByTestId('about-superbify')).toBeInTheDocument();
        expect(screen.getByTestId('about-just-for-fun')).toBeInTheDocument();
        expect(screen.getByTestId('about-final-cta')).toBeInTheDocument();
    });

    it('renders the hero symbol', () => {
        render(<AboutPage />);

        expect(screen.getByTestId('about-hero-symbol')).toBeInTheDocument();
    });

    it('links SuperBify CTA to /superbify', () => {
        render(<AboutPage />);

        const cta = screen.getByTestId('about-superbify-cta');
        expect(cta).toHaveAttribute('href', '/superbify');
    });

    it('links final CTAs to /portfolio and /inquiry', () => {
        render(<AboutPage />);

        expect(screen.getByTestId('about-final-portfolio')).toHaveAttribute('href', '/portfolio');
        expect(screen.getByTestId('about-final-inquiry')).toHaveAttribute('href', '/inquiry');
    });

    it('renders the core brand statement', () => {
        render(<AboutPage />);

        expect(screen.getByTestId('about-hero')).toHaveTextContent('A SMALL SPACE.');
        expect(screen.getByTestId('about-hero')).toHaveTextContent('INFINITE POSSIBILITIES.');
        expect(screen.getByTestId('about-final-cta')).toHaveTextContent('A SMALL SPACE.');
        expect(screen.getByTestId('about-final-cta')).toHaveTextContent('INFINITE POSSIBILITIES.');
    });
});
