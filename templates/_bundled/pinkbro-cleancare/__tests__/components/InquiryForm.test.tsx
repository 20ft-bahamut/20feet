/**
 * InquiryForm — 계약 테스트.
 *
 * 규격: 템플릿 자체 vitest (happy-dom + ./src/test-setup.ts).
 * 코어 테스트 유틸을 쓰지 않는다. 브랜드 문구를 만들지 않고 더미 문자열을 쓴다.
 * 폼 선택지(BUSINESS_TYPES / SERVICE_CHOICES)는 소스 원문 고정 값이라 원문 그대로 단언한다.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import InquiryForm from '../../src/components/InquiryForm';
import {
    BUSINESS_TYPES,
    EMPTY_INQUIRY_FORM,
    SERVER_FIELD_MAP,
    SERVICE_CHOICES,
    toInquiryPayload,
    validateInquiry,
} from '../../src/lib/inquiry';
import type { ServiceItem, SiteData } from '../../src/lib/types';

const site: SiteData = {
    brand_name: 'b',
    brand_name_en: 'b',
    tagline: 't',
    eyebrow: 'e',
    phone: '010-0000-0000',
    kakao_channel: 'https://pf.kakao.com/_dummy',
    region: 'r',
    og_image_slot: null,
};

const services: ServiceItem[] = [
    {
        slug: 'floor',
        title: 's1',
        tag: 'Floor',
        summary: 'sum',
        criteria: 'crit',
        base_price: '10,000',
        extra_note: 'note',
        photo: { url: null, alt: null },
    },
];

function jsonResponse(status: number, body: unknown): Response {
    return {
        status,
        ok: status >= 200 && status < 300,
        json: async () => body,
    } as unknown as Response;
}

function fillValidForm(): void {
    fireEvent.change(screen.getByTestId('inquiry-select-business-type'), {
        target: { value: '카페' },
    });
    fireEvent.click(screen.getByTestId('inquiry-service-0'));
    fireEvent.change(screen.getByTestId('inquiry-input-contact'), {
        target: { value: '010-0000-0000' },
    });
    fireEvent.click(screen.getByTestId('inquiry-input-privacy'));
}

function submitForm(): void {
    fireEvent.submit(screen.getByTestId('inquiry-form'));
}

describe('InquiryForm', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('renders a skeleton when site data is not loaded', () => {
        render(<InquiryForm site={null} services={services} media={null} intro="i" sub={null} checklist={null} panelHeading={null} panelSub={null} panelNote={null} />);
        expect(screen.getByTestId('inquiry-skeleton')).toBeInTheDocument();
        expect(screen.queryByTestId('inquiry-form')).not.toBeInTheDocument();
    });

    it('renders a skeleton while the service list is still loading', () => {
        render(<InquiryForm site={site} services={null} media={null} intro="i" sub={null} checklist={null} panelHeading={null} panelSub={null} panelNote={null} />);
        expect(screen.getByTestId('inquiry-skeleton')).toBeInTheDocument();
    });

    it('renders the form with the business type options from the source list', () => {
        render(<InquiryForm site={site} services={services} media={null} intro="i" sub={null} checklist={null} panelHeading={null} panelSub={null} panelNote={null} />);

        expect(screen.getByLabelText('업종')).toBeInTheDocument();
        for (const value of BUSINESS_TYPES) {
            expect(screen.getByRole('option', { name: value })).toBeInTheDocument();
        }
        expect(screen.getByTestId('inquiry-select-business-type')).toBeInTheDocument();
    });

    it('renders the eight service choices from the source list', () => {
        render(<InquiryForm site={site} services={services} media={null} intro="i" sub={null} checklist={null} panelHeading={null} panelSub={null} panelNote={null} />);

        for (const choice of SERVICE_CHOICES) {
            expect(screen.getByLabelText(choice)).toBeInTheDocument();
        }
    });

    it('blocks submit and shows field errors when required values are missing', async () => {
        render(<InquiryForm site={site} services={services} media={null} intro="i" sub={null} checklist={null} panelHeading={null} panelSub={null} panelNote={null} />);
        fireEvent.click(screen.getByTestId('inquiry-submit-button'));

        await waitFor(() =>
            expect(screen.getByTestId('error-business_type')).toBeInTheDocument()
        );
        expect(screen.getByTestId('error-services')).toBeInTheDocument();
        expect(screen.getByTestId('error-contact')).toBeInTheDocument();
        expect(screen.getByTestId('error-privacy_consent')).toBeInTheDocument();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('posts to the pinkbro-contents inquiry endpoint with snake_case fields on success', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse(201, { data: { inquiry_id: 'abc' } })
        );
        render(<InquiryForm site={site} services={services} media={null} intro="i" sub={null} checklist={null} panelHeading={null} panelSub={null} panelNote={null} />);
        fillValidForm();
        submitForm();

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toBe('/api/modules/pinkbro-contents/inquiry');
        expect(init.method).toBe('POST');

        const body = JSON.parse(String(init.body));
        expect(body.business_type).toBe('카페');
        expect(body.services).toEqual([SERVICE_CHOICES[0]]);
        expect(body.contact).toBe('010-0000-0000');
        expect(body.privacy_consent).toBe(true);
        // 정상 제출에는 허니팟을 보내지 않는다 — 서버가 'prohibited' 로 막는다.
        expect(body).not.toHaveProperty('website');

        await waitFor(() =>
            expect(screen.getByTestId('inquiry-success')).toBeInTheDocument()
        );
        expect(screen.queryByTestId('inquiry-form')).not.toBeInTheDocument();
    });

    it('maps 422 server errors onto the matching fields', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse(422, {
                message: 'The given data was invalid.',
                errors: { business_type: ['필수'] },
            })
        );
        render(<InquiryForm site={site} services={services} media={null} intro="i" sub={null} checklist={null} panelHeading={null} panelSub={null} panelNote={null} />);
        fillValidForm();
        submitForm();

        await waitFor(() =>
            expect(screen.getByTestId('error-business_type')).toBeInTheDocument()
        );
        expect(screen.getByTestId('error-business_type')).toHaveTextContent('필수');
        expect(screen.queryByTestId('inquiry-success')).not.toBeInTheDocument();
    });

    it('shows a friendly message on 429 and keeps the form alive', async () => {
        fetchMock.mockResolvedValue(jsonResponse(429, { message: 'Too Many Attempts.' }));
        render(<InquiryForm site={site} services={services} media={null} intro="i" sub={null} checklist={null} panelHeading={null} panelSub={null} panelNote={null} />);
        fillValidForm();
        submitForm();

        await waitFor(() =>
            expect(screen.getByTestId('inquiry-error-summary')).toBeInTheDocument()
        );
        expect(screen.getByTestId('inquiry-form')).toBeInTheDocument();
    });

    it('does not submit twice while a request is in flight', async () => {
        let resolveFirst: ((value: Response) => void) | undefined;
        fetchMock.mockImplementation(
            () =>
                new Promise<Response>((resolve) => {
                    resolveFirst = resolve;
                })
        );

        render(<InquiryForm site={site} services={services} media={null} intro="i" sub={null} checklist={null} panelHeading={null} panelSub={null} panelNote={null} />);
        fillValidForm();

        submitForm();
        submitForm();

        expect(fetchMock).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveFirst?.(jsonResponse(201, { data: { inquiry_id: 'abc' } }));
        });
        await waitFor(() =>
            expect(screen.getByTestId('inquiry-success')).toBeInTheDocument()
        );
    });

    it('does not fire a second request when submits land in the same tick', async () => {
        let resolveFirst: ((value: Response) => void) | undefined;
        fetchMock.mockImplementation(
            () =>
                new Promise<Response>((resolve) => {
                    resolveFirst = resolve;
                })
        );

        render(<InquiryForm site={site} services={services} media={null} intro="i" sub={null} checklist={null} panelHeading={null} panelSub={null} panelNote={null} />);
        fillValidForm();

        const form = screen.getByTestId('inquiry-form');
        await act(async () => {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);

        resolveFirst?.(jsonResponse(201, { data: { inquiry_id: 'abc' } }));
        await waitFor(() =>
            expect(screen.getByTestId('inquiry-success')).toBeInTheDocument()
        );
    });

    it('keeps entered values after a network failure', async () => {
        fetchMock.mockRejectedValueOnce(new TypeError('network down'));
        render(<InquiryForm site={site} services={services} media={null} intro="i" sub={null} checklist={null} panelHeading={null} panelSub={null} panelNote={null} />);
        fillValidForm();
        fireEvent.change(screen.getByTestId('inquiry-textarea-message'), {
            target: { value: 'keep me' },
        });
        submitForm();

        await waitFor(() =>
            expect(screen.getByTestId('inquiry-error-summary')).toBeInTheDocument()
        );
        expect(screen.getByTestId('inquiry-input-contact')).toHaveValue('010-0000-0000');
        expect(screen.getByTestId('inquiry-textarea-message')).toHaveValue('keep me');
        expect(screen.getByTestId('inquiry-select-business-type')).toHaveValue('카페');

        // 재시도가 실제로 다시 전송한다.
        fetchMock.mockResolvedValueOnce(jsonResponse(201, { data: { inquiry_id: 'abc' } }));
        submitForm();
        await waitFor(() =>
            expect(screen.getByTestId('inquiry-success')).toBeInTheDocument()
        );
    });

    it('keeps the honeypot invisible and out of the tab order', () => {
        render(<InquiryForm site={site} services={services} media={null} intro="i" sub={null} checklist={null} panelHeading={null} panelSub={null} panelNote={null} />);

        const honeypot = screen.getByTestId('inquiry-input-website');
        expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
        expect(honeypot).toHaveAttribute('tabindex', '-1');
        expect(honeypot).toHaveAttribute('autocomplete', 'off');
        expect(honeypot.parentElement).toHaveStyle({ display: 'none' });
    });

    it('links the kakao channel and the phone number from site data', () => {
        render(<InquiryForm site={site} services={services} media={null} intro="i" sub={null} checklist={null} panelHeading={null} panelSub={null} panelNote={null} />);

        const kakao = screen.getByTestId('inquiry-kakao-link');
        expect(kakao).toHaveAttribute('href', 'https://pf.kakao.com/_dummy');
        expect(kakao).toHaveAttribute('target', '_blank');
        expect(kakao).toHaveAttribute('rel', 'noopener');

        const tel = screen.getByTestId('inquiry-tel-link');
        expect(tel).toHaveAttribute('href', 'tel:01000000000');
    });
});

describe('inquiry contract', () => {
    it('renders the (복수 선택 가능) hint as a span at the label size (원문 431행)', () => {
        const { container } = render(
            <InquiryForm site={site} services={services} media={null} intro="i" sub={null} checklist={null} panelHeading={null} panelSub={null} panelNote={null} />,
        );

        // 서비스 필드 라벨 — aria-labelledby 가 가리키는 요소
        const label = container.querySelector('#inquiry-services-label');
        expect(label, '#inquiry-services-label').not.toBeNull();

        const hint = label!.querySelector('span');
        expect(hint, '복수 선택 가능 span').not.toBeNull();
        expect(hint!.textContent).toBe('(복수 선택 가능)');
        // 원문은 <span> 이고 크기를 .field label(13px)에서 상속한다.
        // <small> 로 두면 UA 의 smaller(≈10.8px)가 적용되어 원문보다 작아진다.
        expect(hint!.tagName).toBe('SPAN');
        expect(label!.querySelector('small')).toBeNull();
        expect(label!.textContent).toBe('필요 서비스 (복수 선택 가능)');
    });

    it('keeps the field label and hint metrics in InquiryForm.css (원문 .field label / 인라인 span)', () => {
        const source = readFileSync(
            join(__dirname, '..', '..', 'src', 'styles', 'InquiryForm.css'),
            'utf8',
        );

        // 원문 styles.css 239행 .field label { font-size:13px; font-weight:800; color:var(--ink) }
        expect(source).toMatch(
            /\.pb-field-label\s*{\s*font-size:\s*13px;\s*font-weight:\s*800;\s*color:\s*var\(--pb-ink\);\s*}/,
        );
        // 힌트 span 은 색(#8b909b)과 굵기(600)만 갖고 크기는 상속한다 — font-size 선언이 없다
        expect(source).toMatch(/\.pb-field-label span\s*{[^}]*color:\s*#8b909b;[^}]*}/);
        expect(source).toMatch(/\.pb-field-label span\s*{[^}]*font-weight:\s*600;[^}]*}/);
        expect(source).not.toMatch(/\.pb-field-label span\s*{[^}]*font-size/s);
        expect(source).not.toMatch(/\.pb-field-label small/);
    });

    it('keeps the panel heading at the source weight (원문 .estimate-panel h3 — 선언 없음 → 700)', () => {
        const flat = readFileSync(
            join(__dirname, '..', '..', 'src', 'styles', 'InquiryForm.css'),
            'utf8',
        ).replace(/\s+/g, ' ');

        // 원문 styles.css 234행 .estimate-panel h3 은 font-weight 를 선언하지 않는다 — h3 기본 700.
        // (800 은 원문에 없는 값이었고, 패널 제목이 원문보다 굵게 보이던 원인이다.)
        expect(flat).toMatch(/\.pb-inquiry-panel-title { [^}]*font-weight: 700;/);
        expect(flat).not.toMatch(/\.pb-inquiry-panel-title { [^}]*font-weight: 800;/);
        // 원문에 있는 나머지 값은 그대로
        expect(flat).toMatch(
            /\.pb-inquiry-panel-title { [^}]*font-size: 28px; line-height: 1\.14; letter-spacing: -0\.045em;/,
        );

        // 원문 239행이 실제로 선언하는 800 은 .field label 에 남아 있어야 한다
        expect(flat).toMatch(/\.pb-field-label { font-size: 13px; font-weight: 800;/);
    });

    it('keeps the source choice strings verbatim', () => {
        expect(BUSINESS_TYPES).toEqual([
            '카페',
            '음식점',
            '베이커리',
            '주점 · 바',
            '프랜차이즈',
            '기타 상업공간',
        ]);
        expect(SERVICE_CHOICES).toEqual([
            '바닥 기계세척',
            '유리창 세척',
            '접이식 어닝 세척',
            '간판 세척',
            '상업용 후드 세척',
            '에어컨 분해세척',
            '주방(방문견적)',
            '기타 F&B·상업공간 관리',
        ]);
    });

    it('maps the server snake_case fields onto the form fields', () => {
        for (const key of [
            'business_type',
            'services',
            'store_size',
            'contact',
            'message',
            'privacy_consent',
        ]) {
            expect(SERVER_FIELD_MAP[key]).toBeDefined();
        }
        // 허니팟 website 는 필드로 되돌리지 않는다.
        expect(SERVER_FIELD_MAP.website).toBeUndefined();
    });

    it('requires business type, at least one service, contact and consent', () => {
        const errors = validateInquiry({ ...EMPTY_INQUIRY_FORM });
        expect(Object.keys(errors).sort()).toEqual([
            'business_type',
            'contact',
            'privacy_consent',
            'services',
        ]);
    });

    it('omits the honeypot from the payload unless a bot filled it in', () => {
        const clean = toInquiryPayload({ ...EMPTY_INQUIRY_FORM });
        expect(clean.website).toBeUndefined();

        const bot = toInquiryPayload({
            ...EMPTY_INQUIRY_FORM,
            website: 'http://spam.example',
        });
        expect(bot.website).toBe('http://spam.example');
    });

    it('renders the estimate copy from the copy domain (intro/sub/checklist/panel)', () => {
        render(
            <InquiryForm
                site={site}
                services={services}
                media={null}
                intro={'필요한 내용을 남겨주시면\n확인 후 안내드립니다.'}
                sub="홈페이지에서는 사진 없이 업종, 필요한 서비스, 연락처를 남겨주세요."
                checklist={[
                    '홈페이지 문의는 사진 없이 간단한 정보만 남기면 됩니다.',
                    '사진을 보내실 경우 휴대폰에서 카카오채널로 바로 보내주세요.',
                    '표기 금액은 기본가이며 확정 견적은 현장 조건 확인 후 안내드립니다.',
                ]}
                panelHeading="간편견적 문의하기"
                panelSub="업종, 필요한 서비스와 규모, 연락처, 요청사항을 남겨주세요."
                panelNote={'사진 첨부가 필요하신가요?\n휴대폰으로 촬영한 현장 사진은 카카오채널로 보내주시면 가장 빠르게 확인할 수 있습니다.'}
            />,
        );

        const heading = screen.getByTestId('inquiry-heading');
        expect(heading.tagName).toBe('H2');
        // 시더 값의 \n 은 <br> 요소로 렌더된다 — 날 newline 은 남지 않는다
        expect(heading.textContent).toBe('필요한 내용을 남겨주시면확인 후 안내드립니다.');
        expect(heading.querySelectorAll('br')).toHaveLength(1);

        expect(screen.getByTestId('inquiry-sub')).toHaveTextContent(
            '사진 없이 업종, 필요한 서비스, 연락처를 남겨주세요'
        );

        const checklist = screen.getByTestId('estimate-checklist');
        expect(checklist.children).toHaveLength(3);
        expect(checklist).toHaveTextContent('카카오채널로 바로 보내주세요');

        // 원문 구조: <div><span>01</span><div>텍스트</div></div>
        // CSS(.pb-checklist div 후손 셀렉터)가 내부 div 도 알약으로 꾸며서
        // 원본의 중첩 알약 렌더가 된다 — 이 DOM 계약이 무너지면 중첩 알약도 사라진다.
        const rows = within(checklist).queryAllByText(/홈페이지 문의는|사진을 보내실|표기 금액은/);
        expect(rows).toHaveLength(3);
        for (const row of Array.from(checklist.children)) {
            expect(row.tagName).toBe('DIV');
            expect(row.querySelector('span')).not.toBeNull();
            expect(row.querySelector('span')?.textContent).toMatch(/^\d{2}$/);
            expect(row.querySelector('div')).not.toBeNull();
            expect(row.querySelector('div')?.textContent?.length).toBeGreaterThan(0);
        }

        expect(screen.getByTestId('inquiry-panel-heading')).toHaveTextContent('간편견적 문의하기');
        expect(screen.getByTestId('inquiry-panel-sub')).toHaveTextContent(
            '규모, 연락처, 요청사항을 남겨주세요'
        );
        expect(screen.getByTestId('inquiry-panel-note')).toHaveTextContent(
            '사진 첨부가 필요하신가요?'
        );
    });

    it('renders the stored panel-note markup as <strong> and \\n as <br> — 리터럴 노출 금지 (원문 456행)', () => {
        render(
            <InquiryForm
                site={site}
                services={services}
                media={null}
                intro="i"
                sub={null}
                checklist={null}
                panelHeading={null}
                panelSub={null}
                panelNote={
                    '<strong>사진 첨부가 필요하신가요?</strong>\n휴대폰으로 촬영한 현장 사진은 카카오채널로 보내주시면 가장 빠르게 확인할 수 있습니다.'
                }
            />,
        );

        const note = screen.getByTestId('inquiry-panel-note');
        const strong = note.querySelector('strong');
        expect(strong?.textContent).toBe('사진 첨부가 필요하신가요?');
        // \n 은 원문 <br> 처럼 줄바꿈 요소로 렌더된다
        expect(note.querySelector('br')).not.toBeNull();
        // 태그 문자열이 화면 텍스트로 새어 나오지 않는다
        expect(note.textContent).not.toContain('<strong>');
    });

    it('omits every copy slot that is null instead of falling back to a literal', () => {
        render(
            <InquiryForm
                site={site}
                services={services}
                media={null}
                intro={null}
                sub={null}
                checklist={null}
                panelHeading={null}
                panelSub={null}
                panelNote={null}
            />,
        );

        expect(screen.queryByTestId('inquiry-heading')).not.toBeInTheDocument();
        expect(screen.queryByTestId('inquiry-sub')).not.toBeInTheDocument();
        expect(screen.queryByTestId('estimate-checklist')).not.toBeInTheDocument();
        expect(screen.queryByTestId('inquiry-panel-heading')).not.toBeInTheDocument();
        expect(screen.queryByTestId('inquiry-panel-sub')).not.toBeInTheDocument();
        expect(screen.queryByTestId('inquiry-panel-note')).not.toBeInTheDocument();
        // 폼 자체는 계속 렌더된다
        expect(screen.getByTestId('inquiry-form')).toBeInTheDocument();
    });

    it('renders the section background from the estimate_bg media slot when uploaded', () => {
        render(
            <InquiryForm
                site={site}
                services={services}
                media={{ estimate_bg: { url: '/uploads/estimate.webp', alt: '견적 배경' } }}
                intro={null}
                sub={null}
                checklist={null}
                panelHeading={null}
                panelSub={null}
                panelNote={null}
            />,
        );

        const img = screen.getByTestId('inquiry-bg');
        expect(img.tagName).toBe('IMG');
        expect(img).toHaveAttribute('src', '/uploads/estimate.webp');
        expect(screen.queryByTestId('inquiry-bg-fallback')).not.toBeInTheDocument();
    });

    it('renders the bundled placeholder photo when estimate_bg is empty or media is null', () => {
        // SLOT_PHOTO.estimate_bg — 원본 페이지의 견적 섹션 배경 사진
        const placeholder =
            '/api/templates/assets/pinkbro-cleancare?file=images/estimate-bg.webp';

        const { unmount } = render(
            <InquiryForm
                site={site}
                services={services}
                media={{ estimate_bg: { url: null, alt: null } }}
                intro={null}
                sub={null}
                checklist={null}
                panelHeading={null}
                panelSub={null}
                panelNote={null}
            />,
        );
        expect(screen.getByTestId('inquiry-bg')).toHaveAttribute('src', placeholder);
        expect(screen.queryByTestId('inquiry-bg-fallback')).not.toBeInTheDocument();
        unmount();

        render(
            <InquiryForm
                site={site}
                services={services}
                media={null}
                intro={null}
                sub={null}
                checklist={null}
                panelHeading={null}
                panelSub={null}
                panelNote={null}
            />,
        );
        expect(screen.getByTestId('inquiry-bg')).toHaveAttribute('src', placeholder);
        expect(screen.queryByTestId('inquiry-bg-fallback')).not.toBeInTheDocument();
    });

    it('renders no section anchor id — the layout owns anchor targets', () => {
        const { container } = render(
            <InquiryForm
                site={site}
                services={services}
                media={null}
                intro="i"
                sub={null}
                checklist={null}
                panelHeading={null}
                panelSub={null}
                panelNote={null}
            />,
        );
        expect(container.querySelector('#estimate')).toBeNull();
    });
});