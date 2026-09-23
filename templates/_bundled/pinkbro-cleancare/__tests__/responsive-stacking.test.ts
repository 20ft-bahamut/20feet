import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * 모바일 스태킹 회귀 방지.
 *
 * 배경: 원문 styles.css 의 `@media (max-width:1100px)` 그룹은
 * `.hero-grid, .why-grid, .section-head, .package-grid, .benefit-top, .notice-box,
 *  .estimator-grid, .estimate-grid, .footer-grid, .faq-grid { grid-template-columns:1fr }`
 * 로 이들 요소를 단일 컬럼으로 만들려 했다. 그런데 `.section-head` 는 원문에서
 * `display:flex` (styles.css:108) 이므로 grid-template-columns 는 죽은 규칙이었고,
 * 원문 모바일 화면에서도 제목이 좁은 컬럼에 갇혀 한 줄에 한 단어씩 접혔다.
 *
 * 이 템플릿은 죽은 규칙을 베끼지 않고 작성자 의도를 메커니즘에 맞춰 되살린다:
 *   - grid 요소 → grid-template-columns:1fr
 *   - flex 요소 → flex-direction:column
 * 그리고 1440px 데스크톱은 건드리지 않는다 — 모든 규칙은 미디어 블록 안에만 있다.
 *
 * 이 테스트는 그 두 가지를 동시에 고정한다: (1) 각 요소가 올바른 브레이크포인트에서
 * 실제로 쌓이는 규칙을 갖는지, (2) 그 규칙이 미디어 블록 밖으로 새지 않았는지.
 */

const STYLES = join(__dirname, '..', 'src', 'styles');
/** 주석을 먼저 걷어낸다 — 원문 대조 주석에 쉼표가 있어 셀렉터 목록 파싱을 깨뜨린다. */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const read = (file: string) => stripComments(readFileSync(join(STYLES, file), 'utf8'));

/**
 * CSS 텍스트에서 `@media (max-width: 1100px) { ... }` 본문만 뽑는다.
 * 중괄호 깊이를 세어 블록 끝을 찾으므로 중첩 규칙이 있어도 안전하다.
 */
function mediaBlock(css: string, maxWidth: number): string {
    const header = new RegExp(`@media\\s*\\(max-width:\\s*${maxWidth}px\\)\\s*{`);
    const match = header.exec(css);
    if (!match) return '';
    const start = match.index + match[0].length;
    let depth = 1;
    for (let i = start; i < css.length; i += 1) {
        if (css[i] === '{') depth += 1;
        else if (css[i] === '}') {
            depth -= 1;
            if (depth === 0) return css.slice(start, i);
        }
    }
    return '';
}

/** 미디어 블록을 전부 제거한 "데스크톱" CSS. */
function withoutMedia(css: string): string {
    let out = css;
    for (;;) {
        const match = /@media[^{]*{/.exec(out);
        if (!match) return out;
        const start = match.index + match[0].length;
        let depth = 1;
        let end = out.length;
        for (let i = start; i < out.length; i += 1) {
            if (out[i] === '{') depth += 1;
            else if (out[i] === '}') {
                depth -= 1;
                if (depth === 0) { end = i + 1; break; }
            }
        }
        out = out.slice(0, match.index) + out.slice(end);
    }
}

/**
 * 셀렉터 규칙 하나의 선언부를 찾는다.
 * `.a, .b { ... }` 처럼 묶인 셀렉터 목록도 매칭한다 (여러 개면 선언을 이어 붙인다).
 */
function rule(css: string, selector: string): string {
    const found: string[] = [];
    const re = /([^{}]+){([^}]*)}/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(css)) !== null) {
        const selectors = match[1].split(',').map((s) => s.trim());
        if (selectors.includes(selector)) found.push(match[2]);
    }
    return found.join(' ');
}

/** `selector` 가 `body` 안에서 단일 컬럼으로 쌓이는지 (grid 1fr 또는 flex column). */
function stacks(body: string, selector: string): boolean {
    const decl = rule(body, selector);
    if (decl === '') return false;
    const grid = /grid-template-columns:\s*1fr\s*;?/.test(decl);
    const flex = /flex-direction:\s*column\s*;?/.test(decl);
    return grid || flex;
}

describe('모바일 스태킹 (@media max-width:1100px)', () => {
    // 원문 1100px 그룹의 요소 → 이 템플릿 클래스 → 메커니즘
    const GRID_1100: Array<[string, string]> = [
        ['.pb-hero-grid', 'Hero.css'],
        ['.pb-why-grid', 'AboutSection.css'],
        ['.pb-package-grid', 'PackageList.css'],
        ['.pb-pricing-notice', 'PriceDiscount.css'],
        ['.pb-estimator-grid', 'EstimateCalculator.css'],
        ['.pb-inquiry-grid', 'InquiryForm.css'],
        ['.pb-footer-grid', 'SiteFooter.css'],
        ['.pb-faq-grid', 'FaqList.css'],
    ];

    const FLEX_1100: Array<[string, string]> = [
        // 원문 .section-head 의 5개 인스턴스
        ['.pb-section-head', 'ServiceGrid.css'],
        ['.pb-pricing-head', 'PriceDiscount.css'],
        ['.pb-projects__head', 'CaseGallery.css'],
        ['.pb-estimator-head', 'EstimateCalculator.css'],
        // 원문 .benefit-top
        ['.pb-benefit-top', 'PackageList.css'],
    ];

    it.each(GRID_1100)('%s (grid) 는 %s 에서 단일 컬럼이 된다', (selector, file) => {
        expect(stacks(mediaBlock(read(file), 1100), selector)).toBe(true);
    });

    it.each(FLEX_1100)('%s (flex) 는 %s 에서 세로로 쌓인다', (selector, file) => {
        expect(stacks(mediaBlock(read(file), 1100), selector)).toBe(true);
    });

    it('스택하는 flex 헤드는 원문이 선언한 align-items 를 유지한다', () => {
        // 원문 @media(max-width:1100px) { .section-head, .benefit-top { align-items:flex-start } }
        for (const [selector, file] of FLEX_1100) {
            const decl = rule(mediaBlock(read(file), 1100), selector);
            expect(decl, `${file} ${selector}`).toMatch(/align-items:\s*flex-start/);
        }
    });

    it('히어로 스코프 카드 3장도 1100px 에서 한 열 + 520px 로 좁힌다', () => {
        const decl = rule(mediaBlock(read('Hero.css'), 1100), '.pb-hero-scope');
        expect(decl).toMatch(/grid-template-columns:\s*1fr/);
        expect(decl).toMatch(/max-width:\s*520px/);
    });
});

describe('모바일 스태킹 (@media max-width:720px)', () => {
    const GRID_720: Array<[string, string]> = [
        ['.pb-hero-scope', 'Hero.css'],
        ['.pb-service-grid', 'ServiceGrid.css'],
        ['.pb-benefit-grid', 'PackageList.css'],
        ['.pb-service-check-grid', 'InquiryForm.css'],
        ['.pb-project-grid', 'CaseGallery.css'],
        ['.pb-footer-grid', 'SiteFooter.css'],
    ];

    it.each(GRID_720)('%s (grid) 는 %s 에서 단일 컬럼이 된다', (selector, file) => {
        expect(stacks(mediaBlock(read(file), 720), selector)).toBe(true);
    });

    it('번들 자리표시자 사진이 아닌 블록 요소(.pb-hero-media)에는 스태킹 규칙이 없다', () => {
        // 원문 .hero-visual(grid)은 원문 body.html 에서 쓰이지 않는다. 실제 마크업은
        // .hero-visual-clean(positioned block)이고 이 템플릿에서는 .pb-hero-media 다.
        // grid 가 아니므로 1100/720 의 grid-template-columns 는 해당되지 않는다.
        expect(rule(read('Hero.css'), '.pb-hero-media')).not.toMatch(/display:\s*grid/);
    });
});

describe('데스크톱은 미디어 블록 밖에서 바뀌지 않는다', () => {
    const FILES = [
        'Hero.css', 'AboutSection.css', 'ServiceGrid.css', 'PackageList.css',
        'PriceDiscount.css', 'EstimateCalculator.css', 'InquiryForm.css',
        'CaseGallery.css', 'FaqList.css', 'SiteFooter.css',
    ];

    it.each(FILES)('%s 의 스태킹 규칙은 전부 미디어 블록 안에 있다', (file) => {
        const desktop = withoutMedia(read(file));
        // 데스크톱 CSS 에 flex-direction:column 이 새로 생기면 1440px 이 깨진다.
        // (원문에 이미 있던 .pb-pricing-notice-c 는 제외 — 이 템플릿에도 남아 있다)
        for (const selector of [
            '.pb-section-head', '.pb-pricing-head', '.pb-projects__head',
            '.pb-estimator-head', '.pb-benefit-top', '.pb-hero-scope',
        ]) {
            expect(rule(desktop, selector), `${file} ${selector}`).not.toMatch(/flex-direction:\s*column/);
        }
    });

    it('원문 1100px 그룹의 grid 요소는 데스크톱에서 단일 컬럼이 아니다', () => {
        const cases: Array<[string, string]> = [
            ['ServiceGrid.css', '.pb-service-grid'],
            ['PackageList.css', '.pb-benefit-grid'],
            ['PackageList.css', '.pb-package-grid'],
            ['Hero.css', '.pb-hero-scope'],
        ];
        for (const [file, selector] of cases) {
            expect(rule(withoutMedia(read(file)), selector), `${file} ${selector}`)
                .not.toMatch(/grid-template-columns:\s*1fr/);
        }
    });
});
