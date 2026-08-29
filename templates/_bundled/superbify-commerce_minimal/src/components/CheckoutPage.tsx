import React, { useCallback, useEffect, useState } from 'react';
import { CheckoutForm, type CheckoutFormCheckoutPayload, type CheckoutPaymentMethod, type CheckoutSubmitPayload } from './CheckoutForm';
import { Button, Div, P } from './basic';

export interface CheckoutPageCheckoutData extends CheckoutFormCheckoutPayload {
    temp_order_id?: string | number | null;
}

export interface CheckoutPageSettings {
    payment_methods?: CheckoutPaymentMethod[];
}

export interface CheckoutPageProps {
    /** data_source.checkoutData (unwrapped: { data: response.data.data }) */
    checkoutData?: { data?: CheckoutPageCheckoutData; loading?: boolean; error?: unknown } | null;
    paymentSettings?: { data?: { order_settings?: CheckoutPageSettings } | null; loading?: boolean } | null;
    shippingSettings?: { data?: { shipping?: { default_country?: string; international_shipping_enabled?: boolean } } | null; loading?: boolean } | null;
    isLoggedIn?: boolean;
    currentUserName?: string;
    currentUserPhone?: string;
    currentUserEmail?: string;
    locale?: string;

    // i18n labels (Korean fallback)
    title?: string;
    backToShopLabel?: string;
    loadingLabel?: string;
    emptyTempOrderTitle?: string;
    emptyTempOrderMessage?: string;
    submitErrorTitle?: string;
    orderFailedFallback?: string;
    redirectingLabel?: string;
}

interface ApiError {
    errors?: { message?: string; redirect_to?: string; unavailable_items?: unknown[] };
    message?: string;
}

function readCartKey(): string {
    try {
        const v = (window as unknown as { G7Core?: { state?: { get?: () => { cartKey?: string } } } }).G7Core?.state?.get?.()?.cartKey;
        if (typeof v === 'string') return v;
    } catch {
        /* ignore */
    }
    try {
        return localStorage.getItem('g7_cart_key') ?? '';
    } catch {
        return '';
    }
}

function resolveLabel(value: string | Record<string, string> | null | undefined, locale: string): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        return (value as Record<string, string>)[locale] ?? Object.values(value)[0] ?? '';
    }
    return '';
}

async function fetchJson<T>(url: string, init: RequestInit & { headers?: Record<string, string> }): Promise<{ ok: boolean; status: number; body: T | null; errorText?: string }> {
    const res = await fetch(url, {
        credentials: 'same-origin',
        ...init,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(init.headers ?? {}),
        },
    });
    const text = await res.text();
    let parsed: T | null = null;
    if (text) {
        try {
            parsed = JSON.parse(text) as T;
        } catch {
            parsed = null;
        }
    }
    return { ok: res.ok, status: res.status, body: parsed, errorText: text };
}

interface CreateOrderResponse {
    success?: boolean;
    data?: {
        order?: { order_number?: string };
        requires_pg_payment?: boolean;
        pg_payment_handler?: string;
        pg_payment_data?: unknown;
        redirect_url?: string;
    };
    message?: string;
}

interface VerifyResponse {
    success?: boolean;
    data?: {
        guest_order_token?: string;
        expires_at?: string;
        order?: { order_number?: string; order_status?: string };
    };
}

export function CheckoutPage(props: CheckoutPageProps): React.ReactElement {
    const locale = props.locale ?? 'ko';
    const {
        checkoutData,
        paymentSettings,
        shippingSettings,
        isLoggedIn = false,
    } = props;

    const title = props.title ?? '결제';

    const checkoutPayload = checkoutData?.data ?? null;
    const hasTempOrder = !!(checkoutPayload?.temp_order_id);
    const isCheckoutLoading = !!checkoutData?.loading;

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [createTempError, setCreateTempError] = useState<string | null>(null);
    const [creatingTemp, setCreatingTemp] = useState(false);
    const [resolvedLocale] = useState<string>(locale);

    const resolvePaymentLabel = useCallback(
        (m: CheckoutPaymentMethod) => resolveLabel(m._cached_name, resolvedLocale) || m.id,
        [resolvedLocale],
    );

    // Ensure a temp_order exists. If checkoutData is loaded but has no temp_order_id,
    // POST /checkout to create one. Mirrors sirsoft-basic's flow.
    const createTempOrder = useCallback(async (): Promise<CheckoutPageCheckoutData | null> => {
        setCreatingTemp(true);
        setCreateTempError(null);
        try {
            const cartKey = readCartKey();
            // Fetch current cart to obtain item_ids (cart row ids required by /checkout endpoint).
            const cartRes = await fetchJson<{
                success?: boolean;
                data?: { data?: { items?: Array<{ id?: number }> }; items?: Array<{ id?: number }> };
            }>('/api/modules/sirsoft-ecommerce/cart', {
                method: 'GET',
                headers: cartKey ? { 'X-Cart-Key': cartKey } : {},
            });
            const items = cartRes.body?.data?.data?.items ?? cartRes.body?.data?.items ?? [];
            const itemIds = items.map((i) => i.id).filter((v): v is number => typeof v === 'number');

            if (itemIds.length === 0) {
                setCreateTempError('장바구니가 비어 있습니다.');
                return null;
            }

            const res = await fetchJson<{
                success?: boolean;
                data?: {
                    temp_order_id?: string | number;
                    calculation?: CheckoutPageCheckoutData['calculation'];
                    expires_at?: string;
                };
                message?: string;
            }>('/api/modules/sirsoft-ecommerce/checkout', {
                method: 'POST',
                headers: cartKey ? { 'X-Cart-Key': cartKey } : {},
                body: JSON.stringify({ item_ids: itemIds }),
            });
            if (!res.ok || !res.body?.success) {
                const msg = res.body?.message ?? `HTTP ${res.status}`;
                setCreateTempError(msg);
                return null;
            }
            return {
                temp_order_id: res.body.data?.temp_order_id ?? null,
                calculation: res.body.data?.calculation ?? undefined,
                items: res.body.data?.calculation?.items ?? [],
            };
        } catch (err) {
            setCreateTempError((err as Error).message ?? 'Network error');
            return null;
        } finally {
            setCreatingTemp(false);
        }
    }, []);

    // Initial temp order creation if missing.
    const [bootstrapped, setBootstrapped] = useState(false);
    useEffect(() => {
        if (bootstrapped) return;
        if (checkoutData?.loading) return;
        if (hasTempOrder) {
            setBootstrapped(true);
            return;
        }
        // Data source fetch completed but no temp_order_id — attempt creation.
        // Triggers whether checkoutData.data is null (404 fallback) or present without temp_order_id.
        if (checkoutData !== undefined && checkoutData !== null) {
            setBootstrapped(true);
            void createTempOrder().then(() => {
                /* refetch via engine */
                try {
                    (window as unknown as { G7Core?: { dataSource?: { refetch?: (id: string) => void } } }).G7Core?.dataSource?.refetch?.('checkoutData');
                } catch {
                    /* ignore */
                }
            });
        }
    }, [bootstrapped, checkoutData?.loading, hasTempOrder, checkoutData, createTempOrder]);

    const handleSubmit = useCallback(
        async (payload: CheckoutSubmitPayload) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
                const cartKey = readCartKey();
                const body: Record<string, unknown> = {
                    orderer: payload.orderer,
                    shipping: payload.shipping,
                    payment_method: payload.payment_method,
                    shipping_memo: payload.shipping_memo || null,
                    depositor_name: payload.depositor_name,
                    expected_total_amount: payload.expected_total_amount,
                };
                if (payload.temp_order_id) body.temp_order_id = payload.temp_order_id;

                if (payload.payment_method === 'dbank') {
                    // Use a single bank account placeholder — runtime config gap.
                    // Real PG/bank routing requires admin to activate bank_accounts.
                    body.dbank = {
                        bank_code: '004',
                        account_number: '004-123-4567',
                        account_holder: payload.depositor_name,
                    };
                }

                if (!isLoggedIn) {
                    body.guest_lookup_password = payload.guest_lookup_password;
                    body.guest_lookup_password_confirmation = payload.guest_lookup_password_confirmation;
                }

                const res = await fetchJson<CreateOrderResponse>('/api/modules/sirsoft-ecommerce/user/orders', {
                    method: 'POST',
                    headers: cartKey ? { 'X-Cart-Key': cartKey } : {},
                    body: JSON.stringify(body),
                });

                if (!res.ok || !res.body?.success) {
                    const errBody = res.body as (CreateOrderResponse & ApiError) | null;
                    const msg = errBody?.errors?.message ?? errBody?.message ?? `HTTP ${res.status}`;
                    setSubmitError(msg);
                    setSubmitting(false);
                    return;
                }

                const orderNumber = res.body.data?.order?.order_number;
                const redirectUrl = res.body.data?.redirect_url;
                const requiresPg = !!res.body.data?.requires_pg_payment;

                // Guest: auto verify to issue 30-min token (sirsoft-basic pattern).
                if (!isLoggedIn && !requiresPg && orderNumber && payload.guest_lookup_password) {
                    try {
                        const verifyRes = await fetchJson<VerifyResponse>(
                            '/api/modules/sirsoft-ecommerce/guest/orders/verify',
                            {
                                method: 'POST',
                                body: JSON.stringify({
                                    order_number: orderNumber,
                                    orderer_phone: payload.orderer.phone,
                                    guest_lookup_password: payload.guest_lookup_password,
                                }),
                            }
                        );
                        if (verifyRes.ok && verifyRes.body?.data?.guest_order_token) {
                            try {
                                sessionStorage.setItem(
                                    'g7_guest_order_token',
                                    verifyRes.body.data.guest_order_token
                                );
                            } catch {
                                /* storage may be disabled */
                            }
                            try {
                                (window as unknown as { G7Core?: { state?: { set?: (u: Record<string, unknown>) => void } } }).G7Core?.state?.set?.({
                                    guestOrderToken: verifyRes.body.data.guest_order_token,
                                });
                            } catch {
                                /* ignore */
                            }
                        }
                    } catch {
                        /* verify failure is non-fatal — user can re-verify later via /shop/guest/orders */
                    }
                }

                const finalRedirect =
                    redirectUrl ??
                    (orderNumber
                        ? `/shop/orders/${encodeURIComponent(orderNumber)}/complete`
                        : '/shop');
                // Guest flow: forward guest token via URL query so the next page's
                // init_action can hydrate _global.guestOrderToken (in-memory _global
                // does not survive full-page navigation).
                const tokenParam =
                    !isLoggedIn &&
                    (window as unknown as { G7Core?: { state?: { get?: () => { guestOrderToken?: string } } } })
                        .G7Core?.state?.get?.()?.guestOrderToken;
                const finalUrl =
                    tokenParam
                        ? `${finalRedirect}${finalRedirect.includes('?') ? '&' : '?'}_gtoken=${encodeURIComponent(tokenParam)}`
                        : finalRedirect;
                window.location.assign(finalUrl);
            } catch (err) {
                setSubmitError((err as Error).message ?? 'Network error');
                setSubmitting(false);
            }
        },
        [isLoggedIn]
    );

    const navigateBack = useCallback(() => {
        window.location.assign('/cart');
    }, []);

    // Loading state — initial fetch
    if (isCheckoutLoading && !checkoutPayload) {
        return (
            <Div
                data-testid="checkout-loading"
                style={{
                    padding: 'var(--scm-section-py-md, 4rem) 0',
                    textAlign: 'center',
                    color: 'var(--scm-text-muted, #8A837B)',
                }}
            >
                <P style={{ margin: 0 }}>{props.loadingLabel ?? '주문 정보를 불러오는 중…'}</P>
            </Div>
        );
    }

    // Initial temp-order creation in progress or required
    if (!hasTempOrder && (creatingTemp || !bootstrapped)) {
        return (
            <Div
                data-testid="checkout-creating-temp"
                style={{
                    padding: 'var(--scm-section-py-md, 4rem) 0',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-md, 1rem)',
                    alignItems: 'center',
                }}
            >
                <P style={{ margin: 0, color: 'var(--scm-text-muted, #8A837B)' }}>
                    {creatingTemp ? (props.loadingLabel ?? '주문 정보를 불러오는 중…') : (props.loadingLabel ?? '준비 중…')}
                </P>
            </Div>
        );
    }

    // Temp order creation failed
    if (!hasTempOrder && createTempError) {
        return (
            <Div
                data-testid="checkout-temp-order-error"
                style={{
                    padding: 'var(--scm-section-py-md, 4rem) var(--scm-gutter, 1rem)',
                    maxWidth: '560px',
                    margin: '0 auto',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-md, 1rem)',
                    alignItems: 'center',
                }}
            >
                <H2like>{props.emptyTempOrderTitle ?? '주문 정보를 만들 수 없습니다'}</H2like>
                <P style={{ margin: 0, color: 'var(--scm-text-body, #4A4643)' }}>
                    {createTempError}
                </P>
                <P style={{ margin: 0, color: 'var(--scm-text-muted, #8A837B)', fontSize: '0.875rem' }}>
                    장바구니가 비어 있거나 결제 가능한 상품이 없을 수 있습니다.
                </P>
                <Button
                    type="button"
                    onClick={navigateBack}
                    data-scm-interactive
                    style={{
                        padding: '0.625rem 1rem',
                        backgroundColor: 'var(--scm-charcoal, #26221E)',
                        color: 'var(--scm-text-inverse, #FAF8F3)',
                        border: '1px solid var(--scm-charcoal, #26221E)',
                        borderRadius: 'var(--scm-radius, 8px)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--scm-font-body, system-ui)',
                    }}
                >
                    {props.backToShopLabel ?? '장바구니로 돌아가기'}
                </Button>
            </Div>
        );
    }

    return (
        <Div
            data-testid="checkout-page-root"
            style={{
                paddingBlock: 'var(--scm-section-py-md, 4rem)',
                maxWidth: 'var(--scm-max-width, 1200px)',
                marginInline: 'auto',
                paddingInline: 'var(--scm-gutter, 1rem)',
            }}
        >
            <H2like style={{ marginBottom: 'var(--scm-spacing-lg, 1.5rem)' }}>{title}</H2like>
            <CheckoutForm
                checkoutData={checkoutPayload}
                checkoutLoading={isCheckoutLoading}
                paymentSettings={paymentSettings?.data ?? null}
                shippingSettings={shippingSettings?.data ?? null}
                onSubmit={handleSubmit}
                onNavigateBack={navigateBack}
                isSubmitting={submitting}
                submitError={submitError}
                isLoggedIn={isLoggedIn}
                resolvePaymentLabel={resolvePaymentLabel}
            />
            {isLoggedIn ? null : (
                <P
                    style={{
                        marginTop: 'var(--scm-spacing-md, 1rem)',
                        color: 'var(--scm-text-muted, #8A837B)',
                        fontSize: '0.8125rem',
                        textAlign: 'center',
                    }}
                >
                    결제 진행 후 발급된 주문번호와 휴대폰, 조회 비밀번호로{' '}
                    <a href="/shop/guest/orders" style={{ color: 'var(--scm-text-primary, #26221E)' }}>
                        비회원 주문 조회
                    </a>{' '}
                    에서 다시 확인할 수 있습니다.
                </P>
            )}
        </Div>
    );
}

function H2like({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }): React.ReactElement {
    return (
        <h2
            style={{
                fontFamily: 'var(--scm-font-display, system-ui)',
                fontSize: '1.5rem',
                fontWeight: 600,
                margin: 0,
                color: 'var(--scm-text-primary, #26221E)',
                ...(style ?? {}),
            }}
        >
            {children}
        </h2>
    );
}

export default CheckoutPage;
