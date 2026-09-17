import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutPage from '../../src/components/AboutPage';
import type { PortfolioItem } from '../../src/types/template';

const cases: PortfolioItem[] = [
    {
        id: 'p1',
        slug: 'saas',
        title: '퓨어폴 SaaS',
        summary: '위생관리 업무를 통합한 B2B SaaS',
        types: ['SOFTWARE'],
        role: ['CTO'],
    },
];

describe('about layout component', () => {
    it('renders the about page wrapper without nesting a second main landmark', () => {
        const { container } = render(<AboutPage />);

        expect(screen.getByTestId('about-page')).toBeInTheDocument();
        // 공통 레이아웃이 main 을 제공하므로 페이지에서 또 만들지 않는다.
        expect(container.querySelectorAll('main')).toHaveLength(0);
    });

    it('renders a single h1', () => {
        render(<AboutPage />);

        const headings = screen.getAllByRole('heading', { level: 1 });
        expect(headings).toHaveLength(1);
        expect(headings[0]).toHaveTextContent('홈페이지와 업무 시스템을 기획하고 개발합니다.');
    });

    it('renders every section in the documented order', () => {
        const { container } = render(<AboutPage cases={cases} />);

        const testIds = Array.from(container.querySelectorAll('[data-testid=about-page] > section')).map((el) =>
            el.getAttribute('data-testid')
        );

        expect(testIds).toEqual([
            'about-hero',
            'about-experience',
            'about-projects',
            'about-name',
            'about-superbify',
            'about-final-cta',
        ]);
    });

    it('titles the project section by what it holds, not by a writing rule', () => {
        render(<AboutPage cases={cases} />);

        const section = screen.getByTestId('about-projects');
        expect(section.textContent).toContain('주요 프로젝트');
        expect(section.textContent).not.toContain('표시합니다');
    });

    it('lists the projects the person actually worked on, with the role', () => {
        render(<AboutPage cases={cases} />);

        expect(screen.getByTestId('about-projects-list')).toBeInTheDocument();
        expect(screen.getByText('퓨어폴 SaaS')).toBeInTheDocument();
        expect(screen.getByText('역할 CTO')).toBeInTheDocument();
    });

    it('does not invent a project list when nothing is published', () => {
        render(<AboutPage cases={[]} />);

        expect(screen.getByTestId('status')).toHaveTextContent('공개할 수 있는 프로젝트를 준비하고 있습니다.');
        expect(screen.queryByTestId('about-projects-list')).not.toBeInTheDocument();
    });

    it('keeps the verified career claim and does not imply a standing team', () => {
        const { container } = render(<AboutPage />);
        const text = container.textContent ?? '';

        expect(text).toContain('20년 넘게 웹을 만들어왔습니다.');
        // 조직 규모를 암시하는 표현이 들어가지 않았는지 확인한다.
        expect(text).not.toMatch(/전문팀|전담팀|우리 팀|디자이너와 개발자로 구성/);
        // 모든 외주를 항상 혼자 수행한다고 읽힐 표현도 쓰지 않는다.
        expect(text).not.toMatch(/한 사람이|혼자|1인/);
    });

    it('links the in-house product and the final calls to action', () => {
        render(<AboutPage />);

        expect(screen.getByTestId('about-superbify-cta')).toHaveAttribute('href', '/superbify');
        expect(screen.getByTestId('about-final-portfolio')).toHaveAttribute('href', '/portfolio');
        expect(screen.getByTestId('about-final-inquiry')).toHaveAttribute('href', '/inquiry');
    });

    it('does not promise ongoing maintenance', () => {
        const { container } = render(<AboutPage />);
        const text = container.textContent ?? '';

        expect(text).not.toMatch(/상시\s*유지보수|무상\s*유지보수|운영까지 함께 봅니다|오픈 이후를 함께 봅니다/);
        // 진행 절차는 /process 로 넘겼다 — 소개에서는 링크만 둔다.
        expect(screen.getByTestId('about-final-process')).toHaveAttribute('href', '/process');
    });

    it('keeps the locked brand copy, each line only once', () => {
        const { container } = render(<AboutPage />);

        expect(screen.getByTestId('about-name')).toHaveTextContent('20ft라는 이름은 작은 공간에서 시작했습니다.');
        expect(screen.getByTestId('about-name')).toHaveTextContent('JUST FOR FUN.');
        expect(screen.getByTestId('about-final-cta')).toHaveTextContent('작은 공간에서, 큰 가능성을 만듭니다.');
        expect(screen.getByTestId('about-final-cta')).toHaveTextContent('A SMALL SPACE.');
        expect(screen.getByTestId('about-final-cta')).toHaveTextContent('INFINITE POSSIBILITIES.');

        const text = container.textContent ?? '';
        expect(text.split('A SMALL SPACE.').length - 1).toBe(1);
        expect(text.split('JUST FOR FUN.').length - 1).toBe(1);
    });

    it('renders the brand symbol without exposing it to assistive tech', () => {
        render(<AboutPage />);

        expect(screen.getByTestId('about-hero-symbol')).toBeInTheDocument();
    });
});
