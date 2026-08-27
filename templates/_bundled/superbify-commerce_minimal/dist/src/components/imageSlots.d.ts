/**
 * Image Slot Utility
 *
 * Bundles every placeholder SVG from `assets/images/*.svg` as raw strings and
 * exposes them as data URIs. This avoids relying on the runtime asset endpoint
 * (which 404s in some engine versions) and keeps the template self-contained
 * immediately after `template:update` / `template:install` / `template:activate`.
 *
 * Pattern mirrors `templates/_bundled/twentyft-studio/src/components/BrandLogo.tsx`:
 *   - `import.meta.glob` with `?raw` + `eager: true`
 *   - convert via `svgToDataUri()` to make it usable as `<img src>`.
 *
 * The same util is the single source of truth for fallback resolution, so a
 * missing slot id never reaches the network and never causes a 404.
 */
declare const FALLBACK_FALLBACK: Record<string, string>;
/**
 * Resolve a slot id (e.g. `product-1`, `category-cups`, `logo`) to an
 * embeddable data URI. If the slot id is unknown, we fall back to the kind
 * default (product/category/hero/promo/logo). If the asset is somehow missing
 * from the bundle we throw at module init time (caught at template install)
 * — but the call site always returns a non-null string at runtime.
 */
export declare function resolveSlotImage(slot: string | null | undefined): string;
/**
 * Resolve by family — used by components that don't carry a slot id but
 * need a known default. `kind` is `'product' | 'category' | 'hero' | 'promo' | 'logo'`.
 */
export declare function resolveDefaultImage(kind: keyof typeof FALLBACK_FALLBACK): string;
export {};
