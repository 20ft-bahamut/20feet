import { default as React } from 'react';
import { EditorAttrs } from '../types/template';
export interface SiteFooterProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare const CAPABILITY_LINE = "WEB / COMMERCE / SOFTWARE / GNUBOARD 7";
declare const SIGNATURE = "A SMALL SPACE. INFINITE POSSIBILITIES.";
export declare function SiteFooter({ className, editorAttrs }: SiteFooterProps): React.ReactElement;
export { SIGNATURE };
export default SiteFooter;
