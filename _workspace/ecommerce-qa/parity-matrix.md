# STILL FORM PARITY MATRIX (runtime verified vs sirsoft-basic source)

| # | Feature | DEFAULT (sirsoft-basic) | STILL FORM (runtime) | Result |
|---|---|---|---|---|
| 1 | 단일/다중 옵션 selector (product detail) | YES | NO (셀렉터 0개, 옵션 UI 부재 — 서버 기본옵션만 담김) | FAIL (CRITICAL) |
| 2 | 추가옵션 selector | YES | NO | FAIL (HIGH) |
| 3 | 옵션별 가격 반영 UI | YES (selector에서 재계산) | Panel-only (옵션 선택 불가하므로 부분) | PASS* (기본 panel 기준) |
| 4 | 수량 stepper + 재고 CTA (품절/판매중지) | YES | YES | PASS |
| 5 | 장바구니 페이지 (목록/수량/변경/삭제/합계) | YES | YES | PASS |
| 6 | Checkout 전체 (same-as-orderer, 저장배송지, 배송지 pills, 쿠폰, 마일리지, 현금영수증, 환불계좌, PG dispatch) | YES | YES (CheckoutParity 20/20 PASS) | PASS |
| 7 | 쿠폰 입력/선택 | YES | YES | PASS |
| 8 | 마일리지 사용 | YES | YES | PASS |
| 9 | 결제수단 동적 렌더링 | YES | YES (payment_settings 기반, 하드코딩 없음) | PASS |
| 10 | Guest checkout + 주문조회 | YES | YES | PASS |
| 11 | 배송지 관리 (mypage + checkout modal) | YES | YES | PASS |
| 12 | Daum postcode slot | YES | YES (wiring 확인, popup 수동검증 필요) | PASS (wiring) |
| 13 | 상품후기 (review list/write tab) | YES | NO (product detail에 review UI 없음; mypage 주문 modal 작성만) | FAIL (HIGH) |
| 14 | 상품문의 (Q&A tab + 작성) | YES | NO (product detail Q&A tab 없음; mypage/inquiries 목록만) | FAIL (MEDIUM) |
| 15 | Wishlist heart toggle (product detail) | YES | NO (mypage/wishlist 목록은 PASS) | FAIL (MEDIUM) |
| 16 | My orders / 취소모달 / 배송조회 | YES | YES | PASS |
| 17 | Mypage reviews 탭 | YES | NO (7 tabs + change_password) | FAIL (LOW) |
| 18 | Reorder | YES | YES | PASS |
| 19 | Guest order lookup | YES | YES | PASS |
| 20 | CheckoutParity regression suite | — | 20/20 PASS | PASS |

결론: Checkout 도메인은 패리티 완전. Product Detail 페이지에서 **옵션 셀렉터/추가옵션/후기/문의/wishlist-toggle 미노출**이 핵심 regression. root cause: `templates/_bundled/superbify-commerce_minimal/layouts/shop/product.json` — option/additional-option/review/inquiry 슬롯 및 heart 컴포넌트 부재. Fix 방향: OptionSelector.tsx + AdditionalOptionSelector.tsx 신규 또는 default partial 이식 (Engineering + USER 승인 필요).
