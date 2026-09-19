import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteHeader } from '../../src/components/SiteHeader';
import { SiteFooter } from '../../src/components/SiteFooter';
import { MobileBar } from '../../src/components/MobileBar';
import type { SiteData } from '../../src/lib/types';
import componentsManifest from '../../components.json';
import templateMetadata from '../../template.json';
import baseLayout from '../../layouts/_user_base.json';
import error403 from '../../layouts/errors/403.json';
import error404 from '../../layouts/errors/404.json';
import error500 from '../../layouts/errors/500.json';
import ko from '../../lang/ko.json';
import en from '../../lang/en.json';

/**
 * Base 레이아웃 + 에러 레이아웃 계약 테스트.
 *
 * 참조 studio `__tests__/layouts/home.test.tsx` 와 같이 코어 레이아웃 testUtils 를
 * 쓰지 않는다. JSON 은 직접 import 해 구조를 검증하고, 크롬 composite 은
 * 컴포넌트를 직접 렌더해 base 가 내려주는 props 모양(site/media/copy)이
 * 컴포넌트 계약과 맞는지 확인한다.
 */

const LAYOUTS: Array<[string, any]> = [
    ['layouts/_user_base.json', baseLayout],
    ['layouts/errors/403.json', error403],
    ['layouts/errors/404.json', error404],
    ['layouts/errors/500.json', error500],
];

/** 노드 트리를 순회하며 콜백을 적용한다 (components / slots.content 양쪽 지원) */
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
function collectTranslationTokens(layout: any): Set<string> {
    const tokens = new Set<string>();
    const visit = (value: any): void => {
        if (typeof value === 'string') {
            const match = /^\$t:([A-Za-z0-9_.]+)$/.exec(value);
            if (match) {
                tokens.add(match[1]);
            }
            return;
        }
        if (Array.isArray(value)) {
            value.forEach(visit);
            return;
        }
        if (value && typeof value === 'object') {
            Object.values(value).forEach(visit);
        }
    };
    visit(layout);
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

const site: SiteData = {
    brand_name: '핑크브로클린케어',
    brand_name_en: 'PINKBRO CLEANCARE',
    tagline: '깨끗한 공간, 더 나은 오늘',
    eyebrow: null,
    phone: '010-4348-8158',
    kakao_channel: 'http://pf.kakao.com/_gmcuG',
    region: '부울경',
    og_image_slot: null,
};

describe('base layout — 구조', () => {
    it('is the base layout of this template', () => {
        expect((baseLayout as any).meta.is_base).toBe(true);
        expect((baseLayout as any).layout_name).toBe('_user_base');
    });

    it('declares no data source of its own — home owns every fetch', () => {
        expect((baseLayout as any).data_sources ?? []).toEqual([]);
    });

    it('lays out header → content slot → footer → mobile bar, in that order', () => {
        const root = (baseLayout as any).components[0];
        expect(root.name).toBe('Div');

        const order = root.children.map((child: any) => child.name);
        expect(order).toEqual(['SiteHeader', 'Div', 'SiteFooter', 'MobileBar']);

        const slotHolder = root.children[1];
        expect(slotHolder.children).toHaveLength(1);
        expect(slotHolder.children[0].slot).toBe('content');
        expect(slotHolder.children[0].children).toEqual([]);

        expect(root.children.map((child: any) => child.type)).toEqual([
            'composite',
            'basic',
            'composite',
            'composite',
        ]);
    });

    it('binds the chrome components to the data sources home declares', () => {
        const root = (baseLayout as any).components[0];
        const [header, , footer, mobileBar] = root.children;

        expect(header.props).toEqual({
            site: '{{pinkbro_site?.data ?? null}}',
            media: '{{pinkbro_media?.data ?? null}}',
        });
        expect(footer.props).toEqual({
            site: '{{pinkbro_site?.data ?? null}}',
            copy: '{{pinkbro_copy?.data ?? null}}',
        });
        expect(mobileBar.props).toEqual({ site: '{{pinkbro_site?.data ?? null}}' });
    });
});

describe('error layouts — 구조', () => {
    it.each([
        ['403', error403],
        ['404', error404],
        ['500', error500],
    ])('%s extends the base layout and matches template.json error_config', (code, layout) => {
        const configured = (templateMetadata as any).error_config.layouts[code];

        expect((layout as any).layout_name).toBe(configured);
        expect((layout as any).extends).toBe('_user_base');
        expect((layout as any).meta.is_base).toBeUndefined();
        expect(Object.keys((layout as any).slots)).toEqual(['content']);
        expect(Array.isArray((layout as any).slots.content)).toBe(true);
        expect((layout as any).slots.content.length).toBeGreaterThan(0);
    });

    it.each([
        ['403', error403],
        ['404', error404],
        ['500', error500],
    ])('%s draws every visible string from lang keys', (code, layout) => {
        const texts: string[] = [];
        walkNodes((layout as any).slots.content, (node) => {
            if (typeof node.text === 'string') {
                texts.push(node.text);
            }
        });

        // 상태 코드 리터럴은 UI 문구가 아니라 코드값이다 (hello 참조 골격과 동일).
        const copyTexts = texts.filter((text) => text !== code);
        expect(copyTexts.length).toBeGreaterThan(0);
        for (const text of copyTexts) {
            expect(text.startsWith('$t:')).toBe(true);
        }
    });

    it('shows the status code and links back to home', () => {
        for (const [code, layout] of [
            ['403', error403],
            ['404', error404],
            ['500', error500],
        ] as Array<[string, any]>) {
            const texts: string[] = [];
            const hrefs: string[] = [];
            walkNodes(layout.slots.content, (node) => {
                if (typeof node.text === 'string') {
                    texts.push(node.text);
                }
                if (typeof node.props?.href === 'string') {
                    hrefs.push(node.props.href);
                }
            });

            expect(texts).toContain(code);
            expect(hrefs).toContain('/');
        }
    });
});

describe('layout contract — 노드 이름 · 속성 배치 · lang', () => {
    it.each(LAYOUTS)('%s uses only names registered in components.json', (_file, layout) => {
        const used = new Set<string>();
        walkNodes(layout.components ?? layout.slots?.content ?? [], (node) => {
            used.add(node.name);
        });

        expect([...used].filter((name) => !registeredNames.has(name))).toEqual([]);
    });

    it.each(LAYOUTS)('%s keeps className inside props and text/style at the top level', (_file, layout) => {
        walkNodes(layout.components ?? layout.slots?.content ?? [], (node) => {
            // className 은 props 안에만 있어야 한다 — top level 은 조용히 무시된다.
            expect(node.className).toBeUndefined();
            expect(node.href).toBeUndefined();

            // text / src / style 은 노드 top level 전용이다.
            expect(node.props?.text).toBeUndefined();
            expect(node.props?.src).toBeUndefined();
            expect(node.props?.style).toBeUndefined();
        });
    });

    it.each(LAYOUTS)('%s resolves every $t: token in both ko and en', (file, layout) => {
        const tokens = [...collectTranslationTokens(layout)];

        expect(tokens.length).toBeGreaterThan(0);
        for (const token of tokens) {
            expect(resolveLangKey(ko, token), `${file} → ko:${token}`).toBeTypeOf('string');
            expect(resolveLangKey(en, token), `${file} → en:${token}`).toBeTypeOf('string');
        }
    });
});

describe('base layout — 크롬 composite 렌더', () => {
    it('renders the chrome with the props the base binds (site present)', () => {
        render(<SiteHeader site={site} media={null} />);
        expect(screen.getByTestId('pb-header')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /010-4348-8158/ })).toHaveAttribute(
            'href',
            'tel:01043488158',
        );

        render(<SiteFooter site={site} copy={null} />);
        expect(screen.getByTestId('pb-footer')).toBeInTheDocument();

        render(<MobileBar site={site} />);
        expect(screen.getByTestId('pb-mobile-bar')).toBeInTheDocument();
    });

    it('renders the chrome when no data source resolved (error layouts)', () => {
        render(
            <>
                <SiteHeader site={null} media={null} />
                <SiteFooter site={null} copy={null} />
                <MobileBar site={null} />
            </>,
        );

        expect(screen.getByTestId('pb-header')).toBeInTheDocument();
        expect(screen.getByTestId('pb-footer')).toBeInTheDocument();
        expect(screen.getByTestId('pb-mobile-bar')).toBeInTheDocument();
    });
});
