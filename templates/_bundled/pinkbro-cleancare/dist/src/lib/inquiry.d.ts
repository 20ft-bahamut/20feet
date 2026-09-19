import { InquiryPayload } from './types';
export declare const INQUIRY_ENDPOINT = "/api/modules/pinkbro-contents/inquiry";
/** 소스 body.html 업종 select 6종 원문. */
export declare const BUSINESS_TYPES: string[];
/** 소스 body.html 필요 서비스 체크 8종 원문. */
export declare const SERVICE_CHOICES: string[];
/** 서버 InquiryStoreRequest 와 동일한 길이 제한. */
export declare const INQUIRY_LIMITS: {
    readonly businessType: 50;
    readonly serviceEach: 50;
    readonly storeSize: 200;
    readonly contact: 50;
    readonly message: 5000;
};
/** 폼 상태는 서버 payload 와 같은 snake_case 모양을 그대로 쓴다. */
export type InquiryFormValues = InquiryPayload;
export declare const EMPTY_INQUIRY_FORM: InquiryFormValues;
export type InquiryFieldErrors = Partial<Record<keyof InquiryFormValues, string>>;
/**
 * 클라이언트 1차 검증. 서버(InquiryStoreRequest)가 다시 검증하므로
 * 여기서는 왕복 없이 바로 알려줄 수 있는 것만 확인한다.
 * 반환 키는 폼 필드와 같은 snake_case 다 — testid `error-{field}` 에 그대로 쓴다.
 */
export declare function validateInquiry(values: InquiryFormValues): InquiryFieldErrors;
/** 서버로 보낼 본문. 서버 계약의 snake_case 필드명을 그대로 쓴다. */
export declare function toInquiryPayload(values: InquiryFormValues): Omit<InquiryPayload, 'website'> & {
    website?: string;
};
/**
 * 서버 422 body.errors 의 snake_case 필드를 폼 필드 키로 되돌린다.
 * 현재 서버·폼 필드명이 일치하므로 동일 매핑이지만, 서버 필드명이 바뀌면 여기서만 고친다.
 * 'website'(허니팟) 는 일부러 매핑하지 않는다 — 봇 제출은 필드 오류 대신 공통 안내로 처리한다.
 */
export declare const SERVER_FIELD_MAP: Record<string, keyof InquiryFormValues>;
