import { default as React } from 'react';
import { PortfolioItem, SuperBifyItem, EditorAttrs } from '../types/template';
export interface PortfolioListProps {
    /** 고객 프로젝트. undefined/null = 아직 로딩 중. */
    items?: PortfolioItem[] | null;
    /** 자체 제작 데모·제품. undefined/null = 아직 로딩 중. */
    demos?: SuperBifyItem[] | null;
    loading?: boolean;
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function PortfolioList({ items, demos, loading, className, editorAttrs, }: PortfolioListProps): React.ReactElement;
export default PortfolioList;
