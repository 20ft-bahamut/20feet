import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TopArrow } from '../../src/components/TopArrow';

/**
 * TopArrow 컴포넌트 테스트.
 *
 * 원문 근거: `_workspace/pinkbro/source/body.html:495` —
 *   <button class="top-arrow" type="button" aria-label="상단으로 이동"
 *     onclick="window.scrollTo({top:0, behavior:'smooth'})">↑</button>
 *
 * aria-label 은 원문 문구 그대로(COPY POLICY), 클릭은 원문과 동일한
 * smooth 스크롤이다. reduced-motion 환경에서는 behavior 가 'auto' 로 내려간다
 * (원문과의 유일한 동작 차이 — 브리프 지시).
 */

describe('TopArrow', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders the source button verbatim — type, aria-label, ↑ glyph', () => {
        render(<TopArrow />);
        const button = screen.getByTestId('pb-top-arrow');

        expect(button.tagName).toBe('BUTTON');
        expect(button).toHaveAttribute('type', 'button');
        expect(button).toHaveAttribute('aria-label', '상단으로 이동');
        expect(button).toHaveTextContent('↑');
    });

    it('scrolls to top with the source behavior (smooth)', () => {
        const scrollTo = vi.fn();
        vi.stubGlobal('scrollTo', scrollTo);
        // matchMedia 가 reduced-motion 이 아니라고 답하게 둔다
        vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));

        render(<TopArrow />);
        fireEvent.click(screen.getByTestId('pb-top-arrow'));

        expect(scrollTo).toHaveBeenCalledTimes(1);
        expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('lowers the behavior to auto under prefers-reduced-motion', () => {
        const scrollTo = vi.fn();
        vi.stubGlobal('scrollTo', scrollTo);
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({ matches: true })),
        );

        render(<TopArrow />);
        fireEvent.click(screen.getByTestId('pb-top-arrow'));

        expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    });

    it('falls back to smooth when matchMedia is unavailable', () => {
        const scrollTo = vi.fn();
        vi.stubGlobal('scrollTo', scrollTo);
        vi.stubGlobal('matchMedia', undefined);

        render(<TopArrow />);
        fireEvent.click(screen.getByTestId('pb-top-arrow'));

        expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
});