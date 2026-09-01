/**
 * Phase 1 — Still Form product detail parity coverage.
 *
 * DEFAULT SOURCE OF TRUTH:
 *  - _workspace/ecommerce-qa/remediation/evidence/phase1-spec.md (the contract)
 *  - _workspace/ecommerce-qa/remediation/evidence/parity-oracle-b.json (oracle)
 *  - templates/_bundled/sirsoft-basic/layouts/partials/shop/detail/
 *      _purchase_card.json, _tab_reviews.json, _tab_qna.json (functional reference)
 *  - modules/_bundled/sirsoft-ecommerce BulkAddToCartRequest (POST /cart shape)
 *
 * Locked axes (mock-only props — no network):
 *   (a) 2-group option product — group1 selection enables group2 only after
 *       cascading; sold-out value gets ' (품절)' + disabled; completing the
 *       selection adds an option block with a qty stepper.
 *   (b) Additional option — is_required missing blocks dispatch, allow_custom_text
 *       shows text input, dispatched scm:add-to-cart detail contains items with
 *       additional_option_selections.
 *   (c) Plain product — dispatch carries product_option_id from options[0].
 *   (d) Buy-now with options dispatches mode 'buy' with items.
 *   (e) Coupon download badge — empty list returns null, available coupon click
 *       POSTs /api/modules/sirsoft-ecommerce/user/coupons/{coupon_id}/download
 *       and refetches productDownloadableCoupons DS; downloaded coupon renders
 *       as disabled check state.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PurchasePanel, type PurchasePanelProductData } from '../../src/components/PurchasePanel';
import { CouponDownloadBadges, type CouponDownloadBadgesCoupon } from '../../src/components/CouponDownloadBadges';

interface AddToCartDetail {
    productId: number | string;
    productName?: string;
    mode: 'add' | 'buy';
    items: Array<{
        product_option_id?: number | string | null;
        quantity: number;
        additional_option_selections?: Array<{
            additional_option_id: number | string;
            value_id: number | string;
            custom_text?: string | null;
        }>;
    }>;
}

const TWO_GROUP_DATA: PurchasePanelProductData = {
    id: 100,
    selling_price: 10000,
    max_purchase_qty: 5,
    option_groups: [
        {
            id: 1,
            name: 'Color',
            name_localized: '색상',
            values: [
                { id: 'r', value: 'Red' },
                { id: 'b', value: 'Blue' },
            ],
        },
        {
            id: 2,
            name: 'Size',
            name_localized: '사이즈',
            values: [
                { id: 's', value: 'Small' },
                { id: 'l', value: 'Large' },
            ],
        },
    ],
    options: [
        // Red / Small — in stock
        { id: 11, option_values: ['r', 's'], is_sold_out: false, stock_quantity: 5 },
        // Red / Large — sold out
        { id: 12, option_values: ['r', 'l'], is_sold_out: true, stock_quantity: 0 },
        // Blue / Small — in stock
        { id: 21, option_values: ['b', 's'], is_sold_out: false, stock_quantity: 3 },
        // Blue / Large — sold out (no stock)
        { id: 22, option_values: ['b', 'l'], is_sold_out: true, stock_quantity: 0 },
    ],
    additional_options: [
        {
            id: 50,
            name: '포장 옵션',
            is_required: true,
            values: [
                { id: 500, name: '기본 포장', price_adjustment: 0 },
                { id: 501, name: '고급 포장', price_adjustment: 2000 },
            ],
        },
        {
            id: 60,
            name: '각인 (선택)',
            is_required: false,
            values: [
                { id: 600, name: '각인 없음', is_default: true, price_adjustment: 0 },
                { id: 601, name: '직접 입력', allow_custom_text: true, price_adjustment: 5000 },
            ],
        },
    ],
};

const PLAIN_DATA: PurchasePanelProductData = {
    id: 200,
    selling_price: 5000,
    max_purchase_qty: 10,
    options: [
        { id: 301, option_values: [], is_sold_out: false, stock_quantity: 99 },
    ],
};

beforeEach(() => {
    (window as unknown as { G7Core?: unknown }).G7Core = {
        state: { get: () => ({ cartKey: 'ck_test' }), set: vi.fn(), subscribe: vi.fn(() => undefined) },
        toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), show: vi.fn() },
        api: { getToken: () => 'token-x' },
        dataSource: { refetch: vi.fn() },
        modal: { open: vi.fn(), close: vi.fn() },
    };
});

afterEach(() => {
    cleanup();
    delete (window as unknown as { G7Core?: unknown }).G7Core;
    vi.clearAllMocks();
});

function captureAddToCart(): { listener: ReturnType<typeof vi.fn>; getDetail: () => AddToCartDetail | null } {
    const listener = vi.fn();
    const handler = (evt: Event) => listener((evt as CustomEvent<AddToCartDetail>).detail);
    window.addEventListener('scm:add-to-cart', handler as EventListener);
    return {
        listener,
        getDetail: () => {
            if (listener.mock.calls.length === 0) return null;
            return listener.mock.calls[0][0] as AddToCartDetail;
        },
    };
}

describe('PurchasePanel — 2-group cascading option selector', () => {
    it('group2 stays disabled until group1 is selected; selecting a sold-out group1 value shows (품절) + disabled', () => {
        // Only Red is sold-out (no continuation through any Size that is in stock).
        // For our fixture Red/Large is sold-out and Red/Small is in stock —
        // so Red itself should NOT be sold-out. Mark Red as sold-out (all
        // continuations exhausted) to exercise the suffix logic.
        const data: PurchasePanelProductData = {
            ...TWO_GROUP_DATA,
            options: TWO_GROUP_DATA.options?.map((o) => {
                if (o.option_values?.[0] === 'r') return { ...o, is_sold_out: true, stock_quantity: 0 };
                return o;
            }),
        };
        render(
            <PurchasePanel
                productId={100}
                productName="Demo 2-group"
                salesStatus="on_sale"
                productData={data}
            />,
        );
        const group2 = screen.getByTestId('option-group-select-1') as HTMLSelectElement;
        expect(group2).toBeDisabled();

        // Group 1 select — Red should appear with (품절) suffix + disabled.
        const group1 = screen.getByTestId('option-group-select-0') as HTMLSelectElement;
        const redOption = Array.from(group1.options).find((o) => o.textContent?.includes('Red'));
        expect(redOption).toBeTruthy();
        expect(redOption?.textContent).toContain('(품절)');
        expect(redOption?.disabled).toBe(true);

        // Select Blue (in stock, has continuation through Small).
        fireEvent.change(group1, { target: { value: '1' } });
        // Group 2 becomes enabled.
        expect(group2).not.toBeDisabled();

        // Group 2: Small is in stock, Large is sold-out (disabled + suffix).
        const smallOption = Array.from(group2.options).find((o) => o.textContent?.includes('Small'));
        const largeOption = Array.from(group2.options).find((o) => o.textContent?.includes('Large'));
        expect(smallOption?.disabled).toBe(false);
        expect(largeOption?.textContent).toContain('(품절)');
        expect(largeOption?.disabled).toBe(true);

        // Selecting Small completes the cascade — block appears with qty stepper.
        fireEvent.change(group2, { target: { value: '0' } });
        expect(screen.getByTestId('option-block')).toBeInTheDocument();
        expect(screen.getByTestId('block-qty-0')).toBeInTheDocument();
        expect(screen.getByTestId('option-selector')).toBeInTheDocument();
    });
});

describe('PurchasePanel — additional options contract', () => {
    it('is_required additional option blocks dispatch until selected; allow_custom_text shows text input; payload includes additional_option_selections', () => {
        const { listener, getDetail } = captureAddToCart();
        render(
            <PurchasePanel
                productId={100}
                productName="Demo"
                salesStatus="on_sale"
                productData={TWO_GROUP_DATA}
            />,
        );

        // Select Color=Blue, Size=Small → block appears.
        fireEvent.change(screen.getByTestId('option-group-select-0'), { target: { value: '1' } });
        fireEvent.change(screen.getByTestId('option-group-select-1'), { target: { value: '0' } });
        expect(screen.getByTestId('option-block')).toBeInTheDocument();

        // is_required 추가옵션 (id=50) missing → dispatch blocked.
        fireEvent.click(screen.getByTestId('add-to-cart'));
        expect(listener).not.toHaveBeenCalled();
        expect(screen.getByTestId('purchase-error')).toBeInTheDocument();

        // Select required add-option → 선택 가능.
        fireEvent.change(screen.getByTestId('block-additional-0-50'), { target: { value: '501' } });

        // allow_custom_text → 각인 (id=601) 선택 시 custom text Input 등장.
        expect(screen.queryByTestId('block-additional-text-0-60')).not.toBeInTheDocument();
        fireEvent.change(screen.getByTestId('block-additional-0-60'), { target: { value: '601' } });
        expect(screen.getByTestId('block-additional-text-0-60')).toBeInTheDocument();

        // Click add-to-cart again — payload must contain additional_option_selections.
        fireEvent.click(screen.getByTestId('add-to-cart'));
        expect(listener).toHaveBeenCalled();
        const detail = getDetail();
        expect(detail).not.toBeNull();
        expect(detail?.mode).toBe('add');
        expect(detail?.items).toHaveLength(1);
        const item = detail!.items[0];
        expect(item.product_option_id).toBe('21'); // Blue / Small
        expect(item.quantity).toBe(1);
        expect(Array.isArray(item.additional_option_selections)).toBe(true);
        const selections = item.additional_option_selections!;
        // Required 추가옵션 (50)
        expect(selections).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ additional_option_id: '50', value_id: '501' }),
            ]),
        );
        // allow_custom_text value (601) — custom_text 가 없으면 포함되면 안 됨
        const customSel = selections.find((s) => String(s.additional_option_id) === '60');
        expect(customSel).toBeTruthy();
        expect(customSel?.value_id).toBe('601');
        expect(customSel?.custom_text).toBeUndefined();
    });
});

describe('PurchasePanel — plain product (no options)', () => {
    it('dispatch carries product_option_id from options[0] and reflects quantity input', () => {
        const { listener, getDetail } = captureAddToCart();
        render(
            <PurchasePanel
                productId={200}
                productName="Plain"
                salesStatus="on_sale"
                productData={PLAIN_DATA}
            />,
        );
        // No selector / block — plain quantity stepper visible.
        expect(screen.queryByTestId('option-selector')).not.toBeInTheDocument();
        expect(screen.queryByTestId('option-block')).not.toBeInTheDocument();
        expect(screen.getByTestId('quantity-input')).toBeInTheDocument();
        expect(screen.getByTestId('add-to-cart-panel')).toBeInTheDocument();

        // Bump quantity to 2 and dispatch.
        const inc = screen.getByLabelText('increase quantity');
        fireEvent.click(inc);
        fireEvent.click(screen.getByTestId('add-to-cart'));
        expect(listener).toHaveBeenCalled();
        const detail = getDetail();
        expect(detail?.mode).toBe('add');
        expect(detail?.items).toHaveLength(1);
        expect(detail?.items[0].product_option_id).toBe(301); // options[0].id
        expect(detail?.items[0].quantity).toBe(2);
    });
});

describe('PurchasePanel — buy-now with selected options', () => {
    it('dispatches mode "buy" with items (no extra sold-out behavior)', () => {
        const { listener, getDetail } = captureAddToCart();
        render(
            <PurchasePanel
                productId={100}
                productName="Demo"
                salesStatus="on_sale"
                productData={TWO_GROUP_DATA}
            />,
        );
        // Pick Blue/Small
        fireEvent.change(screen.getByTestId('option-group-select-0'), { target: { value: '1' } });
        fireEvent.change(screen.getByTestId('option-group-select-1'), { target: { value: '0' } });
        expect(screen.getByTestId('option-block')).toBeInTheDocument();

        // Bump qty to 3
        const inc = screen.getByLabelText('increase quantity');
        fireEvent.click(inc);
        fireEvent.click(inc);

        // Required additional option selection
        fireEvent.change(screen.getByTestId('block-additional-0-50'), { target: { value: '500' } });

        // Click buy-now
        fireEvent.click(screen.getByTestId('buy-now'));

        expect(listener).toHaveBeenCalled();
        const detail = getDetail();
        expect(detail?.mode).toBe('buy');
        expect(detail?.items).toHaveLength(1);
        expect(detail?.items[0].product_option_id).toBe('21');
        expect(detail?.items[0].quantity).toBe(3);
        expect(detail?.items[0].additional_option_selections?.[0]).toEqual({
            additional_option_id: '50',
            value_id: '500',
        });
    });
});

describe('CouponDownloadBadges — product detail coupon download chips', () => {
    const COUPONS: CouponDownloadBadgesCoupon[] = [
        {
            coupon_id: 9001,
            localized_name: 'QA E2E 쿠폰',
            benefit_formatted: '10% 할인',
            is_downloaded: false,
        },
        {
            coupon_id: 9002,
            localized_name: '이미 받은 쿠폰',
            benefit_formatted: '5,000원 할인',
            is_downloaded: true,
        },
    ];

    beforeEach(() => {
        (window as unknown as { G7Core?: unknown }).G7Core = {
            state: { get: () => ({ cartKey: 'ck_test' }), set: vi.fn(), subscribe: vi.fn(() => undefined) },
            toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), show: vi.fn() },
            api: { getToken: () => 'token-x' },
            dataSource: { refetch: vi.fn() },
            modal: { open: vi.fn(), close: vi.fn() },
        };
    });

    afterEach(() => {
        cleanup();
        delete (window as unknown as { G7Core?: unknown }).G7Core;
        vi.clearAllMocks();
    });

    it('renders nothing when the coupon list is empty', () => {
        const { container } = render(<CouponDownloadBadges coupons={[]} isLoggedIn={true} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders downloaded coupons as disabled, available coupons as clickable chips', () => {
        render(<CouponDownloadBadges coupons={COUPONS} isLoggedIn={true} />);
        const badges = screen.getAllByTestId('coupon-badge');
        expect(badges).toHaveLength(2);
        const downloadedBadge = badges.find((b) => b.getAttribute('data-downloaded') === 'true');
        const availableBadge = badges.find((b) => b.getAttribute('data-downloaded') === 'false');
        expect(downloadedBadge).toBeTruthy();
        expect(availableBadge).toBeTruthy();
        expect(downloadedBadge).toBeDisabled();
        expect(availableBadge).not.toBeDisabled();
    });

    it('available coupon click POSTs /user/coupons/{coupon_id}/download and refetches the DS', async () => {
        const refetchMock = vi.fn();
        (window as unknown as { G7Core: { dataSource: { refetch: typeof refetchMock } } }).G7Core.dataSource.refetch = refetchMock;
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ data: { success: true } }),
        });
        const originalFetch = global.fetch;
        global.fetch = fetchMock as unknown as typeof global.fetch;

        try {
            render(<CouponDownloadBadges coupons={COUPONS} isLoggedIn={true} />);
            const available = screen.getAllByTestId('coupon-badge').find((b) => b.getAttribute('data-downloaded') === 'false');
            expect(available).toBeTruthy();
            fireEvent.click(available as HTMLElement);
            // Wait for the async fetch + DS refetch.
            await new Promise((r) => setTimeout(r, 0));
            expect(fetchMock).toHaveBeenCalledTimes(1);
            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe('/api/modules/sirsoft-ecommerce/user/coupons/9001/download');
            expect(init.method).toBe('POST');
            expect(init.headers.Authorization).toBe('Bearer token-x');
            expect(refetchMock).toHaveBeenCalledWith('productDownloadableCoupons', { skipCache: true });
        } finally {
            global.fetch = originalFetch;
        }
    });

    it('guest click shows login toast and triggers /login?redirect=... navigation', async () => {
        const fetchMock = vi.fn();
        const originalFetch = global.fetch;
        global.fetch = fetchMock as unknown as typeof global.fetch;
        const assignMock = vi.fn();
        const originalLocation = window.location;
        // jsdom does not allow assigning to window.location, so stub it.
        Object.defineProperty(window, 'location', {
            value: { ...originalLocation, pathname: '/shop/products/QAE2ESTOCKTEST001', search: '', assign: assignMock },
            writable: true,
            configurable: true,
        });

        try {
            render(<CouponDownloadBadges coupons={COUPONS} isLoggedIn={false} />);
            const available = screen.getAllByTestId('coupon-badge').find((b) => b.getAttribute('data-downloaded') === 'false');
            fireEvent.click(available as HTMLElement);
            const toastError = (window as unknown as { G7Core: { toast: { error: ReturnType<typeof vi.fn> } } }).G7Core.toast.error;
            expect(toastError).toHaveBeenCalled();
            expect(assignMock).toHaveBeenCalledTimes(1);
            expect(assignMock.mock.calls[0][0]).toContain('/login?redirect=');
            expect(fetchMock).not.toHaveBeenCalled();
        } finally {
            global.fetch = originalFetch;
            Object.defineProperty(window, 'location', { value: originalLocation, writable: true, configurable: true });
        }
    });
});