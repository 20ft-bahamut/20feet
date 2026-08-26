import { describe, it, expect, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import AboutPage from '../../src/components/AboutPage';
import SiteHeader from '../../src/components/SiteHeader';
import SiteFooter from '../../src/components/SiteFooter';

function setViewport(width: number, height = 932): void {
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, writable: true, configurable: true });
    Object.defineProperty(document.documentElement, 'clientWidth', { value: width, writable: true, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: height, writable: true, configurable: true });
    window.dispatchEvent(new Event('resize'));
}

function renderAboutPage(): void {
    render(
        <>
            <SiteHeader />
            <AboutPage />
            <SiteFooter />
        </>
    );
}

describe('about page responsive horizontal overflow', () => {
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;

    afterEach(() => {
        setViewport(originalWidth, originalHeight);
    });

    it.each([
        { width: 390, name: 'small mobile' },
        { width: 430, name: 'mobile' },
        { width: 768, name: 'tablet' },
        { width: 1280, name: 'laptop' },
        { width: 1440, name: 'desktop' },
    ])('$name ($width px) has no horizontal overflow', ({ width }) => {
        setViewport(width);
        renderAboutPage();
        const html = document.documentElement;
        expect(html.scrollWidth).toBeLessThanOrEqual(width);
        expect(html.clientWidth).toBe(width);
    });
});
