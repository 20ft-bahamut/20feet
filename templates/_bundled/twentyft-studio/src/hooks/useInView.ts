import React from 'react';

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
export function useInView(options: UseInViewOptions = {}): {
    ref: React.RefCallback<HTMLElement>;
    isInView: boolean;
} {
    const { once = true, rootMargin = '0px 0px -50px 0px', threshold = 0 } = options;
    const [isInView, setIsInView] = React.useState(false);
    const elementRef = React.useRef<HTMLElement | null>(null);
    const observerRef = React.useRef<IntersectionObserver | null>(null);

    const ref = React.useCallback(
        (node: HTMLElement | null) => {
            if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
                setIsInView(true);
                return;
            }

            if (observerRef.current) {
                observerRef.current.disconnect();
            }

            elementRef.current = node;

            if (node) {
                observerRef.current = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                setIsInView(true);
                                if (once && observerRef.current) {
                                    observerRef.current.unobserve(entry.target);
                                }
                            } else if (!once) {
                                setIsInView(false);
                            }
                        });
                    },
                    { rootMargin, threshold }
                );
                observerRef.current.observe(node);
            }
        },
        [once, rootMargin, threshold]
    );

    React.useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return { ref, isInView };
}

export default useInView;
