import { default as React } from 'react';
export interface BrandStorySectionProps {
    eyebrow?: string;
    heading?: string;
    body?: string;
    ctaLabel?: string;
    ctaHref?: string;
    className?: string;
    /** Slot id of a side image. */
    mediaSlot?: string;
    /** Visual variant. 'split' = image+text 2-col (default). 'stacked' = type only. */
    layout?: 'split' | 'stacked';
}
export declare function BrandStorySection({ eyebrow, heading, body, ctaLabel, ctaHref, className, mediaSlot, layout, }: BrandStorySectionProps): React.ReactElement;
export default BrandStorySection;
