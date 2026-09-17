import { describe, it, expect, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import SiteHeader from '../../src/components/SiteHeader';
import SiteFooter from '../../src/components/SiteFooter';
import HomeHero from '../../src/components/HomeHero';
import HomeServices from '../../src/components/HomeServices';
import HomeCases from '../../src/components/HomeCases';
import HomeExperience from '../../src/components/HomeExperience';
import HomeProcess from '../../src/components/HomeProcess';
import HomeFaq from '../../src/components/HomeFaq';
import HomeInquiryCTA from '../../src/components/HomeInquiryCTA';
import ServicesList from '../../src/components/ServicesList';
import ProcessPage from '../../src/components/ProcessPage';
import InquiryForm from '../../src/components/InquiryForm';
import type { PortfolioItem, SuperBifyItem } from '../../src/types/template';

const portfolioItem: PortfolioItem = {
    id: 'p1',
    slug: 'saas',
    title: '퓨어폴 SaaS',
    types: ['SOFTWARE'],
    coverImageUrl: '/api/example/cover',
};

const demoItem: SuperBifyItem = {
    id: 's1',
    slug: 'superbify-commerce-minimal',
    title: 'SuperBify Commerce Minimal',
    type: 'TEMPLATE',
    coverImageUrl: '/api/example/demo-cover',
};

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
            <HomeServices />
            <HomeCases items={[portfolioItem]} demos={[demoItem]} />
            <HomeExperience cases={[portfolioItem]} />
            <HomeProcess />
            <HomeFaq />
            <HomeInquiryCTA />
            <SiteFooter />
        </>
    );
}

describe('horizontal overflow', () => {
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;

    afterEach(() => {
        setViewport(originalWidth, originalHeight);
    });

    it.each([
        { width: 360, name: 'small mobile' },
        { width: 390, name: 'iPhone 12/13' },
        { width: 768, name: 'tablet' },
        { width: 1280, name: 'laptop' },
        { width: 1440, name: 'desktop' },
    ])('home has no horizontal overflow at $name ($width px)', ({ width }) => {
        setViewport(width);
        renderHome();
        const html = document.documentElement;
        expect(html.scrollWidth).toBeLessThanOrEqual(width);
        expect(html.clientWidth).toBe(width);
    });

    it.each([
        { width: 360, name: 'small mobile' },
        { width: 1280, name: 'laptop' },
    ])('service pages have no horizontal overflow at $name ($width px)', ({ width }) => {
        setViewport(width);
        const { unmount } = render(<ServicesList />);
        expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
        unmount();

        render(<ProcessPage />);
        expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
    });

    it('inquiry form has no horizontal overflow on mobile', () => {
        setViewport(360);
        render(<InquiryForm />);

        expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(360);
    });
});
