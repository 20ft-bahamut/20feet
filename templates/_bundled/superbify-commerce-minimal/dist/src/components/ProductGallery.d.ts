import { default as React } from 'react';
export interface ProductGalleryImage {
    id?: number | string;
    url?: string;
    alt_text?: string;
    /** Local asset slot id used as fallback when the URL is missing. */
    slot?: string;
}
export interface ProductGalleryProps {
    images?: ProductGalleryImage[] | null;
    productName?: string;
    className?: string;
    /** Slot id of the primary image (used when no images are present). */
    fallbackSlot?: string;
}
export declare function ProductGallery({ images, productName, className, fallbackSlot }: ProductGalleryProps): React.ReactElement;
export default ProductGallery;
