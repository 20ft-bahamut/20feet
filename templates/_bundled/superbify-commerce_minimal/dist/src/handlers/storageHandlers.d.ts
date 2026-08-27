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
/**
 * initCartKey 핸들러
 *
 * 1. localStorage 에 저장된 g7_cart_key 가 있으면 그 값을 사용.
 * 2. 없으면 POST /api/modules/sirsoft-ecommerce/cart/key 로 발급 후 저장.
 * 3. `_global.cartKey` 에 동기 set (엔진 globalHeaders 패턴이 즉시 반영).
 *
 * 이 템플릿은 sirsoft-basic 의 storageHandlers 패턴을 단순화한 포크다.
 */
export declare function initCartKeyHandler(_action?: unknown, _context?: unknown): Promise<void>;
/**
 * initCartKey 핸들러 맵.
 * `_user_base.json` 의 init_actions 가 `{ handler: "initCartKey" }` 형태로 호출한다.
 */
export declare const handlerMap: Record<string, (action?: unknown, context?: unknown) => void | Promise<void>>;
