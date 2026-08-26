import { describe, it, expect, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import HomeHero from '../../src/components/HomeHero';
import SelectedPortfolio from '../../src/components/SelectedPortfolio';
import SuperBifyPreview from '../../src/components/SuperBifyPreview';
import AboutPreview from '../../src/components/AboutPreview';
import InquiryMottoCTA from '../../src/components/InquiryMottoCTA';
import SiteHeader from '../../src/components/SiteHeader';
import SiteFooter from '../../src/components/SiteFooter';

function setViewport(width: number, height = 932): void {
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, writable: true, configurable: true });
    Object.defineProperty(document.documentElement, 'clientWidth', { value: width, writable: true, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: height, writable: true, configurable: true });
    window.dispatchEvent(new Event('resize'));
}

function renderHome(): void {
    render(
        <>
            <SiteHeader />
            <HomeHero />
            <SelectedPortfolio />
            <SuperBifyPreview />
            <AboutPreview />
            <InquiryMottoCTA />
            <SiteFooter />
        </>
    );
}

describe('home responsive horizontal overflow', () => {
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;

    afterEach(() => {
        setViewport(originalWidth, originalHeight);
    });

    it.each([
        { width: 390, name: 'small mobile' },
        { width: 430, name: 'iPhone 14 Pro Max' },
        { width: 768, name: 'tablet' },
        { width: 1280, name: 'laptop' },
        { width: 1440, name: 'desktop' },
    ])('$name ($width px) has no horizontal overflow', ({ width }) => {
        setViewport(width);
        renderHome();
        const html = document.documentElement;
        expect(html.scrollWidth).toBeLessThanOrEqual(width);
        expect(html.clientWidth).toBe(width);
    });
});
