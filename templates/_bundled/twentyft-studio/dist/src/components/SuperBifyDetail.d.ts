import { default as React } from 'react';
import { SuperBifyItem, RouteContext, EditorAttrs } from '../types/template';
export interface SuperBifyDetailProps {
    item?: SuperBifyItem | null;
    context?: RouteContext;
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function SuperBifyDetail({ item, context, className, editorAttrs }: SuperBifyDetailProps): React.ReactElement;
export default SuperBifyDetail;
