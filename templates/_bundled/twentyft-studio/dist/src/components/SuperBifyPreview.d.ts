import { default as React } from 'react';
import { SuperBifyItem, EditorAttrs } from '../types/template';
export interface SuperBifyPreviewProps {
    items?: SuperBifyItem[];
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function SuperBifyPreview({ items, className, editorAttrs, }: SuperBifyPreviewProps): React.ReactElement;
export default SuperBifyPreview;
