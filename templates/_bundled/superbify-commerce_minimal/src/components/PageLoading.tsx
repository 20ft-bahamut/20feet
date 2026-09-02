import React from 'react';
import { Div, Span } from './basic';

export interface PageLoadingProps {
    /** Visual height of the spinner in px (default 28). */
    size?: number;
    /** Accessible label (screen reader). Visual text is intentionally omitted — quiet brand. */
    label?: string;
    /** Minimum block height so late layouts do not jump (default 240). */
    minHeight?: number;
}

/**
 * Full-content-area loading spinner for G7 transition_overlay (style: spinner).
 * Quiet brand treatment: ivory background, single charcoal ring, no text.
 * Ring animation is pure CSS (registered once, idempotent).
 */
export function PageLoading({
    size = 28,
    label = 'Loading…',
    minHeight = 240,
}: PageLoadingProps): React.ReactElement {
    if (typeof document !== 'undefined' && !document.getElementById('scm-page-loading-style')) {
        const style = document.createElement('style');
        style.id = 'scm-page-loading-style';
        style.textContent = [
            '@keyframes scm-page-loading-spin{to{transform:rotate(360deg)}}',
        ].join('');
        document.head.appendChild(style);
    }

    return (
        <Div
            data-testid="page-loading"
            role="status"
            aria-busy="true"
            aria-label={label}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight,
                backgroundColor: 'var(--scm-bg-primary, #FBF8F1)',
            }}
        >
            <Span
                aria-hidden
                style={{
                    display: 'block',
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    border: '2px solid var(--scm-line, #E4DCCE)',
                    borderTopColor: 'var(--scm-charcoal, #26221E)',
                    animation: 'scm-page-loading-spin 0.9s linear infinite',
                }}
            />
        </Div>
    );
}

export default PageLoading;