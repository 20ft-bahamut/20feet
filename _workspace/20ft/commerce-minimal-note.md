# SuperBify Commerce Minimal — Implementation Note

**Template:** `templates/_bundled/superbify-commerce-minimal`
**Date:** 2026-08-27
**Status:** Implementation complete — REVIEW PENDING (no Visual PASS claimed)

## What was built

A minimal D2C commerce demo user template (G7) for the fictional store **Still Form**. Ships 9 routes, 1 base layout, 15 composite components, 26 basic HTML wrappers, 22 placeholder SVG assets, 8 demo SKUs and 7 demo categories as fixtures.

### Files created (count = 70)

- Root: `template.json`, `routes.json`, `components.json`, `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `.gitignore`
- `lang/`: `ko.json`, `en.json`
- `assets/images/`: `manifest.json` + 22 placeholder SVGs (logo, hero, 8 product, 5 category, promo)
- `layouts/`: `_user_base.json`, `home.json`, `cart.json`, `shop/{index,category,product,notice,story}.json`, `errors/{404,403,500}.json` (10 total)
- `src/`: `index.ts`, `test-setup.ts`, `vite-env.d.ts`, `styles/design-tokens.css`, `types/template.d.ts`
- `src/components/basic/index.tsx` (26 wrappers)
- `src/components/`: `Container.tsx`, `StoreHeader.tsx`, `StoreFooter.tsx`, `HeroBanner.tsx`, `PromoBanner.tsx`, `CategoryNav.tsx`, `CategoryCard.tsx`, `ProductCard.tsx`, `ProductGrid.tsx`, `ProductGallery.tsx`, `Price.tsx`, `Badge.tsx`, `RelatedProducts.tsx`, `BrandStorySection.tsx`, `EmptyState.tsx` (15 composite)
- `src/components/fixtures/`: `products.json` (8 SKUs), `categories.json` (7 cats)
- `__tests__/`: 6 component tests + 1 layout/guard test (32 assertions)

## Verified API field names (bound to components)

### `ProductListResource.php` (list endpoints)
Confirmed fields actually returned (used in `ProductItem` type and `ProductCard`):
- `id`, `name`, `name_localized`, `product_code`, `sku`
- `thumbnail_url` (nullable string from `getThumbnailUrl()`)
- `selling_price`, `selling_price_formatted`, `list_price`, `list_price_formatted`, `discount_rate`
- `sales_status` (enum value e.g. `ONSALE`), `sales_status_label`, `sales_status_variant`
- `primary_category` (localized string from `categories` relation)
- `review_count`, `rating_avg` (only when aggregates attached — MissingValue otherwise)
- `is_below_safe_stock`, `option_stock_sum`

### `PublicProductResource.php` (detail endpoint)
- All the above plus:
- `short_description`, `short_description_localized`, `description`, `description_localized`
- `images` (via `ProductImageResource::collection`)
- `categories[].name_localized`, `categories[].path`, `categories[].is_primary`
- `shipping_policy`, `is_shippable_to_selected_country`, `shipping_fee_formatted`
- `options`, `additional_options` (only when relation loaded)

ProductCard binds to `name_localized ?? name` and `selling_price_formatted ?? selling_price`; ProductGallery binds to `images`. Price binds to formatted + numeric price pair.

### `PublicCategoryResource.php` (list endpoint)
- `id`, `name`, `name_localized`, `slug`, `depth`, `parent_id`, `products_count`, `children` (recursive)

### `PublicCategoryDetailResource.php` (single endpoint)
- All of the above + `description`, `description_localized`, `breadcrumb`, `images[]`, `children` via `activeChildren`

CategoryCard binds to `name_localized ?? name`, `slug`, `products_count`. Home/shop layouts use the same.

## `_global.cartKey` mechanism (verified)

- `initCartKey` is a standard G7 handler (used by `sirsoft-basic` template via the engine).
- The base layout declares `globalHeaders` for `/api/modules/sirsoft-ecommerce/*` with `X-Cart-Key: {{_global.cartKey}}`.
- The header pattern matching is done in `resources/js/core/template-engine/LayoutLoader.ts` and `ActionDispatcher.ts` (line 3665+).
- The `_global.cartKey` is populated by `initCartKey` from localStorage (`g7_cart_key`) and re-issued by the server on first request via `POST /api/modules/sirsoft-ecommerce/cart/key` returning `X-Cart-Key` in response headers.
- Confirmed: the engine reads `_global.cartKey` via `G7Core.state.getGlobal()` at call time so re-issuance propagates without closure staleness.

## Image slot manifest (warm-neutral placeholders)

22 SVG placeholders under `assets/images/` covering:
- 1 logo
- 4 hero mood (1 referenced in HeroBanner, 1 in BrandStorySection, 1 in story page)
- 1 product fallback + 8 product (one per demo SKU)
- 1 category fallback + 5 category (cups, lighting, trays, fabric, scent)
- 1 promo fallback

All slot entries are documented in `assets/images/manifest.json` with `file` / `usage` / `status: "placeholder"`. None are real photographs — simple warm-paper blocks in `#FAF8F3`/`#F4F0E6`/`#C9B08D`/`#A8916F`. Replace by overwriting the file at the same slot id.

## Image resolution rule (no external URLs)

`ProductCard.resolveThumbnail()`:
- if `thumbnail_url` is a relative path → use it
- if `thumbnail_url` is an http(s) URL → ignore and resolve to `/assets/images/{thumbnail_slot}.svg`
- if no URL → resolve to `/assets/images/{thumbnail_slot}.svg` or `/assets/images/product-fallback.svg`

`ProductGallery.pickSrc()` follows the same pattern with `fallbackSlot` and `slot` overrides.

Layout guard test `__tests__/layouts/layout.test.tsx` walks every JSON under `layouts/` and asserts no `http(s)://` substring.

## Cart wiring (current)

- `layouts/_user_base.json` registers the `cart_count` data source (`/api/modules/sirsoft-ecommerce/cart/count`, `auth_mode: optional`, `initGlobal: { key: 'cartCount', path: 'count' }`).
- `StoreHeader` reads `cartCount` and renders the badge only when the number is defined.
- `layouts/cart.json` renders the `cart` data source with a friendly `EmptyState` when items are empty. **No fake totals, no fake actions.**

## Build / Type-check / Test results (verbatim short)

```
type-check: tsc --noEmit → clean
tests:     7 files, 32/32 passed
build:     dist/css/components.css 2.39 kB
           dist/js/components.iife.js 30.96 kB
```

## Deviations from approved architecture

1. **`hero-mood-4.svg` exists in assets but is not used by any layout** — generated as part of the manifest sweep; leaving it for future use. Slot id is reserved. (No layout references it.)
2. **`shop/product.json` has no Cart CTA / Add-to-Cart action** — the spec said "show Cart CTA only if a safe static action exists, otherwise omit". No safe static add-to-cart exists without a real product-options payload, so the CTA is intentionally omitted to avoid fake purchase. Honest note preserved.
3. **`related_products` data source on `shop/product.json` uses `categories[0]?.path?.[0]?.slug ?? categories[0]?.slug`** — verified shape of `categories_with_path` is `[{ id, path: [{id,slug,...}], path_string, is_primary }]`. Falls back to direct category slug if the path is unavailable. The endpoint may return empty if no category is associated, which will show an empty grid (correct behavior).
4. **The base layout declares only `globalHeaders` + `init_actions: [initCartKey]`** — no `init_actions: initTheme, setState(shopBase)` etc. because we don't need them for this minimal demo (no theme toggle, no shop base override).

## Remaining tasks (not done in this phase)

1. **Real product seeding** — fixtures are dev/test only (`isFixture: true` is filtered at runtime). Run ecommerce admin to create real products before the template shows data in production.
2. **Image replacement** — all 22 SVGs are warm-paper placeholders. Replace slot files with real photography at the same path.
3. **Runtime sync** — this template is `_bundled` only. When promoted to runtime, follow the standard `/twentyft-runtime-sync` flow. Do not edit `templates/twentyft-commerce-minimal/**` directly.
4. **i18n thumbnail slot** — the current `product-1..8` slot mapping in fixtures is Korean-name based. When the brand is replaced, update `thumbnail_slot` and the `__tests__/components/ProductCard.test.tsx` reference.
5. **Currency selector** — disabled in v1. Template advertises `multi_currency: false` in `template.json`. If re-enabled later, copy the currency init flow from `sirsoft-basic`.
6. **Reviews UI** — `product_reviews` data source is declared but the product layout does not render them. UI scaffold ready to add a `ProductReviews` composite in a follow-up.
7. **Search/filter on shop/index** — current shop/index renders a flat grid. Filters (`?category_slug=`, `?sort=`) can be wired by adding query-param handling.

## Reference paths (used during implementation)

- `modules/sirsoft-ecommerce/src/Http/Resources/ProductListResource.php` — list JSON contract
- `modules/sirsoft-ecommerce/src/Http/Resources/PublicProductResource.php` — detail JSON contract
- `modules/sirsoft-ecommerce/src/Http/Resources/PublicCategoryResource.php` — list categories
- `modules/sirsoft-ecommerce/src/Http/Resources/PublicCategoryDetailResource.php` — single category
- `modules/sirsoft-ecommerce/src/routes/api.php` — endpoint paths (`/products/new`, `/products/popular`, `/products/{product}`, `/products/{product}/reviews`, `/categories/{slug}`, `/cart`, `/cart/count`, `/cart/key`)
- `modules/sirsoft-ecommerce/src/Http/Requests/Public/PublicProductListRequest.php` — `category_slug` query param confirmed
- `docs/frontend/data-sources.md` (lines 340-440) — `auth_mode: optional` + `X-Cart-Key` header pattern + `globalHeaders` matching
- `docs/frontend/layout-json.md` (lines 350-460) — `globalHeaders` schema
- `templates/_bundled/twentyft-studio/src/index.ts` — auto-registration pattern (registry.register per component)
- `templates/_bundled/sirsoft-basic/layouts/_user_base.json` — `globalHeaders` for ecommerce + `initCartKey` + `cart_count` data source shape
- `templates/_bundled/twentyft-studio/src/styles/design-tokens.css` — token + breakpoint mechanism
