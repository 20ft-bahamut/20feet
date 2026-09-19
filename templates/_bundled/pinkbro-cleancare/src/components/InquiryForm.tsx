import React from 'react';
import {
    A,
    Button,
    Div,
    H3,
    Input,
    Label,
    P,
    Select,
    Span,
    Textarea,
} from './basic';
import '../styles/InquiryForm.css';
import {
    BUSINESS_TYPES,
    EMPTY_INQUIRY_FORM,
    INQUIRY_ENDPOINT,
    INQUIRY_LIMITS,
    SERVER_FIELD_MAP,
    SERVICE_CHOICES,
    toInquiryPayload,
    validateInquiry,
    type InquiryFieldErrors,
    type InquiryFormValues,
} from '../lib/inquiry';
import type { ServiceItem, SiteData } from '../lib/types';

export interface InquiryFormProps {
    /** 사이트 기본 정보. null 이면 아직 로딩 중 — 스켈레톤. */
    site: SiteData | null;
    /** 서비스 목록. null 이면 아직 로딩 중 — 스켈레톤(스펙 5.4: null → 필드 숨김). */
    services: ServiceItem[] | null;
    /** 섹션 도입 문구(copy 도메인). null 이면 문구 없이 렌더한다. */
    intro: string | null;
    className?: string;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function InquiryForm({ site, services, intro, className }: InquiryFormProps): React.ReactElement {
    const [values, setValues] = React.useState<InquiryFormValues>(() => ({ ...EMPTY_INQUIRY_FORM }));
    const [fieldErrors, setFieldErrors] = React.useState<InquiryFieldErrors>({});
    const [state, setState] = React.useState<SubmitState>('idle');
    const [formMessage, setFormMessage] = React.useState('');
    const abortRef = React.useRef<AbortController | null>(null);
    /**
     * 전송 중 여부를 state 와 별도로 들고 있는다.
     *
     * state 갱신은 비동기라서, 같은 tick 안에서 연속으로 들어온 제출(빠른 연속 클릭)은
     * 모두 옛 state 를 읽어 그대로 통과한다. ref 로 막는다.
     */
    const inFlightRef = React.useRef(false);

    React.useEffect(() => {
        return () => {
            abortRef.current?.abort();
        };
    }, []);

    const updateField = <K extends keyof InquiryFormValues>(
        key: K,
        value: InquiryFormValues[K]
    ): void => {
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

    const toggleService = (choice: string): void => {
        setValues((prev) => ({
            ...prev,
            services: prev.services.includes(choice)
                ? prev.services.filter((service) => service !== choice)
                : [...prev.services, choice],
        }));
        setFieldErrors((prev) => {
            if (!prev.services) {
                return prev;
            }
            const next = { ...prev };
            delete next.services;
            return next;
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        if (inFlightRef.current) {
            return;
        }

        const clientErrors = validateInquiry(values);
        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setState('error');
            setFormMessage('입력한 내용을 다시 확인해 주세요.');
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
                setFormMessage('입력한 내용을 다시 확인해 주세요.');
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
                '문의를 보내지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요. 입력한 내용은 그대로 남아 있습니다.'
            );
        } finally {
            // 성공·실패 모두 잠금을 풀어야 재시도가 가능하다.
            inFlightRef.current = false;
        }
    };

    if (site === null || services === null) {
        return (
            <section className={className ? `pb-inquiry ${className}` : 'pb-inquiry'} data-testid="inquiry-skeleton">
                <div className="pb-inquiry-wrap">
                    <div className="pb-inquiry-shell">
                        <div className="pb-inquiry-skeleton" aria-hidden="true">
                            <div className="pb-inquiry-copy">
                                <div className="pb-skeleton-block pb-skeleton-block--title" />
                                <div className="pb-skeleton-block pb-skeleton-block--line" />
                                <div className="pb-skeleton-block pb-skeleton-block--line" />
                            </div>
                            <div className="pb-skeleton-block pb-skeleton-block--panel" />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (state === 'success') {
        return (
            <section className={className ? `pb-inquiry ${className}` : 'pb-inquiry'}>
                <div className="pb-inquiry-wrap">
                    <div
                        className="pb-inquiry-success"
                        role="status"
                        data-testid="inquiry-success"
                    >
                        <H3 className="pb-inquiry-success-title">문의가 접수되었습니다.</H3>
                        <P className="pb-inquiry-success-body">
                            접수 내용을 확인한 뒤 입력하신 연락처로 안내드립니다.
                        </P>
                    </div>
                </div>
            </section>
        );
    }

    const telHref = site.phone ? `tel:${site.phone.replace(/[^\d+]/g, '')}` : null;

    return (
        <section className={className ? `pb-inquiry ${className}` : 'pb-inquiry'} id="estimate">
            <div className="pb-inquiry-wrap">
                <div className="pb-inquiry-shell">
                    <div className="pb-inquiry-grid">
                        <div className="pb-inquiry-copy">
                            <Span className="pb-inquiry-eyebrow">Estimate</Span>
                            {intro && <P className="pb-inquiry-sub">{intro}</P>}
                            {site.kakao_channel && (
                                <A
                                    className="pb-btn pb-btn--kakao"
                                    href={site.kakao_channel}
                                    target="_blank"
                                    rel="noopener"
                                    data-testid="inquiry-kakao-link"
                                >
                                    사진으로 문의하기 · 카카오채널
                                </A>
                            )}
                        </div>

                        <div className="pb-inquiry-panel">
                            <H3 className="pb-inquiry-panel-title">간편견적 문의하기</H3>
                            <P className="pb-inquiry-panel-lead">
                                업종, 필요한 서비스와 규모, 연락처, 요청사항을 남겨주세요. 사진 첨부 없이
                                간단하게 접수할 수 있습니다.
                            </P>

                            <form
                                className="pb-inquiry-form"
                                data-testid="inquiry-form"
                                noValidate
                                onSubmit={handleSubmit}
                            >
                                <div className="pb-form-grid">
                                    <div className="pb-field">
                                        <Label className="pb-field-label" htmlFor="inquiry-business-type">
                                            업종
                                        </Label>
                                        <Select
                                            id="inquiry-business-type"
                                            name="business_type"
                                            required
                                            aria-required="true"
                                            value={values.business_type}
                                            onChange={(e) => updateField('business_type', e.target.value)}
                                            aria-invalid={fieldErrors.business_type ? true : undefined}
                                            data-testid="inquiry-select-business-type"
                                        >
                                            <option value="">선택해 주세요</option>
                                            {BUSINESS_TYPES.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </Select>
                                        <FieldError field="business_type" message={fieldErrors.business_type} />
                                    </div>

                                    <div className="pb-field">
                                        <Span className="pb-field-label" id="inquiry-services-label">
                                            필요 서비스 <small>(복수 선택 가능)</small>
                                        </Span>
                                        <div
                                            className="pb-service-check-grid"
                                            role="group"
                                            aria-labelledby="inquiry-services-label"
                                        >
                                            {SERVICE_CHOICES.map((choice, index) => (
                                                <Label key={choice} className="pb-check-tag">
                                                    <Input
                                                        type="checkbox"
                                                        name="services"
                                                        value={choice}
                                                        checked={values.services.includes(choice)}
                                                        onChange={() => toggleService(choice)}
                                                        aria-invalid={fieldErrors.services ? true : undefined}
                                                        data-testid={`inquiry-service-${index}`}
                                                    />
                                                    <span>{choice}</span>
                                                </Label>
                                            ))}
                                        </div>
                                        <FieldError field="services" message={fieldErrors.services} />
                                    </div>

                                    <div className="pb-field">
                                        <Label className="pb-field-label" htmlFor="inquiry-store-size">
                                            대략적인 평수 또는 규모
                                        </Label>
                                        <Input
                                            id="inquiry-store-size"
                                            name="store_size"
                                            type="text"
                                            maxLength={INQUIRY_LIMITS.storeSize}
                                            placeholder="예: 24평, 외부 유리 8m, 4WAY 2대"
                                            value={values.store_size}
                                            onChange={(e) => updateField('store_size', e.target.value)}
                                            aria-invalid={fieldErrors.store_size ? true : undefined}
                                            data-testid="inquiry-input-store-size"
                                        />
                                        <FieldError field="store_size" message={fieldErrors.store_size} />
                                    </div>

                                    <div className="pb-field">
                                        <Label className="pb-field-label" htmlFor="inquiry-contact">
                                            상담 연락처
                                        </Label>
                                        <Input
                                            id="inquiry-contact"
                                            name="contact"
                                            type="tel"
                                            required
                                            aria-required="true"
                                            maxLength={INQUIRY_LIMITS.contact}
                                            placeholder="010-0000-0000"
                                            value={values.contact}
                                            onChange={(e) => updateField('contact', e.target.value)}
                                            aria-invalid={fieldErrors.contact ? true : undefined}
                                            data-testid="inquiry-input-contact"
                                        />
                                        <FieldError field="contact" message={fieldErrors.contact} />
                                    </div>

                                    <div className="pb-field">
                                        <Label className="pb-field-label" htmlFor="inquiry-message">
                                            문의 내용
                                        </Label>
                                        <Textarea
                                            id="inquiry-message"
                                            name="message"
                                            maxLength={INQUIRY_LIMITS.message}
                                            placeholder="작업 희망일, 현재 상태, 추가 요청사항 등을 적어주세요."
                                            value={values.message}
                                            onChange={(e) => updateField('message', e.target.value)}
                                            aria-invalid={fieldErrors.message ? true : undefined}
                                            data-testid="inquiry-textarea-message"
                                        />
                                        <FieldError field="message" message={fieldErrors.message} />
                                    </div>

                                    <div className="pb-field">
                                        <Label className="pb-field-label" htmlFor="inquiry-privacy">
                                            <Input
                                                id="inquiry-privacy"
                                                name="privacy_consent"
                                                type="checkbox"
                                                required
                                                aria-required="true"
                                                checked={values.privacy_consent}
                                                onChange={(e) => updateField('privacy_consent', e.target.checked)}
                                                aria-invalid={fieldErrors.privacy_consent ? true : undefined}
                                                style={{ width: 18, height: 18, marginRight: 8, accentColor: 'var(--pb-pink)' }}
                                                data-testid="inquiry-input-privacy"
                                            />
                                            문의 응대를 위해 업종·필요 서비스·연락처와 문의 내용을 수집하는 데 동의합니다.
                                        </Label>
                                        <FieldError field="privacy_consent" message={fieldErrors.privacy_consent} />
                                    </div>

                                    {/*
                                      허니팟. 사람에게는 보이지 않고 키보드로도 닿지 않는다.
                                      봇(오토필)이 값을 채우면 서버의 'prohibited' 규칙이 422 로 막는다.
                                    */}
                                    <div aria-hidden="true" style={{ display: 'none' }}>
                                        <Label htmlFor="inquiry-website">Website</Label>
                                        <Input
                                            id="inquiry-website"
                                            name="website"
                                            type="text"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            value={values.website}
                                            onChange={(e) => updateField('website', e.target.value)}
                                            data-testid="inquiry-input-website"
                                        />
                                    </div>
                                </div>

                                {state === 'error' && formMessage && (
                                    <Div
                                        className="pb-form-error"
                                        role="alert"
                                        tabIndex={-1}
                                        data-testid="inquiry-error-summary"
                                    >
                                        {formMessage}
                                    </Div>
                                )}

                                <div className="pb-form-actions">
                                    <Button
                                        className="pb-btn pb-btn--dark"
                                        type="submit"
                                        disabled={state === 'submitting'}
                                        data-testid="inquiry-submit-button"
                                    >
                                        {state === 'submitting' ? '보내는 중…' : '홈페이지 문의 보내기'}
                                    </Button>
                                    {site.kakao_channel && (
                                        <A
                                            className="pb-btn pb-btn--kakao"
                                            href={site.kakao_channel}
                                            target="_blank"
                                            rel="noopener"
                                            data-testid="inquiry-kakao-panel-link"
                                        >
                                            사진 문의 · 카카오채널
                                        </A>
                                    )}
                                    {telHref && (
                                        <A
                                            className="pb-btn pb-btn--ghost"
                                            href={telHref}
                                            data-testid="inquiry-tel-link"
                                        >
                                            전화 상담하기
                                        </A>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FieldError({
    field,
    message,
}: {
    field: string;
    message?: string;
}): React.ReactElement | null {
    if (!message) {
        return null;
    }
    return (
        <Span className="pb-field-error" role="alert" data-testid={`error-${field}`}>
            {message}
        </Span>
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
        return '지금 문의가 몰려 접수가 지연되고 있습니다. 잠시 후 다시 시도해 주세요. 입력한 내용은 그대로 남아 있습니다.';
    }
    if (status === 503) {
        return '지금은 문의를 접수할 수 없습니다. 잠시 후 다시 시도해 주세요. 입력한 내용은 그대로 남아 있습니다.';
    }
    return '문의를 접수하지 못했습니다. 잠시 후 다시 시도해 주세요. 입력한 내용은 그대로 남아 있습니다.';
}

export default InquiryForm;