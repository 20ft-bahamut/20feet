# STILL FORM PARITY AFTER (runtime verified 2026-09-01)

이전 parity-matrix.md(BEFORE)의 FAIL 항목별 AFTER:

| # | Feature | BEFORE | AFTER | 검증 |
|---|---|---|---|---|
| 1 | 단일 옵션 selector + 가격 재계산 | 없음(0 select) | **PASS** — 셀렉터 1 + 블랙 선택 시 20,000원 블록 | purchase-final-check.png / product-option-single.png |
| 2 | 다중 옵션(2단 캐스케이드) | 없음 | **PASS** — 색상→사이즈 연동, L → 33,000원 | product-option-multi.png |
| 3 | 추가옵션 selector(값/직접입력/라인합계) | 없음 | **PASS** — 선물포장+3,000 / 각인+5,000 / 커스텀 텍스트 / 18,000원 | product-additional-option.png |
| 4 | 장바구니 추가옵션 표시 | 옵션: 기본 만 | **PASS** — "추가옵션: 선물포장 (+3,000원)" / "각인 · 커스텀텍스트 (+5,000원)" 라인 단위 노출 | cart-additional-options.png |
| 5 | 리뷰 섹션(요약/필터/카드/empty state) | 없음 | **PASS** — product-reviews / reviews-summary / review-card testids | product-review.png |
| 6 | Q&A 섹션(작성 버튼 회원 게이트 / empty state) | 없음 | **PASS** — product-qna / qna-write-button / qna-empty | product-qna.png |
| 7 | Wishlist heart toggle | 풀와이드 빈 바(위치 오류) | **PASS** — 제목 행 인라인(폭 42px), POST /wishlist/toggle 2회 토글 확인 | product-wishlist-inline.png |
| 8 | 관리자 수정 링크 | 없음 | **PASS** — abilities.can_update 게이트, /admin/.../edit 새탭, "✎ 관리자 수정" 라벨 | product-admin-edit.png |
| 9 | 다운로드 쿠폰 badge | 없음 | **PASS** — downloadable-coupons DS + badge 렌더(다운로드 POST는 서버 멱등성상 SKIP: 두 계정 모두 소진) | product-coupon-badge.png |
| 10 | 배송 정보 KV | 배송 row 미기입 | **PASS** — fee_summary + 무료배송 threshold 행 추가 | layout test |
| 11 | MYPAGE reviews 탭 | 없음 | **갭 아님** — 기본 템플릿에도 reviews 독립 탭 없음(주문 상세에서 작성). Still Form도 주문 모달 작성 존재(REVIEW-003) | sirsoft-basic mypage 구조 대조 |
| 12 | CheckoutParity 회귀 | 20/20 | **20/20 유지** | vitest |
| 13 | My orders / guest lookup / reorder | PASS | **PASS 유지** | BEFORE matrix |

MISSING = 0 / DEGRADED = 0 (functional parity gate 충족 — 결제 실승인은 EXTERNAL_BLOCKED 별도)

## 원인 규명 (중간에 렌더가 전부 붕괴했던 사건)
1. **dist 미빌드**: 이전 세션이 src 수정 후 `npx vite build`를 실행하지 않아 런타임 IIFE가 4개 신규 컴포넌트를 포함하지 않음 → registry 미등록처럼 보이던 실체는 stale dist. 빌드 후 해결.
2. **product_code 밑줄**: 공개 상품 라우트 where [0-9A-Za-z]+ → QA_E2E_* 코드 404 → data source 빈값(가격 "—"). QA 코드 16자 영숫자로 변경(QAE2ESINGLEOPT01 등).
3. **트랜슬레이션 캐시**: lang 파일 변경 후 ext.cache_version bump 필요 (`$t:` raw 노출 방지).
4. PurchasePanel 라벨 매핑 결함(option_groups.values가 {ko,en} 객체인데 value/name 키만 접근) → {value ?? name ?? v} fallback으로 수정.
