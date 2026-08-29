import { default as React } from 'react';
import { CategoryItem } from '../types/template';
export interface CategoryPreviewStripProps {
    items?: CategoryItem[] | null;
    title?: string;
    eyebrow?: string;
    className?: string;
    emptyLabel?: string;
    /** Slot id used when a category lacks a usable image. */
    fallbackSlot?: string;
}
export declare function CategoryPreviewStrip({ items, title, eyebrow, className, emptyLabel, fallbackSlot, }: CategoryPreviewStripProps): React.ReactElement;
export default CategoryPreviewStrip;
