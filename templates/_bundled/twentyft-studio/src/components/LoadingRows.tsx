import React from 'react';
import { Div, Span } from './basic';

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
export function LoadingRows({ rows = 3, testId = 'loading-rows', mediaAspect }: LoadingRowsProps): React.ReactElement {
    return (
        <Div
            aria-hidden="true"
            aria-busy="true"
            data-testid={testId}
            data-loading="true"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--20ft-content-gap-lg, 1.75rem)',
                width: '100%',
                minWidth: 0,
            }}
        >
            {Array.from({ length: Math.max(1, rows) }, (_, index) => (
                <Div
                    key={index}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-spacing-sm, 0.75rem)',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    {mediaAspect && (
                        <Div
                            style={{
                                width: '100%',
                                aspectRatio: mediaAspect,
                                borderRadius: 'var(--20ft-radius, 0.5rem)',
                                backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
                            }}
                        />
                    )}
                    <Div
                        style={{
                            height: '1.375rem',
                            width: '38%',
                            borderRadius: 'var(--20ft-radius-sm, 0.25rem)',
                            backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
                        }}
                    />
                    <Span
                        style={{
                            display: 'block',
                            height: '0.875rem',
                            width: index % 2 === 0 ? '72%' : '56%',
                            borderRadius: 'var(--20ft-radius-sm, 0.25rem)',
                            backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
                        }}
                    />
                </Div>
            ))}
        </Div>
    );
}

export default LoadingRows;