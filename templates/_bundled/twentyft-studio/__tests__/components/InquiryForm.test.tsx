import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import InquiryForm from '../../src/components/InquiryForm';
import { INQUIRY_ENDPOINT, toInquiryPayload, validateInquiryForm, EMPTY_INQUIRY_FORM } from '../../src/content/inquiry';

function jsonResponse(status: number, body: unknown): Response {
    return {
        status,
        ok: status >= 200 && status < 300,
        json: async () => body,
    } as unknown as Response;
}

function fillValidForm(): void {
    fireEvent.change(screen.getByTestId('inquiry-input-name'), { target: { value: '홍길동' } });
    fireEvent.change(screen.getByTestId('inquiry-input-email'), { target: { value: 'hong@example.com' } });
    fireEvent.change(screen.getByTestId('inquiry-select-type'), { target: { value: 'WEB' } });
    fireEvent.change(screen.getByTestId('inquiry-textarea-description'), {
        target: { value: '회사 홈페이지를 새로 만들고 싶습니다.' },
    });
    fireEvent.click(screen.getByTestId('inquiry-input-privacy'));
}

function submit(): void {
    fireEvent.submit(screen.getByTestId('inquiry-form'));
}

describe('InquiryForm', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        window.history.replaceState({}, '', '/inquiry');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('renders an enabled form — the previous disabled preview is gone', () => {
        render(<InquiryForm />);

        expect(screen.getByTestId('inquiry-input-name')).not.toBeDisabled();
        expect(screen.getByTestId('inquiry-input-email')).not.toBeDisabled();
        expect(screen.getByTestId('inquiry-select-type')).not.toBeDisabled();
        expect(screen.getByTestId('inquiry-textarea-description')).not.toBeDisabled();
        expect(screen.getByTestId('inquiry-submit-button')).not.toBeDisabled();
        expect(screen.queryByTestId('coming-soon-notice')).not.toBeInTheDocument();
    });

    it('posts to the twentyft-content inquiries endpoint with the server field names', async () => {
        fetchMock.mockResolvedValue(jsonResponse(201, { message: '문의가 접수되었습니다.' }));
        render(<InquiryForm />);
        fillValidForm();
        submit();

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe(INQUIRY_ENDPOINT);
        expect(init.method).toBe('POST');

        const body = JSON.parse(init.body);
        expect(body).toEqual({
            name: '홍길동',
            email: 'hong@example.com',
            project_type: 'WEB',
            description: '회사 홈페이지를 새로 만들고 싶습니다.',
            privacy_consent: true,
        });
        // 정상 제출에는 허니팟을 보내지 않는다 — 서버가 'prohibited'로 막는다.
        expect(body).not.toHaveProperty('website');
    });

    it('shows the success state only after the server returns 201', async () => {
        fetchMock.mockResolvedValue(jsonResponse(201, { message: '문의가 접수되었습니다.' }));
        render(<InquiryForm />);
        fillValidForm();
        submit();

        await waitFor(() => expect(screen.getByTestId('inquiry-success')).toBeInTheDocument());
        expect(screen.getByTestId('inquiry-success')).toHaveTextContent('문의가 접수되었습니다.');
        expect(screen.queryByTestId('inquiry-form')).not.toBeInTheDocument();
    });

    it('does not claim success when the server fails', async () => {
        fetchMock.mockResolvedValue(jsonResponse(500, { message: 'server error' }));
        render(<InquiryForm />);
        fillValidForm();
        submit();

        await waitFor(() => expect(screen.getByTestId('inquiry-error-summary')).toBeInTheDocument());
        expect(screen.queryByTestId('inquiry-success')).not.toBeInTheDocument();
    });

    it('keeps the entered values after a failure so the visitor can retry', async () => {
        fetchMock.mockRejectedValueOnce(new TypeError('network down'));
        render(<InquiryForm />);
        fillValidForm();
        submit();

        await waitFor(() => expect(screen.getByTestId('inquiry-error-summary')).toBeInTheDocument());

        expect(screen.getByTestId('inquiry-input-name')).toHaveValue('홍길동');
        expect(screen.getByTestId('inquiry-textarea-description')).toHaveValue(
            '회사 홈페이지를 새로 만들고 싶습니다.'
        );
        expect(screen.getByTestId('inquiry-select-type')).toHaveValue('WEB');

        // 재시도가 실제로 다시 전송한다.
        fetchMock.mockResolvedValueOnce(jsonResponse(201, { message: '문의가 접수되었습니다.' }));
        submit();
        await waitFor(() => expect(screen.getByTestId('inquiry-success')).toBeInTheDocument());
    });

    it('maps 422 validation errors back onto the matching fields', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse(422, {
                message: 'The given data was invalid.',
                errors: {
                    email: ['이메일 형식이 올바르지 않습니다.'],
                    project_type: ['선택한 프로젝트 유형이 올바르지 않습니다.'],
                },
            })
        );
        render(<InquiryForm />);
        fillValidForm();
        submit();

        await waitFor(() => expect(screen.getByTestId('inquiry-input-email')).toHaveAttribute('aria-invalid', 'true'));
        expect(screen.getByText('이메일 형식이 올바르지 않습니다.')).toBeInTheDocument();
        expect(screen.getByText('선택한 프로젝트 유형이 올바르지 않습니다.')).toBeInTheDocument();
    });

    it('blocks submission and never calls fetch when client validation fails', async () => {
        render(<InquiryForm />);
        submit();

        await waitFor(() => expect(screen.getByTestId('inquiry-error-summary')).toBeInTheDocument());
        expect(fetchMock).not.toHaveBeenCalled();
        expect(screen.getByText('이름 또는 회사명을 입력해주세요.')).toBeInTheDocument();
        expect(screen.getByText('개인정보 수집 및 이용에 동의해주세요.')).toBeInTheDocument();
    });

    it('does not fire a second request while one is in flight', async () => {
        let resolveFirst: ((value: Response) => void) | undefined;
        fetchMock.mockImplementation(
            () =>
                new Promise<Response>((resolve) => {
                    resolveFirst = resolve;
                })
        );

        render(<InquiryForm />);
        fillValidForm();
        submit();
        submit();
        submit();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('inquiry-submit-button')).toBeDisabled();

        resolveFirst?.(jsonResponse(201, { message: 'ok' }));
        await waitFor(() => expect(screen.getByTestId('inquiry-success')).toBeInTheDocument());
    });

    it('does not fire a second request when submits land in the same tick', async () => {
        // state 갱신은 비동기라, 같은 tick에 들어온 연속 제출은 모두 옛 state를 읽는다.
        // 실제 브라우저에서 빠른 연속 클릭이 요청 3건을 만든 회귀를 고정한다.
        let resolveFirst: ((value: Response) => void) | undefined;
        fetchMock.mockImplementation(
            () =>
                new Promise<Response>((resolve) => {
                    resolveFirst = resolve;
                })
        );

        render(<InquiryForm />);
        fillValidForm();

        const form = screen.getByTestId('inquiry-form');
        await act(async () => {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);

        resolveFirst?.(jsonResponse(201, { message: 'ok' }));
        await waitFor(() => expect(screen.getByTestId('inquiry-success')).toBeInTheDocument());
    });

    it('explains a throttled request instead of failing silently', async () => {
        fetchMock.mockResolvedValue(jsonResponse(429, { message: 'Too Many Attempts.' }));
        render(<InquiryForm />);
        fillValidForm();
        submit();

        await waitFor(() =>
            expect(screen.getByTestId('inquiry-error-summary')).toHaveTextContent('짧은 시간에 여러 번 전송되었습니다')
        );
    });

    it('preselects the inquiry type from the query string and still allows changing it', () => {
        window.history.replaceState({}, '', '/inquiry?type=COMMERCE');
        render(<InquiryForm />);

        expect(screen.getByTestId('inquiry-select-type')).toHaveValue('COMMERCE');
        fireEvent.change(screen.getByTestId('inquiry-select-type'), { target: { value: 'WEB' } });
        expect(screen.getByTestId('inquiry-select-type')).toHaveValue('WEB');
    });

    it('ignores an unknown inquiry type in the query string', () => {
        window.history.replaceState({}, '', '/inquiry?type=NOT_A_TYPE');
        render(<InquiryForm />);

        expect(screen.getByTestId('inquiry-select-type')).toHaveValue('');
    });

    it('keeps the honeypot out of the tab order and out of the accessibility tree', () => {
        render(<InquiryForm />);

        const honeypot = screen.getByTestId('inquiry-input-website');
        expect(honeypot).toHaveAttribute('tabindex', '-1');
        expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
    });
});

describe('inquiry payload contract', () => {
    it('omits optional blank fields instead of sending empty strings', () => {
        const payload = toInquiryPayload({
            ...EMPTY_INQUIRY_FORM,
            name: '홍길동',
            email: 'hong@example.com',
            projectType: 'WEB',
            description: '문의합니다',
            privacyConsent: true,
        });

        expect(payload).not.toHaveProperty('current_site_url');
        expect(payload).not.toHaveProperty('desired_schedule');
    });

    it('sends the honeypot only when a bot filled it in', () => {
        const payload = toInquiryPayload({
            ...EMPTY_INQUIRY_FORM,
            name: '봇',
            email: 'bot@example.com',
            projectType: 'OTHER',
            description: 'spam',
            privacyConsent: true,
            website: 'http://spam.example',
        });

        expect(payload.website).toBe('http://spam.example');
    });

    it('rejects a malformed email and an over-long description', () => {
        const errors = validateInquiryForm({
            ...EMPTY_INQUIRY_FORM,
            name: '홍길동',
            email: 'not-an-email',
            projectType: 'WEB',
            description: 'x'.repeat(5001),
            privacyConsent: true,
        });

        expect(errors.email).toBeDefined();
        expect(errors.description).toBeDefined();
    });
});
