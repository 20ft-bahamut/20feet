import { default as React } from 'react';
import { PortfolioItem, EditorAttrs } from '../types/template';
export interface PortfolioDetailProps {
    item?: PortfolioItem | null;
    /** True while the detail data source is still loading. */
    loading?: boolean;
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function PortfolioDetail({ item, loading, className, editorAttrs }: PortfolioDetailProps): React.ReactElement;
export default PortfolioDetail;
