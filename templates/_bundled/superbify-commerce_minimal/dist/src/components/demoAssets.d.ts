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
 *
 * Seed-2nd (inventory only, not rendered):
 *   products.bookStand { lifestyle: seed2/1.jpg, detail: seed2/2.jpg }
 *   products.mug.lifestyle        seed2/3.jpg
 *   products.lamp.lifestyle       seed2/4.jpg
 *   products.diffuser.lifestyle   seed2/5.jpg
 *   products.fabric.lifestyle     seed2/6.jpg
 *   products.furniture.lifestyle  seed2/7.jpg
 *   lifestyle.wide / alternate    seed2/8.jpg
 *
 * Brand marks live in `brandAssets` (`images/brand/*.png`, alpha preserved).
 */
/**
 * Still Form brand marks (PNG with alpha, copied unchanged from
 * `docs/template_brand/`). Kept as PNG — the logo lockups need alpha over the
 * paper background; the G7 template asset whitelist allows `png`.
 *
 * Measured ink bounding boxes (alpha > 8, canvas 1254x1254):
 *   wordmark  ink x124-1136 y512-733 (1013x222, aspect 4.563)
 *   primary   ink x121-1141 y486-741 (1021x256, aspect 3.988)
 *   emblem    ink x294-958  y126-1114 (665x989, aspect 0.672)
 * Components should size by INK height and compensate the transparent padding
 * (see `brandLogoInk` / StoreHeader) instead of using the square canvas box.
 */
export declare const brandAssets: {
    /** Boxed SF emblem + wordmark + dashed tagline — decorative stamp use. */
    readonly emblem: string;
    /** SF monogram box + "Still Form" + tagline — compact lockup. */
    readonly primary: string;
    /** SF monogram + divider + wordmark + tagline — header/footer lockup. */
    readonly wordmark: string;
};
/** Ink metrics (px in the 1254x1254 source canvas) for padding-compensated sizing. */
export declare const brandLogoInk: Record<keyof typeof brandAssets, {
    x: number;
    y: number;
    w: number;
    h: number;
    canvas: number;
}>;
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
    /**
     * Seed-2nd extended mapping — inventory only, NOT rendered yet.
     *   1.png book stand in use on desk (mug + tray)       1448x1086
     *   2.png book stand rear / folding mechanism close-up 1254x1254
     *   3.png mug on wood tray, linen table                1448x1086
     *   4.png mushroom lamp lit on nightstand (bed)        1448x1086
     *   5.png reed diffuser close-up on travertine tray    1254x1254
     *   6.png linen cushions on sofa                       1448x1086
     *   7.png oak side table / stool with shelf            1448x1086
     *   8.png wide table vignette (lamp + mug + diffuser…) 1672x941
     */
    readonly products: {
        readonly bookStand: {
            readonly lifestyle: string;
            readonly detail: string;
        };
        readonly mug: {
            readonly lifestyle: string;
        };
        readonly lamp: {
            readonly lifestyle: string;
        };
        readonly diffuser: {
            readonly lifestyle: string;
        };
        readonly fabric: {
            readonly lifestyle: string;
        };
        readonly furniture: {
            readonly lifestyle: string;
        };
    };
    readonly lifestyle: {
        readonly wide: string;
        /** Editorial alternate — same frame as lifestyle.wide. */
        readonly alternate: string;
    };
};
/**
 * Look up a demo category asset by category slug or name. Used by
 * CategoryPreviewStrip / CategoryCard as a more reliable fallback than the
 * bundled SVG slots.
 */
export declare function resolveDemoCategoryAsset(slug: string | null | undefined, name?: string | null): string | null;
export default demoAssets;
