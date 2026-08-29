import { default as React } from 'react';
import { A, Div, Span } from './basic';
import { Price } from './Price';
import { resolveSlotImage } from './imageSlots';
import { ProductItem } from '../types/template';
export interface CrossSellStripProps {
    items?: ProductItem[] | null;
    title?: string;
    eyebrow?: string;
    className?: string;
    /** Optional handler invoked when the user clicks "담기" on a card. */
    onQuickAdd?: (item: ProductItem, event: React.MouseEvent | React.KeyboardEvent) => void;
    quickAddLabel?: string;
    loading?: boolean;
    /** Maximum items to show. */
    limit?: number;
}
export declare function CrossSellStrip({ items, title, eyebrow, className, onQuickAdd, quickAddLabel, loading, limit, }: CrossSellStripProps): React.ReactElement | null;
export { resolveSlotImage, Price, A, Div, Span };
export default CrossSellStrip;
