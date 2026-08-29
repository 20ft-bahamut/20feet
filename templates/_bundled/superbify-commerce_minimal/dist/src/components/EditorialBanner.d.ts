import { default as React } from 'react';
export interface EditorialBannerProps {
    eyebrow?: string;
    heading: string;
    body?: string;
    ctaLabel?: string;
    ctaHref?: string;
    className?: string;
    /** Toggle: render the body in inverted (charcoal background) style. Defaults to ivory. */
    inverted?: boolean;
    /** Override the visual asset directly. */
    mediaSrc?: string;
    /** Render the visual: 'side' (image+type), 'full' (full-width image, overlay text), 'panel' (text panel left ~44%, image right ~56% flush). */
    variant?: 'side' | 'full' | 'panel';
}
/**
 * Full-width editorial band. Two variants:
 *   - 'side'  : image left + type right (default)
 *   - 'full'  : full-width image with overlay type (subtle dark veil)
 *
 * Used on home to break product grids with type.
 */
export declare function EditorialBanner({ eyebrow, heading, body, ctaLabel, ctaHref, className, inverted, mediaSrc, variant, }: EditorialBannerProps): React.ReactElement;
export default EditorialBanner;
