/**
 * 관리자가 작성한 게시판 본문을 화면에 넣기 전에 정리한다.
 *
 * 본문은 G7 게시판 에디터가 만든 HTML이라 그대로 넣으면 위험하다.
 * 허용한 태그와 속성만 남기고, 나머지는 텍스트로 되돌린다.
 *
 * - script / style / iframe / object / embed / form / input 등은 통째로 제거
 * - on* 이벤트 속성 제거
 * - javascript:, data: 같은 안전하지 않은 URL 제거
 *
 * 브라우저 DOM이 없는 환경(테스트 등)에서는 태그를 모두 벗겨 텍스트만 남긴다.
 */

const ALLOWED_TAGS = new Set([
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
    'h2', 'h3', 'h4', 'h5', 'h6',
    'a', 'img', 'hr', 'span', 'div', 'table', 'thead', 'tbody',
    'tr', 'th', 'td', 'figure', 'figcaption',
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
    a: new Set(['href', 'title']),
    img: new Set(['src', 'alt', 'width', 'height', 'loading']),
    td: new Set(['colspan', 'rowspan']),
    th: new Set(['colspan', 'rowspan', 'scope']),
};

const DROP_WITH_CONTENT = new Set([
    'script', 'style', 'iframe', 'object', 'embed', 'form', 'input',
    'button', 'select', 'textarea', 'link', 'meta', 'base', 'svg', 'math',
]);

function isSafeUrl(value: string): boolean {
    const trimmed = value.trim().toLowerCase();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return true;
    }
    // 상대 경로와 앵커만 허용한다. javascript:, data:, vbscript: 등은 막는다.
    return (
        trimmed.startsWith('/') ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('mailto:') ||
        trimmed.startsWith('tel:')
    );
}

function sanitizeElement(element: Element, documentRef: Document): void {
    const children = Array.from(element.children);

    for (const child of children) {
        const tag = child.tagName.toLowerCase();

        if (DROP_WITH_CONTENT.has(tag)) {
            child.remove();
            continue;
        }

        if (!ALLOWED_TAGS.has(tag)) {
            // 허용하지 않는 태그는 내용만 남기고 태그를 벗긴다.
            const parent = child.parentNode;
            if (parent) {
                while (child.firstChild) {
                    parent.insertBefore(child.firstChild, child);
                }
                parent.removeChild(child);
            }
            continue;
        }

        const allowed = ALLOWED_ATTRS[tag];
        for (const attr of Array.from(child.attributes)) {
            const name = attr.name.toLowerCase();
            const keep = allowed?.has(name) ?? false;
            if (!keep) {
                child.removeAttribute(attr.name);
                continue;
            }
            if ((name === 'href' || name === 'src') && !isSafeUrl(attr.value)) {
                child.removeAttribute(attr.name);
            }
        }

        if (tag === 'a') {
            child.setAttribute('rel', 'noreferrer noopener');
            child.setAttribute('target', '_blank');
        }

        sanitizeElement(child, documentRef);
    }
}

/**
 * 내용이 없는 문단을 지운다.
 *
 * 게시판 에디터가 문단 사이에 `<p>&nbsp;</p>` 를 남기는 경우가 많다.
 * 그대로 두면 화면에 빈 줄이 여러 개 생겨 문단 간격이 들쭉날쭉해진다.
 * 이미지나 링크처럼 내용이 있는 요소는 건드리지 않는다.
 */
function dropEmptyBlocks(root: Element): void {
    for (const el of Array.from(root.querySelectorAll('p, div, span'))) {
        if (el.querySelector('img, a, br, ul, ol, table')) {
            continue;
        }
        const text = (el.textContent ?? '').replace(/[\u00a0\s]/g, '');
        if (text === '') {
            el.remove();
        }
    }
}

export function sanitizeHtml(html: string): string {
    if (!html) {
        return '';
    }

    if (typeof document === 'undefined' || typeof DOMParser === 'undefined') {
        // DOM이 없으면 태그를 모두 제거하고 텍스트만 남긴다.
        return html.replace(/<[^>]*>/g, '').trim();
    }

    const parsed = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    const root = parsed.body.firstElementChild;
    if (!root) {
        return '';
    }

    sanitizeElement(root, parsed);
    dropEmptyBlocks(root);

    return root.innerHTML.trim();
}

export default sanitizeHtml;
