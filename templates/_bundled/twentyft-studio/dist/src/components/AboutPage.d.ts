import { default as React } from 'react';
import { PortfolioItem, EditorAttrs } from '../types/template';
export interface AboutPageProps {
    /** 실제로 담당한 프로젝트. */
    cases?: PortfolioItem[] | null;
    className?: string;
    editorAttrs?: EditorAttrs;
}
export declare function AboutPage({ cases, className, editorAttrs }: AboutPageProps): React.ReactElement;
export default AboutPage;
