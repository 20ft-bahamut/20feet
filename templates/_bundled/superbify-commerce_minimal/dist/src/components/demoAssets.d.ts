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
 * Resolution precedence for PRODUCT images (stillLifeSlot.ts / ProductGallery):
 *   1. Server-provided `thumbnail_url` / `images[]` (DB-driven).
 *   2. Bundled neutral still-life SVG slot.
 * This manifest intentionally does NOT map product images — the DB is the
 * single image source for products. Hero/editorial/category surfaces below are
 * section media (brand storytelling), not product data.
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
 *   scent       → 6.jpg  (reed diffuser still)
 *   furniture   → furniture.jpg (sideboard + lamp from 2.png)
 *   desk        → desk.jpg     (pen + book stand scene from 7.png)
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
};
/**
 * Look up a demo category asset by category slug or name. Used by
 * CategoryPreviewStrip / CategoryCard as a more reliable fallback than the
 * bundled SVG slots.
 */
export declare function resolveDemoCategoryAsset(slug: string | null | undefined, name?: string | null): string | null;
export default demoAssets;
