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

const ASSET_BASE = '/api/templates/assets/superbify-commerce_minimal?file=images/demo';
const BRAND_ASSET_BASE = '/api/templates/assets/superbify-commerce_minimal?file=images/brand';

function url(filename: string): string {
    return `${ASSET_BASE}/${filename}`;
}

function brandUrl(filename: string): string {
    return `${BRAND_ASSET_BASE}/${filename}`;
}

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
export const brandAssets = {
    /** Boxed SF emblem + wordmark + dashed tagline — decorative stamp use. */
    emblem: brandUrl('still-form-logo-emblem.png'),
    /** SF monogram box + "Still Form" + tagline — compact lockup. */
    primary: brandUrl('still-form-logo-primary.png'),
    /** SF monogram + divider + wordmark + tagline — header/footer lockup. */
    wordmark: brandUrl('still-form-logo-wordmark.png'),
} as const;

/** Ink metrics (px in the 1254x1254 source canvas) for padding-compensated sizing. */
export const brandLogoInk: Record<keyof typeof brandAssets, { x: number; y: number; w: number; h: number; canvas: number }> = {
    wordmark: { x: 124, y: 512, w: 1013, h: 222, canvas: 1254 },
    primary: { x: 121, y: 486, w: 1021, h: 256, canvas: 1254 },
    emblem: { x: 294, y: 126, w: 665, h: 989, canvas: 1254 },
};

/** Seed-2nd photography (docs/template_seed_2nd/1-8.png → q:v 3 JPEG). */
const seed2Url = (n: number | string): string => url(`seed2/${n}.jpg`);

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
    products: {
        bookStand: { lifestyle: seed2Url(1), detail: seed2Url(2) },
        mug: { lifestyle: seed2Url(3) },
        lamp: { lifestyle: seed2Url(4) },
        diffuser: { lifestyle: seed2Url(5) },
        fabric: { lifestyle: seed2Url(6) },
        furniture: { lifestyle: seed2Url(7) },
    },
    lifestyle: {
        wide: seed2Url(8),
        /** Editorial alternate — same frame as lifestyle.wide. */
        alternate: seed2Url(8),
    },
} as const;

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
