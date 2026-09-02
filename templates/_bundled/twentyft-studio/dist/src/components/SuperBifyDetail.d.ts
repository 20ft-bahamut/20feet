import { default as React } from 'react';
import { SuperBifyItem, EditorAttrs } from '../types/template';
export interface SuperBifyDetailProps {
    item?: SuperBifyItem | null;
    /** True while the detail data source is still loading. */
    loading?: boolean;
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function SuperBifyDetail({ item, loading, className, editorAttrs }: SuperBifyDetailProps): React.ReactElement;
export default SuperBifyDetail;
