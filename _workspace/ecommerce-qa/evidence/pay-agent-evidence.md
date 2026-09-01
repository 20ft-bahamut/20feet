# PAY / PG AGENT — Evidence Summary (2026-09-01)

## Settings dynamics test
- Initial: dbank=true, vbank=false, point=false, others=false.
- PUT /api/modules/sirsoft-ecommerce/admin/settings {order_settings.payment_methods[...]}
  - Toggle dbank off + point on: SUCCESS; public /settings/payment reflects the toggle immediately.
  - Enable vbank requires pg_provider. available_pg_providers=[] (no plugins installed) — backend rejects "이 결제수단을 활성화하려면 PG사를 먼저 선택하세요."
- Original settings restored (dbank on, others off).

## Still Form dynamic rendering (PAY-001)
- /home/bahamut/20feet/templates/_bundled/superbify-commerce_minimal/src/components/CheckoutForm.tsx:586-587 reads orderSettings.payment_methods; 601 activeMethods filter; 1612 activeMethods.map (renders every active method). No hardcoded bank-only.
- dist/js/components.iife.js contains same logic.

## dbank E2E (PAY-BUILTIN-DBANK-001)
- Guest cart ck_TYVG0NUAofovAbXBdUOPzWOr8Rx4bFth + product 9 (no options, stock 5, 20000) → temp_order 66 → POST /user/orders payment_method=dbank with depositor_name + dbank {bank_code:004, account_number:76870101249426, account_holder:최병철} → order 20260831-1908373236, status=pending_payment.
- PATCH /admin/orders/35/confirm-deposit {amount:20000, mark_order_complete:true} → status=payment_complete. msg: 입금이 확인되어 결제완료 처리되었습니다.

## Wrong amount (ORD-DEPOSIT-001 / CHK-002)
- Order 36 with amount=19000 → "입금액이 결제예정금액과 일치하지 않습니다. (예상: 19,000원, 실제: 20,000원)" — rejected. No PaymentAmountMismatchException observed (custom validator message).

## vbank without PG plugin
- POST /user/orders payment_method=vbank → SUCCESS order 20260831-1909377233 status=pending_payment. Backend accepts (does not crash). Real PG would be required to mark complete — blocked at PG plugin layer.

## Card without PG plugin
- POST /user/orders payment_method=card → SUCCESS order 20260831-1909450487 status=pending_order. Card method is `needs_pg=true` and no PG provider registered — order sits in pending_order (different status from dbank), no crash.

## PG dispatch path (OPT-015)
- CheckoutPage.tsx:456-477 uses G7Core.dispatch with pg_payment_handler from response.data — provider-agnostic.
- dist/js/components.iife.js contains G7Core?.dispatch?.({handler:...pg_payment_data}) and G7Core?.getActionDispatcher?.()?.dispatchAction?.({handler:...}) — both intact.

## Idempotency / double-submit
- Same guest cart, identical order POST twice:
  - R1 → order 20260831-1909564957
  - R2 → "임시 주문 정보를 찾을 수 없습니다." — temp_order deleted after first order creation. Natural idempotency.

## Cart error: items array required
- POST /cart {product_id,quantity} → fails "장바구니에 담을 상품을 선택해주세요." — must send items[{product_option_id,quantity}] (BulkAddToCartRequest schema).

## cart_key route
- POST /api/modules/sirsoft-ecommerce/public/cart/issue-key does NOT exist.
- Correct route: POST /api/modules/sirsoft-ecommerce/cart/key → data.cart_key

## PG real approval: BLOCKED — no PG plugin installed (sirsoft-pay_kginicis/khnkcp/nicepayments/tosspayments all in plugins/_bundled/, none activated).
