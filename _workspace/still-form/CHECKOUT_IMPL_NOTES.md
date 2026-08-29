# Still Form Checkout Implementation Notes (compact)

## sirsoft-basic contract (source of truth)

Layouts studied: `templates/_bundled/sirsoft-basic/layouts/shop/checkout.json`, `order_complete.json`, `guest_order_form.json`, `guest_order_show.json`, `reorder.json`, and partials under `layouts/partials/shop/_checkout_*.json`.

Module contracts (verified against `modules/sirsoft-ecommerce/src/routes/api.php`, `Http/Controllers/Public/{CheckoutController,OrderController,EcommerceSettingsController}.php`):

- `GET /api/modules/sirsoft-ecommerce/checkout` — show temp order w/ shipping recalc. Query: `country_code`, `zipcode`, `region`. Response: `{ temp_order_id, calculation: { items, summary }, expires_at, unavailable_items, has_unshippable_items }`. 404 → `temp_order_not_found`.
- `POST /api/modules/sirsoft-ecommerce/checkout` — create temp order from `item_ids[]` (or `direct_items[]`). Needs `X-Cart-Key`.
- `PUT /api/modules/sirsoft-ecommerce/checkout` — re-calc after coupon / mileage / address change. Body: `{ item_coupons, order_coupon_issue_id, shipping_coupon_issue_id, use_points, country_code, zipcode }`.
- `GET /api/modules/sirsoft-ecommerce/settings/shipping` → `{ shipping: { default_country, available_countries[], international_shipping_enabled, free_shipping_threshold, ... } }`.
- `GET /api/modules/sirsoft-ecommerce/settings/payment` → `{ order_settings: { payment_methods[], bank_accounts[], banks[], auto_cancel_days } }`. `payment_methods[].id` is `card|vbank|dbank|bank|phone|point|deposit|free`. `is_active` controls render. `_cached_name._localized`, `_cached_icon`, `needs_pg` per method.
- `POST /api/modules/sirsoft-ecommerce/user/orders` — member/guest shared. Body includes `temp_order_id`, `orderer`, `shipping`, `payment_method` (core id, e.g. `dbank`), `shipping_memo`, `depositor_name`, `dbank:{bank_code, account_number, account_holder}`, `expected_total_amount`, `save_shipping_address`, `guest_lookup_password`/`guest_lookup_password_confirmation` (guest only). Headers: `X-Cart-Key`. Response: `{ order: { order_number, ... }, requires_pg_payment, pg_payment_handler, pg_payment_data, redirect_url }`. Guest verify follow-up: `POST /api/modules/sirsoft-ecommerce/guest/orders/verify` (order_number + orderer_phone + guest_lookup_password).
- `POST /api/modules/sirsoft-ecommerce/guest/orders/verify` — returns `{ guest_order_token, expires_at, order: { order_number, order_status } }`. Used by both guest_order_form and after non-PG guest order creation.
- `GET /api/modules/sirsoft-ecommerce/user/orders/{orderNumber}` — member/guest shared. Guest requires `X-Guest-Order-Token` header.

## Runtime reality check

Live runtime (127.0.0.1:8000, module v1.1.2):
- Only `dbank` (무통장입금) is `is_active=true`. `card`, `vbank`, etc. are inactive.
- Only `KR` shipping country active.
- `bank_accounts` all `is_active=false` — there is no real active bank account to deposit into; dbank payment is essentially "selectable but cannot complete" without admin config.
- Shipping `default_country=KR`. No intl shipping.

This means a real checkout flow with dbank will **place a temp order** but the underlying PG/bank path is not configured. Result: a successful POST `/user/orders` returns an order_number (this path is tested below) and `requires_pg_payment=false` (dbank path), then `redirect_url` typically points to `/shop/orders/{orderNumber}/complete`.

## Decisions for Still Form

- Render all `is_active` payment methods from settings (no hardcoded list). Empty list → honest "no payment methods configured" state.
- KR-only address fields (international_country branches omitted; we don't lie about intl flow).
- DBank block: depositor name input only when `dbank` is selected. Refund bank / cash receipt / item coupons: omit for v1 (they are member-auth or PG-extension features we don't need to demo here).
- Guest flow: render guest_order_form + guest_order_show. Mounted under `/shop/guest/orders` and `/shop/guest/orders/:orderNumber` mirrors.
- Order complete: full /shop/order/complete using sirsoft-basic's `orderData` GET, with guest token fallback.
- Coupon / mileage blocks: omitted from Still Form v1 checkout. Server still accepts them if shipped later.

## File plan (still-form)

- `layouts/shop/checkout.json` — replace placeholder with real 2-column form + summary.
- `layouts/shop/order_complete.json` — new.
- `layouts/shop/guest_order_form.json` — new.
- `layouts/shop/guest_order_show.json` — new.
- `routes.json` — add `/shop/order/complete`, `/shop/guest/orders`, `/shop/guest/orders/:orderNumber`.
- `lang/ko.json` + `lang/en.json` — checkout / order_complete / guest_order_form / guest_order_show strings.
- `src/index.ts` — register any new composites (none required if all are inline JSON primitives).
- `__tests__/layouts/layout.test.tsx` — update checkout assertions to reflect new shape (real endpoints, no placeholder).

## Verification plan

- npm run type-check
- npm test -- --run
- npm run build
- template:update --force
- refresh-layout + cache-clear
- Playwright headless: 2 items in cart → /cart → checkout → fill form → POST → capture status + body → result page screenshot.
