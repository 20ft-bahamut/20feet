# BLOCKED / NOT_APPLICABLE 세부

| ID | 상태 | 이유 | Next Action |
|---|---|---|---|
| CHK-006 | BLOCKED | save_shipping_address E2E — PG 미설치로 order-create 전체 플로우 중단 (소스 로직 검증: OrderController.php:120-155 즉시저장 / OrderProcessingService.php:1753-1776 PG 후 지연저장) | QA용 PG plugin 설치 후 E2E 재검 |
| ADDR-004 / ADDR-DAUM-013 | BLOCKED | Daum postcode popup = 외부 daum.net 팝업, headless 자동화 불가. Plugin wiring은 소스+런타임 확인됨 (plugin 1.0.2 active, extension_point slot 연결 CheckoutForm.tsx:737,1312) | 수동 브라우저 확인 (INTERACTION_MANUAL_REQUIRED) |
| PAY-009 | BLOCKED | PG plugin 전부 미설치 — 카드/가상계좌 실제 승인 불가 | plugin 설치 + test credential 후 실측 |
| PAY-010 | NOT_APPLICABLE | Built-in PG callback endpoint 존재하지 않음 (plugin이 제공). completePayment 서버내부 + admin confirm-deposit은 금액 검증 있음(PAY-004 PASS) | PG plugin 설치 시 재분류 |
| SHIP-ISLAND-012 | BLOCKED | 도서산간 extra_fee 설정된 정책 없음, 전역 정책 변경 보류 | QA 정책에 extra_fee 설정 후 재검 |
| SHIP-CONFIG-014 | NOT_APPLICABLE | dbank 활성이지만 bank_accounts[] 비어있음(계좌 미등록). 정책 확인만 가능, 계좌 등록은 global settings라 보류 | 관리자 계좌 등록 후 checkout 재검 |
| COUP-002-AUTO | BLOCKED | 자동발급(signup/first_purchase/birthday) — CouponIssueCondition enum 값만 존재, 런타임 리스너 미구현 (sirsoft-ecommerce 1.1.2) | upstream 미구현 — 필요시 USER 승인 후 결정 |
| PAYMENT EXTERNAL | BLOCKED | PAYMENT_EXTERNAL_CREDENTIAL_BLOCKED — test PG credential 없음, 가짜 credential 생성 금지 | PG plugin 설치 후 별도 credential 요청 |
