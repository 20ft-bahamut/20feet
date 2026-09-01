import { default as React } from 'react';
import { CategoryItem } from '../types/template';
export interface CategoryPreviewStripProps {
    items?: CategoryItem[] | null;
    title?: string;
    eyebrow?: string;
    className?: string;
    emptyLabel?: string;
    /** Label for the "all categories" chip (falls back to generic label). */
    allLabel?: string;
    /** Override the shop base URL. Defaults to getShopBase(). */
    shopBase?: string;
}
/**
 * Typographic category rail — no image dependency.
 *
 * Data-driven from the public category API (name/slug/products_count), so any
 * admin-side category change is reflected without template edits. Visual
 * language mirrors the shop page's CategoryNav pills for consistency.
 */
export declare function CategoryPreviewStrip({ items, title, eyebrow, className, emptyLabel, allLabel, shopBase, }: CategoryPreviewStripProps): React.ReactElement;
export default CategoryPreviewStrip;
