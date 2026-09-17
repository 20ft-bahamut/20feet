import { default as React } from 'react';
import { SuperBifyItem, EditorAttrs } from '../types/template';
export interface SuperBifyDetailProps {
    item?: SuperBifyItem | null;
    /** True while the detail data source is still loading. */
    loading?: boolean;
    className?: string;
    editorAttrs?: EditorAttrs;
}
/**
 * 자체 개발 제품 상세.
 *
 * 일반 고객이 "이게 무엇이고 다음에 무엇을 할 수 있는지"를 알 수 있게 하되,
 * 버전·호환성·라이선스와 저장소 링크 같은 개발자용 정보는 그대로 유지한다.
 * 확인되지 않은 데모 주소나 기능은 만들지 않는다.
 */
export declare function SuperBifyDetail({ item, loading, className, editorAttrs, }: SuperBifyDetailProps): React.ReactElement;
export default SuperBifyDetail;
