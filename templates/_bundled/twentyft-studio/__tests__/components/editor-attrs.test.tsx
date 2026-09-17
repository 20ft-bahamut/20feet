import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
import ServicePage from '../../src/components/ServicePage';
import ProcessPage from '../../src/components/ProcessPage';
import PortfolioList from '../../src/components/PortfolioList';
import PortfolioDetail from '../../src/components/PortfolioDetail';
import SuperBifyList from '../../src/components/SuperBifyList';
import SuperBifyDetail from '../../src/components/SuperBifyDetail';
import AboutPage from '../../src/components/AboutPage';
import InquiryForm from '../../src/components/InquiryForm';
import Container from '../../src/components/Container';
import type { EditorAttrs } from '../../src/types/template';

const editorAttrs: EditorAttrs = {
    id: 'editor-root',
    'data-block-id': 'block-1',
    'data-component': 'SiteHeader',
};

describe('editorAttrs pass-through on root composite and layout components', () => {
    const cases = [
        { name: 'SiteHeader', element: <SiteHeader editorAttrs={editorAttrs} />, testId: 'site-header' },
        { name: 'SiteFooter', element: <SiteFooter editorAttrs={editorAttrs} />, testId: 'site-footer' },
        { name: 'HomeHero', element: <HomeHero editorAttrs={editorAttrs} />, testId: 'home-hero' },
        { name: 'HomeServices', element: <HomeServices editorAttrs={editorAttrs} />, testId: 'home-services' },
        { name: 'HomeCases', element: <HomeCases items={[]} demos={[]} editorAttrs={editorAttrs} />, testId: 'home-cases' },
        { name: 'HomeExperience', element: <HomeExperience editorAttrs={editorAttrs} />, testId: 'home-experience' },
        { name: 'HomeProcess', element: <HomeProcess editorAttrs={editorAttrs} />, testId: 'home-process' },
        { name: 'HomeFaq', element: <HomeFaq editorAttrs={editorAttrs} />, testId: 'home-faq' },
        { name: 'HomeInquiryCTA', element: <HomeInquiryCTA editorAttrs={editorAttrs} />, testId: 'home-inquiry-cta' },
        { name: 'ServicesList', element: <ServicesList editorAttrs={editorAttrs} />, testId: 'services-list-page' },
        { name: 'ServicePage', element: <ServicePage service="website" editorAttrs={editorAttrs} />, testId: 'service-page-website' },
        { name: 'ProcessPage', element: <ProcessPage editorAttrs={editorAttrs} />, testId: 'process-page' },
        { name: 'PortfolioList', element: <PortfolioList editorAttrs={editorAttrs} />, testId: 'portfolio-list-page' },
        { name: 'PortfolioDetail', element: <PortfolioDetail editorAttrs={editorAttrs} />, testId: 'portfolio-detail-page' },
        { name: 'SuperBifyList', element: <SuperBifyList editorAttrs={editorAttrs} />, testId: 'superbify-list-page' },
        { name: 'SuperBifyDetail', element: <SuperBifyDetail editorAttrs={editorAttrs} />, testId: 'superbify-detail-page' },
        { name: 'AboutPage', element: <AboutPage editorAttrs={editorAttrs} />, testId: 'about-page' },
        { name: 'InquiryForm', element: <InquiryForm editorAttrs={editorAttrs} />, testId: 'inquiry-form-page' },
        { name: 'Container', element: <Container editorAttrs={editorAttrs} />, testId: 'container' },
    ];

    cases.forEach(({ name, element, testId }) => {
        it(`${name} applies editorAttrs to its visual root element`, () => {
            render(element);
            const root = screen.getByTestId(testId);
            expect(root).toHaveAttribute('id', 'editor-root');
            expect(root).toHaveAttribute('data-block-id', 'block-1');
            expect(root).toHaveAttribute('data-component', 'SiteHeader');
        });
    });
});
