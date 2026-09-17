import { default as React } from 'react';
import { PortfolioItem, EditorAttrs } from '../types/template';
export interface PortfolioDetailProps {
    item?: PortfolioItem | null;
    /**
     * 대표 주소. 이전 주소로 열린 화면은 대표 주소를 canonical 로 가리킨다.
     * 지정하지 않으면 현재 경로를 그대로 쓴다.
     */
    canonicalPath?: string;
    /** True while the detail data source is still loading. */
    loading?: boolean;
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function PortfolioDetail({ item, canonicalPath, loading, className, editorAttrs, }: PortfolioDetailProps): React.ReactElement;
export default PortfolioDetail;
