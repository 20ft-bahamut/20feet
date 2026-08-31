# Still Form Checkout — Functional Parity Matrix

- Discovery: 2026-08-31, parallel audit workflow (default auditor / still-form auditor / payment / shipping / QA / completeness critic).
- Default (functional SSoT): `templates/_bundled/sirsoft-basic` (layouts/shop/_checkout_*.json) + `modules/_bundled/sirsoft-ecommerce` backend.
- Still Form (presentation layer): `templates/_bundled/superbify-commerce_minimal` (src/components/CheckoutForm.tsx, CheckoutPage.tsx, layouts/shop/checkout.json).
- Rule: default contract + still-form visual. No feature deletion.

## Matrix

| 기능 | DEFAULT | STILL FORM (before) | ACTION |
|---|---|---|---|
| 주문자 이름/연락처/이메일 | YES | YES | KEEP |
| 회원 prefill (currentUser) | YES | YES | KEEP |
| 비회원 조회 비밀번호 + 자동 verify + _gtoken | YES | YES | KEEP |
| 배송지 관리 (list/select/modal + CRUD) | YES (shop `_modal_address_manage`) | NO | RESTORE (layout modal, reuse mypage partials + G7Core.modal.open) |
| 저장 배송지 선택 pills | YES (`userAddresses` DS) | NO | RESTORE (React pills + recompute PUT) |
| 주문자 정보와 동일 | YES (`same_as_orderer`) | NO | RESTORE |
| 입력한 배송지 저장 (`save_shipping_address`) | YES (member + 직접입력만) | NO | RESTORE (checkbox → POST body) |
| 주소검색 (daum address_search_slot bridge) | YES | YES (bridge exists) | KEEP |
| 배송 메모 select + custom collapse | YES (custom → shipping_memo 단일 필드) | partial (custom collapse OK, extra key dead) | FIX contract |
| 국가 선택 + intl fields (address_line_1/2, intl_city/state/postal) | YES (international_shipping_enabled 시) | NO (KR hardcode) | RESTORE |
| 배송비 재계산 (PUT /checkout on zipcode/country) | YES | YES (daum 경로만) | EXTEND to address select / country change |
| 상품 이미지/이름/옵션/수량 | YES | YES | KEEP |
| 추가옵션 (additional_options) 표시 | YES | NO | RESTORE (summary + complete) |
| 상품금액/배송비/할인/총결제 | YES | YES | KEEP |
| 상품쿠폰 (item_coupons, ≤2/item, disabled_coupon_ids) | YES (_checkout_items) | NO | RESTORE |
| 주문쿠폰 / 배송비쿠폰 select | YES | NO | RESTORE |
| 쿠폰 다운로드 (downloadable modal + POST) | YES | NO | RESTORE |
| 할인코드 | YES UI (backend 미구현) | NO | RESTORE UI (동일 동작) |
| 마일리지/포인트 (use_points, 전액사용, 적용, points_used) | YES | NO | RESTORE |
| 결제수단 동적 렌더링 (settings/payment) | YES | YES | KEEP |
| iOS 게이트 (requires_ios) | YES | NO | RESTORE |
| core_payment_method translation | YES | NO | RESTORE |
| 무통장입금 계좌 선택 (radio, selectedDbank → dbank payload) | YES | NO (display-only + 하드코딩 fake 계좌) | RESTORE + FIX fake 계좌 제거 |
| 입금자명 (vbank/dbank required) | YES | YES | KEEP |
| 환불계좌 (refund_bank 3-tuple) | YES (vbank+dbank) | NO | RESTORE |
| 현금영수증 (module extension slot `shop_checkout_cash_receipt_slot`) | YES | NO | RESTORE (slot + payload merge) |
| 입금예고일 안내 (auto_cancel_days) | YES | NO | RESTORE |
| 결제 동의 | YES (text only) | YES (text) | KEEP |
| PG dispatch (`pg_payment_handler` via G7Core.dispatch) | YES | NO (handler ignored) | RESTORE |
| PG error query-param banner | YES | NO | RESTORE |
| unavailable_items / has_unshippable_items | YES (modal + disable CTA) | NO | RESTORE (banner + disable = presentation adaptation) |
| temp_order 부재 모달 | YES | banner path exists | KEEP (visual adaptation) |
| Order complete member/guest 분기 | YES | BUG (isLoggedIn=false hardcode) | FIX |
| 바로구매 direct_items → checkout | YES | BROKEN (no handler) | RESTORE |
| guest_order_form member-redirect + clearGuestTokenOnEntry | YES | NO | RESTORE |
| recipient_tel / address_type_code | default 미렌더 (backend optional) | 미렌더 | N/A (default와 동일) |
| identity_target (engine apiCall) | YES | fetch+Bearer 동급 | N/A |
| route prefix expression (`route_path ?? 'shop'`) | YES | hardcode /shop | KNOWN DIFF (still-form routes 전체 하드코딩, 본 과제 밖) |

## Order payload contract (POST /user/orders, default SSoT)

`temp_order_id, orderer{name,phone,email}, shipping{recipient_name,recipient_phone,country_code,zipcode,address,address_detail,region,address_line_1,address_line_2,intl_city,intl_state,intl_postal_code}, payment_method (core id), shipping_memo (custom collapse), depositor_name, dbank{bank_code,account_number,account_holder} (선택 계좌, dbank 시), expected_total_amount, save_shipping_address, guest_lookup_password[_confirmation] (guest only), refund_bank{bank_code,account_number,holder} (vbank/dbank), ...checkoutExtraPayload (cash_receipt_*)`

- PUT /checkout recompute accepts: item_coupons, order_coupon_issue_id, shipping_coupon_issue_id, use_points, zipcode, country_code, payment_method.
- Coupondownload: GET `/user/coupons/downloadable`, POST `/user/coupons/{id}/download`.
- mileage: checkoutData.mileage {available, max_usable, usable, enabled(=usable gate), usage_policy} + summary.points_used.
- coupons: checkoutData.available_coupons (target_type order_amount / shipping_fee), item.available_coupons + item.disabled_coupon_ids.
- cash receipt payload: cash_receipt_requested/type/identifier_type/identifier (module extension writes layout _local.checkoutExtraPayload; still-form React는 form DOM named inputs에서 병합 — 동일 계약).
- PG: response {requires_pg_payment, pg_payment_handler, pg_payment_data, redirect_url}; default는 G7Core.dispatch로 handler name 동적 호출.
- Payment methods: GET settings/payment → order_settings.payment_methods (id, core_payment_method?, requires_ios?, is_active, _cached_name/description), banks[], bank_accounts[] (bank_name enriched), auto_cancel_days, cash_receipt_provider.
## QA RESOLUTION (2026-08-31, independent QA review + 1 fix round)

- FIXED (MAJOR): item_coupons PUT 바디가 부분 맵 → 전체 병합 맵(TempOrderService 전체 교체 계약)으로 수정. 회귀 테스트 추가.
- FIXED (MAJOR): PG dispatch 테스트가 tautological → CheckoutPage 실제 submit 경로(fetch stub + requires_pg_payment/pg_payment_handler → G7Core.dispatch, navigate 미호출) 검증으로 교체.
- FIXED (MINOR): same-as-orderer 비회원 노출 복원 / recompute setState updater 내 side-effect 제거 / finalAmount Number() / isEmptyCart calculation.items fallback.
- NOT FIXED (기록, follow-up): buy-now direct_items가 product_option_id 미전달(Still Form이 상세 옵션 선택 UI 자체가 없음 — product detail scope, 이번 checkout 과제 밖). route prefix expression, _gtoken URL query 등 KNOWN DIFF는 상단 표 참조.
