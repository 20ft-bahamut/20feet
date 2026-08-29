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
    /** Slot id of the visual tile image. */
    mediaSlot?: string;
    /** When true, render a soft ivory border/veil around the visual tile. */
    veil?: boolean;
    /** Visual variant — 'full' (default) bleeds the section edges, 'contained' adds side gutter. */
    bleed?: 'full' | 'contained';
}
export declare function HeroBanner({ eyebrow, headline, sub, primaryCtaLabel, primaryCtaHref, secondaryCtaLabel, secondaryCtaHref, className, mediaSlot, veil, bleed, }: HeroBannerProps): React.ReactElement;
export default HeroBanner;
