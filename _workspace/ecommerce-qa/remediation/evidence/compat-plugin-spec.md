# COMPAT PLUGIN SPEC — plugins/_bundled/superbify-commerce-compat/

목적: sirsoft-ecommerce 1.1.2 upstream 결함 4종을 공식 Hook 확장점에서만 보완한다.
원칙: 모듈/코어/템플릿 원본 수정 금지. 버전 가드(7.0.8 + ecommerce 1.1.2), 각 FIX 주석에 WHY/TARGET DEFECT/DETECTION/REMOVE WHEN 기록.

## Plugin skeleton (sirsoft-daum_postcode 패턴 그대로)

```
plugins/_bundled/superbify-commerce-compat/
├─ plugin.json      (identifier "superbify-commerce-compat", g7_version ">=7.0.8",
│                    dependencies.modules { "sirsoft-ecommerce": "^1.1.2" },
│                    loading.strategy "global")
├─ plugin.php       (class Plugin extends App\Extension\AbstractPlugin — namespace Plugins\Superbify\CommerceCompat)
├─ src/Listeners/CouponScopeListener.php
├─ src/Listeners/PaymentMethodGuardListener.php
├─ src/Listeners/OptionGroupsDerivationListener.php
├─ src/Listeners/StockReservationListener.php
├─ src/Services/CouponScopeCorrector.php
├─ src/Services/PaymentAvailability.php
├─ src/Services/StockReservationService.php
├─ src/Migrations/2026_09_01_000001_create_ecommerce_stock_reservations.php
├─ src/Console/Commands/ExpireStockReservationsCommand.php
├─ tests/  (phpunit — PEST/phpunit 어느 쪽이든 모듈 tests 패턴 참고: modules/_bundled/sirsoft-ecommerce/tests)
└─ composer.json (autoload psr-4 Plugins\\Superbify\\CommerceCompat\\ => src/)
```

뼈대 참고: plugins/sirsoft-daum_postcode/plugin.php (getMetadata/getSettings/getHookListeners). Hook 리스너 등록 계약: AbstractPlugin::getHookListeners() → array<hookName, ['method','priority','type'=>'action|filter','sync'=>true]> (app/Extension/HookListenerRegistrar.php:101-131).

## FIX 1 — CouponScopeListener (SEC-COUPON-002, CRITICAL)

Filter hook: `sirsoft-ecommerce.calculation.before_order_discount` — args ($orderCoupons(array of CouponIssue), $itemsAfterProductDiscount, $preparedItems).
Filter hook: `sirsoft-ecommerce.calculation.before_payment_amount` — args ($paymentContext{discounted_items,shipping_result}, $input).

구현:
1. before_order_discount에서 각 coupon(JOIN coupon)의 target_scope 검사: `items` array 구조는 `['product_option_id'=>..,'discounted_subtotal'=>..,'product_id'=>..?]` — OrderCalculationService의 filterItemsByScope(같은 파일 1940-1981)가 products/categories/all + included/excluded를 어떤 item 필드로 매칭하는지 그 시그니처와 동일한 로직을 CouponScopeCorrector에 복제(원본 호출 금지 — protected). scope 적용 결과 eligible subtotal 계산:
   - eligible == 0 → 해당 coupon을 $orderCoupons에서 **제거**하고 corrected map에 기록.
   - eligible > 0 → CouponScopeCorrector에 (couponIssueId → eligibleSubtotal, eligibleOptionIds) 기록(정적 인스턴스 전달 대신 두 번째 filter에 전달 방법 필요하면 plugin 내 static state 사용 — hook args가 매번 갱신되므로 per-request static에 담고 before_payment_amount에서 소진 후 클리어).
2. before_payment_amount에서 static state가 있으면:
   - 각 coupon의 정적 할인 재계산: `discount = calculateCouponDiscount와 동일 규칙`(fixed=amount, percent=floor(eligible*rate/100) — RoundMoney 정책은 원본 calculateCouponDiscount(OrderCalculationService.php 내부)과 동일하게, 필요하면 reflection 금지라 숫자 정책 소스 참조해 재구현) — min_order_amount도 eligible subtotal 기준으로 재검증하여 미달 시 discount=0 + 해당 share 제거.
   - discounted_items의 order_discount_share를 eligible items만 대상으로 재안분(apportion 규칙: 비율 배분+나머지 맨 앞 item — apportionAmount와 동일 결과가 되도록 재구현, 총합 == discount).
   - 수정된 discounted_items로 payment 관련 총합 재계산해 $paymentContext['discounted_items']에 반영(다음 calculatePaymentAmount가 이 값 사용).
3. INVARIANT(테스트로 검증): 0 ≤ discount ≤ eligible amount; scope 밖 item share == 0; final ≥ 0.

WHY: applyOrderCoupon(OrderCalculationService.php:1376-1425)이 filterItemsByScope 없이 전체 합계에 할인. TARGET DEFECT: SEC-COUPON-002. DETECTION: coupon.target_scope != 'all' && eligible < total. REMOVE WHEN: upstream applyOrderCoupon이 scope 필터를 호출하는 버전 릴리스 시 (버전 체크: sirsoft-ecommerce version > 1.1.2에서 hook 미사용 guard 옵션).

## FIX 2 — PaymentMethodGuardListener (PAY-006/002/005)

Filter hook: `sirsoft-ecommerce.order.create_validation_rules` — args ($rules, $request). CreateOrderRequest.php:133.
- 기존 payment_method rules를 **교체**(문자열 키 'payment_method'에 클로저/커스텀 Rule override)하는 방식으로: 허용 조건 = 이 커머스 설정의 order_settings.payment_methods 중 is_active=true && (needs_pg != true || provider 등록됨/'default_pg_provider' 유효). 내부 수단(설정 조회): `\App\Hooks` 없이 — 모듈 서비스가 container에 바인딩돼 있으면 그 인스턴스 사용(EcommerceSettingsService::getSettings('order') — binding 확인 후 사용; 바인딩 없으면 repository/DB direct read는 금지… 가장 안전한 방법: `modules` 컨테이너/registry에서 sirsoft-ecommerce settingsService resolve. 실제 binding은 구현 중 확인: src/Providers/* 에서 getSettings 접근 경로 확정).
- PG provider 필요 결제수단(card, vbank 등)은 provider 미등록 시 reject. Rule을 Closure로: `function($attr,$value,$fail)` — PaymentAvailability::isOrderablePaymentMethod($value) 결과 사용.
- 실패 메시지: '사용할 수 없는 결제수단입니다.' (validation convention 준수).
- PAY-002 주의: vbank는 admin에서 activation 자체가 PG provider 요구(설정 게이트) — runtime에서는 PG provider 미등록 시 reject만 보장하면 됨(dbank 등 내부 수단은 그대로 허용).

## FIX 3 — OptionGroupsDerivationListener (OPT-020)

Action hook: `sirsoft-ecommerce.product.after_read` — args ($product). ProductService.php:204-213에서 무조건 발화.
- option_groups 컬럼이 null/[]/'' 이고 → $product->loadMissing('activeOptions') → rows ≥ 1이면 option_values(JSON)에서 group 파생(ProductService::rebuildOptionGroups 참고 구현 로직 — 동일한 key order/values 로컬라이즈 구조로, 파일 복제 아닌 동일 규칙 재구현) 후 `$product->setAttribute('option_groups', $derived)` + `$product->setAttribute('has_options', true)` (in-memory만 — 저장 금지).
- 컬럼이 채워진 경우 건드리지 않음(관리자 시드 우선). 1D/2D 회귀 금지.

## FIX 4 — StockReservationListener + Service (SEC-STOCK-001 / OUT-OF-STOCK)

- Migration: table `ecommerce_stock_reservations` (id, product_option_id FK, order_id nullable FK, qty int >0, status enum(active,consumed,released,expired), source ENUM(order,event), token unique nullable(멱등키), expires_at nullable, timestamps + index(product_option_id,status), index(order_id)).
- 훅:
  * `sirsoft-ecommerce.order.before_create` (args ($tempOrder, $ordererInfo, $shippingInfo, $paymentMethod)) — tempOrder items의 option/qty에 대해 available = stock − SUM(active reservations) (SELECT … FOR UPDATE transactional) 부족 시 도메인 예외 throw. ⚠️ HandlesOrderCreation catch 사양 확인(214-220) — 잡히는 예외 타입으로만 던져야 API가 정적 오류로 응답. 부족 예외 = InsufficientStockException(momentum: StockService 내부 예외 타입 존재 시 재사용).
  * 주문 생성 직후 예약 생성(order id 필요) → 가능 훅: order.after_create류가 있는지 확인(StockService.php:115 근처 or OrderProcessingService). 없으면 checkout.before_payment에서는 아직 order 없음 → **예약 시점은 order.before_create에서 tempOrder 기반 선예약(token=tempOrder.id)**, 주문 row 생기면 consumption 시점에 order_id 매핑(HandlesOrderCreation 이후 completePayment 시 order로 consume) — 구현 단순화: reservation을 temp_order_id 기준으로 잡고 payment success에서 consume(order로 전환), cancel/expire에서 release.
  * `stock.after_deduct` — 결제 확정 시 해당 order의 reservations을 consumed로 전환(idempotent: unique(order_id, product_option_id), 이미 consumed면 skip).
  * 취소 복원: module cancel 경로에서 발화하는 훅 조사 후 release 연결(없으면 order.before_create/after_create 대신 — OrderCancellation 이벤트 확인; 없으면 ExpireStockReservationsCommand의 스케줄 + admin 취소는 admin confirm 흐름 훅 존재 여부 조사해서 연결. 연결 불가 시 blockersFound로 기록).
- Cart/checkout 표시: `cart.before_add` + available 재계산 검증(clamp 방지 — cart clamp에서 200 성공이 아니라 부족 시 에러가 나려면 **cart.before_add에서 qty>available이면 예외 throw** — CartService 예외 타입(CartUnavailableException)과 동일 계약). order create도 available 검증.
- 만료: ExpireStockReservationsCommand(30분간격) + getScheduledCommands() 등록(module.php:2160-2226 형식 참고해 plugin이 지원하는 방식으로). expires_at = 주문 생성 시점 + order_settings.auto_cancel_days(설정 있으면) — 설정 없으면 expires null(정책 미정: RESERVATION_EXPIRY_POLICY_REQUIRED 표기, 임의 TTL 금지. 단 command에서 30일 hardcap 두지 말고 auto_cancel_days만 사용).
- physical stock 표시 보정: public product/cart/checkout 응답의 stock은 available 규칙과 어긋날 수 있음 — 이번 픽스 범위는 "초과 예약 방지"까지만. 표시 정합은 카트/체크아웃 검증(cart.before_add + order.before_create)이 담당하므로 허용. (문서화)

## Tests (phpunit — plugin tests/ 디렉토리, 모듈 테스트 부트스트랩 패턴 복사)
- COUPON-SCOPE-001..006, STOCK-001..010, PAYMENT-VAL-001..007 (스펙: 사용자 프롬프트 §28/§39/§45).
- 단위 레벨(서비스/정적) + 필요시 Integration은 RefreshDatabase + 실제 모듈 테이블 seed. 실행: `php artisan test plugins/_bundled/superbify-commerce-compat/tests` (동작하는 경로로 확인).

## 금지
- modules/ 코어/템플릿 수정 금지. Reflection/monkey patch/eval 금지.
- 새 결제 수단 창작 금지. PG 흐름 변경 금지(수단 allow-list만).
- schema는 plugin migration으로만.