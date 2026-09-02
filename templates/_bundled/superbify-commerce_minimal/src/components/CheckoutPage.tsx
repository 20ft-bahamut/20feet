import React, { useCallback, useEffect, useState } from 'react';
import {
    CheckoutForm,
    type CheckoutFormCheckoutPayload,
    type CheckoutFormProps,
    type CheckoutFormPaymentSettings,
    type CheckoutFormShippingSettings,
    type CheckoutPaymentMethod,
    type CheckoutRecomputeFields,
    type CheckoutSubmitPayload,
} from './CheckoutForm';
import { getShopBase } from '../config/shopBase';
import { A, Button, Div, H1, P, Span } from './basic';

export interface CheckoutPageCheckoutData extends CheckoutFormCheckoutPayload {
    temp_order_id?: string | number | null;
}

export interface CheckoutPageSettings {
    payment_methods?: CheckoutPaymentMethod[];
}

export interface CheckoutPageProps {
    /** data_source.checkoutData (unwrapped: { data: response.data.data }) */
    checkoutData?: { data?: CheckoutPageCheckoutData; loading?: boolean; error?: unknown } | null;
    paymentSettings?: { data?: CheckoutFormPaymentSettings | null; loading?: boolean } | null;
    shippingSettings?: { data?: CheckoutFormShippingSettings | null; loading?: boolean } | null;
    /** userAddresses data source (회원 저장 배송지) — 게이트는 CheckoutForm 이 isLoggedIn 으로 처리 */
    userAddresses?: { data?: { addresses?: { data?: unknown[] } }; loading?: boolean; error?: unknown } | null;
    /** Address-manage modal id — "배송지 관리" 클릭 시 G7Core.modal.open 대상. */
    addressManageModalId?: string;
    /** Downloadable-coupon modal id. */
    couponDownloadModalId?: string;
    isLoggedIn?: boolean;
    currentUserName?: string;
    currentUserPhone?: string;
    currentUserEmail?: string;
    locale?: string;
    /** Override the shop base URL. Defaults to getShopBase(). */
    shopBase?: string;

    // i18n labels (Korean fallback)
    title?: string;
    backToShopLabel?: string;
    loadingLabel?: string;
    emptyTempOrderTitle?: string;
    emptyTempOrderMessage?: string;
    submitErrorTitle?: string;
    orderFailedFallback?: string;
    redirectingLabel?: string;
    /** Progress indicator labels — cart › checkout › complete. */
    progressCartLabel?: string;
    progressCheckoutLabel?: string;
    progressCompleteLabel?: string;
    /** daum extension_point 주입 노드 — CheckoutForm 의 우편번호 행으로 통과한다. */
    children?: React.ReactNode;
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

/**
 * Member bearer token, if present (sirsoft-basic identityLauncher tolerant pattern).
 * Raw fetch bypasses the core ApiClient, so the Authorization header must be attached
 * manually — otherwise the server treats component-level calls (POST /checkout, POST
 * /user/orders) as guest calls even when the member is logged in.
 */
function readAuthHeader(): Record<string, string> {
    try {
        const G7Core = (window as unknown as { G7Core?: { api?: { getToken?: () => string | null } } }).G7Core;
        const token = G7Core?.api?.getToken?.() ?? null;
        if (token) return { Authorization: `Bearer ${token}` };
    } catch {
        /* storage may be disabled */
    }
    return {};
}

async function fetchJson<T>(url: string, init: RequestInit & { headers?: Record<string, string> }): Promise<{ ok: boolean; status: number; body: T | null; errorText?: string }> {
    const res = await fetch(url, {
        credentials: 'same-origin',
        ...init,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...readAuthHeader(),
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

/** 주문 성공 후 complete 페이지 라우팅(redirect_url 우선). */
function navigateToOrder(orderNumber?: string, redirectUrl?: string): void {
    const shopBase = getShopBase();
    const baseForLink = shopBase === '/' ? '' : shopBase;
    const finalRedirect =
        redirectUrl ??
        (orderNumber
            ? `${baseForLink}/orders/${encodeURIComponent(orderNumber)}/complete`
            : `${baseForLink}/`);
    // Guest flow: forward guest token via URL query so the next page's
    // init_action can hydrate _global.guestOrderToken (in-memory _global
    // does not survive full-page navigation).
    const tokenParam = (window as unknown as { G7Core?: { state?: { get?: () => { guestOrderToken?: string } } } })
        .G7Core?.state?.get?.()?.guestOrderToken;
    const finalUrl =
        tokenParam
            ? `${finalRedirect}${finalRedirect.includes('?') ? '&' : '?'}_gtoken=${encodeURIComponent(tokenParam)}`
            : finalRedirect;
    window.location.assign(finalUrl);
}

/** PG 결제 실패 후 복귀 쿼리(?error=...) → submitError 배너 메시지(default PG error 계약). */
const PG_ERROR_LABELS: Record<string, string> = {
    confirm_failed: '결제 승인에 실패했습니다. 다시 시도해 주세요.',
    amount_mismatch: '결제 금액이 일치하지 않습니다. 주문을 다시 진행해 주세요.',
    order_not_found: '주문 정보를 찾을 수 없습니다.',
};

export function CheckoutPage(props: CheckoutPageProps): React.ReactElement {
    const locale = props.locale ?? 'ko';
    const {
        checkoutData,
        paymentSettings,
        shippingSettings,
        userAddresses,
        addressManageModalId = 'checkoutAddressManageModal',
        couponDownloadModalId = 'checkoutCouponDownloadModal',
        isLoggedIn = false,
        currentUserName,
        currentUserPhone,
        currentUserEmail,
    } = props;
    const {
        progressCartLabel = '장바구니',
        progressCheckoutLabel = '주문/결제',
        progressCompleteLabel = '완료',
    } = props;

    const title = props.title ?? '결제';

    // shopBase resolution — defaults to getShopBase() (mirrors sirsoft-basic
    // Header.tsx pattern). Layouts may also pass an explicit `shopBase` prop
    // via JSON binding interpolation; if neither is provided the resolver
    // falls back to '/shop' which preserves the demo contract.
    const resolvedShopBase = props.shopBase ?? getShopBase();
    const baseForLink = resolvedShopBase === '/' ? '' : resolvedShopBase;
    const cartHref = `${baseForLink}/cart`;

    const checkoutPayload = checkoutData?.data ?? null;
    const hasTempOrder = !!(checkoutPayload?.temp_order_id);
    const isCheckoutLoading = !!checkoutData?.loading;

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [createTempError, setCreateTempError] = useState<string | null>(null);
    const [creatingTemp, setCreatingTemp] = useState(false);
    const [resolvedLocale] = useState<string>(locale);

    // PG 결제 실패 복귀 — ?error=confirm_failed|amount_mismatch|order_not_found 배너
    // (default template PG error 계약의 Still Form 배너 동치 구현).
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const params = new URLSearchParams(window.location.search);
            const err = params.get('error');
            if (!err) return;
            setSubmitError(PG_ERROR_LABELS[err] ?? '결제 처리 중 문제가 발생했습니다.');
            try {
                const url = new URL(window.location.href);
                url.searchParams.delete('error');
                window.history.replaceState({}, '', url.toString());
            } catch {
                /* ignore */
            }
        } catch {
            /* ignore */
        }
    }, []);

    const resolvePaymentLabel = useCallback(
        (m: CheckoutPaymentMethod) => resolveLabel(m._cached_name, resolvedLocale) || m.id,
        [resolvedLocale],
    );

    // G7 전역 토스트 — 쿠폰·적립금 적용 피드백(default template toast 계약).
    const showToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string) => {
        try {
            const G7Core = (window as unknown as {
                G7Core?: {
                    toast?: ((msg?: unknown, opts?: unknown) => void)
                        & { [k: string]: unknown };
                };
            }).G7Core;
            const fn = G7Core?.toast;
            if (typeof fn === 'function') {
                fn(message, { type });
                return;
            }
            const typed = typeof fn === 'object' && fn !== null ? (fn as Record<string, unknown>)[type] : undefined;
            if (typeof typed === 'function') {
                (typed as (m: string) => void)(message);
            }
        } catch {
            /* G7 미로드 시 무시 */
        }
    }, []);

    // PUT /checkout 재계산 — UpdateCheckoutRequest 계약 필드만 전송(쿠폰/적립금/우편번호/국가).
    // 성공 시 checkoutData refetch 로 표시 금액이 서버 계산(SDoT)과 동기화된다.
    const recomputeCheckout = useCallback(
        async (fields: CheckoutRecomputeFields, opts?: { successMessage?: string }): Promise<boolean> => {
            try {
                const cartKey = readCartKey();
                const body: Record<string, unknown> = {};
                for (const [k, v] of Object.entries(fields)) {
                    if (v !== undefined) body[k] = v;
                }
                const res = await fetchJson<{ success?: boolean; message?: string }>(
                    '/api/modules/sirsoft-ecommerce/checkout',
                    {
                        method: 'PUT',
                        headers: cartKey ? { 'X-Cart-Key': cartKey } : {},
                        body: JSON.stringify(body),
                    },
                );
                if (!res.ok || !res.body?.success) {
                    const msg = res.body?.message ?? `HTTP ${res.status}`;
                    showToast('error', msg);
                    return false;
                }
                try {
                    (window as unknown as { G7Core?: { dataSource?: { refetch?: (id: string) => void } } }).G7Core?.dataSource?.refetch?.('checkoutData');
                } catch {
                    /* ignore */
                }
                if (opts?.successMessage) showToast('success', opts.successMessage);
                return true;
            } catch (err) {
                showToast('error', (err as Error).message ?? 'Network error');
                return false;
            }
        },
        [showToast],
    );

    // "배송지 관리" / "쿠폰 다운로드" — 레이아웃 선언 모달을 G7 전역 모달 API 로 연다.
    const openAddressManager = useCallback(() => {
        try {
            (window as unknown as { G7Core?: { modal?: { open?: (id: string) => void } } }).G7Core?.modal?.open?.(
                addressManageModalId,
            );
        } catch {
            /* ignore */
        }
    }, [addressManageModalId]);

    const openCouponDownload = useCallback(async () => {
        try {
            // 쿠폰 다운로드 데이터 선적재 → _global.downloadableCoupons 로 모달에 전달
            // (default template 의 apiCall → openModal 시퀀스를 React composite 에서 재현).
            const token = (window as unknown as { G7Core?: { api?: { getToken?: () => string | null } } }).G7Core?.api?.getToken?.() ?? null;
            const res = await fetchJson<{ success?: boolean; data?: unknown; message?: string }>(
                '/api/modules/sirsoft-ecommerce/user/coupons/downloadable?page=1&per_page=8',
                { method: 'GET', headers: token ? { Authorization: `Bearer ${token}` } : {} },
            );
            const coupons = res.body?.data ?? null;
            (window as unknown as { G7Core?: { state?: { set?: (u: Record<string, unknown>) => void } } })
                .G7Core?.state?.set?.({ downloadableCoupons: coupons, downloadableCouponsLoading: false });
        } catch {
            try {
                (window as unknown as { G7Core?: { state?: { set?: (u: Record<string, unknown>) => void } } })
                    .G7Core?.state?.set?.({ downloadableCoupons: null, downloadableCouponsLoading: false });
            } catch {
                /* ignore */
            }
        }
        try {
            (window as unknown as { G7Core?: { modal?: { open?: (id: string) => void } } }).G7Core?.modal?.open?.(
                couponDownloadModalId,
            );
        } catch {
            /* ignore */
        }
    }, [couponDownloadModalId]);

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
                // POST /user/orders body — CreateOrderRequest 계약 그대로(Form 이 조립).
                // dbank 는 Form 이 선택한 실제 계좌로만 구성하고 하드코딩 계좌는 쓰지 않는다.
                const body: Record<string, unknown> = {
                    temp_order_id: payload.temp_order_id,
                    orderer: payload.orderer,
                    shipping: payload.shipping,
                    payment_method: payload.payment_method,
                    shipping_memo: payload.shipping_memo || null,
                    depositor_name: payload.depositor_name || payload.orderer.name,
                    dbank: payload.dbank,
                    refund_bank: payload.refund_bank,
                    save_shipping_address: payload.save_shipping_address,
                    expected_total_amount: payload.expected_total_amount,
                };
                if (payload.cash_receipt?.requested) {
                    body.cash_receipt_requested = true;
                    body.cash_receipt_type = payload.cash_receipt.type ?? 'income';
                    body.cash_receipt_identifier_type = payload.cash_receipt.identifier_type ?? 'phone';
                    body.cash_receipt_identifier = payload.cash_receipt.identifier ?? '';
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
                const pgHandler = res.body.data?.pg_payment_handler;
                const requiresPg = !!res.body.data?.requires_pg_payment;

                // PG 결제 — provider-agnostic 동적 dispatch(default template 계약).
                // 서버가 내려준 pg_payment_handler 를 G7Core.dispatch 로 그대로 호출한다.
                if (requiresPg && pgHandler) {
                    setSubmitting(false);
                    try {
                        (window as unknown as {
                            G7Core?: { dispatch?: (action: Record<string, unknown>) => void };
                        }).G7Core?.dispatch?.({
                            handler: pgHandler,
                            params: {
                                pgPaymentData: res.body.data?.pg_payment_data,
                            },
                        });
                    } catch {
                        /* handler dispatch 실패 시 fallback navigate */
                        navigateToOrder(orderNumber, redirectUrl);
                    }
                    return;
                }

                // Guest: auto verify to issue 30-min token (non-PG flow only — sirsoft-basic pattern).
                if (!isLoggedIn && orderNumber && payload.guest_lookup_password) {
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

                navigateToOrder(orderNumber, redirectUrl);
            } catch (err) {
                setSubmitError((err as Error).message ?? 'Network error');
                setSubmitting(false);
            }
        },
        [isLoggedIn]
    );

    const navigateBack = useCallback(() => {
        const shopBase = getShopBase();
        const baseForLink = shopBase === '/' ? '' : shopBase;
        window.location.assign(`${baseForLink}/cart`);
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
                <h2
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        margin: 0,
                        color: 'var(--scm-text-primary, #26221E)',
                    }}
                >
                    {props.emptyTempOrderTitle ?? '주문을 진행할 수 없습니다'}
                </h2>
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
            <Div className="scm-checkout-page-head" data-testid="checkout-page-head">
                <nav className="scm-checkout-progress" aria-label={`${progressCartLabel} · ${progressCheckoutLabel} · ${progressCompleteLabel}`}>
                    <A
                        href={cartHref}
                        className="scm-checkout-progress-step"
                        data-testid="checkout-progress-cart"
                    >
                        {progressCartLabel}
                    </A>
                    <Span className="scm-checkout-progress-sep" aria-hidden="true">›</Span>
                    <Span
                        className="scm-checkout-progress-step scm-checkout-progress-current"
                        aria-current="step"
                        data-testid="checkout-progress-checkout"
                    >
                        {progressCheckoutLabel}
                    </Span>
                    <Span className="scm-checkout-progress-sep" aria-hidden="true">›</Span>
                    <Span className="scm-checkout-progress-step" data-testid="checkout-progress-complete">
                        {progressCompleteLabel}
                    </Span>
                </nav>
                <Div className="scm-checkout-title-row">
                    <H1 className="scm-checkout-page-title">{title}</H1>
                    <Button
                        type="button"
                        onClick={navigateBack}
                        data-testid="checkout-back-to-cart"
                        data-scm-interactive
                        className="scm-checkout-back-button"
                    >
                        {props.backToShopLabel ?? '장바구니로 돌아가기'}
                    </Button>
                </Div>
            </Div>
            <CheckoutForm
                checkoutData={checkoutPayload}
                checkoutLoading={isCheckoutLoading}
                paymentSettings={paymentSettings?.data ?? null}
                shippingSettings={shippingSettings?.data ?? null}
                userAddresses={(userAddresses as unknown as CheckoutFormProps['userAddresses']) ?? null}
                onSubmit={handleSubmit}
                onNavigateBack={navigateBack}
                onRecomputeCheckout={recomputeCheckout}
                onOpenAddressManager={openAddressManager}
                onOpenCouponDownload={openCouponDownload}
                isSubmitting={submitting}
                submitError={submitError}
                isLoggedIn={isLoggedIn}
                currentUserName={currentUserName}
                currentUserPhone={currentUserPhone}
                currentUserEmail={currentUserEmail}
                locale={resolvedLocale}
                resolvePaymentLabel={resolvePaymentLabel}
            >
                {props.children}
            </CheckoutForm>
            {isLoggedIn ? null : (
                <P
                    className="scm-checkout-guest-note"
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

export default CheckoutPage;
