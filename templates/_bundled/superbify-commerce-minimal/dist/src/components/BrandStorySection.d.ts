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
}
export declare function BrandStorySection({ eyebrow, heading, body, ctaLabel, ctaHref, className, mediaSlot, }: BrandStorySectionProps): React.ReactElement;
export default BrandStorySection;
