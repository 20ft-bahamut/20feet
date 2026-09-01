# REMEDIATION REGRESSION RESULTS (2026-09-01, runtime http://localhost:8000)

## Target regression (RED→GREEN)
| Test | Before fix | After fix | Result |
|---|---|---|---|
| COUPON-SCOPE-001 (target 상품에 order_coupon 적용) | 적용됨 (그러나 scope 무시) | discount=10,000 PASS | GREEN |
| COUPON-SCOPE-002 (비대상 상품 카트에 적용) | **final 30,000 (10,000 차감)** ← defect | discount=0 PASS | GREEN |
| 단위 repro: scope-out → invalidTarget | share=none + errors[invalid_target] | 동일 | GREEN |
| 단위 repro: mixed cart (13+9) | share9=10,000(오적용) | share19=10,000, share9=0 | GREEN |
| PAYMENT-VAL-002 (inactive card) | 201 주문 성공 | 422 PASS | GREEN |
| PAYMENT-VAL-004 (vbank w/o PG) | 201 | 422 PASS | GREEN |
| PAYMENT-VAL-005 (bogus string) | 201 | 422 PASS | GREEN |
| STOCK-002 (재고0 cart add) | 200 + 라인 생성 | 422 cart_unavailable PASS | GREEN |
| STOCK-003 (재고0 주문 생성) | 201 주문 성공 | 422 PASS (stock 0 유지) | GREEN |
| STOCK-006 (동시 qty5+qty1 @stock5) | 둘 다 성공 가능 | 201 1건 + 422 1건, stock 5→0 (음수 없음) PASS | GREEN |
| STOCK-007 (취소→복원) | (QA 기존 PASS 유지) | cancel 200 → stock 0→5 예약 해제 확인 | GREEN |
| STOCK-008 (이중 차감) | — | stock 0→0 (추가 차감 없음) PASS | GREEN |
| OPT-020 (3D read model) | option_groups=[] has_options=false | has_options=true, options=2, option_groups 1개(3차원 조합형) | GREEN |
| OPT 1D/2D 회귀 (products 10/11/12) | — | has_options + groups 1/2/1 유지 | GREEN |
| 도서산간 SHIP (63558 vs 06611) | BLOCKED | extra 3000 반영 6,000 vs 3,000 | GREEN |
| Daum 주소검색 (checkout 버튼/wiring/console) | BLOCKED(부분) | 버튼 노출 + wiring PASS, console error 0 | GREEN (popup 실거래만 MANUAL) |

## Suite 결과
- Still Form vitest 전체: **22 files / 158 tests PASS** (CheckoutParity + ProductParity + layout 포함)
- compat phpunit 28 건: 테스트 DB credential(g7_testing) 접속 실패로 실행 불가 — 원본 모듈 테스트도 동일 실패(환경 이슈, 사전 존재). bootstrap/계약/네임스페이스는 통과
- Runtime live regression: scripts/regression-{core,stock}.mjs — evidence/*.json

## 실행 명령
- node _workspace/ecommerce-qa/remediation/scripts/regression-core.mjs (coupon+payment)
- node _workspace/ecommerce-qa/remediation/scripts/regression-stock.mjs (stock)

## 최종 스위트 (remediation 종료 시점)
- Still Form vitest: **22 files / 163 tests PASS** (ProductParity/CheckoutParity/layout + 신규 coupon badge 4건 포함)
- runtime regression: COUPON-SCOPE ×2, PAYMENT-VAL ×3, STOCK ×5 전부 GREEN (evidence/*.json)
- 하트/추가옵션/관리자수정/쿠폰badge runtime checks: 16 PASS / 0 FAIL / 1 SKIP(서버 멱등 소진)
- G7 원본 diff gate: modules/ app/ core/ **0 lines** 유지
