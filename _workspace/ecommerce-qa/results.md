# QA RESULTS

Total: 92 | PASS 69 | FAIL 14 | BLOCKED 6 | NOT_APPLICABLE 3

## FAILS

### OPT-001-SF [CRITICAL] (stillform)
product-detail — OPT-001 — Multi-option selector UI on product detail
- expected: Default template renders cascading Select per option group with disabled-until-prior-selected state on the product detail page; users must be able to choose option (e.g. 색상: 화이트/블랙) before adding to cart.
- actual: Still Form renders ZERO option selector UI on /shop/product/{slug}: 0 <select> elements, no option chips, no 색상/사이즈 labels. AddToCartPanel only exposes quantity stepper. _findings.json shows select_count=0, has_option_buttons=false, contains_color_label=false across products 10/11/12. Screenshots: /home/bahamut/20feet/_workspace/ecommerce-qa/screenshots/parity-stillform/desktop-1440-QA_E2E_SINGLE_OPT_PRODUCT.png (same shape for MULTI/ADDITIONAL).
- evidence: Runtime probe of product 10/11/12 pages: 0 selects, 0 [data-option-id] elements, 0 tab indicators. Source: /home/bahamut/20feet/templates/_bundled/superbify-commerce_minimal/layouts/shop/product.json contains AddToCartPanel only (lines 285-299); no option_group iteration, no additional_option iteration. Default template /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/detail/_purchase_card.json lines 37-109 render sequential option group Selects with cascading disabled state.
- rootCause: templates/_bundled/superbify-commerce_minimal/layouts/shop/product.json:285-299 (AddToCartPanel only; no option_group iteration)
- fixProposal: Add option group Select (or chip) iteration in product.json summary block, after Price component and before AddToCartPanel; bind selectedOptionItems in local state and POST option_id in cart payload. Reuse default template _purchase_card.json logic or extract OptionSelector composite into src/components/. Disable AddToCartPanel until valid option selected.

### OPT-002-SF [HIGH] (stillform)
product-detail — OPT-002 — Additional option selector UI
- expected: Default template renders additional-option Select (with optional custom-text input) per selected product option, attached to each cart item via additional_option_selections payload.
- actual: No additional-option UI on /shop/product/QA_E2E_ADDITIONAL_OPTION_PRODUCT: contains_additional_label=false, select_count=0. Source product.json has no additional_options block.
- evidence: Runtime probe of product 12 page: 0 selects, no 선물포장/각인 text. Source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/partials/shop/detail/_purchase_card.json:232-329 renders per-option-block additional-option Select with allow_custom_text input.
- rootCause: templates/_bundled/superbify-commerce_minimal/layouts/shop/product.json:285-299
- fixProposal: Add per-option-block additional option iteration in product.json inside selectedOptionItems loop; emit add_option Select with custom_text input when allow_custom_text=true; include additional_option_selections in cart POST payload.

### REVIEW-001-SF [HIGH] (stillform)
product-detail — REVIEW-001 — Review list UI on product detail
- expected: Default template shows tab nav with reviews badge + rating summary + 5-star bars + filter controls + pagination on product detail.
- actual: No review tab / list / stats / filter on /shop/product/{slug}. contains_review_text=false, tab_count_indicators=0. product_reviews data source declared (product.json:21-30) but never rendered.
- evidence: Runtime: all 3 product pages have 0 review-related text in DOM. Source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/shop/show.json:452-470 tabs block + _tab_reviews.json partials render review list with rating stats/photo filter/rating filter/option filter/pagination. Still Form product.json has data_source declaration only — no slot consumes it.
- rootCause: templates/_bundled/superbify-commerce_minimal/layouts/shop/product.json:21-30 (data source declared but unused)
- fixProposal: Add tab nav block in product.json (info/reviews/qna) and a review list section that consumes product_reviews data source with rating stats + photo_only/rating/option filters + pagination. Reuse _tab_reviews.json from default or write src/components/ReviewList.tsx.

### QNA-001-SF [MEDIUM] (stillform)
product-detail — QNA-001 — Product inquiry (Q&A) tab UI
- expected: Default template shows Q&A tab with inquiry list and login-gated write modal when modules['sirsoft-ecommerce'].inquiry.board_slug is set.
- actual: No inquiry (Q&A) tab on /shop/product/{slug}. contains_inquiry_text=false, tab_count_indicators=0.
- evidence: Runtime: 0 inquiry text in all 3 product pages. Source: /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/shop/show.json:182-217 (qna data source) + _tab_qna.json partial + _modal_qna_write.json partial. Still Form has no Q&A tab.
- rootCause: templates/_bundled/superbify-commerce_minimal/layouts/shop/product.json (no qna data source declared)
- fixProposal: Add qna data source in product.json (gate by inquiry.board_slug config) + tab nav entry + list section + _modal_qna_write partial reuse. POST to /api/.../products/{id}/inquiries.

### MYPAGE-REVIEW-TAB [LOW] (stillform)
mypage — MYPAGE-8-TABS — mypage reviews tab parity
- expected: OPT-022 mypage 8 tabs spec; default template has reviews tab.
- actual: Still Form renders 7 visible mypage tabs (orders, addresses, coupons, mileage, wishlist, inquiries, profile) + change_password modal. NO mypage/reviews tab. Default template has mypage/reviews tab.
- evidence: /home/bahamut/20feet/templates/_bundled/superbify-commerce_minimal/routes.json (no mypage/reviews entry) + layouts/mypage/ listing (8 layouts incl change_password but no reviews.json). Default template /home/bahamut/20feet/templates/_bundled/sirsoft-basic/layouts/mypage/wishlist.json etc.
- rootCause: templates/_bundled/superbify-commerce_minimal/routes.json + layouts/mypage/ (missing reviews.json)
- fixProposal: Add mypage/reviews.json layout that lists completed-order reviews the member has written (or be removed from parity matrix if reviews list = wishlist-equivalent UI is intentionally out of scope for Still Form). Confirm scope with user before adding.

### PARITY-MATRIX [HIGH] (stillform)
parity-matrix — Parity matrix ~20 features
- expected: All 20 core public features parity or documented UX degradation.
- actual: 20-row parity matrix comparison default template source vs Still Form runtime. FAIL rows: OPT-001, OPT-002, REVIEW-001, QNA-001, MYPAGE-REVIEW-TAB. PASS rows: OPT-001 (API), PRICE-001, STOCK-001, CART-001 (base panel), CART-002 (cart list partials exist), CHK-001..006, CHK-PARITY-SUITE, ADDR-001/002, PAY-001/002/003, GUEST-001, WISH-001/002, QNA-002, REORDER-001, REVIEW-003 (mypage orders modal exists). Dist/src in sync. UX_DEGRADE rows: 0.
- evidence: _findings.json + 17 screenshots in /home/bahamut/20feet/_workspace/ecommerce-qa/screenshots/parity-stillform/.
- rootCause: templates/_bundled/superbify-commerce_minimal/layouts/shop/product.json (lacks option/additional-option/review-tab/inquiry-tab slots)
- fixProposal: See individual FAIL case fixProposals. Add product detail option/additional-option/review-tab/inquiry-tab partials or composite components.

### SEC-STOCK-001 [HIGH] (upstream_g7)
security/stock-bypass — SEC-STOCK: oversell rejection at order create
- expected: Backend must reject oversell: a second order placing qty 1 when stock=5 (already committed by first order qty 5) MUST return 422 InsufficientStockException.
- actual: StockService::validateStock at order creation checks only per-order quantity vs stock_quantity (no reservation model). Product 9 (stock=5) accepted order A qty 5 AND order B qty 1 because each individual order's quantity (5 or 1) is <= stock_quantity 5. is_stock_deducted=0 on both order_options. Stock is NOT reserved at order creation; deduction happens only at payment confirmation (deductStock). Two pending orders can co-exist over committing stock.
- evidence: php artisan tinker showed product_options.stock_quantity remained 5 after both orders; ecommerce_order_options.is_stock_deducted=0 for both. DeductStock at OrderProcessingService.php (called from completePayment) uses SELECT FOR UPDATE. /home/bahamut/20feet/modules/sirsoft-ecommerce/src/Services/StockService.php:33 (validateStock) vs :68 (deductStock — actual gate).
- rootCause: modules/sirsoft-ecommerce/src/Services/StockService.php:33-59 (validateStock has no per-order accumulation / no reservation count; gap between order and deductStock at payment)
- fixProposal: 

### SEC-COUPON-002 [CRITICAL] (upstream_g7)
security/coupon-scope-bypass — SEC-COUPON: non-target product gets discount
- expected: Coupon with target_scope=products and includedProducts=[13] MUST NOT apply discount to cart containing only product 9.
- actual: SECURITY BUG: applyOrderCoupon at OrderCalculationService.php:1376 computes $totalOrderAmount across ALL cart items, then calculateCouponDiscount over the full totalOrderAmount, then apportionAmount across ALL items. It DOES NOT call filterItemsByScope(). When member 3 applied coupon 1 (target_scope=products, includedProducts=[13]) to a cart containing only product 9, the calc returned order_coupon_discount=10000 and final_amount=30000 (vs correct 40000). Confirmed: in isolation filterItemsByScope returns [] for the same input, but the actual calc service applies discount to non-target product via applyOrderCoupon's all-items path.
- evidence: php artisan tinker direct test: filterItemsByScope on [product=9] + coupon(id=1, target_scope=products, includedProducts=[13]) returned count=0 (correct). Live API on member 3 cart item 160 (product 9 qty 2) with PUT checkout order_coupon_issue_id=6 (coupon 1) returned calc.summary.final_amount=30000 (should be 40000). /home/bahamut/20feet/modules/sirsoft-ecommerce/src/Services/OrderCalculationService.php:1376-1442 (applyOrderCoupon skips scope filter that applyProductCoupons:770 calls).
- rootCause: modules/sirsoft-ecommerce/src/Services/OrderCalculationService.php:1376-1442
- fixProposal: In OrderCalculationService::applyOrderCoupon (line 1376), before calculating totalDiscount, filter $discountedItems via $this->filterItemsByScope($preparedItems, $coupon) and compute totalOrderAmount only from filtered items, or call continue with ValidationError::invalidTarget when filter returns empty (mirror applyProductCoupons:770-776 logic).

### OUT-OF-STOCK [MEDIUM] (upstream_g7)
order-lifecycle — Out-of-stock guard (sold_out banner + add-to-cart 4xx)
- expected: Public product detail should show sold_out banner; add-to-cart must be rejected with 4xx when option stock=0.
- actual: Admin set prod9 stock=0. POST /cart (qty=1) returns 200 success and adds to cart (no 4xx). GET /products/9 returns stock_quantity=0, sales_status=on_sale (no auto sold_out). POST /checkout returns 200 (temp_order). POST /user/orders (finalize) returns 200 success — order 30 created at stock=0, OPT9 dropped from 3→2. Cart-add does not 4xx, only the order-finalize path is silent on stock=0 (no stock guard in stockService for already-0 stocks when quantity is within "stock but stock=0" edge case).
- evidence: /tmp/prod9-set0.json, /tmp/c4-add.json, /tmp/c4-order.json (order 20260831-1906431383 status=pending_payment). modules/sirsoft-ecommerce/src/Services/CartService.php:579,626 — CartAddStockService clamps to stock but does not 4xx when stock=0; default template (sirsoft-basic) shows the same behavior (sold_out is a manual sales_status flag, see _purchase_card.json banner logic).
- rootCause: modules/sirsoft-ecommerce/src/Services/CartService.php:579,626 (cart-add clamps but does not 4xx) + ProductResource lacks is_sold_out aggregation
- fixProposal: Add is_sold_out = stock_quantity <= 0 || !is_active computed in ProductOptionResource (already there at line 62) and propagate to product-level sold_out state; gate CartController store with 422 when any selected option is_sold_out. Upstream behavior matches default template so fix belongs in module core.

### PAY-002 [MEDIUM] (upstream_g7)
payment-builtin — PAY-BUILTIN-METHODS-001 — vbank enable without PG plugin
- expected: Should be able to enable vbank like dbank (a built-in payment method). vbank.needs_pg=true makes it PG-required at runtime, but enabling without a provider configured may be reasonable to allow test environments to surface the option.
- actual: PUT settings to enable vbank returned error: "이 결제수단을 활성화하려면 PG사를 먼저 선택하세요." available_pg_providers is empty array because all PG plugins (sirsoft-pay_kginicis/khnkcp/nicepayments/tosspayments) live under plugins/_bundled/ but none are activated. vbank.needs_pg=true; backend enforces pg_provider before is_active=true.
- evidence: PUT response errors.order_settings.payment_methods.0.pg_provider; admin/settings payload shows available_pg_providers=[].
- rootCause: /home/bahamut/20feet/modules/sirsoft-ecommerce/src/Http/Requests/Admin/StoreEcommerceSettingsRequest.php validates payment_methods.*.pg_provider required for needs_pg methods
- fixProposal: 

### PAY-005 [MEDIUM] (upstream_g7)
payment-builtin — PAY-BUILTIN-METHODS-001 — vbank without PG plugin graceful behavior
- expected: vbank should be rejected or skipped cleanly when no PG provider is registered, instead of accepting an order that can never complete.
- actual: POST /user/orders payment_method=vbank with no PG plugin installed → order 20260831-1909377233 created status=pending_payment. Backend does NOT reject; vbank needs_pg=true and would crash/stall at PG approval step but order creation succeeds without crash.
- evidence: Order 20260831-1909377233 in admin/orders list.
- rootCause: /home/bahamut/20feet/modules/sirsoft-ecommerce/src/Http/Requests/Public/CreateOrderRequest.php accepts vbank without pg_provider check; OrderProcessingService does not validate PG provider at create time.
- fixProposal: 

### PAY-006 [HIGH] (upstream_g7)
payment-builtin — PAY-001 — server-side rejection of disabled payment method
- expected: Server should reject payment_method=card when is_active=false in order_settings.
- actual: POST /user/orders payment_method=card (card is_active=false in order_settings) → order 20260831-1909450487 created status=pending_order (different from dbank's pending_payment). Card.needs_pg=true and no provider registered — order sits pending.
- evidence: Order 20260831-1909450487 in admin/orders; checkout API allows card even when is_active=false.
- rootCause: /home/bahamut/20feet/modules/sirsoft-ecommerce/src/Http/Requests/Public/CreateOrderRequest.php:66-78 validates payment_method ∈ enum but does NOT check is_active against storage settings.
- fixProposal: 

### OPT-020 [MEDIUM] (stillform)
product-admin — OPT-020 3-level multi-dimension option support
- expected: 3-level (색상x사이즈x재질) combination semantics: admin API accepts ≥3 option groups; public API returns correct option_groups structure for UI selector rendering.
- actual: Created QA_E2E_3LEVEL_PRODUCT_1 (id=17) with 3 option_groups (색상x사이즈x재질) via POST /admin/products. Server accepted the payload with 2 of 8 possible combinations (WS+면, WS+데님). Each option stored option_values as JSON array of 3 key/value pairs (color/size/material). DB: 2 rows in ecommerce_product_options table with JSON option_values containing all 3 dimensions. However, public API GET /products/17 returns option_groups=[] and has_options=False (BUG: option_groups extraction failed).
- evidence: API POST /admin/products with 3-group payload → success, options stored with option_values=[{color,size,material}]. GET /api/modules/sirsoft-ecommerce/products/17 → option_groups=[], options count=2 but has_options=False. DB tinker: g7_ecommerce_products.has_options=false for id=17. Module src/Enums/ProductSalesStatus.php exists; product model Product.php does not auto-derive option_groups from JSON option_values column for public detail rendering.
- rootCause: 
- fixProposal: Derive option_groups from option_values JSON column on read (modules/sirsoft-ecommerce/src/Models/Product.php) so public ProductResource returns reconstructed groups. Also set products.has_options=true when options[] is non-empty. UI may not render selector for 3-group; verify Still Form shop/show.json supports it. Cleanup: deleted id=17 (DB count=0).

### WISH-002 [MEDIUM] (stillform)
Auxiliary ecommerce / public storefront — Still Form product-detail wishlist UI gap
- expected: Heart icon on product detail toggles wishlist; mypage/wishlist page exposes list.
- actual: Still Form product.json has no wishlist heart toggle component on /shop/{slug} page (HTML scrape: no /wishlist|찜|heart/ markup in product detail page; HEART_LOCATOR_COUNT=0 via Playwright). Mypage /mypage/wishlist IS exposed (loaded 200, renders 5-col grid with heart-off button + remove heart). API+DB layer is intact, UI toggle on product detail is the GAP.
- evidence: templates/_bundled/superbify-commerce_minimal/layouts/shop/product.json (no wishlist component/slot); templates/_bundled/superbify-commerce_minimal/layouts/mypage/wishlist.json (exists); default template's _header.json wires heart toggle (sirsoft-basic). Screenshot: _workspace/ecommerce-qa/screenshots/wishlist/product-detail-1440.png.
- rootCause: templates/_bundled/superbify-commerce_minimal/layouts/shop/product.json — no wishlist toggle component in slots.content (GAP vs sirsoft-basic _header.json)
- fixProposal: Add wishlist heart toggle to product.json slots.content (Still Form): add data_source wishlist_check, include _header-like heart component on detail. Backend (toggle endpoint, list, mypage) is fully wired — only UI missing.


## BLOCKED

### CHK-006
checkout — Save-shipping-address on checkout (CHK-006)
- reason: [name=save_shipping_address] checkbox present and unchecked by default. Source-verified auto-save logic at OrderController.php:120-155 (non-PG: immediate createAddress on order-create) + OrderProcessingService.php:1753-1776 (PG path: deferred until completePayment). Cannot test full order-create → save end-to-end because PAYMENT_NOT_INSTALLED.
- next: 

### ADDR-004
address-book — Daum postcode wiring on checkout (ADDR-004)
- reason: Checkout page (KR) renders '주소 검색' button next to zipcode input. Clicking it succeeds (no popup-block timeout in this run). External daum postcode script popup itself cannot be tested in headless (external daum.net popup) — BLOCKED for popup interaction. Plugin wiring verified: stillform CheckoutForm.tsx:737+1312 uses extension_point children slot for daum plugin. Active plugin: sirsoft-daum_postcode 1.0.2.
- next: 

### PAY-009
payment-pg — PG real approval (card/vbank) — built-in method without PG plugin
- reason: All PG plugins (sirsoft-pay_kginicis, sirsoft-pay_khnkcp, sirsoft-pay_nicepayments, sirsoft-tosspayments) live under plugins/_bundled/ only — none activated. Real card/vbank approval cannot be exercised. Test environments must install + configure a plugin to enable real approval flow.
- next: 

### SHIP-ISLAND-012
shipping — SHIP-002 island/remote surcharge
- reason: No shipping policy in DB has extra_fee_enabled=1 (query returned []). All 4 policies (id=1 free, 2 fixed, 3 conditional_free + default=null) have extra_fee_enabled=false and empty extra_fee_settings. Per contract ("read-mostly + your own temp orders" + "do NOT edit global ecommerce settings"), cannot mutate a policy to add extra_fee settings without touching shared data. Logic verified via source: ShippingPolicyCountrySetting::getExtraFeeForZipcode (line 275-327) supports range "63000-63999", wildcard "63*", and exact match — KR-only path via OrderCalculationService::calculateExtraShippingFee:1214-1240. No live end-to-end test data exists.
- next: 

### ADDR-DAUM-013
checkout-address — ADDR-004 Daum postcode plugin + slot wiring
- reason: Plugin sirsoft-daum_postcode v1.0.2 installed at /home/bahamut/20feet/plugins/sirsoft-daum_postcode (active, not just _bundled). Plugin declares 2 hooks (action sirsoft-daum_postcode.address.selected + filter sirsoft-daum_postcode.filter_address_data) and ships dist/js/plugin.iife.js (frontend-only). No PHP routes (no src/routes/api.php) — Daum runs as client-side script loaded from t1.daumcdn.net. Still Form template wires the extension_point slot at 3 places: layouts/shop/checkout.json:140-142 (checkout_address_search_slot), partials/checkout/_modal_address_manage.json:847-849, partials/mypage/addresses/_modal_address.json:224-226, partials/mypage/profile/_edit.json:220-222. Default sirsoft-basic template also wires checkout_address_search_slot in partials/shop/_checkout_shipping.json:485-487. Runtime popup automation is BLOCKED — would require a browser session against the external Daum CDN (t1.daumcdn.net) popup iframe, outside the in-process API test contract.
- next: 

### COUP-002-AUTO
coupon — Auto-issue — signup/first_purchase/birthday
- reason: NO auto-issue coupons exist in DB (issue_condition in {signup, first_purchase, birthday} count=0). Source review: NO listener, hook, or event handler in /modules/sirsoft-ecommerce/src/ implements signup→coupon, first_purchase→coupon, or birthday→coupon auto-issuance. The CouponIssueCondition enum defines these values but they are unused at runtime. This is upstream G7 module limitation — not configurable in current install.
- next: BLOCKED — feature not implemented in sirsoft-ecommerce 1.1.2. Documented as expected (CouponIssueCondition enum has values but no event listeners). If product requires auto-issue: implement signup/first_purchase/birthday listeners via HookManager::doAction on core.auth.after_signup, order.after_payment_complete, and a birthday cron (similar to NotifyExpiringMileageCommand.php at modules/sirsoft-ecommerce/src/Console/Commands/). USER APPROVAL REQUIRED before implementation.


## NOT_APPLICABLE

### PAY-010
payment-builtin — CHK-002 — payment callback amount guard (tampered amount)
- why: No built-in payment completion endpoint exists for client-side callback tampering tests. OrderProcessingService.completePayment() is server-internal; admin confirm-deposit is the only mutation entry point and it enforces amount equality (PAY-004). No built-in PG callback route is registered (would come from each plugin).

### SHIP-CONFIG-014
shipping — SHIP-ORDER-CREATE-014
- why: Not directly in SHIP domain scope but observed: dbank payment method is is_active=true in payment settings (order_settings.payment_methods[2].is_active=true), but bank_accounts[] returned empty (no active account configured). Public checkout for dbank would require bank_code/account_number/account_holder but no default bank exists. Did NOT mutate global settings per contract.

### MLP-001
member-level pricing — Member-level (grade) pricing
- why: Confirmed NOT IMPLEMENTED. DTO placeholders exist (CalculationInput.metadata.user_grade_id, ItemCalculation.grade_discount_amount) but no Model, migration, controller, or service for member-level pricing exists in this module. Source grep returns only DTO comments + lang 'grade' shipping tier key (unrelated). CheckoutForm has no member-grade field.


## ALL CASES

| id | status | sev | domain | feature |
|---|---|---|---|---|
| OPT-001-SF | FAIL | CRITICAL | product-detail | OPT-001 — Multi-option selector UI on product detail |
| OPT-002-SF | FAIL | HIGH | product-detail | OPT-002 — Additional option selector UI |
| REVIEW-001-SF | FAIL | HIGH | product-detail | REVIEW-001 — Review list UI on product detail |
| QNA-001-SF | FAIL | MEDIUM | product-detail | QNA-001 — Product inquiry (Q&A) tab UI |
| PANEL-BASE-SF | PASS |  | product-detail | PRICE-001 + STOCK-001 + CART-001 base panel |
| CHK-PARITY-SUITE | PASS |  | checkout | CheckoutParity test suite (20 tests) |
| SHOT-EVIDENCE | PASS |  | screenshot-evidence | Screenshot evidence capture |
| DIST-SYNC | PASS |  | build | dist vs src staleness |
| MYPAGE-REVIEW-TAB | FAIL | LOW | mypage | MYPAGE-8-TABS — mypage reviews tab parity |
| PARITY-MATRIX | FAIL | HIGH | parity-matrix | Parity matrix ~20 features |
| SEC-PRICE-001 | PASS |  | security/price-tampering | SEC-PRICE: order amount tampering |
| SEC-STOCK-001 | FAIL | HIGH | security/stock-bypass | SEC-STOCK: oversell rejection at order create |
| SEC-QTY-001 | PASS |  | security/quantity-validation | SEC-QTY: invalid cart quantity rejection |
| SEC-COUPON-001 | PASS |  | security/coupon-tampering | SEC-COUPON: coupon abuse |
| SEC-COUPON-002 | FAIL | CRITICAL | security/coupon-scope-bypass | SEC-COUPON: non-target product gets discount |
| SEC-POINT-001 | PASS |  | security/point-tampering | SEC-POINT: mileage tampering |
| SEC-ACCESS-001 | PASS |  | security/access-control | SEC-ACCESS: cross-user data access |
| SEC-GUEST-001 | PASS |  | security/brute-force | SEC-GUEST: wrong password throttle |
| SEC-AUTH-001 | PASS |  | security/authentication | SEC-AUTH: missing Bearer / wrong role |
| SEC-CSRF-001 | PASS |  | security/csrf | SEC-CSRF: design note + admin session-only no-token |
| MONEY-001 | PASS |  | security/money-consistency | MONEY-CONSISTENCY: order total math |
| CART-001 | PASS |  | cart | Guest cart add (CART-001) — option uniqueness |
| CART-002 | PASS |  | cart | Cart mutations (CART-002) |
| QTY-001 | PASS |  | cart | Quantity edges (QTY-001) |
| ADD-OPT-001 | PASS |  | cart | Additional option cart line separation (CART-001 extended) |
| CART-MERGE-001 | PASS |  | cart | Guest→member cart merge on login (CART-002) |
| ADDR-001-003 | PASS |  | address-book | Address book CRUD + default + duplicate guard (ADDR-001/002/003) |
| CHK-001 | PASS |  | checkout | Checkout temp order price tamper resistance (CHK-001) |
| CHK-005 | PASS |  | checkout | Same-as-orderer + saved-address quick-pick (CHK-005 / ADDR-001 quick-pick) |
| CHK-006 | BLOCKED | LOW | checkout | Save-shipping-address on checkout (CHK-006) |
| ADDR-004 | BLOCKED | LOW | address-book | Daum postcode wiring on checkout (ADDR-004) |
| CLEANUP-001 | PASS |  | cart | Cleanup shared member cart lines after tests |
| STOCK-001 | PASS |  | order-lifecycle | Stock deduction timing (order_placed vs payment_complete) |
| STOCK-002 | PASS |  | order-lifecycle | Option-level stock isolation |
| OUT-OF-STOCK | FAIL | MEDIUM | order-lifecycle | Out-of-stock guard (sold_out banner + add-to-cart 4xx) |
| OVERSELL | PASS |  | order-lifecycle | Oversell rejection at cart-add stage |
| CONCURRENT | PASS |  | order-lifecycle | Concurrent order atomic stock deduction |
| STOCK-RESTORE | PASS |  | order-lifecycle | Stock restore on cancellation |
| PARTIAL-CANCEL | PASS |  | order-lifecycle | Partial cancel — single line only |
| ADMIN-LIFECYCLE | PASS |  | order-lifecycle | Admin order status lifecycle + transition gate |
| ADMIN-LIST-DETAIL-MEMO-BULK | PASS |  | order-lifecycle | Admin order list/detail/search/memo/bulk CRUD |
| GUEST-VERIFY-CANCEL | PASS |  | order-lifecycle | Guest order verify + cancel via password |
| PAY-001 | PASS |  | payment-builtin | PAY-METHOD-001 / PAY-001 — dynamic payment method list (no hardcode) |
| PAY-002 | FAIL | MEDIUM | payment-builtin | PAY-BUILTIN-METHODS-001 — vbank enable without PG plugin |
| PAY-003 | PASS |  | payment-builtin | PAY-BUILTIN-DBANK-001 — dbank E2E (built-in) |
| PAY-004 | PASS |  | payment-builtin | ORD-DEPOSIT-001 / CHK-002 — deposit amount mismatch guard |
| PAY-005 | FAIL | MEDIUM | payment-builtin | PAY-BUILTIN-METHODS-001 — vbank without PG plugin graceful behavior |
| PAY-006 | FAIL | HIGH | payment-builtin | PAY-001 — server-side rejection of disabled payment method |
| PAY-007 | PASS |  | payment-pg-dispatch | OPT-015 — PG dispatch path via G7Core.dispatch |
| PAY-008 | PASS |  | payment-builtin | CHK-002 / duplicate order protection |
| PAY-009 | BLOCKED |  | payment-pg | PG real approval (card/vbank) — built-in method without PG plugin |
| PAY-010 | NOT_APPLICABLE |  | payment-builtin | CHK-002 — payment callback amount guard (tampered amount) |
| SHIP-LIST-001 | PASS |  | shipping | SHIP-001 list shipping policies |
| SHIP-CREATE-002 | PASS |  | shipping | SHIP-001 create conditional_free policy |
| SHIP-FEE-FREE-003 | PASS |  | shipping | SHIP-001 free policy fee=0 |
| SHIP-FEE-MIXED-004 | PASS |  | shipping | SHIP-001 mixed policy fee math |
| SHIP-THR-BELOW-005 | PASS |  | shipping | SHIP-036 free-over threshold below |
| SHIP-THR-ABOVE-006 | PASS |  | shipping | SHIP-036 free-over threshold above |
| SHIP-TYPES-007 | PASS |  | shipping | SHIP-STATUS-001 shipping_types seeded |
| SHIP-CARRIERS-008 | PASS |  | shipping | SHIP-STATUS-001 carriers seeded |
| SHIP-CARRIER-UPDATE-009 | PASS |  | shipping | SHIP-STATUS-001 admin carrier+tracking update |
| SHIP-STATUS-TRANSITION-010 | PASS |  | shipping | SHIP-STATUS-001 status state machine |
| SHIP-ENUM-011 | PASS |  | shipping | SHIP-STATUS-001 enum values |
| SHIP-ISLAND-012 | BLOCKED |  | shipping | SHIP-002 island/remote surcharge |
| ADDR-DAUM-013 | BLOCKED |  | checkout-address | ADDR-004 Daum postcode plugin + slot wiring |
| SHIP-CONFIG-014 | NOT_APPLICABLE |  | shipping | SHIP-ORDER-CREATE-014 |
| OPT-022 | PASS | LOW | product-admin | OPT-022 Product CRUD roundtrip |
| OPT-005 | PASS | LOW | product-detail | OPT-005 Option price adjustment |
| OPT-019 | PASS | LOW | product-detail | OPT-019 Multi-dimension option matrix |
| OPT-020 | FAIL | MEDIUM | product-admin | OPT-020 3-level multi-dimension option support |
| OPT-018 | PASS | LOW | product-detail | OPT-018 Additional options price add and custom_text |
| OPT-025 | PASS | LOW | product-admin | OPT-025 Product image upload + display |
| OPT-026 | PASS | LOW | product-admin | OPT-026 Category CRUD + product attachment |
| OPT-021 | PASS | LOW | product-admin | OPT-021 Sales status CTA behavior |
| OPT-028 | PASS | LOW | product-detail | OPT-028 Product detail UI parity |
| COUP-001 | PASS |  | coupon | Coupon types/scope enumeration + apply E2E |
| COUP-002-EXP | PASS |  | coupon | Coupon validation — expired |
| COUP-002-MIN | PASS |  | coupon | Coupon validation — min_order_amount violation |
| COUP-002-PERUSER | PASS |  | coupon | Coupon validation — per_user_limit enforcement |
| COUP-002-AUTO | BLOCKED |  | coupon | Auto-issue — signup/first_purchase/birthday |
| MILE-001 | PASS |  | mileage | Mileage balance + ledger |
| MILE-002 | PASS |  | mileage | Mileage use validation + checkout integration |
| MILE-COUPON-COMBO | PASS |  | checkout | Coupon + mileage combined discount on temp order |
| MLP-001 | NOT_APPLICABLE |  | member-level pricing | Member-level (grade) pricing |
| ORD-CANCEL-SIDE-001-COUP-MILE | PASS |  | order-lifecycle | Coupon + mileage restore on cancel (source verification) |
| ORD-MILEAGE-TIMING-001 | PASS |  | order-lifecycle | Mileage deduction timing config |
| WISH-001 | PASS |  | Auxiliary ecommerce / member-facing | Wishlist toggle + DB row + list |
| WISH-002 | FAIL | MEDIUM | Auxiliary ecommerce / public storefront | Still Form product-detail wishlist UI gap |
| REC-001 | PASS |  | Auxiliary ecommerce / public storefront | Recent-viewed endpoint behavior |
| INQ-001 | PASS |  | Auxiliary ecommerce / member-facing + admin | Product inquiry full lifecycle + secret flag + notification |
| REV-001 | PASS |  | Auxiliary ecommerce / member-facing + admin | Product review full lifecycle + canWrite + image |
| NOTIF-001 | PASS |  | Auxiliary ecommerce / notifications | Order + inquiry notifications fired (database channel) |
