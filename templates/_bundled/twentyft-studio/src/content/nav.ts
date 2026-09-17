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
export const PRIMARY_NAV: NavItem[] = [
    { label: '제작 서비스', href: '/services', 'data-testid': 'header-nav-services' },
    { label: '제작 사례', href: '/portfolio', 'data-testid': 'header-nav-portfolio' },
    { label: '진행 안내', href: '/process', 'data-testid': 'header-nav-process' },
    { label: '이십피트 소개', href: '/about', 'data-testid': 'header-nav-about' },
];

/** 주요 행동 버튼 */
export const PRIMARY_ACTION: NavItem = {
    label: '제작 문의',
    href: '/inquiry',
    'data-testid': 'header-cta',
};

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
export const FOOTER_COLUMNS: FooterColumn[] = [
    {
        heading: '제작 서비스',
        items: [
            { label: '홈페이지', href: '/services/website' },
            { label: '쇼핑몰', href: '/services/commerce' },
            { label: '웹프로그램', href: '/services/web-development' },
        ],
    },
    {
        heading: '이십피트',
        items: [
            { label: '제작 사례', href: '/portfolio' },
            { label: '진행 안내', href: '/process' },
            { label: '소개', href: '/about' },
        ],
    },
    {
        heading: '문의·제품',
        items: [
            { label: '제작 문의', href: '/inquiry' },
            { label: 'SuperBify', href: '/superbify' },
        ],
    },
];
