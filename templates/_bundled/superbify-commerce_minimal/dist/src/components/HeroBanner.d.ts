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
    /** Override the hero image directly with a bundled asset URL. */
    mediaSrc?: string;
    /** When true, render a soft ivory border/veil around the visual tile. */
    veil?: boolean;
    /** Visual variant — 'full' (default) bleeds the section edges, 'contained' adds side gutter. */
    bleed?: 'full' | 'contained';
    /**
     * Layout style.
     *  - 'split' (default): left type column + right 4:3 image tile
     *  - 'wide':   type left (~38%), image right (~62%) — confident desktop presence
     *  - 'stacked': full-width image on top, type below
     */
    layout?: 'split' | 'wide' | 'stacked';
}
export declare function HeroBanner({ eyebrow, headline, sub, primaryCtaLabel, primaryCtaHref, secondaryCtaLabel, secondaryCtaHref, className, mediaSlot, mediaSrc, veil, bleed, layout, }: HeroBannerProps): React.ReactElement;
export default HeroBanner;
