# ROOT CAUSE MAP — remediation (2026-09-01)

## A. STILL FORM PRESENTATION PARITY (template layer)
- OPT-001-SF / OPT-002-SF: layouts/shop/product.json에 option/additional-option 슬롯 부재.
- REVIEW-001-SF / QNA-001-SF: product detail에 review/qna 컴포넌트 부재.
- WISH-002: wishlist heart toggle 부재. MYPAGE-REVIEW-TAB: mypage reviews 탭 부재.
- PARITY-MATRIX: 위 총합.
- 상태: 이전 세션에서 src/components/{PurchasePanel,WishlistHeart,ProductReviews,ProductQna}.tsx + product.json wiring + components.json 등록 + dist 빌드 + 런타임 copy 동기화 완료. vitest 158/158 PASS. **런타임 검증만 남음.**

## B. COUPON SECURITY (SEC-COUPON-002, CRITICAL)
- 결함: OrderCalculationService::applyOrderCoupon(:1376)이 filterItemsByScope(:1940)를 호출하지 않아 → target_scope=products 주문쿠폰이 비대상 상품 전체 합계에 적용.
- 확정된 원인(플러그인 side): 이전 세션의 CouponScopeListener가 **존재하지 않는 훅**(calculation.before_order_discount / before_payment_amount)에 등록 → 실행 불가. HookManager 실제 발화점 검증: applyFilters/doAction 레지스트리 분리 + 계산 경로에 그 두 훅 없음.
- 유효 확장점: (1) `sirsoft-ecommerce.checkout.update_validation_rules` (UpdateCheckoutRequest.php:55) — 쿠폰 부착 검증, (2) OrderCalculationService는 컨테이너 주입 → plugin ServiceProvider가 decorator binding 가능 (PluginServiceProvider가 plugins/*/src/Providers/*ServiceProvider.php 자동 발견).
- semantics: filterItemsByScope(preparedItems, coupon) = eligible items; eligible subtotal 기준 계산, 0이면 invalidTarget.

## C. INVENTORY CONSISTENCY (SEC-STOCK-001 HIGH + OUT-OF-STOCK MEDIUM)
- 결함: validateStock(StockService.php:33) per-order 검사만, order→payment 사이 reservation 없음; stock 0 도 cart add / order create 통과(CartService.php:579,626 clamp-only).
- 확정된 원인(플러그인 side): StockReservationListener의 훅 3개(cart.before_add / order.before_create / stock.after_deduct)는 실존하지만 전부 doAction 훅인데 plugin.php가 type:filter로 등록 → 실행 불가. HookListenerInterface 계약(getSubscribedHooks) 미준수.
- 확장점: cart.before_add(CartService.php:188), order.before_create(OrderProcessingService.php:112, 예외→422 HandlesOrderCreation), stock.after_deduct(StockService.php:115). Migration: ecommerce_stock_reservations.

## D. PAYMENT VALIDATION (PAY-006 HIGH + PAY-002/005 MEDIUM)
- 결함: CreateOrderRequest.php:66-78 enum만 검증 — inactive method / PG provider 부재 주문 통과.
- 상태: PaymentMethodGuardListener는 실존 훅 order.create_validation_rules(CreateOrderRequest.php:133) 필터 사용. 이전 세션 로직 존재. **런타임 검증만 남음.**
- 원칙: dbank(무통장, 내부결제) 허용, provider-dependent(card/vbank/phone)는 provider 등록 전 reject.

## E. OPTION READ MODEL (OPT-020 MEDIUM)
- 결함: option_groups 컬럼 누락 상태 조회 시 public API option_groups=[]/has_options=false. rebuildOptionGroups는 write시만 호출.
- 확정된 원인(플러그인 side): OptionGroupsDerivationListener가 product.after_read(ProductService.php:209, doAction) 훅을 썼으나 doAction 레지스트리에서 filter 타입 등록은 무시됨 → 실행 불가.
- 수정: type=action(sync)로 등록하고 $product 모델 in-place 보정.

## F. BLOCKED / INCOMPLETE INTEGRATIONS
- PG: plugin 4종 미설치 → EXTERNAL_BLOCKED (credential + 설치는 PAYMENT QA GATE에서 사용자 결정).
- Daum popup: automation 제약 → EXTERNAL_BLOCKED(수동 검증), plugin wiring은 PASS 확인됨.
- 도서산간: 정책 데이터 없음(기능은 schema/서비스 존재) → TEST DATA로 해제 가능(C).
- 자동발급 쿠폰: enum만 존재, 리스너 없음 → NOT_IMPLEMENTED_IN_G7_1_1_2.
- save-address PG-path: PG 설치 후 재검 → EXTERNAL_BLOCKED.
