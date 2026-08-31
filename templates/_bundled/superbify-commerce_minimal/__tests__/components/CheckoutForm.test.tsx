/**
 * CheckoutForm — WP5 checkout member flow + daum extension slot.
 *
 * 1) children slot renders inside the shipping section (daum extension_point
 *    주입 노드가 zipcode/address 입력 옆에 렌더링되는 경로)
 * 2) isLoggedIn=true hides the guest lookup password block
 * 3) `_global.checkoutAddress` G7Core.state bridge maps to the controlled
 *    zipcode/address inputs (daum plugin dispatches actions, not DOM writes)
 * 4) layouts/shop/checkout.json binds member props to _global.currentUser and
 *    declares the address_search_slot extension_point node
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import * as fs from 'fs';
import * as path from 'path';
import { CheckoutForm, type CheckoutFormProps } from '../../src/components/CheckoutForm';

const TEMPLATE_ROOT = path.resolve(__dirname, '../..');

const baseProps: CheckoutFormProps = {
    checkoutData: {
        temp_order_id: 1,
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
        },
    },
    onSubmit: vi.fn(),
};

const findInput = (name: string): HTMLInputElement =>
    document.querySelector(`input[name="${name}"]`) as HTMLInputElement;

afterEach(() => {
    cleanup();
    delete (window as any).G7Core;
    vi.clearAllMocks();
});

describe('CheckoutForm children slot (daum address search)', () => {
    it('renders the children next to the zipcode/address inputs', () => {
        render(
            <CheckoutForm {...baseProps}>
                <div data-testid="daum-address-search-node">주소 검색</div>
            </CheckoutForm>,
        );
        const slot = screen.getByTestId('checkout-address-search-slot');
        expect(slot).toBeInTheDocument();
        expect(slot).toContainElement(screen.getByTestId('daum-address-search-node'));

        // the slot lives in the shipping section, next to the address inputs
        const shipping = screen.getByTestId('checkout-section-shipping');
        expect(shipping).toContainElement(slot);
        expect(findInput('zipcode')).toBeInTheDocument();
        expect(findInput('address')).toBeInTheDocument();
    });

    it('renders no slot wrapper when children are omitted', () => {
        render(<CheckoutForm {...baseProps} />);
        expect(screen.queryByTestId('checkout-address-search-slot')).not.toBeInTheDocument();
    });
});

describe('CheckoutForm guest lookup password visibility', () => {
    it('shows the guest password block for guests (default)', () => {
        render(<CheckoutForm {...baseProps} />);
        expect(screen.getByTestId('checkout-guest-password')).toBeInTheDocument();
    });

    it('hides the guest password block when isLoggedIn is true', () => {
        render(<CheckoutForm {...baseProps} isLoggedIn />);
        expect(screen.queryByTestId('checkout-guest-password')).not.toBeInTheDocument();
        // orderer email is no longer required for members
        expect(findInput('orderer_email')).not.toBeRequired();
    });
});

describe('CheckoutForm _global.checkoutAddress bridge (daum fallback path)', () => {
    it('syncs daum address from G7Core.state subscription into the controlled inputs', () => {
        const listeners: Array<(state: Record<string, unknown>) => void> = [];
        (window as any).G7Core = {
            state: {
                get: () => ({}),
                subscribe: (listener: (state: Record<string, unknown>) => void) => {
                    listeners.push(listener);
                    return () => {
                        const index = listeners.indexOf(listener);
                        if (index >= 0) listeners.splice(index, 1);
                    };
                },
            },
        };

        render(<CheckoutForm {...baseProps} />);
        expect(listeners.length).toBe(1);

        act(() => {
            listeners[0]({
                checkoutAddress: {
                    zipcode: '30151',
                    address: '세종특별자치시 한누리대로 960',
                    region: '세종특별자치시',
                    city: '세종특별자치시',
                    country_code: 'KR',
                },
            });
        });

        expect(findInput('zipcode')?.value).toBe('30151');
        expect(findInput('address')?.value).toBe('세종특별자치시 한누리대로 960');
    });

    it('hydrates from an already recorded checkoutAddress on mount', () => {
        (window as any).G7Core = {
            state: {
                get: () => ({
                    checkoutAddress: {
                        zipcode: '06236',
                        address: '서울특별시 강남구 테헤란로 123',
                    },
                }),
                subscribe: vi.fn(() => undefined),
            },
        };

        render(<CheckoutForm {...baseProps} />);
        expect(findInput('zipcode')?.value).toBe('06236');
        expect(findInput('address')?.value).toBe('서울특별시 강남구 테헤란로 123');
    });

    it('tolerates a missing G7Core.state (SSR/plain render)', () => {
        expect(() => render(<CheckoutForm {...baseProps} />)).not.toThrow();
        expect(findInput('zipcode')?.value).toBe('');
    });
});

describe('layouts/shop/checkout.json member bindings + daum extension node', () => {
    const raw = fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/shop/checkout.json'), 'utf8');
    const layout = JSON.parse(raw);
    const page = layout.slots?.content?.find(
        (node: { id?: string }) => node?.id === 'checkout_page_wrapper',
    );

    it('binds isLoggedIn / currentUser* to _global.currentUser', () => {
        expect(page).toBeTruthy();
        const props = page.props ?? {};
        expect(props.isLoggedIn).toContain('_global.currentUser');
        expect(props.currentUserName).toBe("{{_global.currentUser?.name ?? ''}}");
        expect(props.currentUserPhone).toBe("{{_global.currentUser?.phone ?? ''}}");
        expect(props.currentUserEmail).toBe("{{_global.currentUser?.email ?? ''}}");
        // no hardcoded false — the member flow depends on the binding
        expect(props.isLoggedIn).not.toBe(false);
    });

    it('declares the address_search_slot extension_point node with the daum callbacks', () => {
        const node = layout.slots?.content?.find(
            (n: { id?: string }) => n?.id === 'checkout_address_search_slot',
        );
        expect(node).toBeTruthy();
        expect(node.type).toBe('extension_point');
        expect(node.name).toBe('address_search_slot');
        expect(node.props?.readOnlyFields).toEqual(['zipcode', 'address']);

        const callback = node.callbacks?.onAddressSelect;
        expect(callback?.handler).toBe('sequence');
        const handlers = (callback?.actions ?? []).map((a: { 'handler'?: string }) => a?.handler);
        expect(handlers).toContain('setState');
        expect(handlers).toContain('apiCall');

        const setStateAction = (callback?.actions ?? []).find(
            (a: { handler?: string }) => a.handler === 'setState',
        );
        expect(setStateAction.params?.target).toBe('global');
        expect(JSON.stringify(setStateAction.params)).toContain('checkoutAddress');

        const apiCallAction = (callback?.actions ?? []).find(
            (a: { handler?: string }) => a.handler === 'apiCall',
        );
        expect(apiCallAction.target).toBe('/api/modules/sirsoft-ecommerce/checkout');
        expect(apiCallAction.params?.method).toBe('PUT');
        expect(apiCallAction.onSuccess?.[0]?.handler).toBe('refetchDataSource');
        expect(apiCallAction.onSuccess?.[0]?.params?.dataSourceId).toBe('checkoutData');
    });
});