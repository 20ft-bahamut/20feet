/**
 * 로컬 스토리지 관련 핸들러
 *
 * 비회원 사용자의 장바구니 키(g7_cart_key)를 localStorage 에 캐시하고,
 * 부재 시 백엔드 /api/modules/sirsoft-ecommerce/cart/key 로 발급받아
 * `_global.cartKey` 에 주입한다. 이 값이 있어야 cart_count 등
 * 이커머스 public API 가 X-Cart-Key 헤더 검증(ck_* 32자 형식)을 통과한다.
 *
 * 핸들러 시그니처: ActionDispatcher 의 ActionHandler 형식
 * (action: ActionDefinition, context: ActionContext) => void | Promise<void>
 */

const CART_KEY_STORAGE_NAME = 'g7_cart_key';
const CART_KEY_API_ENDPOINT = '/api/modules/sirsoft-ecommerce/cart/key';

// G7Core 가 아직 없을 수 있는 초기 구간을 폴백하는 logger
const logger = ((window as any).G7Core?.createLogger?.('Handler:Storage')) ?? {
    log: (...args: unknown[]) => console.log('[Handler:Storage]', ...args),
    warn: (...args: unknown[]) => console.warn('[Handler:Storage]', ...args),
    error: (...args: unknown[]) => console.error('[Handler:Storage]', ...args),
};

/**
 * 백엔드 API 로 cart_key 발급. 실패 시 null.
 */
async function issueCartKeyFromApi(): Promise<string | null> {
    try {
        const response = await fetch(CART_KEY_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        if (!response.ok) {
            logger.error('Failed to issue cartKey from API:', response.status);
            return null;
        }
        const data = await response.json();
        return data?.data?.cart_key ?? null;
    } catch (error) {
        logger.error('Error issuing cartKey from API:', error);
        return null;
    }
}

function setGlobalState(updates: Record<string, unknown>): void {
    const G7Core = (window as any).G7Core;
    if (G7Core?.state?.set) {
        G7Core.state.set(updates);
        logger.log('Global state updated:', updates);
    } else {
        logger.warn('G7Core.state.set not available');
    }
}

/**
 * initCartKey 핸들러
 *
 * 1. localStorage 에 저장된 g7_cart_key 가 있으면 그 값을 사용.
 * 2. 없으면 POST /api/modules/sirsoft-ecommerce/cart/key 로 발급 후 저장.
 * 3. `_global.cartKey` 에 동기 set (엔진 globalHeaders 패턴이 즉시 반영).
 *
 * 이 템플릿은 sirsoft-basic 의 storageHandlers 패턴을 단순화한 포크다.
 */
export async function initCartKeyHandler(
    _action?: unknown,
    _context?: unknown
): Promise<void> {
    let cartKey: string | null = null;
    try {
        cartKey = localStorage.getItem(CART_KEY_STORAGE_NAME);
    } catch {
        // localStorage 비활성 환경 (private mode) — 무시하고 API 발급으로 진행.
    }

    if (!cartKey) {
        cartKey = await issueCartKeyFromApi();
        if (cartKey) {
            try {
                localStorage.setItem(CART_KEY_STORAGE_NAME, cartKey);
                logger.log('New cartKey issued from API:', cartKey);
            } catch {
                // storage 쓰기 실패 — 메모리(_global) 값으로만 진행.
            }
        } else {
            logger.error('Failed to issue cartKey from API');
        }
    } else {
        logger.log('Existing cartKey loaded from localStorage');
    }

    setGlobalState({ cartKey });
}

/**
 * addToCart 핸들러 — `window` CustomEvent `scm:add-to-cart` 를 받아
 * `/api/modules/sirsoft-ecommerce/cart` 로 POST 한다.
 *
 * - detail: { productId, quantity, mode: 'add' | 'buy', productName? }
 * - 성공 시 `_global.cartCount` 갱신 + 토스트 + (mode === 'buy' 일 때) `/cart` 로 navigate.
 * - 실패 시 에러 토스트.
 *
 * 컴포넌트(AddToCartPanel)가 직접 fetch 를 알면 안 된다 — 액션 디스패처
 * 패턴을 보존하기 위해 G7 `custom` 액션이 이 핸들러를 호출하도록 레이아웃이
 * 한 번만 window.addEventListener 를 부착한다.
 */
export async function addToCartHandler(
    action?: unknown,
    _context?: unknown
): Promise<void> {
    const detail = (action as { params?: { detail?: {
        productId?: number | string;
        quantity?: number;
        mode?: 'add' | 'buy';
        productName?: string;
        items?: Array<{
            product_option_id?: number | string | null;
            quantity: number;
            additional_option_selections?: Array<{
                additional_option_id: number | string;
                value_id: number | string;
                custom_text?: string | null;
            }>;
        }>;
    } } } | undefined)?.params?.detail;
    if (!detail || (detail.productId === undefined || detail.productId === null)) {
        logger.warn('addToCart handler called without detail.productId');
        return;
    }
    const productId = detail.productId;
    const mode = detail.mode === 'buy' ? 'buy' : 'add';

    // Normalize payload: prefer bulk items contract; fall back to legacy
    // { quantity } shape (compat with old AddToCartPanel CustomEvents).
    interface NormalizedItem {
        product_option_id?: number | string | null;
        quantity: number;
        additional_option_selections?: Array<{
            additional_option_id: number | string;
            value_id: number | string;
            custom_text?: string | null;
        }>;
    }
    let normalizedItems: NormalizedItem[];
    if (Array.isArray(detail.items) && detail.items.length > 0) {
        normalizedItems = detail.items.map((it) => ({
            product_option_id: it.product_option_id,
            quantity: Math.max(1, Math.min(999, Number(it.quantity ?? 1))),
            additional_option_selections: Array.isArray(it.additional_option_selections)
                ? it.additional_option_selections.map((sel) => ({
                    additional_option_id: sel.additional_option_id,
                    value_id: sel.value_id,
                    ...(sel.custom_text ? { custom_text: sel.custom_text } : {}),
                }))
                : undefined,
        }));
    } else {
        const fallbackQty = Math.max(1, Math.min(999, Number(detail.quantity ?? 1)));
        normalizedItems = [{ quantity: fallbackQty }];
    }

    const G7Core = (window as any).G7Core;
    const readCartKey = (): string | null => {
        const k = G7Core?.state?.get?.()?.cartKey;
        return typeof k === 'string' && k.startsWith('ck_') ? k : null;
    };
    let liveCartKey = readCartKey();
    if (!liveCartKey) {
        logger.warn('addToCart handler: cartKey missing, re-init');
        await initCartKeyHandler();
        liveCartKey = readCartKey();
    }

    const numericProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;

    try {
        // 바로구매(buy) — sirsoft-basic createDirectCheckout 계약: 카트에 담지 않고
        // POST /checkout direct_items 로 임시 주문을 만들어 /checkout 로 이동한다.
        // (CheckoutRequest: item_ids OR direct_items) — items 의 각 row 가
        // product_option_id / additional_option_selections 을 포함하면 동일하게 전달.
        if (mode === 'buy') {
            const token = (G7Core as { api?: { getToken?: () => string | null } })?.api?.getToken?.() ?? null;
            const directItems = normalizedItems.map((it) => {
                const row: Record<string, unknown> = {
                    product_id: numericProductId,
                    quantity: it.quantity,
                };
                if (it.product_option_id != null) {
                    row['product_option_id'] = it.product_option_id;
                }
                if (Array.isArray(it.additional_option_selections) && it.additional_option_selections.length > 0) {
                    row['additional_option_selections'] = it.additional_option_selections;
                }
                return row;
            });
            const checkoutRes = await fetch('/api/modules/sirsoft-ecommerce/checkout', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    ...buildCartHeaders(liveCartKey),
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ direct_items: directItems }),
            });

            if (!checkoutRes.ok) {
                let errMsg = `HTTP ${checkoutRes.status}`;
                try {
                    const errBody = await checkoutRes.json();
                    errMsg = errBody?.errors?.message ?? errBody?.message ?? errMsg;
                } catch { /* keep status */ }
                logger.error('buyNow direct checkout failed:', errMsg);
                showToast('error', errMsg);
                return;
            }

            showToast('success', '결제 페이지로 이동합니다.');
            window.location.assign('/checkout');
            return;
        }

        const response = await fetch('/api/modules/sirsoft-ecommerce/cart', {
            method: 'POST',
            credentials: 'same-origin',
            headers: buildCartHeaders(liveCartKey),
            body: JSON.stringify({
                product_id: numericProductId,
                items: normalizedItems,
            }),
        });

        if (!response.ok) {
            let errMsg = `HTTP ${response.status}`;
            try {
                const errBody = await response.json();
                errMsg = errBody?.errors?.message ?? errBody?.message ?? errMsg;
            } catch { /* keep status */ }
            logger.error('addToCart failed:', errMsg);
            showToast('error', errMsg);
            return;
        }

        const body = await response.json();
        const cartCount = body?.data?.cart_count ?? null;
        if (cartCount !== null && G7Core?.state?.set) {
            // Merge with existing global state — `state.set` shallow-merges by default
            G7Core.state.set({ cartCount });
        }
        showToast('success', '장바구니에 담았습니다.');
    } catch (error) {
        logger.error('addToCart network error:', error);
        showToast('error', (error as Error)?.message ?? 'Network error');
    }
}

function showToast(type: 'success' | 'error' | 'info' | 'warning', message: string): void {
    const G7Core = (window as any).G7Core;
    try {
        const fn = G7Core?.toast?.[type];
        if (typeof fn === 'function') {
            fn(message);
            return;
        }
        if (typeof G7Core?.toast?.show === 'function') {
            G7Core.toast.show(message, { type });
            return;
        }
    } catch { /* fallthrough */ }
    // Last resort — G7 미로드 시에도 UX 안 죽게
    if (typeof window !== 'undefined' && type === 'error') {
        logger.warn('[toast:error]', message);
    }
}

/**
 * scm:bind-add-to-cart 핸들러 — 제품 상세 레이아웃 init_actions 에서
 * 1회 호출되어 window.addEventListener('scm:add-to-cart', ...) 를 부착한다.
 * 이후 AddToCartPanel 컴포넌트가 디스패치한 이벤트를 addToCartHandler 가 처리.
 * 중복 부착 방지 가드 포함.
 */
let addToCartListenerBound = false;
export async function bindAddToCartListenerHandler(): Promise<void> {
    if (addToCartListenerBound) return;
    if (typeof window === 'undefined') return;
    addToCartListenerBound = true;
    window.addEventListener('scm:add-to-cart', (evt: Event) => {
        const ce = evt as CustomEvent<{
            productId: number | string;
            quantity?: number;
            mode: 'add' | 'buy';
            productName?: string;
            items?: Array<{
                product_option_id?: number | string | null;
                quantity: number;
                additional_option_selections?: Array<{
                    additional_option_id: number | string;
                    value_id: number | string;
                    custom_text?: string | null;
                }>;
            }>;
        }>;
        addToCartHandler({ params: { detail: ce.detail } });
    });
    logger.log('addToCart window listener bound');
}

// Cart page event handlers ------------------------------------------------

/**
 * Build cart request headers — X-Cart-Key for guest carts PLUS Bearer for
 * logged-in members (merged user cart). Raw fetches here bypass ApiClient,
 * so the Authorization header must be added explicitly. CheckoutPage uses the
 * same G7Core.api.getToken() pattern (readAuthHeader).
 */
function buildCartHeaders(liveCartKey?: string | null): Record<string, string> {
    const G7Core = (window as any).G7Core;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(liveCartKey ? { 'X-Cart-Key': liveCartKey } : {}),
    };
    try {
        const token: unknown = G7Core?.api?.getToken?.();
        if (typeof token === 'string' && token.length > 0) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    } catch { /* unauthenticated — guest cart via X-Cart-Key */ }
    return headers;
}

/**
 * Update quantity: PATCH /api/modules/sirsoft-ecommerce/cart/{id}/quantity
 */
async function patchCartItemQuantity(id: string | number, quantity: number): Promise<{ ok: boolean; data?: unknown; error?: string }> {
    const G7Core = (window as any).G7Core;
    const readCartKey = (): string | null => {
        const k = G7Core?.state?.get?.()?.cartKey;
        return typeof k === 'string' && k.startsWith('ck_') ? k : null;
    };
    let liveCartKey = readCartKey();
    if (!liveCartKey) {
        await initCartKeyHandler();
        liveCartKey = readCartKey();
    }
    try {
        const res = await fetch(`/api/modules/sirsoft-ecommerce/cart/${encodeURIComponent(String(id))}/quantity`, {
            method: 'PATCH',
            credentials: 'same-origin',
            headers: buildCartHeaders(liveCartKey),
            body: JSON.stringify({
                quantity: Math.max(1, Math.min(99, Number(quantity))),
            }),
        });
        if (!res.ok) {
            let msg = `HTTP ${res.status}`;
            try {
                const body = await res.json();
                msg = body?.errors?.message ?? body?.message ?? msg;
            } catch { /* ignore */ }
            return { ok: false, error: msg };
        }
        const body = await res.json();
        return { ok: true, data: body?.data ?? body };
    } catch (err) {
        return { ok: false, error: (err as Error).message };
    }
}

/**
 * Delete items: DELETE /api/modules/sirsoft-ecommerce/cart with { ids: [...] }
 */
async function deleteCartItems(ids: Array<string | number>): Promise<{ ok: boolean; data?: unknown; error?: string }> {
    const G7Core = (window as any).G7Core;
    const readCartKey = (): string | null => {
        const k = G7Core?.state?.get?.()?.cartKey;
        return typeof k === 'string' && k.startsWith('ck_') ? k : null;
    };
    let liveCartKey = readCartKey();
    if (!liveCartKey) {
        await initCartKeyHandler();
        liveCartKey = readCartKey();
    }
    try {
        const res = await fetch('/api/modules/sirsoft-ecommerce/cart', {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: buildCartHeaders(liveCartKey),
            body: JSON.stringify({ ids: ids.map((i) => Number(i)) }),
        });
        if (!res.ok) {
            let msg = `HTTP ${res.status}`;
            try {
                const body = await res.json();
                msg = body?.errors?.message ?? body?.message ?? msg;
            } catch { /* ignore */ }
            return { ok: false, error: msg };
        }
        const body = await res.json();
        return { ok: true, data: body?.data ?? body };
    } catch (err) {
        return { ok: false, error: (err as Error).message };
    }
}

/**
 * Refetch cart data sources by calling G7 dataSource.refetch.
 * Falls back silently if a source isn't registered on the current page.
 */
function refetchAllCartSources(): void {
    const G7Core = (window as any).G7Core;
    const refetch = G7Core?.dataSource?.refetch;
    if (typeof refetch !== 'function') return;
    for (const id of ['cartItems', 'cart', 'cart_count']) {
        try {
            void refetch(id, { skipCache: true });
        } catch {
            /* source may not exist on this page */
        }
    }
}

let cartListenersBound = false;
export async function bindCartPageListenersHandler(): Promise<void> {
    if (cartListenersBound) return;
    if (typeof window === 'undefined') return;
    cartListenersBound = true;

    window.addEventListener('scm:cart-qty-change', async (evt: Event) => {
        const ce = evt as CustomEvent<{ id: string | number; quantity: number }>;
        if (!ce.detail) return;
        const result = await patchCartItemQuantity(ce.detail.id, ce.detail.quantity);
        if (!result.ok) {
            showToast('error', `수량 변경 실패: ${result.error}`);
            return;
        }
        refetchAllCartSources();
        showToast('success', '수량을 변경했습니다.');
    });

    window.addEventListener('scm:cart-delete', async (evt: Event) => {
        const ce = evt as CustomEvent<{ ids: Array<string | number> }>;
        if (!ce.detail || !Array.isArray(ce.detail.ids) || ce.detail.ids.length === 0) return;
        const result = await deleteCartItems(ce.detail.ids);
        if (!result.ok) {
            showToast('error', `삭제 실패: ${result.error}`);
            return;
        }
        refetchAllCartSources();
        showToast('success', '장바구니에서 삭제했습니다.');
    });

    logger.log('cart page event listeners bound');
}

/**
 * initCartKey 핸들러 맵.
 * `_user_base.json` 의 init_actions 가 `{ handler: "initCartKey" }` 형태로 호출한다.
 */
/**
 * clearGuestTokenOnEntry 핸들러 — 비회원 주문 조회 폼 진입 시 sessionStorage 토큰을
 * 폐기해 매번 새 인증을 요구한다(sirsoft-basic guest_order_form init_action 계약).
 */
export async function clearGuestTokenOnEntryHandler(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.removeItem('g7_guest_order_token');
        sessionStorage.removeItem('g7_guest_order_number');
        sessionStorage.removeItem('g7_guest_order_expires_at');
    } catch { /* storage may be disabled */ }
    const G7Core = (window as unknown as {
        G7Core?: { state?: { set?: (u: Record<string, unknown>) => void; get?: () => Record<string, unknown> | null } };
    }).G7Core;
    try {
        if (G7Core?.state?.set && G7Core?.state?.get?.()?.guestOrderToken) {
            G7Core.state.set({ guestOrderToken: null });
        }
    } catch { /* ignore */ }
}

export const handlerMap: Record<string, (action?: unknown, context?: unknown) => void | Promise<void>> = {
    initCartKey: initCartKeyHandler,
    addToCart: addToCartHandler,
    scmBindAddToCartListener: bindAddToCartListenerHandler,
    scmBindCartPageListeners: bindCartPageListenersHandler,
    clearGuestTokenOnEntry: clearGuestTokenOnEntryHandler,
};
