import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { StoreFooter } from '../../src/components/StoreFooter';
import {
    applyShopInfoOverride,
    businessFields,
    type BusinessField,
    type ShopInfoApiResponse,
} from '../../src/config/businessInfo';

/** Test fixture builder — mirrors businessFields() output shape. */
function makeField(overrides: Partial<BusinessField> & { label_key: string }): BusinessField {
    return {
        label: overrides.label_key,
        value: 'value',
        ...overrides,
    } as BusinessField;
}

/**
 * Build a stub fetch that responds once with the given /shop-info payload.
 * Returns both the fetch stub and a `lastUrl` recorder so tests can assert
 * the URL + headers actually sent.
 */
function makeShopInfoFetch(payload: ShopInfoApiResponse | null, opts: { ok?: boolean } = {}) {
    const ok = opts.ok ?? true;
    const lastUrl = { value: '' as string };
    const lastInit = { value: undefined as RequestInit | undefined };
    const fetchStub = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
        lastUrl.value = String(url);
        lastInit.value = init;
        if (!ok) {
            return new Response(JSON.stringify({ success: false }), { status: 503 });
        }
        return new Response(JSON.stringify({ success: true, data: payload }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    });
    return { fetchStub, lastUrl, lastInit };
}

/** Wait for the StoreFooter's async fetch to settle (state update flush). */
async function flushAsync() {
    // Two ticks: one for the awaited fetch, one for React's setState commit.
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

const FULL_FIELDS: BusinessField[] = [
    makeField({ label_key: 'shopName', label: '상점명', value: '예시 상점' }),
    makeField({ label_key: 'businessRegistrationNumber', label: '사업자등록번호', value: '123-45-67890' }),
    makeField({ label_key: 'businessAddress', label: '사업장 주소', value: '예시 주소 1-2-3' }),
    makeField({ label_key: 'customerServicePhone', label: '고객센터 전화', value: '000-0000-0000', href: 'tel:00000000000' }),
];

describe('StoreFooter — business info conditional rendering', () => {
    it('CASE 1: keeps the classic rows (sr-free brand, nav, policy links, copyright)', () => {
        render(<StoreFooter brandName="Still Form" />);
        expect(screen.getByTestId('store-footer')).toBeInTheDocument();
        expect(screen.getByText('Still Form')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Shop' })).toBeInTheDocument();
        expect(screen.getByText('© 2026 Still Form — demo store built on Gnuboard 7')).toBeInTheDocument();
        expect(screen.getByTestId('footer-policy-terms')).toBeInTheDocument();
        expect(screen.getByTestId('footer-policy-privacy')).toBeInTheDocument();
        expect(screen.getByTestId('footer-policy-shipping')).toBeInTheDocument();
    });

    it('CASE 1: renders the business info grid when fields are set', () => {
        render(
            <StoreFooter
                infoFields={FULL_FIELDS}
                demoNotice="데모 스토어입니다. 사업자 정보는 템플릿 config/business-info.json에서 설정할 수 있습니다."
            />
        );
        const info = screen.getByTestId('footer-business-info');
        expect(within(info).getAllByTestId('footer-business-field')).toHaveLength(4);
        expect(within(info).getByText('123-45-67890')).toBeInTheDocument();
        // leading-zero / dash preservation: value rendered verbatim, not reformatted
        expect(within(info).getByText('000-0000-0000')).toBeInTheDocument();
        // demo-store notice shows alongside business info too (seed values are demo)
        expect(screen.getByTestId('footer-demo-notice')).toBeInTheDocument();
    });

    it('CASE 1: phone and email fields render as real anchors (no div onClick)', () => {
        render(
            <StoreFooter
                infoFields={[
                    makeField({ label_key: 'customerServicePhone', label: '고객센터 전화', value: '000-0000-0000', href: 'tel:00000000000' }),
                    makeField({ label_key: 'customerServiceEmail', label: '고객센터 이메일', value: 'hello@example.test', href: 'mailto:hello@example.test' }),
                ]}
            />
        );
        const phone = screen.getByRole('link', { name: '000-0000-0000' });
        expect(phone).toHaveAttribute('href', 'tel:00000000000');
        const email = screen.getByRole('link', { name: 'hello@example.test' });
        expect(email).toHaveAttribute('href', 'mailto:hello@example.test');
    });

    it('CASE 2: skips an empty ecommerce registration number but keeps other rows', () => {
        const fields = [
            makeField({ label_key: 'shopName', label: '상점명', value: '예시 상점' }),
        ];
        render(<StoreFooter infoFields={fields} />);
        expect(screen.getByTestId('footer-business-info')).toBeInTheDocument();
        expect(screen.queryByText('통신판매업신고번호')).not.toBeInTheDocument();
        expect(screen.queryByTestId('footer-business-verification')).not.toBeInTheDocument();
    });

    it('CASE 3: renders the verification link with rel attributes only when a URL is set', () => {
        render(
            <StoreFooter
                infoFields={[
                    makeField({
                        label_key: 'businessVerification',
                        label: '사업자정보확인',
                        value: 'https://example.test/verify',
                        href: 'https://example.test/verify',
                        external: true,
                    }),
                ]}
            />
        );
        const link = screen.getByTestId('footer-business-verification');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('CASE 3 (inverse): no verification link when the URL is empty', () => {
        render(<StoreFooter infoFields={FULL_FIELDS} />);
        expect(screen.queryByTestId('footer-business-verification')).not.toBeInTheDocument();
    });

    it('CASE 4: all empty → info block absent, demo notice shown, footer intact', () => {
        render(
            <StoreFooter
                infoFields={[]}
                demoNotice="데모 스토어입니다. 사업자 정보는 템플릿 config/business-info.json에서 설정할 수 있습니다."
            />
        );
        expect(screen.queryByTestId('footer-business-info')).not.toBeInTheDocument();
        expect(screen.queryByTestId('footer-business-field')).not.toBeInTheDocument();
        expect(screen.queryByTestId('footer-business-verification')).not.toBeInTheDocument();
        expect(screen.getByTestId('footer-demo-notice')).toHaveTextContent(
            '데모 스토어입니다. 사업자 정보는 템플릿 config/business-info.json에서 설정할 수 있습니다.'
        );
        // footer still renders its normal rows
        expect(screen.getByTestId('store-footer')).toBeInTheDocument();
        expect(screen.getByTestId('footer-policy-privacy')).toBeInTheDocument();
    });

    it('CASE 4 (shipped config): footer renders seeded demo info and the demo notice', () => {
        render(
            <StoreFooter demoNotice="데모 스토어입니다. 사업자 정보는 템플릿 config/business-info.json에서 설정할 수 있습니다." />
        );
        // shipped business-info.json carries the user-approved demo seed
        expect(screen.getByTestId('footer-business-info')).toBeInTheDocument();
        expect(screen.getByTestId('footer-demo-notice')).toBeInTheDocument();
    });

    it('policy links are real anchors with template routes; 개인정보처리방침 matches the other sizes', () => {
        render(
            <StoreFooter
                termsLabel="이용약관"
                privacyLabel="개인정보처리방침"
                shippingLabel="배송·교환·반품 안내"
            />
        );
        const terms = screen.getByTestId('footer-policy-terms');
        const privacy = screen.getByTestId('footer-policy-privacy');
        const shipping = screen.getByTestId('footer-policy-shipping');
        expect(terms.closest('a')).toBe(terms);
        expect(privacy.getAttribute('href')).toBe('/shop/privacy');
        expect(shipping.getAttribute('href')).toBe('/shop/shipping-policy');
        expect(terms.getAttribute('href')).toBe('/shop/terms');
        expect(privacy.style.fontSize).toBe(terms.style.fontSize);
    });
});

describe('applyShopInfoOverride — admin /shop-info payload projection', () => {
    it('maps shop_name → shopName, ceo_name → representative, mail_order_number → ecommerceRegistrationNumber', () => {
        const out = applyShopInfoOverride({
            shop_name: 'QA 스틸폼',
            company_name: 'QA 상점',
            ceo_name: 'QA대표',
            business_number: '000-00-00001',
            mail_order_number: '2026-QA-0001호',
            phone: '070-0000-0000',
            email: 'qa@example.test',
            zipcode: '12345',
            base_address: '테스트주소 1',
            detail_address: '101동',
        });
        expect(out.shopName).toBe('QA 스틸폼');
        expect(out.representative).toBe('QA대표');
        expect(out.businessRegistrationNumber).toBe('000-00-00001');
        expect(out.ecommerceRegistrationNumber).toBe('2026-QA-0001호');
        expect(out.customerServicePhone).toBe('070-0000-0000');
        expect(out.customerServiceEmail).toBe('qa@example.test');
        expect(out.businessAddress).toBe('12345 테스트주소 1 101동');
    });

    it('trims whitespace from string fields and ignores unknown keys', () => {
        const out = applyShopInfoOverride({
            shop_name: '  Trim Me  ',
            ceo_name: '   ',
            privacy_officer: 'ignored-by-footer',
            telecom_number: 'ignored-by-footer',
        });
        expect(out.shopName).toBe('Trim Me');
        // Empty-string admin value: still present, so mergeShopInfo() will
        // fall back to the static seed for representative.
        expect(out.representative).toBe('');
    });

    it('returns {} for null / non-object payloads (graceful degradation)', () => {
        expect(applyShopInfoOverride(null)).toEqual({});
        expect(applyShopInfoOverride(undefined)).toEqual({});
        expect(applyShopInfoOverride('not-an-object' as unknown as ShopInfoApiResponse)).toEqual({});
    });

    it('businessAddress collapses cleanly when only some address parts are present', () => {
        expect(applyShopInfoOverride({ zipcode: '11111', base_address: 'A' }).businessAddress).toBe('11111 A');
        expect(applyShopInfoOverride({ base_address: 'A', detail_address: 'B' }).businessAddress).toBe('A B');
        expect(applyShopInfoOverride({}).businessAddress).toBe('');
    });
});

describe('businessFields() — merge priority (admin > static seed > empty)', () => {
    it('admin non-empty value wins over static seed for the same field', () => {
        // business-info.json ships businessRegistrationNumber = '12-345-67890' (demo seed).
        const fields = businessFields('ko', {
            businessRegistrationNumber: '000-00-00001',
        });
        const brn = fields.find((f) => f.label_key === 'superbify.business.field.business_registration_number');
        expect(brn?.value).toBe('000-00-00001');
    });

    it('admin empty value falls back to static seed', () => {
        // business-info.json ships ecommerceRegistrationNumber = '2026-경남김해-1234호'
        const fields = businessFields('ko', {
            ecommerceRegistrationNumber: '',
        });
        const erc = fields.find((f) => f.label_key === 'superbify.business.field.ecommerce_registration_number');
        expect(erc?.value).toBe('2026-경남김해-1234호');
    });

    it('admin company_name empty → falls back to admin shop_name', () => {
        const fields = businessFields('ko', {
            shopName: 'QA 스틸폼',
            companyName: '',
        });
        const companyName = fields.find((f) => f.label_key === 'superbify.business.field.company_name');
        expect(companyName?.value).toBe('QA 스틸폼');
    });

    it('admin omits a field entirely → static seed wins (no override layer)', () => {
        // Only override shopName — every other field falls back to static seed.
        const fields = businessFields('ko', { shopName: 'QA Only' });
        const phone = fields.find((f) => f.label_key === 'superbify.business.field.customer_service_phone');
        // static seed customerServicePhone = '070-123-1234'
        expect(phone?.value).toBe('070-123-1234');
    });
});

describe('StoreFooter — live admin basic_info overlay', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('CASE A: admin non-empty overrides static seed in the rendered footer', async () => {
        const { fetchStub, lastUrl, lastInit } = makeShopInfoFetch({
            shop_name: 'QA 스틸폼',
            company_name: 'QA 상점',
            business_number: '000-00-00001',
            ceo_name: 'QA대표',
            mail_order_number: '2026-QA-0001호',
            zipcode: '12345',
            base_address: '테스트주소 1',
            detail_address: '',
            phone: '070-0000-0000',
            email: 'qa@example.test',
        });
        render(<StoreFooter fetchImpl={fetchStub as unknown as typeof fetch} />);
        await flushAsync();

        // Endpoint + headers are sent correctly.
        expect(lastUrl.value).toBe('/api/plugins/superbify-commerce-compat/shop-info');
        expect(lastInit.value?.method).toBe('GET');
        const headers = lastInit.value?.headers as Record<string, string> | undefined;
        expect(headers?.Accept).toBe('application/json');

        // Admin values surface; static seed values they replaced do not.
        const info = await waitFor(() => screen.getByTestId('footer-business-info'));
        expect(within(info).getByText('QA 스틸폼')).toBeInTheDocument();
        expect(within(info).getByText('QA 상점')).toBeInTheDocument();
        expect(within(info).getByText('000-00-00001')).toBeInTheDocument();
        expect(within(info).getByText('QA대표')).toBeInTheDocument();
        expect(within(info).getByText('2026-QA-0001호')).toBeInTheDocument();
        expect(within(info).getByText('12345 테스트주소 1')).toBeInTheDocument();
        expect(within(info).getByText('070-0000-0000')).toBeInTheDocument();
        // Demo-seed values that the admin payload replaced must NOT appear.
        expect(within(info).queryByText('12-345-67890')).not.toBeInTheDocument();
        expect(within(info).queryByText('2026-경남김해-1234호')).not.toBeInTheDocument();
    });

    it('CASE B: admin empty payload → footer keeps static seed values', async () => {
        const { fetchStub } = makeShopInfoFetch({
            // every field empty / undefined → no override applied
        });
        render(<StoreFooter fetchImpl={fetchStub as unknown as typeof fetch} />);
        await flushAsync();

        // The static seed values for businessRegistrationNumber, phone,
        // ecommerceRegistrationNumber must remain visible.
        const info = await waitFor(() => screen.getByTestId('footer-business-info'));
        expect(within(info).getByText('12-345-67890')).toBeInTheDocument();
        expect(within(info).getByText('070-123-1234')).toBeInTheDocument();
        expect(within(info).getByText('2026-경남김해-1234호')).toBeInTheDocument();
    });

    it('CASE B (partial): admin fills only shop_name → other fields keep static seed', async () => {
        const { fetchStub } = makeShopInfoFetch({ shop_name: 'QA 스틸폼' });
        render(<StoreFooter fetchImpl={fetchStub as unknown as typeof fetch} />);
        await flushAsync();

        const info = await waitFor(() => screen.getByTestId('footer-business-info'));
        // shop_name → shopName; company_name empty → falls back to shopName,
        // so "QA 스틸폼" appears in BOTH the shopName field and the
        // companyName field by design. We only need to assert presence.
        expect(within(info).getAllByText('QA 스틸폼').length).toBeGreaterThan(0);
        // Static seed phone still wins because admin left it empty.
        expect(within(info).getByText('070-123-1234')).toBeInTheDocument();
    });

    it('CASE C: fetch returns 503 → footer silently falls back to static seed', async () => {
        const { fetchStub } = makeShopInfoFetch(null, { ok: false });
        // Spy on console.error to confirm "no console noise" contract.
        const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
        const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        render(<StoreFooter fetchImpl={fetchStub as unknown as typeof fetch} />);
        await flushAsync();

        expect(screen.getByTestId('footer-business-info')).toBeInTheDocument();
        expect(screen.getByText('12-345-67890')).toBeInTheDocument();
        expect(consoleErr).not.toHaveBeenCalled();
        expect(consoleWarn).not.toHaveBeenCalled();
    });

    it('CASE C: fetch throws (network error) → footer silently falls back to static seed', async () => {
        const fetchStub = vi.fn(async () => {
            throw new Error('network unreachable');
        });
        const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(<StoreFooter fetchImpl={fetchStub as unknown as typeof fetch} />);
        await flushAsync();

        expect(screen.getByTestId('footer-business-info')).toBeInTheDocument();
        expect(screen.getByText('12-345-67890')).toBeInTheDocument();
        expect(consoleErr).not.toHaveBeenCalled();
    });

    it('disableLiveShopInfo skips the fetch entirely', async () => {
        const fetchStub = vi.fn(async () => new Response('{}'));
        render(<StoreFooter fetchImpl={fetchStub as unknown as typeof fetch} disableLiveShopInfo />);
        await flushAsync();
        expect(fetchStub).not.toHaveBeenCalled();
        // Static seed still renders.
        expect(screen.getByTestId('footer-business-info')).toBeInTheDocument();
    });

    it('infoFields test injection bypasses both seed and admin overlay', async () => {
        const fetchStub = vi.fn(async () => new Response('{}'));
        render(
            <StoreFooter
                infoFields={[
                    makeField({ label_key: 'shopName', label: '상점명', value: 'TEST-ONLY' }),
                ]}
                fetchImpl={fetchStub as unknown as typeof fetch}
            />
        );
        await flushAsync();
        expect(fetchStub).not.toHaveBeenCalled();
        expect(screen.getByText('TEST-ONLY')).toBeInTheDocument();
    });

    it('shopInfoEndpoint override is honored', async () => {
        const { fetchStub, lastUrl } = makeShopInfoFetch({ shop_name: 'X' });
        render(
            <StoreFooter
                fetchImpl={fetchStub as unknown as typeof fetch}
                shopInfoEndpoint="/test/stub/shop-info"
            />
        );
        await flushAsync();
        expect(lastUrl.value).toBe('/test/stub/shop-info');
    });
});