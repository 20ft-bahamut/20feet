# Still Form Copy Remediation Plan

> 상태: **EXECUTED** (이 플랜의 모든 항목 적용 완료 — 실행 결과는 copy-before-after.md, flag별 재평가는 copy-review-after.md)
> Source of Truth: `_workspace/still-form/COPY_INVENTORY.md`(BEFORE) + 사용자 지시(2026-09-02) + copy-style-guide.md + copy-glossary.md

| ID | PAGE | SOURCE | PROBLEM | ACTION | SOT |
|----|------|--------|---------|--------|-----|
| BRAND-001 | home-hero | lang/{ko,en}.json home.hero.sub | AI 감성 누적(손에 익는 재질/변화하는 결/머무는 사물/차곡차곡). Hero 역할=브랜드/쇼핑몰 소개로 정리 | REWRITE | lang |
| BRAND-002 | home-story | lang/{ko,en}.json home.story.heading | '오래 쓸수록 익어지는 것들' — 금지 표현군. Section 역할을 상품 선정 기준으로 명확화 | REWRITE | lang |
| BRAND-003 | home-story | lang/{ko,en}.json home.story.body | 의인화(재질이 스스로 말을 거는), '익은 것', '천천히 소개합니다' — 금지 표현군. 실제 선택 기준으로 교체 | REWRITE | lang |
| BRAND-004 | home-editorial | lang/{ko,en}.json home.editorial.heading | '조용히, 그러나 단단하게.' — 금지 표현. 사용자 확정 방향 적용 | REWRITE | lang |
| BRAND-005 | home-editorial | lang/{ko,en}.json home.editorial.body | '머무는 사물', '시간이 흐를수록', '익어지는 물건', '차분히' — 금지 표현군. Editorial 역할=실제 생활 제품 소개. 선택 기준 문장은 Story | REWRITE | lang |
| BRAND-006 | home-final-cta | lang/{ko,en}.json home.final_cta.heading | '조용한 일상의 모든 물건을 한 자리에서' — tagline 단어 반복 + 추상 표현. 사용자 확정 방향 적용 | REWRITE | lang |
| BRAND-007 | home-final-cta | lang/{ko,en}.json home.final_cta.body | '오래 머무를 한 가지 물건' — 금지 표현군. 판매 중 상품 탐색 안내로 교체 | REWRITE | lang |
| BRAND-008 | home-final-cta | lang/{ko,en}.json home.final_cta.cta | 'Shop 전체 보기' — 영문 혼용. 사용자 확정 CTA 적용 | TERM_NORMALIZE | lang |
| TERM-001 | home-new-arrivals | lang/{ko,en}.json home.new_arrivals.heading | '새로 들어온 것들' — 상품임을 명시(용어 통일) | TERM_NORMALIZE | lang |
| TERM-002 | product-detail | lang/{ko,en}.json product.related_title | '함께 보면 좋은 것들' — cart.cross_sell.title '함께 보면 좋은 상품'과 용어 불일치 | TERM_NORMALIZE | lang |
| DEAD-001 | home-promo | lang/{ko,en}.json home.promo.eyebrow | home.promo.* 3개 키 전체가 layout/component에서 미참조하는 dead key. '오늘의 한 권' 책 비유 카피도 여기에 있음 | REMOVE | lang |
| DEAD-001 | home-promo | lang/{ko,en}.json home.promo.title | dead key (미참조). 책 비유 카피 | REMOVE | lang |
| DEAD-001 | home-promo | lang/{ko,en}.json home.promo.description | dead key (미참조). 책 비유 카피 | REMOVE | lang |
| BRAND-009 | home-meta | lang/{ko,en}.json routes.home.description | '머무는 사물' 금지 표현 + tagline 어투 반복 | REWRITE | lang |
| BRAND-010 | global-meta | lang/{ko,en}.json base_layout_description | 영문 단일 + developer 템플릿명 노출(SuperBify Commerce Minimal) — 브랜드 기준으로 교체 | REWRITE | lang |
| BRAND-011 | story | lang/{ko,en}.json story.body | '시간이 지나도 변하지 않는 사물', '재질이 스스로 말을 거는', '차곡차곡' — 금지 표현군/의인화. 무엇을 어떤 기준으로 고르는가로 교체 | REWRITE | lang |
| I18N-001 | shop | lang/{ko,en}.json shop.empty_title | 일반 고객 화면 관점 표기로 통일 | TERM_NORMALIZE | lang |
| I18N-002 | shop | lang/{ko,en}.json shop.empty_message | admin 문구('관리자에서 상품을 등록하면…')가 고객 화면에 노출 — empty_title과도 중복. layout emptyMessage props도 함께 제 | REMOVE | lang |
| I18N-003 | notice | lang/{ko,en}.json notice.empty_message | admin/데모 문구('데모용 템플릿입니다. 실제 공지사항 데이터는 관리자에서…')가 고객 화면 노출 — layout emptyMessage props도 함께 제 | REMOVE | lang |
| CART-001 | cart | lang/{ko,en}.json cart.title | 페이지 H1 'Cart' 영문 — 기능 UI는 한국어 | I18N_FIX | lang |
| CART-002 | cart | lang/{ko,en}.json cart.eyebrow | 'SHOPPING BAG' functional English — design eyebrow 'CART'로 | I18N_FIX | lang |
| CART-003 | cart | lang/{ko,en}.json cart.delete_confirm_single | confirm 본문 평서문 종결 — 의문형으로 | REWRITE | lang |
| CART-004 | cart | lang/{ko,en}.json cart.delete_confirm_multiple | 동일 — 의문형 | REWRITE | lang |
| CART-005 | cart | lang/{ko,en}.json cart.summary_subtotal | '소계' — checkout '상품금액'과 용어 불일치. glossary: 상품 금액 | TERM_NORMALIZE | lang |
| CART-006 | cart | lang/{ko,en}.json cart.checkout_title | 버튼 'Checkout' 영문 — 주문/결제 페이지 이동 버튼 | I18N_FIX | lang |
| CART-007 | cart | lang/{ko,en}.json cart.cross_sell.eyebrow | 'YOU MAY ALSO LIKE' functional English — design eyebrow 'RELATED'로 역할 분리 | I18N_FIX | lang |
| CO-001 | checkout | lang/{ko,en}.json checkout.empty_title | '주문 정보를 만들 수 없습니다' — 시스템 어투 | REWRITE | lang |
| CO-002 | checkout | lang/{ko,en}.json checkout.shipping.save_address | 체크박스 라벨 평서문 — 선택 행위 표현으로 | REWRITE | lang |
| CO-003 | checkout | lang/{ko,en}.json checkout.shipping.address_placeholder | '기본 주소' — 국내 배솱 placeholder 표준은 도로명 주소(en Street address와 정합) | TERM_NORMALIZE | lang |
| CO-004 | checkout | lang/{ko,en}.json checkout.payment.vbank_helper | '직접 입금 기한 이후에는…' — 번역투+가상계좌 미스매치 | REWRITE | lang |
| CO-005 | checkout | lang/{ko,en}.json checkout.payment.cash_receipt_phone | 띄어쓰기 통일 | TERM_NORMALIZE | lang |
| CO-006 | checkout | lang/{ko,en}.json checkout.payment.cash_receipt_card | 띄어쓰기 통일 | TERM_NORMALIZE | lang |
| CO-007 | checkout | lang/{ko,en}.json checkout.discount.select_placeholder | '~하세요' → '~해 주세요' tone 통일 | TERM_NORMALIZE | lang |
| CO-008 | checkout | lang/{ko,en}.json checkout.discount.discount_code | 띄어쓰기 통일 | TERM_NORMALIZE | lang |
| CO-009 | checkout | lang/{ko,en}.json checkout.discount.discount_code_placeholder | 띄어쓰기 + '~하세요'→'~해 주세요' | TERM_NORMALIZE | lang |
| CO-010 | checkout | lang/{ko,en}.json checkout.validation.password_min | '4자리' → '4자'(글자 수 표준 표기) | TERM_NORMALIZE | lang |
| CO-011 | checkout | lang/{ko,en}.json checkout.mileage.title | '적립금' → G7 공식 용어 '마일리지' | TERM_NORMALIZE | lang |
| CO-012 | checkout | lang/{ko,en}.json checkout.mileage.available | '적립금'→'마일리지' | TERM_NORMALIZE | lang |
| CO-013 | checkout | lang/{ko,en}.json checkout.mileage.input_placeholder | '적립금'→'마일리지' | TERM_NORMALIZE | lang |
| CO-014 | checkout | lang/{ko,en}.json checkout.summary.points_used | '적립금'→'마일리지' | TERM_NORMALIZE | lang |
| CO-015 | checkout | lang/{ko,en}.json checkout.summary.subtotal | '상품금액'→'상품 금액'(glossary, 띄어쓰기) | TERM_NORMALIZE | lang |
| CO-016 | order-complete | lang/{ko,en}.json order_complete.subtitle | title '주문이 접수되었습니다'와 내용 중복 — 페이지에서 확인할 것을 안내 | REWRITE | lang |
| CO-017 | order-complete | lang/{ko,en}.json order_complete.guest_notice_lookup | 비회원 문구에 '가입하신 휴대폰' — 회원가입 용어 혼용 | REWRITE | lang |
| CO-018 | checkout | lang/{ko,en}.json checkout.guest_password.hint | '가입 시 비밀번호와 다릅니다' — 비회원 맥락에서 회원가입 용어 혼용 | REWRITE | lang |
| CO-019 | guest-order-form | lang/{ko,en}.json guest_order_form.notice | '다시 조회하셔야 합니다' 번역투 어미 + 문장 구조 정리(ko/en 사실 동일 유지) | REWRITE | lang |
| CO-020 | guest-order-show | lang/{ko,en}.json guest_order_show.subtitle | 정적 페이지 부제 진행형 — 사용자 행동 안내로 | REWRITE | lang |
| AUTH-001 | register | lang/{ko,en}.json auth.register.has_account | '계정'→'회원'(glossary Member). login 측 already_member와 동일 의문 통일 | TERM_NORMALIZE | lang |
| AUTH-002 | auth | lang/{ko,en}.json auth.already_member | layout/component 미참조 dead key (register.has_account와 중복) | REMOVE | lang |
| AUTH-003 | login | lang/{ko,en}.json auth.login_form.no_account | layout/component 미참조 dead key | REMOVE | lang |
| AUTH-004 | reset-password | lang/{ko,en}.json auth.reset_password.submit | 페이지 '비밀번호 재설정'인데 버튼 '비밀번호 변경' — 용어 통일 | TERM_NORMALIZE | lang |
| AUTH-005 | reset-password | lang/{ko,en}.json auth.reset_password.processing | '변경 중...' — 재설정 용어 + ellipsis 통일 | TERM_NORMALIZE | lang |
| AUTH-006 | reset-password | lang/{ko,en}.json auth.reset_password.success | '변경되었습니다' → 재설정 용어 통일 | TERM_NORMALIZE | lang |
| AUTH-007 | login | lang/{ko,en}.json auth.login_form.processing | ellipsis '...' → '…' 전체 통일 | TERM_NORMALIZE | lang |
| AUTH-008 | register | lang/{ko,en}.json auth.register.processing | ellipsis 통일 (약관/개인정보 모달 로딩 상태 재사용 키) | TERM_NORMALIZE | lang |
| AUTH-009 | forgot-password | lang/{ko,en}.json auth.forgot_password.processing | ellipsis 통일 | TERM_NORMALIZE | lang |
| MYP-001 | mypage | lang/{ko,en}.json mypage.tabs.orders | '주문내역' → '주문 내역' 띄어쓰기 통일 | TERM_NORMALIZE | lang |
| MYP-002 | mypage-meta | lang/{ko,en}.json routes.mypage_orders | '주문내역' → '주문 내역' 띄어쓰기 통일 | TERM_NORMALIZE | lang |
| MYP-003 | mypage-orders | lang/{ko,en}.json mypage.orders.phone | en 'Contact' vs addresses.phone 'Phone' — 용어 통일 | TERM_NORMALIZE | lang |
| MYP-004 | mypage-orders | lang/{ko,en}.json mypage.orders.cancel_confirm_body | confirm 본문 평서문('이 주문을 취소합니다.') — 의문형으로 | REWRITE | lang |
| DEMO-001 | global-footer | lang/{ko,en}.json business.demo_notice | 데모 안내에 developer 경로(config/business-info.json) 노출 — rule 28 분리. 데모 라인은 유지 | DEMO_ONLY | lang |
| NAV-001 | global-header | lang/{ko,en}.json nav.cart | nav 라벨 하드코딩 영문 → lang 키 연결. ko locale 기능 UI 한국어 | I18N_FIX | lang |
| NAV-002 | global-header | lang/{ko,en}.json nav.story | 동일 | I18N_FIX | lang |
| NAV-003 | global-header | lang/{ko,en}.json nav.notice | 동일 | I18N_FIX | lang |
| NAV-004 | global-header | lang/{ko,en}.json nav.shop | 동일 (Shop은 매장 섹션명으로 유지 — 사용자 확정 카피 'Shop 둘러보기'와 정합) | I18N_FIX | lang |
| META-001 | cart-meta | lang/{ko,en}.json routes.cart.title | ko locale meta title 영문 | I18N_FIX | lang |
| META-002 | checkout-meta | lang/{ko,en}.json routes.checkout.title | 동일 | I18N_FIX | lang |
| META-003 | story-meta | lang/{ko,en}.json routes.story.title | 동일 | I18N_FIX | lang |
| META-004 | notice-meta | lang/{ko,en}.json routes.notice.title | 동일 | I18N_FIX | lang |
| META-005 | category-meta | lang/{ko,en}.json routes.category.title | 동일 | I18N_FIX | lang |
| META-006 | product-meta | lang/{ko,en}.json routes.product.title | 동일 | I18N_FIX | lang |

추가 적용(component/layout — 세부는 copy-before-after.md):

| ID | SOURCE | ACTION |
|----|--------|--------|
| COMP-001~013 | src/components (CrossSellStrip/CartSummary/CheckoutForm/CheckoutPage/OrderCompletePage/CartItemRow/ProductQna/PurchasePanel/StoreHeader/StoreFooter) | REWRITE / TERM_NORMALIZE / I18N_FIX |
| LAYOUT-001~004 | layouts (shop/category, home, shop/index, shop/notice, _user_base) | I18N_FIX / REMOVE / SOURCE_DEDUP |

LEGAL: `config/business-info.json` 정책 본문(배송 7일 기산점, 데모 섹션) — 자동 수정 없음, LEGAL_REVIEW_REQUIRED 보고.
