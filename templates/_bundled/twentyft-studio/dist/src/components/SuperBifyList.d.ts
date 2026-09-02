import { default as React } from 'react';
import { SuperBifyItem, EditorAttrs } from '../types/template';
export interface SuperBifyListProps {
    /** undefined/null = data source not resolved yet → skeleton (empty-state flash 방지). */
    items?: SuperBifyItem[] | null;
    /** True while the superbify data source is still loading. */
    loading?: boolean;
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function SuperBifyList({ items, loading, className, editorAttrs }: SuperBifyListProps): React.ReactElement;
export default SuperBifyList;
