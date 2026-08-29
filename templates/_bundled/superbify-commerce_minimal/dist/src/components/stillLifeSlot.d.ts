export type SlotInput = {
    id?: number | string | null;
    product_code?: string | null;
    code?: string | null;
    thumbnail_slot?: string | null;
    thumbnail_url?: string | null;
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
 * Pick a still-life slot for a demo item. Order of precedence:
 *   1. Explicit thumbnail_slot (only honored when it matches the expected slot
 *      for the item; otherwise we ignore it so a stale slot field can't flip
 *      the icon between pages).
 *   2. Product code prefix (the source of truth for the demo fixture).
 *   3. Category id → slot.
 *   4. Category name → slot.
 *   5. Stable id-based fallback (id % 8 + 1) so newly seeded items still get
 *      a deterministic slot instead of all-of-product-fallback.
 */
export declare function pickStillLifeSlot(input: SlotInput | null | undefined): string;
/** Resolve a thumbnail source for a demo item, honouring server-provided URLs. */
export declare function resolveStillLifeThumb(input: SlotInput | null | undefined): {
    src: string;
    isFallback: boolean;
};
