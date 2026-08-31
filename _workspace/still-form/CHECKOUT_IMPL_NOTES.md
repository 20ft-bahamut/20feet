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

---

## BASE G7 COMMERCE FEATURE PARITY

Still Form은 Gnuboard 7 Ecommerce(sirsoft-ecommerce + sirsoft-basic) 기본 기능을
visual redesign한 Template이며, Core Commerce 기능을 대체하지 않는다.

- 기능 SSoT는 기본 Checkout(_checkout_*.json + CreateOrderRequest/UpdateCheckoutRequest 계약).
- Still Form은 UI/UX만 변경: 2-column 레이아웃, Order Summary 카드, Still Form 체크박스 등.
- 복원 내역/계약은 `_workspace/still-form/CHECKOUT_PARITY_MATRIX.md` 및
  `templates/_bundled/superbify-commerce_minimal/__tests__/components/CheckoutParity.test.tsx` 회귀 테스트가 잠근다.

복원된 기능(2026-08-31):
- 배송지 관리 모달(list·select·edit·delete·default) + 저장 배송지 pills + 주문자 정보와 동일 + 입력한 배송지를 저장합니다
- 국제배송 국가 선택 + intl 주소 필드(international_shipping_enabled 게이트) + PUT /checkout 배송비 재계산
- 주문쿠폰/배송비쿠폰/상품쿠폰(≤2)/쿠폰 다운로드 모달 + 적립금(마일리지) + additional_options 표시
- 결제수단 동적 렌더링(activ+iOS 게이트, core_payment_method 번역), dbank 실계좌 라디오 선택,
  vbank 브랜치, 환불계좌(all-or-none), 현금영수증(모듈 계약), PG pg_payment_handler 동적 dispatch,
  PG 실패 ?error= 배너, unavailable-items 배너 + CTA 차단
- 비회원/회원 완료 페이지 분기, 바로구매 direct_items, guest_order_form 토큰 초기화 + 회원 리다이렉트
