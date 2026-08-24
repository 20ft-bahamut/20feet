import { default as React } from 'react';
import { EditorAttrs } from '../types/template';
export interface ContainerProps {
    id?: string;
    children?: React.ReactNode;
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function Container({ id, children, className, editorAttrs }: ContainerProps): React.ReactElement;
export default Container;
