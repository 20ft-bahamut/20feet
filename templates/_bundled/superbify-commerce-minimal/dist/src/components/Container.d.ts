import { default as React } from 'react';
import { EditorAttrs } from '../types/template';
export interface ContainerProps {
    id?: string;
    children?: React.ReactNode;
    className?: string;
    wide?: boolean;
    editorAttrs?: EditorAttrs;
}
export declare function Container({ id, children, className, wide, editorAttrs }: ContainerProps): React.ReactElement;
export default Container;
