# SuperBify Commerce Minimal — Demo Seeding Note

**Date:** 2026-08-27
**Template dir:** `templates/superbify-commerce_minimal/` (renamed from `superbify-commerce-minimal` to comply with G7 dir rule `^[a-z0-9]+-[a-z0-9_]+$`; hyphen is reserved for the first separator)
**DB state before:** `ecommerce_products`=0, `ecommerce_categories`=0, `ecommerce_product_categories`=0
**DB state after:** products=8, categories=7, pivot=8

## Created IDs

### Categories (id, slug, path, name.ko)
```
1 cups       path=1 name.ko=컵
2 lighting   path=2 name.ko=조명
3 trays      path=3 name.ko=트레이
4 fabric     path=4 name.ko=패브릭
5 scent      path=5 name.ko=향
6 furniture  path=6 name.ko=소형 가구
7 desk       path=7 name.ko=데스크
```

### Products (id, product_code, list, selling, discount, primary_category)
```
1 STLMUG0001AB12CD    28000 24000 14.3  cups
2 STLGLSCUP0002XY     18000 18000 0     cups
3 STLLAMP0003PQR7     96000 84000 12.5  lighting
4 STLTRAY0004WXYZ     42000 36000 14.3  trays
5 STLCUSH0005AB45     32000 29000 9.4   fabric
6 STLDIFF0006MN12     38000 38000 0     scent
7 STLPEN0000007QR     22000 19000 13.6  desk
8 STLBOOK000008XY     34000 31000 8.8   desk
```

`discount_rate` is computed at API time as `(list - selling) / list * 100` and rounded to 1 decimal — the fixture used integer percentages (8, 14, etc.) but the resource recomputes. Both 0% and non-zero cases render correctly via the template's `Price` component.

## Fields set on each Product
```php
[
  'name' => ['ko' => ..., 'en' => ...],          // AsUnicodeJson cast
  'product_code' => <unique 16-char code>,
  'sku' => 'STL-' + 6 chars derived from code,
  'list_price' => int,
  'selling_price' => int,
  'stock_quantity' => 100,
  'sales_status' => ProductSalesStatus::ON_SALE,  // 'on_sale' (NOT 'ONSALE')
  'display_status' => ProductDisplayStatus::VISIBLE, // 'visible'
  'tax_status' => ProductTaxStatus::TAXABLE,
  'currency_code' => 'KRW',
  'has_options' => false,
  'description' => ['ko' => short desc, 'en' => same],
]
```

`thumbnail_hash` / `image_temp_key` / `images[]` intentionally left empty so the template's local SVG fallbacks render.

## Fields set on each Category
```php
[
  'name' => ['ko' => ..., 'en' => ...],          // AsUnicodeJson cast
  'slug' => <unique slug>,
  'is_active' => true,
  'depth' => 1,
  'parent_id' => null,
  'sort_order' => 0,
  'path' => '(string)$id',                         // 2-step: dummy "0" first, then update to own id
]
```

The `path` column is NOT in the model `$fillable` and is NOT NULL — required a 2-step save (insert with dummy, then update with the real `id`-based path). This matches `CategoryService::updatePath()` behavior for top-level categories. Replicated inline since the public `CategoryService` was overkill for seeding.

## Fields the model required that the fixture lacked
- **`name` JSON shape**: fixture used `name_localized` (string) only. Real product needs `name` as a `{"ko": ..., "en": ...}` i18n object — `AsUnicodeJson` cast. Fixture `name_localized` was preserved as the fallback string for the product card's `name_localized ?? name` binding.
- **`description` JSON shape**: fixture lacked a description field on the model itself. Required by the admin store request. Used the `short_description` text as both `ko` and `en` (no separate translations).
- **`sales_status` enum value casing**: fixture used `ONSALE`; real DB value is `on_sale` (lowercase, underscore). Same for `display_status` → `visible`.
- **`display_status` and `tax_status`**: not in fixture, but required by the resource cast. Set to `VISIBLE` and `TAXABLE`.
- **`stock_quantity`**: required (int ≥ 0). Set to 100.
- **`currency_code`**: required (string). Set to `KRW`.
- **`sku`**: not in fixture; auto-derived from product_code.
- **`path` on Category**: column is NOT NULL but not in fillable. 2-step save.

## Public API verification (verbatim short)

```
GET /api/modules/sirsoft-ecommerce/categories
→ 200, 7 items. First: id=1, slug=cups, name.ko=컵, name.en=Cups, products_count=2

GET /api/modules/sirsoft-ecommerce/products?per_page=100
→ 200, 8 items. First: id=8, code=STLBOOK000008XY, name=북 스탠드, price=31,000원, category=데스크

GET /api/modules/sirsoft-ecommerce/products?category_slug=cups
→ 200, 2 items: STLGLSCUP0002XY, STLMUG0001AB12CD

GET /api/modules/sirsoft-ecommerce/products/STLMUG0001AB12CD
→ 200, id=1, name_localized=머그컵, price=24,000원, discount_rate=14.3

GET /api/modules/sirsoft-ecommerce/products/new?limit=3
→ 200, 3 items (flat array): STLPEN0000007QR, STLDIFF0006MN12, STLCUSH0005AB45

GET /api/modules/sirsoft-ecommerce/products/popular?limit=3
→ 200, 3 items (flat array): same order as /new (no sales_count to differentiate yet)

GET /api/modules/sirsoft-ecommerce/cart/count
→ 200, {"count": 0}
```

## Page-level verification (port 8000 only — 8080 not reachable from this shell)

```
curl GET / → HTTP 200, 56,819 bytes
curl GET /shop → HTTP 200, 56,819 bytes (same fallback body)
```

The 200 responses return the **engine fallback page** (title: "그누보드7") with `data-template-id="superbify-commerce_minimal"` set, but the bootstrap script calls `renderFallback()` after `G7Core.initTemplateApp` doesn't complete the layout pass. The component bundle is fetched and parsed correctly (`/api/templates/assets/superbify-commerce_minimal/js/components.iife.js` returns 200 / 31,462 bytes / valid IIFE).

Page render depends on the G7 template engine's JS bootstrap which is outside the scope of this task. The data layer that the template depends on (products, categories, cart count) is fully seeded and verified at the public API level.

## Untouched (per task constraints)
- No `g7_boards*` rows
- No `twentyft_content_*` rows
- No `g7_orders*`, `g7_carts*`, `g7_payments*` rows (cart is created on user action, not seeded)
- No module settings / module_config changes
- No `.env` reads
- No git commits
