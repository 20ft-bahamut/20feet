# QA CLEANUP PLAN

## 남겨진 QA 데이터 (audit 보존)
- Orders id 26-42 (17건): 전부 QA 주문 (order_number 20260831-*). 상태: cancelled 14 / confirmed 2 / delivered 1.
  → 주문 record는 audit 상 삭제하지 않음 (CLAUDE.md 금지 규정). QA 데이터로 남김.
- Products id 9-15 (QA_E2E_* 7건) — 보존 (재고/옵션 검증 재사용 가능, seed 상품 1-8 무손상)
- Coupons id 1-7 (QA_E2E 쿠폰 7종: 고정/정률/카테고리/만료/최소금액/배송비/다운로드)
- Shipping policies id 1-3 (무료/3,000원/조건부) + shipping types seeder(공식 seeder, 잔존 무해)
- Inquiries 2건 / Review 1건 / Wishlist 1건 / Mileage transaction 1건 (회원 3 계정)

## 이미 정리됨
- QA_E2E_TEMP_PRODUCT (id16), 3-level test product (id17), image test product (id18) — 삭제 확인(DB count=0)
- QA test categories (parent+child) — 삭제 확인
- Payment settings — 원상복구 (pay-original-settings.json 참조)

## 정리 필요 시 (사용자 요청 시에만)
- 관리자 UI: products 9-15 삭제 / coupons 1-7 삭제 / shipping policies 1-3 삭제
- 문의/리뷰/찜: 관리자에서 삭제 가능
- Orders 26-42: soft-delete는 Admin Order Delete 기능 사용 (자식 레코드 먼저)
