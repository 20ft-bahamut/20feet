import { default as React } from 'react';
import { PortfolioItem, EditorAttrs } from '../types/template';
export interface PortfolioListProps {
    /** undefined/null = data source not resolved yet → skeleton (empty-state flash 방지). */
    items?: PortfolioItem[] | null;
    /** True while the portfolio data source is still loading. */
    loading?: boolean;
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function PortfolioList({ items, loading, className, editorAttrs }: PortfolioListProps): React.ReactElement;
export default PortfolioList;
