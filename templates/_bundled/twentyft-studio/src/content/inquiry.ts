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

export const INQUIRY_ENDPOINT = '/api/modules/twentyft-content/inquiries';

/** InquiryStoreRequest의 project_type 허용값. */
export type InquiryProjectType =
    | 'WEB'
    | 'COMMERCE'
    | 'WEB_SERVICE'
    | 'GNUBOARD7'
    | 'SYSTEM_IMPROVEMENT'
    | 'INTERNAL_SYSTEM'
    | 'OTHER';

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
export const INQUIRY_TYPE_OPTIONS: InquiryTypeOption[] = [
    { value: 'WEB', label: '홈페이지 제작' },
    { value: 'COMMERCE', label: '쇼핑몰 제작' },
    { value: 'INTERNAL_SYSTEM', label: '맞춤형 웹프로그램 개발' },
    { value: 'SYSTEM_IMPROVEMENT', label: '기존 사이트·시스템 개선' },
    { value: 'OTHER', label: '아직 정하지 못했습니다' },
];

export const INQUIRY_TYPE_VALUES: InquiryProjectType[] = INQUIRY_TYPE_OPTIONS.map(
    (option) => option.value,
);

/** 서버 InquiryStoreRequest와 동일한 길이 제한. */
export const INQUIRY_LIMITS = {
    name: 100,
    email: 255,
    currentSiteUrl: 500,
    desiredSchedule: 200,
    description: 5000,
} as const;

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

export const EMPTY_INQUIRY_FORM: InquiryFormValues = {
    name: '',
    email: '',
    projectType: '',
    currentSiteUrl: '',
    desiredSchedule: '',
    description: '',
    privacyConsent: false,
    website: '',
};

export type InquiryFieldErrors = Partial<Record<keyof InquiryFormValues, string>>;

/**
 * 클라이언트 1차 검증. 서버(InquiryStoreRequest)가 다시 검증하므로
 * 여기서는 왕복 없이 바로 알려줄 수 있는 것만 확인한다.
 */
export function validateInquiryForm(values: InquiryFormValues): InquiryFieldErrors {
    const errors: InquiryFieldErrors = {};

    const name = values.name.trim();
    if (!name) {
        errors.name = '이름 또는 회사명을 입력해주세요.';
    } else if (name.length > INQUIRY_LIMITS.name) {
        errors.name = `이름 또는 회사명은 ${INQUIRY_LIMITS.name}자 이내로 입력해주세요.`;
    }

    const email = values.email.trim();
    if (!email) {
        errors.email = '회신받을 이메일을 입력해주세요.';
    } else if (email.length > INQUIRY_LIMITS.email) {
        errors.email = `이메일은 ${INQUIRY_LIMITS.email}자 이내로 입력해주세요.`;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = '이메일 형식을 확인해주세요.';
    }

    if (!values.projectType) {
        errors.projectType = '문의 유형을 선택해주세요.';
    }

    const description = values.description.trim();
    if (!description) {
        errors.description = '문의 내용을 입력해주세요.';
    } else if (description.length > INQUIRY_LIMITS.description) {
        errors.description = `문의 내용은 ${INQUIRY_LIMITS.description}자 이내로 입력해주세요.`;
    }

    if (values.currentSiteUrl.trim().length > INQUIRY_LIMITS.currentSiteUrl) {
        errors.currentSiteUrl = `주소는 ${INQUIRY_LIMITS.currentSiteUrl}자 이내로 입력해주세요.`;
    }

    if (values.desiredSchedule.trim().length > INQUIRY_LIMITS.desiredSchedule) {
        errors.desiredSchedule = `희망 일정은 ${INQUIRY_LIMITS.desiredSchedule}자 이내로 입력해주세요.`;
    }

    if (!values.privacyConsent) {
        errors.privacyConsent = '개인정보 수집 및 이용에 동의해주세요.';
    }

    return errors;
}

/** 서버로 보낼 본문. 서버 계약의 snake_case 필드명을 그대로 쓴다. */
export function toInquiryPayload(values: InquiryFormValues): Record<string, unknown> {
    const payload: Record<string, unknown> = {
        name: values.name.trim(),
        email: values.email.trim(),
        project_type: values.projectType,
        description: values.description.trim(),
        privacy_consent: values.privacyConsent,
    };

    const optional: Array<[string, string]> = [
        ['current_site_url', values.currentSiteUrl.trim()],
        ['desired_schedule', values.desiredSchedule.trim()],
    ];
    for (const [key, value] of optional) {
        if (value) {
            payload[key] = value;
        }
    }

    // 허니팟: 값이 있을 때만 전송한다. 정상 사용자는 필드 자체가 비어 있으므로
    // 서버의 'prohibited' 규칙을 통과한다.
    if (values.website) {
        payload.website = values.website;
    }

    return payload;
}
