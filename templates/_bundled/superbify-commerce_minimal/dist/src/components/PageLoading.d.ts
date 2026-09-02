import { default as React } from 'react';
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
export declare function PageLoading({ size, label, minHeight, }: PageLoadingProps): React.ReactElement;
export default PageLoading;
