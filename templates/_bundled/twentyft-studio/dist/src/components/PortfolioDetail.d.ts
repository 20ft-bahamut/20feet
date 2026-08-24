import { default as React } from 'react';
import { PortfolioItem, RouteContext, EditorAttrs } from '../types/template';
export interface PortfolioDetailProps {
    item?: PortfolioItem | null;
    context?: RouteContext;
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function PortfolioDetail({ item, context, className, editorAttrs }: PortfolioDetailProps): React.ReactElement;
export default PortfolioDetail;
