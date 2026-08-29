/**
 * Demo Asset Manifest
 *
 * Real product / editorial images bundled with the template. These resolve to
 * URLs served via the public template asset endpoint
 *   `/api/templates/superbify-commerce_minimal/images/demo/{file}`
 * (vite copies `public/images/demo/*` into `dist/images/demo/*`; the G7
 * TemplateAssetController allows `jpg|jpeg|png|webp|gif|svg` under
 * `dist/{path}`).
 *
 * Resolution precedence (used by imageSlots.ts):
 *   1. Server-provided `thumbnail_url` (DB-driven) — preferred when present.
 *   2. This manifest's product map (product_code → asset).
 *   3. Existing still-life fallback (bundled SVG).
 *
 * Mappings
 *   hero         1.jpg       — desk still-life (speckled mug + white cup + lamp)
 *   brand-story  brand-story.jpg (cropped from 2.png)
 *   editorial    editorial.jpg   (cropped from 8.png)
 *   promo        2.jpg       — living room
 *
 *   cups        → 3.jpg  (mug product cut)
 *   lighting    → 4.jpg  (lamp product cut)
 *   trays       → 5.jpg  (wooden tray product cut)
 *   fabric      → fabric.jpg  (linen + sofa from 2.png)
 *   scent       → 6.jpg  (reed diffuser product cut)
 *   furniture   → furniture.jpg (sideboard + lamp from 2.png)
 *   desk        → desk.jpg     (pen + book stand scene from 7.png)
 *
 *   STLMUG     → 3.jpg
 *   STLGLSCUP  → glass-cup.jpg (crop from 8.png)
 *   STLLAMP    → 4.jpg
 *   STLTRAY    → 5.jpg
 *   STLCUSH    → cushion.jpg   (crop from 2.png)
 *   STLDIFF    → 6.jpg
 *   STLPEN     → pen-stand.jpg (crop from 7.png)
 *   STLBOOK    → book-stand.jpg (crop from 7.png)
 *
 * If a future template buyer swaps in their own data, the existing
 * thumbnail_url flow wins and these manifests are bypassed.
 */

const ASSET_BASE = '/api/templates/assets/superbify-commerce_minimal/images/demo';

function url(filename: string): string {
    return `${ASSET_BASE}/${filename}`;
}

/** Editorial / hero / brand story placements. */
export const demoAssets = {
    hero: url('1.jpg'),
    heroDetail: url('hero-detail.jpg'),
    brandStory: url('brand-story.jpg'),
    editorial: url('editorial.jpg'),
    promo: url('2.jpg'),
    categories: {
        cups: url('3.jpg'),
        lighting: url('4.jpg'),
        trays: url('5.jpg'),
        fabric: url('fabric.jpg'),
        scent: url('6.jpg'),
        furniture: url('furniture.jpg'),
        desk: url('desk.jpg'),
    },
    products: {
        STLMUG: url('3.jpg'),
        STLGLSCUP: url('glass-cup.jpg'),
        STLLAMP: url('4.jpg'),
        STLTRAY: url('5.jpg'),
        STLCUSH: url('cushion.jpg'),
        STLDIFF: url('6.jpg'),
        STLPEN: url('pen-stand.jpg'),
        STLBOOK: url('book-stand.jpg'),
    },
} as const;

/**
 * Look up a demo product asset by product_code prefix (matches 8 demo fixtures).
 * Returns the asset URL or null if the code isn't a known demo product.
 */
export function resolveDemoProductAsset(productCode: string | null | undefined): string | null {
    if (!productCode) return null;
    const code = String(productCode).toUpperCase();
    if (code.startsWith('STLGLSCUP')) return demoAssets.products.STLGLSCUP;
    if (code.startsWith('STLMUG')) return demoAssets.products.STLMUG;
    if (code.startsWith('STLLAMP')) return demoAssets.products.STLLAMP;
    if (code.startsWith('STLTRAY')) return demoAssets.products.STLTRAY;
    if (code.startsWith('STLCUSH')) return demoAssets.products.STLCUSH;
    if (code.startsWith('STLDIFF')) return demoAssets.products.STLDIFF;
    if (code.startsWith('STLPEN')) return demoAssets.products.STLPEN;
    if (code.startsWith('STLBOOK')) return demoAssets.products.STLBOOK;
    return null;
}

/**
 * Look up a demo category asset by category slug or name. Used by
 * CategoryPreviewStrip / CategoryCard as a more reliable fallback than the
 * bundled SVG slots.
 */
export function resolveDemoCategoryAsset(slug: string | null | undefined, name?: string | null): string | null {
    const s = (slug ?? '').toLowerCase();
    const n = (name ?? '').toLowerCase();
    if (s === 'cups' || n === '컵' || n === 'cups') return demoAssets.categories.cups;
    if (s === 'lighting' || n === '조명' || n === 'lighting') return demoAssets.categories.lighting;
    if (s === 'trays' || n === '트레이' || n === 'trays') return demoAssets.categories.trays;
    if (s === 'fabric' || n === '패브릭' || n === 'fabric') return demoAssets.categories.fabric;
    if (s === 'scent' || n === '향' || n === 'scent') return demoAssets.categories.scent;
    if (s === 'furniture' || n === '소형 가구' || n === '소형가구' || n === 'furniture')
        return demoAssets.categories.furniture;
    if (s === 'desk' || n === '데스크' || n === 'desk') return demoAssets.categories.desk;
    return null;
}

export default demoAssets;
