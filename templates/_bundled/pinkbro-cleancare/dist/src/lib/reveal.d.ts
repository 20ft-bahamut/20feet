import { default as React } from 'react';
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
export declare function usePbRevealRef<T extends HTMLElement = HTMLElement>(): (key: string) => React.RefCallback<T>;
/** 테스트 전용 — key 기준 리빌 완료 상태와 공유 관찰자를 초기화한다. */
export declare function resetPbRevealForTests(): void;
