import { default as React } from 'react';
import { EditorAttrs } from '../types/template';
export interface HomeFaqProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}
/**
 * 자주 묻는 질문.
 *
 * details/summary를 써서 자바스크립트 없이도 열리고 닫힌다.
 * 키보드와 화면 낭독기에서 기본 동작을 그대로 쓸 수 있다.
 */
export declare function HomeFaq({ className, editorAttrs }: HomeFaqProps): React.ReactElement;
export default HomeFaq;
