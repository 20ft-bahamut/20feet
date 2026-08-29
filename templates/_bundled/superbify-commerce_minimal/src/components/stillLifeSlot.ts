import { resolveSlotImage } from './imageSlots';
import { resolveDemoProductAsset } from './demoAssets';

// Deterministic still-life slot resolver.
// Each demo product has a unique still-life so the SAME product never flips
// between icons across ProductCard, ProductGallery, CartItemRow.
//
// Demo product inventory (queried from the sirsoft-ecommerce sample seed):
//   id=1  STLMUG0001AB12CD  머그 (mug with handle)              -> product-1
//   id=2  STLGLSCUP0002XY   글라스 컵 (no handle, clear)        -> product-2
//   id=3  STLLAMP0003PQR7   테이블 램프 (dome + stem + base)    -> product-3
//   id=4  STLTRAY0004WXYZ   우드 트레이 (oval tray)             -> product-4
//   id=5  STLCUSH0005AB45   쿠션 커버 (cushion with seam)       -> product-5
//   id=6  STLDIFF0006MN12   리드 디퓨저 (bottle + reed sticks)   -> product-6
//   id=7  STLPEN0000007QR   펜 스탠드 (cylinder pen cup)        -> product-7
//   id=8  STLBOOK000008XY   북 스탠드 (L-shape + book stack)    -> product-8
//
// The product-code prefix is preserved as a stable lookup so even if the
// backend reseeds with different IDs the mapping stays correct.

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
    categories?: Array<{ id?: number; name?: string | { ko?: string } }>;
    categories_with_path?: Array<{ path?: Array<{ slug?: string }> }>;
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

/** Resolve a thumbnail source for a demo item, honouring server-provided URLs. */
export function resolveStillLifeThumb(input: SlotInput | null | undefined): { src: string; isFallback: boolean } {
    const t = (input?.thumbnail_url ?? '').toString();
    if (t && t.startsWith('/') && !/^https?:\/\//.test(t)) {
        return { src: t, isFallback: false };
    }
    // Real bundled demo photo (preferred over placeholder SVG).
    const code = (input?.product_code ?? input?.code ?? '').toString();
    const demoSrc = resolveDemoProductAsset(code);
    if (demoSrc) return { src: demoSrc, isFallback: false };
    // External URL → fall back to a bundled slot rather than 404 or violating
    // the no-external-urls rule.
    const slot = pickStillLifeSlot(input);
    return { src: resolveSlotImage(slot), isFallback: true };
}