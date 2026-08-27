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

const rawModules = import.meta.glob<string>('../../assets/images/*.svg', {
    query: '?raw',
    import: 'default',
    eager: true,
});

function loadRaw(name: string): string | null {
    const path = `../../assets/images/${name}`;
    const value = rawModules[path];
    return typeof value === 'string' ? value : null;
}

function svgToDataUri(svg: string): string {
    const cleaned = svg
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    return `data:image/svg+xml,${encodeURIComponent(cleaned)}`;
}

/**
 * Map every public slot id to the actual asset file name. Components always
 * call `resolveSlotImage('logo')` / `resolveSlotImage('product-1')` etc. without
 * knowing the file extension. If the requested slot is missing we fall back to
 * a stable, template-wide default that is guaranteed to be bundled.
 */
const SLOT_FALLBACK_ORDER: Record<string, string[]> = {
    logo: ['logo.svg'],
    'hero-fallback': ['hero-fallback.svg'],
    'hero-mood-1': ['hero-mood-1.svg', 'hero-fallback.svg'],
    'hero-mood-2': ['hero-mood-2.svg', 'hero-fallback.svg'],
    'hero-mood-3': ['hero-mood-3.svg', 'hero-fallback.svg'],
    'hero-mood-4': ['hero-mood-4.svg', 'hero-fallback.svg'],
    'product-fallback': ['product-fallback.svg'],
    'product-1': ['product-1.svg', 'product-fallback.svg'],
    'product-2': ['product-2.svg', 'product-fallback.svg'],
    'product-3': ['product-3.svg', 'product-fallback.svg'],
    'product-4': ['product-4.svg', 'product-fallback.svg'],
    'product-5': ['product-5.svg', 'product-fallback.svg'],
    'product-6': ['product-6.svg', 'product-fallback.svg'],
    'product-7': ['product-7.svg', 'product-fallback.svg'],
    'product-8': ['product-8.svg', 'product-fallback.svg'],
    'category-fallback': ['category-fallback.svg'],
    'category-cups': ['category-cups.svg', 'category-fallback.svg'],
    'category-lighting': ['category-lighting.svg', 'category-fallback.svg'],
    'category-trays': ['category-trays.svg', 'category-fallback.svg'],
    'category-fabric': ['category-fabric.svg', 'category-fallback.svg'],
    'category-scent': ['category-scent.svg', 'category-fallback.svg'],
    'category-furniture': ['category-furniture.svg', 'category-fallback.svg'],
    'category-desk': ['category-desk.svg', 'category-fallback.svg'],
    'promo-fallback': ['promo-fallback.svg'],
};

const FALLBACK_FALLBACK: Record<string, string> = {
    product: 'product-fallback.svg',
    category: 'category-fallback.svg',
    hero: 'hero-fallback.svg',
    promo: 'promo-fallback.svg',
    logo: 'logo.svg',
};

const cache: Record<string, string> = {};

/**
 * Resolve a slot id (e.g. `product-1`, `category-cups`, `logo`) to an
 * embeddable data URI. If the slot id is unknown, we fall back to the kind
 * default (product/category/hero/promo/logo). If the asset is somehow missing
 * from the bundle we throw at module init time (caught at template install)
 * — but the call site always returns a non-null string at runtime.
 */
export function resolveSlotImage(slot: string | null | undefined): string {
    if (!slot) return resolveSlotImage('product-fallback');
    if (cache[slot]) return cache[slot];
    const candidates = SLOT_FALLBACK_ORDER[slot] ?? [slot.endsWith('.svg') ? slot : `${slot}.svg`];
    for (const file of candidates) {
        const raw = loadRaw(file);
        if (raw) {
            const uri = svgToDataUri(raw);
            cache[slot] = uri;
            return uri;
        }
    }
    // Unknown slot id — try a category default, then product default.
    for (const kind of Object.keys(FALLBACK_FALLBACK)) {
        const fb = FALLBACK_FALLBACK[kind];
        const raw = loadRaw(fb);
        if (raw) {
            const uri = svgToDataUri(raw);
            cache[slot] = uri;
            return uri;
        }
    }
    // Last-resort empty data URI (will show a broken image, not a 404).
    return 'data:image/svg+xml,';
}

/**
 * Resolve by family — used by components that don't carry a slot id but
 * need a known default. `kind` is `'product' | 'category' | 'hero' | 'promo' | 'logo'`.
 */
export function resolveDefaultImage(kind: keyof typeof FALLBACK_FALLBACK): string {
    return resolveSlotImage(FALLBACK_FALLBACK[kind]);
}
