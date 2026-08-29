import { default as React } from 'react';
export interface PromoBannerProps {
    eyebrow?: string;
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaHref?: string;
    className?: string;
    mediaSlot?: string;
    /** Visual variant. 'split' = image left + type right. */
    layout?: 'split' | 'dark';
}
/**
 * Lifestyle feature split banner. Used as the trailing home section.
 * Renders a media-anchored editorial card instead of a hard-coded dark block.
 */
export declare function PromoBanner({ eyebrow, title, description, ctaLabel, ctaHref, className, mediaSlot, layout, }: PromoBannerProps): React.ReactElement;
export default PromoBanner;
