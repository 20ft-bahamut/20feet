# ECOMMERCE_FEATURE_INVENTORY (source-based, auto-extracted 2026-08-31)


## basic-template-surface

> notes: DEFAULT TEMPLATE = templates/_bundled/sirsoft-basic. Domain = public ecommerce feature surface for parity matrix. NO modifications made (read-only).

EVIDENCE CONVENTIONS
- _purchase_card.json = option selector + multi-option + additional option (D2/D10) + stock_quantity-bound QuantitySelector + buy_now/add_to_cart buttons (validation guards additional_option_required + custom_text_required).
- _header.json = wishlist heart + wishlist toggle (member only, login_required_modal for guest).
- _tab_qna.json = product inquiry list with login-gated write modal; tab hidden when modules['sirsoft-ecommerce'].inquiry.board_slug empty.
- _tab_reviews.json = rating/stats/filter UI; NO inline write — write only via mypage orders modal.
- _checkout_discount.json = order_coupon_issue_id + shipping_coupon_issue_id + discount_code (member-only card, _global.currentUser?.uuid guard).
- _checkout_mileage.json = use_points input + mileage_use_all + mileage_apply, mileage.enabled gate.
- _checkout_shipping.json = saved-address chips (member) + same_as_orderer checkbox + daum_postcode slot (KR) + intl address_line_1/2+city/state/postal (non-KR) + refund-bank-free + save_shipping_address checkbox (member+no selected).
- _checkout_payment.json = dynamic payment method cards (paymentSettings.data.order_settings.payment_methods) + card info notice + vbank refund_bank + dbank bank_accounts picker + depositor_name + shop_checkout_cash_receipt extension slot + auto_cancel_days vbank/dbank due notice.
- _checkout_summary.json = tax breakdown, discount breakdown, shipping breakdown, points_used, points_earning, final_amount; Pay button body uses _computed.selectedCorePaymentMethod (plugin→core), dbank object, refund_bank, guest_lookup_password+confirmation, save_shipping_address, ...(_local.checkoutExtraPayload); onSuccess dispatches response.data.pg_payment_handler OR non-PG guest verify.
- cart items = select-all + per-item checkbox + quantity selector + option change modal + delete confirm + unavailable modal (cart_unavailable_modal).
- guest_order_form = order_number + orderer_phone + guest_lookup_password → POST /api/.../guest/orders/verify → saveGuestOrderToken handler → navigate to /shop/guest/orders/{n}; logged-in users redirected to /mypage/orders.
- mypage/addresses = list + add/edit modal (label, country, recipient, phone, daum-postcode search slot for KR, intl fields for non-KR, is_default) + 409 → confirmOverwrite modal + confirmDelete.
- mypage/wishlist = 5-col ProductCard grid + remove heart + pagination.
- mypage/inquiries = reuses _modal_qna_write.json + _modal_inquiry_delete.json; 404 if inquiry_available false.
- reorder.json = POST /api/.../user/orders/{id}/reorder.
- mypage/orders/_modal_write_review.json = star picker + content + FileUploader (autoUpload:false) + submitReview handler (member-gated by item.can_write_review).
- stock display = ONLY status banner (sold_out/suspended/coming_soon) + min/max qty notice on detail. NO numeric stock count on detail page itself (cart item shows insufficient_stock text; cart_option_change modal shows stock_count|count when <=10). Confirmed by absence of `stock_quantity` text rendering in _purchase_card.json / _header.json / _info_summary.json — stock_quantity only used as QuantitySelector max.

VERIFIED ABSENT IN DEFAULT TEMPLATE
- Inline "write review" CTA on product detail (REVIEW-002) — only accessible from mypage orders.
- Numeric stock display on product detail (STOCK-001 limited to status + qty limits).
- Discount code input is non-functional for guests (CHK-003 requires currentUser?.uuid).
- Multi-currency display exists on cart, checkout, detail (multi_currency_selling_price/list_price/total).

CONFIG / KEYS
- modules['sirsoft-ecommerce'].inquiry.board_slug (gates QnA tab + mypage/inquiries)
- modules['sirsoft-ecommerce'].shipping.international_shipping_enabled (gates intl address UI)
- modules['sirsoft-ecommerce'].shipping.available_countries (Select options)
- modules['sirsoft-ecommerce'].shipping.default_country (init fallback)
- paymentSettings.data.order_settings.payment_methods[].{id,is_active,requires_ios,_cached_brand_mark,_cached_icon,_cached_name,core_payment_method}
- paymentSettings.data.order_settings.banks[].{code,name}
- paymentSettings.data.order_settings.bank_accounts[].{bank_code,account_number,account_holder,is_active}
- paymentSettings.data.order_settings.auto_cancel_days (vbank/dbank due)
- checkoutData.data.mileage.{enabled,usable,available,max_usable}
- reviewSettings.data.review_settings.{max_images,max_image_size_mb}

HANDLERS used: loadFromLocalStorage, closeModal, setState, saveToLocalStorage, initCartKey, showErrorPage, openModal, navigate, refetchDataSource, updateDataSource, toast, suppress, replaceUrl, apiCall, conditions, sequence, selectAllCartItems, toggleCartItemSelection, initCartOptionSelection, saveGuestOrderToken, clearGuestTokenOnEntry, sirsoft-basic.{addSelectedItemIfComplete,updateNoOptionQuantity,setBlockAdditionalOption,updateSelectedItemQuantity,removeSelectedItem}, sirsoft-ecommerce.submitReview, $localized.

BLOCKER: none.

### WISH-001 — Wishlist toggle on product detail (heart icon)
- domain: product-detail
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/detail/_header.json:83-183
- adminUI: NONE
- publicUI: layouts/shop/show.json (loads product) → partials/shop/detail/_header.json wishlist heart button
- api: GET /api/modules/sirsoft-ecommerce/products/{product_code} (with is_wishlisted, stock_quantity, has_options, option_groups, additional_options)
- auth: required (auth_mode: required for toggle, login_required modal for guest)
- config: NONE
- external: NONE
- dataMutation: NONE (read-only product display)
- defaultTemplate: Wishlist toggle button (heart icon) + call to /api/modules/sirsoft-ecommerce/wishlist/toggle POST
- stillForm: heart icon button + conditional openModal('login_required_modal') for guests

### QNA-001 — Product inquiry (Q&A tab) with write modal
- domain: product-detail
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/detail/_tab_qna.json:60-80; /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/detail/_modal_qna_write.json:300-330
- adminUI: NONE
- publicUI: layouts/shop/show.json:182-217 (qna data source) → partials/shop/detail/_tab_qna.json (list + write button) → _modal_qna_write.json (form)
- api: GET /api/modules/sirsoft-ecommerce/products/{product_code}/inquiries (qna data source)
- auth: required (login required check inside write button)
- config: _global.modules['sirsoft-ecommerce'].inquiry.board_slug must be set (otherwise tab hidden)
- external: board plugin (inquiry board_slug)
- dataMutation: product_inquiry inserts via plugin board (sirsoft-ecommerce inquiry board_slug)
- defaultTemplate: Qna tab (게시판 모듈 연동) + qna write modal (비회원 차단)
- stillForm: tab nav badge, write button, modal form POSTs /api/.../user/inquiries/{id} (edit) or /api/.../products/{id}/inquiries (create)

### REVIEW-001 — Product review list (rating/stats/filters) — write only via mypage orders modal
- domain: product-detail
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/detail/_tab_reviews.json:1-180
- adminUI: NONE
- publicUI: layouts/shop/show.json:146-180 (reviews data source) → partials/shop/detail/_tab_reviews.json
- api: GET /api/modules/sirsoft-ecommerce/products/{product_code}/reviews (with rating_stats, option_filters, photo_only, sort)
- auth: optional (read) / required (write)
- config: NONE
- external: NONE
- dataMutation: Reviews are written by completed-order flow (sirsoft-ecommerce.submitReview handler in _modal_write_review.json)
- defaultTemplate: Reviews tab with rating stats, photo filter, rating filter, option filter, pagination
- stillForm: tab nav badge, rating avg + count, 5-star bars, option filter select, rating filter, photo_only toggle, pagination

### REVIEW-002 — Inline review write button on product detail page — ABSENT
- domain: product-detail
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/detail/_tab_reviews.json (whole file — no write action)
- adminUI: NONE
- publicUI: layouts/shop/show.json + _tab_reviews.json — no write-review CTA inside product detail
- api: GET /api/modules/sirsoft-ecommerce/products/{product_code} (no inline write)
- auth: required (write)
- config: NONE
- external: NONE
- dataMutation: POST /api/modules/sirsoft-ecommerce/wishlist (toggle) from product header only
- defaultTemplate: Heart icon on detail, no inline "write review" button on detail page (write only from mypage orders)
- stillForm: none — review submission is only reachable from partials/mypage/orders/_modal_write_review.json (order-detail scope)

### OPT-001 — Multi-option selector (sequential, group-by-group)
- domain: product-detail
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/detail/_purchase_card.json:37-109
- adminUI: NONE
- publicUI: layouts/shop/show.json:8 (computed optionChoices with soldOut detection) → partials/shop/detail/_purchase_card.json:37-108
- api: GET /api/modules/sirsoft-ecommerce/products/{code} (option_groups, options, additional_options)
- auth: no (read)
- config: NONE
- external: NONE
- dataMutation: NONE (read-only)
- defaultTemplate: Multi-step Select widget per option group, sequential selection required (groupIndex > 0 disabled until prior selected)
- stillForm: Select widget with disabled cascading; soldOut suffix; select_upper_option_first placeholder

### OPT-002 — Additional option selector (per selected option) with custom text
- domain: product-detail
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/detail/_purchase_card.json:232-329
- adminUI: NONE
- publicUI: layouts/shop/show.json + partials/shop/detail/_purchase_card.json:232-329
- api: GET /api/modules/sirsoft-ecommerce/products/{code} (additional_options array)
- auth: no (read)
- config: NONE
- external: NONE
- dataMutation: NONE (added to cart via items[].additional_option_selections payload)
- defaultTemplate: Per-block (per selected option) Select for each additional_options group, with allow_custom_text text input
- stillForm: add_option Select (price adjustment inline), allow_custom_text Input, is_required marker (*)

### PRICE-001 — Option price display (sale/list/discount) on detail
- domain: product-detail
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/detail/_info_summary.json:20-63; /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/detail/_price_mobile.json:10-52
- adminUI: NONE
- publicUI: layouts/shop/show.json → partials/shop/detail/_info_summary.json:20-63 (desktop) + _price_mobile.json:10-52 (mobile)
- api: GET /api/modules/sirsoft-ecommerce/products/{code} (multi_currency_selling_price, multi_currency_list_price, discount_rate)
- auth: no
- config: NONE
- external: NONE
- dataMutation: NONE
- defaultTemplate: Discount% chip + strikethrough list price + selling price (mobile + desktop split)
- stillForm: discount_rate % + line-through list_price + multi_currency_selling_price formatted

### STOCK-001 — Stock display on product detail — limited to status banner + qty limits
- domain: product-detail
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/detail/_purchase_card.json:130-174; /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/shop/show.json:417-441
- adminUI: NONE
- publicUI: layouts/shop/show.json:417-441 (status banner) + partials/shop/detail/_purchase_card.json:152-174 (min/max qty notice)
- api: GET /api/modules/sirsoft-ecommerce/products/{code} (stock_quantity, sales_status)
- auth: no
- config: NONE
- external: NONE
- dataMutation: NONE
- defaultTemplate: Status banner (sold_out/suspended/coming_soon) + min/max purchase qty notice (no inline numeric stock count on detail page)
- stillForm: QuantitySelector max bound by stock_quantity (no numeric display), sales_status banner, min_purchase_qty/max_purchase_qty text

### CART-001 — Add-to-cart with selected options + additional options + quantity
- domain: product-detail
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/detail/_purchase_card.json:432-618
- adminUI: NONE
- publicUI: partials/shop/detail/_purchase_card.json:432-618
- api: POST /api/modules/sirsoft-ecommerce/cart (with additional_option_selections, X-Cart-Key header)
- auth: no (optional auth, cart_key based)
- config: NONE
- external: NONE
- dataMutation: cart_items insert (per item)
- defaultTemplate: Buy-now / Add-to-cart buttons block additional option validation (required + custom_text)
- stillForm: Buy-now (POST /api/.../checkout direct_items), Add-to-cart (POST /api/.../cart), openModal(cart_added_modal) on success

### CART-002 — Cart line items (select / qty / option change / delete)
- domain: cart
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/_cart_item.json:1-426; /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/_cart_list.json:1-143
- adminUI: NONE
- publicUI: layouts/shop/cart.json → partials/shop/_cart_list.json + _cart_item.json + _modal_cart_delete_confirm.json + _modal_cart_option_change.json
- api: GET /api/modules/sirsoft-ecommerce/cart/query (cartItems data source)
- auth: no (cart_key session)
- config: NONE
- external: NONE
- dataMutation: DELETE/PATCH /api/.../cart/{id}, POST /api/.../cart/{id}/option-change (in modal)
- defaultTemplate: Cart list with select-all, per-item checkbox, quantity selector, option-change modal, delete confirm modal
- stillForm: selectAllCartItems, toggleCartItemSelection, QuantitySelector (PATCH /cart/{id}/quantity), trash-can delete (openModal), option-change icon (openModal + initCartOptionSelection handler)

### CART-003 — Cart summary (subtotal / discount / shipping / tax)
- domain: cart
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/_cart_summary.json:80-330
- adminUI: NONE
- publicUI: layouts/shop/cart.json → partials/shop/_cart_summary.json:1-475
- api: GET /api/modules/sirsoft-ecommerce/cart/query (summary)
- auth: no
- config: NONE
- external: NONE
- dataMutation: NONE (summary read)
- defaultTemplate: Subtotal + tax breakdown (collapsible) + discount + shipping + mileage expected + free-shipping badge
- stillForm: showTaxDetails toggle, showDiscountDetails toggle, has_unshippable_items warning, multi-currency final_amount

### CART-004 — Proceed-to-checkout (creates temp order, redirects to checkout)
- domain: cart
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/_cart_summary.json:373-466
- adminUI: NONE
- publicUI: partials/shop/_cart_summary.json:340-466
- api: POST /api/modules/sirsoft-ecommerce/checkout (with selected_ids, X-Cart-Key)
- auth: no (optional, member gets direct navigate)
- config: NONE
- external: NONE
- dataMutation: temp_orders insert (cart -> temp order)
- defaultTemplate: Checkout button (disabled if no selection / unavailable items) → routes to /login?redirect= for guest, /shop/checkout for member
- stillForm: apiCall POST /api/.../checkout body={item_ids} onSuccess navigate (member) or login (guest)

### CHK-001 — Checkout page (items, discount, mileage, orderer, shipping, payment, summary)
- domain: checkout
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/shop/checkout.json:1-425
- adminUI: NONE
- publicUI: layouts/shop/checkout.json:194-413 → partials/shop/_checkout_items.json + _checkout_discount.json + _checkout_mileage.json + _checkout_orderer.json + _checkout_shipping.json + _checkout_payment.json + _checkout_summary.json
- api: GET /api/modules/sirsoft-ecommerce/checkout (auth_mode optional)
- auth: no (auth_mode optional, but mileage/coupon need login)
- config: _global.preferredShippingCountry seeded; sirsoft-ecommerce:shipping.international_shipping_enabled
- external: NONE
- dataMutation: PUT /api/.../checkout (orderer/shipping/country_code/draft)
- defaultTemplate: Checkout layout: items + discount + mileage + orderer + shipping + payment + summary (3-col grid)
- stillForm: Grid 3-col (form left, summary right) with modals: addressManage, confirmOverwrite, cart_unavailable, tempOrderNotFound, exclusiveCouponConfirm, coupon_download

### CHK-002 — Orderer info (name, phone, email) with optional guest lookup password
- domain: checkout
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/_checkout_orderer.json:40-208 (orderer), 210-343 (guest lookup)
- adminUI: NONE
- publicUI: partials/shop/_checkout_orderer.json:1-345
- api: PUT /api/modules/sirsoft-ecommerce/checkout (orderer + guest_lookup_password)
- auth: no (optional)
- config: NONE
- external: NONE
- dataMutation: orders create (guest path: orderer {name,phone,email} + guest_lookup_password)
- defaultTemplate: Orderer name + phone + email + (guest) guest_lookup_password + confirmation field
- stillForm: name/phone/email fields, guest_lookup_password (min:8) + confirmation with PasswordInput

### CHK-003 — Coupon input (order coupon, shipping coupon, discount code)
- domain: checkout
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/_checkout_discount.json:110-466
- adminUI: NONE
- publicUI: partials/shop/_checkout_discount.json:1-468
- api: PUT /api/modules/sirsoft-ecommerce/checkout (order_coupon_issue_id, shipping_coupon_issue_id, discount_code)
- auth: required (only shown if _global.currentUser?.uuid)
- config: NONE
- external: NONE
- dataMutation: coupon usage decrement
- defaultTemplate: Order coupon select, Shipping coupon select, Discount code input + apply (member-only card)
- stillForm: order_coupon_issue_id Select, shipping_coupon_issue_id Select, discount_code Input + apply button (all PUT /checkout)

### CHK-004 — Mileage/point input (use + apply)
- domain: checkout
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/_checkout_mileage.json:60-180
- adminUI: NONE
- publicUI: partials/shop/_checkout_mileage.json:1-205
- api: PUT /api/modules/sirsoft-ecommerce/checkout (use_points)
- auth: required
- config: checkoutData.data.mileage.enabled must be true
- external: NONE
- dataMutation: user mileage decrement
- defaultTemplate: Available mileage + max_usable + input + use-all + apply button (member-only)
- stillForm: use_points number Input, mileage_use_all button, mileage_apply (PUT /checkout)

### ADDR-001 — Address book quick-pick (saved address chips) on checkout
- domain: checkout
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/_checkout_shipping.json:42-168
- adminUI: NONE
- publicUI: partials/shop/_checkout_shipping.json:42-168
- api: GET /api/modules/sirsoft-ecommerce/user/addresses (auth required, suppress 401)
- auth: required (only shown if _global.currentUser?.uuid)
- config: NONE
- external: NONE
- dataMutation: none in this partial (read list)
- defaultTemplate: Saved address chips as quick-pick buttons + manage-addresses button (openModal)
- stillForm: userAddresses data source; chips on click setState shipping fields; manage button openModal(addressManageModal)

### CHK-005 — 주문자정보와동일 (same-as-orderer checkbox)
- domain: checkout
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/_checkout_shipping.json:170-215 (plus blur-back in orderer partial line 90-93, 145-148)
- adminUI: NONE
- publicUI: partials/shop/_checkout_shipping.json:170-215
- api: PUT /api/modules/sirsoft-ecommerce/checkout (shipping.recipient_name/phone)
- auth: no (but the "orderer" used = _global.currentUser or _local.orderer)
- config: NONE
- external: NONE
- dataMutation: none
- defaultTemplate: Checkbox + label that auto-fills shipping.recipient_name/phone from orderer on toggle + auto-fills back on blur
- stillForm: Checkbox same_as_orderer; on change sets shipping.recipient_name/phone; orderer inputs also blur-back to shipping when sameAsOrderer is true

### CHK-006 — Save-shipping-address checkbox on checkout
- domain: checkout
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/_checkout_shipping.json:933-970
- adminUI: NONE
- publicUI: partials/shop/_checkout_shipping.json:933-970
- api: PUT /api/modules/sirsoft-ecommerce/checkout (save_shipping_address: true)
- auth: required (only when _global.currentUser?.uuid && _local.selectedAddressId == null)
- config: NONE
- external: NONE
- dataMutation: user_addresses insert (post-order hook)
- defaultTemplate: Checkbox "save this address" (only when logged-in + no saved address selected)
- stillForm: Checkbox id=save_shipping_address → order payload body.save_shipping_address

### PAY-001 — Payment method list (dbank/card/vbank + plugin methods)
- domain: checkout
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/_checkout_payment.json:40-179
- adminUI: NONE
- publicUI: partials/shop/_checkout_payment.json:40-179
- api: GET /api/modules/sirsoft-ecommerce/settings/payment (payment methods)
- auth: no (auth_mode optional)
- config: paymentSettings.data.order_settings.payment_methods[]
- external: optional PG plugin (toss_*)
- dataMutation: orders create (POST /api/.../user/orders)
- defaultTemplate: Dynamic payment method cards (filtered by is_active, ios check), BrandMark, _cached_icon fallback, _cached_name
- stillForm: Grid of payment method cards with BrandMark, _computed.selectedCorePaymentMethod maps plugin → core

### PAY-002 — Payment method detail forms (card notice / vbank refund / dbank bank picker)
- domain: checkout
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/_checkout_payment.json:181-690
- adminUI: NONE
- publicUI: partials/shop/_checkout_payment.json:181-690
- api: POST /api/modules/sirsoft-ecommerce/user/orders (payment_method)
- auth: no
- config: paymentSettings.data.order_settings.banks + bank_accounts (dbank)
- external: optional cash_receipt slot from ecommerce module
- dataMutation: orders + payments insert
- defaultTemplate: Card info notice, vbank depositor_name + refund_bank (bank_code/account/holder), dbank bank_accounts radio list + depositor_name + refund_bank + dbank_due_notice + cash_receipt extension slot
- stillForm: refund_bank_code/account/holder (3-field required_with), depositor_name, selectedDbank object; checkoutExtraPayload extension slot

### PAY-003 — Pay button + final order create (member/guest) with PG dispatch
- domain: checkout
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/_checkout_summary.json:418-558
- adminUI: NONE
- publicUI: partials/shop/_checkout_summary.json:418-558
- api: POST /api/modules/sirsoft-ecommerce/user/orders + (guest) POST /api/.../guest/orders/verify
- auth: no (auth_mode optional, identity_target for guest)
- config: _local.isSubmittingOrder; has_unshippable_items guard
- external: optional PG plugin handler (response.data.pg_payment_handler)
- dataMutation: orders create; pg_payment_handler dispatch for PG payment flow
- defaultTemplate: Pay button + summary (subtotal, discount, shipping, points used, final, expected mileage) + agree text + currency-secondary display
- stillForm: Body payload: orderer, shipping, payment_method (core), shipping_memo, depositor_name, dbank, expected_total_amount, save_shipping_address, guest_lookup_password+confirmation, refund_bank, ...checkoutExtraPayload; onSuccess dispatch response.data.pg_payment_handler or non-PG guest verify

### GUEST-001 — Guest order lookup (form with order_number + phone + password)
- domain: guest-order
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/shop/guest_order_form.json:1-337
- adminUI: NONE
- publicUI: layouts/shop/guest_order_form.json:1-337
- api: POST /api/modules/sirsoft-ecommerce/guest/orders/verify (issue token)
- auth: no (logged-in users auto-redirected to /mypage/orders)
- config: NONE
- external: NONE
- dataMutation: none (read-only token issue)
- defaultTemplate: Form: order_number + orderer_phone + guest_lookup_password; inline error box; 30-min token via saveGuestOrderToken; auto-redirect to /shop/guest/orders/{number}
- stillForm: Form submit -> apiCall /api/.../guest/orders/verify -> saveGuestOrderToken handler -> navigate to /shop/guest/orders/{n}

### ADDR-002 — Address book list (mypage/addresses)
- domain: mypage-address
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/mypage/addresses.json:1-114; /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/mypage/addresses/_list.json:1-260; /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/mypage/addresses/_modal_address.json:1-676
- adminUI: NONE
- publicUI: layouts/mypage/addresses.json → partials/mypage/addresses/_list.json + _modal_address.json + _modal_confirm_overwrite.json + _modal_confirm_delete.json
- api: GET /api/modules/sirsoft-ecommerce/user/addresses (auth required)
- auth: required
- config: _global.modules['sirsoft-ecommerce'].shipping.international_shipping_enabled (for country dropdown)
- external: sirsoft-daum_postcode plugin (address_search_slot)
- dataMutation: POST/PUT/DELETE /api/.../user/addresses (via modal)
- defaultTemplate: Card list (label, default badge, recipient, address) + edit/delete actions; "new address" button; 3 modals (add/edit, confirm_overwrite, confirm_delete)
- stillForm: Modal adds form (label, country, recipient, phone, zip+address [KR] or address_line1/2+city/state/postal [intl], is_default); on 409 → openModal confirmOverwrite

### WISH-002 — Wishlist list (mypage/wishlist)
- domain: mypage-wishlist
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/mypage/wishlist.json:1-111; /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/mypage/wishlist/_list.json:1-170
- adminUI: NONE
- publicUI: layouts/mypage/wishlist.json → partials/mypage/wishlist/_list.json
- api: GET /api/modules/sirsoft-ecommerce/wishlist (auth required)
- auth: required
- config: NONE
- external: NONE
- dataMutation: DELETE /api/.../wishlist/{id} (from mypage)
- defaultTemplate: 5-col grid of ProductCard components + per-card remove heart button + pagination + empty state
- stillForm: DELETE /api/.../wishlist/{id} on heart-button click; Pagination composite for paging

### QNA-002 — My inquiries list (mypage/inquiries)
- domain: mypage-inquiry
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/mypage/inquiries.json:1-138
- adminUI: NONE
- publicUI: layouts/mypage/inquiries.json → partials/mypage/inquiries/_list.json
- api: GET /api/modules/sirsoft-ecommerce/user/inquiries (auth required)
- auth: required
- config: _global.modules['sirsoft-ecommerce'].inquiry.board_slug
- external: board plugin
- dataMutation: none (read of my-inquiry list); writes via qna_write_modal shared with product detail
- defaultTemplate: Reuses _modal_qna_write.json + _modal_inquiry_delete.json; list with edit/delete actions; 404 if inquiry_available === false
- stillForm: Reuses qna_write_modal (POST /api/.../user/inquiries/{id} on edit, POST /api/.../products/{id}/inquiries on create); _modal_inquiry_delete shared

### REORDER-001 — Reorder from order detail
- domain: mypage-orders
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/shop/reorder.json:1-280
- adminUI: NONE
- publicUI: layouts/shop/reorder.json:1-280
- api: POST /api/modules/sirsoft-ecommerce/user/orders/{id}/reorder
- auth: required
- config: NONE
- external: NONE
- dataMutation: cart_items insert (reorder -> cart)
- defaultTemplate: Reorder button → POST reorder → cart redirect or partial message
- stillForm: POST /api/.../user/orders/{id}/reorder; partial/failed message via showErrorPage or sequence toast+continue

### REVIEW-003 — Write review (from order detail, only when can_write_review)
- domain: mypage-orders
- source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/mypage/orders/_modal_write_review.json:200-300; /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/mypage/orders/_items.json:340-400
- adminUI: NONE
- publicUI: partials/mypage/orders/_modal_write_review.json:1-300+; called from partials/mypage/orders/_items.json:340-380 + 705-745
- api: handler sirsoft-ecommerce.submitReview (orderId, optionId, productId, rating, content, images)
- auth: required (gated by order's can_write_review boolean)
- config: reviewSettings.data.review_settings.max_images / max_image_size_mb
- external: NONE
- dataMutation: product_reviews insert (gated by completed order)
- defaultTemplate: Modal: 1-5 star picker, content textarea, image uploader (FileUploader), error box, submit (called from order-item can_write_review)
- stillForm: reviewRating 1-5 buttons, reviewContent textarea, reviewImages FileUploader (autoUpload:false), submitReview handler with all 6 params


## coupon-point

> notes: Coupon + mileage fully implemented in sirsoft-ecommerce. Coupon enums: CouponDiscountType{fixed,rate}, CouponTargetType{product_amount,order_amount,shipping_fee}, CouponTargetScope{all,products,categories}, CouponIssueMethod{direct,download,auto}, CouponIssueCondition{manual,signup,first_purchase,birthday}, CouponIssueStatus{issuing,stopped}, CouponIssueRecordStatus{available,used,expired,cancelled}. Mileage enums: MileageTransactionTypeEnum{purchase_earn,admin_earn,order_use,admin_deduct,expired,refund_restore,order_cancel_restore,earn_cancel}, MileageEarnTriggerEnum{delivered,confirmed}. Hooks (sync=true inside order tx): coupon.use, coupon.restore, order.after_cancel; mileage.use, mileage.restore, mileage.earn, order_option.after_status_change/after_bulk_status_change. Migrations: ecommerce_promotion_coupons(_029), _issues(_031), _products(_032), _categories(_033), ecommerce_mileage_transactions(_06_11_000001), ecommerce_mileage_balances(_06_11_000004). Order columns: is_mileage_deducted, total_points_used_amount, total_earned_points_amount, mileage_policy_snapshot, total_product_coupon_discount_amount, total_order_coupon_discount_amount. Services: CouponService, UserCouponService (download/direct issue), UserMileageService (earnFIFO/deduct/restore/adminEarn/adminDeduct/expireLots), OrderProcessingService (deductMileageForOrder, failPayment restore, validateMileageUsagePolicy), OrderCancellationService (coupon.restore + mileage.restore fires), OrderAdjustmentService (buildCouponSnapshotsFromOrder, buildRestoredCouponsInfo). Config keys: mileage.{enabled,default_earn_rate,earn_trigger,earn_delay_days,currency_rules,expiry_enabled,expiry_days,expiry_notification_enabled,expiry_notification_days_before}; payment_methods.*.mileage_deduction_timing = order_placed | payment_complete. Permissions: sirsoft-ecommerce.promotion-coupon.{read,create,update,delete}, sirsoft-ecommerce.mileage.{read,manage}. Schedulers: sirsoft-ecommerce:earn-mileage, expire-mileage, notify-expiring-mileage, reconcile-mileage-balance. Member-level pricing: NOT IMPLEMENTED in this module — only DTO metadata placeholders user_grade_id/grade_discount_amount/grade_discount exist, all annotated '회원등급 플러그인'. External plugin required. Blockers: none for coupon/mileage parity; member-grade pricing requires a separate plugin to satisfy SUPERBIFY parity (admin UI / APIs / models all absent in sirsoft-ecommerce).

### COUP-001 — Coupon types: fixed/rate, scope: product_amount/order_amount/shipping_fee, target_scope: all/products/categories, issue_method: direct/download/auto, issue_condition: manual/signup/first_purchase/birthday, issue_status: issuing/stopped, valid_type: period/days_from_issue, is_combinable, min_order_amount, discount_max_amount, total_quantity (NULL=unlimited), issued_count, per_user_limit (0=unlimited). Status enum: available/used/expired/cancelled.
- domain: coupon
- source: /home/bahamut/20feet/modules/sirsoft-ecommerce/database/migrations/2026_04_01_000029_create_ecommerce_promotion_coupons_table.php:15-49
- adminUI: Admin\CouponController (CRUD + bulk status + issues) /admin/ecommerce/promotion-coupons
- publicUI: /shop/{product} coupon chips, /shop/{product}/coupons downloadable modal, /checkout coupon selectors (order/shipping/product)
- api: GET/POST/PUT/DELETE/PATCH /api/modules/sirsoft-ecommerce/admin/promotion-coupons (CouponController)
- auth: auth for user coupon list/download/history; public list for downloadable and product downloadable
- config: none — full DB-backed; permission keys sirsoft-ecommerce.promotion-coupon.{read,create,update,delete}
- external: no
- dataMutation: ecommerce_promotion_coupons, ecommerce_promotion_coupon_issues, ecommerce_promotion_coupon_products, ecommerce_promotion_coupon_categories
- defaultTemplate: COUP-001~008 admin pages (resources/views admin); module.php:2628 /admin/ecommerce/promotion-coupons
- stillForm: /workspace parity check uses ecommerce_promotion_coupons + CheckoutForm coupon payload (coupon_issue_ids, item_coupons)

### COUP-002 — Coupon issuance: direct (admin -> users), download (user), auto (signup/first_purchase/birthday via signup/event triggers). per_user_limit enforced in UserCouponService::assertWithinUserLimit. Order coupon.use hook (CouponUseListener) marks CouponIssue.status AVAILABLE->USED atomically; cancel/fail restores via coupon.restore/after_cancel hooks.
- domain: coupon
- source: /home/bahamut/20feet/modules/sirsoft-ecommerce/src/Services/CouponService.php:275-320 (issueDirectly)
- adminUI: Admin\CouponController issues list + IssueCouponDirectRequest
- publicUI: UserCouponController (mypage coupon box + download)
- api: POST /api/modules/sirsoft-ecommerce/admin/promotion-coupons/{id}/issues (issueDirectly); admin issues endpoint
- auth: auth for user.coupons.*, download
- config: none
- external: no
- dataMutation: ecommerce_promotion_coupon_issues + incrementIssuedCount/decrementIssuedCount on ecommerce_promotion_coupons
- defaultTemplate: resource CouponIssueResource, CouponIssueCollection
- stillForm: CouponIssue.status, coupon_code prefixes DL-/DR-, used_at, order_id, expired_at, discount_amount

### MILE-001 — Mileage ledger: 8 transaction types (purchase_earn, admin_earn, order_use, admin_deduct, expired, refund_restore, order_cancel_restore, earn_cancel). FIFO lot model with remaining_amount; earn on confirmed_at or delivered_at (MileageEarnTriggerEnum). Use at checkout: validateUsage (min/use_unit/max/balance), getMaxUsable, isMileageUsable. Restore on cancel/refund/failed-payment. Admin earn/deduct/extend-expiry via controller.
- domain: point/mileage
- source: /home/bahamut/20feet/modules/sirsoft-ecommerce/database/migrations/2026_06_11_000001_create_ecommerce_mileage_transactions_table.php:14-49
- adminUI: Admin\MileageTransactionController + store/update/extend-expiry/linked
- publicUI: User mileage balance, max-usable, history endpoints
- api: GET/POST/PATCH /api/modules/sirsoft-ecommerce/admin/mileage-transactions; admin.mileage.{read,manage} permission
- auth: auth required for user.mileage.*
- config: sirsoft-ecommerce.mileage.{enabled,default_earn_rate,earn_trigger,earn_delay_days,currency_rules,expiry_enabled,expiry_days,expiry_notification_enabled,expiry_notification_days_before} (config/settings/defaults.json:297-319)
- external: no
- dataMutation: ecommerce_mileage_transactions (ledger), ecommerce_mileage_balances (cache), ecommerce_orders.is_mileage_deducted, total_points_used_amount, total_earned_points_amount, mileage_policy_snapshot
- defaultTemplate: MileageTransactionResource/Collection, MileageAdminEarnDto/MileageAdminDeductDto
- stillForm: checkout use_points input → mileage.use hook → deductFifo; OrderProcessingService deductMileageForOrder + restoreForFailedPayment

### MILE-002 — Member mileage account: balance view (cached), max-usable at checkout (min_use_amount, use_unit, max_use_type percent/fixed, max_use_value, earn_rounding_unit/method), history (earn/use/expire/adjust 4-category). Expiration scheduler + notify-expiring cron. earn_delay_days schedules earn-mileage job.
- domain: point/mileage
- source: /home/bahamut/20feet/modules/sirsoft-ecommerce/src/Services/UserMileageService.php:160-224 (canUse/getMaxUsable)
- adminUI: NONE — admin menu lacks mileage item link? YES: module.php:2661 /admin/ecommerce/mileage-transactions
- publicUI: User mileage balance/UI (mypage mileage tab)
- api: GET /api/modules/sirsoft-ecommerce/user/mileage (balance), GET /user/mileage/max-usable, GET /user/mileage/history
- auth: auth required
- config: currency_rules[].{point_value,min_use_amount,use_unit,max_use_type,max_use_percent,max_use_value,earn_rounding_unit,earn_rounding_method}
- external: no
- dataMutation: ecommerce_mileage_transactions, ecommerce_mileage_balances
- defaultTemplate: UserMileageController balance/maxUsable/history
- stillForm: use_points payload; mileage_policy_snapshot persisted in ecommerce_orders.mileage_policy_snapshot

### MLP-001 — NOT IMPLEMENTED. Only DTO placeholders exist for an external plugin: CalculationInput.metadata.user_grade_id, CalculationInput.metadata.referral_code, CalculationInput.metadata.campaign_id, ItemCalculation.grade_discount_amount, Summary.grade_discount, OrderCalculationResult.grade_discount_details. Comments explicitly say '회원등급 플러그인'. Grep for membership_level/grade_discount_amount/user_grade returns ONLY DTO comments and a lang 'grade' shipping tier key (unrelated). No model, no migration, no controller, no service for member-level pricing exists in this module.
- domain: member-level pricing
- source: /home/bahamut/20feet/modules/sirsoft-ecommerce/src/DTO/CalculationInput.php:22 (user_grade_id metadata only); src/DTO/ItemCalculation.php:37 (grade_discount_amount)
- adminUI: NONE in sirsoft-ecommerce
- publicUI: NONE
- api: NOT IMPLEMENTED in sirsoft-ecommerce
- auth: —
- config: —
- external: expected to come from a separate 회원등급 plugin (not bundled)
- dataMutation: NOT IMPLEMENTED in sirsoft-ecommerce
- defaultTemplate: NOT IMPLEMENTED in sirsoft-ecommerce
- stillForm: NOT EXPOSED — CheckoutForm has no member-grade field


## aux-inquiry-notify-member

> notes: Version: sirsoft-ecommerce module (path /home/bahamut/20feet/modules/sirsoft-ecommerce); commits 77cbede6/9160d130/3496dc79 recent. PRODUCT INQUIRY: member-only write, public read, admin/manager reply via inquiries.update perm, admin delete via inquiries.delete. Public is_secret supported via exclude_secret flag. Soft deletes + board morph via ProductInquiryBoardListener. REVIEW: member write (gate user-reviews.write) needs own delivered order_option via canWrite; ReviewStatus enum VISIBLE/HIDDEN; rating 1..5, content 10..2000, max 5 images, deadline 90 days. WISHLIST: member only (auth:sanctum), toggle returns {added:bool}. RECENT-VIEWED: client-driven (no server store); GET /products/recent?ids=CSV. NOTIFICATIONS: 10 declarative types in module.php::getNotificationDefinitions() (order_confirmed/pending_deposit/shipped/delivered/completed/cancelled, new_order_admin, inquiry_received/replied, mileage_expiring_soon), channels ['mail','database'], order triggers fired by OrderStatusNotificationListener mapping order.after_status_change→after_confirm/after_ship/after_deliver/after_complete. CART MERGE: hook core.auth.after_login (priority 20, sync=true); X-Cart-Key header format /^ck_[a-zA-Z0-9]{32}$/; manual POST /cart/merge (auth required). PERMISSIONS: getPermissions() in module.php defines 17 admin categories + 3 user gates. QTY VALIDATION: FormRequests use required|integer|min:1|max:config('sirsoft-ecommerce.cart.max_quantity', 99). SSoT key: sirsoft-ecommerce.cart.max_quantity (config/ecommerce.php:65). CSRF/MIDDLEWARE: API is Sanctum Bearer only; no CSRF (StartApiSession.php:42). Routes use optional.sanctum (auth-or-guest) or auth:sanctum; throttle:20,1 on guest.orders.verify. GDPR/MARKETING: installed copies live in /home/bahamut/20feet/plugins/_bundled/sirsoft-gdpr and /home/bahamut/20feet/plugins/_bundled/sirsoft-marketing — they do not directly integrate with ecommerce hooks. PARITY DOCS: matrix covers checkout features only; vitest parity test covers same — neither covers inquiry/review/wishlist/recent/notif/merge/qty/gdpr/marketing. Blockers: none.

### INQ-001 — Product inquiry (1:1 문의) — member auth required for write, public list incl. guest; admin/manager with inquiries.update permission can post reply, admin with inquiries.delete can delete; is_secret private flag (exclude_secret toggle); soft deletes + board-morph pivot via ProductInquiryBoardListener (boards delete→pivot cleanup, restore→pivot restore)
- domain: Auxiliary ecommerce
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Public/ProductInquiryController.php:21-100; modules/sirsoft-ecommerce/src/Http/Controllers/User/ProductInquiryController.php:22-258; modules/sirsoft-ecommerce/src/Http/Controllers/Admin/ProductInquiryController.php:19-123; modules/sirsoft-ecommerce/src/Models/ProductInquiry.php:23-85; modules/sirsoft-ecommerce/src/Http/Requests/Public/StoreInquiryRequest.php:11-59; modules/sirsoft-ecommerce/src/Http/Requests/User/UpdateInquiryRequest.php:11-56; modules/sirsoft-ecommerce/src/Http/Requests/User/UpdateInquiryReplyRequest.php:10-47; modules/sirsoft-ecommerce/src/Http/Requests/Admin/StoreInquiryReplyRequest.php:10-47; modules/sirsoft-ecommerce/src/Listeners/ProductInquiryBoardListener.php (board lifecycle sync)
- adminUI: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/ProductInquiryController.php (reply/updateReply/destroyReply/destroy)
- publicUI: modules/sirsoft-ecommerce/src/Http/Controllers/Public/ProductInquiryController.php (index public guest+member, store member only)
- api: POST /api/modules/sirsoft-ecommerce/products/{product}/inquiries (member only, auth:sanctum); GET (public guest+member, exclude_secret); admin POST/PUT/DELETE /admin/inquiries/{id}/reply; admin DELETE /admin/inquiries/{id}
- auth: auth:sanctum (write); public read; permission:admin,sirsoft-ecommerce.inquiries.update for reply; permission:admin,sirsoft-ecommerce.inquiries.delete for delete
- config: N/A
- external: board module (inquirable morphTo) for actual post storage
- dataMutation: ecommerce_product_inquiries (pivot product_id, inquirable_type, inquirable_id, user_id, is_answered, answered_at, product_name_snapshot) + board post morph (외부 게시판 모듈)
- defaultTemplate: N/A (backend only — sirsoft-ecommerce API + list layouts)
- stillForm: N/A (backend only)

### REV-001 — Product reviews (상품후기) — public list per product (rating stats + per-option filter, photo_only, sort, per_page≤50, rating in 1..5); member write requires own delivered order_option (canWrite check via ProductReviewService); ReviewStatus enum VISIBLE/HIDDEN; admin can update status, save/delete reply (StoreReviewReplyRequest/UpdateReviewStatusRequest), bulk actions; images via ReviewImageController (hash-served public download route /review-image/{hash})
- domain: Auxiliary ecommerce
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Public/ProductReviewController.php:19-64; modules/sirsoft-ecommerce/src/Http/Controllers/User/ProductReviewController.php:21-129; modules/sirsoft-ecommerce/src/Http/Controllers/Admin/ProductReviewController.php:24-241; modules/sirsoft-ecommerce/src/Models/ProductReview.php:17-104; modules/sirsoft-ecommerce/src/Models/ProductReviewImage.php; modules/sirsoft-ecommerce/src/Enums/ReviewStatus.php:8-71; modules/sirsoft-ecommerce/src/Http/Requests/Public/PublicReviewListRequest.php:13-65; modules/sirsoft-ecommerce/src/Http/Requests/User/StoreReviewRequest.php:14-68
- adminUI: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/ProductReviewController.php (index/show/updateStatus/storeReply/destroyReply/destroy/bulk)
- publicUI: modules/sirsoft-ecommerce/src/Http/Controllers/Public/ProductReviewController.php (index public guest+member)
- api: GET /products/{product}/reviews (public); GET /user/reviews/can-write/{orderOptionId} (member); POST /user/reviews (member, sirsoft-ecommerce.user-reviews.write); DELETE /user/reviews/{review} (member); POST/DELETE /user/reviews/{review}/images; admin /admin/reviews (read/update/delete)
- auth: auth:sanctum (write); permission:user,sirsoft-ecommerce.user-reviews.write (store+images+destroy); admin permission:admin,sirsoft-ecommerce.reviews.update / .delete
- config: config('sirsoft-ecommerce.review.write_deadline_days' default 90, .max_images 5, .max_image_size_mb 10)
- external: N/A
- dataMutation: ecommerce_product_reviews (product_id, order_option_id, user_id, rating, content, content_mode, option_snapshot, status, reply_content, reply_content_mode, reply_admin_id, replied_at, reply_updated_at) + ecommerce_product_review_images (soft deletes)
- defaultTemplate: list/admin_product_review_index.json (partials: _modal_image_preview, admin_ecommerce_settings/_tab_review_settings)
- stillForm: N/A (backend only)

### WIS-001 — Wishlist / favorite (찜) — member-only; toggle endpoint adds or removes; returns {added: bool}; validation requires product_id exists in Product; product_id integer; separate index/destroy (id-based) routes; controller uses Auth::id() (not member id param)
- domain: Auxiliary ecommerce
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Public/WishlistController.php:20-108; modules/sirsoft-ecommerce/src/Models/ProductWishlist.php:12-40; modules/sirsoft-ecommerce/src/Http/Requests/Public/ToggleWishlistRequest.php:13-49; modules/sirsoft-ecommerce/src/Services/ProductWishlistService.php; modules/sirsoft-ecommerce/src/routes/api.php:347-356
- adminUI: NONE — member-facing only
- publicUI: modules/sirsoft-ecommerce/src/Http/Controllers/Public/WishlistController.php (despite namespace, all routes inside /wishlist prefix use auth:sanctum)
- api: POST /wishlist/toggle (toggle add/remove); GET /wishlist (list); DELETE /wishlist/{id}
- auth: auth:sanctum (all wishlist routes)
- config: N/A
- external: N/A
- dataMutation: ecommerce_product_wishlists (user_id, product_id) — composite unique (per migration 2026_04_01_000016)
- defaultTemplate: N/A
- stillForm: N/A (backend only)

### REC-001 — Recent-viewed products (최근 본 상품) — client-driven (cookie/localStorage holds ids); server endpoint only resolves ids to ProductListResource; max length 500 in ids param; empty list → empty response
- domain: Auxiliary ecommerce
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Public/ProductController.php:135-165; modules/sirsoft-ecommerce/src/Http/Requests/Public/PublicProductRecentRequest.php:13-52; modules/sirsoft-ecommerce/src/routes/api.php:96-97
- adminUI: NONE — public list endpoint
- publicUI: modules/sirsoft-ecommerce/src/Http/Controllers/Public/ProductController.php:135-165 (recent)
- api: GET /products/recent — ids CSV (?ids=1,2,3) returns visible products in given id order; no server-side persistence
- auth: optional.sanctum + permission:user,sirsoft-ecommerce.user-products.read (group)
- config: N/A
- external: N/A
- dataMutation: NONE — no DB table; client sends id list
- defaultTemplate: N/A
- stillForm: N/A (backend only)

### NOTIF-001 — Order & inquiry notifications — 10 declarative notification types in modules/sirsoft-ecommerce/module.php::getNotificationDefinitions() (line 1274-1288): order_confirmed, order_pending_deposit, order_shipped, order_delivered, order_completed, order_cancelled, new_order_admin, inquiry_received, inquiry_replied, mileage_expiring_soon. Channels: ['mail','database'] for most; admin order uses 'mail','database' too. Hooks: sirsoft-ecommerce.order.after_confirm / after_ship / after_deliver / after_complete (mapped by OrderStatusNotificationListener from order.after_status_change), sirsoft-ecommerce.order.after_create, sirsoft-ecommerce.mileage.notify_expiring. Data extraction: EcommerceNotificationDataListener (filter hook sirsoft-ecommerce.notification.extract_data). Guest recipient routing via context.guest_recipient (buildOrderContext).
- domain: Auxiliary ecommerce — notifications
- source: modules/sirsoft-ecommerce/module.php:1274-1288 + private orderConfirmedDefinition()..inquiryRepliedDefinition(); modules/sirsoft-ecommerce/src/Listeners/OrderStatusNotificationListener.php:25-86; modules/sirsoft-ecommerce/src/Listeners/EcommerceNotificationDataListener.php:23-588; modules/sirsoft-ecommerce/src/Listeners/IssueCashReceiptOnDepositListener.php; modules/sirsoft-ecommerce/src/Listeners/MileageTransactionListener.php
- adminUI: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/EcommerceSettingsController.php + _tab_notification_definitions partial
- publicUI: N/A — server-side triggers only
- api: N/A — notification_definitions is module-declarative (module.php::getNotificationDefinitions), not an HTTP route. Routing happens via HookManager::doAction triggers consumed by core notification system
- auth: N/A (system-triggered)
- config: notification settings (admin UI editable per module)
- external: core notification module (core/notification), notification Definitions resolution from core
- dataMutation: NONE directly — stored in settings DB via EcommerceSettingsService
- defaultTemplate: _tab_notification_definitions.json, _modal_notification_template_edit/preview, _modal_notification_definition_reset, _tab_mileage_notification_card
- stillForm: N/A (server triggers only)

### CART-001 — Member cart merge on login (비회원→회원 장바구니 병합) — triggered by HookManager 'core.auth.after_login' (priority 20, sync=true — queue would lose X-Cart-Key header). Cart-key format: /^ck_[a-zA-Z0-9]{32}$/. Service: CartService::mergeGuestCartToUser() (line 547). Adjustments (clamped over stock/purchase_limit) logged. Manual API path via cart/merge (optional.sanctum + auth check in MergeGuestCartRequest::withValidator).
- domain: Auxiliary ecommerce — cart
- source: modules/sirsoft-ecommerce/src/Listeners/MergeCartOnLoginListener.php:13-92; modules/sirsoft-ecommerce/src/Services/CartService.php:540-672; modules/sirsoft-ecommerce/src/Http/Requests/Public/MergeGuestCartRequest.php:12-63; modules/sirsoft-ecommerce/src/routes/api.php:166-168
- adminUI: NONE
- publicUI: modules/sirsoft-ecommerce/src/Http/Controllers/Public/CartController.php (merge action); modules/sirsoft-ecommerce/src/Http/Requests/Public/MergeGuestCartRequest.php
- api: POST /api/modules/sirsoft-ecommerce/cart/merge (manual guest→member merge via X-Cart-Key header; auth required). Auto-merge on login via hook core.auth.after_login (MergeCartOnLoginListener)
- auth: auto-merge requires any login; manual merge requires auth:sanctum (validated in MergeGuestCartRequest::withValidator)
- config: config('sirsoft-ecommerce.cart.max_quantity' default 99), .guest_cart_lifetime (7 days)
- external: N/A
- dataMutation: ecommerce_carts — user_id assigned, cart_key kept on no-merge lines; existing same-option+same-additional-options lines get quantity summed (clamped to stock and purchase limit)
- defaultTemplate: N/A
- stillForm: N/A (backend only)

### PERM-001 — Admin & user permission names (sirsoft-ecommerce.{category}.{action}) — defined in modules/sirsoft-ecommerce/module.php:83-1053 getPermissions(). Categories (admin): products.{read,create,update,delete}; orders.{read,update}; categories.{read,create,update,delete}; brands.{read,create,update,delete}; product-notice-templates.{read,create,update,delete}; product-common-infos.{read,create,update,delete}; settings.{read,update}; promotion-coupon.{read,create,update,delete}; shipping-policies.{read,create,update,delete}; product-labels.{read,create,update,delete}; identity.policies.{read,update}; reviews.{read,update,delete}; inquiries.{update,delete}; dashboard.{view}. User type (블랙컨슈머 gate): user-products.{read}; user-orders.{create,cancel,confirm}; user-reviews.{write}; mileage.{read,manage} (admin); user-currency.{manage} (admin); user-shipping-country.{manage} (admin). Roles defaults: admin/manager/sirsoft-ecommerce.manager; * for user-side gates.
- domain: Auxiliary ecommerce — permissions
- source: modules/sirsoft-ecommerce/module.php:83-1053 (getPermissions)
- adminUI: N/A
- publicUI: N/A (gates routes + resources)
- api: N/A — permission gate (admin types from module.php::getPermissions())
- auth: role/permission check via core PermissionHelper
- config: N/A
- external: core permission system
- dataMutation: N/A
- defaultTemplate: N/A
- stillForm: N/A

### QTY-001 — Quantity edge validation — FormRequests validate quantity: required, integer, min:1, max:config('sirsoft-ecommerce.cart.max_quantity') (default 99). Rules appear in: BulkAddToCartRequest (items.*.quantity), UpdateCartQuantityRequest (quantity), ChangeCartOptionRequest (quantity). CartService::mergeGuestCartToUser clamps to stock and purchase-quantity-limit (clampToPurchaseQuantityLimit). Service-level: CartService line 972, 1019 use max = config('sirsoft-ecommerce.cart.max_quantity', 99). Order create request (Public/CreateOrderRequest) uses same SSoT. Negative/zero caught by min:1; non-integer caught by 'integer'; oversize by max:N. Excludes string values (Laravel 'integer' rule rejects non-numeric strings).
- domain: Auxiliary ecommerce — quantity validation
- source: modules/sirsoft-ecommerce/src/Http/Requests/Public/BulkAddToCartRequest.php:32-71; modules/sirsoft-ecommerce/src/Http/Requests/Public/UpdateCartQuantityRequest.php:28-52; modules/sirsoft-ecommerce/src/Http/Requests/Public/ChangeCartOptionRequest.php; modules/sirsoft-ecommerce/src/Services/CartService.php:547-672 (clampToPurchaseQuantityLimit + max=99), 972, 1019; modules/sirsoft-ecommerce/config/ecommerce.php:63-67
- adminUI: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/ProductController.php (BulkUpdateProductsRequest)
- publicUI: modules/sirsoft-ecommerce/src/Http/Requests/Public/BulkAddToCartRequest.php, UpdateCartQuantityRequest.php, ChangeCartOptionRequest.php
- api: Bulk add/update/changeOption cart; admin product/option stock bulk update (PATCH /admin/products/bulk-update, /admin/options/bulk-update)
- auth: N/A (guests included)
- config: config('sirsoft-ecommerce.cart.max_quantity', 99)
- external: N/A
- dataMutation: ecommerce_carts.quantity, ecommerce_product_options.stock_quantity (admin)
- defaultTemplate: N/A
- stillForm: N/A (backend only)

### AUTH-001 — CSRF / auth middleware on shop API routes — API layer is Bearer-token (Sanctum), CSRF is intentionally NOT applied. Middleware patterns observed: 'optional.sanctum' (auth-or-guest) on products group, cart, checkout, orders/{orderNumber}, claim-reasons, orders.cancel-payment; 'auth:sanctum' (member-required) on wishlist, user/*, admin/*; 'auth:sanctum' + 'admin' on admin prefix; throttle:20,1 on guest.orders.verify (brute-force guard) and on admin.shipping-policies.test-api-call. No VerifyCsrfToken in API pipeline (StartApiSession.php:42).
- domain: Auxiliary ecommerce — auth/CSRF
- source: modules/sirsoft-ecommerce/src/routes/api.php:85,124,157,212,259,267,316,322,330,347,363,565,693; app/Http/Middleware/StartApiSession.php:23-55; app/Http/Middleware/OptionalSanctumMiddleware.php; app/Http/Middleware/PermissionMiddleware.php
- adminUI: N/A
- publicUI: N/A (server middleware)
- api: All /api/modules/sirsoft-ecommerce/* routes use Laravel Sanctum (Bearer) — no CSRF; documented by /home/bahamut/20feet/app/Http/Middleware/StartApiSession.php:42-44 which explicitly omits VerifyCsrfToken
- auth: varies per route (see notes)
- config: core Sanctum config
- external: Laravel Sanctum
- dataMutation: N/A
- defaultTemplate: N/A
- stillForm: N/A

### EXT-001 — Installed sirsoft-gdpr and sirsoft-marketing plugins (separate from ecommerce module). They are NOT present in /home/bahamut/20feet/plugins/ root (only _bundled copies). They run independently; do not directly hook sirsoft-ecommerce.* hooks. Their presence is documented in plugin.json + plugin.php. The ecommerce module does NOT call into them and they do NOT call into ecommerce. Ecommerce's MergeCartOnLoginListener and notifications are self-contained.
- domain: Auxiliary ecommerce — GDPR + marketing plugins (in /plugins/_bundled)
- source: plugins/_bundled/sirsoft-gdpr/src/routes/api.php:31-114; plugins/_bundled/sirsoft-gdpr/src/Listeners/GdprAuthLogoutListener.php, GdprAuthConsentListener.php, GdprUserDeleteListener.php, GdprUserWithdrawListener.php; plugins/_bundled/sirsoft-marketing/src/Listeners/MarketingConsentListener.php:16+; plugins/_bundled/sirsoft-marketing/src/routes/api.php
- adminUI: plugins/sirsoft-gdpr/src/Http/Controllers/Admin/* (settings, consent-log, policy-versions)
- publicUI: plugins/_bundled/sirsoft-gdpr/src/routes/api.php; plugins/_bundled/sirsoft-marketing/src/routes/api.php
- api: GDPR: /api/plugins/sirsoft-gdpr/* (public: settings, consent/cookie POST+status with optional.sanctum; user: consent/me|history|revoke|grant|renew-all with auth:sanctum; admin: settings R/W, consent-log R, policy-versions R+create with permission:admin,sirsoft-gdpr.privacy.{view,update}). Marketing: /api/plugins/sirsoft-marketing/* (admin + user).
- auth: vary per route; admin: permission:admin,sirsoft-gdpr.privacy.{view,update}
- config: plugin activation via admin plugin UI
- external: N/A (both are plugins that ride on core notification/permission systems)
- dataMutation: gdpr: g7_gdpr_user_consents + history + policy_versions tables; marketing: g7_marketing_consents + history tables
- defaultTemplate: N/A (plugin API only)
- stillForm: N/A (plugin API only)

### PARITY-001 — Existing parity/QA coverage summary. (1) _workspace/still-form/CHECKOUT_PARITY_MATRIX.md (67 lines, 2026-08-31) is a tabular matrix of ~38 checkout features (orderer/shipping address/coupon/mileage/cash receipt/PG dispatch/identity/iOS gate etc.) with columns DEFAULT/Still-Form(before)/ACTION. Covers RESTORE/FIX/KEEP/N/A for each, plus full POST /user/orders payload contract and the QA resolution log (FIXED item_coupons full-map, PG dispatch test rewrite, same-as-orderer guest expose). (2) templates/_bundled/superbify-commerce_minimal/__tests__/components/CheckoutParity.test.tsx (540 lines) is the automated regression. Has describe blocks: same-as-orderer, save_shipping_address, saved address pills, payment (dynamic methods + dbank selection + core translation), refund bank, cash receipt, item coupons (full map contract), coupons/mileage recompute, international shipping, unavailable items, layout contract (addresses DS + modals), PG dispatch (real submit path). It does NOT cover: product inquiry, review, wishlist, recent-viewed, notification triggers, cart merge, qty edge, GDPR/marketing.
- domain: QA regression baseline
- source: _workspace/still-form/CHECKOUT_PARITY_MATRIX.md:1-67; templates/_bundled/superbify-commerce_minimal/__tests__/components/CheckoutParity.test.tsx:96-540 (describe blocks)
- adminUI: N/A
- publicUI: _workspace/still-form/CHECKOUT_PARITY_MATRIX.md (matrix), templates/_bundled/superbify-commerce_minimal/__tests__/components/CheckoutParity.test.tsx (Vitest)
- api: Indirectly verified by CheckoutParity.test.tsx (superbify-commerce_minimal)
- auth: N/A (QA artifact)
- config: N/A
- external: N/A
- dataMutation: N/A
- defaultTemplate: templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx (PARITY_DIFF markers in code)
- stillForm: N/A


## options-stock

> notes: Option schema = one row per variant (no option1/2/3 columns; free-form option_values JSON with [{key,value}] multi-key pairs). Additional options = separate group+value tables with add-only price_adjustment (>=0). Per-option stock_quantity + safe_stock_quantity; product.stock_quantity = sum(active options). Decrement uses DB::transaction + lockForUpdate + WHERE stock_quantity>=qty guard. Timing is per payment method (order_placed vs payment_complete) — config key order_settings.payment_methods.*.stock_deduction_timing. Restore on cancel reads order_settings.stock_restore_on_cancel (default true) and is run by OrderCancellationService::restoreStock() calling StockService::restoreOptionStockForOrderOption(). Per-order-option is_stock_deducted flag prevents double-deduct and supports partial cancel (split into separate CANCELLED OrderOption rows). Product base fields: list_price/selling_price (bigInt), currency_code (default KRW), sales_status (on_sale/suspended/sold_out/coming_soon), display_status (visible/hidden), tax_status (taxable/tax_free) + tax_rate decimal(5,2) default 10.00, has_options bool, option_groups JSON column [{name,values}], min_purchase_qty default 1, max_purchase_qty default 0=unlimited, purchase_restriction none|restricted, allowed_roles JSON, barcode, hs_code, sku. Categories many-to-many via ecommerce_product_categories with is_primary flag; categories use parent_id + materialized path (depth/sort_order/slug/meta_*). Product images via hash-based url, collection (main/detail/additional), is_thumbnail. Active language packs: en, ja. ProductPriceType, ProductDateType enums exist but are not used by stock/option paths. Cart uses additional_option_selections JSON + getAdditionalOptionSelectionHash for merge dedupe (per additional_option_id+value_id+custom_text). Stock hooks (sirsoft-ecommerce.stock.{before,after}_{deduct,restore}) are emitted but no in-module listener subscribes; subscriber must come from external plugin. SyncProductFromOptionListener re-syncs product.stock_quantity after option bulk stock changes. Bundle path /home/bahamut/20feet/modules/_bundled/sirsoft-ecommerce is a near-identical snapshot of the active module's stock + option files (per migration dist/vendor policy) — read-only reference.

### OPT-001 — Product option single dimension (free-form JSON)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/database/migrations/2026_04_01_000005_create_ecommerce_products_table.php:45
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no (read) / yes (write)
- config: none
- external: none
- dataMutation: ecommerce_product_options
- defaultTemplate: ecommerce_products, ecommerce_product_options, ecommerce_product_additional_options, ecommerce_product_additional_option_values, ecommerce_product_images, ecommerce_product_categories (pivot), ecommerce_carts (additional_option_selections), ecommerce_order_options (additional_options_total/_snapshot, additional_options_total mc, is_stock_deducted)
- stillForm: N/A

### OPT-002 — Option combination row (variant)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/database/migrations/2026_04_01_000007_create_ecommerce_product_options_table.php:15-39
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_product_options
- defaultTemplate: single product_option row = one combination; option_values stored as free-form JSON array of {key,value} pairs (multi-key) per row
- stillForm: N/A

### OPT-003 — Additional option (추가옵션) group + value model
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/database/migrations/2026_04_01_000008_create_ecommerce_product_additional_options_table.php:14-25
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_product_additional_options + ecommerce_product_additional_option_values
- defaultTemplate: additional_option_group: name (json), is_required, sort_order; value: price_adjustment (KRW 0+), mc_price_adjustment (json by currency), is_default, is_active, allow_custom_text, sort_order
- stillForm: N/A

### OPT-004 — Additional option value (price add only)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/database/migrations/2026_06_24_000010_create_ecommerce_product_additional_option_values_table.php:15-31
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_product_additional_option_values
- defaultTemplate: additional_option_id, name (json), price_adjustment (>=0 KRW), mc_price_adjustment (json), is_default, is_active, allow_custom_text, sort_order
- stillForm: N/A

### OPT-005 — Option price add/subtract logic
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Models/ProductOption.php:94-117
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_order_options
- defaultTemplate: order_option: unit_price = product.selling_price + product_option.price_adjustment + additional_options_total; subtotal_price = unit_price * quantity; additional_options_total, mc_additional_options_total, additional_options_snapshot (json)
- stillForm: N/A

### OPT-006 — Additional option total aggregation (per unit)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Services/OrderCalculationService.php:480-516,524-532
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_order_options
- defaultTemplate: additional_options_total (unit-level KRW), mc_additional_options_total (per-currency), additional_options_snapshot (frozen JSON)
- stillForm: N/A

### OPT-007 — Per-option stock_quantity (integer) + safe_stock_quantity
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/database/migrations/2026_04_01_000007_create_ecommerce_product_options_table.php:25-26
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_product_options
- defaultTemplate: stock_quantity, safe_stock_quantity per option; product.stock_quantity = sum(active options.stock_quantity)
- stillForm: N/A

### OPT-008 — Product-level stock mirror of option sum
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Repositories/ProductRepository.php:1154-1176
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_products
- defaultTemplate: stock_quantity, safe_stock_quantity; for has_options=true → equals sum of active options.stock_quantity; updated via syncStockFromOptions()
- stillForm: N/A

### OPT-009 — Cart-level stock validation (add/update/changeOption)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Services/CartService.php:821-850
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no (auth optional via cart_key)
- config: none
- external: none
- dataMutation: ecommerce_carts (validate only)
- defaultTemplate: CartService::validateStock() — read product_option.stock_quantity, compare (current cart qty + requested), throw CartUnavailableException(reason=stock)
- stillForm: N/A

### OPT-010 — Stock decrement (order-time) with lock + transaction
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Services/StockService.php:68-116
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no (called in order flow)
- config: none
- external: none
- dataMutation: ecommerce_product_options (decrement/increment + flag)
- defaultTemplate: StockService::deductStock — DB::transaction + findWithLock + where stock_quantity>=quantity guard; is_stock_deducted flag prevents double-deduct; syncStockFromOptions re-syncs parent product
- stillForm: N/A

### OPT-011 — Idempotency flag is_stock_deducted
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Repositories/OrderOptionRepository.php:144-151
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_order_options (is_stock_deducted)
- defaultTemplate: is_stock_deducted (bool) — checked by deductStock() to skip already-deducted; restored/cancelled via clearStockDeductedForCancelledOptions(order_id, product_option_id)
- stillForm: N/A

### OPT-012 — Stock restore on cancel (per order option)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Services/OrderCancellationService.php:1127-1160
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: order_settings.stock_restore_on_cancel (default true)
- external: none
- dataMutation: ecommerce_product_options (increment) + ecommerce_products (sync)
- defaultTemplate: StockService::restoreStock/OptionStockForOrderOption — increment + clear is_stock_deducted for CANCELLED rows; syncStockFromOptions re-syncs
- stillForm: N/A

### OPT-013 — Concurrent stock protection (row lock + atomic update)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Repositories/ProductOptionRepository.php:207-223
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_product_options (decrement + lock)
- defaultTemplate: ProductOptionRepository::findWithLock() → lockForUpdate(); decrementStock() with where stock_quantity>=qty guard; StockService::deductStock uses DB::transaction
- stillForm: N/A

### OPT-014 — Stock decrement timing (payment-method-based)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Services/OrderProcessingService.php:215-220,1721-1727
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: order_settings.payment_methods.*.stock_deduction_timing (default payment_complete for card/phone/bank, order_placed for dbank/point/deposit/free)
- external: none
- dataMutation: ecommerce_product_options + ecommerce_order_options
- defaultTemplate: Stock deduct timing: order_placed | payment_complete | none — per payment method via getStockDeductionTiming($paymentMethodId)
- stillForm: N/A

### OPT-015 — Stock rededuct on cancel-revert (per-option)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Services/StockService.php:297-334
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_product_options + ecommerce_order_options
- defaultTemplate: StockService::redeductOrderOptionForReactivation — re-deduct single cancelled→active order option (lock + decrement + is_stock_deducted=true)
- stillForm: N/A

### OPT-016 — Order option source_type enum + self-referencing parent_option_id
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Enums/OrderOptionSourceTypeEnum.php:10-12
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_order_options
- defaultTemplate: source_type: order | exchange | split; parent_option_id for split children; splitOptions() relation
- stillForm: N/A

### OPT-017 — Cart row (option-bound + additional option selections)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/database/migrations/2026_06_24_000011_add_additional_option_selections_to_ecommerce_carts_table.php:14-21
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no (cart_key for guests)
- config: cart.max_quantity = 99, cart.guest_cart_lifetime minutes
- external: none
- dataMutation: ecommerce_carts
- defaultTemplate: cart row: user_id|cart_key, product_id, product_option_id, additional_option_selections (json [{additional_option_id, value_id}]), quantity; additional option selection hash for merge dedupe
- stillForm: N/A

### OPT-018 — Additional option selection validation (server SSoT)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Services/AdditionalOptionSelectionService.php:84-171
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_carts
- defaultTemplate: AdditionalOptionSelectionService::validateAndNormalize() — value_id must be active + belong to product; required group missing → 422; allow_custom_text choice requires custom_text in required group
- stillForm: N/A

### OPT-019 — Product sales_status enum (4 states)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Enums/ProductSalesStatus.php:10-13
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_products
- defaultTemplate: ProductSalesStatus enum: on_sale, suspended, sold_out, coming_soon — required for isPurchasable()
- stillForm: N/A

### OPT-020 — Product display_status enum (2 states)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Enums/ProductDisplayStatus.php:10-11
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_products
- defaultTemplate: ProductDisplayStatus enum: visible, hidden
- stillForm: N/A

### OPT-021 — Product tax_status enum + tax_rate
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Enums/ProductTaxStatus.php:10-11
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_products
- defaultTemplate: ProductTaxStatus enum: taxable, tax_free (with tax_rate default 10.00)
- stillForm: N/A

### OPT-022 — Product base schema (price/sku/sale/exposure/category/sort)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/database/migrations/2026_04_01_000005_create_ecommerce_products_table.php:15-59
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_products
- defaultTemplate: id, name (json), product_code (unique 50), sales_product_code (50 nullable), sku (100 nullable), brand_id, list_price (bigInt), selling_price (bigInt), currency_code (default KRW), stock_quantity (int, defaults 0), safe_stock_quantity (uint), sales_status (enum), display_status (enum), tax_status (enum), tax_rate (decimal 5,2 default 10), shipping_policy_id, common_info_id, min_purchase_qty (uint default 1), max_purchase_qty (uint default 0 = unlimited), purchase_restriction (none|restricted), allowed_roles (json array), description (mediumText json, html|text), description_mode (default text), meta_title/description/keywords, barcode, hs_code, has_options (bool default false), option_groups (mediumText json [{name,values}]), created_by, updated_by, timestamps, softDeletes
- stillForm: N/A

### OPT-023 — Product-Category many-to-many (with is_primary)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/database/migrations/2026_04_01_000015_create_ecommerce_product_categories_table.php:14-25
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_product_categories (pivot)
- defaultTemplate: pivot product_id + category_id + is_primary (bool); many-to-many with primary category accessor
- stillForm: N/A

### OPT-024 — Category tree (parent_id + materialized path)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/database/migrations/2026_04_01_000001_create_ecommerce_categories_table.php:15-37
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_categories
- defaultTemplate: id, name (json), description, parent_id, path (500 materialized "1/5/23"), depth, sort_order, is_active, slug, meta_title/description
- stillForm: N/A

### OPT-025 — Product image (hash-based url + collection + is_thumbnail)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/database/migrations/2026_04_01_000006_create_ecommerce_product_images_table.php:15-46
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: product.max_images=10, max_image_size=5MB, allowed_extensions=[jpg,jpeg,png,gif,webp]
- external: none
- dataMutation: ecommerce_product_images
- defaultTemplate: id, product_id, temp_key (staging), hash (12 unique url slug), original_filename, stored_filename (uuid), disk, path, url (cdn), mime_type, file_size, width/height, alt_text (json), collection (main|detail|additional), is_thumbnail, softDeletes
- stillForm: N/A

### OPT-026 — Stock consistency check (product vs options)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Models/Product.php:481-504
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_products.stock_quantity
- defaultTemplate: ProductService::validateStockConsistency() — asserts product.stock_quantity == sum(active options.stock_quantity) for has_options=true
- stillForm: N/A

### OPT-027 — Admin bulk price/stock update (increase/decrease/set)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Services/ProductService.php:535-590
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_products (price/sale_price), ecommerce_product_options (price_adjustment)
- defaultTemplate: bulkUpdatePrice(ids, method=increase|decrease|fixed, value, unit=won|percent) — option bulkUpdatePriceByMixedIds; product bulkUpdatePrice same interface
- stillForm: N/A

### OPT-028 — Admin bulk stock update with product mirror sync
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Services/ProductOptionService.php:118-153
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_products.stock_quantity + ecommerce_product_options.stock_quantity
- defaultTemplate: bulkUpdateStock(ids, method=set|increase|decrease, value); option bulkUpdateStockByMixedIds; syncStockFromOptions auto-syncs parent
- stillForm: N/A

### OPT-029 — Order option row schema (snapshot + discounts + multi-currency)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/database/migrations/2026_04_01_000018_create_ecommerce_order_options_table.php:15-75
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_order_options
- defaultTemplate: order_option: order_id, parent_option_id, product_id (restrictOnDelete), product_option_id (restrictOnDelete), option_status (OrderStatusEnum), is_stock_deducted, source_type (OrderOptionSourceTypeEnum), source_option_id, sku, product_name (json), product_option_name (json), option_name (json), option_value (json), quantity, cancelled_quantity (cancel_reason), unit_weight/volume, subtotal_weight/volume, unit_price, additional_options_total, subtotal_price + discount columns, mc_* multi-currency json, product_snapshot, option_snapshot, additional_options_snapshot, promotions_applied_snapshot, external_option_id (NaverPay etc.), external_meta, confirmed_at, delivered_at
- stillForm: N/A

### OPT-030 — Stock hooks (deduct/restore before/after)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Services/StockService.php:70,115,126,157
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_order_options + ecommerce_product_options + ecommerce_products
- defaultTemplate: HookManager::doAction('sirsoft-ecommerce.stock.before_deduct'|'stock.after_deduct'|'stock.before_restore'|'stock.after_restore', $order) — fire from StockService; no in-module subscribers
- stillForm: N/A

### OPT-031 — Option stock change → product sync (listener)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Listeners/SyncProductFromOptionListener.php:40-54
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_products.stock_quantity (sync via updateStockQuantity)
- defaultTemplate: SyncProductFromOptionListener subscribes 'sirsoft-ecommerce.product_option.after_bulk_stock_update' and 'sirsoft-ecommerce.option.after_bulk_update' — re-sums options→product stock_quantity and fires 'sirsoft-ecommerce.product.after_stock_sync' for activity log
- stillForm: N/A

### OPT-032 — Per-product min/max purchase qty enforcement (cart)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Services/CartService.php:892-922
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_carts (validate only)
- defaultTemplate: CartService::validatePurchaseQuantityLimit — product.min_purchase_qty (default 1) and max_purchase_qty (0=unlimited); aggregates quantity across all same-product cart lines
- stillForm: N/A

### OPT-033 — Out-of-stock validation exception
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/src/Exceptions/InsufficientStockException.php:12
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_order_options
- defaultTemplate: InsufficientStockException thrown by StockService; messages lang key 'sirsoft-ecommerce::messages.stock.insufficient' / '.option_not_found'
- stillForm: N/A

### OPT-034 — SKU (product + per-option)
- domain: product_options_inventory
- source: modules/sirsoft-ecommerce/database/migrations/2026_04_01_000005_create_ecommerce_products_table.php:20; 2026_04_01_000007_create_ecommerce_product_options_table.php:33
- adminUI: NONE
- publicUI: NONE
- api: NONE
- auth: no
- config: none
- external: none
- dataMutation: ecommerce_product_options (sku)
- defaultTemplate: per-option sku (100 nullable) + product-level sku (100 nullable); product_code (50 unique); sales_product_code (50 nullable)
- stillForm: N/A


## core-order-status

> notes: Module: sirsoft-ecommerce v1.1.2 (module.json:8; composer.json:5). Authoritative copy: modules/sirsoft-ecommerce (active, with vendor/). modules/_bundled/sirsoft-ecommerce is identical except vendor/ subdir absent (diff -rq shows ONLY vendor/ difference). Reading boundary per project rules. Required g7_version >=7.0.7. PHP ^8.2 + ezyang/htmlpurifier. PSR-4: Modules\Sirsoft\Ecommerce\, src/Helpers/helpers.php, upgrades/, seeders/. 77 migrations (2026_04_01_000001..2026_06_22_000001).
Order lifecycle states (OrderStatusEnum): pending_order, pending_payment, payment_complete, shipping_hold, preparing, shipping_ready, shipping, delivered, confirmed, cancelled. Forward-jump allowed; reverse whitelist limited (OrderStatusEnum.php:360-365). CANCELLED is gated separately by OrderCancellationService. Progress order is single SSoT (OrderStatusEnum::progressOrder).
Payment status (PaymentStatusEnum): ready, in_progress, waiting_deposit, paid, partial_cancelled, cancelled, failed, expired. isAwaitingDeposit() = {ready, waiting_deposit} — SSoT for 입금확인 button visibility.
Shipping status (ShippingStatusEnum): pending, preparing, ready, shipped, in_transit, out_for_delivery, delivered, failed, returned, pickup_ready, pickup_complete.
Cancel status (CancelStatusEnum): requested, completed (REQUESTED→COMPLETED; isFinal=COMPLETED). CancelOptionStatusEnum: same pair. CancelTypeEnum: full, partial (PARTIAL is derived when ≥2 active options remain; auto-upgrades to FULL when cancel map covers all).
Refund status (RefundStatusEnum): requested, approved, processing, on_hold, completed, rejected. RefundOptionStatusEnum: same. RefundMethodEnum: pg, bank, points. RefundPriorityEnum: pg_first, points_first.
Claim reasons (ClaimReasonTypeEnum): refund only (exchange/return reserved). Fault type (ClaimReasonFaultTypeEnum): customer, seller, carrier.
Payment methods (PaymentMethodEnum): card, vbank, dbank, phone, bank, point, deposit, free. Extension IDs via plugins (e.g. nhnkcp_naverpay). payment_method column stored as plain string (no enum cast) — paymentMethodId() helper handles BackedEnum fallback.
Order model — SoftDeletes, ActivityLog fields [order_status, total_amount, total_paid_amount, total_discount_amount, total_shipping_amount, total_cancelled_amount, total_refunded_amount, admin_memo, paid_at, confirmed_at]. Hidden: guest_lookup_password_hash. Casts: order_status=OrderStatusEnum, order_device=DeviceTypeEnum, currency_snapshot=array, all monetary=decimal:2, MC*=array, weight/volume=decimal:3.
Cancellable statuses default [pending_order, pending_payment, payment_complete]; admin override via order_settings.cancellable_statuses setting. Confirmable statuses default [shipping, delivered] (order_settings.confirmable_statuses). Partial-cancelled is derived (no separate status) since 2026-06-22. PENDING_ORDER hidden from list/statistics by default (OrderStatusEnum::listHiddenStatuses).
Order creation flow — OrderProcessingService::createFromTempOrder (line 98) — recalculates with OrderCalculationService, validates eligibility/country, validates amount + mileage policy, asserts chargeable currency, DB transaction creates order (initial status via determineInitialStatus — PAYMENT_COMPLETE if final≤0; PENDING_PAYMENT for vbank/dbank; PENDING_ORDER for PG), options, addresses, payment, shippings. Coupon use + mileage deduct (timing-gated) + stock deduct (timing-gated) inside transaction. After: admin notify hook (non-PG/0원 only); 0원 fires full payment_complete hook chain.
Order payment completion — OrderProcessingService::completePayment (line 1644). SSoT for PG callback + admin manual. Idempotent. Updates order to PAYMENT_COMPLETE + total_paid_amount/total_due_amount; payment.status=PAID with PG response fields; mileage deduct (payment_complete timing); mileage earn; stock deduct; hooks after_payment_complete/after_confirm/after_admin_notify; temp_order cleanup; shipping address auto-save.
Order cancel — OrderCancellationService::cancelOrder (line 155) / cancelOrderOptions (line 206). executeCancellation (line 270) — validate cancellable, validate items, apply refund bank, hook payment.before_cancel, hook order.before_cancel, recalc adjustment via OrderAdjustmentService, validateRefundNotNegative (blocks negative refund), DB transaction: create OrderCancel, create CancelOptions, update OrderOptions (status + quantity split), applyOptionUpdates, updateShippings, updateOrderTotals (cumulative), if paid create OrderRefund + RefundOptions + updatePayment (CANCELLED vs PARTIAL_CANCELLED) + executePgRefund (filter hook), restore coupons/mileage/stock, finalizeStatus (Cancel=COMPLETED; Refund: PG→COMPLETED, BANK/POINTS→APPROVED awaiting manual complete). After: cash receipt sync (failed-history logging), order.after_cancel OR after_partial_cancel hook.
Admin order endpoints (api.php:1280-1361) — GET / (index), PATCH /bulk, GET /{order}, PATCH /{order}, DELETE /{order}, GET /{order}/logs, POST /{order}/send-email, PATCH /{order}/options/bulk-status, POST /{order}/estimate-refund, POST /{order}/cancel, PATCH /{order}/confirm-deposit, POST /{order}/reset-guest-lookup-password, POST /{order}/cash-receipt, DELETE /{order}/cash-receipt, POST /{order}/cash-receipt/reissue.
Admin FormRequests (src/Http/Requests/Admin/) — OrderListRequest, UpdateOrderRequest (withValidator enforces canTransitionTo), BulkUpdateOrdersRequest (withValidator enforces bulk transition + shipping info required for shipping statuses), BulkChangeOrderOptionStatusRequest, CancelOrderRequest (withValidator: cancellable check + refund_bank conditional + cancel items), EstimateRefundRequest, ConfirmDepositRequest (dbank only + isAwaitingDeposit check), OrderLogsRequest, SendOrderEmailRequest, ResetGuestLookupPasswordRequest, StoreEcommerceSettingsRequest (order_settings.* + limits SSoT).
Permissions (module.php:60-198) — orders category: read + update (no separate delete in spec; delete via controller middleware sirsoft-ecommerce.orders.delete). user-orders 

### MOD-VER-001 — Module version + copy identity
- domain: ecommerce core
- source: modules/sirsoft-ecommerce/module.json:8
- adminUI: admin orders index (api)
- publicUI: NONE
- api: Route::prefix('orders') in modules/sirsoft-ecommerce/src/routes/api.php:1280-1361
- auth: n/a
- config: none
- external: none
- dataMutation: ecommerce_orders, ecommerce_order_options, ecommerce_order_payments, ecommerce_order_shippings, ecommerce_order_addresses, ecommerce_order_cancels, ecommerce_order_refunds, ecommerce_order_cancel_options, ecommerce_order_refund_options
- defaultTemplate: none (module is framework-level; surfaced by sirsoft-basic / custom templates)
- stillForm: n/a

### ORD-STATUS-001 — OrderStatusEnum values + transitions + admin status-change gate
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Enums/OrderStatusEnum.php:8-394
- adminUI: NONE (status values are exposed via OrderListRequest FormRequest rules)
- publicUI: NONE (read by API + FormRequest)
- api: rules + filter logic
- auth: admin orders.update permission
- config: order_settings.cancellable_statuses, order_settings.confirmable_statuses
- external: none
- dataMutation: ecommerce_orders.order_status, ecommerce_order_options.option_status
- defaultTemplate: enums/order_status.* lang keys (ko/en)
- stillForm: enums.order_status.*

### PAY-STATUS-001 — PaymentStatusEnum values
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Enums/PaymentStatusEnum.php:8-94
- adminUI: NONE (consumed by payment admin views and OrderResource)
- publicUI: NONE
- api: OrderPayment.casts
- auth: n/a
- config: none
- external: PG provider (card/vbank/bank/phone)
- dataMutation: ecommerce_order_payments.payment_status, cancel_history
- defaultTemplate: enums/payment_status.* lang keys
- stillForm: enums.payment_status.*

### SHIP-STATUS-001 — ShippingStatusEnum values + carrier/tracking fields
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Enums/ShippingStatusEnum.php:8-86
- adminUI: Shipping info editing in admin order detail
- publicUI: member/guest order tracking
- api: OrderShipping casts + tracker URL
- auth: orders.update (admin), orders.read (mypage)
- config: none
- external: shipping carrier API (optional)
- dataMutation: ecommerce_order_shippings
- defaultTemplate: enums/shipping_status.*
- stillForm: enums.shipping_status.*

### CANCEL-001 — CancelStatusEnum + CancelOptionStatusEnum + CancelTypeEnum (full/partial)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Enums/CancelStatusEnum.php:8-79; src/Enums/CancelOptionStatusEnum.php:8-69; src/Enums/CancelTypeEnum.php:8-69
- adminUI: admin cancel modal (full/partial)
- publicUI: member/guest cancel request
- api: CancelOrderRequest + OrderCancellationService.cancelOrder / cancelOrderOptions
- auth: admin orders.update OR user orders.cancel
- config: order_settings.cancellable_statuses, order_settings.stock_restore_on_cancel
- external: PG refund listener (sirsoft-ecommerce.payment.refund filter)
- dataMutation: ecommerce_order_cancels, ecommerce_order_refunds, ecommerce_order_cancel_options, ecommerce_order_refund_options, ecommerce_order_options, ecommerce_orders, ecommerce_order_payments
- defaultTemplate: enums/cancel_status, enums/cancel_option_status, enums/cancel_type
- stillForm: enums.cancel_*

### REFUND-001 — RefundStatusEnum (requested/approved/processing/on_hold/completed/rejected) + RefundMethodEnum (pg/bank/points) + RefundOptionStatusEnum + RefundPriorityEnum
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Enums/RefundStatusEnum.php:8-86; RefundMethodEnum.php:8-70; RefundOptionStatusEnum.php:8-77; RefundPriorityEnum.php:8-56
- adminUI: admin refund confirm screen
- publicUI: none (admin-only flow)
- api: OrderRefund + finalizeStatus
- auth: orders.update
- config: none (SSoT via enums)
- external: PG refund listener
- dataMutation: ecommerce_order_refunds.refund_status, .refund_method, .pg_transaction_id, .refund_bank_*
- defaultTemplate: enums/refund_status, enums/refund_method, enums/refund_option_status, enums/refund_priority
- stillForm: enums.refund_*

### CLAIM-001 — ClaimReasonTypeEnum (refund only — exchange/return reserved) + ClaimReasonFaultTypeEnum (customer/seller/carrier)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Enums/ClaimReasonTypeEnum.php:8-46; ClaimReasonFaultTypeEnum.php:8-46
- adminUI: admin claim reason management
- publicUI: none (admin reason CRUD)
- api: CancelOrderRequest.reason + OrderCancellationService
- auth: admin claim_reasons CRUD
- config: ecommerce_claim_reasons (seeded table)
- external: none
- dataMutation: ecommerce_order_cancels.cancel_reason_type, ecommerce_claim_reasons
- defaultTemplate: enums/claim_reason_type + enums/claim_reason_fault_type
- stillForm: enums.claim_reason_*

### PAY-METHOD-001 — PaymentMethodEnum (card/vbank/dbank/bank/phone/point/deposit/free) + ability methods (isPgPayment, needsPgProvider, needsRefundBankAccount, resolveCashEquivalentAmount)
- domain: payment
- source: modules/sirsoft-ecommerce/src/Enums/PaymentMethodEnum.php:8-132
- adminUI: none directly
- publicUI: checkout payment selector
- api: checkout/payment integration
- auth: n/a
- config: order_settings.payment_methods[] + per-method pg_provider/stock_deduction_timing/mileage_deduction_timing
- external: PG plugin registration (extension ID like nhnkcp_naverpay)
- dataMutation: ecommerce_order_payments.payment_method, payment_status
- defaultTemplate: enums/payment_method
- stillForm: enums.payment_method.*

### ORD-CREATE-001 — Order creation flow (TempOrder → recalc → DB txn → hooks)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Services/OrderProcessingService.php:98-250
- adminUI: none
- publicUI: checkout submit
- api: OrderProcessingService.createFromTempOrder
- auth: member OR guest (GuestOrderAuthService)
- config: currency, currency conversion rates, country shipping policies
- external: currency conversion service
- dataMutation: ecommerce_orders + ecommerce_order_options + ecommerce_order_addresses + ecommerce_order_payments + ecommerce_order_shippings
- defaultTemplate: none directly (orchestrated)
- stillForm: n/a

### ORD-PAYMENT-001 — Order payment-completion SSoT (PG callback + admin manual)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Services/OrderProcessingService.php:1644-1779
- adminUI: none (internal)
- publicUI: none
- api: OrderProcessingService.completePayment
- auth: PG plugin listener OR admin orders.update
- config: payment_methods.*.stock_deduction_timing, .mileage_deduction_timing
- external: PG callback (paid)
- dataMutation: ecommerce_orders.order_status=PAYMENT_COMPLETE, paid_at, total_paid_amount, total_due_amount=0; ecommerce_order_payments.payment_status=PAID; ecommerce_order_options.option_status (sync)
- defaultTemplate: none
- stillForm: n/a

### ORD-LIST-001 — Admin order list — search by order_number / orderer/recipient name+phone / product_name / sku; date range by date_type; order_status/option_status multi-select; shipping_type multi; payment_method multi (incl. extension IDs); category_id; min/max total_amount; min/max shipping; shipping_policy_id; user_id; member_type (member/guest); country_codes
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/OrderController.php:60-83; src/Http/Requests/Admin/OrderListRequest.php:34-109; src/Repositories/OrderRepository.php:206-444
- adminUI: admin order list (filter/search/paginate)
- publicUI: none
- api: Admin/OrderController.index + OrderRepository.getListWithFilters
- auth: sirsoft-ecommerce.orders.read
- config: none
- external: none
- dataMutation: ecommerce_orders (read only)
- defaultTemplate: none
- stillForm: filters used in admin views

### ORD-DETAIL-001 — Admin order detail with all relations (user, options, addresses, payment, shippings, cancels, cashReceipts)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/OrderController.php:91-118; src/Repositories/OrderRepository.php:160-183
- adminUI: admin order detail
- publicUI: none
- api: Admin/OrderController.show + OrderResource
- auth: sirsoft-ecommerce.orders.read
- config: none
- external: none
- dataMutation: ecommerce_orders (read)
- defaultTemplate: none
- stillForm: n/a

### ORD-UPDATE-001 — Admin order update — order_status (gate via OrderStatusEnum::canTransitionTo), admin_memo, recipient/domestic+intl address fields, delivery_memo; IDV guard if transitioning to PAYMENT_COMPLETE
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/OrderController.php:127-152; src/Services/OrderService.php:166-349; src/Http/Requests/Admin/UpdateOrderRequest.php:30-87
- adminUI: admin order edit form
- publicUI: none
- api: Admin/OrderController.update + OrderService.update
- auth: sirsoft-ecommerce.orders.update
- config: none
- external: Identity verification (sirsoft-ecommerce.payment.before_confirm_deposit OR before_approve)
- dataMutation: ecommerce_orders, ecommerce_order_addresses (recipient)
- defaultTemplate: none
- stillForm: n/a

### ORD-BULK-001 — Admin bulk order status update + shipping info bulk set (carrier_id/tracking_number); PENDING_ORDER excluded from bulk status; stock rededuct on cancel→sales reactivation
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/OrderController.php:160-186; src/Services/OrderService.php:399-477; src/Http/Requests/Admin/BulkUpdateOrdersRequest.php:33-105
- adminUI: admin order bulk-update
- publicUI: none
- api: Admin/OrderController.bulkUpdate + OrderService.bulkUpdate
- auth: sirsoft-ecommerce.orders.update
- config: none
- external: Identity verification if PAYMENT_COMPLETE bulk
- dataMutation: ecommerce_orders, ecommerce_order_options, ecommerce_order_shippings
- defaultTemplate: none
- stillForm: n/a

### ORD-OPT-BULK-001 — Admin per-option status change with quantity split + carrier/tracking metadata
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/OrderController.php:223-273; src/Http/Requests/Admin/BulkChangeOrderOptionStatusRequest.php:33-113
- adminUI: admin order bulk option-status change
- publicUI: none
- api: Admin/OrderController.bulkChangeOptionStatus + OrderOptionService.bulkChangeStatusWithQuantity
- auth: sirsoft-ecommerce.orders.update
- config: none
- external: none
- dataMutation: ecommerce_order_options, ecommerce_order_shippings
- defaultTemplate: none
- stillForm: n/a

### ORD-PREVIEW-001 — Admin refund preview (AdjustmentResult.toPreviewArray)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/OrderController.php:311-339; src/Services/OrderCancellationService.php:244-252
- adminUI: none (used by admin cancel modal preview)
- publicUI: none
- api: Admin/OrderController.estimateRefund + OrderCancellationService.previewRefund
- auth: sirsoft-ecommerce.orders.update
- config: none
- external: none
- dataMutation: read-only (preview)
- defaultTemplate: none
- stillForm: n/a

### ORD-DELETE-001 — Admin order soft delete (explicit child deletion — no DB CASCADE)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/OrderController.php:194-214; src/Services/OrderService.php:357-379
- adminUI: admin order list (action button)
- publicUI: none
- api: Admin/OrderController.destroy + OrderService.delete
- auth: sirsoft-ecommerce.orders.delete
- config: none
- external: none
- dataMutation: ecommerce_orders + cascades (taxInvoices, shippings, addresses, cashReceipts, payment, options) — soft-delete
- defaultTemplate: none
- stillForm: n/a

### ORD-LOGS-001 — Admin order activity log (order + options + addresses)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/OrderController.php:526-546; src/Services/OrderService.php:388-391
- adminUI: admin activity log timeline
- publicUI: none
- api: Admin/OrderController.logs + OrderService.getActivityLogs + OrderRepository.getActivityLogsForOrder
- auth: sirsoft-ecommerce.orders.read
- config: none
- external: ActivityLogService
- dataMutation: read (activity log table)
- defaultTemplate: none
- stillForm: n/a

### ORD-EMAIL-001 — Admin ad-hoc order email to customer (Mail::raw + subject)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/OrderController.php:282-302; src/Services/OrderService.php:592-625
- adminUI: admin order email send
- publicUI: none
- api: Admin/OrderController.sendEmail + OrderService.sendEmail
- auth: sirsoft-ecommerce.orders.update
- config: none
- external: Mail driver
- dataMutation: none
- defaultTemplate: none
- stillForm: n/a

### ORD-CANCEL-001 — Admin order cancel (full/partial) — validates cancellable_statuses, refund_priority (pg_first/points_first), refund_bank (vbank-paid required)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/OrderController.php:348-409; src/Http/Requests/Admin/CancelOrderRequest.php:40-343; src/Services/OrderCancellationService.php:155-410
- adminUI: admin cancel modal (full/partial)
- publicUI: none
- api: Admin/OrderController.cancelOrder + OrderCancellationService.cancelOrder/cancelOrderOptions
- auth: sirsoft-ecommerce.orders.update
- config: order_settings.cancellable_statuses (default: [payment_complete])
- external: PG refund filter (sirsoft-ecommerce.payment.refund), Identity verification (sirsoft-ecommerce.payment.before_cancel)
- dataMutation: see CANCEL-001 (full transaction)
- defaultTemplate: none
- stillForm: n/a

### ORD-DEPOSIT-001 — Admin manual deposit confirmation (dbank only, exact-amount match, PaymentAmountMismatchException on mismatch)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/OrderController.php:421-470; src/Http/Requests/Admin/ConfirmDepositRequest.php:35-149; src/Services/OrderProcessingService.php:1806-1879
- adminUI: admin confirm-deposit button (dbank only)
- publicUI: none
- api: Admin/OrderController.confirmDeposit + OrderProcessingService.confirmManualDeposit
- auth: sirsoft-ecommerce.orders.update
- config: none
- external: Identity verification (sirsoft-ecommerce.payment.before_confirm_deposit)
- dataMutation: ecommerce_order_payments (PAID), ecommerce_orders (PAYMENT_COMPLETE if mark_order_complete)
- defaultTemplate: none
- stillForm: n/a

### ORD-GUEST-PWD-001 — Admin reset guest order lookup password (hash only, no plaintext)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Admin/OrderController.php:482-517; src/Services/OrderService.php:851-862
- adminUI: admin reset guest password action
- publicUI: none (admin only)
- api: Admin/OrderController.resetGuestLookupPassword + OrderService.resetGuestLookupPassword
- auth: sirsoft-ecommerce.orders.update
- config: none
- external: none
- dataMutation: ecommerce_orders.guest_lookup_password_hash (Hash::make)
- defaultTemplate: none
- stillForm: n/a

### ORD-ADDR-001 — Admin update shipping address (KR/intl side mutually exclusive; domestic is NOT NULL so intl side stored as empty string)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Services/OrderService.php:643-762
- adminUI: admin shipping address override
- publicUI: none
- api: OrderService.updateShippingAddress
- auth: sirsoft-ecommerce.orders.update
- config: none
- external: none
- dataMutation: ecommerce_order_addresses (domestic + intl split)
- defaultTemplate: none
- stillForm: n/a

### ORD-CONFIRM-001 — Purchase-confirmation (per-option). Default confirmable_statuses = [shipping, delivered]
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Services/OrderService.php:763-840
- adminUI: none (used by member/guest confirm)
- publicUI: member + guest confirm
- api: OrderService.confirmOption
- auth: user orders.confirm OR guest orders.confirm-option
- config: order_settings.confirmable_statuses (default: [shipping, delivered])
- external: none
- dataMutation: ecommerce_order_options.option_status=CONFIRMED, .confirmed_at; ecommerce_orders.order_status=CONFIRMED if all options confirmed
- defaultTemplate: none
- stillForm: n/a

### ORD-PG-REFUND-001 — PG refund hook — executePgRefund uses HookManager::applyFilters('sirsoft-ecommerce.payment.refund', $defaults, $order, $payment, $amount_local, $reason, $refund) — payment currency local amount; PG-method only triggers for payment methods with needsPgProvider()
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Services/OrderCancellationService.php:1009-1060
- adminUI: none
- publicUI: none
- api: HookManager filter 'sirsoft-ecommerce.payment.refund'
- auth: n/a
- config: none
- external: PG provider plugin registered filter listener
- dataMutation: ecommerce_order_refunds (pg_transaction_id, refund_status, refunded_at, pg_error_*)
- defaultTemplate: none
- stillForm: n/a

### ORD-STATS-001 — Order statistics — total count, status_counts (excludes hidden PENDING_ORDER), today_count, today_revenue, monthly_revenue (excludes CANCELLED). Cached via cache.stats_enabled with cache.stats_ttl (default 1800s). Invalidate via forgetStatisticsCache()
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Repositories/OrderRepository.php:564-645
- adminUI: admin order list + dashboard stats
- publicUI: none
- api: OrderController.index + Repository.computeStatistics
- auth: sirsoft-ecommerce.orders.read
- config: g7_core_settings('cache.stats_enabled', true), g7_core_settings('cache.stats_ttl', 1800)
- external: none
- dataMutation: none (read + cache invalidation on write)
- defaultTemplate: none
- stillForm: n/a

### ORD-USER-STATS-001 — Per-user order statistics — pending_payment, payment_complete, preparing (PREPARING+SHIPPING_READY aggregate), shipping, delivered, confirmed. Excludes PENDING_ORDER hidden. Partial-cancelled counts towards remaining state
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Repositories/OrderRepository.php:650-677
- adminUI: member mypage counter badges
- publicUI: mypage counters
- api: User/OrderController (not detailed here)
- auth: member auth
- config: none
- external: none
- dataMutation: none
- defaultTemplate: none
- stillForm: n/a

### ORD-MILEAGE-TIMING-001 — Mileage deduction timing — order_placed (default for dbank) vs payment_complete (default for card). Zero-amount orders always deduct at order creation
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Services/OrderProcessingService.php:209-213, 1711-1714
- adminUI: none
- publicUI: none
- api: OrderProcessingService.deductMileageForOrder + completePayment timing branch
- auth: n/a
- config: order_settings.payment_methods[].mileage_deduction_timing
- external: Mileage system listener
- dataMutation: ecommerce_mileage_transactions; ecommerce_orders.is_mileage_deducted; ecommerce_orders.total_points_used_amount
- defaultTemplate: none
- stillForm: n/a

### ORD-STOCK-TIMING-001 — Stock deduction timing — order_placed (default for dbank) vs payment_complete (default for card/vbank)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Services/OrderProcessingService.php:216-220, 1721-1727
- adminUI: none
- publicUI: none
- api: OrderProcessingService.deductStock + clearOrderedCartItems
- auth: n/a
- config: order_settings.payment_methods[].stock_deduction_timing
- external: StockService
- dataMutation: ecommerce_products/options stock; ecommerce_carts
- defaultTemplate: none
- stillForm: n/a

### ORD-INIT-STATUS-001 — Initial order status rules — PAYMENT_COMPLETE if final_amount≤0 (full mileage/deposit); PENDING_PAYMENT for vbank/dbank; PENDING_ORDER for PG(card/account/phone)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Services/OrderProcessingService.php:326-341
- adminUI: none
- publicUI: none
- api: OrderProcessingService::createFromTempOrder initial status
- auth: n/a
- config: none
- external: none
- dataMutation: ecommerce_orders.order_status
- defaultTemplate: none
- stillForm: n/a

### ORD-SORT-001 — Sortable columns — id/order_number/order_status/total_amount/total_shipping_amount/total_paid_amount/ordered_at/paid_at/created_at (+ related shipped_at via order_shippings)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Repositories/OrderRepository.php:99-126, 404-411
- adminUI: admin order list sort
- publicUI: none
- api: OrderRepository::getListWithFilters sort
- auth: sirsoft-ecommerce.orders.read
- config: none
- external: none
- dataMutation: read
- defaultTemplate: none
- stillForm: n/a

### ORD-GUEST-PWD-002 — Guest lookup password — hashed only (Hash::make); never serialised; per-route bcrypt verify; resettable by admin
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Models/Order.php:144-146; src/Services/OrderService.php:851-862; migrations/2026_06_02_000001_add_guest_lookup_password_hash_to_ecommerce_orders_table.php
- adminUI: none (privacy — exposed in OrderResource)
- publicUI: guest/orders/verify + lookup
- api: Order model $hidden + migration 2026_06_02_000001
- auth: guest (password) OR admin orders.update
- config: none
- external: none
- dataMutation: ecommerce_orders.guest_lookup_password_hash
- defaultTemplate: none
- stillForm: n/a

### ORD-PARTIAL-CONVERT-001 — Full vs partial cancel — auto-converts to FULL when all active options covered. Partial requires active_options ≥ 2 (Order::isPartialCancellable)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Services/OrderCancellationService.php:498-517; src/Models/Order.php:547-558
- adminUI: none
- publicUI: none
- api: OrderCancellationService::cancelOrder branch logic
- auth: orders.update OR user orders.cancel
- config: none
- external: none
- dataMutation: read of options + payment
- defaultTemplate: none
- stillForm: n/a

### ORD-CANCEL-SIDE-001 — Cancel side-effects — coupon restore (hook), mileage restore (only if is_mileage_deducted=true, warning-logged on failure), stock restore (gated by order_settings.stock_restore_on_cancel, default true)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Services/OrderCancellationService.php:1068-1160
- adminUI: none
- publicUI: none
- api: OrderCancellationService::restoreCoupons / restoreMileage / restoreStock
- auth: n/a
- config: order_settings.stock_restore_on_cancel
- external: Coupon/mileage/stock listeners via hooks
- dataMutation: ecommerce_coupons state, ecommerce_mileage_transactions, ecommerce_products stock
- defaultTemplate: none
- stillForm: n/a

### ORD-ROUTE-BIND-001 — Route model binding — numeric {order} → id; non-numeric → order_number (unique)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Models/Order.php:55-66
- adminUI: none
- publicUI: none
- api: Order model resolveRouteBinding + Order::isGuestOrder
- auth: n/a
- config: none
- external: none
- dataMutation: none (read)
- defaultTemplate: none
- stillForm: n/a

### ORD-CASTS-001 — Order hidden fields — guest_lookup_password_hash only (model-level privacy). MC columns cast as 'array' (JSON). All amounts decimal:2 (weight/volume decimal:3)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Models/Order.php:70-209
- adminUI: none (cross-cutting)
- publicUI: none
- api: Order model $hidden + $casts
- auth: n/a
- config: none
- external: none
- dataMutation: none (read)
- defaultTemplate: none
- stillForm: n/a

### ORD-CANCEL-ELIGIBLE-001 — Cancel eligibility — defaults [PENDING_ORDER, PENDING_PAYMENT, PAYMENT_COMPLETE]; admin may extend via cancellable_statuses setting. Partial-cancelled is a derived flag (no separate status) — based on cancelled options + remaining active options count
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Models/Order.php:465-594
- adminUI: none
- publicUI: none
- api: Order::isCancellable / Order::isPartiallyCancelled / Order::isConfirmable
- auth: n/a
- config: order_settings.cancellable_statuses
- external: none
- dataMutation: none (read)
- defaultTemplate: none
- stillForm: n/a

### ORD-STATUS-GATE-001 — Order status state-machine — 9 progress statuses (pending_order → pending_payment → payment_complete → shipping_hold → preparing → shipping_ready → shipping → delivered → confirmed) + cancelled. Forward jumps allowed; reverse whitelist: PREPARING↔SHIPPING_HOLD, SHIPPING→{SHIPPING_READY, PREPARING}, DELIVERED→SHIPPING. CANCELLED → salesEligibleStatuses (reactivation). Sync-excluded for option status = [CANCELLED]
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Enums/OrderStatusEnum.php:340-394
- adminUI: none
- publicUI: none
- api: OrderStatusEnum.canTransitionTo / allowedTransitions / progressOrder / syncExcludedStatuses
- auth: n/a
- config: none
- external: none
- dataMutation: none (read)
- defaultTemplate: none
- stillForm: n/a

### ORD-HOOKS-001 — Order lifecycle hooks — before_create/after_create/before_update/after_update/before_bulk_update/after_bulk_update/before_delete/after_delete/after_read/before_cancel/after_cancel/after_partial_cancel/before_payment_complete/after_payment_complete/after_confirm/after_status_change/after_purchase_confirmed/before_reset_guest_password/after_reset_guest_password/after_admin_notify/payment.before_confirm_deposit/payment.before_cancel/payment.before_approve/payment.refund/coupon.use/coupon.restore/mileage.earn/mileage.restore
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Services/OrderProcessingService.php (multiple); src/Services/OrderService.php (multiple); src/Services/OrderCancellationService.php (multiple)
- adminUI: none
- publicUI: none
- api: HookManager doAction/applyFilters
- auth: n/a
- config: none
- external: listener plugins
- dataMutation: various (by listener)
- defaultTemplate: none
- stillForm: n/a

### ORD-NOTIFY-001 — Notification definitions — orderConfirmed, orderPendingDeposit, orderShipped, orderDelivered, orderCompleted, orderCancelled (mapped from order.after_status_change by OrderStatusNotificationListener)
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/module.php:1277-1282
- adminUI: none
- publicUI: none
- api: events from module.php getNotificationDefinitions
- auth: n/a
- config: none
- external: notification channels
- dataMutation: none
- defaultTemplate: none
- stillForm: n/a

### ORD-DELETE-POLICY-001 — Order deletion policy — SoftDeletes (deleted_at). Admin must explicitly delete child relations first: taxInvoices, shippings, addresses, cashReceipts, payment, options. No DB-level CASCADE
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Models/Order.php:22; src/Services/OrderService.php:357-379; migrations/2026_04_01_000017_create_ecommerce_orders_table.php:54
- adminUI: admin order detail page
- publicUI: none
- api: none (DB columns only)
- auth: sirsoft-ecommerce.orders.delete
- config: none
- external: none
- dataMutation: none (read)
- defaultTemplate: none
- stillForm: n/a

### ORD-CASHRECEIPT-001 — Cash receipt sync after cancel — only dbank cash-equivalent amount. On full cancel, cancel receipt. On partial cancel, cancel all then re-issue residual. Errors swallowed + logged error; FAILED history entry created for admin recovery
- domain: order lifecycle
- source: modules/sirsoft-ecommerce/src/Services/OrderCancellationService.php:128-139
- adminUI: none
- publicUI: none
- api: Order::isCancellable + syncCashReceipt hook
- auth: n/a
- config: order_settings.cash_receipt_self_issue / cash_receipt_provider
- external: CashReceiptService provider
- dataMutation: ecommerce_order_cash_receipts (issued, cancelled, reissued)
- defaultTemplate: none
- stillForm: n/a


## cart-checkout-shipping

> notes: Cart uniqueness: same (user_id|cart_key) + same product_option_id + same additional_option_selections hash merges quantity (CartService.php:200-260, Cart.php:123-152). Distinct additional_option_selections or distinct custom_text => separate line.
Guest merge: CartController merge -> CartService.mergeGuestCartToUser (DB transaction, same hash merges, distinct becomes user_id row, clamps via cart.max_quantity + product.max_purchase_qty, exposes getLastMergeAdjustments).
Direct (buy-now) creates transient Cart in-memory without row: TempOrderService.buildTransientCartItems (lines 214-292).
Address book: UserAddress scopes default / byCountry / domestic / international; first address auto-default; setDefaultAddress swaps; mapShippingInfoToAddressData B4 maps intl_* -> city/state/postal_code; toOrderAddressData builds OrderAddress row.
save_shipping_address: member-only; non-PG saves immediately, PG defers via order_meta{ save_shipping_address:true, shipping_info_for_save } and OrderProcessingService.completePayment writes it.
same_as_orderer: UI-only blur-mirror (CheckoutForm.tsx:720-726); server receives independent orderer.* and shipping.* fields.
Shipping charge policy: 14-value ChargePolicyEnum; FIXED uses base_fee, CONDITIONAL_FREE uses free_threshold as threshold on group_total, RANGE_* via calculateRangeFee (sorted tier match), PER_* via calculatePerUnitFee (ceil(value/unit_value)*base_fee); API charges via calculateApiShippingFee; FREE always 0.
Extra fee: KR-only, zipcode pattern range / wildcard / exact; per_* + extra_fee_multiply multiplies by resolveChargeUnits.
Volume weight divisor: defaults 6000 (cm^3/kg) when ranges.volume_weight_divisor missing.
Shipping fee calc SSoT: OrderCalculationService.calculateShippingFee -> groupByShippingPolicy -> resolveCountrySetting -> calculateCountryShippingFee -> calculateExtraShippingFee -> apportionShippingFee per option -> standaloneShippingAmount.
Default shipping policy: ShippingPolicyResolver.getDefaultPolicy singleton-cached per request (flushCache called by mutation paths).
Order creation tamper defense: OrderProcessingService.createFromTempOrder runs three sequential guards (buildCalculationInputFromTempOrder recalc, OrderAmountChangedException, PaymentAmountMismatchException vs frontend expected_total_amount) before DB insert; temp_order.final_amount compared to recalculated.final_amount; options persist unit_price from server result (line 759), not client.
PG payment guard: completePayment calls validatePaymentAmount(order, pgAmount); confirmManualDeposit validates deposit amount exactly equals total_due_amount.
Daum plugin: handlerMap {openPostcode, setFieldReadOnly}, namespace sirsoft-daum_postcode.*, converts {zonecode, roadAddress, jibunAddress, sido, sigungu} -> G7AddressEvent {zipcode,address,addressDetail:'',region,city,countryCode:'KR',_raw}; supports callbackAction (componentContext.state) or default setState on shipping.zipcode/address/region/city; hooks sirsoft-daum_postcode.address.selected + filter_address_data; settings display_mode popup|layer default layer.
FormRequests: CartController requires X-Cart-Key (regex /^ck_[a-zA-Z0-9]{32}$/) for guests. CreateOrderRequest validates shipping.country_code size:2, KR vs intl fields required_without cross-or, save_shipping_address boolean, expected_total_amount numeric>=0, payment_method via PaymentMethodResolver.allValidIds + isOrderable. UpdateCheckoutRequest takes zipcode+country_code (server recomputes shipping).
Currency snapshot on order: OrderProcessingService.buildCurrencySnapshot creates {base_currency, order_currency, exchange_rate, base_unit, exchange_rates, snapshot_at} and persists mc_* fields on order options.
Config keys: sirsoft-ecommerce.cart.max_quantity (default 99), ecommerce_settings.shipping_fee_tax_policy, payment_methods.{id}.{stock_deduction_timing|mileage_deduction_timing}.
Enums relevant: ChargePolicyEnum, ShippingCountryEnum, ShippingFeeTaxPolicy, ShippingStatusEnum, PaymentMethodEnum (getOrdererEmailRules member vs guest, getGuestLookupRules member vs guest), AddressType (KR R|J), OrderStatusEnum, ShippingApiAuthType, ShippingApiHttpMethod, ShippingApiRequestField, ShippingApiResponseType.

### CART-001 — Cart line uniqueness (option + additional_option hash)
- domain: cart
- source: modules/sirsoft-ecommerce/src/Services/CartService.php:213-215 (merge criterion), modules/sirsoft-ecommerce/src/Models/Cart.php:123-152 (normalizeAdditionalOptionSelectionHash)
- adminUI: none
- publicUI: CartController index/store
- api: POST /api/modules/sirsoft-ecommerce/public/cart/issue-key, /cart (index, store, update, change-option, destroy, destroy-multiple, destroy-all, merge, count)
- auth: false (guest via X-Cart-Key)
- config: sirsoft-ecommerce.cart.max_quantity (default 99)
- external: none
- dataMutation: ecommerce_carts (cart_key, user_id, product_id, product_option_id, additional_option_selections, quantity)
- defaultTemplate: cart routes via PublicBaseController with X-Cart-Key header
- stillForm: modules/sirsoft-ecommerce/src/Services/CartService.php addToCart/updateQuantity/changeOption/mergeGuestCartToUser

### CART-002 — Guest cart merge on login
- domain: cart
- source: modules/sirsoft-ecommerce/src/Services/CartService.php:547-673 (mergeGuestCartToUser), :957-960 getLastMergeAdjustments, modules/sirsoft-ecommerce/src/Http/Controllers/Public/CartController.php:420-444
- adminUI: none
- publicUI: CartController merge
- api: POST /api/modules/sirsoft-ecommerce/public/cart/merge
- auth: true (must be logged in to merge)
- config: none
- external: none
- dataMutation: ecommerce_carts (move guest cart_key rows to user_id; clamp quantity)
- defaultTemplate: Guest -> login hook may trigger merge
- stillForm: lastMergeAdjustments returned to surface clamped quantities (U15-style)

### CART-003 — Checkout (temp order) creation + live recalc
- domain: checkout
- source: modules/sirsoft-ecommerce/src/Services/TempOrderService.php:39 (EXPIRATION_MINUTES=30), :145-168 (createTempOrderFromSelectedItems), :185-199 (createTempOrderFromDirectItems), :430-486 (getTempOrderWithCalculation live recalc), modules/sirsoft-ecommerce/src/Http/Controllers/Public/CheckoutController.php
- adminUI: none
- publicUI: CheckoutController store/show/update
- api: POST /api/modules/sirsoft-ecommerce/public/checkout (store/show/update/destroy/extend)
- auth: false (guest via cart_key)
- config: none
- external: none
- dataMutation: ecommerce_temp_orders (cart_key, user_id, items JSON, calculation_input JSON, calculation_result JSON, expires_at)
- defaultTemplate: TempOrder CRUD with 30-min expiration
- stillForm: TempOrderService::createTempOrderFromDirectItems (buy-now without cart row)

### ADDR-001 — Address book CRUD with default flag
- domain: address
- source: modules/sirsoft-ecommerce/src/Http/Controllers/User/UserAddressController.php, modules/sirsoft-ecommerce/src/Services/UserAddressService.php:27-243, modules/sirsoft-ecommerce/src/Models/UserAddress.php:14-205, migrations/2026_04_01_000036_create_ecommerce_user_addresses_table.php
- adminUI: none
- publicUI: none (mypage only)
- api: GET/POST/PUT/DELETE /api/modules/sirsoft-ecommerce/user/addresses (index, show, store, update, destroy, set-default)
- auth: true
- config: none
- external: none
- dataMutation: ecommerce_user_addresses (user_id, name, recipient_*, country_code, KR-fields zipcode/address/address_detail OR intl address_line_1/2 + city/state/postal_code, is_default)
- defaultTemplate: AuthBaseController (member-only)
- stillForm: generateUniqueName (auto suffix ' (2)'), mapShippingInfoToAddressData B4 KR-vs-intl field mapping, createAddress first-row auto-default

### ADDR-002 — Save shipping address on checkout (save_shipping_address flag)
- domain: address
- source: modules/sirsoft-ecommerce/src/Http/Controllers/Public/OrderController.php:120-155 (maybeSaveShippingAddress), modules/sirsoft-ecommerce/src/Http/Requests/Public/CreateOrderRequest.php:97 (save_shipping_address), modules/sirsoft-ecommerce/src/Services/OrderProcessingService.php:1752-1776 (PG path defers to completePayment)
- adminUI: none
- publicUI: Public OrderController store -> maybeSaveShippingAddress
- api: POST /api/modules/sirsoft-ecommerce/public/user/orders (CreateOrderRequest)
- auth: false (member path only triggers save)
- config: none
- external: none
- dataMutation: ecommerce_orders + ecommerce_order_addresses + ecommerce_order_shippings + ecommerce_user_addresses (auto-save flag)
- defaultTemplate: orderer.* + shipping.* + payment_method + expected_total_amount + save_shipping_address + dbank.* + cash_receipt_* + refund_bank.*
- stillForm: PG path stores order_meta{ save_shipping_address:true, shipping_info_for_save } then UserAddressService::mapShippingInfoToAddressData on completePayment

### ADDR-003 — 주문자정보와동일 (same_as_orderer) copy behavior
- domain: address
- source: templates/superbify-commerce_minimal/src/components/CheckoutForm.tsx:530 (state), :720-726 (mirror effect), :1256-1262 (checkbox), tests/.../CheckoutParity.test.tsx:96 (parity test), modules/sirsoft-ecommerce/src/Services/OrderProcessingService.php:911-945 (createOrderAddresses writes both orderer_* and recipient_* independently)
- adminUI: none
- publicUI: CheckoutForm sameAsOrderer blur-mirror
- api: POST /api/modules/sirsoft-ecommerce/public/user/orders (CreateOrderRequest)
- auth: false
- config: none
- external: none
- dataMutation: ecommerce_order_addresses (orderer_*, recipient_*)
- defaultTemplate: orderer.name/phone/email + shipping.recipient_name/phone/zipcode/address/address_detail; no same_as_orderer server field
- stillForm: UI-only mirror; server never receives a same_as_orderer flag

### SHIP-001 — Shipping charge policies (fix / free-over / range / per-unit / API)
- domain: shipping
- source: modules/sirsoft-ecommerce/src/Enums/ChargePolicyEnum.php:8-23, modules/sirsoft-ecommerce/src/Models/ShippingPolicyCountrySetting.php:15-51, modules/sirsoft-ecommerce/src/Services/OrderCalculationService.php:2117-2170 (calculateCountryShippingFee match), :2157 (CONDITIONAL_FREE groupTotal>=free_threshold)
- adminUI: none
- publicUI: none (server SSoT)
- api: internal: OrderCalculationService::calculateShippingFee
- auth: false
- config: per-country settings on ecommerce_shipping_policy_country_settings
- external: optional external API when charge_policy='api'
- dataMutation: read-only on ecommerce_shipping_policy_country_settings (per-country charge_policy + base_fee + free_threshold + ranges + extra_fee_*)
- defaultTemplate: ChargePolicyEnum (free/fixed/conditional_free/range_amount/range_quantity/range_weight/range_volume/range_volume_weight/api/per_quantity/per_weight/per_volume/per_volume_weight/per_amount)
- stillForm: CONDITIONAL_FREE + RANGE_* + PER_* all server-resolved; FIXED via base_fee; FREE always 0

### SHIP-002 — Shipping fee calculation server-side (island/remote area)
- domain: shipping
- source: modules/sirsoft-ecommerce/src/Services/OrderCalculationService.php:1091-1240, modules/sirsoft-ecommerce/src/Models/ShippingPolicyCountrySetting.php:275-327 (zipcode range 63000-63999 / wildcard 63* / exact; KR-only)
- adminUI: none
- publicUI: none
- api: internal: OrderCalculationService::calculateExtraShippingFee + ShippingPolicyCountrySetting::getExtraFeeForZipcode
- auth: false
- config: extra_fee_enabled, extra_fee_settings (zipcode pattern + fee), extra_fee_multiply
- external: none
- dataMutation: read ecommerce_shipping_policy_country_settings.extra_fee_settings (zipcode -> fee)
- defaultTemplate: per_* policies with extra_fee_multiply=true multiply island fee by unit count
- stillForm: KR-only path; group-by-shipping-policy then apportion per option

### SHIP-003 — Carriers and tracking support
- domain: shipping
- source: modules/sirsoft-ecommerce/src/Models/ShippingCarrier.php:114-121 (buildTrackingUrl), modules/sirsoft-ecommerce/src/Models/OrderShipping.php:160-173 (getTrackingUrl), :23-58 fillable, modules/sirsoft-ecommerce/src/Models/ShippingType.php:97-127 (getLocalizedName, isDomestic/isInternational)
- adminUI: none
- publicUI: none (admin/maintenance)
- api: internal: OrderShipping::getTrackingUrl, ShippingCarrier::buildTrackingUrl
- auth: false
- config: ecommerce_shipping_carriers rows seeded by code; tracking_url template uses {tracking_number}
- external: none
- dataMutation: ecommerce_order_shippings (carrier_id, tracking_number, return_carrier_id, return_tracking_number, exchange_carrier_id, exchange_tracking_number, package_number, delivery_policy_snapshot)
- defaultTemplate: ShippingCarrier {code,name,type,tracking_url,is_active}; ShippingType {code,name,category:domestic|international|other}
- stillForm: User-overrides preserved via HasUserOverrides trait on ShippingCarrier/ShippingType

### ADDR-004 — Daum postcode plugin integration point
- domain: address
- source: plugins/sirsoft-daum_postcode/resources/js/handlers/openPostcode.ts (converts zonecode/roadAddress/sido/sigungu -> G7 {zipcode,address,region,city,countryCode:'KR',addressDetail:'',_raw}), plugins/sirsoft-daum_postcode/plugin.php:10-126 (getSettingsSchema/getConfigValues/getHooks: sirsoft-daum_postcode.address.selected / filter_address_data), plugins/sirsoft-daum_postcode/resources/js/handlers/setFieldReadOnly.ts
- adminUI: none
- publicUI: JS handler invoked from CheckoutForm action JSON
- api: plugin handler: sirsoft-daum_postcode.openPostcode + .setFieldReadOnly
- auth: false
- config: display_mode (popup|layer default layer), popup_width 500, popup_height 600, theme_color #1D4ED8
- external: window.daum.Postcode (Kakao Daum Postcode JS)
- dataMutation: none (UI state binding only)
- defaultTemplate: registers action handler via ActionDispatcher (window.G7Core.getActionDispatcher)
- stillForm: handlerMap exports openPostcode + setFieldReadOnly; initPlugin auto-registers via window.G7Core

### CART-004 — Cart domain hooks/events
- domain: cart
- source: modules/sirsoft-ecommerce/src/Services/CartService.php:64,76,188,257,371,377,449,470,497,503,518,535,549,667,700,746,776,788
- adminUI: none
- publicUI: none
- api: internal hooks
- auth: false
- config: none
- external: none
- dataMutation: none (data binding)
- defaultTemplate: HookManager::doAction / applyFilters on cart.before_list, cart.before_add, cart.before_update_quantity, cart.before_change_option, cart.before_delete, cart.before_delete_multiple, cart.before_merge, cart.before_reorder, cart.before_delete_all, cart.after_*
- stillForm: sirsoft-ecommerce.cart.{before,after}_{list,add,update_quantity,change_option,delete,delete_multiple,merge,reorder,delete_all}, .filter_{list_result,add_data}

### CHK-001 — Server-side price recalculation / tamper defense on order creation
- domain: checkout
- source: modules/sirsoft-ecommerce/src/Services/OrderProcessingService.php:121-122 (recalc with buildCalculationInputFromTempOrder), :129-139 (OrderAmountChangedException on drift vs temp_order), :142 + 353-377 (validateOrderAmount vs frontend expected_total_amount -> PaymentAmountMismatchException), :1485-1515 (buildCalculationInputFromTempOrder), modules/sirsoft-ecommerce/src/Services/TempOrderService.php:92,388,475 (every create/update/show recomputes)
- adminUI: none
- publicUI: Public OrderController store -> OrderProcessingService
- api: POST /api/modules/sirsoft-ecommerce/public/user/orders
- auth: false
- config: none
- external: none
- dataMutation: none on submission; later ecommerce_orders rows written by OrderProcessingService
- defaultTemplate: expected_total_amount field on CreateOrderRequest
- stillForm: All unit prices / discount / shipping / tax / final amount come from server-side OrderCalculationService; client total only used as guard

### CHK-002 — Server-side amount guard on PG callback
- domain: checkout
- source: modules/sirsoft-ecommerce/src/Services/OrderProcessingService.php:1644-1707 (completePayment with validatePaymentAmount), :1806+ (confirmManualDeposit PaymentAmountMismatchException)
- adminUI: none
- publicUI: none
- api: internal: completePayment (PG callback), confirmManualDeposit (admin)
- auth: false
- config: none
- external: PG provider webhook
- dataMutation: re-validates order.total_due_amount vs PG amount
- defaultTemplate: validatePaymentAmount and confirmManualDeposit both check pgAmount/deposit vs order amount
- stillForm: PG callback tampering raises 422; manual deposit mismatch raises 422


## payment-plugins

> notes: PG provider ids (from RegisterPgProviderListener): kginicis, nhnkcp, nicepayments, tosspayments. supported_methods per provider: kginicis/nhnkcp/nicepayments=[card,bank,vbank,phone]; tosspayments=[card,virtual_account,bank_transfer,mobile]. Easy-pay ids and injection hooks (filter_available_payment_methods, priority in parens): kginicis_samsung_pay/naverpay/lpay/kakaopay + kginicis_japan_paypay/cvs (japan_enabled); nhnkcp_payco/naverpay/naverpay_point/kakaopay/applepay (30); nicepay_naverpay/kakaopay/samsungpay/applepay/payco/skpay/ssgpay/lpay (40); toss_card/virtual_account/transfer/mobile_phone/tosspay/kakaopay/naverpay/payco/samsungpay (20, only when order_sheet_mode=true). PG payment_handler ids (template dispatch): sirsoft-pay_kginicis.requestPayment, sirsoft-pay_nhnkcp.requestPayment, sirsoft-pay_nicepayments.requestPayment, sirsoft-tosspayments.requestPayment. Cancel flow: each provider registers filter sirsoft-ecommerce.payment.refund, calls its API service cancelPayment with provider-specific URL+sign+hook+Idempotency-Key. dbank (무통장입금): builtin, needsPg=false, payment_meta fields dbank_code/dbank_name/dbank_account/dbank_holder, bank accounts stored in storage/app/modules/sirsoft-ecommerce/settings/order_settings.json bank_accounts[] (default KB 76870101249426). Bank code SSoT: modules/sirsoft-ecommerce/config/settings/defaults.json banks[] (16 codes: 004/088/020/081/003/011/071/031/032/034/035/037/039/045/048/090/092). Cash receipt providers: kginicis, tosspayments (registered via cash_receipt.registered_providers filter; sign-only listeners, no nhnkcp/nicepayments). Webhook/notify endpoints differ: KG iniCis (browser POST + server vbank-notify/mobile vbank-notify/CBT cvs-notify); KCP (browser POST + server vbank-notify + escrow-common-notify, RestrictKcpIp); NicePayments (browser POST + server vbank-notify, VbankNotifyIpWhitelist); TossPayments (browser redirect GET /payment/success + /payment/fail + server webhook POST /webhook/deposit + /webhook/payment-status, no IP whitelist — uses secret comparison). SDK URLs: kginicis https://(stg)stdpay.inicis.com/stdjs/INIStdPay.js; nhnkcp https://(test)pay.kcp.co.kr/plugin/payplus_web.jsp; nicepayments https://web.nicepay.co.kr/v3/webstd/js/nicepay-3.0.js; tosspayments https://js.tosspayments.com/v2/standard. CLI binary required for nhnkcp: bin/pp_cli, bin/pp_cli_x64, bin/pp_cli_exe.exe, bin/pub.key; auto chmod recovery on payment hot path (HealthCheckController + ensureCliExecutable). Currently enabled/installed (top-level plugins/): sirsoft-ckeditor5, sirsoft-daum_postcode only. None of the four payment plugins are installed (only present in plugins/_bundled/).

### PAY-KGINICIS-001 — Plugin identifier, settings, and registration
- domain: payment-pg
- source: plugins/_bundled/sirsoft-pay_kginicis/plugin.json:2; plugin.php:9-262; src/Listeners/RegisterPgProviderListener.php:63-136; src/Listeners/RegisterEasyPayMethodsListener.php:88-249; src/Services/KgInicisApiService.php:14-1093; src/routes/web.php:21-77; src/routes/api.php:30-131
- adminUI: /admin/plugins/{identifier}/settings (AbstractPlugin settings page)
- publicUI: /plugins/sirsoft-pay_kginicis/payment/signature, /payment/cbt/callback, /payment/cbt/cvs-notify, /payment/close, /payment/escrow-confirm/*, /payment/callback (PC + mobile)
- api: POST /plugins/sirsoft-pay_kginicis/payment/callback; POST /plugins/sirsoft-pay_kginicis/payment/vbank-notify; POST /plugins/sirsoft-pay_kginicis/payment/mobile/callback; POST /plugins/sirsoft-pay_kginicis/payment/mobile/vbank-notify; POST /plugins/sirsoft-pay_kginicis/payment/cbt/callback; POST /plugins/sirsoft-pay_kginicis/payment/cbt/cvs-notify; GET /payment/escrow-confirm/{orderNumber}; GET /payment/escrow-confirm/close; POST /api/plugins/sirsoft-pay_kginicis/payment/signature; POST /api/plugins/sirsoft-pay_kginicis/payment/cbt/checkout-token; POST /api/plugins/sirsoft-pay_kginicis/payment/cbt/hash-data; POST /api/plugins/sirsoft-pay_kginicis/payment/mobile/signature; POST /api/plugins/sirsoft-pay_kginicis/payment/close-report
- auth: PG provider id=kginicis; depends on sirsoft-ecommerce module; g7_version >=7.0.8
- config: is_test_mode, test_mid, test_sign_key, test_iniapi_key, test_iniapi_iv, live_mid, live_sign_key, live_iniapi_key, live_iniapi_iv, test_mobile_hash_key, live_mobile_hash_key, use_escrow, japan_enabled, japan_restrict_jpy_payment_methods, test_japan_sign_key, live_japan_mid, live_japan_sign_key, japan_merchant_name*, japan_contact_*, redirect_success_url, redirect_fail_url, easy_pay_allow_with_other_pg, easy_pay_samsung_pay, easy_pay_naverpay, easy_pay_show_brand_button, easy_pay_lpay, easy_pay_kakaopay, use_credit_point
- external: KG이니시스 표준결제 JS SDK (https://stgstdpay.inicis.com/stdjs/INIStdPay.js test, https://stdpay.inicis.com/stdjs/INIStdPay.js live); INIAPI v2 (https://stginiapi.inicis.com / https://iniapi.inicis.com); CBT 인증/승인/환불 API (https://devcbt.inicis.com, https://cbt.inicis.com); IDC PC 승인 URL 화이트리스트 fc/ks/stg
- dataMutation: storage/app/plugins/{identifier}/settings/setting.json (PluginSettingsService); DB Order/OrderPayment/OrderRefund via Ecommerce module hooks
- defaultTemplate: 없음 (active runtime template twentyft-studio에서 노출 안 함)
- stillForm: 없음

### PAY-KGINICIS-002 — KG이니시스 cancel/refund API method and supported payment methods
- domain: payment-pg
- source: src/Services/KgInicisApiService.php:467-783; src/Listeners/PaymentRefundListener.php:50-217; src/Listeners/RegisterPgProviderListener.php:73 (supported_methods=['card','bank','vbank','phone'])
- adminUI: /admin/plugins/sirsoft-pay_kginicis/settings (AbstractPlugin settings page)
- publicUI: none (admin-only refund path)
- api: POST /v2/pg/refund or /v2/pg/partialRefund (INIAPI v2); POST /api/v1/refund (CBT); POST /api/v1/escrow (Dlv/Dncf); POST /v2/pg/receipt (cash receipt issue/cancel); POST /v2/pg/inquiry (transaction query); IDC whitelist authorizePayment(authUrl, authToken) — separate endpoint per idc_name
- auth: filter sirsoft-ecommerce.payment.refund; payment_handler=sirsoft-pay_kginicis.requestPayment
- config: (same as PAY-KGINICIS-001)
- external: (same as PAY-KGINICIS-001)
- dataMutation: OrderPayment.transaction_id (TID), payment_meta (pg_provider='kginicis', is_test_mode, mid, is_cbt, cbt_type, cbt_mid, pay_method, pg_raw_response, mc_cancelled_amount); OrderRefund via Ecommerce refund hook
- defaultTemplate: 없음
- stillForm: 없음

### PAY-KGINICIS-003 — KG이니시스 hooks, listeners and action registration
- domain: payment-pg
- source: plugin.php:345-429; src/Listeners/RegisterPgProviderListener.php:34-48; src/Listeners/RegisterEasyPayMethodsListener.php:64-73, 88-249; src/Listeners/RegisterCashReceiptProviderListener.php:49-71, 87-311; src/Listeners/PaymentRefundListener.php:22-31; src/Listeners/AdjustEcommercePaymentMethodsLayoutListener.php:35-43
- adminUI: /admin/plugins/sirsoft-pay_kginicis/settings + admin order detail layout extensions (test badge, test mode warning, transaction status, payment query)
- publicUI: checkout payment methods (kginicis_samsung_pay, kginicis_naverpay, kginicis_lpay, kginicis_kakaopay, kginicis_japan_paypay, kginicis_japan_cvs) injected via filter_available_payment_methods hook
- api: hooks: sirsoft-ecommerce.payment.refund (filter); sirsoft-ecommerce.payment.registered_pg_providers (filter); sirsoft-ecommerce.payment.get_client_config (filter); sirsoft-ecommerce.cash_receipt.registered_providers / issue / cancel (filters); sirsoft-ecommerce.settings.filter_available_payment_methods (filter); core.layout_extension.after_apply (filter); actions: payment.before_authorize, payment.after_authorize, payment.before_cancel, payment.after_cancel, payment.before_cbt_refund, payment.after_cbt_refund
- auth: depends on sirsoft-ecommerce module
- config: (see PAY-KGINICIS-001)
- external: none additional
- dataMutation: storage/app/plugins/sirsoft-pay_kginicis/settings/setting.json (PluginSettingsService::get/set); Ecommerce Order/OrderPayment payment_meta; CBT CashReceiptProvider results
- defaultTemplate: 없음
- stillForm: 없음

### PAY-NHNKCP-001 — NHN KCP plugin identifier, settings, supported methods, callbacks
- domain: payment-pg
- source: plugins/_bundled/sirsoft-pay_nhnkcp/plugin.json:2; plugin.php:25-227; src/routes/web.php:25-39; src/routes/api.php:25-89; src/Services/NhnKcpApiService.php:14-619
- adminUI: /admin/plugins/sirsoft-pay_nhnkcp/settings (AbstractPlugin settings page); /admin/plugins/sirsoft-pay_nhnkcp/health
- publicUI: /plugins/sirsoft-pay_nhnkcp/payment/callback; vbank-notify; escrow-common-notify; mobile/approval-key flow
- api: POST /plugins/sirsoft-pay_nhnkcp/payment/callback (browser POST, no CSRF); POST /plugins/sirsoft-pay_nhnkcp/payment/vbank-notify (KCP server, IP whitelisted via RestrictKcpIp); POST /plugins/sirsoft-pay_nhnkcp/payment/escrow-common-notify (TX02/TX03 KCP webhook); POST /api/plugins/sirsoft-pay_nhnkcp/payment/close-report; POST /api/plugins/sirsoft-pay_nhnkcp/payment/retry; POST /api/plugins/sirsoft-pay_nhnkcp/mobile/approval-key; GET /api/plugins/sirsoft-pay_nhnkcp/user/orders/{orderNumber}/vbank-mock-deposit-info; GET /api/plugins/sirsoft-pay_nhnkcp/admin/vbank-notify-url; GET /api/plugins/sirsoft-pay_nhnkcp/admin/settings/test-mode-status; GET /api/plugins/sirsoft-pay_nhnkcp/admin/orders/test-mode-map; GET /api/plugins/sirsoft-pay_nhnkcp/admin/orders/easy-pay-display-map; GET /api/plugins/sirsoft-pay_nhnkcp/admin/orders/{orderNumber}/transaction-status; GET /api/plugins/sirsoft-pay_nhnkcp/admin/orders/{orderNumber}/escrow-delivery; POST /api/plugins/sirsoft-pay_nhnkcp/admin/orders/{orderNumber}/escrow-delivery; GET /api/plugins/sirsoft-pay_nhnkcp/admin/health
- auth: PG provider id=nhnkcp; depends on sirsoft-ecommerce module; g7_version >=7.0.5; permission gates: admin,sirsoft-ecommerce.settings.read, orders.read, orders.update
- config: is_test_mode, test_site_cd (default T0000), test_site_key, live_site_cd (SR-prefix auto), live_site_key, redirect_success_url, redirect_fail_url, use_escrow, escrow_test_site_cd, vbank_expire_days (default 3), easy_pay_allow_with_other_pg, easy_pay_payco, easy_pay_naverpay, easy_pay_naverpay_point, easy_pay_kakaopay, easy_pay_applepay
- external: paygw.kcp.co.kr:8090 (PA URL) for CLI pp_cli/pp_cli_x64/pp_cli_exe.exe (Windows); https://testpay.kcp.co.kr/plugin/payplus_web.jsp or https://pay.kcp.co.kr/plugin/payplus_web.jsp for SDK JS; https://stgapi.kcp.co.kr or https://api.kcp.co.kr for HTTP API /v1/payment/trade/{tno}; KCP pub.key in bin/pub.key
- dataMutation: storage/app/plugins/sirsoft-pay_nhnkcp/settings/setting.json; DB OrderPayment.tno, payment_meta(site_cd, is_test_mode)
- defaultTemplate: 없음
- stillForm: 없음

### PAY-NHNKCP-002 — NHN KCP cancel/refund, partial cancel logic, escrow delivery, CLI execution
- domain: payment-pg
- source: src/Services/NhnKcpApiService.php:181-528; src/Listeners/PaymentRefundListener.php:54-166; src/Listeners/RegisterPgProviderListener.php:49-156
- adminUI: /admin/plugins/sirsoft-pay_nhnkcp/settings (AbstractPlugin settings page); admin order list test badge, transaction status, payment query layouts; admin vbank mock deposit (test mode only)
- publicUI: none
- api: CLI pp_cli with tx_cd 00100000 (approve) or 00200000 (cancel/mod); HTTP /v1/payment/trade/{tno} for query; SOAP KcpSoapService for mobile approval key
- auth: filter sirsoft-ecommerce.payment.refund; pg_payment_handler='sirsoft-pay_nhnkcp.requestPayment'
- config: (see PAY-NHNKCP-001)
- external: KCP CLI binaries pp_cli (Linux x86), pp_cli_x64 (Linux x64), pp_cli_exe.exe (Windows) and pub.key in bin/
- dataMutation: storage/app/plugins/sirsoft-pay_nhnkcp/settings/setting.json; Ecommerce Order/OrderPayment (transaction_id=tno, payment_meta.site_cd, payment_meta.is_test_mode)
- defaultTemplate: 없음
- stillForm: 없음

### PAY-NHNKCP-003 — NHN KCP hooks, listeners, easy-pay methods
- domain: payment-pg
- source: plugin.php:176-226; src/Listeners/RegisterPgProviderListener.php:20-33, 49-156; src/Listeners/RegisterEasyPayMethodsListener.php:14-200; src/Listeners/PaymentRefundListener.php:22-33; src/Listeners/AdjustEcommercePaymentMethodsLayoutListener.php (see plugin.php listener list)
- adminUI: /admin/plugins/sirsoft-pay_nhnkcp/settings
- publicUI: checkout payment methods (nhnkcp_payco, nhnkcp_naverpay, nhnkcp_naverpay_point, nhnkcp_kakaopay, nhnkcp_applepay [iOS only]) injected via filter_available_payment_methods hook with priority 30
- api: hooks: sirsoft-ecommerce.payment.refund (filter); sirsoft-ecommerce.payment.registered_pg_providers; sirsoft-ecommerce.payment.get_client_config; sirsoft-ecommerce.settings.filter_available_payment_methods; core.layout_extension.after_apply; actions: payment.before_confirm, payment.after_confirm, payment.before_cancel, payment.after_cancel
- auth: depends on sirsoft-ecommerce module
- config: (see PAY-NHNKCP-001)
- external: none additional
- dataMutation: Ecommerce Order/OrderPayment; plugin settings JSON
- defaultTemplate: 없음
- stillForm: 없음

### PAY-NICE-001 — NicePayments plugin identifier, settings, callbacks, supported methods
- domain: payment-pg
- source: plugins/_bundled/sirsoft-pay_nicepayments/plugin.json:2; plugin.php:25-253; src/routes/web.php:19-39; src/routes/api.php:23-87; src/Services/NicePaymentsApiService.php:14-419
- adminUI: /admin/plugins/sirsoft-pay_nicepayments/settings (AbstractPlugin settings page); admin vbank notification history, vbank refund (with bank account), escrow delivery
- publicUI: /plugins/sirsoft-pay_nicepayments/payment/callback, vbank-notify, sign-data
- api: POST /plugins/sirsoft-pay_nicepayments/payment/callback (browser POST, no CSRF); POST /plugins/sirsoft-pay_nicepayments/payment/vbank-notify (server, IP whitelisted via VbankNotifyIpWhitelist); POST /plugins/sirsoft-pay_nicepayments/payment/sign-data (throttle:30,1); POST /api/plugins/sirsoft-pay_nicepayments/payment/close-report; POST /api/plugins/sirsoft-pay_nicepayments/admin/vbank-refund; GET /api/plugins/sirsoft-pay_nicepayments/admin/vbank-notify-url; GET /api/plugins/sirsoft-pay_nicepayments/admin/settings/test-mode-status; POST /api/plugins/sirsoft-pay_nicepayments/admin/transaction/query; GET /api/plugins/sirsoft-pay_nicepayments/admin/orders/{orderNumber}/transaction-status; GET /api/plugins/sirsoft-pay_nicepayments/admin/orders/test-mode-map; GET /api/plugins/sirsoft-pay_nicepayments/admin/orders/easy-pay-display-map; GET /api/plugins/sirsoft-pay_nicepayments/admin/orders/{orderNumber}/escrow-payments; POST /api/plugins/sirsoft-pay_nicepayments/admin/escrow/register-delivery; GET /api/plugins/sirsoft-pay_nicepayments/admin/orders/{orderNumber}/vbank-notifications
- auth: PG provider id=nicepayments; depends on sirsoft-ecommerce module; g7_version >=7.0.5
- config: is_test_mode, test_mid (default nicepay00m), test_merchant_key (default EYzu8jGGMfqaDEp76gSckuvnaHHu...), live_mid (SR-prefix auto), live_merchant_key, redirect_success_url, redirect_fail_url, use_escrow, easy_pay_allow_with_other_pg, easy_pay_naverpay, easy_pay_kakaopay, easy_pay_samsungpay, easy_pay_applepay, easy_pay_payco, easy_pay_skpay, easy_pay_ssgpay, easy_pay_lpay
- external: https://web.nicepay.co.kr/v3/webstd/js/nicepay-3.0.js (SDK); https://pg-api.nicepay.co.kr/webapi/cancel_process.jsp (cancel); https://webapi.nicepay.co.kr/webapi/inquery/trans_status.jsp (query); https://webapi.nicepay.co.kr/webapi/escrow_process.jsp (escrow delivery); EUC-KR character encoding for cancel API
- dataMutation: storage/app/plugins/sirsoft-pay_nicepayments/settings/setting.json; DB OrderPayment.TID, payment_meta(mid, is_test_mode)
- defaultTemplate: 없음
- stillForm: 없음

### PAY-NICE-002 — NicePayments cancel/refund and vbank completed refund flow
- domain: payment-pg
- source: src/Services/NicePaymentsApiService.php:121-340; src/Listeners/PaymentRefundListener.php:56-168; src/Listeners/RegisterPgProviderListener.php:47-137
- adminUI: /admin/plugins/sirsoft-pay_nicepayments/settings; admin order list test badge, payment query layout
- publicUI: none
- api: https://pg-api.nicepay.co.kr/webapi/cancel_process.jsp (cancel, EUC-KR); https://webapi.nicepay.co.kr/webapi/escrow_process.jsp (escrow delivery req_type=03); https://webapi.nicepay.co.kr/webapi/inquery/trans_status.jsp (single transaction query)
- auth: filter sirsoft-ecommerce.payment.refund (skipped for vbank completed); payment_handler=sirsoft-pay_nicepayments.requestPayment
- config: (see PAY-NICE-001)
- external: (see PAY-NICE-001)
- dataMutation: Ecommerce Order/OrderPayment (transaction_id=TID, payment_meta.mid, payment_meta.is_test_mode); refunded/escrow deliveries persisted via payment_meta
- defaultTemplate: 없음
- stillForm: 없음

### PAY-NICE-003 — NicePayments hooks, listeners, easy-pay methods
- domain: payment-pg
- source: plugin.php:202-253; src/Listeners/RegisterPgProviderListener.php:17-32, 47-137; src/Listeners/RegisterEasyPayMethodsListener.php:84-224; src/Listeners/PaymentRefundListener.php:23-33
- adminUI: /admin/plugins/sirsoft-pay_nicepayments/settings
- publicUI: checkout payment methods (nicepay_naverpay, nicepay_kakaopay, nicepay_samsungpay, nicepay_applepay [iOS only], nicepay_payco, nicepay_skpay, nicepay_ssgpay, nicepay_lpay) injected via filter_available_payment_methods hook with priority 40
- api: hooks: sirsoft-ecommerce.payment.refund; sirsoft-ecommerce.payment.registered_pg_providers; sirsoft-ecommerce.payment.get_client_config; sirsoft-ecommerce.settings.filter_available_payment_methods; core.layout_extension.after_apply; actions: payment.before_authorize, payment.after_authorize, payment.before_cancel, payment.after_cancel
- auth: depends on sirsoft-ecommerce module
- config: (see PAY-NICE-001)
- external: none additional
- dataMutation: Ecommerce Order/OrderPayment; plugin settings JSON
- defaultTemplate: 없음
- stillForm: 없음

### PAY-TOSS-001 — TossPayments plugin identifier, settings, redirect/webhook endpoints, supported methods
- domain: payment-pg
- source: plugins/_bundled/sirsoft-tosspayments/plugin.json:2; plugin.php:35-293; src/routes/web.php:19-37; src/Services/TossPaymentsApiService.php:17-189; src/Listeners/RegisterPgProviderListener.php:81-144; src/Concerns/MapsTossPaymentMethods.php:29-67
- adminUI: /admin/plugins/sirsoft-tosspayments/settings (AbstractPlugin settings page)
- publicUI: /plugins/sirsoft-tosspayments/payment/success; /payment/fail; /webhook/deposit; /webhook/payment-status
- api: GET /plugins/sirsoft-tosspayments/payment/success (browser redirect); GET /plugins/sirsoft-tosspayments/payment/fail (browser redirect); POST /plugins/sirsoft-tosspayments/webhook/deposit (DEPOSIT_CALLBACK, no CSRF); POST /plugins/sirsoft-tosspayments/webhook/payment-status (PAYMENT_STATUS_CHANGED, no CSRF)
- auth: PG provider id=tosspayments; depends on sirsoft-ecommerce module; g7_version >=7.0.0
- config: is_test_mode, test_client_key, test_secret_key, live_client_key, live_secret_key, redirect_success_url, redirect_fail_url, order_sheet_mode (bool), method_card (default true), method_virtual_account, method_transfer, method_mobile_phone, method_tosspay, method_kakaopay, method_naverpay, method_payco, method_samsungpay, vbank_valid_hours (default 24, max 2160), vbank_cash_receipt_type, use_escrow (string: off/required/buyer_choice), webhook_secret_verify (default true)
- external: https://js.tosspayments.com/v2/standard (SDK); https://api.tosspayments.com (Basic auth with secret key); v2/payments/confirm; v1/payments/{paymentKey}/cancel; v1/cash-receipts; v1/cash-receipts/{receiptKey}/cancel; webhook secret verification (HMAC)
- dataMutation: storage/app/plugins/sirsoft-tosspayments/settings/setting.json; DB OrderPayment.paymentKey, payment_meta
- defaultTemplate: 없음
- stillForm: 없음

### PAY-TOSS-002 — TossPayments cancel/refund API and cash receipt flow
- domain: payment-pg
- source: src/Services/TossPaymentsApiService.php:75-142; src/Listeners/PaymentRefundListener.php:59-310; src/Listeners/RegisterPgProviderListener.php:81-144; src/Concerns/MapsTossPaymentMethods.php:29-67 (TOSS_METHOD_MAP)
- adminUI: /admin/plugins/sirsoft-tosspayments/settings
- publicUI: none (admin-only refund)
- api: POST https://api.tosspayments.com/v1/payments/{paymentKey}/cancel (cancel: cancelReason, cancelAmount, taxFreeAmount, refundReceiveAccount, idempotencyKey); POST /v1/cash-receipts (issue: amount, orderId, orderName, type, customerIdentityNumber, taxFreeAmount); POST /v1/cash-receipts/{receiptKey}/cancel (cancel full only)
- auth: filter sirsoft-ecommerce.payment.refund; payment_handler='sirsoft-tosspayments.requestPayment'
- config: (see PAY-TOSS-001)
- external: (see PAY-TOSS-001)
- dataMutation: OrderPayment.transaction_id (paymentKey), payment_meta; OrderRefund idempotencyKey='g7-refund-{refund.id}'; webhook secret verify setting
- defaultTemplate: 없음
- stillForm: 없음

### PAY-TOSS-003 — TossPayments hooks, listeners, easy-pay methods
- domain: payment-pg
- source: plugin.php:238-292; src/Listeners/RegisterPgProviderListener.php:25-39, 81-144; src/Listeners/RegisterTossPaymentMethodsListener.php:75-202; src/Concerns/MapsTossPaymentMethods.php:29-67; src/Listeners/RegisterCashReceiptProviderListener.php:30-268
- adminUI: /admin/plugins/sirsoft-tosspayments/settings
- publicUI: checkout payment methods (toss_card, toss_virtual_account, toss_transfer, toss_mobile_phone, toss_tosspay, toss_kakaopay, toss_naverpay, toss_payco, toss_samsungpay) injected via filter_available_payment_methods hook with priority 20, only when order_sheet_mode=true
- api: hooks: sirsoft-ecommerce.payment.refund; sirsoft-ecommerce.payment.registered_pg_providers; sirsoft-ecommerce.payment.get_client_config; sirsoft-ecommerce.cash_receipt.registered_providers / issue / cancel; sirsoft-ecommerce.settings.filter_available_payment_methods; actions: payment.before_confirm, payment.after_confirm, payment.before_cancel, payment.after_cancel
- auth: depends on sirsoft-ecommerce module
- config: (see PAY-TOSS-001)
- external: none additional
- dataMutation: Ecommerce Order/OrderPayment (paymentKey, payment_meta); plugin settings JSON; cash receipt payload
- defaultTemplate: 없음
- stillForm: 없음

### PAY-BUILTIN-DBANK-001 — Builtin PaymentMethodEnum and OrderSettings SSoT for dbank, banks list, and bank_accounts
- domain: payment-builtin
- source: modules/sirsoft-ecommerce/src/Enums/PaymentMethodEnum.php:12 (DBANK case); modules/sirsoft-ecommerce/src/Models/OrderPayment.php:56-58 (dbank_code/name/account); modules/sirsoft-ecommerce/src/Http/Requests/Public/CreateOrderRequest.php:88-94 (depositor_name + dbank.{bank_code,account_number,account_holder}); modules/sirsoft-ecommerce/config/settings/defaults.json:109-291 (order_settings.payment_methods[] + banks[]); storage/app/modules/sirsoft-ecommerce/settings/order_settings.json:10-301
- adminUI: none (storage-only SSoT)
- publicUI: checkout's dbank entry (is_active from storage)
- api: none
- auth: none (no PG)
- config: storage/app/modules/sirsoft-ecommerce/settings/order_settings.json payment_methods[].id=dbank + bank_accounts[] (bank_code/account_number/account_holder/is_default); modules/sirsoft-ecommerce/config/settings/defaults.json:142-153 declares dbank defaults (sort_order=3, is_active=true); banks[] codes are SSoT in 174-291
- external: none
- dataMutation: none (read-only at SSoT)
- defaultTemplate: none
- stillForm: none

### PAY-BUILTIN-METHODS-001 — Builtin payment methods registry (card, vbank, dbank, bank, phone, point, deposit, free) and filter hook
- domain: payment-builtin
- source: modules/sirsoft-ecommerce/src/Enums/PaymentMethodEnum.php:10-17 (cases); modules/sirsoft-ecommerce/src/Services/EcommerceSettingsService.php:772-868 (getBuiltinPaymentMethods, getAvailablePaymentMethods via filter_available_payment_methods hook, getRegisteredPgProviders via registered_pg_providers hook, getRegisteredCashReceiptProviders via cash_receipt.registered_providers hook)
- adminUI: none (storage-only SSoT)
- publicUI: checkout
- api: none (read-side only)
- auth: none
- config: modules/sirsoft-ecommerce/config/settings/defaults.json order_settings.payment_methods[] ids: card, vbank, dbank, bank, phone, point, deposit, free (sort_order 1..8)
- external: none
- dataMutation: none (read-only at SSoT)
- defaultTemplate: none
- stillForm: none

### PAY-REGISTRY-001 — Plugin enablement registry (storage/app/plugins, plugins/_pending, plugins/_bundled)
- domain: payment-registry
- source: plugins/_bundled/ (read-only at system level); plugins/_pending/ (empty); plugins/sirsoft-ckeditor5/, plugins/sirsoft-daum_postcode/ (installed); storage/app/plugins/sirsoft-ckeditor5/settings/setting.json, storage/app/plugins/sirsoft-daum_postcode/settings/setting.json
- adminUI: none
- publicUI: none
- api: none
- auth: none
- config: Plugin activation is via AbstractPlugin registration; installed enabled plugins tracked by directory presence in plugins/ (top-level) vs _bundled/ vs _pending/ (empty). No separate enabled.json registry file. Storage SSoT per plugin: storage/app/plugins/{identifier}/settings/setting.json. Currently installed (top-level plugins/): sirsoft-ckeditor5, sirsoft-daum_postcode. Bundled-only (plugins/_bundled/, not installed at top-level): sirsoft-pay_kginicis, sirsoft-pay_nhnkcp, sirsoft-pay_nicepayments, sirsoft-tosspayments, sirsoft-verification_kginicis, sirsoft-verification_nhnkcp, sirsoft-marketing, sirsoft-gdpr, gnuboard7-hello_plugin
- external: none
- dataMutation: storage/app/plugins/{identifier}/settings/setting.json (only for installed plugins); storage/app/modules/sirsoft-ecommerce/settings/*.json (only for installed ecommerce settings)
- defaultTemplate: none
- stillForm: none


## stillform-surface

> notes: Key parity gaps vs sirsoft-basic:
- product option selector (단일/다중 옵션): MISSING in product.json + AddToCartPanel has no select UI (OPT-023). AddToCartPanel takes only productId/quantity; cart/checkout render option_name from product_option_id read-back.
- product additional option (추가옵션): MISSING in product.json + AddToCartPanel (OPT-024). CheckoutForm/OrderCompletePage READ additional_options from server payloads (CheckoutItemResource.additional_options / OrderOptionResource.additional_options) — but no UI to ADD them. PARITY POLICY §1.1.1 risk.
- product review UI: product_reviews DS exists but no ReviewForm/list component in product.json slots (OPT-020).
- product qna (문의하기): no inquiry DS / form on product.json (OPT-021). mypage/inquiries is read-only fork.

Hardcoding risks for card / PG plugin activation:
- dbank/vbank UI details are NOT hardcoded — they key off core_payment_method === 'dbank'|'vbank' for refund-bank/depositor/cash-receipt (CheckoutForm.tsx:697, 998-1003, 1730-1797). New card/easy-pay methods only render their method head + label (no extra UI to suppress). Verified by CheckoutParity test: 'renders every active payment method from paymentSettings (no hardcode)' (CheckoutParity.test.tsx:194-213).
- core_payment_method translation in payload (CheckoutForm.tsx:696, 1054) → server receives core enum regardless of plugin id.
- DBank account radio (CheckoutForm.tsx:1661-1682) renders ALL active bank_accounts from settings; payload uses genuinely selected account (test: lines 215-227).
- CheckoutPage dispatches pg_payment_handler via G7Core.dispatch (CheckoutPage.tsx:461-477) — provider-agnostic, no navigate fallback when requires_pg_payment=true (test: 468-531).
- iOS-only methods (requires_ios) are filtered by appConfig.isIos (CheckoutForm.tsx:591-604; test: 194-213).
- PG error return banner (?error=confirm_failed|amount_mismatch|order_not_found) — CheckoutPage.tsx:165-169, 205-222.

Hooks / extension_points: layout checkout.json declares 'address_search_slot' (daum postcode) wrapping children of composite CheckoutPage (CheckoutPage.tsx:684 → CheckoutForm children render at zip-row; layout lines 124-188).

Save-shipping-address gate: only shows when isLoggedIn && selectedAddressId === null (CheckoutForm.tsx:1435). Saved-address pill click sets selectedAddressId → checkbox hidden (test: 123-153).

Guest: guest password min 8 chars + confirmation equality validation (CheckoutForm.tsx:910-916); auto-verify POST /guest/orders/verify after non-PG submit sets sessionStorage 'g7_guest_order_token' and G7Core.state.guestOrderToken; navigateToOrder appends ?_gtoken= for next-page hydration (CheckoutPage.tsx:147-162, 480-515).

Mypage tabs (8 tabs): profile, orders, addresses, wishlist, coupons, mileage, inquiries, change-password (layouts/partials/mypage/_tabs.json:1-244). Not present in sirsoft-basic in same form; this is Still Form fork.

Dist build: dist/js/components.iife.js present (212KB), dist/src/components/CheckoutForm.d.ts (379 lines) — same surface as src.

Version evidence: src/components/CheckoutForm.tsx = 2230 lines, CheckoutPage.tsx = 701 lines, CartItemRow.tsx = 406 lines, AddToCartPanel.tsx = 255 lines.

### OPT-001 — Same-as-orderer checkbox (주문자 정보와 동일) — copies name/phone, blur-mirror on later edits
- domain: Still Form (superbify-commerce_minimal) public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:720-735, 1257-1263
- adminUI: NONE
- publicUI: /shop/checkout
- api: GET /api/modules/sirsoft-ecommerce/checkout (CheckoutForm GET + CheckoutPage POST/PUT)
- auth: no (also visible to guests)
- config: none
- external: none
- dataMutation: cart temp_order + CreateOrderRequest POST /api/modules/sirsoft-ecommerce/user/orders
- defaultTemplate: layouts/shop/checkout.json (extends _user_base); CheckoutPage composite in slots.content[0]; addresses DS (401/403 suppress); paymentSettings DS; shippingSettings DS; modals[] partials/checkout/_modal_address_manage.json + partials/checkout/_modal_coupon_download.json; address_search_slot extension_point children.
- stillForm: CheckoutForm component + checkout.json

### OPT-002 — Multi-option payment methods — dynamic from payment_settings.payment_methods[] (NO hardcoding)
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:585-604, 1612-1803 (activeMethods.map), 202-211 (payload.payment_method uses core_payment_method translation)
- adminUI: NONE
- publicUI: /shop/checkout
- api: POST/PUT /api/modules/sirsoft-ecommerce/checkout; refetch('checkoutData')
- auth: no
- config: payment_settings.order_settings.payment_methods[] (active flag)
- external: PG plugin (sirsoft-pay_*) for card/kakao/naverpay/toss; only dbank works without PG
- dataMutation: updates temp_order on server (CreateOrderRequest)
- defaultTemplate: layouts/shop/checkout.json
- stillForm: CheckoutForm activeMethods gate (is_active + requires_ios iOS gate)

### OPT-003 — Bank account (dbank) radio selection — payload reflects genuinely selected account, no hardcode
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:606-616, 1651-1688, 706-711 (default selection: is_default)
- adminUI: NONE
- publicUI: /shop/checkout
- api: POST /api/modules/sirsoft-ecommerce/user/orders
- auth: no
- config: payment_settings.order_settings.bank_accounts[]
- external: none (server bank-transfer only)
- dataMutation: CreateOrderRequest.dbank { bank_code, account_number, account_holder }
- defaultTemplate: layouts/shop/checkout.json
- stillForm: CheckoutForm bankAccounts radio; dbankHelperLabel '입금 확인 후 배송이 시작됩니다.'

### OPT-004 — Refund bank (환불 계좌) — bank code select + account + holder, all-or-none validator
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:611-615, 1745-1789, 902-905
- adminUI: NONE
- publicUI: /shop/checkout
- api: POST /api/modules/sirsoft-ecommerce/user/orders
- auth: no
- config: payment_settings.order_settings.banks[] for vbank/dbank
- external: none
- dataMutation: CreateOrderRequest.refund_bank { bank_code, account_number, holder } all-or-none
- defaultTemplate: layouts/shop/checkout.json
- stillForm: CheckoutForm refund bank block under dbank/vbank method-detail

### OPT-005 — Cash receipt (현금영수증) — dbank-only, conditional on cash_receipt_provider
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:617, 1690-1726, 2092-2215 (CashReceiptFields); payload 1072-1074
- adminUI: NONE
- publicUI: /shop/checkout
- api: POST /api/modules/sirsoft-ecommerce/user/orders
- auth: no
- config: payment_settings.order_settings.cash_receipt_provider (e.g. pg_cashreceipt)
- external: pg_cashreceipt plugin
- dataMutation: CreateOrderRequest.cash_receipt_requested / cash_receipt_type / cash_receipt_identifier_type / cash_receipt_identifier
- defaultTemplate: layouts/shop/checkout.json
- stillForm: CheckoutForm CashReceiptFields component

### OPT-006 — Coupon selection — order_coupon + shipping_coupon + item_coupons (max 2 per item, full merged map)
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:645-656, 939-977, 1446-1537, 1898-1949
- adminUI: NONE
- publicUI: /shop/checkout
- api: PUT /api/modules/sirsoft-ecommerce/checkout (UpdateCheckoutRequest)
- auth: yes (member-only)
- config: checkoutData.available_coupons[] + per-item available_coupons/disabled_coupon_ids
- external: none
- dataMutation: UpdateCheckoutRequest.order_coupon_issue_id / shipping_coupon_issue_id / item_coupons map
- defaultTemplate: layouts/shop/checkout.json
- stillForm: CheckoutForm discount section + item coupon selects in summary items

### OPT-007 — Point (mileage) input — use_points recompute, 전액 사용 + 적용
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:642-644, 1539-1593, 979-982
- adminUI: NONE
- publicUI: /shop/checkout
- api: PUT /api/modules/sirsoft-ecommerce/checkout
- auth: yes (member-only)
- config: checkoutData.mileage.enabled + usable + available + max_usable
- external: none
- dataMutation: UpdateCheckoutRequest.use_points (number)
- defaultTemplate: layouts/shop/checkout.json
- stillForm: CheckoutForm mileage section

### OPT-008 — Discount code input — 할인코드 + 적용 버튼
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:1517-1535, 984-987
- adminUI: NONE
- publicUI: /shop/checkout
- api: PUT /api/modules/sirsoft-ecommerce/checkout
- auth: yes
- config: none (server validates)
- external: none
- dataMutation: UpdateCheckoutRequest.discount_code
- defaultTemplate: layouts/shop/checkout.json
- stillForm: CheckoutForm discount code row inside discount section

### OPT-009 — Address book pills — saved addresses (member-only) with select + recompute + 저장배송지 선택 시 save 체크박스 숨김
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:1218-1254, 829-853; layouts/shop/checkout.json:65-89
- adminUI: NONE
- publicUI: /shop/checkout
- api: GET /api/modules/sirsoft-ecommerce/user/addresses
- auth: yes (suppress on 401/403)
- config: none
- external: none
- dataMutation: none (read-only data source)
- defaultTemplate: layouts/shop/checkout.json data_sources.addresses (id 'addresses', 401/403 suppress)
- stillForm: CheckoutForm saved address pills + layout 'addresses' DS

### OPT-010 — Address manage modal (배송지 관리) — partial referenced; opens via G7Core.modal.open('checkoutAddressManageModal')
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/layouts/partials/checkout/_modal_address_manage.json; layouts/shop/checkout.json:69-77; CheckoutPage.tsx:291-299, 673
- adminUI: NONE
- publicUI: /shop/checkout (modal)
- api: GET /api/modules/sirsoft-ecommerce/user/addresses (modal partial)
- auth: yes
- config: none
- external: none
- dataMutation: modal-driven, refetchDataSource('addresses')
- defaultTemplate: layouts/shop/checkout.json modals[] partials/checkout/_modal_address_manage.json
- stillForm: checkout.json modals + CheckoutPage openAddressManager

### OPT-011 — Save address checkbox (입력한 배송지를 저장합니다) — member-only, hidden when saved-address pill selected
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:1434-1443, 1075
- adminUI: NONE
- publicUI: /shop/checkout
- api: POST /api/modules/sirsoft-ecommerce/user/orders
- auth: yes
- config: none
- external: none
- dataMutation: CreateOrderRequest.save_shipping_address (boolean)
- defaultTemplate: layouts/shop/checkout.json
- stillForm: CheckoutForm save-shipping-address CheckboxField

### OPT-012 — Daum postcode (다음 우편번호) — extension_point 'address_search_slot' bridges via _global.checkoutAddress
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:741-822, 1316-1331 (zip-row slot); layouts/shop/checkout.json:124-188
- adminUI: NONE
- publicUI: /shop/checkout
- api: PUT /api/modules/sirsoft-ecommerce/checkout
- auth: no
- config: shippingSettings.shipping.international_shipping_enabled, daum postcode plugin (extension_point provider)
- external: sirsoft-daum-postcode (extension_point)
- dataMutation: UpdateCheckoutRequest.country_code + zipcode → refetch checkoutData (도서산간 재계산)
- defaultTemplate: layouts/shop/checkout.json data_sources.shippingSettings + extension_point address_search_slot
- stillForm: CheckoutForm address-search-slot (zip-row) + extension_point

### OPT-013 — International shipping — country Select + intl fields (address_line_1/2, intl_city/state/postal_code)
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:620-640, 1009-1025, 1265-1399
- adminUI: NONE
- publicUI: /shop/checkout
- api: PUT /api/modules/sirsoft-ecommerce/checkout
- auth: no
- config: shippingSettings.shipping.international_shipping_enabled + available_countries[]
- external: none
- dataMutation: UpdateCheckoutRequest.country_code → switches KR/intl fields; resets domestic fields
- defaultTemplate: layouts/shop/checkout.json
- stillForm: CheckoutForm country select + intl address block

### OPT-014 — Guest checkout — non-member orderer info + 비밀번호 8자 validation + auto-verify for 30-min token
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:1166-1198, 910-916, 1077-1078; CheckoutPage.tsx:480-513
- adminUI: NONE
- publicUI: /shop/checkout
- api: POST /api/modules/sirsoft-ecommerce/user/orders
- auth: no (guest)
- config: none (server allows guest)
- external: none
- dataMutation: CreateOrderRequest.guest_lookup_password + guest_lookup_password_confirmation (guest only)
- defaultTemplate: layouts/shop/checkout.json
- stillForm: CheckoutForm guestLookupPassword fields + CheckoutPage auto-verify + guestOrderToken sessionStorage

### OPT-015 — PG dispatch — provider-agnostic via G7Core.dispatch(pg_payment_handler), no navigate fallback when PG
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutPage.tsx:455-477
- adminUI: NONE
- publicUI: /shop/checkout
- api: POST /api/modules/sirsoft-ecommerce/user/orders
- auth: no
- config: PG plugin (sirsoft-pay_*) responding requires_pg_payment + pg_payment_handler + pg_payment_data
- external: sirsoft-pay_toss / sirsoft-pay_kakao / sirsoft-pay_naverpay / etc.
- dataMutation: CreateOrderRequest.payment_method (core_payment_method translated) → dispatch(pg_payment_handler) when requires_pg_payment=true
- defaultTemplate: layouts/shop/checkout.json
- stillForm: CheckoutPage handleSubmit dispatch path

### OPT-016 — Add-to-cart quantity stepper — min/max/disabled submit, salesStatus CTA override (품절/판매중지)
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/AddToCartPanel.tsx:34-79, 92-250; layouts/shop/product.json:285-299
- adminUI: NONE
- publicUI: /shop/{slug}
- api: CustomEvent 'scm:add-to-cart' window event → layout apiCall handler
- auth: no
- config: product_detail.data.sales_status ('on_sale'|'sold_out'|'stopped')
- external: none
- dataMutation: none in component; layout-owned POST /api/modules/sirsoft-ecommerce/cart
- defaultTemplate: layouts/shop/product.json init_actions scmBindAddToCartListener + AddToCartPanel composite
- stillForm: AddToCartPanel — NO option selector UI for product_option_id; AddToCartPanel has NO product_options / additional_options select (GAP vs sirsoft-basic _product_purchase_card.json option selector)

### OPT-017 — Cart row — quantity stepper + 변경 button + delete (ConfirmDialog) + thumbnail + option name display
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CartItemRow.tsx:66-393; src/components/CartSummary.tsx
- adminUI: NONE
- publicUI: /cart
- api: CustomEvent 'scm:cart-qty-change' + 'scm:cart-delete' window events → layout apiCall
- auth: no (cartKey)
- config: CartItemResource fields: subtotal_formatted, product_option.option_name_localized
- external: none
- dataMutation: layout-owned PATCH/DELETE /api/modules/sirsoft-ecommerce/cart
- defaultTemplate: layouts/shop/cart.json + cart route
- stillForm: CartItemRow emits events, ConfirmDialog gates delete

### OPT-018 — Cart summary — itemCount, subtotal, shipping (zero-suppressed), total, 결제하기 / 쇼핑 계속하기 buttons
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CartSummary.tsx:67-235
- adminUI: NONE
- publicUI: /cart
- api: GET /api/modules/sirsoft-ecommerce/cart
- auth: no
- config: calculation.{subtotal,total_shipping,payment_amount,final_amount}
- external: none
- dataMutation: none (read)
- defaultTemplate: layouts/shop/cart.json (composite CartSummary)
- stillForm: CartSummary — subtotal/shipping/total + CTAs

### OPT-019 — Order summary in checkout — item name, option name, 수량, 추가옵션 group/name/custom_text/price_adjustment
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:17-60, 1874-1896
- adminUI: NONE
- publicUI: /shop/checkout
- api: none in Still Form — read from CartItemResource
- auth: no
- config: CheckoutItemResource.additional_options[] (group_name/name/custom_text/price_adjustment)
- external: none
- dataMutation: none
- defaultTemplate: layouts/shop/checkout.json + OrderCompletePage.tsx
- stillForm: CheckoutForm summary items + OrderCompletePage additional options render (OrderCompletePage.tsx:478-485)

### OPT-020 — Product review UI — DATA SOURCE ONLY, no review list/write component exposed in slots.content
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/layouts/shop/product.json:20-28
- adminUI: NONE
- publicUI: /shop/{slug}
- api: none in Still Form (data source /reviews only)
- auth: n/a
- config: product_reviews data source (declared)
- external: none
- dataMutation: none
- defaultTemplate: layouts/shop/product.json data_sources.product_reviews (endpoint /products/{slug}/reviews)
- stillForm: product_reviews DS only — no review component in product layout (GAP vs sirsoft-basic review form)

### OPT-021 — Product inquiry (qna) UI — NOT EXPOSED on /shop/{slug} in Still Form (mypage/inquiries tab exists for list, no product-detail form)
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/layouts/shop/product.json; layouts/mypage/inquiries.json; layouts/partials/mypage/inquiries/_list.json (read-only fork)
- adminUI: NONE
- publicUI: /shop/{slug} (MISSING)
- api: none in Still Form
- auth: n/a
- config: none (not declared)
- external: none
- dataMutation: none
- defaultTemplate: none — no qna/inquiry DS on product.json
- stillForm: product inquiry form is NOT exposed in product.json slots — GAP vs sirsoft-basic _product_qna.json

### OPT-022 — Mypage tabs navigation — 8 tabs: profile / orders / addresses / wishlist / coupons / mileage / inquiries / change-password
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/layouts/partials/mypage/_tabs.json:1-244
- adminUI: NONE
- publicUI: /mypage/*
- api: none
- auth: yes
- config: none
- external: none
- dataMutation: none
- defaultTemplate: layouts/partials/mypage/_tabs.json + layouts/mypage/*.json (8 tabs: profile, orders, addresses, wishlist, coupons, mileage, inquiries, change-password)
- stillForm: 8-tab nav (orders, addresses, wishlist, coupons, mileage, inquiries, profile, change-password)

### OPT-023 — Product option selector UI (단일옵션/다중옵션) — NOT EXPOSED on /shop/{slug} in Still Form (GAP vs sirsoft-basic _product_options.json)
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/layouts/shop/product.json; src/components/AddToCartPanel.tsx (no option selector)
- adminUI: NONE
- publicUI: /shop/{slug} (MISSING)
- api: none in Still Form product.json
- auth: n/a
- config: none (not declared)
- external: none
- dataMutation: none
- defaultTemplate: none — no product_option_selector / product_options partial in product.json
- stillForm: AddToCartPanel has only quantity stepper — NO product_option_id select UI. Cart/checkout show option_name read-only. GAP.

### OPT-024 — Product additional option (추가옵션) selector UI — NOT EXPOSED on /shop/{slug} (GAP vs sirsoft-basic _product_additional_options.json)
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/layouts/shop/product.json; src/components/AddToCartPanel.tsx
- adminUI: NONE
- publicUI: /shop/{slug} (MISSING)
- api: none in Still Form
- auth: n/a
- config: none (not declared)
- external: none
- dataMutation: none
- defaultTemplate: none — no additional_options partial / modal in product.json
- stillForm: CheckoutForm/OrderCompletePage READ additional_options from CartItemResource/OrderOptionResource, but AddToCartPanel has no UI to add them. GAP.

### OPT-025 — Stock / out-of-stock display — sales_status 'sold_out' disables AddToCartPanel; no live stock_quantity display per option
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/AddToCartPanel.tsx:51-55, 88-90, 204-225
- adminUI: NONE
- publicUI: /shop/{slug}
- api: none
- auth: no
- config: product_detail.data.sales_status
- external: none
- dataMutation: none
- defaultTemplate: none — product_detail.sales_status read but no separate stock_quantity
- stillForm: AddToCartPanel respects sales_status only (sold_out / stopped) — does NOT surface option-level stock_count

### OPT-026 — Unshippable items banner (has_unshippable_items) — disables 결제하기 in checkout
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:1097-1098, 1818-1827, 2009
- adminUI: NONE
- publicUI: /shop/checkout
- api: none
- auth: no
- config: checkoutData.has_unshippable_items + unavailable_items[]
- external: none
- dataMutation: none
- defaultTemplate: none
- stillForm: CheckoutForm unavailable-banner + pay button disabled

### OPT-027 — Coupon download modal — partial referenced from checkout.json (checkout-only, not product page)
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/layouts/partials/checkout/_modal_coupon_download.json; layouts/shop/checkout.json:74-77; CheckoutPage.tsx:301-328
- adminUI: NONE
- publicUI: /shop/checkout (modal)
- api: none
- auth: yes
- config: none
- external: none
- dataMutation: none
- defaultTemplate: none — coupon modal partial exists; product-page coupon download UI missing
- stillForm: CheckoutPage openCouponDownload (GET /user/coupons/downloadable)

### OPT-028 — PG error query banner (?error=confirm_failed|amount_mismatch|order_not_found) on checkout return
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutPage.tsx:165-169, 205-222
- adminUI: NONE
- publicUI: /shop/checkout (return)
- api: none in Still Form
- auth: no
- config: PG plugin redirect with ?error=
- external: sirsoft-pay_*
- dataMutation: none
- defaultTemplate: none
- stillForm: CheckoutPage PG_ERROR_LABELS + URLSearchParams hook

### OPT-029 — Shipping memo Select — door/security/parcel_box/call + custom textarea
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:1401-1432
- adminUI: NONE
- publicUI: /shop/checkout
- api: none in Still Form
- auth: no
- config: none
- external: none
- dataMutation: none
- defaultTemplate: none
- stillForm: CheckoutForm shipping memo Select + custom textarea

### OPT-030 — iOS-only payment method gating — requires_ios methods filtered by appConfig.isIos
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:591-604
- adminUI: NONE
- publicUI: /shop/checkout
- api: none in Still Form
- auth: no
- config: payment_methods[].requires_ios (boolean); appConfig.isIos in G7 state
- external: none
- dataMutation: none
- defaultTemplate: none
- stillForm: CheckoutForm activeMethods filter with iOS gate

### OPT-031 — Order list / detail / cancel modal / payment / shipping partials (mypage orders)
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/layouts/partials/mypage/orders/
- adminUI: NONE
- publicUI: /mypage/orders, /mypage/orders/{order_number}
- api: none in Still Form
- auth: yes
- config: none
- external: none
- dataMutation: none
- defaultTemplate: layouts/mypage/orders.json + partials/mypage/orders/{_list,_history,_items,_modal_cancel,_payment,_shipping,_status_header}.json
- stillForm: 7 partials (orders list + detail + cancel + payment + shipping + status header + history)

### OPT-032 — Address book management (mypage addresses) — list + modals (add/edit/delete/overwrite)
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/layouts/partials/mypage/addresses/
- adminUI: NONE
- publicUI: /mypage/addresses
- api: none in Still Form
- auth: yes
- config: none
- external: none
- dataMutation: none
- defaultTemplate: layouts/mypage/addresses.json + partials/mypage/addresses/{_list,_modal_address,_modal_confirm_delete,_modal_confirm_overwrite}.json
- stillForm: 4 partials

### OPT-033 — Deposit name (입금자명) field — required when dbank/vbank, auto-fill from ordererName
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:713-718, 895-897, 1730-1743
- adminUI: NONE
- publicUI: /shop/checkout
- api: none
- auth: no
- config: none
- external: none
- dataMutation: none
- defaultTemplate: layouts/shop/checkout.json isLoggedIn gate
- stillForm: CheckoutForm depositor_name auto-fill + required_if validator

### OPT-034 — Empty cart / no payment methods / no coupons guard states
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:1096, 1598-1605, 2009; src/components/CartSummary.tsx:191
- adminUI: NONE
- publicUI: /shop/checkout, /cart
- api: none
- auth: no
- config: none
- external: none
- dataMutation: none
- defaultTemplate: layouts/shop/checkout.json
- stillForm: isEmptyCart, emptyMethodsTitle/Message, pay-button disable

### OPT-035 — Guest order lookup (/shop/guest/orders, /shop/guest/orders/show) — uses guest_order_form/show JSON, NOT in parity scope of checkout form but present
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/layouts/shop/guest_order_form.json, guest_order_show.json
- adminUI: NONE
- publicUI: /shop/guest/orders, /shop/guest/orders/show
- api: none in Still Form
- auth: no (guest)
- config: guest_lookup_password on order
- external: none
- dataMutation: none
- defaultTemplate: none — needs custom partial
- stillForm: guest_order_form.json + guest_order_show.json layouts

### OPT-036 — Reorder layout — uses CartItemResource ordering from past order
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/layouts/shop/reorder.json
- adminUI: NONE
- publicUI: /shop/orders/{order_number}/reorder
- api: none
- auth: optional
- config: none
- external: none
- dataMutation: none
- defaultTemplate: layouts/shop/reorder.json
- stillForm: reorder.json layout

### OPT-037 — Orderer prefill from _global.currentUser (member) — name/phone/email auto-fill once
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:568-582; layouts/shop/checkout.json:110-112
- adminUI: NONE
- publicUI: /shop/checkout
- api: none in Still Form (extended form uses inputs already wired)
- auth: yes
- config: none
- external: none
- dataMutation: none
- defaultTemplate: none
- stillForm: CheckoutForm useEffect prefill with userTouchedRef

### OPT-038 — Parity regression test — 10 axes locked (same_as_orderer / save_shipping_address / saved_address pills / dbank / core_payment_method / refund_bank / cash_receipt / coupons+mileage / intl country / unavailable items / layout DS+modals / PG dispatch)
- domain: Still Form public commerce surface
- source: /home/bahmuh/20feet/templates/_bundled/superbify-commerce_minimal/__tests__/components/CheckoutParity.test.tsx:1-540
- adminUI: NONE
- publicUI: n/a (test)
- api: none
- auth: n/a
- config: none
- external: none
- dataMutation: none
- defaultTemplate: CheckoutParity test locks contracts
- stillForm: CheckoutParity.test.tsx (10 describe blocks)

