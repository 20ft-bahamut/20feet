/**
 * Development-only Portfolio fixtures for design verification.
 *
 * These items are explicitly marked as `isFixture: true` and are intended to
 * preview the SelectedPortfolio layout when real public projects are not yet
 * available. They must NOT be rendered in production as if they were real
 * portfolio entries.
 */

import type { PortfolioItem } from '../types/template';

export const portfolioFixtures: PortfolioItem[] = [
    {
        id: 'fixture-purepol',
        slug: 'purepol',
        title: 'PurePol',
        summary: 'AIoT 제빙기 위생관리 플랫폼',
        types: ['SOFTWARE', 'WEB'],
        year: '2026',
        status: 'BUILDING',
        isFixture: true,
    },
    {
        id: 'fixture-20ft-website',
        slug: '20ft-website',
        title: '20ft Website',
        summary: 'Software Studio 브랜드와 G7 User Template을 구축하는 자체 프로젝트.',
        types: ['WEB', 'SOFTWARE'],
        year: '2026',
        status: 'OPERATING',
        isFixture: true,
    },
    {
        id: 'fixture-preview-project',
        slug: 'preview-project',
        title: 'Preview Project',
        summary: 'Development fixture. 실제 스크린샷이 준비되면 교체할 예정인 레이아웃 테스트용 항목입니다.',
        types: ['SOFTWARE', 'WEB'],
        year: '2026',
        status: 'BUILDING',
        isFixture: true,
    },
];
