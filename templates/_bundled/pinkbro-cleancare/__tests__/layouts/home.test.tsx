import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Hero } from '../../src/components/Hero';
import { AboutSection } from '../../src/components/AboutSection';
import { ServiceGrid } from '../../src/components/ServiceGrid';
import { PackageList } from '../../src/components/PackageList';
import { PriceDiscount } from '../../src/components/PriceDiscount';
import { FaqList } from '../../src/components/FaqList';
import { CaseGallery } from '../../src/components/CaseGallery';
import { EstimateCalculator } from '../../src/components/EstimateCalculator';
import { InquiryForm } from '../../src/components/InquiryForm';
import type { CopyData, DiscountStep, FaqItem, MediaSlots, PackageItem, ServiceItem, SiteData } from '../../src/lib/types';
import homeLayout from '../../layouts/home.json';
import baseLayout from '../../layouts/_user_base.json';
import routes from '../../routes.json';
import componentsManifest from '../../components.json';
import templateMetadata from '../../template.json';
import ko from '../../lang/ko.json';
import en from '../../lang/en.json';

/**
 * 홈 레이아웃 계약 테스트 (Task 13).
 *
 * 참조 studio / 이 템플릿의 `__tests__/layouts/base.test.tsx` 와 같이 코어 레이아웃
 * testUtils 를 쓰지 않는다. 레이아웃 JSON 은 직접 import 해 구조를 검증하고,
 * 섹션 composite 은 레이아웃이 선언한 props 모양 그대로 렌더해 계약을 확인한다.
 *
 * 이 레이아웃이 지는 네 가지 계약:
 *   1. 모듈 data_sources 8종 선언 — base 레이아웃이 페이지 스코프에서 바인딩한다
 *   2. 8개 앵커(`top`/`about`/…/`estimate`)가 섹션 래퍼에 정확히 1회
 *   3. 노드 이름은 components.json 등록분만, `iteration` 없음
 *   4. SEO — JSON-LD 3종(Organization / LocalBusiness / FAQPage 8문항)
 */

const layout = homeLayout as any;

const ANCHORS = ['top', 'about', 'service', 'package', 'pricing', 'faq', 'projects', 'estimate'] as const;

/** 레이아웃이 선언한 data_source id (base 가 페이지 스코프에서 바인딩하는 이름) */
const DATA_SOURCE_IDS = [
    'pinkbro_site',
    'pinkbro_copy',
    'pinkbro_discount',
    'pinkbro_services',
    'pinkbro_packages',
    'pinkbro_cases',
    'pinkbro_faq',
    'pinkbro_media',
] as const;

/** 섹션 순서와 그 안에 놓인 composite. `estimate` 만 두 개를 가진다. */
const SECTION_ORDER: Array<[anchor: string, components: string[]]> = [
    ['top', ['Hero']],
    ['about', ['AboutSection']],
    ['service', ['ServiceGrid']],
    ['package', ['PackageList']],
    ['pricing', ['PriceDiscount']],
    ['faq', ['FaqList']],
    ['projects', ['CaseGallery']],
    ['estimate', ['EstimateCalculator', 'InquiryForm']],
];

/** 섹션 노드 목록 (slots.content) */
const sections: any[] = layout.slots?.content ?? [];

/** 노드 트리를 순회하며 콜백을 적용한다 */
function walkNodes(node: any, visit: (n: any) => void): void {
    if (Array.isArray(node)) {
        node.forEach((n) => walkNodes(n, visit));
        return;
    }
    if (node && typeof node === 'object') {
        if (typeof node.name === 'string') {
            visit(node);
        }
        Object.values(node).forEach((value) => walkNodes(value, visit));
    }
}

/** 레이아웃 JSON 안의 모든 `$t:` 토큰을 모은다 */
function collectTranslationTokens(value: any, tokens = new Set<string>()): Set<string> {
    if (typeof value === 'string') {
        const match = /^\$t:([A-Za-z0-9_.]+)$/.exec(value);
        if (match) {
            tokens.add(match[1]);
        }
        return tokens;
    }
    if (Array.isArray(value)) {
        value.forEach((v) => collectTranslationTokens(v, tokens));
        return tokens;
    }
    if (value && typeof value === 'object') {
        Object.values(value).forEach((v) => collectTranslationTokens(v, tokens));
    }
    return tokens;
}

/** `a.b.c` 형태의 lang 키를 중첩 객체에서 찾는다 */
function resolveLangKey(dictionary: any, key: string): unknown {
    return key.split('.').reduce<any>((acc, part) => (acc == null ? undefined : acc[part]), dictionary);
}

const registeredNames = new Set<string>(
    Object.values((componentsManifest as any).components)
        .flat()
        .map((component: any) => component.name),
);

describe('home layout — 라우팅 계약', () => {
    it('layout_name is exactly "home" — no template prefix', () => {
        // G7 은 layout_name 을 DB name 으로 그대로 저장하고 정확히 일치하는 이름으로 찾는다.
        // 접두사를 붙이면 routes.json 의 "layout": "home" 이 해석되지 않아 홈이 렌더되지 않는다.
        expect(layout.layout_name).toBe('home');
        expect(layout.layout_name).not.toContain(':');
        expect(layout.layout_name).not.toContain('/');
    });

    it('is the layout routes.json points the "/" route at', () => {
        const homeRoute = (routes as any).routes.find((route: any) => route.path === '/');

        expect(homeRoute).toBeDefined();
        expect(homeRoute.layout).toBe(layout.layout_name);
    });

    it('extends the template base layout and is not itself a base', () => {
        expect(layout.extends).toBe((baseLayout as any).layout_name);
        expect(layout.meta.is_base).toBeUndefined();
        expect((baseLayout as any).meta.is_base).toBe(true);
    });

    it('declares the module in template.json dependencies', () => {
        // data_source endpoint 들이 향하는 모듈이 설치 대상에 있어야 한다.
        const endpoints: string[] = layout.data_sources.map((source: any) => source.endpoint);
        const modules = new Set(
            endpoints.map((endpoint) => endpoint.split('/')[3]), // /api/modules/{module}/...
        );

        for (const moduleId of modules) {
            expect(
                Object.keys((templateMetadata as any).dependencies.modules),
                `module ${moduleId}`,
            ).toContain(moduleId);
        }
    });
});

describe('home layout — data_sources', () => {
    it('declares every module data source, in order, with the module endpoints', () => {
        expect(layout.data_sources.map((source: any) => source.id)).toEqual([...DATA_SOURCE_IDS]);
    });

    it('declares each source as an auto-fetched GET on the pinkbro-contents module', () => {
        for (const source of layout.data_sources) {
            expect(source.type).toBe('api');
            expect(source.method).toBe('GET');
            expect(source.auto_fetch).toBe(true);
            expect(source.endpoint.startsWith('/api/modules/pinkbro-contents/')).toBe(true);
        }
    });

    it('blocks only on site and copy — the header and hero copy precede first paint', () => {
        const blocking = layout.data_sources
            .filter((source: any) => source.loading_strategy === 'blocking')
            .map((source: any) => source.id);

        expect(blocking).toEqual(['pinkbro_site', 'pinkbro_copy']);
        for (const source of layout.data_sources) {
            expect(['blocking', 'progressive']).toContain(source.loading_strategy);
        }
    });

    it('declares no source the base layout already owns — base declares none', () => {
        // 중복 fetch 방지: base 는 data_sources 를 비우고 home 이 전부 소유한다.
        expect((baseLayout as any).data_sources).toEqual([]);

        const declared = new Set(layout.data_sources.map((source: any) => source.id));
        for (const bound of ['pinkbro_site', 'pinkbro_copy', 'pinkbro_media']) {
            // base 가 바인딩하는 이름은 home 이 선언한 id 여야 한다.
            expect(declared.has(bound), bound).toBe(true);
        }
    });
});

describe('home layout — 섹션 · 앵커', () => {
    it('lays the eight sections out in source order, one anchor node each', () => {
        const shape = sections.map((section: any) => [
            section.id,
            (section.children ?? []).map((child: any) => child.name),
        ]);

        expect(shape).toEqual(SECTION_ORDER);
    });

    it('gives every section wrapper a top-level id and no props.className', () => {
        for (const section of sections) {
            expect(section.type).toBe('basic');
            expect(section.name).toBe('Div');
            expect(section.props?.className).toBeUndefined();
        }
    });

    it('carries each of the eight anchors exactly once', () => {
        const nodeIds: string[] = [];
        walkNodes(sections, (node) => {
            if (typeof node.id === 'string') {
                nodeIds.push(node.id);
            }
        });

        // 앵커 id 는 노드 top-level id 로만 표현된다 — 엔진이 DOM id 로 출력하는 자리다.
        for (const anchor of ANCHORS) {
            expect(nodeIds.filter((id) => id === anchor), anchor).toHaveLength(1);
        }
    });

    it('uses exactly the eight anchor ids — no extra or missing section anchor', () => {
        expect(layout.slots.content.map((section: any) => section.id)).toEqual([...ANCHORS]);
    });

    it('keeps every node id unique — slot 등록·DOM id 모두 노드 id 를 쓴다', () => {
        const nodeIds: string[] = [];
        walkNodes(layout.slots.content, (node) => {
            if (typeof node.id === 'string') {
                nodeIds.push(node.id);
            }
        });

        expect(new Set(nodeIds).size).toBe(nodeIds.length);
    });

    it('places the calculator and the inquiry form under the single estimate anchor', () => {
        const estimate = sections.find((section: any) => section.id === 'estimate');

        expect(estimate.children.map((child: any) => child.name)).toEqual([
            'EstimateCalculator',
            'InquiryForm',
        ]);
        // 계산기 CTA(`#estimate`)와 헤더 nav 가 가리키는 목적지가 이 노드 하나다.
        expect(estimate.children.every((child: any) => child.id !== 'estimate')).toBe(true);
    });

    it('never iterates — composite 컴포넌트가 자기 목록을 그린다', () => {
        walkNodes(layout.slots.content, (node) => {
            expect(node.iteration, node.id).toBeUndefined();
        });
        expect(JSON.stringify(layout)).not.toContain('"iteration"');
    });
});

describe('home layout — 노드 이름 · 속성 배치 · lang', () => {
    it('uses only composite names registered in components.json', () => {
        const used = new Set<string>();
        walkNodes(layout.slots.content, (node) => {
            used.add(node.name);
        });

        expect([...used].filter((name) => !registeredNames.has(name))).toEqual([]);
    });

    it('uses only the components the template metadata registers', () => {
        const declaredComposite = new Set<string>((templateMetadata as any).components.composite);

        for (const section of sections) {
            for (const child of section.children ?? []) {
                expect(declaredComposite.has(child.name), child.name).toBe(true);
            }
        }
    });

    it('keeps className inside props and text/style at the top level', () => {
        walkNodes(layout.slots.content, (node) => {
            expect(node.className).toBeUndefined();
            expect(node.href).toBeUndefined();
            expect(node.props?.text).toBeUndefined();
            expect(node.props?.src).toBeUndefined();
            expect(node.props?.style).toBeUndefined();
        });
    });

    it('types no page copy into the layout — every bound string is a binding or a $t: key', () => {
        walkNodes(layout.slots.content, (node) => {
            for (const value of Object.values(node.props ?? {})) {
                if (typeof value !== 'string') {
                    continue;
                }
                const isBinding = value.startsWith('{{') && value.endsWith('}}');
                expect(isBinding, `${node.id}.${value}`).toBe(true);
            }

            if (typeof node.text === 'string') {
                expect(node.text.startsWith('$t:')).toBe(true);
            }
        });
    });

    it('resolves every $t: token in both ko and en', () => {
        const tokens = [...collectTranslationTokens(layout.meta)];

        expect(tokens.length).toBeGreaterThan(0);
        for (const token of tokens) {
            expect(resolveLangKey(ko, token), `ko:${token}`).toBeTypeOf('string');
            expect(resolveLangKey(en, token), `en:${token}`).toBeTypeOf('string');
            expect(resolveLangKey(ko, token)).not.toBe('');
            expect(resolveLangKey(en, token)).not.toBe('');
        }
    });
});

describe('home layout — props 계약', () => {
    /** 레이아웃이 각 composite 에 바인딩한 prop 이름 (컴포넌트 인터페이스와 1:1 이어야 한다) */
    const BOUND_PROPS: Record<string, string[]> = {
        Hero: ['copy', 'media', 'site'],
        AboutSection: ['copy', 'media'],
        ServiceGrid: [
            'detailLabel',
            'extraBody',
            'extraHeading',
            'intro',
            'introSub',
            'items',
            'media',
        ],
        PackageList: [
            'benefitHeading',
            'benefitItems',
            'benefitSub',
            'intro',
            'introSub',
            'items',
            'media',
        ],
        PriceDiscount: ['field', 'flow', 'flowLabel', 'heading', 'notice', 'noticeSub', 'steps', 'sub'],
        FaqList: ['intro', 'introSub', 'items'],
        CaseGallery: ['intro', 'items', 'note', 'sub'],
        EstimateCalculator: ['heading', 'services', 'site', 'steps', 'sub', 'summaryHeading', 'summaryNote'],
        InquiryForm: [
            'checklist',
            'intro',
            'media',
            'panelHeading',
            'panelNote',
            'panelSub',
            'services',
            'site',
            'sub',
        ],
    };

    it('binds exactly the props each composite declares', () => {
        const composites: any[] = [];
        walkNodes(layout.slots.content, (node) => {
            if (node.type === 'composite') {
                composites.push(node);
            }
        });

        expect(composites).toHaveLength(9);
        for (const node of composites) {
            const expected = BOUND_PROPS[node.name];

            expect(expected, node.name).toBeDefined();
            expect(Object.keys(node.props ?? {}).sort(), node.name).toEqual([...expected].sort());
        }
    });

    it('binds media to the three components that render an admin-uploadable slot', () => {
        // AboutSection(why_stage) · PackageList(package_stage) · InquiryForm(estimate_bg)
        for (const name of ['AboutSection', 'PackageList', 'InquiryForm']) {
            const node = sections
                .flatMap((section: any) => section.children ?? [])
                .find((child: any) => child.name === name);

            expect(node.props.media, name).toBe('{{pinkbro_media?.data ?? null}}');
        }
    });

    it('binds section copy from the module copy domain, never from the layout', () => {
        const copyBindings: string[] = [];
        walkNodes(layout.slots.content, (node) => {
            for (const value of Object.values(node.props ?? {})) {
                if (typeof value === 'string' && value.includes('pinkbro_copy')) {
                    copyBindings.push(value);
                }
            }
        });

        expect(copyBindings.length).toBeGreaterThan(0);
        expect(copyBindings.every((value) => value.startsWith('{{pinkbro_copy?.data'))).toBe(true);
    });
});

describe('home layout — SEO', () => {
    const seo = layout.meta.seo;

    it('enables SEO for the page and preloads the sources its expressions read', () => {
        expect(seo.enabled).toBe(true);
        expect(seo.data_sources).toEqual(['pinkbro_site', 'pinkbro_media']);
        for (const id of seo.data_sources) {
            expect(layout.data_sources.map((source: any) => source.id)).toContain(id);
        }
    });

    it('declares an og block whose title and description come from lang keys', () => {
        expect(seo.og.type).toBe('website');
        expect(seo.og.title).toBe('$t:pinkbro.seo.og_title');
        expect(seo.og.description).toBe('$t:pinkbro.seo.og_description');
    });

    it('points og:image at the site_og slot with the bundled asset as fallback', () => {
        expect(seo.og.image).toContain('pinkbro_media?.data?.site_og?.url');
        // 슬롯이 비어도 og:image 가 사라지지 않는다 (SPEC §10 R6).
        expect(seo.og.image).toContain(
            '/api/templates/assets/pinkbro-cleancare?file=images/og-image.png',
        );
    });

    it('bundles the og fallback asset in template.json', () => {
        const assets: string[] = (templateMetadata as any).assets.images;

        expect(assets).toContain('images/og-image.png');
    });

    it('carries the three JSON-LD graphs the source page declares', () => {
        const graph = seo.structured_data['@graph'];

        expect(Array.isArray(graph)).toBe(true);
        expect(graph.map((entry: any) => entry['@type'])).toEqual([
            'Organization',
            'LocalBusiness',
            'FAQPage',
        ]);
    });

    it('reproduces the Organization graph from the source page', () => {
        const organization = seo.structured_data['@graph'][0];

        expect(organization.name).toBe('핑크브로클린케어');
        expect(organization.alternateName).toEqual(['PINKBRO CLEANCARE', '핑크브로 클린케어']);
        expect(organization.telephone).toBe('+82-10-4348-8158');
        expect(organization.description).toContain('F&B 매장 전문 위생 클린케어 브랜드입니다.');
        // 로고는 사이트 og 슬롯 → 템플릿 자산 폴백 (JSON-LD 도 같은 이미지를 가리킨다).
        expect(organization.logo).toContain('images/og-image.png');
    });

    it('reproduces the LocalBusiness graph from the source page', () => {
        const local = seo.structured_data['@graph'][1];

        expect(local.name).toBe('핑크브로클린케어');
        expect(local.telephone).toBe('+82-10-4348-8158');
        expect(local.areaServed).toEqual(['부산', '울산', '경상남도']);
        expect(local.serviceType).toEqual([
            '바닥 기계세척',
            '유리창 세척',
            '접이식 어닝 세척',
            '간판 세척',
            '상업용 후드 세척',
            '에어컨 분해세척',
        ]);
        expect(local.slogan).toBe('깨끗한 공간, 더 나은 오늘');
        expect(local.image).toContain('images/og-image.png');
    });

    it('reproduces the FAQPage graph with the page’s eight questions', () => {
        const faqPage = seo.structured_data['@graph'][2];
        const questions = faqPage.mainEntity;

        expect(faqPage['@type']).toBe('FAQPage');
        expect(questions).toHaveLength(8);
        for (const entry of questions) {
            expect(entry['@type']).toBe('Question');
            expect(entry.name.length).toBeGreaterThan(0);
            expect(entry.acceptedAnswer['@type']).toBe('Answer');
            expect(entry.acceptedAnswer.text.length).toBeGreaterThan(0);
        }
    });

    it('writes the fourth answer in the copy the page actually shows', () => {
        // JSON-LD 원본과 본문 표시 카피가 갈리는 유일한 문항 — 본문 카피를 채택한다.
        const answer = seo.structured_data['@graph'][2].mainEntity[3].acceptedAnswer.text;

        expect(answer).toContain('벽걸이 80,000원~, 스탠드 120,000원~');
        expect(answer).not.toContain('80,000원부터, 스탠드');
    });

    it('keeps every FAQPage answer free of an empty field — 빈 값이면 G7 이 블록을 통째로 제거한다', () => {
        for (const entry of seo.structured_data['@graph'][2].mainEntity) {
            expect(entry.name).not.toBe('');
            expect(entry.acceptedAnswer.text).not.toBe('');
        }
        for (const entry of seo.structured_data['@graph']) {
            for (const [key, value] of Object.entries(entry)) {
                expect(value, `${entry['@type']}.${key}`).not.toBe('');
                expect(value, `${entry['@type']}.${key}`).not.toBeNull();
            }
        }
    });
});

describe('home layout — 섹션 composite 렌더', () => {
    const site: SiteData = {
        brand_name: '핑크브로클린케어',
        brand_name_en: 'PINKBRO CLEANCARE',
        tagline: '깨끗한 공간, 더 나은 오늘',
        eyebrow: null,
        phone: '010-4348-8158',
        kakao_channel: 'http://pf.kakao.com/_gmcuG',
        region: '부울경',
        og_image_slot: 'site_og',
    };

    const media: MediaSlots = {
        hero_main: { url: null, alt: null },
        why_stage: { url: '/uploads/why.png', alt: '왜 핑크브로인가' },
        package_stage: { url: '/uploads/package.png', alt: '패키지' },
        estimate_bg: { url: '/uploads/estimate.png', alt: '문의 배경' },
        site_og: { url: '/uploads/og.png', alt: '핑크브로클린케어' },
    };

    const copy: CopyData = {
        hero_headline: '작은 공간에서도\n깨끗함은 타협하지 않습니다.',
        hero_lead: 'F&B 매장 전문 위생 클린케어.',
        hero_pills: ['바닥', '유리창', '후드'],
        hero_visual_label: null,
        hero_visual_brand_message: null,
        hero_visual_body: null,
        hero_scope: null,
        about_heading: '왜 핑크브로인가',
        about_message: '매장을 쓰는 사람의 하루를 먼저 생각합니다.',
        about_side_heading: '브랜드 관점',
        about_perspectives: [{ title: '현장 기준', body: '현장에서 확인합니다.' }],
        service_intro: '서비스 안내',
        service_intro_sub: '서비스별 기본 작업 조건과 시작가를 먼저 확인할 수 있습니다.',
        service_detail_label: '자세한 작업기준 확인',
        extra_box_heading: '찾으시는 서비스가 목록에 없나요?',
        extra_box_body: '기타 관리가 필요하시면 문의해 주세요.',
        package_intro: '패키지 안내',
        package_intro_sub: '자주 선택하는 조합을 정리했습니다.',
        benefit_heading: '함께 맡길수록 더 효율적입니다.',
        benefit_sub: '서비스 종류 기준으로 항목을 계산합니다.',
        benefit_items: [{ condition: '2개 항목', amount_label: '3%' }],
        pricing_heading: '가격은 투명하게 안내합니다.',
        pricing_sub: '기본 작업 기준가를 먼저 보여드립니다.',
        pricing_notice: '표기 금액은 모두 기본 작업 기준가입니다.',
        pricing_notice_sub: '시작가를 먼저 공개합니다.',
        pricing_field: '확정 견적은 현장확인 원칙으로 진행합니다.',
        pricing_flow_label: 'Estimate Flow',
        pricing_flow: '기본가 확인 → 문의 접수 → 현장확인 후 확정견적',
        estimator_heading: '예상 기본금액을 먼저 확인해 보세요.',
        estimator_sub: '항목을 체크하면 합계와 할인율이 계산됩니다.',
        estimator_summary_heading: '예상 기본금액 요약',
        estimator_summary_note: '모든 금액은 기본 작업 기준가입니다.',
        faq_intro: '견적 전에 많이 묻는 내용을 먼저 확인해 보세요.',
        faq_intro_sub: '가격, 작업 기준, 출장지역을 정리했습니다.',
        projects_intro: '작업사례',
        projects_sub: '현장의 작업 내용과 전후 과정입니다.',
        projects_note: '자세한 내용은 블로그에서 확인할 수 있습니다.',
        estimate_intro: '필요한 내용을 남겨주시면 확인 후 안내드립니다.',
        estimate_note: '사진 없이 간단하게 접수할 수 있습니다.',
        estimate_checklist: ['간단한 정보만 남기면 됩니다.'],
        estimate_panel_heading: '간편견적 문의하기',
        estimate_panel_sub: '업종, 서비스와 규모, 연락처를 남겨주세요.',
        estimate_panel_note: '사진은 카카오채널로 보내주세요.',
        footer_text: '핑크브로클린케어',
        footer_brand_desc: 'F&B 매장 전문 위생 클린케어',
    };

    const services: ServiceItem[] = [
        {
            slug: 'floor-care',
            title: '바닥 기계세척',
            tag: 'Floor Care',
            summary: '바닥 기계세척 요약',
            criteria: '20평 미만 기준',
            base_price: '250,000',
            extra_note: '면적에 따라 달라집니다.',
            photo: { url: null, alt: null },
        },
        {
            slug: 'air-care',
            title: '에어컨 분해세척',
            tag: 'Air Care',
            summary: '에어컨 분해세척 요약',
            criteria: '기종별 기준',
            base_price: '100000',
            extra_note: '기종에 따라 달라집니다.',
            air_types: [
                { kind: '벽걸이', price_label: '80,000원', price_value: 80000 },
                { kind: '스탠드', price_label: '120,000원', price_value: 120000, default_selected: true },
            ],
            photo: { url: null, alt: null },
        },
    ];

    const packages: PackageItem[] = [
        {
            title: 'A 패키지',
            summary: '패키지 요약',
            includes: ['바닥 기계세척'],
            base_total: '250,000',
            price: '242,500',
            discount_rate: 3,
            is_featured: false,
        },
    ];

    const steps: DiscountStep[] = [{ condition: '2개 항목', amount_label: '3%' }];

    const faqItems: FaqItem[] = [
        { question: '상가 바닥 기계세척 비용은 얼마인가요?', answer: '기본 250,000원부터 시작합니다.' },
    ];

    it('renders the chrome-free sections with the props the layout binds', () => {
        // 레이아웃이 바인딩한 props 모양 그대로 — 컴포넌트 계약과 어긋나면 여기서 깨진다.
        render(<Hero site={site} copy={copy} media={media} />);
        expect(screen.getByTestId('hero')).toBeInTheDocument();

        render(<AboutSection copy={copy} media={media} />);
        expect(screen.getByTestId('about-section')).toBeInTheDocument();

        render(
            <>
                <ServiceGrid
                    intro={copy.service_intro}
                    introSub={copy.service_intro_sub}
                    detailLabel={copy.service_detail_label}
                    extraHeading={copy.extra_box_heading}
                    extraBody={copy.extra_box_body}
                    items={services}
                    media={media}
                />
                <PackageList
                    intro={copy.package_intro}
                    introSub={copy.package_intro_sub}
                    benefitHeading={copy.benefit_heading}
                    benefitSub={copy.benefit_sub}
                    benefitItems={copy.benefit_items}
                    items={packages}
                    media={media}
                />
                <PriceDiscount
                    heading={copy.pricing_heading}
                    sub={copy.pricing_sub}
                    notice={copy.pricing_notice}
                    noticeSub={copy.pricing_notice_sub}
                    field={copy.pricing_field}
                    flowLabel={copy.pricing_flow_label}
                    flow={copy.pricing_flow}
                    steps={steps}
                />
                <FaqList intro={copy.faq_intro} introSub={copy.faq_intro_sub} items={faqItems} />
                <CaseGallery
                    intro={copy.projects_intro}
                    sub={copy.projects_sub}
                    note={copy.projects_note}
                    items={[
                        {
                            title: '작업사례',
                            summary: '사례 요약',
                            blog_url: '',
                            cover: { url: null, alt: null },
                        },
                    ]}
                />
                <EstimateCalculator
                    heading={copy.estimator_heading}
                    sub={copy.estimator_sub}
                    summaryHeading={copy.estimator_summary_heading}
                    summaryNote={copy.estimator_summary_note}
                    services={services}
                    steps={steps}
                    site={site}
                />
                <InquiryForm
                    site={site}
                    services={services}
                    media={media}
                    intro={copy.estimate_intro}
                    sub={copy.estimate_note}
                    checklist={copy.estimate_checklist}
                    panelHeading={copy.estimate_panel_heading}
                    panelSub={copy.estimate_panel_sub}
                    panelNote={copy.estimate_panel_note}
                />
            </>,
        );

        // 각 섹션이 바인딩한 props 로 실제 콘텐츠를 그린다 — copy 는 전부 모듈에서 온다.
        expect(screen.getByText('서비스 안내')).toBeInTheDocument();
        expect(screen.getAllByText('바닥 기계세척').length).toBeGreaterThan(0);
        expect(screen.getByText('가격은 투명하게 안내합니다.')).toBeInTheDocument();
        expect(screen.getByTestId('faq-intro-sub')).toHaveTextContent(
            '가격, 작업 기준, 출장지역을 정리했습니다.',
        );
        expect(screen.getByTestId('cases')).toBeInTheDocument();
        expect(screen.getByTestId('projects-sub')).toBeInTheDocument();
        expect(screen.getByTestId('estimate-calculator')).toBeInTheDocument();
        expect(screen.getByTestId('estimator-heading')).toHaveTextContent(
            '예상 기본금액을 먼저 확인해 보세요.',
        );
        expect(screen.getByTestId('inquiry-form')).toBeInTheDocument();
    });

    it('renders every section in the loading state when no data source resolved', () => {
        // 홈은 8개 소스를 자기가 선언하지만, 로딩 중에는 전부 null 로 들어온다.
        render(
            <>
                <Hero site={null} copy={null} media={null} />
                <AboutSection copy={null} media={null} />
                <ServiceGrid
                    intro={null}
                    introSub={null}
                    detailLabel={null}
                    extraHeading={null}
                    extraBody={null}
                    items={null}
                    media={null}
                />
                <PackageList
                    intro={null}
                    introSub={null}
                    benefitHeading={null}
                    benefitSub={null}
                    benefitItems={null}
                    items={null}
                    media={null}
                />
                <FaqList intro={null} introSub={null} items={null} />
            </>,
        );

        expect(screen.getByTestId('hero-skeleton')).toBeInTheDocument();
        expect(screen.getByTestId('about-skeleton')).toBeInTheDocument();
        expect(screen.getByTestId('services-skeleton')).toBeInTheDocument();
        expect(screen.getByTestId('packages-skeleton')).toBeInTheDocument();
        expect(screen.getByTestId('faq-skeleton')).toBeInTheDocument();
    });
});
