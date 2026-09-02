import { default as React } from 'react';
import { PortfolioItem, EditorAttrs } from '../types/template';
export interface SelectedPortfolioProps {
    /** undefined/null = data source not resolved yet → skeleton (empty-state flash 방지). */
    items?: PortfolioItem[] | null;
    /** True while the featured-portfolio data source is still loading. */
    loading?: boolean;
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function SelectedPortfolio({ items, loading, className, editorAttrs, }: SelectedPortfolioProps): React.ReactElement;
export default SelectedPortfolio;
