import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomeHero from '../../src/components/HomeHero';
import SelectedPortfolio from '../../src/components/SelectedPortfolio';
import SuperBifyPreview from '../../src/components/SuperBifyPreview';
import AboutPreview from '../../src/components/AboutPreview';
import InquiryMottoCTA from '../../src/components/InquiryMottoCTA';

describe('home layout components', () => {
    it('renders 5 sections', () => {
        render(
            <>
                <HomeHero />
                <SelectedPortfolio />
                <SuperBifyPreview />
                <AboutPreview />
                <InquiryMottoCTA />
            </>
        );

        const sections = document.querySelectorAll('section');
        expect(sections.length).toBe(5);
    });

    it('renders Korean hero copy and symbol logo', () => {
        render(<HomeHero />);

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
            '작은 공간에서,큰 가능성을 만듭니다'
        );
        expect(screen.getByTestId('hero-symbol')).toBeInTheDocument();
    });

    it('renders Korean selected portfolio empty state', () => {
        render(<SelectedPortfolio />);

        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('만든 것들.');
        expect(screen.getByTestId('status')).toHaveTextContent('공개할 수 있는 프로젝트를 준비하고 있습니다.');
    });

    it('renders Korean SuperBify preview empty state and CTA', () => {
        render(<SuperBifyPreview />);

        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('SuperBify');
        expect(screen.getByTestId('status')).toHaveTextContent('첫 프로젝트를 만들고 있습니다.');
        expect(screen.getByTestId('superbify-preview-cta')).toHaveTextContent('SuperBify 보기 →');
    });

    it('contains the about section with id about', () => {
        render(<AboutPreview />);

        const aboutSection = document.querySelector('section#about');
        expect(aboutSection).toBeInTheDocument();
        expect(screen.getByTestId('about-preview')).toBeInTheDocument();
        expect(screen.getByTestId('about-cta')).toHaveTextContent('20ft에 대하여 →');
    });

    it('renders Korean inquiry motto CTA', () => {
        render(<InquiryMottoCTA />);

        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('만들고 싶은 것이 있으신가요?');
        expect(screen.getByTestId('inquiry-motto-button')).toHaveTextContent('프로젝트 문의');
    });
});
