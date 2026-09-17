import { default as React } from 'react';
import { EditorAttrs } from '../types/template';
export interface HomeServicesProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}
/**
 * 제작 서비스.
 *
 * 세 줄짜리 목록이라 카드로 감싸지 않는다. 위쪽 괘선과 여백만으로 구분한다.
 * 고객이 '내 상황이 여기 해당하는지' 판단할 만큼만 쓰고 상세는 각 페이지로 넘긴다.
 */
export declare function HomeServices({ className, editorAttrs }: HomeServicesProps): React.ReactElement;
export default HomeServices;
