import { default as React } from 'react';
import { NoticeItem } from '../types/template';
export interface NoticeListProps {
    items?: NoticeItem[] | null;
    loading?: boolean;
    /** Max number of items to render. Items past the limit are not shown. */
    limit?: number;
    emptyTitle?: string;
    emptyMessage?: string;
    /** Localized label for the pinned (공지) row badge. */
    fixedLabel?: string;
    /** Row link base path. Defaults to `/shop/notice`; rows link to `{base}/{id}`. */
    detailBasePath?: string;
    /** Localized aria label for a row link (`:t` is replaced with the post title). */
    rowAriaLabel?: string;
    className?: string;
}
export declare function NoticeList({ items, loading, limit, emptyTitle, emptyMessage, fixedLabel, detailBasePath, rowAriaLabel, className, }: NoticeListProps): React.ReactElement;
export default NoticeList;
