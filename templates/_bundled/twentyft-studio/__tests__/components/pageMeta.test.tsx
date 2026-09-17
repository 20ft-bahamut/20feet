import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import HomeHero from '../../src/components/HomeHero';
import PortfolioDetail from '../../src/components/PortfolioDetail';
import SuperBifyDetail from '../../src/components/SuperBifyDetail';
import { PAGE_META, detailMeta } from '../../src/content/seo';
import { screenshotKind } from '../../src/content/demos';
import type { PortfolioItem, SuperBifyItem } from '../../src/types/template';

const portfolioItem: PortfolioItem = {
    id: 'p1',
    slug: 'saas',
    title: '퓨어폴 SaaS',
    summary: '제빙기 위생관리 업무를 통합한 B2B SaaS입니다.',
    types: ['SOFTWARE'],
};

const superbifyItem: SuperBifyItem = {
    id: 's1',
    slug: 'superbify-commerce-minimal',
    title: 'SuperBify Commerce Minimal',
    type: 'TEMPLATE',
    summary: '커머스 템플릿',
    screenshotImageUrls: [
        '/api/modules/sirsoft-board/boards/superbify/attachment/MMpe83IsLNEH/preview',
        '/api/modules/sirsoft-board/boards/superbify/attachment/RUwz6HCqh1oZ/preview',
    ],
    links: { github: 'https://example.com/repo' },
};

function metaCount(name: string): number {
    return document.head.querySelectorAll(`meta[name="${name}"]`).length;
}

describe('page meta', () => {
    beforeEach(() => {
        document.head.innerHTML = '';
        document.title = '이십피트';
    });

    it('gives each fixed path its own title and description', () => {
        render(<HomeHero />);

        expect(document.title).toBe('홈페이지·쇼핑몰·웹프로그램 제작 | 이십피트');
        expect(metaCount('description')).toBe(1);
    });

    it('does not create duplicate description or canonical tags on re-render', () => {
        const { unmount } = render(<HomeHero />);
        unmount();
        render(<HomeHero />);

        expect(metaCount('description')).toBe(1);
        expect(document.head.querySelectorAll('link[rel=canonical]').length).toBe(1);
    });

    it('builds canonical from the current origin, never a hardcoded host', () => {
        render(<HomeHero />);

        const canonical = document.head.querySelector('link[rel=canonical]')?.getAttribute('href') ?? '';
        expect(canonical.endsWith('/')).toBe(true);
        expect(canonical).not.toContain('20ft.io');
    });

    it('titles a work detail with the project name', () => {
        render(<PortfolioDetail item={portfolioItem} slug="saas" />);

        expect(document.title).toBe('퓨어폴 SaaS | 이십피트');
    });

    it('points the old address at the representative one', () => {
        render(<PortfolioDetail item={portfolioItem} slug="saas" canonicalPath="/portfolio/saas" />);

        const canonical = document.head.querySelector('link[rel=canonical]')?.getAttribute('href') ?? '';
        expect(canonical.endsWith('/portfolio/saas')).toBe(true);
    });

    it('titles a product detail with the product name', () => {
        render(<SuperBifyDetail item={superbifyItem} />);

        expect(document.title).toBe('SuperBify Commerce Minimal | 이십피트');
    });

    it('falls back to the list title when the entity is not loaded yet', () => {
        expect(detailMeta(undefined, '/portfolio').title).toBe(PAGE_META['/portfolio'].title);
    });
});

describe('screenshot classification', () => {
    it('separates real UI screens from brand and product images', () => {
        expect(
            screenshotKind('/api/modules/sirsoft-board/boards/superbify/attachment/MMpe83IsLNEH/preview'),
        ).toBe('ui');
        expect(
            screenshotKind('/api/modules/sirsoft-board/boards/superbify/attachment/RUwz6HCqh1oZ/preview'),
        ).toBe('brand');
    });

    it('treats an unknown attachment as a screen rather than hiding it', () => {
        expect(screenshotKind('/api/modules/sirsoft-board/boards/superbify/attachment/UNKNOWN/preview')).toBe('ui');
    });
});
