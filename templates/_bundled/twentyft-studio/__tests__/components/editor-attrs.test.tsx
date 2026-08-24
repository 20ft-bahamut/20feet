import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SiteHeader from '../../src/components/SiteHeader';
import SiteFooter from '../../src/components/SiteFooter';
import HomeHero from '../../src/components/HomeHero';
import SelectedPortfolio from '../../src/components/SelectedPortfolio';
import SuperBifyPreview from '../../src/components/SuperBifyPreview';
import AboutPreview from '../../src/components/AboutPreview';
import InquiryMottoCTA from '../../src/components/InquiryMottoCTA';
import PortfolioList from '../../src/components/PortfolioList';
import PortfolioDetail from '../../src/components/PortfolioDetail';
import SuperBifyList from '../../src/components/SuperBifyList';
import SuperBifyDetail from '../../src/components/SuperBifyDetail';
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
        { name: 'SiteHeader', component: SiteHeader, testId: 'site-header' },
        { name: 'SiteFooter', component: SiteFooter, testId: 'site-footer' },
        { name: 'HomeHero', component: HomeHero, testId: 'home-hero' },
        { name: 'SelectedPortfolio', component: SelectedPortfolio, testId: 'selected-portfolio' },
        { name: 'SuperBifyPreview', component: SuperBifyPreview, testId: 'superbify-preview' },
        { name: 'AboutPreview', component: AboutPreview, testId: 'about-preview' },
        { name: 'InquiryMottoCTA', component: InquiryMottoCTA, testId: 'inquiry-motto-cta' },
        { name: 'PortfolioList', component: PortfolioList, testId: 'portfolio-list-page' },
        { name: 'PortfolioDetail', component: PortfolioDetail, testId: 'portfolio-detail-page' },
        { name: 'SuperBifyList', component: SuperBifyList, testId: 'superbify-list-page' },
        { name: 'SuperBifyDetail', component: SuperBifyDetail, testId: 'superbify-detail-page' },
        { name: 'InquiryForm', component: InquiryForm, testId: 'inquiry-form-page' },
        { name: 'Container', component: Container, testId: 'container' },
    ] as const;

    cases.forEach(({ name, component: Component, testId }) => {
        it(`${name} applies editorAttrs to its visual root element`, () => {
            render(<Component editorAttrs={editorAttrs} />);
            const root = screen.getByTestId(testId);
            expect(root).toHaveAttribute('id', 'editor-root');
            expect(root).toHaveAttribute('data-block-id', 'block-1');
            expect(root).toHaveAttribute('data-component', 'SiteHeader');
        });
    });
});
