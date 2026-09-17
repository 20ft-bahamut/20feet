import { default as React } from 'react';
import { PortfolioItem, SuperBifyItem, EditorAttrs } from '../types/template';
export interface HomeCasesProps {
    /** 공개된 제작 사례. undefined/null = 아직 로딩 중. */
    items?: PortfolioItem[] | null;
    /** 자체 제작 제품·데모. undefined/null = 아직 로딩 중. */
    demos?: SuperBifyItem[] | null;
    loading?: boolean;
    className?: string;
    editorAttrs?: EditorAttrs;
}
/**
 * 제작 사례.
 *
 * 한 건씩 화면 폭을 모두 쓰는 행으로 쌓는다. 두 칸으로 나누면 실제 화면이 작아져
 * 무엇을 만들었는지 읽히지 않는다. 이미지는 원본 비율(16:9)을 그대로 쓴다.
 */
export declare function HomeCases({ items, demos, loading, className, editorAttrs, }: HomeCasesProps): React.ReactElement;
export default HomeCases;
