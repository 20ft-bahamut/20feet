import { default as React } from 'react';
export interface UseInViewOptions {
    /** Trigger only once per element. */
    once?: boolean;
    /** Root margin for the IntersectionObserver. */
    rootMargin?: string;
    /** Threshold at which to trigger. */
    threshold?: number;
}
/**
 * Observe an element and return whether it is intersecting the viewport.
 *
 * Uses IntersectionObserver for GPU/performance-friendly detection.
 * No forced layout reads on scroll.
 */
export declare function useInView(options?: UseInViewOptions): {
    ref: React.RefCallback<HTMLElement>;
    isInView: boolean;
};
export default useInView;
