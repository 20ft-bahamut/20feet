import React from 'react';

/**
 * 스크롤 리빌 — 원본 app.js 1~9행 + styles.css 47~50행의 이식.
 *
 * 원본(정적 HTML):
 *   const observer = new IntersectionObserver((entries) => {
 *     entries.forEach((entry) => {
 *       if (entry.isIntersecting) {
 *         entry.target.classList.add('visible');
 *         observer.unobserve(entry.target);
 *       }
 *     });
 *   }, { threshold: 0.14 });
 *   document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
 *
 * 템플릿은 React 트리라 정적 훑기(querySelectorAll)가 없다 — 데이터가 늦게 오므로
 * 리빌 요소가 마운트된 뒤에 관찰해야 한다. 그래서 ref 콜백으로 관찰한다:
 *
 *   const reveal = usePbRevealRef();
 *   <div ref={reveal('hero-shell')} className="pb-hero-shell pb-reveal">
 *
 * - key 는 논리 이름(섹션 + 항목). 리빌이 끝난 key 를 기억해, 데이터 로딩 전후로
 *   DOM 노드가 교체돼도 같은 key 의 새 노드는 애니메이션을 다시 트리거하지 않고
 *   바로 보인다(usePbRevealRef 계약 — "노드가 교체돼도 리빌이 다시 트리거되지 않게").
 * - CSS 는 design-tokens.css 의 `.pb-reveal` 계열. 원문 값 그대로다
 *   (28px / ±30px / .8s ease / 시차 --pb-delay). 원문 --delay 의 템플릿 이름이다.
 * - JS 실패 안전(원문에 없던 보강): 원문은 opacity:0 을 CSS 에 박고 JS 로만 풀어서
 *   스크립트가 죽으면 백지다. 템플릿은 관찰 훅이 살아 있을 때만 documentElement 에
 *   `pb-js` 를 붙이고, 숨김 상태는 `html.pb-js .pb-reveal` 처럼 그 클래스 아래에서만
 *   적용된다 — 스크립트가 안 돌면 전부 그냥 보인다.
 * - IntersectionObserver 미지원 환경(happy-dom 포함)에서는 숨기지 않는다 —
 *   풀어 줄 관찰자가 없는데 숨기는 것은 백지와 같다.
 * - prefers-reduced-motion: reduce 에서는 애니메이션을 끈다(CSS 담당 — 원문은 무시).
 */

/** 원본 app.js 8행 — threshold 0.14. */
const THRESHOLD = 0.14;
const VISIBLE_CLASS = 'pb-reveal--visible';

let observer: IntersectionObserver | null = null;

/** key → 리빌 완료. 노드 교체 후 같은 key 가 다시 애니메이션하지 않게 하는 장치다. */
const revealed = new Map<string, true>();
/** 관찰 중인 노드 → key. 인터섵션 콜백에서 key 를 되찾는다. */
const nodeKeys = new WeakMap<Element, string>();

function observerSupported(): boolean {
    return (
        typeof window !== 'undefined' &&
        typeof (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver !==
            'undefined'
    );
}

/**
 * JS 가 살아 있음을 CSS 에 알린다. 숨김 상태는 `html.pb-js` 가 있을 때만 적용되므로
 * 이 클래스가 붙는 순간(첫 리빌 요소 마운트 = React commit 단계, paint 전)부터만
 * 요소가 숨겨진다.
 */
function flagJs(): void {
    document.documentElement.classList.add('pb-js');
}

function getObserver(): IntersectionObserver {
    if (observer === null) {
        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    // 원본과 같다: visible 부여 후 unobserve (app.js 3~6행).
                    entry.target.classList.add(VISIBLE_CLASS);
                    const key = nodeKeys.get(entry.target);
                    if (key !== undefined) {
                        revealed.set(key, true);
                        nodeKeys.delete(entry.target);
                    }
                    observer?.unobserve(entry.target);
                }
            },
            { threshold: THRESHOLD },
        );
    }
    return observer;
}

function attach(key: string, node: Element): (() => void) | undefined {
    if (!observerSupported()) return undefined;
    flagJs();
    if (revealed.has(key)) {
        // 같은 key 의 앞 노드가 이미 리빌됐다 — 교체 노드는 애니메이션 없이 표시한다.
        node.classList.add(VISIBLE_CLASS);
        return undefined;
    }
    nodeKeys.set(node, key);
    getObserver().observe(node);
    return () => {
        observer?.unobserve(node);
        nodeKeys.delete(node);
    };
}

/**
 * 리빌 ref 팩토리 훅. 컴포넌트당 한 번 호출하고, 리빌 지점마다 논리 key 로 꺼낸다.
 *
 * ```tsx
 * const reveal = usePbRevealRef<HTMLDivElement>();
 * <Div ref={reveal('hero-shell')} className="pb-hero-shell pb-reveal" />
 * ```
 *
 * key 별로 같은 콜백 식별자를 돌려주므로(캐시) React 가 ref 를 매 렌더마다
 * 떼었다 붙이지 않는다. 목록은 `reveal(`faq-item-${i}`)` 처럼 key 에 순번을 넣는다.
 */
export function usePbRevealRef<T extends HTMLElement = HTMLElement>(): (
    key: string,
) => React.RefCallback<T> {
    const cacheRef = React.useRef<Map<string, React.RefCallback<T>> | null>(null);
    if (cacheRef.current === null) {
        cacheRef.current = new Map();
    }
    return React.useCallback(
        (key: string) => {
            const cache = cacheRef.current;
            if (cache === null) return () => undefined;
            const cached = cache.get(key);
            if (cached) return cached;
            const created: React.RefCallback<T> = (node: T | null) => {
                if (node === null) return; // React 19 cleanup 형식 — detach 는 cleanup 이 맡는다
                const detach = attach(key, node);
                return detach ?? undefined;
            };
            cache.set(key, created);
            return created;
        },
        [],
    );
}

/** 테스트 전용 — key 기준 리빌 완료 상태와 공유 관찰자를 초기화한다. */
export function resetPbRevealForTests(): void {
    observer?.disconnect();
    observer = null;
    revealed.clear();
    document.documentElement.classList.remove('pb-js');
}