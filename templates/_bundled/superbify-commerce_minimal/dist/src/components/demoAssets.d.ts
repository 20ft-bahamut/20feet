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
/** Editorial / hero / brand story placements. */
export declare const demoAssets: {
    readonly hero: string;
    readonly heroDetail: string;
    readonly brandStory: string;
    readonly editorial: string;
    readonly promo: string;
    readonly categories: {
        readonly cups: string;
        readonly lighting: string;
        readonly trays: string;
        readonly fabric: string;
        readonly scent: string;
        readonly furniture: string;
        readonly desk: string;
    };
    readonly products: {
        readonly STLMUG: string;
        readonly STLGLSCUP: string;
        readonly STLLAMP: string;
        readonly STLTRAY: string;
        readonly STLCUSH: string;
        readonly STLDIFF: string;
        readonly STLPEN: string;
        readonly STLBOOK: string;
    };
};
/**
 * Look up a demo product asset by product_code prefix (matches 8 demo fixtures).
 * Returns the asset URL or null if the code isn't a known demo product.
 */
export declare function resolveDemoProductAsset(productCode: string | null | undefined): string | null;
/**
 * Look up a demo category asset by category slug or name. Used by
 * CategoryPreviewStrip / CategoryCard as a more reliable fallback than the
 * bundled SVG slots.
 */
export declare function resolveDemoCategoryAsset(slug: string | null | undefined, name?: string | null): string | null;
export default demoAssets;
