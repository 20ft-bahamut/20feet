import { default as React } from 'react';
import { SuperBifyItem, EditorAttrs } from '../types/template';
export interface SuperBifyPreviewProps {
    /** undefined/null = data source not resolved yet → skeleton (empty-state flash 방지). */
    items?: SuperBifyItem[] | null;
    /** True while the featured-superbify data source is still loading. */
    loading?: boolean;
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function SuperBifyPreview({ items, loading, className, editorAttrs, }: SuperBifyPreviewProps): React.ReactElement;
export default SuperBifyPreview;
