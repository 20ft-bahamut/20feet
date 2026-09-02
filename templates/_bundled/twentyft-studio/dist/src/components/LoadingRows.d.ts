import { default as React } from 'react';
export interface LoadingRowsProps {
    /** Number of skeleton rows to render. */
    rows?: number;
    /** Test id for the pending container. */
    testId?: string;
    /** Row media aspect ratio (CSS aspect-ratio value). Omit for text-only rows. */
    mediaAspect?: string;
}
/**
 * Editorial skeleton placeholder shown while layout data sources are loading.
 * Renders aria-hidden bars so screen readers never announce "empty" prematurely.
 */
export declare function LoadingRows({ rows, testId, mediaAspect }: LoadingRowsProps): React.ReactElement;
export default LoadingRows;
