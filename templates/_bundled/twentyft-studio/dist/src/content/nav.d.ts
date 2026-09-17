/**
 * 사이트 내비게이션 정의.
 *
 * 우선순위: 외주 수주 > 개발자 개인브랜드 > SuperBify.
 * 상단 메뉴는 제작 의뢰 동선을 따르고, SuperBify는 푸터의 '자체 개발 제품'으로 둔다.
 */
export interface NavItem {
    label: string;
    href: string;
    'data-testid'?: string;
}
/** 상단 메뉴 (데스크톱·모바일 공통) */
export declare const PRIMARY_NAV: NavItem[];
/** 주요 행동 버튼 */
export declare const PRIMARY_ACTION: NavItem;
/** 푸터 열 구성 */
export interface FooterColumn {
    heading: string;
    items: NavItem[];
}
/**
 * 푸터 열.
 *
 * 서비스별 문의 링크(`/inquiry?type=...`)는 푸터에 두지 않는다 — 문의 진입은 한 곳으로 모으고,
 * 유형 선택은 문의 화면에서 한다. 좁은 열에서 긴 이름이 어색하게 접히지 않도록
 * 라벨은 짧게 쓴다(정식 명칭은 해당 페이지의 제목이 담당한다).
 */
export declare const FOOTER_COLUMNS: FooterColumn[];
