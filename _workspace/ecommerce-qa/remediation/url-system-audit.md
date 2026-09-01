# URL 시스템 전수 QA — Still Form vs 공식 템플릿 (sirsoft-basic)

판정: 공식 계약 완전 정렬은 `route_path='shop'` + `no_route=false`일 때만.

## A. 라우트 (전수 diff)
- MATCH: 홈, auth 4종, mypage 대부분(profile/orders/addresses/wishlist/mileage/inquiries/change-password/에러 3종)
- PATH-DIVERGED(현재 정상 동작, 공식과 패턴만 다름):
  - `/{prefix}/cart` (=공식 `/shop/cart`) vs Still Form `/cart`  ← 카테고리 없던 것과 달리 데모에서도 /shop/cart 확정
  - `/{prefix}/reorder/:id` vs Still Form `/reorder/:id` (root 이탈)
  - order_complete: 공식 `/{prefix}/orders/:id/complete` — Still Form은 `:order_number` + 레거시 `/shop/order/complete`(빈 페이지 렌더) 병행
- MISSING(Still Form 없음): boards 6종, identity/challenge, users 2종, page/:slug, /search, mypage/notifications, mypage/board
- EXTRA(Still Form 전용 D2C): /shop/notice(+detail), /shop/story, /shop/terms|privacy|shipping-policy, /mypage/coupons, /shop 별칭

## B. 내부 링크 하드코딩 — /cart 4건(StoreHeader:23, StoreFooter:59, CheckoutPage:525,632)은 공식 설치에서 전부 404
## C. Data source endpoint diff
- cart read: 공식 `/cart/query`, Still Form `/cart`
- order_complete: 공식 `{route.id}` vs Still Form `{route.order_number}`(주석에 동일성 명시)
- Still Form 누락 DS: products/popular|new|recent(shop index), category 전체목록, guest_order_show claim-reasons, order_complete addresses, mypage orders settings/review
## D. 관리자 route_path/no_route 변경 시 Still Form 전면 404 (12개 컴포넌트+6개 레이아웃 하드코딩)
## E. 런타임 라우트 smoke: 전부 200, `/shop/orders`(id 누락)·`/shop/order` 404 정상

## 수정 제안(승인 필요, 위험도 순)
1. shopBase Resolver 도입(공식 shopBase 패턴 미러) — 12~15파일
2. `/shop/cart` 라우트 추가 + /cart 링크 4건 전환
3. 레거시 `/shop/order/complete`(빈 페이지) 제거
4. login/register guest_only 플래그 복원
5. reorder를 shop prefix 하위로
6. 누락 라우트(보드/검색/알림 등)는 D2C 범위 결정 필요
7. 누락 DS 복원(popular/new/recent/claim-reasons/review 설정)
8. cart read endpoint → /cart/query
9. extras 게이트/문서화
10-12. 레이아웃 이름 정렬 + wishlist pagination
