# REMEDIATION PLAN

| Phase | 대상 FAIL | 방식 | 상태 |
|---|---|---|---|
| 1 | OPT-001-SF, OPT-002-SF, REVIEW-001-SF, QNA-001-SF, WISH-002, MYPAGE-REVIEW-TAB, PARITY-MATRIX | Still Form template (이전 세션 구현, 런타임 검증 + mypage reviews 보완) | IN PROGRESS |
| 2 | SEC-COUPON-002 | compat plugin: checkout.update_validation_rules + OrderCalculationService decorator binding | REWORK REQUIRED(훅 재설계) |
| 3 | SEC-STOCK-001 + OUT-OF-STOCK | compat plugin: reservation listener(계약수정: action+sync) + migration | REWORK REQUIRED |
| 4 | PAY-006/002/005 | compat plugin: order.create_validation_rules filter (기존 구현 검증) | IN PROGRESS |
| 5 | OPT-020 | compat plugin: product.after_read action(sync) 수정 | REWORK REQUIRED |
| 6 | auto coupon | spec 검증 결과에 따라 NOT_IMPLEMENTED 보고 | DONE(as blocked) |
| 7 | 도서산간 | QA 정책 데이터 생성 → runtime 테스트 | PENDING |
| 8 | Daum | button/slot 자동 검증, popup은 MANUAL | PENDING |
| - | PG plugin | PAYMENT QA GATE에서 사용자에게 1회 요청 | GATE PENDING |

## Compat plugin 재구조화 스펙 (핵심)
- 계약: Plugin::getHookListeners() = 리스너 FQCN 배열; 각 리스너 HookListenerInterface(getSubscribedHooks + handle).
- 네임스페이스: Plugins\Superbify\Commerce\Compat\* (directoryToNamespace 규칙), composer psr-4 동기화.
- 훅 타입: applyFilters 훅=filter(sync), doAction 훅=action + sync:true (큐 폴백 방지).
- 쿠폰: ScopedOrderCalculationService extends module service(protected override) + CompatServiceProvider bind + checkout.update_validation_rules 가드.
- REMOVE WHEN/DETECTION 주석 유지 (§81).
