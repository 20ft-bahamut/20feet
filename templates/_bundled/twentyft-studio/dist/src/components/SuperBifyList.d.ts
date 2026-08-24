import { default as React } from 'react';
import { SuperBifyItem, EditorAttrs } from '../types/template';
export interface SuperBifyListProps {
    items?: SuperBifyItem[];
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function SuperBifyList({ items, className, editorAttrs }: SuperBifyListProps): React.ReactElement;
export default SuperBifyList;
