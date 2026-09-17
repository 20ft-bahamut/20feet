import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomeHero from '../../src/components/HomeHero';
import HomeServices from '../../src/components/HomeServices';
import HomeCases from '../../src/components/HomeCases';
import HomeExperience from '../../src/components/HomeExperience';
import HomeProcess from '../../src/components/HomeProcess';
import HomeFaq from '../../src/components/HomeFaq';
import HomeInquiryCTA from '../../src/components/HomeInquiryCTA';
import type { PortfolioItem, SuperBifyItem } from '../../src/types/template';

const portfolioItem: PortfolioItem = {
    id: 'p1',
    slug: 'saas',
    title: '퓨어폴 SaaS',
    summary: '제빙기 위생관리 업무를 통합한 B2B SaaS입니다.',
    types: ['SOFTWARE'],
    year: '2006',
    status: 'RELEASED',
    role: ['CTO'],
    coverImageUrl: '/api/example/portfolio-cover',
};

const demoItem: SuperBifyItem = {
    id: 's1',
    slug: 'superbify-commerce-minimal',
    title: 'SuperBify Commerce Minimal',
    type: 'TEMPLATE',
    summary: '브랜드와 상품이 중심이 되도록 다시 디자인한 커머스 템플릿입니다.',
    status: 'RELEASED',
    compatibility: '7.0.0+',
    coverImageUrl: '/api/example/demo-cover',
};

function renderHome(): HTMLElement {
    const { container } = render(
        <>
            <HomeHero />
            <HomeCases items={[portfolioItem]} demos={[demoItem]} />
            <HomeServices />
            <HomeExperience cases={[portfolioItem]} />
            <HomeProcess />
            <HomeInquiryCTA />
        </>
    );
    return container;
}

describe('home layout', () => {
    it('renders every section in order, from hero to inquiry', () => {
        const { container } = render(
            <>
                <HomeHero />
                <HomeCases items={[portfolioItem]} demos={[demoItem]} />
                <HomeServices />
                <HomeExperience cases={[portfolioItem]} />
                <HomeProcess />
                <HomeInquiryCTA />
            </>
        );

        const testIds = Array.from(container.querySelectorAll('section')).map((el) =>
            el.getAttribute('data-testid')
        );

        expect(testIds).toEqual([
            'home-hero',
            'home-cases',
            'home-services',
            'home-experience',
            'home-process',
            'home-inquiry-cta',
        ]);
    });

    it('states what can be commissioned in the H1', () => {
        render(<HomeHero />);

        expect(screen.getByTestId('hero-heading')).toHaveTextContent(
            '홈페이지와 쇼핑몰, 업무에 맞는 웹프로그램을 만듭니다.'
        );
    });

    it('explains what is built and promises a plan is not required', () => {
        render(<HomeHero />);

        expect(screen.getByTestId('hero-description')).toHaveTextContent(
            '회사 소개부터 온라인 판매, 고객·계약·업무 관리까지. 필요한 기능을 정리해 기획하고 개발합니다.'
        );
        expect(screen.getByTestId('hero-note')).toHaveTextContent('기획서가 없어도 괜찮습니다.');
    });

    it('keeps the hero to a title, description, two actions and one note', () => {
        render(<HomeHero />);

        const hero = screen.getByTestId('home-hero');
        // 히어로에 이미지를 두지 않는다 — 실제 작업 화면은 다음 섹션에서 한 번만 보여준다.
        expect(hero.querySelectorAll('img')).toHaveLength(0);
        expect(screen.getByTestId('hero-cta-inquiry')).toHaveTextContent('제작 문의하기');
        expect(screen.getByTestId('hero-cta-inquiry')).toHaveAttribute('href', '/inquiry');
        expect(screen.getByTestId('hero-cta')).toHaveTextContent('제작 사례 보기');
        expect(screen.getByTestId('hero-cta')).toHaveAttribute('href', '/portfolio');
    });

    it('breaks the hero headline only where a semantic unit ends', () => {
        const { container } = render(<HomeHero />);

        const breaks = container.querySelectorAll('h1 .hero-line-break');
        expect(breaks).toHaveLength(1);
    });

    it('shows each service with the situation it fits and a detail link', () => {
        render(<HomeServices />);

        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('어떤 웹사이트가 필요하신가요?');
        expect(screen.getByTestId('home-service-website')).toHaveAttribute('href', '/services/website');
        expect(screen.getByTestId('home-service-commerce')).toHaveAttribute('href', '/services/commerce');
        expect(screen.getByTestId('home-service-web-development')).toHaveAttribute(
            'href',
            '/services/web-development'
        );
        expect(screen.getByTestId('home-services').textContent).toContain('기존 사이트 개편도 상담할 수 있습니다');
        expect(screen.getByTestId('home-services').textContent).toContain('브랜드에 맞는 쇼핑몰을 제작합니다');
        expect(screen.getByTestId('home-services').textContent).toContain('웹에서 관리하도록 개발합니다');
    });

    it('does not claim included scope or track record on the service cards', () => {
        const { container } = render(<HomeServices />);
        const text = container.textContent ?? '';

        expect(text).not.toMatch(/기본 포함|포함되어|무료|실적|만족도|프로젝트 \d+건/);
    });

    it('shows the work as wide rows that label the work and the target', () => {
        render(<HomeCases items={[portfolioItem]} demos={[demoItem]} />);

        const labels = screen.getAllByTestId('home-case-label').map((el) => el.textContent);
        expect(labels).toEqual(['고객 프로젝트 · 업무 시스템 · 2006', '자체 제작 · 쇼핑몰']);
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('주요 제작 사례');

        expect(screen.getByText('퓨어폴 SaaS')).toBeInTheDocument();
        expect(screen.getAllByTestId('home-case')).toHaveLength(2);
    });

    it('gives each work entry a title, one sentence, a real screen and a detail link', () => {
        const { container } = render(<HomeCases items={[portfolioItem]} demos={[demoItem]} />);

        const links = screen.getAllByTestId('home-case-link');
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute('href', '/portfolio/saas');
        expect(links[1]).toHaveAttribute('href', '/superbify/superbify-commerce-minimal');
        // 실제 화면이 두 건 모두 붙는다. 장식용이라 대체 텍스트는 비워 둔다(래퍼가 aria-hidden).
        expect(container.querySelectorAll('img')).toHaveLength(2);
        expect(screen.getByTestId('home-cases').textContent).toContain(
            '제빙기 위생관리 업무를 통합한 B2B SaaS입니다.'
        );
        // 자체 데모는 제품명 대신 만든 화면의 성격을 제목으로 쓴다.
        expect(screen.getByTestId('home-case-product')).toHaveTextContent('SuperBify Commerce Minimal');
        expect(screen.getByTestId('home-cases').textContent).not.toContain('7.0.0+');
    });

    it('uses each work image only once on the page', () => {
        const container = renderHome();

        const sources = Array.from(container.querySelectorAll('img')).map((img) => img.getAttribute('src'));
        const duplicates = sources.filter((src, index) => sources.indexOf(src) !== index);
        expect(duplicates).toEqual([]);
    });

    it('renders a loading skeleton rather than an empty state while pending', () => {
        render(<HomeCases />);

        expect(screen.getByTestId('home-cases-loading')).toBeInTheDocument();
        expect(screen.queryByTestId('status')).not.toBeInTheDocument();
    });

    it('renders an empty state when nothing is published, without filling the gap', () => {
        render(<HomeCases items={[]} demos={[]} />);

        expect(screen.getByTestId('status')).toHaveTextContent('공개할 수 있는 작업을 준비하고 있습니다.');
        expect(screen.queryAllByTestId('home-case')).toHaveLength(0);
    });

    it('links the experience section to real work and the about page', () => {
        render(<HomeExperience cases={[portfolioItem]} />);

        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('20년 넘게 웹을 만들어왔습니다.');
        expect(screen.getByTestId('experience-cta')).toHaveAttribute('href', '/about');
        expect(screen.getByTestId('experience-case-link')).toHaveAttribute('href', '/portfolio/saas');
        expect(screen.getByTestId('experience-superbify-link')).toHaveAttribute('href', '/superbify');
    });

    it('does not invent team size, project counts or satisfaction', () => {
        const { container } = render(<HomeExperience cases={[portfolioItem]} />);
        const text = container.textContent ?? '';

        expect(text).not.toMatch(/전문팀|전담팀|우리 팀|만족도|프로젝트 \d+건|누적 \d+/);
    });

    it('describes each process step once, without repeating who does what', () => {
        render(<HomeProcess />);

        const items = screen.getAllByTestId('home-process-step');
        expect(items).toHaveLength(4);
        expect(items[0].textContent).toContain('제작 목적과 필요한 기능, 현재 사이트나 업무 상황을 듣습니다.');
        // 단계마다 문장이 하나뿐이다 — '우리가 하는 일'과 '고객이 하는 일'을 두 번 쓰지 않는다.
        expect(items[0].querySelectorAll('p')).toHaveLength(1);
        expect(screen.queryByTestId('home-process-customer-action')).not.toBeInTheDocument();
    });

    it('summarises the four steps without promising fixed terms', () => {
        render(<HomeProcess />);

        const text = screen.getByTestId('home-process').textContent ?? '';
        expect(text).toContain('상담');
        expect(text).toContain('범위·견적 협의');
        expect(text).toContain('제작·확인');
        expect(text).toContain('검수·오픈');
        expect(text).not.toMatch(/무료|무제한|24시간|100%|최저가/);
    });

    it('keeps the FAQ component available for the process page', () => {
        // 홈 구성에서는 빠졌지만 템플릿 컴포넌트로는 남아 있다(레이아웃 편집에서 배치 가능).
        const { container } = render(<HomeFaq />);

        const items = container.querySelectorAll('details');
        expect(items.length).toBeGreaterThan(0);
        expect(items[0].querySelector('summary')).not.toBeNull();
    });

    it('closes with the inquiry CTA and does not repeat the brand slogan', () => {
        const { container } = render(<HomeInquiryCTA />);

        expect(screen.getByTestId('home-inquiry-cta-button')).toHaveAttribute('href', '/inquiry');
        expect(screen.getByTestId('home-inquiry-cta-button')).toHaveTextContent('제작 문의하기');
        expect(container.textContent).toContain('만들고 싶은 웹사이트가 있나요?');
        expect(container.textContent).toContain(
            '제작 목적이나 현재 불편한 점을 알려주세요. 필요한 기능부터 함께 살펴보겠습니다.'
        );
        expect(container.textContent).not.toContain('A SMALL SPACE');
        expect(container.textContent).not.toContain('JUST FOR FUN');
        // 기획서 안내는 홈 첫 화면에만 남긴다.
        expect(container.textContent).not.toContain('기획서');
    });

    it('keeps the no-plan reassurance out of the repeated home sections', () => {
        const container = renderHome();
        // FAQ 는 '기획서가 없어도 문의할 수 있나요?' 질문 자체를 다루므로 제외하고 센다.
        const faq = container.querySelector('[data-testid=home-faq]');
        const faqText = faq?.textContent ?? '';
        const text = (container.textContent ?? '').split(faqText).join('');

        expect(text.split('기획서').length - 1).toBe(1);
    });

    it('repeats the inquiry action only twice across the home body', () => {
        const container = renderHome();

        const inquiryLinks = Array.from(container.querySelectorAll('a[href^="/inquiry"]'));
        expect(inquiryLinks).toHaveLength(2);
    });
});
