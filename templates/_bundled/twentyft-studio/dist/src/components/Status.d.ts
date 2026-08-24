import { default as React } from 'react';
import { EditorAttrs } from '../types/template';
export interface StatusProps {
    title: string;
    message: string;
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function Status({ title, message, className, editorAttrs }: StatusProps): React.ReactElement;
export default Status;
