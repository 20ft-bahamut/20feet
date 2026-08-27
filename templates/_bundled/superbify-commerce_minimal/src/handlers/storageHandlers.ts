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
 * initCartKey 핸들러 맵.
 * `_user_base.json` 의 init_actions 가 `{ handler: "initCartKey" }` 형태로 호출한다.
 */
export const handlerMap: Record<string, (action?: unknown, context?: unknown) => void | Promise<void>> = {
    initCartKey: initCartKeyHandler,
};
