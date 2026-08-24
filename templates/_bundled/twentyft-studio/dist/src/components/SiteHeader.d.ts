import { default as React } from 'react';
import { EditorAttrs } from '../types/template';
export interface SiteHeaderProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function SiteHeader({ className, editorAttrs }: SiteHeaderProps): React.ReactElement;
export default SiteHeader;
