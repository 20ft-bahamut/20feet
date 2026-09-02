# Still Form Commerce UX Glossary (ko / en)

> 전체 카피 통일 기준. G7 공식 용어가 있으면 G7 우선.
> G7 확인 결과: ecommerce module 공식 한국어 = `마일리지` (modules/sirsoft-ecommerce/resources/lang/ko.json) — 템플릿의 `적립금`은 마일리지로 통일.

| 개념 | ko | en | 비고 |
|------|----|----|------|
| Cart | 장바구니 | Cart | |
| Checkout Page | 주문/결제 | Checkout | |
| Payment Action | 결제하기 | Place order | |
| Product Subtotal | 상품 금액 | Item total | `소계`, `상품금액`(붙여쓰기) 통합 |
| Final Total | 총 결제금액 | Total | |
| Order History | 주문 내역 | Order history | 띄어쓰기 통일 |
| Add to Cart | 장바구니 담기 | Add to cart | |
| Quick Add | 담기 | Add | Product Card 등 좁은 공간만 허용 |
| Recipient | 받는 분 | Recipient | |
| Phone | 문맥별: `연락처` / `휴대폰 번호` | Phone | 입력 필드는 휴대폰 번호, 조회 연락처는 연락처 |
| Saved Address | 배송지 | Saved address | 목록 페이지 타이틀: 배송지 관리 |
| Address | 주소 | Address | |
| Detailed Address | 상세 주소 | Detail / Address line 2 | |
| Postal Code | 우편번호 | Postal code | |
| Member | 회원 | Member | |
| Account | 계정 (계정 개념을 실제로 말할 때만) | Account | |
| Password Recovery Entry | 비밀번호 찾기 | Find password | |
| Password Reset | 비밀번호 재설정 | Reset password | |
| Update Password | 비밀번호 변경 | Change password | |
| Product Inquiry | 상품 문의 | Product inquiry | |
| Review | 상품 후기 | Product review | |
| Wishlist | 찜 | Wishlist | |
| Order Number | 주문번호 | Order number | |
| Shipping | 배송 | Shipping | |
| Shipping Fee | 배송비 | Shipping fee | |
| Discount | 할인 | Discount | |
| Coupon | 쿠폰 | Coupon | |
| Point | **마일리지** (G7 공식) | Mileage | `적립금` 금지 — checkout/mypage 전체 통일 |
| Lookup Password (guest) | 조회 비밀번호 | Lookup password | |
| Cash Receipt | 현금영수증 | Cash receipt | `현금영수증 카드` 띄어쓰기 |
| Discount Code | 할인 코드 | Discount code | 띄어쓰기 통일 |

## 라벨 상세 규칙

- `받는 분` 중복 키: orders.recipient / addresses.recipient / checkout.shipping.recipient_name — 표기 통일 `받는 분`
- 비회원 문구에서 `가입하신` / `회원가입 시` 금지 → `주문 시 입력한 휴대폰 번호`, `회원 비밀번호와 별도로 사용하는 비밀번호입니다`
- Empty state(일반 고객 화면): `관리자에서…` 개발자 문구 금지 → `등록된 상품이 없습니다.` (Demo 안내는 DEMO_ONLY로 분리)
- Confirm: `…삭제하시겠어요?`, `주문을 취소하면 되돌릴 수 없습니다. 취소하시겠어요?`
- Checkbox: `배송지 저장`
- vbank(가상계좌) helper: `입금 기한이 지나면 주문이 자동으로 취소됩니다.` (payment method 실제 구분 확인 후 적용)