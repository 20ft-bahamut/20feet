# Still Form Copy Source Map

> 새 카피를 "어디에서" 고쳐야 하는지 — 개발자용 안내.

## Copy 관리 구조

```
lang/ko.json · lang/en.json   ← 사용자 노출 카피의 primary Source of Truth
        ↓ $t:superbify.* 참조
layouts/**/*.json             ← props로 lang 키 전달 (레이아웃 구조만 정의)
        ↓ props
src/components/*.tsx          ← 렌더. props 미전달 시 default fallback 사용
```

## 영역별 위치

| 영역 | SoT | 비고 |
|------|-----|------|
| Brand / Home (hero, story, editorial, final_cta) | `lang/*.json` → `home.*` | `layouts/home.json`이 $t 참조. fixture 이미지는 `src/components/demoAssets.ts` |
| Story 페이지 | `lang/*.json` → `story.*` | `layouts/shop/story.json` |
| Nav (Shop/스토리/공지사항/장바구니) | `lang/*.json` → `nav.*` | `_user_base.json`이 StoreHeader/Footer에 label props 전달. 컴포넌트 fallback은 영문 |
| Shop / Category / Product meta | `lang/*.json` → `shop.* / category.* / product.* / routes.*` | |
| Cart | `lang/*.json` → `cart.*` | `layouts/cart.json` + `CartItemRow/CartSummary` fallback |
| Checkout | `lang/*.json` → `checkout.*` (37키 wired) | ⚠️ **부분 연결** — `layouts/shop/checkout.json`이 일부만 전달, 나머지는 `CheckoutForm.tsx` hardcoded default가 live 소스 (아래 참고) |
| Order Complete / Guest | `lang/*.json` → `order_complete.* / guest_order_*.*` | `OrderCompletePage.tsx` fallback 존재 |
| Auth | `lang/*.json` → `auth.*` | `layouts/auth/*.json` $t 참조 |
| MyPage | `lang/*.json` → `mypage.*` | `layouts/mypage/**` |
| Product QnA / Reviews | **`ProductQna.tsx` / `ProductReviews.tsx` hardcoded** | lang 키 없음 — 수정 시 컴포넌트 직접 수정 |
| Policy (terms/privacy/shipping 본문) | **`config/business-info.json`** | ko/en 병기. 법적 문구 — LEGAL_REVIEW_REQUIRED |
| Policy 페이지 chrome (eyebrow/note) | `lang/*.json` → `business.policy.*` | |
| Footer 사업자 정보 | `config/business-info.json` + admin basic_info live fetch | |
| Demo notice | `lang/*.json` → `business.demo_notice` | DEMO_ONLY — production에서 사업자정보 설정 시 비노출 검토 여지 |
| Footer copyright | `StoreFooter.tsx` default `© 2026 Still Form — demo store built on Gnuboard 7` | DEMO_ONLY |
| Checkout placeholder (데모 결제 안내) | `lang/*.json` → `cart.checkout_placeholder_*` | DEMO_ONLY |

## ⚠️ Checkout lang keys 미연결 목록 (부분 중복 상태)

`lang checkout.*` 중 아래 키들은 현재 layout이 props로 전달하지 않고,
`CheckoutForm.tsx` default값이 실제 렌더됨. **fallback과 lang이 용어로 정렬되어 있으므로 즉시 문제 없음.**
향후 wiring 시 lang 값을 사용하면 됨 (rule 31 권장 방향):

- `checkout.orderer.*` (단, `phone` lang='연락처' — component와 정렬 완료)
- `checkout.guest_password.*` (component guestLookup* — 8자 기준은 component 값이 live)
- `checkout.shipping.title/recipient_*/zipcode/address*/memo/intl_*` (component defaults가 live)
- `checkout.payment.*` 대부분 (vbank_helper, refund_*, deposit_due는 wiring 완료)
- `checkout.items.*`, `checkout.summary.items/total/title/unavailable_*`, `checkout.validation.*`, `checkout.pg.*`, `checkout.title`, `checkout.logged_in_as`, `checkout.loading`, `checkout.back_to_cart`, `checkout.submitting`
- `cart.added_toast/buy_now_toast/update_failed/delete_failed/items_deleted/delete_confirm_*/checkout_title/checkout_placeholder_*` (CheckoutPage/CartItemRow 내부 처리 방식 확인 필요 — 일부는 wiring 완료)

이 키들은 **stale-duplicate가 아니라 "wiring 예정 i18n mirror"**로 유지한다(삭제 금지).
Component default를 고칠 때는 lang 쪽도 같이 고쳐야 drift가 생기지 않는다.

## 수정 시 체크리스트

1. `rg "문자열" templates/_bundled/superbify-commerce_minimal` — lang + layout + component fallback 3중 중복 확인
2. ko.json 수정 시 en.json pair 확인 (rule 51)
3. component fallback 수정 시 lang도 같이 (rule 57)
4. 변경 후: `npm run build` → `php artisan template:update superbify-commerce_minimal --source=bundled --force` → `template:refresh-layout` → `template:cache-clear`
