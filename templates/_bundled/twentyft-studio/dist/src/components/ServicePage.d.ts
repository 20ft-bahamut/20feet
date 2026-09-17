import { default as React } from 'react';
import { ServiceKey } from '../content/services';
import { PortfolioItem, SuperBifyItem, EditorAttrs } from '../types/template';
export interface ServicePageProps {
    /** 어떤 서비스 상세인지. 레이아웃 JSON의 props로 지정한다. */
    service: ServiceKey;
    /** 커머스 상세에서 보여줄 자체 제작 데모. */
    demos?: SuperBifyItem[] | null;
    /** 웹프로그램 상세에서 보여줄 실제 사례. */
    cases?: PortfolioItem[] | null;
    className?: string;
    editorAttrs?: EditorAttrs;
}
/**
 * 제작 서비스 상세.
 *
 * 각 섹션은 '제목 → 설명 → 실제 자료 → 상세 링크' 순서를 지킨다.
 * 자료가 붙는 섹션은 서비스 정의에서 `evidence` 로 표시하므로,
 * 카드가 설명보다 먼저 나오는 일이 없다.
 */
export declare function ServicePage({ service, demos, cases, className, editorAttrs, }: ServicePageProps): React.ReactElement;
export default ServicePage;
