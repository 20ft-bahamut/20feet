# QA ENVIRONMENT

- QA_ENVIRONMENT_CONFIRMATION: **개발환경** (사용자 확인 2026-08-31) → destructive QA 허용
- BASE URL: http://localhost:8000 (GnuBoard7 7.0.8)
- sirsoft-ecommerce: 1.1.2 (활성)
- Active user template: superbify-commerce_minimal (Still Form) 0.2.0
- Parity baseline: sirsoft-basic 1.1.1 (설치, 비활성)
- Active plugins: sirsoft-ckeditor5 1.0.2, sirsoft-daum_postcode 1.0.2
- 미설치 plugins: payment 4종 (kginicis/nhnkcp/nicepayments/tosspayments), gdpr, marketing, verification 2종
  → 카드/PG 실측: PAYMENT_NOT_INSTALLED (credential 요청 불필요) — plugin 확장 구조 소스 검증만

## Credentials policy
- /tmp/qa-creds.json 에만 보관 (repo 밖, 세션 소멸). 스크린샷/보고서/commit 절대 노출 금지.
- admin login: OK (관리자 메뉴 노출 확인)
- member login: OK

## Test data namespace
- 모든 생성 데이터: `QA_E2E_` prefix (product, option, coupon, carrier...)

## Cleanup
- QA 생성 상품/쿠폰/배송사: 관리자 UI에서 삭제
- 주문 record: Audit 보존 (삭제하지 않음, QA_ prefix 표기) — cleanup.md에 기록