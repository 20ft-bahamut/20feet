import React from 'react';

/**
 * Detect the user's motion preference using matchMedia.
 * Falls back to false if matchMedia is unavailable.
 */
export function useReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

    React.useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) {
            setPrefersReducedMotion(false);
            return;
        }

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (event: MediaQueryListEvent): void => {
            setPrefersReducedMotion(event.matches);
        };

        mediaQuery.addEventListener('change', handler);
        return () => {
            mediaQuery.removeEventListener('change', handler);
        };
    }, []);

    return prefersReducedMotion;
}

export default useReducedMotion;
