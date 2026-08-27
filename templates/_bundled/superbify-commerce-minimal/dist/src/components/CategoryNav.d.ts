import { default as React } from 'react';
import { CategoryItem } from '../types/template';
export interface CategoryNavProps {
    items?: CategoryItem[] | null;
    /** Slug of the currently active category (for `aria-current`). */
    activeSlug?: string;
    className?: string;
    title?: string;
    /** Label for the "all" link that resolves to /shop. */
    allLabel?: string;
}
export declare function CategoryNav({ items, activeSlug, className, title, allLabel }: CategoryNavProps): React.ReactElement;
export default CategoryNav;
