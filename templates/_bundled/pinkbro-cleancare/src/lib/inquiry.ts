/**
 * 문의 폼 계약.
 *
 * 서버 계약 출처:
 * - modules/_bundled/pinkbro-contents/src/routes/api.php
 *   (POST api/modules/pinkbro-contents/inquiry)
 * - modules/_bundled/pinkbro-contents/src/Http/Requests/InquiryStoreRequest.php
 *
 * 필드 이름·길이 제한은 위 서버 구현과 일치해야 한다. 여기서 임의로 바꾸지 않는다.
 * BUSINESS_TYPES / SERVICE_CHOICES 는 소스 원문
 * (_workspace/pinkbro/source/body.html 의 업종 select 6종 · 필요서비스 체크 8종)을
 * 그대로 쓴다 — 브랜드 카피가 아니라 폼 선택지 값이다.
 */

import type { InquiryPayload } from './types';

export const INQUIRY_ENDPOINT = '/api/modules/pinkbro-contents/inquiry';

/** 소스 body.html 업종 select 6종 원문. */
export const BUSINESS_TYPES: string[] = [
    '카페',
    '음식점',
    '베이커리',
    '주점 · 바',
    '프랜차이즈',
    '기타 상업공간',
];

/** 소스 body.html 필요 서비스 체크 8종 원문. */
export const SERVICE_CHOICES: string[] = [
    '바닥 기계세척',
    '유리창 세척',
    '접이식 어닝 세척',
    '간판 세척',
    '상업용 후드 세척',
    '에어컨 분해세척',
    '주방(방문견적)',
    '기타 F&B·상업공간 관리',
];

/** 서버 InquiryStoreRequest 와 동일한 길이 제한. */
export const INQUIRY_LIMITS = {
    businessType: 50,
    serviceEach: 50,
    storeSize: 200,
    contact: 50,
    message: 5000,
} as const;

/** 폼 상태는 서버 payload 와 같은 snake_case 모양을 그대로 쓴다. */
export type InquiryFormValues = InquiryPayload;

export const EMPTY_INQUIRY_FORM: InquiryFormValues = {
    business_type: '',
    services: [],
    store_size: '',
    contact: '',
    message: '',
    privacy_consent: false,
    website: '',
};

export type InquiryFieldErrors = Partial<Record<keyof InquiryFormValues, string>>;

/**
 * 클라이언트 1차 검증. 서버(InquiryStoreRequest)가 다시 검증하므로
 * 여기서는 왕복 없이 바로 알려줄 수 있는 것만 확인한다.
 * 반환 키는 폼 필드와 같은 snake_case 다 — testid `error-{field}` 에 그대로 쓴다.
 */
export function validateInquiry(values: InquiryFormValues): InquiryFieldErrors {
    const errors: InquiryFieldErrors = {};

    const businessType = values.business_type.trim();
    if (!businessType) {
        errors.business_type = '업종을 선택해주세요.';
    } else if (businessType.length > INQUIRY_LIMITS.businessType) {
        errors.business_type = `업종은 ${INQUIRY_LIMITS.businessType}자 이내로 선택·입력해주세요.`;
    }

    if (values.services.length === 0) {
        errors.services = '필요한 서비스를 1개 이상 선택해주세요.';
    } else if (values.services.some((service) => service.length > INQUIRY_LIMITS.serviceEach)) {
        errors.services = `서비스 항목은 ${INQUIRY_LIMITS.serviceEach}자 이내여야 합니다.`;
    }

    const contact = values.contact.trim();
    if (!contact) {
        errors.contact = '상담 연락처를 입력해주세요.';
    } else if (contact.length > INQUIRY_LIMITS.contact) {
        errors.contact = `연락처는 ${INQUIRY_LIMITS.contact}자 이내로 입력해주세요.`;
    }

    if (values.store_size.trim().length > INQUIRY_LIMITS.storeSize) {
        errors.store_size = `규모는 ${INQUIRY_LIMITS.storeSize}자 이내로 입력해주세요.`;
    }

    if (values.message.trim().length > INQUIRY_LIMITS.message) {
        errors.message = `문의 내용은 ${INQUIRY_LIMITS.message}자 이내로 입력해주세요.`;
    }

    if (!values.privacy_consent) {
        errors.privacy_consent = '개인정보 수집 및 이용에 동의해주세요.';
    }

    return errors;
}

/** 서버로 보낼 본문. 서버 계약의 snake_case 필드명을 그대로 쓴다. */
export function toInquiryPayload(
    values: InquiryFormValues
): Omit<InquiryPayload, 'website'> & { website?: string } {
    const payload: Omit<InquiryPayload, 'website'> & { website?: string } = {
        business_type: values.business_type.trim(),
        services: values.services.map((service) => service.trim()),
        store_size: values.store_size.trim(),
        contact: values.contact.trim(),
        message: values.message.trim(),
        privacy_consent: values.privacy_consent,
    };

    // 허니팟: 값이 있을 때만 전송한다. 정상 사용자는 필드 자체가 비어 있으므로
    // 서버의 'prohibited' 규칙을 통과한다.
    if (values.website) {
        payload.website = values.website;
    }

    return payload;
}

/**
 * 서버 422 body.errors 의 snake_case 필드를 폼 필드 키로 되돌린다.
 * 현재 서버·폼 필드명이 일치하므로 동일 매핑이지만, 서버 필드명이 바뀌면 여기서만 고친다.
 * 'website'(허니팟) 는 일부러 매핑하지 않는다 — 봇 제출은 필드 오류 대신 공통 안내로 처리한다.
 */
export const SERVER_FIELD_MAP: Record<string, keyof InquiryFormValues> = {
    business_type: 'business_type',
    services: 'services',
    store_size: 'store_size',
    contact: 'contact',
    message: 'message',
    privacy_consent: 'privacy_consent',
};