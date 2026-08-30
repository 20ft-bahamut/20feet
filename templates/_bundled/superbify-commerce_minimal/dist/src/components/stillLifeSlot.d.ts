export type SlotInput = {
    id?: number | string | null;
    product_code?: string | null;
    code?: string | null;
    thumbnail_slot?: string | null;
    thumbnail_url?: string | null;
    /** DB-provided image list (PublicProductResource). First entry feeds
     *  products whose `thumbnail_url` is null. */
    images?: Array<{
        url?: string | null;
        download_url?: string | null;
    } | undefined> | null;
    categories?: Array<{
        id?: number;
        name?: string | {
            ko?: string;
        };
    }>;
    categories_with_path?: Array<{
        path?: Array<{
            slug?: string;
        }>;
    }>;
};
/**
 * Pick a still-life slot for an item with no DB image. Order of precedence:
 *   1. Product code prefix (stable across reseeds of the demo seed data).
 *   2. Category id → slot.
 *   3. Category name → slot.
 *   4. Stable id-based fallback (id % 8 + 1) so items without a known prefix
 *      still get a deterministic slot instead of all-of-product-fallback.
 */
export declare function pickStillLifeSlot(input: SlotInput | null | undefined): string;
/**
 * Resolve a product thumbnail source. DB is the only product image source:
 *   1. `thumbnail_url` (relative, same-origin)
 *   2. `images[0].download_url` / `images[0].url`
 *   3. Bundled neutral still-life SVG slot (honest empty state).
 * Bundled demo JPGs are never used as product data.
 */
export declare function resolveStillLifeThumb(input: SlotInput | null | undefined): {
    src: string;
    isFallback: boolean;
};
