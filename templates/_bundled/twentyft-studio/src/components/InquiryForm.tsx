import React from 'react';
import { Div, Form, H1, Input, Label, Option, P, Select, Span, Textarea } from './basic';
import Container from './Container';
import SectionEyebrow from './SectionEyebrow';
import PrimaryButton from './PrimaryButton';
import {
    EMPTY_INQUIRY_FORM,
    INQUIRY_ENDPOINT,
    INQUIRY_LIMITS,
    INQUIRY_TYPE_OPTIONS,
    INQUIRY_TYPE_VALUES,
    toInquiryPayload,
    validateInquiryForm,
    type InquiryFieldErrors,
    type InquiryFormValues,
    type InquiryProjectType,
} from '../content/inquiry';
import { PAGE_META } from '../content/seo';
import { usePageMeta } from '../hooks/usePageMeta';
import type { EditorAttrs } from '../types/template';

export interface InquiryFormProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

/** 서버 InquiryStoreRequest의 snake_case 필드를 폼 상태 키로 되돌린다. */
const SERVER_FIELD_MAP: Record<string, keyof InquiryFormValues> = {
    name: 'name',
    email: 'email',
    project_type: 'projectType',
    description: 'description',
    current_site_url: 'currentSiteUrl',
    desired_schedule: 'desiredSchedule',
    privacy_consent: 'privacyConsent',
};

/** URL의 ?type= 값이 허용된 문의 유형일 때만 미리 선택한다. */
function readPrefilledType(): InquiryProjectType | '' {
    if (typeof window === 'undefined') {
        return '';
    }
    const raw = new URLSearchParams(window.location.search).get('type');
    if (!raw) {
        return '';
    }
    return INQUIRY_TYPE_VALUES.includes(raw as InquiryProjectType) ? (raw as InquiryProjectType) : '';
}

export function InquiryForm({ className, editorAttrs }: InquiryFormProps): React.ReactElement {
    const [values, setValues] = React.useState<InquiryFormValues>(() => ({
        ...EMPTY_INQUIRY_FORM,
        projectType: readPrefilledType(),
    }));
    const [fieldErrors, setFieldErrors] = React.useState<InquiryFieldErrors>({});
    const [state, setState] = React.useState<SubmitState>('idle');
    const [formMessage, setFormMessage] = React.useState('');
    const abortRef = React.useRef<AbortController | null>(null);
    /**
     * 전송 중 여부를 state와 별도로 들고 있는다.
     *
     * state 갱신은 비동기라서, 같은 tick 안에서 연속으로 들어온 제출(빠른 연속 클릭,
     * 클릭과 Enter가 겹치는 경우)은 모두 옛 state를 읽어 그대로 통과한다.
     * 실제 브라우저에서 클릭 3회가 요청 3건이 되는 것을 확인해 ref로 막는다.
     */
    const inFlightRef = React.useRef(false);
    /** 오류가 나면 요약으로 초점을 옮겨 화면 낭독기와 키보드 사용자가 바로 인지하게 한다. */
    const summaryRef = React.useRef<HTMLDivElement>(null);

    usePageMeta(PAGE_META['/inquiry']);

    React.useEffect(() => {
        if (state === 'error') {
            summaryRef.current?.focus();
        }
    }, [state]);

    React.useEffect(() => {
        return () => {
            abortRef.current?.abort();
        };
    }, []);

    const update = <K extends keyof InquiryFormValues>(key: K, value: InquiryFormValues[K]): void => {
        setValues((prev) => ({ ...prev, [key]: value }));
        // 입력을 고치면 해당 필드의 이전 오류를 지운다.
        setFieldErrors((prev) => {
            if (!prev[key]) {
                return prev;
            }
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        if (inFlightRef.current) {
            return;
        }

        const clientErrors = validateInquiryForm(values);
        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setState('error');
            setFormMessage('입력한 내용을 다시 확인해주세요.');
            return;
        }

        inFlightRef.current = true;
        setState('submitting');
        setFieldErrors({});
        setFormMessage('');

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const response = await fetch(INQUIRY_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(toInquiryPayload(values)),
                signal: controller.signal,
            });

            if (response.status === 201) {
                setState('success');
                return;
            }

            if (response.status === 422) {
                const body = (await safeJson(response)) as {
                    message?: string;
                    errors?: Record<string, string[]>;
                };
                setFieldErrors(mapServerErrors(body.errors));
                setState('error');
                setFormMessage('입력한 내용을 다시 확인해주세요.');
                return;
            }

            setState('error');
            setFormMessage(messageForStatus(response.status));
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }
            setState('error');
            setFormMessage(
                '문의를 보내지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해주세요. 입력한 내용은 그대로 남아 있습니다.',
            );
        } finally {
            // 성공·실패 모두 잠금을 풀어야 재시도가 가능하다.
            // (성공 시에는 화면이 완료 상태로 바뀌므로 영향이 없다.)
            inFlightRef.current = false;
        }
    };

    if (state === 'success') {
        return (
            <Div
                className={className}
                {...editorAttrs}
                style={{
                    paddingBlock: 'var(--20ft-spacing-3xl, 5rem)',
                    backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
                }}
                data-testid="inquiry-form-page"
            >
                <Container>
                    <Div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--20ft-content-gap-md, 1.25rem)',
                            maxWidth: '640px',
                            padding: 'var(--20ft-spacing-xl, 2.5rem)',
                            borderRadius: 'var(--20ft-radius, 6px)',
                            border: '1px solid var(--20ft-indigo, #183B6B)',
                            backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
                        }}
                        role="status"
                        data-testid="inquiry-success"
                    >
                        <SectionEyebrow text="접수 완료" />
                        <H1
                            style={{
                                margin: 0,
                                fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                                fontWeight: 700,
                                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                                lineHeight: 1.3,
                                color: 'var(--20ft-deep-indigo, #102A4C)',
                                wordBreak: 'keep-all',
                            }}
                        >
                            문의가 접수되었습니다.
                        </H1>
                        <P
                            style={{
                                margin: 0,
                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                fontSize: '1rem',
                                lineHeight: 1.8,
                                color: 'var(--20ft-text-muted, #5E6063)',
                                wordBreak: 'keep-all',
                            }}
                        >
                            남겨주신 이메일로 회신드립니다. 내용을 확인한 뒤 연락드리겠습니다.
                        </P>
                    </Div>
                </Container>
            </Div>
        );
    }

    return (
        <Div
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-spacing-2xl, 4rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
            }}
            data-testid="inquiry-form-page"
        >
            <Container>
                <SectionEyebrow text="제작 문의" />
                <H1
                    style={{
                        margin: 0,
                        marginBottom: 'var(--20ft-spacing-md, 1rem)',
                        fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                        fontWeight: 700,
                        fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                        lineHeight: 1.25,
                        color: 'var(--20ft-deep-indigo, #102A4C)',
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word',
                    }}
                >
                    만들고 싶은 것과 현재 상황을 알려주세요.
                </H1>

                <P
                    style={{
                        margin: 0,
                        marginBottom: 'var(--20ft-spacing-xl, 2.5rem)',
                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                        fontSize: '1rem',
                        lineHeight: 1.8,
                        letterSpacing: '-0.01em',
                        color: 'var(--20ft-text-muted, #5E6063)',
                        maxWidth: '56ch',
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word',
                    }}
                >
                    홈페이지, 쇼핑몰, 웹프로그램 제작과 기존 사이트 개선을 상담할 수 있습니다.
                    아직 정리되지 않은 부분이 있어도 괜찮습니다.
                </P>

                <Form
                    data-testid="inquiry-form"
                    noValidate
                    onSubmit={handleSubmit}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-spacing-lg, 1.5rem)',
                        maxWidth: '640px',
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    {state === 'error' && formMessage && (
                        // ref 가 필요해 기본 래퍼 대신 원시 div 를 쓴다(다른 컴포넌트의 reveal 래퍼와 같은 방식).
                        <div
                            ref={summaryRef}
                            tabIndex={-1}
                            role="alert"
                            data-testid="inquiry-error-summary"
                            style={{
                                padding: 'var(--20ft-spacing-md, 1rem)',
                                borderRadius: 'var(--20ft-radius, 6px)',
                                border: '1px solid var(--20ft-signal-red, #E7482D)',
                                backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
                                color: 'var(--20ft-text-primary, #1A1A1A)',
                                fontFamily: 'var(--20ft-font-body, sans-serif)',
                                fontSize: '0.9375rem',
                                lineHeight: 1.7,
                            }}
                        >
                            {formMessage}
                        </div>
                    )}

                    <Field
                        id="inquiry-name"
                        label="이름 또는 회사명"
                        required
                        error={fieldErrors.name}
                        hint="회신드릴 때 확인할 이름입니다."
                    >
                        <Input
                            id="inquiry-name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            aria-required="true"
                            maxLength={INQUIRY_LIMITS.name}
                            value={values.name}
                            onChange={(e) => update('name', e.target.value)}
                            aria-invalid={fieldErrors.name ? true : undefined}
                            aria-describedby={errorId('inquiry-name', fieldErrors.name)}
                            style={inputStyle(Boolean(fieldErrors.name))}
                            data-testid="inquiry-input-name"
                        />
                    </Field>

                    <Field
                        id="inquiry-email"
                        label="회신받을 이메일"
                        required
                        error={fieldErrors.email}
                        hint="입력하신 주소로 회신드립니다."
                    >
                        <Input
                            id="inquiry-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            aria-required="true"
                            maxLength={INQUIRY_LIMITS.email}
                            value={values.email}
                            onChange={(e) => update('email', e.target.value)}
                            aria-invalid={fieldErrors.email ? true : undefined}
                            aria-describedby={errorId('inquiry-email', fieldErrors.email)}
                            style={inputStyle(Boolean(fieldErrors.email))}
                            data-testid="inquiry-input-email"
                        />
                    </Field>

                    <Field id="inquiry-type" label="문의 유형" required error={fieldErrors.projectType}>
                        <Select
                            id="inquiry-type"
                            name="project_type"
                            required
                            aria-required="true"
                            value={values.projectType}
                            onChange={(e) => update('projectType', e.target.value as InquiryProjectType)}
                            aria-invalid={fieldErrors.projectType ? true : undefined}
                            aria-describedby={errorId('inquiry-type', fieldErrors.projectType)}
                            style={inputStyle(Boolean(fieldErrors.projectType))}
                            data-testid="inquiry-select-type"
                        >
                            <Option value="">선택해주세요</Option>
                            {INQUIRY_TYPE_OPTIONS.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Field>

                    <Field
                        id="inquiry-description"
                        label="문의 내용"
                        required
                        error={fieldErrors.description}
                        hint="만들고 싶은 것, 지금 불편한 점, 참고 사이트 등을 편하게 적어주세요."
                    >
                        <Textarea
                            id="inquiry-description"
                            name="description"
                            required
                            aria-required="true"
                            rows={7}
                            maxLength={INQUIRY_LIMITS.description}
                            value={values.description}
                            onChange={(e) => update('description', e.target.value)}
                            aria-invalid={fieldErrors.description ? true : undefined}
                            aria-describedby={errorId('inquiry-description', fieldErrors.description)}
                            style={inputStyle(Boolean(fieldErrors.description))}
                            data-testid="inquiry-textarea-description"
                        />
                    </Field>

                    <Field
                        id="inquiry-current-site"
                        label="현재 사이트 주소"
                        error={fieldErrors.currentSiteUrl}
                        hint="운영 중인 사이트가 있으면 알려주세요. 없으면 비워두셔도 됩니다."
                        optional
                    >
                        <Input
                            id="inquiry-current-site"
                            name="current_site_url"
                            type="url"
                            inputMode="url"
                            maxLength={INQUIRY_LIMITS.currentSiteUrl}
                            placeholder="https://"
                            value={values.currentSiteUrl}
                            onChange={(e) => update('currentSiteUrl', e.target.value)}
                            aria-invalid={fieldErrors.currentSiteUrl ? true : undefined}
                            aria-describedby={errorId('inquiry-current-site', fieldErrors.currentSiteUrl)}
                            style={inputStyle(Boolean(fieldErrors.currentSiteUrl))}
                            data-testid="inquiry-input-current-site"
                        />
                    </Field>

                    <Field
                        id="inquiry-schedule"
                        label="희망 일정"
                        error={fieldErrors.desiredSchedule}
                        hint="정해지지 않았다면 비워두셔도 됩니다."
                        optional
                    >
                        <Input
                            id="inquiry-schedule"
                            name="desired_schedule"
                            type="text"
                            maxLength={INQUIRY_LIMITS.desiredSchedule}
                            placeholder="예: 올해 안에 오픈하고 싶습니다"
                            value={values.desiredSchedule}
                            onChange={(e) => update('desiredSchedule', e.target.value)}
                            aria-invalid={fieldErrors.desiredSchedule ? true : undefined}
                            aria-describedby={errorId('inquiry-schedule', fieldErrors.desiredSchedule)}
                            style={inputStyle(Boolean(fieldErrors.desiredSchedule))}
                            data-testid="inquiry-input-schedule"
                        />
                    </Field>

                    {/*
                      허니팟. 사람에게는 보이지 않고 키보드로도 닿지 않는다.
                      봇이 값을 채우면 서버의 'prohibited' 규칙에 걸린다.
                    */}
                    <Div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            width: '1px',
                            height: '1px',
                            overflow: 'hidden',
                            clip: 'rect(0 0 0 0)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <Label htmlFor="inquiry-website">Website</Label>
                        <Input
                            id="inquiry-website"
                            name="website"
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={values.website}
                            onChange={(e) => update('website', e.target.value)}
                            data-testid="inquiry-input-website"
                        />
                    </Div>

                    <Div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--20ft-spacing-2xs, 0.25rem)',
                        }}
                    >
                        <Div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 'var(--20ft-spacing-xs, 0.5rem)',
                            }}
                        >
                            <Input
                                id="inquiry-privacy"
                                name="privacy_consent"
                                type="checkbox"
                                required
                                aria-required="true"
                                checked={values.privacyConsent}
                                onChange={(e) => update('privacyConsent', e.target.checked)}
                                aria-invalid={fieldErrors.privacyConsent ? true : undefined}
                                aria-describedby={errorId('inquiry-privacy', fieldErrors.privacyConsent)}
                                style={{
                                    marginTop: '0.3rem',
                                    width: '1.125rem',
                                    height: '1.125rem',
                                    flexShrink: 0,
                                    accentColor: 'var(--20ft-indigo, #183B6B)',
                                }}
                                data-testid="inquiry-input-privacy"
                            />
                            <Label
                                htmlFor="inquiry-privacy"
                                style={{
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    fontSize: '0.9375rem',
                                    lineHeight: 1.7,
                                    color: 'var(--20ft-text-primary, #1A1A1A)',
                                    wordBreak: 'keep-all',
                                }}
                            >
                                문의 응대를 위해 이름·이메일·문의 내용을 수집하는 데 동의합니다.
                            </Label>
                        </Div>
                        {fieldErrors.privacyConsent && (
                            <Span
                                id={errorId('inquiry-privacy', fieldErrors.privacyConsent) ?? undefined}
                                role="alert"
                                style={errorTextStyle}
                            >
                                {fieldErrors.privacyConsent}
                            </Span>
                        )}

                        {/*
                          동의 문장만으로는 무엇을 수집하는지 알 수 없다.
                          실제 수집 항목과 목적을 펼쳐 볼 수 있게 둔다.
                          보유 기간·파기 방법은 운영 정책이 확정되지 않아 게시하지 않는다(보고서 참조).
                        */}
                        <details
                            style={{
                                marginTop: 'var(--20ft-spacing-2xs, 0.25rem)',
                                width: '100%',
                                minWidth: 0,
                            }}
                            data-testid="inquiry-privacy-detail"
                        >
                            <summary
                                style={{
                                    cursor: 'pointer',
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    lineHeight: 1.7,
                                    color: 'var(--20ft-indigo, #183B6B)',
                                }}
                            >
                                개인정보 수집·이용 안내
                            </summary>
                            <Div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--20ft-spacing-xs, 0.5rem)',
                                    marginTop: 'var(--20ft-spacing-xs, 0.5rem)',
                                    padding: 'var(--20ft-spacing-md, 1rem)',
                                    borderRadius: 'var(--20ft-radius, 6px)',
                                    backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.8,
                                    color: 'var(--20ft-text-primary, #1A1A1A)',
                                    wordBreak: 'keep-all',
                                    overflowWrap: 'break-word',
                                }}
                            >
                                <Span>
                                    <strong>수집하는 항목</strong> — 이름 또는 회사명, 회신받을 이메일,
                                    문의 내용. 현재 사이트 주소와 희망 일정은 입력한 경우에만 수집합니다.
                                </Span>
                                <Span>
                                    <strong>수집 목적</strong> — 문의 내용을 확인하고 회신하기 위해서입니다.
                                </Span>
                            </Div>
                        </details>
                    </Div>

                    <Div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: 'var(--20ft-spacing-md, 1rem)',
                            marginTop: 'var(--20ft-spacing-xs, 0.5rem)',
                        }}
                    >
                        <PrimaryButton
                            type="submit"
                            disabled={state === 'submitting'}
                            data-testid="inquiry-submit-button"
                        >
                            {state === 'submitting' ? '보내는 중…' : '제작 문의 보내기'}
                        </PrimaryButton>
                        {state === 'submitting' && (
                            <Span
                                role="status"
                                style={{
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    fontSize: '0.875rem',
                                    color: 'var(--20ft-text-muted, #5E6063)',
                                }}
                            >
                                전송 중입니다. 잠시만 기다려주세요.
                            </Span>
                        )}
                    </Div>
                </Form>
            </Container>
        </Div>
    );
}

const errorTextStyle: React.CSSProperties = {
    fontFamily: 'var(--20ft-font-body, sans-serif)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    lineHeight: 1.6,
    color: 'var(--20ft-signal-red, #E7482D)',
};

function inputStyle(hasError: boolean): React.CSSProperties {
    return {
        width: '100%',
        padding: '0.75rem',
        borderRadius: 'var(--20ft-radius-sm, 0.25rem)',
        // border 단축 속성 대신 개별 속성을 쓴다 — var()를 포함한 단축 표기는
        // 일부 CSS 파서에서 값이 잘못 해석될 수 있다.
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: hasError
            ? 'var(--20ft-signal-red, #E7482D)'
            : 'var(--20ft-border, rgba(16, 42, 76, 0.12))',
        backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
        color: 'var(--20ft-text-primary, #1A1A1A)',
        fontFamily: 'var(--20ft-font-body, sans-serif)',
        fontSize: '1rem',
    };
}

function errorId(fieldId: string, error?: string): string | undefined {
    return error ? `${fieldId}-error` : undefined;
}

function Field({
    id,
    label,
    required = false,
    optional = false,
    error,
    hint,
    children,
}: {
    id: string;
    label: string;
    required?: boolean;
    optional?: boolean;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}): React.ReactElement {
    return (
        <Div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--20ft-spacing-2xs, 0.25rem)',
                width: '100%',
                minWidth: 0,
            }}
        >
            <Label
                htmlFor={id}
                style={{
                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: 'var(--20ft-text-primary, #1A1A1A)',
                }}
            >
                {label}
                {required && (
                    <Span
                        style={{
                            marginLeft: '0.25rem',
                            color: 'var(--20ft-signal-red, #E7482D)',
                            fontSize: '0.8125rem',
                        }}
                    >
                        필수
                    </Span>
                )}
                {optional && (
                    <Span
                        style={{
                            marginLeft: '0.25rem',
                            color: 'var(--20ft-gray-500, #777A7D)',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                        }}
                    >
                        선택
                    </Span>
                )}
            </Label>

            {hint && (
                <Span
                    style={{
                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                        fontSize: '0.8125rem',
                        lineHeight: 1.6,
                        color: 'var(--20ft-text-muted, #5E6063)',
                        wordBreak: 'keep-all',
                    }}
                >
                    {hint}
                </Span>
            )}

            {children}

            {error && (
                <Span id={`${id}-error`} role="alert" style={errorTextStyle}>
                    {error}
                </Span>
            )}
        </Div>
    );
}

async function safeJson(response: Response): Promise<unknown> {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

function mapServerErrors(errors?: Record<string, string[]>): InquiryFieldErrors {
    const mapped: InquiryFieldErrors = {};
    if (!errors) {
        return mapped;
    }
    for (const [serverField, messages] of Object.entries(errors)) {
        const key = SERVER_FIELD_MAP[serverField];
        if (key && messages.length > 0) {
            mapped[key] = messages[0];
        }
    }
    return mapped;
}

function messageForStatus(status: number): string {
    if (status === 429) {
        return '짧은 시간에 여러 번 전송되었습니다. 잠시 후 다시 시도해주세요. 입력한 내용은 그대로 남아 있습니다.';
    }
    if (status === 503) {
        return '지금은 문의를 접수할 수 없습니다. 잠시 후 다시 시도해주세요. 입력한 내용은 그대로 남아 있습니다.';
    }
    return '문의를 접수하지 못했습니다. 잠시 후 다시 시도해주세요. 입력한 내용은 그대로 남아 있습니다.';
}

export default InquiryForm;
