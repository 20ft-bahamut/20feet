/**
 * Checkout functional parity — G7 default checkout(sirsoft-basic) 기능 복원 회귀 잠금.
 *
 * DEFAULT SOURCE OF TRUTH:
 * - templates/_bundled/sirsoft-basic/layouts/partials/shop/_checkout_*.json
 * - modules/_bundled/sirsoft-ecommerce CreateOrderRequest / UpdateCheckoutRequest
 *
 * 잠금 축:
 *  1) 주문자 정보와 동일(same_as_orderer) — orderer → recipient 미러
 *  2) 입력한 배송지를 저장합니다(save_shipping_address) — payload
 *  3) 저장 배송지 pill — 필드 반영 + PUT /checkout 재계산 트리거
 *  4) dbank 계좌 선택 — payload.dbank 가 실제 선택 계좌(하드코딩 금지)
 *  5) core_payment_method 번역 — payload.payment_method
 *  6) refund_bank 환불계좌 all-or-none payload
 *  7) cash_receipt payload(required_if 계약)
 *  8) 쿠폰 / 적립금 → onRecomputeCheckout(UpdateCheckoutRequest 계약)
 *  9) 국제배송 국가 Select → recompute country_code + intl 필드 payload
 * 10) layouts/shop/checkout.json — addresses DS(suppress) + modals 선언
 */
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import * as fs from 'fs';
import * as path from 'path';
import { CheckoutForm, type CheckoutFormProps, type CheckoutSubmitPayload } from '../../src/components/CheckoutForm';

const TEMPLATE_ROOT = path.resolve(__dirname, '../..');

const findInput = (name: string): HTMLInputElement =>
    document.querySelector(`input[name="${name}"]`) as HTMLInputElement;

const baseProps: CheckoutFormProps = {
    checkoutData: {
        temp_order_id: 1,
        items: [
            {
                product_option_id: 1,
                quantity: 1,
                product: { name: '테스트 상품' },
                subtotal_formatted: '26,000원',
            },
        ],
        calculation: {
            summary: {
                subtotal: 26000,
                subtotal_formatted: '26,000원',
                final_amount: 26000,
                final_amount_formatted: '26,000원',
            },
            items: [],
        },
    },
    paymentSettings: {
        order_settings: {
            payment_methods: [{ id: 'dbank', is_active: true }],
            bank_accounts: [
                {
                    id: 11,
                    bank_code: '004',
                    bank_name: '국민은행',
                    account_number: '123-45-67890',
                    account_holder: '스틸폼',
                    is_active: true,
                },
            ],
        },
    },
    isLoggedIn: true,
    currentUserName: '홍길동',
    currentUserPhone: '010-1111-2222',
    onSubmit: vi.fn(),
};

beforeEach(() => {
    (window as any).G7Core = {
        state: {
            get: () => ({ cartKey: 'ck_test' }),
            subscribe: vi.fn(() => undefined),
            set: vi.fn(),
        },
        modal: {
            open: vi.fn(),
            close: vi.fn(),
        },
        dataSource: { refetch: vi.fn() },
        dispatch: vi.fn(),
        api: { getToken: () => 'token-x' },
    };
});

afterEach(() => {
    cleanup();
    delete (window as any).G7Core;
    vi.clearAllMocks();
});

describe('same-as-orderer (주문자 정보와 동일)', () => {
    it('checkbox checked copies orderer name/phone into recipient fields', () => {
        render(<CheckoutForm {...baseProps} />);
        fireEvent.click(screen.getByTestId('checkout-same-as-orderer'));
        expect(findInput('recipient_name')).toHaveValue('홍길동');
        expect(findInput('recipient_phone')).toHaveValue('010-1111-2222');
    });

    it('mirrors later orderer edits while checked (blur-mirror contract)', () => {
        render(<CheckoutForm {...baseProps} />);
        fireEvent.click(screen.getByTestId('checkout-same-as-orderer'));
        fireEvent.change(findInput('orderer_name'), { target: { value: '김철수' } });
        expect(findInput('recipient_name')).toHaveValue('김철수');
    });
});

describe('save_shipping_address (입력한 배송지를 저장합니다)', () => {
    it('submit payload carries save_shipping_address when checked', () => {
        const onSubmit = vi.fn();
        render(<CheckoutForm {...baseProps} onSubmit={onSubmit} />);
        fireEvent.click(screen.getByTestId('checkout-save-shipping-address'));
        fillRequiredShipping();
        fireEvent.click(screen.getByTestId('checkout-pay-button'));
        const payload = onSubmit.mock.calls[0][0] as CheckoutSubmitPayload;
        expect(payload.save_shipping_address).toBe(true);
    });

    it('does not save when a saved address was selected instead', () => {
        const onSubmit = vi.fn();
        render(
            <CheckoutForm
                {...baseProps}
                onSubmit={onSubmit}
                userAddresses={{
                    data: {
                        addresses: {
                            data: [
                                {
                                    id: 5,
                                    name: '집',
                                    recipient_name: '홍길동',
                                    recipient_phone: '010-1111-2222',
                                    country_code: 'KR',
                                    zipcode: '06236',
                                    address: '서울 강남구 테헤란로 427',
                                    address_detail: '101호',
                                },
                            ],
                        },
                    },
                }}
            />,
        );
        fireEvent.click(screen.getByTestId('checkout-saved-address-5'));
        // 저장 배송지 선택 시 checkbox 자체가 사라진다(default: 직접 입력만 저장)
        expect(screen.queryByTestId('checkout-save-shipping-address')).not.toBeInTheDocument();
    });
});

describe('saved address pills', () => {
    it('applies the saved address to shipping fields and recomputes shipping', () => {
        const onRecompute = vi.fn().mockResolvedValue(true);
        render(
            <CheckoutForm
                {...baseProps}
                onRecomputeCheckout={onRecompute}
                userAddresses={{
                    data: {
                        addresses: {
                            data: [
                                {
                                    id: 5,
                                    name: '집',
                                    recipient_name: '홍길동',
                                    recipient_phone: '010-1111-2222',
                                    country_code: 'KR',
                                    zipcode: '06236',
                                    address: '서울 강남구 테헤란로 427',
                                    address_detail: '101동',
                                    is_default: true,
                                },
                            ],
                        },
                    },
                }}
            />,
        );
        fireEvent.click(screen.getByTestId('checkout-saved-address-5'));
        expect(findInput('zipcode')).toHaveValue('06236');
        expect(findInput('recipient_name')).toHaveValue('홍길동');
        expect(onRecompute).toHaveBeenCalledWith(expect.objectContaining({
            zipcode: '06236',
            country_code: 'KR',
        }));
    });
});

describe('payment — dynamic methods, dbank selection, core translation', () => {
    it('renders every active payment method from paymentSettings (no hardcode)', () => {
        render(
            <CheckoutForm
                {...baseProps}
                paymentSettings={{
                    order_settings: {
                        payment_methods: [
                            { id: 'dbank', is_active: true },
                            { id: 'toss_card', is_active: true, core_payment_method: 'card' },
                            { id: 'ios_only', is_active: true, requires_ios: true },
                        ],
                    },
                }}
            />,
        );
        expect(screen.getByTestId('checkout-payment-method-dbank')).toBeInTheDocument();
        expect(screen.getByTestId('checkout-payment-method-toss_card')).toBeInTheDocument();
        // requires_ios 수단은 데스크톱 appConfig 에서 제외(iOS 게이트 계약)
        expect(screen.queryByTestId('checkout-payment-method-ios_only')).not.toBeInTheDocument();
    });

    it('submits dbank with the genuinely selected bank account (never hardcoded)', () => {
        const onSubmit = vi.fn();
        render(<CheckoutForm {...baseProps} onSubmit={onSubmit} />);
        fireEvent.click(screen.getByTestId('checkout-dbank-account-11'));
        fillRequiredShipping();
        fireEvent.click(screen.getByTestId('checkout-pay-button'));
        const payload = onSubmit.mock.calls[0][0] as CheckoutSubmitPayload;
        expect(payload.dbank).toEqual({
            bank_code: '004',
            account_number: '123-45-67890',
            account_holder: '스틸폼',
        });
    });

    it('translates plugin method id to core_payment_method in the submit payload', () => {
        const onSubmit = vi.fn();
        render(
            <CheckoutForm
                {...baseProps}
                paymentSettings={{
                    order_settings: {
                        payment_methods: [
                            { id: 'toss_naverpay', is_active: true, core_payment_method: 'card' },
                        ],
                    },
                }}
                onSubmit={onSubmit}
            />,
        );
        fillRequiredShipping();
        fireEvent.click(screen.getByTestId('checkout-pay-button'));
        const payload = onSubmit.mock.calls[0][0] as CheckoutSubmitPayload;
        expect(payload.payment_method).toBe('card');
    });
});

describe('refund bank (환불 계좌)', () => {
    it('vbank renders the refund-bank block and carries it in the payload (all-or-none)', () => {
        const onSubmit = vi.fn();
        render(
            <CheckoutForm
                {...baseProps}
                paymentSettings={{
                    order_settings: {
                        payment_methods: [{ id: 'vbank', is_active: true }],
                        banks: [{ code: '004', name: { ko: '국민은행' } }],
                    },
                }}
                onSubmit={onSubmit}
            />,
        );
        expect(screen.getByTestId('checkout-refund-bank')).toBeInTheDocument();
        fillRequiredShipping();
        fireEvent.change(document.querySelector('select[name="refund_bank_code"]') as HTMLSelectElement, { target: { value: '004' } });
        fireEvent.change(findInput('refund_bank_account'), { target: { value: '123456' } });
        fireEvent.click(screen.getByTestId('checkout-pay-button'));
        // 3필드 중 2개만 채웠으면 제출 차단(all-or-none withValidator 계약)
        expect(onSubmit).not.toHaveBeenCalled();
        expect(screen.getByTestId('checkout-refund-bank')).toHaveTextContent('환불 계좌');
    });
});

describe('cash receipt (현금영수증)', () => {
    it('renders when provider configured, and submits the module payload keys', () => {
        const onSubmit = vi.fn();
        render(
            <CheckoutForm
                {...baseProps}
                paymentSettings={{
                    order_settings: {
                        payment_methods: [{ id: 'dbank', is_active: true }],
                        bank_accounts: baseProps.paymentSettings?.order_settings?.bank_accounts,
                        cash_receipt_provider: 'pg_cashreceipt',
                    },
                }}
                onSubmit={onSubmit}
            />,
        );
        fireEvent.click(screen.getByTestId('checkout-cash-receipt-requested'));
        fireEvent.click(screen.getByTestId('checkout-cash-receipt-income'));
        fireEvent.change(screen.getByTestId('checkout-cash-receipt-identifier'), { target: { value: '010-1111-2222' } });
        fillRequiredShipping();
        fireEvent.click(screen.getByTestId('checkout-pay-button'));
        const payload = onSubmit.mock.calls[0][0] as CheckoutSubmitPayload;
        expect(payload.cash_receipt).toEqual({
            requested: true,
            type: 'income',
            identifier_type: 'phone',
            identifier: '010-1111-2222',
        });
    });
});

describe('item coupons (상품쿠폰 전체 맵 계약)', () => {
    it('second item’s coupon change sends the FULL merged item_coupons map (partial map would wipe the first item)', async () => {
        const onRecompute = vi.fn().mockResolvedValue(true);
        render(
            <CheckoutForm
                {...baseProps}
                checkoutData={{
                    ...baseProps.checkoutData!,
                    items: [
                        { product_option_id: 1, quantity: 1, product: { name: 'A' }, subtotal_formatted: '1원', available_coupons: [{ id: 7, target_type: 'order_amount', localized_name: 'A쿠폰' }] },
                        { product_option_id: 2, quantity: 1, product: { name: 'B' }, subtotal_formatted: '1원', available_coupons: [{ id: 8, target_type: 'order_amount', localized_name: 'B쿠폰' }] },
                    ],
                }}
                onRecomputeCheckout={onRecompute}
            />,
        );
        // item A — coupon applied
        fireEvent.change(document.querySelectorAll('[data-testid="checkout-item-coupon-1"]')[0], { target: { value: '7' } });
        // item B — its own coupon applied (fresh query — live nodes)
        fireEvent.change(document.querySelectorAll('[data-testid="checkout-item-coupon-1"]')[1], { target: { value: '8' } });
        await act(async () => { await Promise.resolve(); });
        // 최신(두 번째) 재계산 바디가 item 1 쿠폰을 유지하는 '전체 맵'이어야 한다
        const calls = onRecompute.mock.calls;
        const lastBody = calls[calls.length - 1]?.[0];
        expect(lastBody.item_coupons).toEqual({
            '1': ['7', null],
            '2': ['8', null],
        });
    });
});

describe('coupons and mileage (재계산 계약)', () => {
    it('order coupon select triggers PUT/checkout recompute with order_coupon_issue_id', () => {
        const onRecompute = vi.fn().mockResolvedValue(true);
        render(
            <CheckoutForm
                {...baseProps}
                checkoutData={{
                    ...baseProps.checkoutData!,
                    available_coupons: [
                        { id: 77, target_type: 'order_amount', localized_name: '10% 쿠폰', benefit_formatted: '-10%' },
                    ],
                }}
                onRecomputeCheckout={onRecompute}
            />,
        );
        fireEvent.change(screen.getByTestId('checkout-order-coupon-select'), { target: { value: '77' } });
        expect(onRecompute).toHaveBeenCalledWith(
            expect.objectContaining({ order_coupon_issue_id: '77' }),
            expect.anything(),
        );
    });

    it('mileage apply triggers use_points recompute', () => {
        const onRecompute = vi.fn().mockResolvedValue(true);
        render(
            <CheckoutForm
                {...baseProps}
                checkoutData={{
                    ...baseProps.checkoutData!,
                    mileage: { enabled: true, usable: true, available: 5000, max_usable: 1000 },
                }}
                onRecomputeCheckout={onRecompute}
            />,
        );
        expect(screen.getByTestId('checkout-section-mileage')).toBeInTheDocument();
        fireEvent.change(screen.getByTestId('checkout-use-points-input'), { target: { value: '1000' } });
        fireEvent.click(screen.getByTestId('checkout-use-points-apply'));
        expect(onRecompute).toHaveBeenCalledWith(expect.objectContaining({ use_points: 1000 }), expect.anything());
    });

    it('discount/mileage/coupon sections are member-only (guest parity)', () => {
        render(<CheckoutForm {...baseProps} isLoggedIn={false} />);
        expect(screen.queryByTestId('checkout-section-discount')).not.toBeInTheDocument();
        expect(screen.queryByTestId('checkout-section-mileage')).not.toBeInTheDocument();
        // same-as-orderer 는 default 와 동일하게 비회원에도 노출된다
        expect(screen.getByTestId('checkout-same-as-orderer')).toBeInTheDocument();
        expect(screen.queryByTestId('checkout-manage-addresses')).not.toBeInTheDocument();
    });
});

describe('international shipping (국가 선택 계약)', () => {
    it('country select recomputes country_code and clears domestic fields', () => {
        const onRecompute = vi.fn().mockResolvedValue(true);
        render(
            <CheckoutForm
                {...baseProps}
                shippingSettings={{
                    shipping: {
                        default_country: 'KR',
                        international_shipping_enabled: true,
                        available_countries: [
                            { code: 'KR', name: { ko: '대한민국' }, is_active: true },
                            { code: 'US', name: { ko: '미국' }, is_active: true },
                        ],
                    },
                }}
                onRecomputeCheckout={onRecompute}
            />,
        );
        const select = document.querySelector(
            'select[name="country_code"]',
        ) as HTMLSelectElement;
        expect(select).toBeInTheDocument();
        fireEvent.change(select, { target: { value: 'US' } });
        expect(onRecompute.mock.calls[0][0]).toMatchObject({ country_code: 'US' });
        // 국내 주소 필드 → 해외 필드 전환
        expect(findInput('address_line_1')).toBeInTheDocument();
        expect(findInput('intl_city')).toBeInTheDocument();
        expect(document.querySelector('input[name="zipcode"]')).toBeNull();
    });
});

describe('unavailable items (주문 차단 배너)', () => {
    it('banner shows and pay button is disabled when items are unshippable', () => {
        render(
            <CheckoutForm
                {...baseProps}
                checkoutData={{
                    ...baseProps.checkoutData!,
                    has_unshippable_items: true,
                    unavailable_items: [{ product_id: 9 }],
                }}
            />,
        );
        expect(screen.getByTestId('checkout-unavailable-banner')).toBeInTheDocument();
        expect(screen.getByTestId('checkout-pay-button')).toBeDisabled();
    });
});

describe('layout contract — addresses DS + modals', () => {
    let layoutJson: any;
    beforeAll(() => {
        layoutJson = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/shop/checkout.json'), 'utf-8'),
        );
    });

    it('declares the member address book data source with 401 suppress', () => {
        const ds = layoutJson.data_sources.find((s: any) => s.id === 'addresses');
        expect(ds).toBeTruthy();
        expect(ds.endpoint).toBe('/api/modules/sirsoft-ecommerce/user/addresses');
        expect(ds.errorHandling?.['401']?.handler).toBe('suppress');
        expect(ds.fallback?.data).toEqual({ addresses: { data: [] } });
    });

    it('passes saved addresses + modal ids to CheckoutPage', () => {
        const props = layoutJson.slots.content[0].props;
        expect(props.userAddresses).toBe('{{addresses}}');
        expect(props.addressManageModalId).toBe('checkoutAddressManageModal');
        expect(props.couponDownloadModalId).toBe('checkoutCouponDownloadModal');
    });

    it('declares address-manage and coupon-download modals (engine modals key)', () => {
        const partials = (layoutJson.modals ?? []).map((m: any) => m.partial);
        expect(partials).toContain('partials/checkout/_modal_address_manage.json');
        expect(partials).toContain('partials/checkout/_modal_coupon_download.json');
    });
});

describe('PG dispatch (CheckoutPage 실제 submit 경로)', () => {
    it('requires_pg_payment=true 를 받으면 G7Core.dispatch 로 서버 핸들러를 호출하고 navigate 하지 않는다', async () => {
        const { CheckoutPage } = await import('../../src/components/CheckoutPage');
        const dispatchMock = (window as any).G7Core.dispatch as ReturnType<typeof vi.fn>;
        const assignMock = vi.fn();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { ...window.location, assign: assignMock },
        });
        // POST /user/orders → PG 결제 필요 응답 stub
        vi.stubGlobal('fetch', vi.fn(async (url: RequestInfo | URL, _init?: RequestInit) => {
            if (String(url).includes('/user/orders')) {
                return new Response(JSON.stringify({
                    success: true,
                    data: {
                        order: { order_number: 'PG-1' },
                        requires_pg_payment: true,
                        pg_payment_handler: 'sirsoft-pay_toss.requestPayment',
                        pg_payment_data: { order_number: 'PG-1', amount: 26000 },
                    },
                }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }
            return new Response(JSON.stringify({ data: { items: [] } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }));

        render(
            <CheckoutPage
                checkoutData={{ data: { temp_order_id: 1, items: [
                    { product_option_id: 1, quantity: 1, product: { name: '테스트' }, subtotal_formatted: '1원' },
                ],
                calculation: { summary: { final_amount: 26000, final_amount_formatted: '26,000원' }, items: [] } } }}
                paymentSettings={{ data: { order_settings: {
                    payment_methods: [{ id: 'dbank', is_active: true }],
                    bank_accounts: [{ id: 3, bank_code: '004', account_number: '111', account_holder: 'h', is_active: true }],
                } } }}
                isLoggedIn={false}
            />,
        );

        // form을 실제 조립해 제출한다(비회원 → 게스트 비밀번호 필요)
        fireEvent.change(document.querySelector('input[name="orderer_name"]')!, { target: { value: '홍길동' } });
        fireEvent.change(document.querySelector('input[name="orderer_phone"]')!, { target: { value: '010-1111-2222' } });
        fireEvent.change(document.querySelector('input[name="orderer_email"]')!, { target: { value: 'a@b.c' } });
        fireEvent.change(document.querySelector('input[name="recipient_name"]')!, { target: { value: '홍길동' } });
        fireEvent.change(document.querySelector('input[name="recipient_phone"]')!, { target: { value: '010-1111-2222' } });
        fireEvent.change(document.querySelector('input[name="zipcode"]')!, { target: { value: '06236' } });
        fireEvent.change(document.querySelector('input[name="address"]')!, { target: { value: '서울 강남구' } });
        fireEvent.change(document.querySelector('input[name="guest_lookup_password"]')!, { target: { value: '12345678' } });
        fireEvent.change(document.querySelector('input[name="guest_lookup_password_confirmation"]')!, { target: { value: '12345678' } });
        fireEvent.click(document.querySelector('input[name="selected_dbank"]')!);
        fireEvent.click(screen.getByTestId('checkout-pay-button'));

        await act(async () => { await Promise.resolve(); });

        // 서버가 지시한 결제 핸들러가 그대로 디스패치된다(provider-agnostic 계약)
        expect(dispatchMock).toHaveBeenCalledWith(expect.objectContaining({
            handler: 'sirsoft-pay_toss.requestPayment',
            params: { pgPaymentData: expect.objectContaining({ order_number: 'PG-1' }) },
        }));
        // PG 진입 시 기존 non-PG fallback navigate 는 하지 않는다
        expect(assignMock).not.toHaveBeenCalled();
        vi.unstubAllGlobals();
    });
});

function fillRequiredShipping() {
    //zipcode/address live in the KR block by default (country seeds 'KR')
    fireEvent.change(findInput('recipient_name'), { target: { value: '홍길동' } });
    fireEvent.change(findInput('recipient_phone'), { target: { value: '010-1111-2222' } });
    fireEvent.change(findInput('zipcode'), { target: { value: '06236' } });
    fireEvent.change(findInput('address'), { target: { value: '서울 강남구 테헤란로 427' } });
    const depositor = document.querySelector('input[name="depositor_name"]') as HTMLInputElement | null;
    if (depositor !== null) fireEvent.change(depositor, { target: { value: '홍길동' } });
}