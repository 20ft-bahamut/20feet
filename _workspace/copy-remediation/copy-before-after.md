# Still Form Copy Before / After

> 실제 적용된 변경 전체 기록. lang 변경은 `copy-before-after-data.jsonl`(자동 생성), component/layout 변경은 아래 수동 기록.


## Brand / Home

### BRAND-001 — home.hero.sub
PROBLEM: AI 감성 누적(손에 익는 재질/변화하는 결/머무는 사물/차곡차곡). Hero 역할=브랜드/쇼핑몰 소개로 정리
ACTION: REWRITE
- ko BEFORE: '손에 익는 재질, 변화하는 결, 천천히 좋아지는 형태. 일상의 한 자리에 머무는 사물을 차곡차곡 모아 봅니다.'
- ko AFTER: '생활 가까이에서 쓰는 물건을 모은 온라인 스토어입니다.'
- en BEFORE: 'Materials that grow familiar with use. Forms that quietly improve with time. A small, careful collection for everyday spaces.'
- en AFTER: 'An online store for objects used in everyday life.'

### BRAND-002 — home.story.heading
PROBLEM: '오래 쓸수록 익어지는 것들' — 금지 표현군. Section 역할을 상품 선정 기준으로 명확화
ACTION: REWRITE
- ko BEFORE: '오래 쓸수록 익어지는 것들'
- ko AFTER: 'Still Form이 고르는 기준'
- en BEFORE: 'Things that grow better with time'
- en AFTER: 'How Still Form chooses'

### BRAND-003 — home.story.body
PROBLEM: 의인화(재질이 스스로 말을 거는), '익은 것', '천천히 소개합니다' — 금지 표현군. 실제 선택 기준으로 교체
ACTION: REWRITE
- ko BEFORE: 'Still Form은 시간이 지나도 변하지 않는 사물을 모은 자리입니다. 목재, 리넨, 도자기 — 손에 닿는 재질이 스스로 말을 거는 물건을 골라 천천히 소개합니다. 화려함보다 차분함, 새것보다 익은 것을 우선합니다.'
- ko AFTER: '매일 쓰는 물건일수록 재질과 형태, 쓰임을 봅니다. 집과 책상 가까이에 두고 오래 사용할 수 있는 제품을 고릅니다.'
- en BEFORE: 'Still Form gathers objects that hold their character through years of use. Wood that softens, linen that deepens, ceramics that darken at the rim. We choose pieces whose materials speak for themselves.'
- en AFTER: 'For things used every day, we look at the material, the form, and how they are used. We pick products that can be kept close at home and used for a long time.'

### BRAND-004 — home.editorial.heading
PROBLEM: '조용히, 그러나 단단하게.' — 금지 표현. 사용자 확정 방향 적용
ACTION: REWRITE
- ko BEFORE: '조용히, 그러나 단단하게.'
- ko AFTER: '매일 손이 가는 물건들'
- en BEFORE: 'Quietly, but firmly.'
- en AFTER: 'Things you reach for every day'

### BRAND-005 — home.editorial.body
PROBLEM: '머무는 사물', '시간이 흐를수록', '익어지는 물건', '차분히' — 금지 표현군. Editorial 역할=실제 생활 제품 소개. 선택 기준 문장은 Story와 중복이라 제외
ACTION: REWRITE
- ko BEFORE: '공간에 머무는 사물은 시간이 흐를수록 더 좋아지는 종류가 있습니다. Still Form은 오래 쓸수록 익어지는 물건을 차분히 모은 자리입니다.'
- ko AFTER: '컵과 접시, 조명과 패브릭처럼 생활 가까이에 두고 자주 쓰는 물건을 소개합니다.'
- en BEFORE: 'Some objects in a room only get better with time. Still Form is a small, careful collection of those long-keeping things.'
- en AFTER: 'Cups, plates, lighting, and fabrics — objects you keep close and use often.'

### BRAND-006 — home.final_cta.heading
PROBLEM: '조용한 일상의 모든 물건을 한 자리에서' — tagline 단어 반복 + 추상 표현. 사용자 확정 방향 적용
ACTION: REWRITE
- ko BEFORE: '조용한 일상의 모든 물건을 한 자리에서'
- ko AFTER: 'Still Form의 모든 상품'
- en BEFORE: 'Everyday quiet objects, in one place'
- en AFTER: 'All Still Form products'

### BRAND-007 — home.final_cta.body
PROBLEM: '오래 머무를 한 가지 물건' — 금지 표현군. 판매 중 상품 탐색 안내로 교체
ACTION: REWRITE
- ko BEFORE: '지금 전체 Shop을 둘러보고, 오래 머무를 한 가지 물건을 골라보세요.'
- ko AFTER: '컵, 조명, 트레이, 패브릭 등 현재 판매 중인 상품을 한 번에 확인해 보세요.'
- en BEFORE: 'Browse the full Shop and find one piece that will stay with you for years.'
- en AFTER: 'Cups, lighting, trays, fabrics and more — see everything currently for sale in one place.'

### BRAND-008 — home.final_cta.cta
PROBLEM: 'Shop 전체 보기' — 영문 혼용. 사용자 확정 CTA 적용
ACTION: TERM_NORMALIZE
- ko BEFORE: 'Shop 전체 보기'
- ko AFTER: '전체 상품 보기'
- en BEFORE: 'Browse all of Shop'
- en AFTER: 'View all products'


## Terminology

### TERM-001 — home.new_arrivals.heading
PROBLEM: '새로 들어온 것들' — 상품임을 명시(용어 통일)
ACTION: TERM_NORMALIZE
- ko BEFORE: '새로 들어온 것들'
- ko AFTER: '새로 들어온 상품'

### TERM-002 — product.related_title
PROBLEM: '함께 보면 좋은 것들' — cart.cross_sell.title '함께 보면 좋은 상품'과 용어 불일치
ACTION: TERM_NORMALIZE
- ko BEFORE: '함께 보면 좋은 것들'
- ko AFTER: '함께 보면 좋은 상품'
- en BEFORE: 'You might also like'
- en AFTER: 'You may also like'


## Dead key

### DEAD-001 — home.promo.eyebrow
PROBLEM: home.promo.* 3개 키 전체가 layout/component에서 미참조하는 dead key. '오늘의 한 권' 책 비유 카피도 여기에 있음
ACTION: REMOVE
- ko BEFORE: 'LIFESTYLE'
- ko AFTER: (삭제)

### DEAD-001 — home.promo.title
PROBLEM: dead key (미참조). 책 비유 카피
ACTION: REMOVE
- ko BEFORE: '오늘의 한 권'
- ko AFTER: (삭제)

### DEAD-001 — home.promo.description
PROBLEM: dead key (미참조). 책 비유 카피
ACTION: REMOVE
- ko BEFORE: '책꽂이 위에 머무는 단행본 한 권처럼, 일상에 한 점 더해지는 물건을 소개합니다.'
- ko AFTER: (삭제)


## Brand / Home

### BRAND-009 — routes.home.description
PROBLEM: '머무는 사물' 금지 표현 + tagline 어투 반복
ACTION: REWRITE
- ko BEFORE: '일상의 한 자리에 머무는 사물을 모은 자리.'
- ko AFTER: '생활 가까이에서 쓰는 물건을 모은 온라인 스토어.'
- en BEFORE: 'A small collection of objects for everyday spaces.'
- en AFTER: 'An online store for objects used in everyday life.'

### BRAND-010 — base_layout_description
PROBLEM: 영문 단일 + developer 템플릿명 노출(SuperBify Commerce Minimal) — 브랜드 기준으로 교체
ACTION: REWRITE
- ko BEFORE: 'Home & lifestyle store — SuperBify Commerce Minimal'
- ko AFTER: '생활 가까이에서 쓰는 물건을 모은 온라인 스토어 — Still Form'
- en BEFORE: 'Home & lifestyle store — SuperBify Commerce Minimal'
- en AFTER: 'An online store for objects used in everyday life — Still Form'

### BRAND-011 — story.body
PROBLEM: '시간이 지나도 변하지 않는 사물', '재질이 스스로 말을 거는', '차곡차곡' — 금지 표현군/의인화. 무엇을 어떤 기준으로 고르는가로 교체
ACTION: REWRITE
- ko BEFORE: 'Still Form은 시간이 지나도 변하지 않는 사물을 모은 자리입니다. 손에 익는 목재, 결이 살아있는 리넨, 묵직한 도자기 — 재질이 스스로 말을 거는 물건을 골라 차곡차곡 소개합니다.'
- ko AFTER: 'Still Form은 생활 가까이에서 쓰는 물건을 다룹니다. 목재, 리넨, 도자기 같은 재질과 형태, 실제 쓰임을 기준으로 상품을 고릅니다.'
- en BEFORE: 'Still Form is a small house of objects that hold their character through years of use. Wood that softens, linen that deepens, ceramics that darken at the rim — pieces whose materials speak for themselves.'
- en AFTER: 'Still Form carries objects used close to everyday life. We choose products by material, form, and real use — wood, linen, ceramics and more.'


## I18N/Empty state

### I18N-001 — shop.empty_title
PROBLEM: 일반 고객 화면 관점 표기로 통일
ACTION: TERM_NORMALIZE
- ko BEFORE: '아직 등록된 상품이 없습니다'
- ko AFTER: '등록된 상품이 없습니다'

### I18N-002 — shop.empty_message
PROBLEM: admin 문구('관리자에서 상품을 등록하면…')가 고객 화면에 노출 — empty_title과도 중복. layout emptyMessage props도 함께 제거
ACTION: REMOVE
- ko BEFORE: '관리자에서 상품을 등록하면 이 자리에 표시됩니다.'
- ko AFTER: (삭제)

### I18N-003 — notice.empty_message
PROBLEM: admin/데모 문구('데모용 템플릿입니다. 실제 공지사항 데이터는 관리자에서…')가 고객 화면 노출 — layout emptyMessage props도 함께 제거
ACTION: REMOVE
- ko BEFORE: '데모용 템플릿입니다. 실제 공지사항 데이터는 관리자에서 추가할 수 있습니다.'
- ko AFTER: (삭제)


## Cart

### CART-001 — cart.title
PROBLEM: 페이지 H1 'Cart' 영문 — 기능 UI는 한국어
ACTION: I18N_FIX
- ko BEFORE: 'Cart'
- ko AFTER: '장바구니'

### CART-002 — cart.eyebrow
PROBLEM: 'SHOPPING BAG' functional English — design eyebrow 'CART'로
ACTION: I18N_FIX
- ko BEFORE: 'SHOPPING BAG'
- ko AFTER: 'CART'
- en BEFORE: 'SHOPPING BAG'
- en AFTER: 'CART'

### CART-003 — cart.delete_confirm_single
PROBLEM: confirm 본문 평서문 종결 — 의문형으로
ACTION: REWRITE
- ko BEFORE: '선택한 상품을 장바구니에서 삭제합니다.'
- ko AFTER: '선택한 상품을 장바구니에서 삭제하시겠어요?'
- en BEFORE: 'The selected item will be removed from your cart.'
- en AFTER: 'Remove the selected item from your cart?'

### CART-004 — cart.delete_confirm_multiple
PROBLEM: 동일 — 의문형
ACTION: REWRITE
- ko BEFORE: '선택한 상품을 장바구니에서 삭제합니다.'
- ko AFTER: '선택한 상품을 장바구니에서 삭제하시겠어요?'
- en BEFORE: 'The selected items will be removed from your cart.'
- en AFTER: 'Remove the selected items from your cart?'

### CART-005 — cart.summary_subtotal
PROBLEM: '소계' — checkout '상품금액'과 용어 불일치. glossary: 상품 금액
ACTION: TERM_NORMALIZE
- ko BEFORE: '소계'
- ko AFTER: '상품 금액'
- en BEFORE: 'Subtotal'
- en AFTER: 'Item total'

### CART-006 — cart.checkout_title
PROBLEM: 버튼 'Checkout' 영문 — 주문/결제 페이지 이동 버튼
ACTION: I18N_FIX
- ko BEFORE: 'Checkout'
- ko AFTER: '주문/결제'

### CART-007 — cart.cross_sell.eyebrow
PROBLEM: 'YOU MAY ALSO LIKE' functional English — design eyebrow 'RELATED'로 역할 분리
ACTION: I18N_FIX
- ko BEFORE: 'YOU MAY ALSO LIKE'
- ko AFTER: 'RELATED'
- en BEFORE: 'YOU MAY ALSO LIKE'
- en AFTER: 'RELATED'


## Checkout/Order/Guest

### CO-001 — checkout.empty_title
PROBLEM: '주문 정보를 만들 수 없습니다' — 시스템 어투
ACTION: REWRITE
- ko BEFORE: '주문 정보를 만들 수 없습니다'
- ko AFTER: '주문을 진행할 수 없습니다'
- en BEFORE: 'Cannot create checkout'
- en AFTER: 'Cannot proceed with checkout'

### CO-002 — checkout.shipping.save_address
PROBLEM: 체크박스 라벨 평서문 — 선택 행위 표현으로
ACTION: REWRITE
- ko BEFORE: '입력한 배송지를 저장합니다'
- ko AFTER: '배송지 저장'

### CO-003 — checkout.shipping.address_placeholder
PROBLEM: '기본 주소' — 국내 배솱 placeholder 표준은 도로명 주소(en Street address와 정합)
ACTION: TERM_NORMALIZE
- ko BEFORE: '기본 주소'
- ko AFTER: '도로명 주소'

### CO-004 — checkout.payment.vbank_helper
PROBLEM: '직접 입금 기한 이후에는…' — 번역투+가상계좌 미스매치
ACTION: REWRITE
- ko BEFORE: '직접 입금 기한 이후에는 주문이 자동 취소됩니다.'
- ko AFTER: '입금 기한이 지나면 주문이 자동으로 취소됩니다.'

### CO-005 — checkout.payment.cash_receipt_phone
PROBLEM: 띄어쓰기 통일
ACTION: TERM_NORMALIZE
- ko BEFORE: '휴대폰번호'
- ko AFTER: '휴대폰 번호'

### CO-006 — checkout.payment.cash_receipt_card
PROBLEM: 띄어쓰기 통일
ACTION: TERM_NORMALIZE
- ko BEFORE: '현금영수증카드'
- ko AFTER: '현금영수증 카드'

### CO-007 — checkout.discount.select_placeholder
PROBLEM: '~하세요' → '~해 주세요' tone 통일
ACTION: TERM_NORMALIZE
- ko BEFORE: '쿠폰을 선택하세요'
- ko AFTER: '쿠폰을 선택해 주세요'

### CO-008 — checkout.discount.discount_code
PROBLEM: 띄어쓰기 통일
ACTION: TERM_NORMALIZE
- ko BEFORE: '할인코드'
- ko AFTER: '할인 코드'

### CO-009 — checkout.discount.discount_code_placeholder
PROBLEM: 띄어쓰기 + '~하세요'→'~해 주세요'
ACTION: TERM_NORMALIZE
- ko BEFORE: '할인코드를 입력하세요'
- ko AFTER: '할인 코드를 입력해 주세요'

### CO-010 — checkout.validation.password_min
PROBLEM: '4자리' → '4자'(글자 수 표준 표기)
ACTION: TERM_NORMALIZE
- ko BEFORE: '4자리 이상 입력해 주세요'
- ko AFTER: '4자 이상 입력해 주세요'

### CO-011 — checkout.mileage.title
PROBLEM: '적립금' → G7 공식 용어 '마일리지'
ACTION: TERM_NORMALIZE
- ko BEFORE: '적립금'
- ko AFTER: '마일리지'

### CO-012 — checkout.mileage.available
PROBLEM: '적립금'→'마일리지'
ACTION: TERM_NORMALIZE
- ko BEFORE: '보유 적립금'
- ko AFTER: '보유 마일리지'

### CO-013 — checkout.mileage.input_placeholder
PROBLEM: '적립금'→'마일리지'
ACTION: TERM_NORMALIZE
- ko BEFORE: '사용할 적립금'
- ko AFTER: '사용할 마일리지'

### CO-014 — checkout.summary.points_used
PROBLEM: '적립금'→'마일리지'
ACTION: TERM_NORMALIZE
- ko BEFORE: '적립금 사용'
- ko AFTER: '마일리지 사용'

### CO-015 — checkout.summary.subtotal
PROBLEM: '상품금액'→'상품 금액'(glossary, 띄어쓰기)
ACTION: TERM_NORMALIZE
- ko BEFORE: '상품금액'
- ko AFTER: '상품 금액'

### CO-016 — order_complete.subtitle
PROBLEM: title '주문이 접수되었습니다'와 내용 중복 — 페이지에서 확인할 것을 안내
ACTION: REWRITE
- ko BEFORE: '주문이 정상적으로 접수되었습니다.'
- ko AFTER: '아래에서 주문 내역과 입금 안내를 확인해 주세요.'
- en BEFORE: 'Your order has been received.'
- en AFTER: 'Check your order details and deposit information below.'

### CO-017 — order_complete.guest_notice_lookup
PROBLEM: 비회원 문구에 '가입하신 휴대폰' — 회원가입 용어 혼용
ACTION: REWRITE
- ko BEFORE: '주문번호와 가입하신 휴대폰, 조회 비밀번호로 비회원 주문 조회 페이지에서 다시 확인할 수 있습니다.'
- ko AFTER: '주문번호와 주문 시 입력한 휴대폰 번호, 조회 비밀번호로 비회원 주문 조회 페이지에서 다시 확인할 수 있습니다.'
- en BEFORE: 'Look up this order anytime with the order number, your phone, and the lookup password.'
- en AFTER: 'Look up this order anytime with the order number, the phone number used at checkout, and the lookup password.'

### CO-018 — checkout.guest_password.hint
PROBLEM: '가입 시 비밀번호와 다릅니다' — 비회원 맥락에서 회원가입 용어 혼용
ACTION: REWRITE
- ko BEFORE: '주문 조회 시 사용할 비밀번호입니다. 가입 시 비밀번호와 다릅니다.'
- ko AFTER: '주문 조회 시 사용할 비밀번호입니다. 회원 비밀번호와 별도로 사용하는 비밀번호입니다.'
- en BEFORE: 'Used to look up this order later. Different from your member password.'
- en AFTER: 'Used to look up this order later. This password is separate from your member password.'

### CO-019 — guest_order_form.notice
PROBLEM: '다시 조회하셔야 합니다' 번역투 어미 + 문장 구조 정리(ko/en 사실 동일 유지)
ACTION: REWRITE
- ko BEFORE: '조회 후 주문 상세에서 30분간 주문 조회/배송지 변경이 가능합니다. 30분이 지나면 다시 조회하셔야 합니다.'
- ko AFTER: '조회 후 30분 동안 주문 상세에서 주문 조회와 배송지 변경이 가능합니다. 30분이 지나면 다시 조회해 주세요.'
- en BEFORE: 'After lookup, you have 30 minutes to view the order or change the shipping address.'
- en AFTER: 'After lookup, you have 30 minutes to view the order or change the shipping address. After that, look up the order again.'

### CO-020 — guest_order_show.subtitle
PROBLEM: 정적 페이지 부제 진행형 — 사용자 행동 안내로
ACTION: REWRITE
- ko BEFORE: '주문 내역을 다시 확인하고 있습니다.'
- ko AFTER: '주문 내역을 확인해 주세요.'
- en BEFORE: 'Re-viewing your order.'
- en AFTER: 'Check your order details.'


## Auth

### AUTH-001 — auth.register.has_account
PROBLEM: '계정'→'회원'(glossary Member). login 측 already_member와 동일 의문 통일
ACTION: TERM_NORMALIZE
- ko BEFORE: '이미 계정이 있으신가요?'
- ko AFTER: '이미 회원이신가요?'
- en BEFORE: 'Already have an account?'
- en AFTER: 'Already a member?'

### AUTH-002 — auth.already_member
PROBLEM: layout/component 미참조 dead key (register.has_account와 중복)
ACTION: REMOVE
- ko BEFORE: '이미 회원이신가요?'
- ko AFTER: (삭제)

### AUTH-003 — auth.login_form.no_account
PROBLEM: layout/component 미참조 dead key
ACTION: REMOVE
- ko BEFORE: '계정이 없으신가요?'
- ko AFTER: (삭제)

### AUTH-004 — auth.reset_password.submit
PROBLEM: 페이지 '비밀번호 재설정'인데 버튼 '비밀번호 변경' — 용어 통일
ACTION: TERM_NORMALIZE
- ko BEFORE: '비밀번호 변경'
- ko AFTER: '비밀번호 재설정'
- en BEFORE: 'Change password'
- en AFTER: 'Reset password'

### AUTH-005 — auth.reset_password.processing
PROBLEM: '변경 중...' — 재설정 용어 + ellipsis 통일
ACTION: TERM_NORMALIZE
- ko BEFORE: '변경 중...'
- ko AFTER: '재설정 중…'
- en BEFORE: 'Updating...'
- en AFTER: 'Resetting…'

### AUTH-006 — auth.reset_password.success
PROBLEM: '변경되었습니다' → 재설정 용어 통일
ACTION: TERM_NORMALIZE
- ko BEFORE: '비밀번호가 변경되었습니다.'
- ko AFTER: '비밀번호가 재설정되었습니다.'
- en BEFORE: 'Your password has been changed.'
- en AFTER: 'Your password has been reset.'

### AUTH-007 — auth.login_form.processing
PROBLEM: ellipsis '...' → '…' 전체 통일
ACTION: TERM_NORMALIZE
- ko BEFORE: '로그인 중...'
- ko AFTER: '로그인 중…'
- en BEFORE: 'Signing in...'
- en AFTER: 'Logging in…'

### AUTH-008 — auth.register.processing
PROBLEM: ellipsis 통일 (약관/개인정보 모달 로딩 상태 재사용 키)
ACTION: TERM_NORMALIZE
- ko BEFORE: '가입 중...'
- ko AFTER: '가입 중…'
- en BEFORE: 'Creating account...'
- en AFTER: 'Signing up…'

### AUTH-009 — auth.forgot_password.processing
PROBLEM: ellipsis 통일
ACTION: TERM_NORMALIZE
- ko BEFORE: '전송 중...'
- ko AFTER: '전송 중…'
- en BEFORE: 'Sending...'
- en AFTER: 'Sending…'


## MyPage

### MYP-001 — mypage.tabs.orders
PROBLEM: '주문내역' → '주문 내역' 띄어쓰기 통일
ACTION: TERM_NORMALIZE
- ko BEFORE: '주문내역'
- ko AFTER: '주문 내역'

### MYP-002 — routes.mypage_orders
PROBLEM: '주문내역' → '주문 내역' 띄어쓰기 통일
ACTION: TERM_NORMALIZE
- ko BEFORE: '주문내역 — 마이페이지'
- ko AFTER: '주문 내역 — 마이페이지'

### MYP-003 — mypage.orders.phone
PROBLEM: en 'Contact' vs addresses.phone 'Phone' — 용어 통일
ACTION: TERM_NORMALIZE
- en BEFORE: 'Contact'
- en AFTER: 'Phone'

### MYP-004 — mypage.orders.cancel_confirm_body
PROBLEM: confirm 본문 평서문('이 주문을 취소합니다.') — 의문형으로
ACTION: REWRITE
- ko BEFORE: '취소한 주문은 되돌릴 수 없습니다. 이 주문을 취소합니다.'
- ko AFTER: '주문을 취소하면 되돌릴 수 없습니다. 취소하시겠어요?'
- en BEFORE: 'A cancelled order cannot be restored. This order will be cancelled.'
- en AFTER: 'This order cannot be restored after cancellation. Cancel it?'


## Demo

### DEMO-001 — business.demo_notice
PROBLEM: 데모 안내에 developer 경로(config/business-info.json) 노출 — rule 28 분리. 데모 라인은 유지
ACTION: DEMO_ONLY
- ko BEFORE: '데모 스토어입니다. 사업자 정보는 템플릿 config/business-info.json에서 설정할 수 있습니다.'
- ko AFTER: '데모 스토어입니다.'
- en BEFORE: "Demo store. Business information can be configured in the template's config/business-info.json."
- en AFTER: 'Demo store.'


## Nav

### NAV-001 — nav.cart
PROBLEM: nav 라벨 하드코딩 영문 → lang 키 연결. ko locale 기능 UI 한국어
ACTION: I18N_FIX
- ko BEFORE: 'Cart'
- ko AFTER: '장바구니'

### NAV-002 — nav.story
PROBLEM: 동일
ACTION: I18N_FIX
- ko BEFORE: 'Story'
- ko AFTER: '스토리'

### NAV-003 — nav.notice
PROBLEM: 동일
ACTION: I18N_FIX
- ko BEFORE: 'Notice'
- ko AFTER: '공지사항'

### NAV-004 — nav.shop
PROBLEM: 동일 (Shop은 매장 섹션명으로 유지 — 사용자 확정 카피 'Shop 둘러보기'와 정합)
ACTION: I18N_FIX


## Meta

### META-001 — routes.cart.title
PROBLEM: ko locale meta title 영문
ACTION: I18N_FIX
- ko BEFORE: 'Cart — Still Form'
- ko AFTER: '장바구니 — Still Form'

### META-002 — routes.checkout.title
PROBLEM: 동일
ACTION: I18N_FIX
- ko BEFORE: 'Checkout — Still Form'
- ko AFTER: '주문/결제 — Still Form'

### META-003 — routes.story.title
PROBLEM: 동일
ACTION: I18N_FIX
- ko BEFORE: 'Story — Still Form'
- ko AFTER: '스토리 — Still Form'

### META-004 — routes.notice.title
PROBLEM: 동일
ACTION: I18N_FIX
- ko BEFORE: 'Notice — Still Form'
- ko AFTER: '공지사항 — Still Form'

### META-005 — routes.category.title
PROBLEM: 동일
ACTION: I18N_FIX
- ko BEFORE: 'Category — Still Form'
- ko AFTER: '카테고리 — Still Form'

### META-006 — routes.product.title
PROBLEM: 동일
ACTION: I18N_FIX
- ko BEFORE: 'Product — Still Form'
- ko AFTER: '상품 — Still Form'


## Component / Layout 변경


### Component (src/components)

### COMP-001 — CrossSellStrip.tsx eyebrow fallback
- BEFORE: YOU MAY ALSO LIKE
- AFTER: RELATED
- REASON: lang(cart.cross_sell.eyebrow)과 동일 termino로 fallback 정렬 (rule 57)

### COMP-002 — CartSummary.tsx subtotalLabel fallback
- BEFORE: 소계
- AFTER: 상품 금액
- REASON: glossary 통일

### COMP-003 — CheckoutForm.tsx subtotalLabel fallback
- BEFORE: 상품금액
- AFTER: 상품 금액
- REASON: 띄어쓰기 통일

### COMP-004 — CheckoutForm.tsx emptyMethodsMessage fallback
- BEFORE: 관리자에서 결제 설정을 확인해 주세요.
- AFTER: 사용 가능한 결제 수단이 없습니다.
- REASON: 개발자 문구 고객 화면 노출 제거 (rule 28)

### COMP-005 — CheckoutPage.tsx emptyTempOrderTitle fallback
- BEFORE: 주문 정보를 만들 수 없습니다
- AFTER: 주문을 진행할 수 없습니다
- REASON: 시스템 어투 제거 (rule 15)

### COMP-006 — OrderCompletePage.tsx successMessage fallback
- BEFORE: 주문이 정상적으로 접수되었습니다.
- AFTER: 아래에서 주문 내역과 입금 안내를 확인해 주세요.
- REASON: title 중복 제거 + lang 정렬

### COMP-007 — OrderCompletePage.tsx guest notice fallback
- BEFORE: 주문번호와 가입하신 휴대폰, …
- AFTER: 주문번호와 주문 시 입력한 휴대폰 번호, …
- REASON: 비회원 문구 '가입하신' 제거 (rule 16)

### COMP-008 — CartItemRow.tsx deleteConfirmMessage fallback
- BEFORE: 선택한 상품을 장바구니에서 삭제합니다.
- AFTER: 선택한 상품을 장바구니에서 삭제하시겠어요?
- REASON: confirm 의문형 (rule 14)

### COMP-009 — CheckoutForm.tsx 라벨 defaults 11건
- BEFORE: 할인코드/쿠폰을 선택하세요/적립금(4건)/휴대폰번호/현금영수증카드/기본 주소/입력한 배송지를 저장합니다
- AFTER: 할인 코드/쿠폰을 선택해 주세요/마일리지(4건)/휴대폰 번호/현금영수증 카드/도로명 주소/배송지 저장
- REASON: lang 미연결 라벨의 live 소스 = component defaults → glossary 정렬 (rule 57)

### COMP-010 — ProductQna.tsx 삭제 confirm
- BEFORE: 이 문의를 삭제하시겠습니까?
- AFTER: 이 문의를 삭제하시겠어요?
- REASON: confirm 톤 통일

### COMP-011 — PurchasePanel.tsx 옵션 안내 2건
- BEFORE: 추가 옵션을 선택하세요 / 상위 옵션을 먼저 선택하세요
- AFTER: 추가 옵션을 선택해 주세요 / 상위 옵션을 먼저 선택해 주세요
- REASON: tone 통일 (rule 12)

### COMP-012 — CheckoutForm.tsx depositDueSuffix 신설 prop
- BEFORE: inline ` (입금 기한 ${days}일)` 하드코딩(en locale 누수)
- AFTER: depositDueSuffixLabel prop ← lang checkout.payment.deposit_due 연결
- REASON: en locale 한국어 누출 제거 + ko/en pair 확보 (rule 33/51)

### COMP-013 — StoreHeader.tsx / StoreFooter.tsx nav labels
- BEFORE: 하드코딩 영문 'Shop/Story/Notice/Cart'
- AFTER: shopLabel/storyLabel/noticeLabel/cartLabel prop ← lang superbify.nav.* 연결 (_user_base.json)
- REASON: nav가 functional UI라 ko locale 한국어 (rule 8/33). lang nav.* dead key 해소


### Layout (layouts)

### LAYOUT-001 — layouts/shop/category.json shop_category_count
- BEFORE: {{count}} + ' items' 하드코딩
- AFTER: $t:superbify.category.count_label:{{…length}}
- REASON: ko 키 미사용 + 영문 하드코딩 제거 (I18N_FIX)

### LAYOUT-002 — layouts/home.json·shop/index.json emptyMessage
- BEFORE: $t:superbify.shop.empty_message (관리자 문구)
- AFTER: prop 제거 (key 삭제)
- REASON: rule 26/28

### LAYOUT-003 — layouts/shop/notice.json emptyMessage
- BEFORE: $t:superbify.notice.empty_message (데모/관리자 문구)
- AFTER: prop 제거 (key 삭제)
- REASON: rule 26/28

### LAYOUT-004 — layouts/_user_base.json
- BEFORE: StoreHeader/Footer nav 라벨 미전달
- AFTER: shopLabel/storyLabel/noticeLabel/cartLabel $t 연결
- REASON: NAV-001~004
