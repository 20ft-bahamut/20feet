import { resolveSlotImage } from './imageSlots';

// Deterministic still-life slot resolver.
// PRODUCT images are DB-driven: thumbnail_url / images[] come from the
// sirsoft-ecommerce product API. The still-life slots below are the NEUTRAL
// fallback for products that have zero DB images — they never replace a
// server-provided product image, and bundled demo JPGs are never used as
// product data.

const PRODUCT_CODE_PREFIX_TO_SLOT: Array<[RegExp, string]> = [
    [/^STLGLSCUP/i, 'product-2'], // 글라스 컵 MUST come before generic MUG
    [/^STLMUG/i, 'product-1'],
    [/^STLLAMP/i, 'product-3'],
    [/^STLTRAY/i, 'product-4'],
    [/^STLCUSH/i, 'product-5'],
    [/^STLDIFF/i, 'product-6'],
    [/^STLPEN/i, 'product-7'],
    [/^STLBOOK/i, 'product-8'],
];

export type SlotInput = {
    id?: number | string | null;
    product_code?: string | null;
    code?: string | null;
    thumbnail_slot?: string | null;
    thumbnail_url?: string | null;
    /** DB-provided image list (PublicProductResource). First entry feeds
     *  products whose `thumbnail_url` is null. */
    images?: Array<{ url?: string | null; download_url?: string | null } | undefined> | null;
    categories?: Array<{ id?: number; name?: string | { ko?: string } }>;
    categories_with_path?: Array<{ path?: Array<{ slug?: string }> }>;
};

/** A relative, same-origin URL is renderable; anything else (empty, http(s),
 *  data:) is not honoured as a product image src. */
function isSameOriginRelativeUrl(value: string | null | undefined): value is string {
    return !!value && value.startsWith('/') && !value.startsWith('//') && !/^https?:\/\//i.test(value);
}

/**
 * Pick a still-life slot for an item with no DB image. Order of precedence:
 *   1. Product code prefix (stable across reseeds of the demo seed data).
 *   2. Category id → slot.
 *   3. Category name → slot.
 *   4. Stable id-based fallback (id % 8 + 1) so items without a known prefix
 *      still get a deterministic slot instead of all-of-product-fallback.
 */
export function pickStillLifeSlot(input: SlotInput | null | undefined): string {
    if (!input) return 'product-1';

    const code = (input.product_code ?? input.code ?? '').toString();
    if (code) {
        for (const [pattern, slot] of PRODUCT_CODE_PREFIX_TO_SLOT) {
            if (pattern.test(code)) return slot;
        }
    }

    // Category id map (mirrored across components — keep in sync).
    const cats = input.categories;
    if (Array.isArray(cats) && cats.length > 0) {
        const id = Number(cats[0]?.id ?? 0);
        const SLOT_BY_ID: Record<number, string> = {
            1: 'product-1',
            2: 'product-2',
            3: 'product-3',
            4: 'product-4',
            5: 'product-5',
            6: 'product-6',
            7: 'product-7',
            8: 'product-8',
        };
        if (id > 0 && SLOT_BY_ID[id]) return SLOT_BY_ID[id];
        const name = cats[0]?.name;
        const nameStr = typeof name === 'string' ? name : (name as { ko?: string } | undefined)?.ko ?? '';
        const SLOT_BY_NAME: Record<string, string> = {
            '컵': 'product-1',
            '글라스': 'product-2',
            '조명': 'product-3',
            '트레이': 'product-4',
            '패브릭': 'product-5',
            '향': 'product-6',
            '데스크': 'product-7',
            '북': 'product-8',
            '가구': 'product-8',
            Cups: 'product-1',
            Glass: 'product-2',
            Trays: 'product-4',
            Lighting: 'product-3',
            Fabric: 'product-5',
            Scent: 'product-6',
            Desk: 'product-7',
            Books: 'product-8',
            Furniture: 'product-8',
        };
        if (nameStr && SLOT_BY_NAME[nameStr]) return SLOT_BY_NAME[nameStr];
    }

    // Stable id-based fallback (1..8 cycle).
    const idNum = Math.abs(Number(input.id ?? 0));
    if (idNum > 0) return `product-${(idNum % 8) + 1}`;
    return 'product-fallback';
}

/**
 * Resolve a product thumbnail source. DB is the only product image source:
 *   1. `thumbnail_url` (relative, same-origin)
 *   2. `images[0].download_url` / `images[0].url`
 *   3. Bundled neutral still-life SVG slot (honest empty state).
 * Bundled demo JPGs are never used as product data.
 */
export function resolveStillLifeThumb(input: SlotInput | null | undefined): { src: string; isFallback: boolean } {
    const t = (input?.thumbnail_url ?? '').toString();
    if (isSameOriginRelativeUrl(t)) {
        return { src: t, isFallback: false };
    }
    const firstImage = Array.isArray(input?.images) ? input.images[0] : undefined;
    const imgSrc = firstImage?.download_url ?? firstImage?.url ?? '';
    if (isSameOriginRelativeUrl(imgSrc)) {
        return { src: imgSrc, isFallback: false };
    }
    // External/missing URL → bundled slot rather than 404 or violating the
    // no-external-urls rule.
    const slot = pickStillLifeSlot(input);
    return { src: resolveSlotImage(slot), isFallback: true };
}