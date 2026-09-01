# BLOCKED AFTER — 재분류 결과

| 기존 ID | BLOCKED 사유 | 재분류 | 근거 |
|---|---|---|---|
| CHK-006 / save-address PG-path E2E | PG 미설치 | **EXTERNAL_BLOCKED** | PG plugin 미설치 + credential 없음. 소스 로직 검증(OrderController:120-155 즉시저장, OrderProcessingService:1753-1776 PG 지연저장) 완료. PG 설치 후 재검 |
| PAY-009 / PG 실제 승인 | plugin 미설치 | **EXTERNAL_BLOCKED** | PAYMENT QA GATE에서 사용자에게 plugin 선택 + test credential 1회 요청 (아래 참조) |
| ADDR-004 / ADDR-DAUM-013 (Daum) | popup 자동화 제한 | **RESOLVED (부분) + MANUAL REMAINING** | 자동 검증: checkout '주소 검색' 버튼 노출 PASS, plugin wiring(1.0.2 active, extension_point slot, CheckoutForm.tsx:737/1312) PASS, console error 0. daum.net cross-origin popup 실거래 입력은 MANUAL INTERACTION REQUIRED |
| SHIP-ISLAND-012 (도서산간) | 테스트 데이터 부재 | **RESOLVED (Case A)** | 기능 실존(ExtraFeeTemplate + calculateExtraShippingFee). QA 정책 생성(정책4 + extra 63558:3000) 후 GET /checkout?zipcode=63558 → base 3000 + extra 3000 = 6,000 PASS. evidence/remote-area-shipping.md |
| COUP-002-AUTO (자동발급 쿠폰) | listener 부재 | **NOT_IMPLEMENTED_IN_G7_1_1_2** | CouponIssueCondition enum(signup/first_purchase/birthday) 존재하나 issue_condition 저장 스키마·트리거 이벤트·발급 규칙이 실구현 없음 → AI 임의 비즈니스 규칙 생성 금지. USER 결정 필요 시 별도 승인 |
| PAY-010 (callback amount guard) | built-in callback 부재 | **NOT_APPLICABLE_IN_G7_1_1_2** | PG callback은 plugin 제공. built-in completePayment은 서버 내부 + admin confirm-deposit 금액 검증 존재 |
| SHIP-CONFIG-014 (dbank 계좌 미등록) | 전역 settings 보류 | **EXTERNAL_BLOCKED (설정 필요)** | 관리자가 실제 무통장 계좌 등록 필요 (settings 영역) — QA에서 settings 변경 보류 |
| MLP-001 (회원등급 가격) | 미구현 | **NOT_IMPLEMENTED (external plugin 설계)** | DTO placeholder만 존재 |
