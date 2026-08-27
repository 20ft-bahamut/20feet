import { default as React } from 'react';
export interface PromoBannerProps {
    eyebrow?: string;
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaHref?: string;
    className?: string;
    mediaSlot?: string;
}
export declare function PromoBanner({ eyebrow, title, description, ctaLabel, ctaHref, className, mediaSlot, }: PromoBannerProps): React.ReactElement;
export default PromoBanner;
