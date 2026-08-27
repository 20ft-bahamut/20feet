import { default as React } from 'react';
export interface HeroBannerProps {
    eyebrow?: string;
    headline?: string;
    sub?: string;
    primaryCtaLabel?: string;
    primaryCtaHref?: string;
    secondaryCtaLabel?: string;
    secondaryCtaHref?: string;
    className?: string;
    /** Slot id of the background image; falls back to a neutral CSS block. */
    mediaSlot?: string;
}
export declare function HeroBanner({ eyebrow, headline, sub, primaryCtaLabel, primaryCtaHref, secondaryCtaLabel, secondaryCtaHref, className, mediaSlot, }: HeroBannerProps): React.ReactElement;
export default HeroBanner;
