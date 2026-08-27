import { default as React } from 'react';
export interface EmptyStateProps {
    title?: string;
    message?: string;
    ctaLabel?: string;
    ctaHref?: string;
    className?: string;
}
export declare function EmptyState({ title, message, ctaLabel, ctaHref, className, }: EmptyStateProps): React.ReactElement;
export default EmptyState;
