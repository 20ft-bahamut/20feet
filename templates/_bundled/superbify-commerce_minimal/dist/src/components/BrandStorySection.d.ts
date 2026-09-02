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
    /** Override the side image directly with a bundled asset URL. */
    mediaSrc?: string;
    /** Visual variant. 'split' = image+text 2-col (default). 'stacked' = type only. */
    layout?: 'split' | 'stacked';
    /** Render the small Still Form emblem stamp under the copy (default off). */
    stamp?: boolean;
    /** Heading tag. 'h2' (default) for in-page sections; 'h1' for a page hero (e.g. /shop/story). */
    headingAs?: 'h1' | 'h2';
    /** Stamp visual ink height in px (default 80). */
    stampHeight?: number;
}
export declare function BrandStorySection({ eyebrow, heading, body, ctaLabel, ctaHref, className, mediaSlot, mediaSrc, layout, stamp, stampHeight, headingAs: HeadingAs, }: BrandStorySectionProps): React.ReactElement;
export default BrandStorySection;
