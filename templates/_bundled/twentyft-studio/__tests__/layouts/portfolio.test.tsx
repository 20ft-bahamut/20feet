import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PortfolioList from '../../src/components/PortfolioList';
import PortfolioDetail from '../../src/components/PortfolioDetail';
import type { PortfolioItem, SuperBifyItem } from '../../src/types/template';

const item: PortfolioItem = {
    id: 'p1',
    slug: 'saas',
    title: '퓨어폴 SaaS',
    summary: '제빙기 위생관리 업무를 통합한 B2B SaaS입니다.',
    types: ['SOFTWARE'],
    year: '2026',
    status: 'RELEASED',
    role: ['CTO'],
    techStack: ['svelte', 'CI4'],
    relatedUrl: 'https://purepol.kr',
    coverImageUrl: '/api/example/cover',
    galleryImageUrls: ['/api/example/cover'],
};

const demo: SuperBifyItem = {
    id: 's1',
    slug: 'superbify-commerce-minimal',
    title: 'SuperBify Commerce Minimal',
    type: 'TEMPLATE',
    summary: '브랜드와 상품이 중심이 되도록 다시 디자인한 커머스 템플릿입니다.',
    status: 'RELEASED',
    compatibility: '7.0.0+',
    coverImageUrl: '/api/example/demo-cover',
};

describe('portfolio list', () => {
    it('uses the plain page title and describes what can be seen', () => {
        render(<PortfolioList items={[item]} demos={[demo]} />);

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('제작 사례');
        expect(screen.getByTestId('portfolio-list-page').textContent).toContain(
            '웹사이트와 업무 시스템, 직접 개발한 쇼핑몰 화면을 살펴보세요.'
        );
    });

    it('does not describe internal content policy to the visitor', () => {
        const { container } = render(<PortfolioList items={[item]} demos={[demo]} />);
        const text = container.textContent ?? '';

        expect(text).not.toMatch(/표시하지 않고|따로 안내|구분해 소개|자체 개발 제품으로/);
    });

    it('shows client projects and in-house demos in one list with distinct badges', () => {
        render(<PortfolioList items={[item]} demos={[demo]} />);

        const badges = screen.getAllByTestId('portfolio-item-kind').map((el) => el.textContent);
        expect(badges).toEqual(['고객 프로젝트', '자체 제작']);
        expect(screen.getAllByTestId('portfolio-item')).toHaveLength(2);
    });

    it('links each entry to its own detail page', () => {
        render(<PortfolioList items={[item]} demos={[demo]} />);

        const links = screen.getAllByTestId('portfolio-item-link');
        expect(links[0]).toHaveAttribute('href', '/portfolio/saas');
        expect(links[1]).toHaveAttribute('href', '/superbify/superbify-commerce-minimal');
    });

    it('shows the year that comes from the data, not a hardcoded one', () => {
        render(<PortfolioList items={[item]} demos={[]} />);

        expect(screen.getByTestId('portfolio-list-page').textContent).toContain('2026');
        expect(screen.getByTestId('portfolio-list-page').textContent).not.toContain('2006');
    });

    it('does not leave an empty grid cell when only one case exists', () => {
        const { container } = render(<PortfolioList items={[item]} demos={[]} />);

        expect(container.querySelectorAll('[data-testid=portfolio-item]')).toHaveLength(1);
        // 한 건이어도 화면 전체를 쓰는 한 줄이다 — 반쪽짜리 격자를 만들지 않는다.
        const grid = container.querySelector('[data-testid=portfolio-item]') as HTMLElement;
        expect(grid.style.gridTemplateColumns).toContain('--20ft-case-row-columns');
    });

    it('renders a loading skeleton rather than an empty state while pending', () => {
        render(<PortfolioList />);

        expect(screen.getByTestId('portfolio-list-loading')).toBeInTheDocument();
        expect(screen.queryByTestId('status')).not.toBeInTheDocument();
    });

    it('renders an empty state when nothing is published', () => {
        render(<PortfolioList items={[]} demos={[]} />);

        expect(screen.getByTestId('status')).toHaveTextContent('공개할 수 있는 사례를 준비하고 있습니다.');
    });
});

describe('portfolio detail', () => {
    it('renders loading skeleton while the data source is pending', () => {
        render(<PortfolioDetail item={null} loading />);

        expect(screen.getByTestId('portfolio-detail-loading')).toBeInTheDocument();
        expect(screen.queryByTestId('portfolio-detail-missing')).not.toBeInTheDocument();
    });

    it('renders a not-found state with null data', () => {
        render(<PortfolioDetail item={null} slug="unknown" />);

        expect(screen.getByTestId('portfolio-detail-missing')).toBeInTheDocument();
        expect(screen.getByText('프로젝트를 찾을 수 없습니다')).toBeInTheDocument();
    });

    it('keeps the previous public address working by pointing to the current one', () => {
        render(<PortfolioDetail item={null} slug="purepol-saas" />);

        const notice = screen.getByTestId('portfolio-detail-legacy-notice');
        expect(notice).toHaveTextContent('주소가 바뀌었습니다');
        expect(notice.querySelector('a')).toHaveAttribute('href', '/portfolio/saas');
    });

    it('does not add a legacy notice for an unrelated unknown slug', () => {
        render(<PortfolioDetail item={null} slug="no-such-case" />);

        expect(screen.queryByTestId('portfolio-detail-legacy-notice')).not.toBeInTheDocument();
    });

    it('labels the recorded title as a role, not as the delivered scope', () => {
        render(<PortfolioDetail item={item} slug="saas" />);

        const meta = screen.getByTestId('portfolio-detail-meta');
        expect(meta).toHaveTextContent('역할');
        expect(meta).toHaveTextContent('CTO');
        expect(meta).not.toHaveTextContent('담당 범위');
    });

    it('does not claim solo delivery or invent results', () => {
        const { container } = render(<PortfolioDetail item={item} slug="saas" />);
        const text = container.textContent ?? '';

        expect(text).not.toMatch(/단독|혼자|1인 개발|절감|향상|%|배 이상/);
    });

    it('shows the real project facts and links to the live service', () => {
        render(<PortfolioDetail item={item} slug="saas" />);

        const page = screen.getByTestId('portfolio-detail-page');
        expect(page.textContent).toContain('2026');
        expect(page.textContent).toContain('svelte');
        expect(page.textContent).toContain('https://purepol.kr');
        expect(screen.getByTestId('portfolio-detail-inquiry')).toHaveAttribute(
            'href',
            '/inquiry?type=INTERNAL_SYSTEM'
        );
    });

    it('renders the board HTML body safely', () => {
        const withHtml: PortfolioItem = {
            ...item,
            description: '<p><strong>PurePol SaaS</strong>는 B2B SaaS입니다.</p><script>alert(1)</script>',
        };

        const { container } = render(<PortfolioDetail item={withHtml} slug="saas" />);

        expect(container.querySelector('strong')).not.toBeNull();
        expect(container.querySelector('script')).toBeNull();
        expect(container.textContent).not.toContain('<p>');
    });
});
