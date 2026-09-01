import { default as React } from 'react';
import { CategoryItem } from '../types/template';
export interface CategoryCardProps {
    item: CategoryItem;
    className?: string;
    fallbackSlot?: string;
    /** Override the shop base URL. Defaults to getShopBase(). */
    shopBase?: string;
}
export declare function CategoryCard({ item, className, fallbackSlot, shopBase }: CategoryCardProps): React.ReactElement | null;
export default CategoryCard;
