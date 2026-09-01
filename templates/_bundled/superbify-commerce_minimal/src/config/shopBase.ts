/**
 * SuperBify Commerce Minimal — shopBase resolver
 *
 * Mirrors the sirsoft-basic pattern. Computes the shop base URL from the
 * sirsoft-ecommerce module's basic_info:
 *
 *   shopBase = no_route ? '' : '/' + (route_path ?? 'shop')
 *
 * - `no_route=true` ⇒ '' (shop mounted at root, e.g. /cart, /checkout, ...)
 * - `no_route=false` with route_path='shop' ⇒ '/shop'
 * - `no_route=false` with route_path='store' ⇒ '/store'
 *
 * Resolution precedence (mirrors Header.tsx in sirsoft-basic):
 *   1. (window as any).G7Core?.state?.get?.()?.shopBase — injected by
 *      _user_base.json init_action so all components see the same value
 *      without re-deriving it.
 *   2. Direct probe of the module's basic_info — fallback for SSR /
 *      isolated unit tests where G7Core is not yet mounted.
 *   3. Default '/shop' — preserved for tests + the no-G7Core case.
 *
 * Components accept `shopBase` as a prop (defaulting to getShopBase()),
 * matching the ProductCard / Header contract in sirsoft-basic. Layouts
 * also reference `{{_global.shopBase}}` in JSON bindings so static
 * hrefs stay in sync with the same source.
 */

interface BasicInfo {
    no_route?: boolean;
    route_path?: string;
}

interface G7CoreLike {
    state?: { get?: () => { shopBase?: unknown } | undefined };
}

/** Default value — mirrors G7 ecommerce module default. */
export const SHOP_BASE_DEFAULT = '/shop';

/**
 * Read shopBase from G7Core's reactive state. Returns undefined when the
 * state has not been seeded yet (SSR / pre-init).
 */
function readShopBaseFromState(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    try {
        const g7 = (window as unknown as { G7Core?: G7CoreLike }).G7Core;
        const v = g7?.state?.get?.()?.shopBase;
        if (typeof v === 'string') {
            // Treat placeholder strings as missing — _global may carry
            // raw template expression output during initial evaluation.
            if (v.includes('{') || v.includes('$')) return undefined;
            return v;
        }
    } catch {
        /* ignore */
    }
    return undefined;
}

/**
 * Read the shop base from the module's basic_info payload. Used as the
 * fallback when G7Core state has not been seeded. The actual
 * `basic_info` payload is injected by `_user_base.json`'s init_action
 * which already evaluates the canonical expression; this fallback
 * exists for SSR / test environments that bypass the engine.
 */
function readShopBaseFromModule(): string {
    if (typeof window === 'undefined') return SHOP_BASE_DEFAULT;
    try {
        // Reuse the engine's appConfig / _global when available — the
        // expression `no_route ? '' : '/' + (route_path ?? 'shop')` is
        // already evaluated server-side and stored in the bootstrap state.
        // Fall through to default if any link in the chain is missing.
        const candidate = (window as unknown as {
            G7Core?: {
                state?: { get?: () => { modules?: { 'sirsoft-ecommerce'?: { basic_info?: BasicInfo } } } | undefined };
            };
        }).G7Core?.state?.get?.()?.modules?.['sirsoft-ecommerce']?.basic_info;
        if (candidate && typeof candidate === 'object') {
            return computeShopBase(candidate);
        }
    } catch {
        /* ignore */
    }
    return SHOP_BASE_DEFAULT;
}

/**
 * Pure compute — exposed for unit tests so the resolution rule can be
 * verified without a DOM.
 */
export function computeShopBase(basic: BasicInfo | null | undefined): string {
    if (!basic) return SHOP_BASE_DEFAULT;
    if (basic.no_route === true) return '';
    const route = typeof basic.route_path === 'string' && basic.route_path.length > 0
        ? basic.route_path
        : 'shop';
    return '/' + route;
}

/**
 * Resolve shopBase at call time. Reads G7Core state first (preferred —
 * bound by `_user_base.json`'s init_action), then module basic_info,
 * then falls back to `/shop`. Never returns an empty string unless the
 * admin has explicitly set `no_route=true` in basic_info.
 */
export function getShopBase(): string {
    const fromState = readShopBaseFromState();
    if (typeof fromState === 'string') return fromState;
    return readShopBaseFromModule();
}

export default getShopBase;
