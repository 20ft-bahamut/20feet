/**
 * 문의 폼 계약.
 *
 * 서버 계약 출처:
 * - modules/twentyft-content/src/routes/api.php  (POST api/modules/twentyft-content/inquiries)
 * - modules/twentyft-content/src/Http/Requests/InquiryStoreRequest.php
 * - modules/twentyft-content/src/Enums/InquiryProjectType.php
 *
 * 필드 이름·enum 값은 위 서버 구현과 일치해야 한다. 여기서 임의로 바꾸지 않는다.
 */
export declare const INQUIRY_ENDPOINT = "/api/modules/twentyft-content/inquiries";
/** InquiryStoreRequest의 project_type 허용값. */
export type InquiryProjectType = 'WEB' | 'COMMERCE' | 'WEB_SERVICE' | 'GNUBOARD7' | 'SYSTEM_IMPROVEMENT' | 'INTERNAL_SYSTEM' | 'OTHER';
export interface InquiryTypeOption {
    value: InquiryProjectType;
    label: string;
}
/**
 * 화면에 노출하는 문의 유형.
 *
 * 화면 라벨은 고객이 쓰는 말로 두고, 저장되는 값은 서버 enum을 그대로 쓴다.
 * (예: '맞춤형 웹프로그램 개발' -> INTERNAL_SYSTEM)
 */
export declare const INQUIRY_TYPE_OPTIONS: InquiryTypeOption[];
export declare const INQUIRY_TYPE_VALUES: InquiryProjectType[];
/** 서버 InquiryStoreRequest와 동일한 길이 제한. */
export declare const INQUIRY_LIMITS: {
    readonly name: 100;
    readonly email: 255;
    readonly currentSiteUrl: 500;
    readonly desiredSchedule: 200;
    readonly description: 5000;
};
export interface InquiryFormValues {
    name: string;
    email: string;
    projectType: InquiryProjectType | '';
    currentSiteUrl: string;
    desiredSchedule: string;
    description: string;
    privacyConsent: boolean;
    /** 허니팟. 정상 사용자는 비워 둔다. 값이 있으면 서버가 봇으로 판단한다. */
    website: string;
}
export declare const EMPTY_INQUIRY_FORM: InquiryFormValues;
export type InquiryFieldErrors = Partial<Record<keyof InquiryFormValues, string>>;
/**
 * 클라이언트 1차 검증. 서버(InquiryStoreRequest)가 다시 검증하므로
 * 여기서는 왕복 없이 바로 알려줄 수 있는 것만 확인한다.
 */
export declare function validateInquiryForm(values: InquiryFormValues): InquiryFieldErrors;
/** 서버로 보낼 본문. 서버 계약의 snake_case 필드명을 그대로 쓴다. */
export declare function toInquiryPayload(values: InquiryFormValues): Record<string, unknown>;
