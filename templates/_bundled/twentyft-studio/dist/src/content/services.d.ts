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
export type InquiryProjectTypeValue = 'WEB' | 'COMMERCE' | 'INTERNAL_SYSTEM' | 'SYSTEM_IMPROVEMENT' | 'OTHER';
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
export declare const SERVICES: ServiceDefinition[];
export declare function getService(key: ServiceKey): ServiceDefinition;
