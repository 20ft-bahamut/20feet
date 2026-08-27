import { default as React } from 'react';
import { ProductItem } from '../types/template';
export interface RelatedProductsProps {
    items?: ProductItem[] | null;
    title?: string;
    eyebrow?: string;
    limit?: number;
    className?: string;
}
export declare function RelatedProducts({ items, title, eyebrow, limit, className, }: RelatedProductsProps): React.ReactElement;
export default RelatedProducts;
