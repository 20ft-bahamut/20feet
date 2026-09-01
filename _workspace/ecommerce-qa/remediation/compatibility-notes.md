# COMPATIBILITY NOTES — superbify-commerce-compat 1.0.0

## 설치 상태
- plugins/_bundled/superbify-commerce-compat (source of truth) → plugins/superbify-commerce-compat 설치됨
- plugin:install → plugin:activate 완료. 활성 상태: plugin:list ✅
- 마이그레이션: `php artisan migrate --path=plugins/superbify-commerce-compat/src/Migrations --force`
  (plugin:install이 플러그인 마이그레이션을 자동 실행하지 않아 수동 실행 — ecommerce_stock_reservations 생성)
- 런타임 디렉토리(templates/superbify-commerce_minimal)에 layouts/shop/product.json + components.json sync + template:refresh-layout 실행

## 아키텍처 계약
- plugin.json: dependencies.modules sirsoft-ecommerce ^1.1.2 (manifest 의존 선언 = G7 공식 형식)
- CompatServiceProvider가 sirsoft-ecommerce 활성 시에만 OrderCalculationService → ScopedOrderCalculationService 바인딩 (module 미설치 시 바인딩 스킵 = capability guard)
- 적용 대상: G7 7.0.8 / sirsoft-ecommerce 1.1.2 (plugin.json g7_version >=7.0.8)

## 버전 가드 / REMOVE WHEN (upstream fix detection)
| Fix | Target defect | Detection | REMOVE WHEN |
|---|---|---|---|
| ScopedOrderCalculationService (applyOrderCoupon 보정) | SEC-COUPON-002 | coupon.target_scope != all && eligible < total | upstream이 applyOrderCoupon에 filterItemsByScope 호출 추가 시 |
| PaymentMethodGuardListener | PAY-006/002/005 | inactive or PG-provider-missing method | CreateOrderRequest가 settings 기반 is_orderable 검증 내장 시 |
| OptionGroupsDerivationListener (product.after_read) | OPT-020 | option_groups 누락 + activeOptions>=1 | ProductService::getDetail이 누락 시 rebuildOptionGroups 호출 시 |
| StockReservationListener + reservations table + expire command | SEC-STOCK-001 / OUT-OF-STOCK | available = stock - SUM(active) | 모듈 자체 reservation 도입 시 (scheduled: 30분 만료 command) |

## 주의 / 제약
- phpunit: plugin 28 tests는 bootstrap 완료(autoload/계약 충족)하나 로컬 테스트 DB credential(g7_testing root 접속거부)로 실행 불가 — 원본 모듈 테스트도 동일 환경 실패 (사전 존재 이슈). .env.testing credential 보정 후 재실행 필요
- stock SSoT는 option.stock_quantity (product.stock_quantity는 mirror) — 관리 API는 PATCH /admin/options/bulk-stock 사용
- 배송비 재계산 API는 GET /checkout?zipcode=&country_code= (PUT /checkout shipping_address는 주문 생성 시에만 반영)
- HookManager: doAction과 applyFilters는 별도 레지스트리 — action 훅 리스너는 type:'action'(sync:true 필수, 큐 폴백 방지)
- 플러그인 훅 등록계약: Plugin::getHookListeners() = 리스너 FQCN 배열, 각 리스너 HookListenerInterface::getSubscribedHooks()
- plugin:install은 manifest 파일 copy에서 실패 케이스가 있었음(빈 plugin.json) — 수동 copy 후 재실행으로 해결 (재설치 시 주의)
- 서버(artisan serve) 재시작 전 hook cache/bootstrap 재생성 필요할 수 있음: `php artisan extension:update-autoload && php artisan plugin:cache-clear`
