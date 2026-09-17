/**
 * 제작 서비스 정의.
 *
 * 홈 서비스 카드, /services 목록, /services/* 상세가 모두 이 한 곳을 참조한다.
 *
 * 작성 원칙
 * - 서비스 페이지는 '무엇을 제작하고 어떤 용도로 쓰는지'를 먼저 설명한다.
 * - 고객이 준비할 내용은 별도 섹션으로 짧게 두고, 제공 내용보다 앞세우지 않는다.
 * - '약속하지 않습니다' 처럼 사업 조건을 방어하는 문장은 고객용 문구가 아니다. 쓰지 않는다.
 * - 확인되지 않은 가격·기간·실적·지원 범위를 만들지 않는다.
 *
 * `inquiryType`은 twentyft-content 모듈의 InquiryProjectType enum 값과 일치해야 한다.
 * (modules/twentyft-content/src/Enums/InquiryProjectType.php)
 */

export type ServiceKey = 'website' | 'commerce' | 'web-development';

/** twentyft-content InquiryProjectType enum 값 중 이 화면에서 사용하는 항목. */
export type InquiryProjectTypeValue =
    | 'WEB'
    | 'COMMERCE'
    | 'INTERNAL_SYSTEM'
    | 'SYSTEM_IMPROVEMENT'
    | 'OTHER';

export interface ServiceSection {
    /** 섹션 소제목 */
    heading: string;
    /** 섹션 설명 (선택) */
    lead?: string;
    /** 목록 항목 */
    items?: string[];
    /** 목록 대신 쓰는 짧은 안내 문장 */
    note?: string;
    /**
     * 이 섹션에 붙일 실제 자료.
     * 값이 있으면 '제목 → 설명 → 자료 → 상세 링크' 순서로 렌더된다.
     */
    evidence?: 'demos' | 'cases';
}

export interface ServiceDefinition {
    key: ServiceKey;
    /** 목록·메뉴에 쓰는 이름 */
    label: string;
    /** 좁은 자리(카드 링크·버튼)에 쓰는 더 짧은 이름 */
    shortLabel: string;
    /** 상세 페이지 CTA 버튼 문구 */
    ctaLabel: string;
    /** 서비스 목록에 쓰는 한 줄 요약 */
    summary: string;
    /** 홈 카드에 쓰는 제공 내용 한 줄 */
    homeBlurb: string;
    path: string;
    /** 상세 페이지 제목 */
    heading: string;
    /** 상세 페이지 도입 설명 */
    lead: string;
    /** 이 서비스로 문의할 때 미리 선택할 문의 유형 */
    inquiryType: InquiryProjectTypeValue;
    sections: ServiceSection[];
}

export const SERVICES: ServiceDefinition[] = [
    {
        key: 'website',
        label: '홈페이지 제작',
        shortLabel: '홈페이지 제작',
        ctaLabel: '홈페이지 제작 문의',
        summary:
            '회사와 브랜드, 제품과 서비스를 소개하는 홈페이지를 제작합니다. 기존 사이트 개편도 상담할 수 있습니다.',
        homeBlurb:
            '회사와 브랜드, 제품과 서비스를 소개하는 홈페이지를 제작합니다. 기존 사이트 개편도 상담할 수 있습니다.',
        path: '/services/website',
        heading: '회사와 브랜드를 소개하는 홈페이지 제작',
        lead: '방문자가 회사와 서비스를 이해하고 문의 방법을 찾을 수 있도록 페이지를 구성해 제작합니다.',
        inquiryType: 'WEB',
        sections: [
            {
                heading: '이런 홈페이지를 제작합니다',
                items: [
                    '회사와 서비스를 소개하는 홈페이지',
                    '브랜드와 제품을 알리는 사이트',
                    '쓰기 불편해진 기존 홈페이지 개편',
                ],
            },
            {
                // 앞 문장은 아래 네 항목을 그대로 요약한 것이라 두지 않는다.
                heading: '제작할 때 함께 살펴볼 내용',
                items: [
                    '페이지 구성과 각 페이지에서 전달할 내용',
                    '문의를 받는 화면과 접수되는 경로',
                    '오픈 후 직접 수정할 항목',
                    '휴대폰과 태블릿에서의 화면',
                ],
            },
            {
                heading: '상담 전에 알려주시면 좋은 내용',
                lead: '모두 미리 준비하지 않아도 됩니다. 편한 것부터 알려주세요.',
                items: ['사이트를 만드려는 목적', '참고하고 싶은 사이트', '희망하는 오픈 시점'],
            },
        ],
    },
    {
        key: 'commerce',
        label: '쇼핑몰 제작',
        shortLabel: '쇼핑몰 제작',
        ctaLabel: '쇼핑몰 제작 문의',
        summary: '상품 소개부터 장바구니와 주문까지, 브랜드에 맞는 쇼핑몰을 제작합니다.',
        homeBlurb: '상품 소개부터 장바구니와 주문까지, 브랜드에 맞는 쇼핑몰을 제작합니다.',
        path: '/services/commerce',
        heading: '판매와 운영 흐름을 고려한 쇼핑몰 제작',
        lead: '상품 소개부터 장바구니와 주문까지, 브랜드에 맞는 쇼핑몰을 제작합니다.',
        inquiryType: 'COMMERCE',
        sections: [
            {
                heading: '구매 화면',
                lead: '구매하는 사람이 거치는 흐름을 순서대로 구성합니다.',
                items: [
                    '상품을 찾아보는 목록과 카테고리',
                    '상품 정보와 이미지를 담은 상세 화면',
                    '장바구니와 주문서 작성',
                    '주문 완료와 주문 확인',
                ],
            },
            {
                heading: '운영 기능',
                lead: '상품과 주문을 관리하는 담당자가 쓰는 화면입니다.',
                items: [
                    '상품 등록과 가격·재고 관리',
                    '주문 확인과 처리 상태 관리',
                    '회원과 비회원 주문 확인',
                    '공지와 게시판 운영',
                ],
            },
            {
                heading: '결제·배송 연동',
                note: '사용할 결제 수단과 배송 방식에 맞춰 연동 범위를 안내합니다.',
            },
            {
                heading: '쇼핑몰 데모 화면',
                lead: '이십피트가 직접 만든 쇼핑몰 화면을 먼저 살펴보세요.',
                evidence: 'demos',
            },
        ],
    },
    {
        key: 'web-development',
        label: '맞춤형 웹프로그램 개발',
        shortLabel: '웹프로그램 개발',
        ctaLabel: '웹프로그램 개발 문의',
        summary: '고객·계약·예약·작업 일정 등 업무에 필요한 정보를 웹에서 관리하도록 개발합니다.',
        homeBlurb: '고객·계약·예약·작업 일정 등 업무에 필요한 정보를 웹에서 관리하도록 개발합니다.',
        path: '/services/web-development',
        heading: '업무에 맞춰 설계하는 웹프로그램 개발',
        lead: '고객·계약·예약·작업 일정처럼 업무에 필요한 정보를 웹에서 관리하도록 개발합니다.',
        inquiryType: 'INTERNAL_SYSTEM',
        sections: [
            {
                heading: '이런 업무를 웹에서 관리할 수 있습니다',
                items: [
                    '고객과 계약 정보 관리',
                    '예약과 작업 일정 관리',
                    '관리자와 담당자별 업무 화면',
                    '회원과 고객이 사용하는 서비스 기능',
                    '이미 쓰고 있는 시스템의 기능 개선',
                ],
            },
            {
                heading: '설계할 때 확인하는 것',
                lead: '기능 목록보다 먼저 업무가 실제로 어떻게 돌아가는지 봅니다.',
                items: [
                    '누가 어떤 역할로 사용하는지',
                    '무엇을 입력하고 무엇을 조회하는지',
                    '업무가 어떤 순서로 진행되는지',
                    '외부 시스템과 연결이 필요한 부분이 있는지',
                ],
            },
            {
                heading: '진행한 사례',
                lead: '실제로 만든 업무 시스템입니다.',
                evidence: 'cases',
            },
            {
                heading: '첫 상담에서',
                note: '정리된 요구사항이나 명세서가 없어도 됩니다. 지금 업무가 어떻게 진행되는지 알려주시면, 필요한 기능을 검토한 뒤 구현 방법과 견적을 안내합니다.',
            },
        ],
    },
];

export function getService(key: ServiceKey): ServiceDefinition {
    const found = SERVICES.find((service) => service.key === key);
    if (!found) {
        throw new Error(`Unknown service key: ${key}`);
    }
    return found;
}
