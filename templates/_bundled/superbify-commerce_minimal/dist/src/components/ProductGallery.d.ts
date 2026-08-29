import { default as React } from 'react';
import { ProductItem } from '../types/template';
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
    /** Optional product data; used to derive a category-aware still-life slot
     *  when `images` is empty and `fallbackSlot` is omitted. */
    product?: ProductItem | null;
}
export declare function ProductGallery({ images, productName, className, fallbackSlot, product }: ProductGalleryProps): React.ReactElement;
export default ProductGallery;
