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
    /** Sort select options. If omitted no select is rendered. */
    sortOptions?: {
        value: string;
        label: string;
    }[];
    /** Currently selected sort value. */
    sortValue?: string;
    /** Sort change handler. */
    onSortChange?: (value: string) => void;
    sortLabel?: string;
}
export declare function CategoryNav({ items, activeSlug, className, title, allLabel, sortOptions, sortValue, onSortChange, sortLabel, }: CategoryNavProps): React.ReactElement;
export default CategoryNav;
