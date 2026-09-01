# PHASE 1 IMPLEMENTATION SPEC — Still Form product parity

Oracle JSON: `_workspace/ecommerce-qa/remediation/evidence/parity-oracle-b.json` (읽고 따름)
Template root: `templates/_bundled/superbify-commerce_minimal/`
Token/스타일 컨벤션: 기존 src/components/CheckoutForm.tsx / AddToCartPanel.tsx 참조 (inline style + `var(--scm-*)` tokens, basic wrapper 컴포넌트만 사용.)

## Files

1. **src/components/PurchasePanel.tsx** (NEW)
   - Props: `productId, productName, salesStatus, productData` (+ labels props, Korean defaults).
   - productData = product_detail DS의 `.data` (options / option_groups / additional_options / max_purchase_qty).
   - 옵션 모델:
     * `option_groups` 존재 → 그대로 사용. 없으면 `options[].option_values`({key:{ko,en},value:{ko,en}} 배열)에서 group 파생 (OPT-020 UI fallback, resolveLabel 헬퍼 — CheckoutForm.tsx에 있는 것과 동일 패턴).
     * Cascading Select: group i는 선행 group 미선택 시 disabled. 값 disabled = 해당 값으로 이어지는 active 조합 중 `!is_sold_out && stock_quantity>0` 인 row가 없을 때, 라벨 뒤 ` (품절)` suffix.
     * 마지막 group 선택 완료 → 일치 option row → **option block** 추가 (여러 조합 담기 가능, 기본값과 동일하게 반복 추가 허용). block에는 옵션 라벨(join ' / '), 수량 stepper (max = min(max_purchase_qty>0?max:999, stock_quantity)), `additional_options` Select(each: is_required 표시, is_default 기본 선택, `allow_custom_text===true`인 value 선택 시 custom text Input 노출, custom_text slice 255), 라인 금액 표시 `((selling_price + Σ additional price_adjustment) × qty)` 추정치, 제거 버튼.
     * 평문 상품(options.length<=1 && groups 없음): 기존 AddToCartPanel처럼 단순 수량 + CTA (option row id가 있으면 product_option_id 포함).
   - CTA: `scm:add-to-cart` CustomEvent dispatch — detail:
     ```
     { productId, mode: 'add'|'buy', productName,
       items: [{ product_option_id, quantity, additional_option_selections: [{additional_option_id, value_id, custom_text?}] }] }
     ```
     단일 평문 상품은 items=[{product_option_id?, quantity}] (product_option_id는 options[0].id 존재 시).
   - 검증: is_required 추가옵션 미선택 / allow_custom_text인데 custom text 비거나 → error 텍스트 표시 후 dispatch 중단. is_required는 라벨에 * 표시.
   - 총 결제 예상금액 표시 (blocks 합계 또는 plain price — server 재검증 전제 명시 주석).
   - testids: `option-selector`, `option-group-select-{i}`, `option-block`, `option-block-remove-{n}`, `block-qty-{n}`, `block-additional-{n}-{optionId}`, `purchase-total`, 기존 `add-to-cart`, `buy-now`, `quantity-input` 유지.

2. **src/components/WishlistHeart.tsx** (NEW)
   - Props: `productId, isWishlisted, isLoggedIn, toastGuestLabel='로그인이 필요합니다.'`
   - Guest → G7Core.toast.error + `window.location.assign('/login?redirect=' + encodeURIComponent(location.pathname))`.
   - Member → optimistic toggle + `fetch POST /api/modules/sirsoft-ecommerce/wishlist/toggle` (Bearer via `G7Core.api.getToken()`), 성공 시 response.data.added로 동기화, 실패 시 rollback. aria-pressed, data-testid="wishlist-heart".
   - 스타일: AddToCartPanel 스타일 참조 (scm tokens, heart glyph ♥/♡ 텍스트 사용 — Icon 컴포지트 없음).

3. **src/components/ProductReviews.tsx** (NEW)
   - Props: `productCode`, `ratingSummaryTitle='이 상품 리뷰'`, labels(한국어 기본).
   - fetch: `GET /api/modules/sirsoft-ecommerce/products/{productCode}/reviews?page=N&per_page=5&sort=<created_at_desc|rating_desc|rating_asc>&rating=<1-5>&photo_only=<1>` — Bearer attach (G7Core.api.getToken), 401 무시(비회원), 응답 `{reviews:{data[...],meta}, rating_stats, option_filters, total_count}` (parity-oracle-b.json 'Reviews' 항목 참조).
   - 렌더: 요약(평점 소수 1자리 + 5점 바 분포 `rating_stats`), 필터 행(정렬 Select: 최신순/평점높은/평점낮은, 별점 Select 1-5, 사진리뷰만 checkbox), 카드(별점 ★반복, option_snapshot badges, content, images grid ≤4 + '+N', has_reply면 답변 블록), 페이지네이션(prev/next+현페이지, meta), empty state: '등록된 리뷰가 없습니다.' (기능 숨김 금지).
   - 테스트 id: `product-reviews`, `review-card`, `reviews-summary-avg`, `reviews-filter-*`, `reviews-pagination-prev/next`.

4. **src/components/ProductQna.tsx** (NEW)
   - Props: `productCode, inquiryBoardSlug (layout에서 _global.modules['sirsoft-ecommerce'].inquiry?.board_slug), isLoggedIn`.
   - board_slug 없으면 아예 미렌더 (null) — default 계약(show.json:265, _tab_qna.json:6).
   - fetch: `GET /api/modules/sirsoft-ecommerce/products/{productCode}/inquiries?page=1&per_page=10&exclude_secret=1` → `{items[], meta:{board_settings{secret_mode,categories,...},abilities{can_update},total,...}}`.
   - 목록: title/category/answered 여부(has_reply)/답변 내용 노출. `is_secret && !is_owner` → content 대신 '비밀글입니다.'.
   - 작성: Modal 컴포지트(src/components/Modal.tsx — 이미 있음, isOpen/onClose props) 열어서 폼: category Select(비어있으면 hidden), title, content, secret checkbox(secret_mode==='disabled'면 미표시, 'always'면 checked+disabled). 제출: create → `POST /api/modules/sirsoft-ecommerce/products/{productCode}/inquiries` (Bearer, 401이면 로그인 안내), edit → PUT /user/inquiries/{id}, delete(own) → DELETE /user/inquiries/{id} + ConfirmDialog 없이 window.confirm 금지 — Modal로 확인 요청. 성공/실패 → G7Core toast + 목록 refetch.
   - testids: `product-qna`, `qna-card`, `qna-write-button`, `qna-secret-input`, `qna-modal`.

5. **src/handlers/storageHandlers.ts** — addToCartHandler 업그레이드
   - detail에 `items` 존재 시 bulk contract 사용:
     * add: POST /cart `{ product_id, items }` (items: {product_option_id, quantity, additional_option_selections}).
     * buy: POST /checkout `{ direct_items: [{product_id, product_option_id, quantity, additional_option_selections?}] }` → 성공 시 200이고 redirect_url/order 흐름은 기존과 동일(기존 코드 재사용: 성공 시 /checkout 이동, 상품 상세와 동일 계약).
     * detail.items 없으면 기존 단일 shape fallback 유지 (호환).
   - 성공 시: cart_count state 갱신 + toast 유지.

6. **src/index.ts** — export + register `PurchasePanel`, `WishlistHeart`, `ProductReviews`, `ProductQna`.
   **components.json** — composite 4종 추가 (path 정확히).

7. **layouts/shop/product.json**
   - AddToCartPanel composite → PurchasePanel로 교체, props 추가: `"productData": "{{product_detail?.data ?? null}}"` (+ 기존 labels).
   - AddToCartPanel 컴포지트 자체는 삭제하지 말 것(평문 상품 fallback 재사용 가치) — 실제로는 PurchasePanel이 plain 상품도 처리하므로 product.json만 교체.
   - 상품 제목/KV 근처에 WishlistHeart 노드 추가: `{"productId": "{{product_detail?.data?.id}}", "isWishlisted": "{{product_detail?.data?.is_wishlisted ?? false}}", "isLoggedIn": "{{_global?.currentUser?.uuid ? true : false}}"}`.
   - description_section 다음(related products 앞)에: Review 섹션 `{"name":"ProductReviews","props":{"productCode":"{{route.slug}}","isLoggedIn":"{{_global?.currentUser?.uuid ? true : false}}"}}` + Q&A 섹션: `{"name":"ProductQna","props":{"productCode":"{{route.slug}}","inquiryBoardSlug":"{{_global.modules?.['sirsoft-ecommerce']?.inquiry?.board_slug ?? ''}}","isLoggedIn":"{{_global?.currentUser?.uuid ? true : false}}"}}`.
   - JSON 유효성 유지, 주석은 `_comment`.

## 검증 (본 스레드가 수행 — 네가 하지 않음)
- tsc, vitest, build, template:update 후 브라우저 E2E.

## 금지
- G7 core / modules/_bundled/sirsoft-ecommerce 수정 금지.
- sirsoft-basic 수정 금지 (읽기만).
- 새 option engine 금지 (위 UI 모델대로만).
- 기존 테스트/다른 컴포넌트 회귀 금지 — `npx vitest run` 전부 통과해야 함 (templates/_bundled/superbify-commerce_minimal 에서).
- lang 키 새로 추가할 경우 ko/en 둘 다 + `$t:` 바인딩만 사용(없으면 한국어 literal 허용).