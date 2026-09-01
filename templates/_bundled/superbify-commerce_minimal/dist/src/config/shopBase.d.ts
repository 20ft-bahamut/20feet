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
/** Default value — mirrors G7 ecommerce module default. */
export declare const SHOP_BASE_DEFAULT = "/shop";
/**
 * Pure compute — exposed for unit tests so the resolution rule can be
 * verified without a DOM.
 */
export declare function computeShopBase(basic: BasicInfo | null | undefined): string;
/**
 * Resolve shopBase at call time. Reads G7Core state first (preferred —
 * bound by `_user_base.json`'s init_action), then module basic_info,
 * then falls back to `/shop`. Never returns an empty string unless the
 * admin has explicitly set `no_route=true` in basic_info.
 */
export declare function getShopBase(): string;
export default getShopBase;
