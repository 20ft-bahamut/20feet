import { default as React } from 'react';
import { PortfolioItem, EditorAttrs } from '../types/template';
export interface PortfolioListProps {
    items?: PortfolioItem[];
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function PortfolioList({ items, className, editorAttrs }: PortfolioListProps): React.ReactElement;
export default PortfolioList;
