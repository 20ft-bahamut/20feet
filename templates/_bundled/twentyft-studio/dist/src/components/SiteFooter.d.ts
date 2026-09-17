import { default as React } from 'react';
import { EditorAttrs } from '../types/template';
export interface SiteFooterProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}
/**
 * 공통 푸터.
 *
 * 왼쪽은 로고·사업 설명 한 문장·저작권만, 오른쪽은 세 개의 짧은 링크 열.
 * 확인된 연락처가 없으므로 연락처 줄은 두지 않는다.
 * 문의 유도 버튼을 되풀이하지 않아 본문보다 강조되지 않게 한다.
 */
export declare function SiteFooter({ className, editorAttrs }: SiteFooterProps): React.ReactElement;
export default SiteFooter;
