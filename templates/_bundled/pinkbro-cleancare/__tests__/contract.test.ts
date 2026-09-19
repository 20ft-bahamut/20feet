import { readFileSync, readdirSync } from 'node:fs';
import { sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * 템플릿 계약 전수 검증 (Task 14).
 *
 * 이 템플릿의 특징적인 **조용한 실패**를 잡는다:
 * 레이아웃 노드의 `name` 이 `components.json` 의 `name`, 그리고 `src/index.ts` 의
 * `registry.register({ metadata: { name } })` 와 어긋나면, `ComponentRegistry` 는
 * 경고 한 줄만 남기고 그 노드를 **건너뛴다.** 화면에서는 섹션이 통째로 사라지고,
 * 빌드도 타입체크도 통과한다 — 사용자가 "섹션이 없어졌다"고 말할 때까지 아무도 모른다.
 *
 * 그래서 여기서 세 이름 공간을 전수로 맞춰 본다:
 *   1. `layouts/**` 의 노드 `name`  ⊆  `components.json`
 *   2. `components.json`  ==  `src/index.ts` 의 컴포넌트 export
 *   3. `components.json`  ==  `registry.register` 의 `metadata.name` (런타임 조회 키)
 * 더해서 `layout_name` 과 `routes.json` 의 `layout` 참조가 실제로 해석되는지 본다.
 *
 * `layout_name` 에 템플릿 접두사를 요구하지 않는다 — G7 은 `layout_name` 을 DB `name`
 * 으로 그대로 저장하고 정확히 일치하는 이름으로 찾는다(`ValidatesLayoutFiles.php:88`,
 * `LayoutRepository::findByName`). 접두사는 모듈/플러그인 전용이며
 * `TemplateService.php:1418` 이 템플릿의 접두사를 빈 문자열로 명시한다.
 * 이 템플릿은 `_user_base` / `home` / `errors/*` 를 쓰고, 번들 참조 템플릿 4종도 같다.
 */

/**
 * 템플릿 루트 (`__tests__/` 의 부모).
 *
 * happy-dom 환경에서 `import.meta.url` 은 `file:` URL 이 아니므로(happy-dom 의
 * document URL 로 치환된다) 그대로 `fileURLToPath` 할 수 없다. `file:` 일 때만
 * 그것을 쓰고, 아니면 vitest 가 config 디렉토리로 맞춰 주는 cwd 로 떨어진다.
 * cwd 가 틀리면 아래 `discovers every layout file` 검사가 먼저 깨진다.
 */
function resolveTemplateRoot(): string {
    const url = import.meta.url;

    if (url.startsWith('file:')) {
        return fileURLToPath(new URL('../', url));
    }

    return `${process.cwd()}${sep}`;
}

const TEMPLATE_ROOT = resolveTemplateRoot();

const abs = (relativePath: string): string => `${TEMPLATE_ROOT}${relativePath}`;

const readJson = (relativePath: string): any => JSON.parse(readFileSync(abs(relativePath), 'utf8'));

/** `layouts/` 아래의 모든 레이아웃 JSON — 하위 디렉토리(`errors/`) 포함 */
function discoverLayoutFiles(): string[] {
    return readdirSync(abs('layouts'), { recursive: true })
        .map((entry) => `layouts/${String(entry).split(sep).join('/')}`)
        .filter((relativePath) => relativePath.endsWith('.json'))
        .sort();
}

const LAYOUT_FILES = discoverLayoutFiles();
const LAYOUTS = LAYOUT_FILES.map((path) => ({ path, data: readJson(path) }));

/** `components.json` 이 등록한 모든 컴포넌트 이름 (basic / composite / layout 전부) */
const MANIFEST = readJson('components.json');
const REGISTERED = new Set<string>(
    Object.values(MANIFEST.components as Record<string, Array<{ name: string }>>)
        .flat()
        .map((component) => component.name),
);

/**
 * 레이아웃 JSON 안에서 컴포넌트 노드의 `name` 을 모은다.
 *
 * 컴포넌트 노드는 `type` 과 `name` 을 **함께** 가진다. `data_sources` 항목은 `type` 만
 * (`name` 없음), JSON-LD 는 `@type` 만 가지므로 여기 섞이지 않는다.
 */
function collectNodeNames(node: unknown, out = new Set<string>()): Set<string> {
    if (Array.isArray(node)) {
        node.forEach((child) => collectNodeNames(child, out));
        return out;
    }

    if (node && typeof node === 'object') {
        const record = node as Record<string, unknown>;

        if (typeof record.type === 'string' && typeof record.name === 'string') {
            out.add(record.name);
        }

        Object.values(record).forEach((value) => collectNodeNames(value, out));
    }

    return out;
}

const SRC_INDEX = readFileSync(abs('src/index.ts'), 'utf8');

/**
 * `src/index.ts` 가 컴포넌트 모듈에서 재export 하는 컴포넌트 이름.
 *
 * 대상은 `export { … } from './components/…'` 뿐이다. 타입(`type XProps`)은 이름이
 * 아니고, `telHref` 같은 헬퍼는 컴포넌트가 아니므로 대문자 시작 규칙으로 걸러낸다.
 * (`./lib/…`, `../template.json` 재export 도 경로 조건에서 빠진다.)
 */
const EXPORTED_FROM_COMPONENTS = new Set<string>();
for (const match of SRC_INDEX.matchAll(/^export\s*\{([^}]*)\}\s*from\s*'\.\/components\/[^']*';?$/gm)) {
    for (const raw of match[1].split(',')) {
        const entry = raw.trim();

        if (entry === '' || entry.startsWith('type ')) {
            continue;
        }
        if (/^[A-Z]/.test(entry)) {
            EXPORTED_FROM_COMPONENTS.add(entry);
        }
    }
}

/**
 * `registry.register({ component: X, metadata: meta('Name') })` 의 쌍.
 * `metadata.name` 이 런타임 조회 키다 — 레이아웃 노드 이름은 이 키로 조회된다.
 */
const REGISTERED_IN_CODE = new Map<string, string>();
for (const match of SRC_INDEX.matchAll(
    /registry\.register\(\{\s*component:\s*([A-Za-z0-9_$]+)\s*,\s*metadata:\s*(?:meta|composite)\('([^']+)'\)\s*\}\)/g,
)) {
    REGISTERED_IN_CODE.set(match[2], match[1]);
}

const NODE_NAMES = new Set<string>();
for (const { data } of LAYOUTS) {
    collectNodeNames(data).forEach((name) => NODE_NAMES.add(name));
}

describe('template contract — 검사가 공허하게 통과하지 않는지', () => {
    it('discovers every layout file, node name, and manifest entry', () => {
        // 이게 0 이면 아래 검사들이 전부 vacuous pass 가 된다.
        expect(LAYOUT_FILES.length).toBeGreaterThanOrEqual(5);
        expect(NODE_NAMES.size).toBeGreaterThanOrEqual(9);
        expect(REGISTERED.size).toBeGreaterThanOrEqual(20);
        expect(EXPORTED_FROM_COMPONENTS.size).toBeGreaterThanOrEqual(20);
        expect(REGISTERED_IN_CODE.size).toBeGreaterThanOrEqual(20);
    });

    it('lists the layouts it is meant to cover', () => {
        expect(LAYOUT_FILES).toContain('layouts/home.json');
        expect(LAYOUT_FILES).toContain('layouts/_user_base.json');
        expect(LAYOUT_FILES).toContain('layouts/errors/404.json');
        // `layouts/` 밖의 JSON 을 잘못 주워오지 않는다.
        expect(LAYOUT_FILES.every((path) => path.startsWith('layouts/'))).toBe(true);
    });
});

describe('template contract — 레이아웃 노드 이름 ↔ components.json', () => {
    it('uses only node names registered in components.json', () => {
        // 여기서 잡히는 이름은 런타임에 registry 가 warn 만 남기고 건너뛰는 이름이다.
        const unregistered: string[] = [];

        for (const { path, data } of LAYOUTS) {
            for (const name of collectNodeNames(data)) {
                if (!REGISTERED.has(name)) {
                    unregistered.push(`${path}: "${name}"`);
                }
            }
        }

        expect(unregistered).toEqual([]);
    });

    it('uses no `iteration` node — composite 가 자기 목록을 그린다', () => {
        for (const { path, data } of LAYOUTS) {
            expect(JSON.stringify(data), path).not.toContain('"iteration"');
        }
    });
});

describe('template contract — layout_name · routes 해석', () => {
    const byName = new Map<string, { path: string; data: any }>();
    for (const layout of LAYOUTS) {
        byName.set(layout.data.layout_name, layout);
    }

    it('gives every layout a non-empty layout_name with no module/plugin prefix', () => {
        for (const { path, data } of LAYOUTS) {
            expect(typeof data.layout_name, path).toBe('string');
            expect(data.layout_name, path).not.toBe('');
            // 접두사는 모듈/플러그인 전용이다 — 템플릿에 붙이면 routes 의 "home" 이 안 맞는다.
            expect(data.layout_name, path).not.toMatch(/^pinkbro-cleancare\./);
            // 일반 규칙: 첫 세그먼트 뒤에 점이 오는 `<host>.<name>` 형태를 금지한다.
            expect(data.layout_name, path).not.toMatch(/^[A-Za-z0-9_-]+\./);
            expect(data.layout_name, path).not.toContain('::');
        }
    });

    it('registers each layout_name exactly once — 이름이 겹치면 해석이 흔들린다', () => {
        const names = LAYOUTS.map(({ data }) => data.layout_name);

        expect(new Set(names).size).toBe(names.length);
    });

    it('resolves every routes.json layout to a layout file that exists', () => {
        const routes: Array<{ path: string; layout: string }> = readJson('routes.json').routes;

        expect(routes.length).toBeGreaterThan(0);
        for (const route of routes) {
            expect(typeof route.layout, route.path).toBe('string');

            const target = byName.get(route.layout);

            expect(target, `route "${route.path}" → layout "${route.layout}"`).toBeDefined();
            // 라우트가 base 레이아웃을 가리키면 그 경로는 렌더되지 않는다.
            expect(target!.data.meta?.is_base, route.layout).toBeUndefined();
        }
    });

    it('resolves every `extends` to a layout that exists', () => {
        for (const { path, data } of LAYOUTS) {
            if (data.extends === undefined) {
                continue;
            }

            expect(typeof data.extends, path).toBe('string');
            expect(byName.has(data.extends), `${path} extends "${data.extends}"`).toBe(true);
        }
    });
});

describe('template contract — components.json ↔ src/index.ts', () => {
    it('exports from src/index.ts exactly the components the manifest registers', () => {
        const notInManifest = [...EXPORTED_FROM_COMPONENTS].filter((name) => !REGISTERED.has(name)).sort();
        const notExported = [...REGISTERED].filter((name) => !EXPORTED_FROM_COMPONENTS.has(name)).sort();

        // export 만 하고 등록하지 않음 — 그 컴포넌트는 조회되지 않는다.
        expect(notInManifest, 'components.json 에 없는 export').toEqual([]);
        // 등록만 하고 export 하지 않음 — 파일이 사라지면 빌드가 아니라 런타임에 터진다.
        expect(notExported, 'src/index.ts 에 없는 등록').toEqual([]);
    });

    it('registers every manifest component under its own name', () => {
        // registry.register 의 metadata.name 이 실제 조회 키다. 이름이 어긋나면
        // 레이아웃 노드는 등록된 적 없는 이름을 찾다가 조용히 건너뛴다.
        const registeredButUnknown = [...REGISTERED_IN_CODE.keys()]
            .filter((name) => !REGISTERED.has(name))
            .sort();
        const manifestButNotRegistered = [...REGISTERED]
            .filter((name) => !REGISTERED_IN_CODE.has(name))
            .sort();

        expect(registeredButUnknown, 'manifest 에 없는 등록 이름').toEqual([]);
        expect(manifestButNotRegistered, 'registry 에 없는 manifest 이름').toEqual([]);

        for (const [name, identifier] of REGISTERED_IN_CODE) {
            // `metadata: meta('Hero')` 의 이름과 `component: Hero` 의 식별자가 같아야 한다.
            expect(identifier, name).toBe(name);
            expect(EXPORTED_FROM_COMPONENTS.has(identifier), name).toBe(true);
        }
    });

    it('uses the composite/basic split the manifest declares', () => {
        const basic = new Set<string>(
            (MANIFEST.components.basic as Array<{ name: string }>).map((component) => component.name),
        );
        const composite = new Set<string>(
            (MANIFEST.components.composite as Array<{ name: string }>).map((component) => component.name),
        );

        expect([...basic].filter((name) => composite.has(name))).toEqual([]);
        for (const name of NODE_NAMES) {
            // 레이아웃이 쓰는 이름은 basic 이거나 composite 여야 한다.
            expect(basic.has(name) || composite.has(name), name).toBe(true);
        }
    });
});
