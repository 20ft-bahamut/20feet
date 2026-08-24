import { default as React } from 'react';
import { PortfolioItem, EditorAttrs } from '../types/template';
export interface SelectedPortfolioProps {
    items?: PortfolioItem[];
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function SelectedPortfolio({ items, className, editorAttrs }: SelectedPortfolioProps): React.ReactElement;
export default SelectedPortfolio;
