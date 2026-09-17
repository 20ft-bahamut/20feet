import { default as React } from 'react';
import { EditorAttrs } from '../types/template';
export interface HomeInquiryCTAProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}
/**
 * 문의 직전 안내 영역.
 *
 * 상담을 망설이게 만드는 조건(기획서, 예산 확정)을 요구하지 않는다.
 * 회신 시간이나 무료 상담 횟수처럼 확인되지 않은 약속은 넣지 않는다.
 */
export declare function HomeInquiryCTA({ className, editorAttrs }: HomeInquiryCTAProps): React.ReactElement;
export default HomeInquiryCTA;
