import { default as React } from 'react';
import { CategoryItem } from '../types/template';
export interface CategoryCardProps {
    item: CategoryItem;
    className?: string;
    fallbackSlot?: string;
}
export declare function CategoryCard({ item, className, fallbackSlot }: CategoryCardProps): React.ReactElement | null;
export default CategoryCard;
