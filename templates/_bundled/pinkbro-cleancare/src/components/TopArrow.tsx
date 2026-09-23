import React from 'react';
import '../styles/TopArrow.css';

/**
 * 상단으로 이동 버튼 — source 원문 단일 이식.
 *
 * 원문: `_workspace/pinkbro/source/body.html:495`
 *   <button class="top-arrow" type="button" aria-label="상단으로 이동"
 *     onclick="window.scrollTo({top:0, behavior:'smooth'})">↑</button>
 *
 * aria-label 은 원문 문구를 그대로 쓴다(COPY POLICY — 창작 금지). 클릭 동작도
 * 원문 onclick 과 동일한 `window.scrollTo({ top: 0, behavior: 'smooth' })`.
 *
 * 원문과의 유일한 동작 차이(브리프 지시): 원문 styles.css 는 prefers-reduced-motion
 * 을 존중하지 않지만, 이 컴포넌트는 reduced-motion 환경에서 behavior 를 'auto' 로
 * 낮춰 즉시 이동시킨다. 스타일 값은 TopArrow.css 의 원문 이식 값 그대로다.
 */

/** 원문 aria-label(body.html 495행) — 그대로 사용한다. */
const TOP_ARROW_LABEL = '상단으로 이동';

export interface TopArrowProps {}

/** reduced-motion 환경이면 원문의 smooth 대신 auto 로 낮춘다(브리프 지시). */
function resolveScrollBehavior(): ScrollBehavior {
    if (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
        return 'auto';
    }
    return 'smooth';
}

export function TopArrow(_props: TopArrowProps): React.ReactElement {
    return (
        <button
            type="button"
            className="pb-top-arrow"
            aria-label={TOP_ARROW_LABEL}
            data-testid="pb-top-arrow"
            onClick={() => {
                window.scrollTo({ top: 0, behavior: resolveScrollBehavior() });
            }}
        >
            ↑
        </button>
    );
}

export default TopArrow;