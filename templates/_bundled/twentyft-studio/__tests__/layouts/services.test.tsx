import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ServicesList from '../../src/components/ServicesList';
import ServicePage from '../../src/components/ServicePage';
import { SERVICES } from '../../src/content/services';
import type { PortfolioItem, SuperBifyItem } from '../../src/types/template';

const demo: SuperBifyItem = {
    id: 's1',
    slug: 'superbify-commerce-minimal',
    title: 'SuperBify Commerce Minimal',
    type: 'TEMPLATE',
    summary: '미니멀 커머스 템플릿',
    compatibility: '7.0.0+',
    coverImageUrl: '/api/example/demo',
};

const softwareCase: PortfolioItem = {
    id: 'p1',
    slug: 'saas',
    title: '퓨어폴 SaaS',
    summary: '위생관리 업무를 통합한 B2B SaaS',
    types: ['SOFTWARE'],
    role: ['CTO'],
    coverImageUrl: '/api/example/cover',
};

describe('services list page', () => {
    it('compares the three services and links each detail page', () => {
        render(<ServicesList />);

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('사업에 필요한 웹사이트를 제작합니다.');
        for (const service of SERVICES) {
            expect(screen.getByTestId(`service-${service.key}`)).toBeInTheDocument();
            expect(screen.getByTestId(`service-${service.key}-detail`)).toHaveAttribute('href', service.path);
        }
    });

    it('preselects the matching inquiry type from each card', () => {
        render(<ServicesList />);

        expect(screen.getByTestId('service-website-inquiry')).toHaveAttribute('href', '/inquiry?type=WEB');
        expect(screen.getByTestId('service-commerce-inquiry')).toHaveAttribute('href', '/inquiry?type=COMMERCE');
        expect(screen.getByTestId('service-web-development-inquiry')).toHaveAttribute(
            'href',
            '/inquiry?type=INTERNAL_SYSTEM'
        );
    });

    it('publishes no price table', () => {
        const { container } = render(<ServicesList />);
        const text = container.textContent ?? '';

        expect(text).not.toMatch(/만원|최저가|견적표|가격표/);
    });
});

describe('service detail pages', () => {
    it('renders a distinct heading for each service', () => {
        const headings = new Set<string>();

        for (const service of SERVICES) {
            const { unmount } = render(<ServicePage service={service.key} />);
            headings.add(screen.getByRole('heading', { level: 1 }).textContent ?? '');
            unmount();
        }

        expect(headings.size).toBe(SERVICES.length);
    });

    it('renders each section a service defines', () => {
        render(<ServicePage service="website" />);

        const website = SERVICES.find((s) => s.key === 'website');
        expect(website).toBeDefined();
        for (let index = 0; index < (website?.sections.length ?? 0); index += 1) {
            expect(screen.getByTestId(`service-section-${index}`)).toBeInTheDocument();
        }
    });

    it('shows the in-house commerce demo labelled as such, not as a client delivery', () => {
        render(<ServicePage service="commerce" demos={[demo]} />);

        const block = screen.getByTestId('service-demo-evidence');
        expect(block).toHaveTextContent('자체 제작');
        expect(block).toHaveTextContent('미니멀 쇼핑몰 제작 예시');
        // 제품명과 호환성 정보는 일반 고객용 화면에서 앞세우지 않는다.
        expect(block).toHaveTextContent('제품명 SuperBify Commerce Minimal');
        expect(block).not.toHaveTextContent('7.0.0+');
    });

    it('shows the real internal-system case with the covered scope', () => {
        render(<ServicePage service="web-development" cases={[softwareCase]} />);

        const block = screen.getByTestId('service-case-evidence');
        expect(block).toHaveTextContent('고객 프로젝트');
        expect(block).toHaveTextContent('역할 CTO');
    });

    it('does not fabricate evidence when nothing is published', () => {
        render(<ServicePage service="commerce" demos={[]} />);

        expect(screen.getByTestId('status')).toHaveTextContent('공개할 수 있는 화면을 준비하고 있습니다.');
    });

    it('carries the service inquiry type into the inquiry link', () => {
        render(<ServicePage service="commerce" />);

        expect(screen.getByTestId('service-page-inquiry')).toHaveAttribute('href', '/inquiry?type=COMMERCE');
    });

    it('does not expose internal cautions as customer copy', () => {
        const { container } = render(<ServicePage service="commerce" />);
        const text = container.textContent ?? '';

        expect(text).not.toContain('약속하지 않습니다');
        expect(text).not.toContain('약속하지는 않습니다');
        expect(text).not.toMatch(/무료|무제한|100%|24시간/);
    });

    it('guides the payment and shipping scope in one plain sentence', () => {
        render(<ServicePage service="commerce" />);

        expect(screen.getByTestId('service-page-commerce').textContent).toContain(
            '사용할 결제 수단과 배송 방식에 맞춰 연동 범위를 안내합니다.'
        );
    });

    it('puts the evidence after the explanation, not before it', () => {
        render(<ServicePage service="commerce" demos={[demo]} />);

        const page = screen.getByTestId('service-page-commerce');
        const text = page.textContent ?? '';
        expect(text.indexOf('쇼핑몰 제작 예시')).toBeGreaterThan(-1);
        expect(text.indexOf('쇼핑몰 제작 예시')).toBeLessThan(text.lastIndexOf('미니멀 쇼핑몰 제작 예시'));
    });
});
