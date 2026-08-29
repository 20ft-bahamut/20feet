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
}
/**
 * Full-width editorial band: large display heading + thin wood rule + CTA link.
 * Used on home to break product grids with type.
 */
export declare function EditorialBanner({ eyebrow, heading, body, ctaLabel, ctaHref, className, inverted, }: EditorialBannerProps): React.ReactElement;
export default EditorialBanner;
