# Still Form 템플릿 카피 전수 조사 (COPY INVENTORY)

> 대상: `templates/_bundled/superbify-commerce_minimal` (Still Form)
> 조사 범위: lang/ko·en.json 전체, layouts/** 전체, src/components 하드코딩, fixtures/데모 콘텐츠, template.json, config/business-info.json
> 수집 항목 총 1341건, 어색 카피 flag 77건

## 어색 카피 flag 요약

| # | 영역 | 위치 | 카피 (ko) | 문제 |
|---|------|------|-----------|------|
| 1 | home-base | layouts/partials/auth/_modal_terms.json:L35 | $t:superbify.auth.register.processing | register form 의 'processing' 키를 약관 모달 로딩 상태로 재사용 — 컨텍스트 불일치. 약관 모달은 가입 절차가 아니므로 '처리 중' 류 문구가 어색할 수 있음 |
| 2 | home-base | layouts/partials/auth/_modal_terms.json:L49 (published_at inline template '$t:superbify.policy.published_at: {{termsContent?.data?.published_at \| date}}') | $t:superbify.policy.published_at: {{termsContent?.data?.published_at \| date}} | 라벨 키 'published_at' 을 slug 그대로 보간 — 사용자 노출 문구 안에 영문 key 이름이 그대로 들어가는 형태. ko/en 키 명명 일관성 확인 필요 |
| 3 | home-base | layouts/partials/auth/_modal_privacy.json:L35 | $t:superbify.auth.register.processing | register form 의 'processing' 키를 개인정보처리방침 모달 로딩 상태로 재사용 — 컨텍스트 불일치. 정책 모달은 가입 절차가 아니므로 '처리 중' 류 문구가 어색할 수 있음 |
| 4 | home-base | layouts/partials/auth/_modal_privacy.json:L49 (published_at inline template '$t:superbify.policy.published_at: {{privacyContent?.data?.published_at \| date}}') | $t:superbify.policy.published_at: {{privacyContent?.data?.published_at \| date}} | 라벨 키 'published_at' 을 slug 그대로 보간 — 사용자 노출 문구 안에 영문 key 이름이 그대로 들어가는 형태. ko/en 키 명명 일관성 확인 필요 |
| 5 | lang-2 | lang/ko.json:392 | —(none) | text_ko 누락 — 파일(ko.json:392) 실제값은 'LIFESTYLE' |
| 6 | lang-2b | lang/ko.json:430 / en.json:430 | 사용 전 부드러운 천으로 가볍게 닦아 주세요. 강한 세제나 연마제는 사용하지 마시고, 필요할 때 부드러운 행주로 관리해 주세요. | 한 ko 문장에서 '사용 전'과 '필요할 때' 두 번 부드러운 천/행주를 반복 지시해 살짝 번역투·중복감이 있음 |
| 7 | lang-2b | lang/ko.json:433 / en.json:433 | 담기 | ko '담기'가 cart.add_to_cart '장바구니 담기'와 같은 동작인데 한 단어로 짧아 톤/의도 차이 모호 |
| 8 | lang-2b | lang/ko.json:496 / en.json:496 | 변경 | ko '변경'이 수량 변경 컨텍스트에서는 의미 통하지만 단독 라벨로 톤이 명령조에 가까움 |
| 9 | lang-2b | lang/ko.json:499 / en.json:499 | 선택한 상품을 장바구니에서 삭제합니다. | ko single/multiple 카피가 동일 문장으로 단/복수 구분 없음 — 영문은 구분되지만 한국어는 '상품/상품들' 등 표기 통일 필요 |
| 10 | lang-3 | lang/ko.json:502 | Checkout | ko 값이 영문 'Checkout' 그대로 — 한국어 화면 영문 노출 |
| 11 | lang-3 | lang/ko.json:508 | YOU MAY ALSO LIKE | 번역투 — 영문 식 eyebrow를 한국어 화면에 그대로 노출 |
| 12 | lang-3 | lang/ko.json:546 | 주문 정보를 만들 수 없습니다 | 시스템 어투 — 사용자에게 보이는 오류 제목인데 내부 동작('생성') 기준 서술 |
| 13 | lang-3 | lang/ko.json:565 | 주문 조회 시 사용할 비밀번호입니다. 가입 시 비밀번호와 다릅니다. | 비회원 주문 문구에 '가입 시 비밀번호' — 회원가입 용어 혼용으로 비회원에게 위화감 |
| 14 | lang-3 | lang/ko.json:576 | 기본 주소 | ko '기본 주소' vs en 'Street address' — 의미 어긋남 |
| 15 | lang-3 | lang/ko.json:584 | 입력한 배송지를 저장합니다 | 체크박스 라벨인데 평서문 종결 — en 'Save this address' 명령형과 불일치 |
| 16 | lang-3 | lang/ko.json:609 | 직접 입금 기한 이후에는 주문이 자동 취소됩니다. | 번역투 — '직접 입금' 표현이 가상계좌(vbank) 컨텍스트와 미스매치, en에 없는 '직접' 추가 |
| 17 | lang-3 | lang/ko.json:618 | 휴대폰번호 | 띄어쓰기 — '휴대폰번호' vs 동일 페이지 '휴대폰 번호' 혼용 |
| 18 | lang-3 | lang/ko.json:619 | 현금영수증카드 | 띄어쓰기 — '현금영수증카드' 자연스러운 표기 아님 |
| 19 | lang-3 | lang/ko.json:628 | 상품금액 | 용어 불일치 — CartSummary는 '소계', checkout summary는 '상품금액' |
| 20 | lang-3 | lang/ko.json:644 | 4자리 이상 입력해 주세요 | ko '4자리' vs en '4 characters' — 자릿수/글자수 표현 차이(숫자+영문 혼용 가능성) |
| 21 | lang-3 | lang/ko.json:647 | 주문/결제 | ko '주문/결제' vs 영문 'Checkout' — ko에는 '결제' title(543)과 '주문/결제' page_title 공존 |
| 22 | lang-3 | lang/ko.json:659 | 개 보유 | 어순 — 수량 뒤에 결합되는 접미어로 단독 노출 시 '개 보유' 어색 |
| 23 | lang-3 | lang/ko.json:661 | 쿠폰을 선택하세요 | 톤 — 동일 페이지 select_method는 '~해 주세요'인데 여기는 '~하세요' 혼용 |
| 24 | lang-3 | lang/ko.json:663 | 할인코드를 입력하세요 | 톤 — '~하세요' vs 페이지 전반 '~해 주세요' 혼용 |
| 25 | lang-3 | lang/ko.json:682 | 주문이 정상적으로 접수되었습니다. | title과 subtitle 내용 중복 — '접수되었습니다' 반복 |
| 26 | lang-3 | lang/ko.json:693 | 주문번호와 가입하신 휴대폰, 조회 비밀번호로 비회원 주문 조회 페이지에서 다시 확인할 수 있습니다. | 비회원 주문 문구에 '가입하신 휴대폰' — 회원가입 용어 혼용, 또한 ko만 휴대폰 명시(주문자 휴대폰) |
| 27 | lang-3 | lang/ko.json:714 | 조회 후 주문 상세에서 30분간 주문 조회/배송지 변경이 가능합니다. 30분이 지나면 다시 조회하셔야 합니다. | ko만 두 번째 문장(제한 안내) 추가 — en에 없는 정보, '조회하셔야 합니다' 번역투 어미 |
| 28 | lang-3 | lang/ko.json:718 | 주문 내역을 다시 확인하고 있습니다. | 정적 페이지 부제인데 진행형 어미 — en 'Re-viewing'도 어색(영문 자체 번역투) |
| 29 | shop | layouts/shop/category.json:80 (shop_category_count) | + ' items' (영문 하드코딩, ko 카피 부재) | 하드코딩 영문 + 미사용 ko 키 — ko.json의 category.count_label '{{count}}개 상품'이 정의되어 있으나 category.json:80에서 '+ ' items'' 영문 리터럴이 그대로 노출됨 |
| 30 | shop | layouts/cart.json:86 (cart_page_eyebrow) | SHOPPING BAG | 번역투 — 영문 식 eyebrow 'SHOPPING BAG'를 한국어 화면에 그대로 노출 |
| 31 | shop | layouts/cart.json:161 (CartItemRow.deleteConfirmMessage) | 선택한 상품을 장바구니에서 삭제합니다. | 확인 모달 메시지인데 평서문 종결 — 의문형/경고 톤 부재 |
| 32 | shop | layouts/cart.json:173 (CrossSellStrip.eyebrow) | YOU MAY ALSO LIKE | 번역투 — 영문 식 eyebrow를 한국어 화면에 그대로 노출 |
| 33 | shop | layouts/shop/checkout.json:97 (CheckoutPage.saveAddressLabel) | 입력한 배송지를 저장합니다 | 체크박스 라벨인데 평서문 종결 — 라벨/체크 항목 톤과 불일치 |
| 34 | shop | layouts/shop/checkout.json:104 (CheckoutPage.couponCountSuffixLabel) | 개 보유 | 단독 노출 시 '개 보유' 어순이 어색 — 수량 단위와 결합되어야 자연스러움 |
| 35 | shop | layouts/shop/checkout.json:121 (CheckoutPage.vbankHelperLabel) | 직접 입금 기한 이후에는 주문이 자동 취소됩니다. | 번역투 — 영문 helper 직역, '직접 입금' 표현이 '가상계좌'와 의미상 미스매치 |
| 36 | shop | layouts/shop/guest_order_show.json:58 (OrderCompletePage.successMessage) | 주문 내역을 다시 확인하고 있습니다. | 정적 페이지 부제인데 진행형 어미('~있습니다') 사용 — 페이지 상태 묘사와 불일치 |
| 37 | auth | layouts/auth/login.json 미사용 — lang.json 정의만 | 이미 회원이신가요? | lang.json에 정의되었으나 login.json에서 미참조(register.has_account와 동일 의문에 회원/계정 혼용 가능성) |
| 38 | auth | layouts/auth/_login_form.json (lang 키 미참조; login.json 하단 "register_link" A만 노출) | 계정이 없으신가요? | lang.json에 정의되었으나 login.json에서 미참조(register.has_account와 동일 의문에 회원/계정 혼용 가능성) |
| 39 | auth | layouts/auth/register.json slots.content[0].children[0].children[1].children[0].children[0].children[2].children[0].text | 이미 계정이 있으신가요? | 동일 의문(login/register 간)에 회원/계정 혼용 — register 노출 라벨 |
| 40 | auth | layouts/auth/forgot_password.json slots.content[0].children[0].children[0].children[1].children[2].text | 재설정 링크 보내기 | 용어 일관성: 같은 페이지 title "비밀번호 찾기"지만 submit은 "재설정 링크 보내기"로 표현 분리 |
| 41 | auth | layouts/auth/reset_password.json slots.content[0].children[0].children[0].children[1].children[2].children[2].text | 비밀번호 변경 | 영문은 "Reset password"이지만 ko submit/processing은 "비밀번호 변경"/"변경 중..."으로 같은 페이지 title "비밀번호 재설정"과 다름 |
| 42 | auth | layouts/partials/auth/_register_form.json email/password_confirm/name Label 자식 Span (red asterisk) | * | 표시 마커 — 시각 글리프로 사용자에게 노출되는 asterisk(*) 마커. 코드성 prop은 아니나 마크업 요소의 자식 텍스트이므로 수집. |
| 43 | auth | layouts/auth/reset_password.json data_sources[0].label_key | 비밀번호 재설정 토큰 검증 | 사용자 노출 가능성 낮음(dataSource label_key), 그러나 inventory 보존 목적 수집 |
| 44 | mypage | layouts/partials/mypage/_tabs.json:72 | 주문내역 | term inconsistency: '주문내역'(tabs.orders, meta title)과 '주문 내역'(orders.empty)의 띄어쓰기 불일치 — 동일 페이지 mypage-orders 내 발생 |
| 45 | mypage | layouts/partials/mypage/orders/_list.json:272 | 주문 내역이 없습니다. | term inconsistency: '주문 내역'(orders.empty)과 '주문내역'(tabs.orders)의 띄어쓰기 불일치 |
| 46 | mypage | layouts/partials/mypage/orders/_shipping.json:49 | 받는 분 | term inconsistency: 'orders.recipient'(받는 분)과 'addresses.recipient'(받는 분) 중복 키 — 같은 의미 두 곳에 노출 |
| 47 | mypage | layouts/partials/mypage/orders/_shipping.json:81 | 연락처 | term inconsistency: 'orders.phone' 영문 'Contact' vs 'addresses.phone' 영문 'Phone' — 같은 '연락처' 의미인데 영문 표기가 다름 |
| 48 | mypage | layouts/partials/mypage/orders/_modal_cancel.json:147 | 취소한 주문은 되돌릴 수 없습니다. 이 주문을 취소합니다. | 번역투 의심: 'A cancelled order cannot be restored. This order will be cancelled.' 직역체. 영문 구조 단편적/반복. 한국어는 '취소한 주문은 되돌릴 수 없습니다. 이 주문을 취소합니다.'로 의미 전달은 되지만 영문 패턴이 어색해 카피 일관성 측면에서 재검토 대상 |
| 49 | mypage | layouts/partials/mypage/addresses/_modal_address.json:103 | 받는 분 | term inconsistency: 'addresses.recipient'(받는 분)과 'orders.recipient'(받는 분) 중복 키 — 같은 의미 두 곳에 노출 |
| 50 | mypage | layouts/partials/mypage/addresses/_modal_address.json:144 | 연락처 | term inconsistency: 'addresses.phone' 영문 'Phone' vs 'orders.phone' 영문 'Contact' — 같은 '연락처' 의미인데 영문 표기가 다름 |
| 51 | mypage | layouts/partials/mypage/coupons/_list.json:272 | 다운로드 가능한 쿠폰이 없습니다. | 번역투 의심: 'No coupons to download right now.' 직역. 'right now' 부사 불필요 가능 — 한국 카피 '다운로드 가능한 쿠폰이 없습니다.'는 자연스러우나 영문 보조구 right now는 어색 |
| 52 | mypage | layouts/partials/mypage/orders/_modal_cancel.json:149 | 취소 | term inconsistency: cart.delete_cancel(취소)을 orders._modal_cancel confirm dialog의 cancelLabel로 재사용 — cart 영역 키를 mypage에 재사용 |
| 53 | mypage | layouts/mypage/orders.json:11 | 주문내역 — 마이페이지 | term inconsistency: routes.mypage_orders 메타 타이틀의 '주문내역'은 tabs.orders와 동일하지만, 같은 페이지의 orders.empty는 '주문 내역'(띄어쓰기)을 사용 — 동일 페이지 mypage-orders 내 일관성 위화감 |
| 54 | policy | config/business-info.json (policies.shippingReturns.sections[1]) | 상품 수령 후 7일 이내에 미사용 상품에 한하여 교환·반품을 요청할 수 있습니다. 상품 수령일 이전에 구매의사를 철회하는 경우에도 7일 이내에 취소를 요청할 수 있습니다. | 시간 기산점 모호 — 동일 문장에서 "수령 후 7일 이내"와 "수령일 이전 7일 이내"가 같은 "7일"을 서로 다른 기준일로 사용 |
| 55 | policy | config/business-info.json (policies.shippingReturns.sections[3]) | 운영 전 실제 이용약관/개인정보처리방침 작성 및 법적 검토가 필요합니다. | 내용-문맥 불일치 — 배송·교환·반품 정책의 마감 문단인데 "이용약관/개인정보처리방침 작성 및 법적 검토"만 언급, 배송 관련 내용은 없음 |
| 56 | components-shop | CheckoutForm.tsx:500 | 상품금액 | CartSummary는 '소계', CheckoutForm은 '상품금액'. 동일 위치(상품 합계) 다른 용어 |
| 57 | components-shop | CheckoutForm.tsx:515 | 관리자에서 결제 설정을 확인해 주세요. | 번역투 - 직역된 '~을/를 확인해 주세요' 톤이 관리자 안내로 부자연스러움 |
| 58 | components-shop | CrossSellStrip.tsx:24 | YOU MAY ALSO LIKE | 영문 리터럴이 그대로 노출됨 - 한국어 페이지에서 부자연스러움 |
| 59 | components-brand | lang/ko.json:382 / lang/en.json:382 — home.story.heading | 오래 쓸수록 익어지는 것들 | 동사 주체 행위성 — ko 헤딩 '오래 쓸수록 익어지는 것들'이 '쓰는 사람' 행위를 암시하여 '조용한 일상의 물건들' 브랜드 톤(차분/관찰)과 미세 어긋남. 다만 store.body / editorial.body / final_cta.body / story.body 등에서 동일 모티프 반복 사용으로 브랜드 보이스 자체는 OK |
| 60 | components-brand | lang/ko.json:383 / lang/en.json:383 — home.story.body | Still Form은 시간이 지나도 변하지 않는 사물을 모은 자리입니다. 목재, 리넨, 도자기 — 손에 닿는 재질이 스스로 말을 거는 물건을 골라 천천히 소개합니다. 화려함보다 차분함, 새것보다 익은 것을 우선합니다. | 동사 시제 혼재 — '모은/소개합니다/우선합니다' 일부 과거·현재 시제 섞임. 톤 자체는 OK이나 브랜드 보이스(현재 시제)와 미세 차이 |
| 61 | components-brand | lang/ko.json:394 / lang/en.json:394 | 책꽂이 위에 머무는 단행본 한 권처럼, 일상에 한 점 더해지는 물건을 소개합니다. | ko/en 의미 1:1 매칭 약함 — en 'one piece at a time'은 물건 단위 일반 표현, ko '오늘의 한 권'은 책 단위(책 한 권/표지) 종속 어휘 |
| 62 | components-brand | src/components/StoreFooter.tsx:104 (default) / lang superbify footer 카피 없음 — 기본값 노출 | © 2026 Still Form — demo store built on Gnuboard 7 | 데모 명시 저작권 — 'demo store built on Gnuboard 7' 영문 단일 표기, 데모 템플릿 정체성 노출 |
| 63 | components-brand | lang/ko.json:530 / lang/en.json:530 | 데모 스토어입니다. 사업자 정보는 템플릿 config/business-info.json에서 설정할 수 있습니다. | 데모 안내문 — 사업자 정보 미설정 시 노출되는 시안 문구 |
| 64 | components-brand | lang/ko.json:539 / lang/en.json:539 | 본 문서는 템플릿 시안 문구입니다. 실제 운영 전 사업자 상황에 맞는 약관 작성 및 법적 검토가 필요합니다. | 정책 시안 문구 — 운영 전 법적 검토 필요 안내 문구 (의도적 시안 표기) |
| 65 | components-brand | lang/ko.json:465 / lang/en.json:465 | 데모용 템플릿입니다. 실제 공지사항 데이터는 관리자에서 추가할 수 있습니다. | 데모 명시 — 시안/운영 전 안내 문구 |
| 66 | components-brand | lang/ko.json:407 / lang/en.json:407 | 관리자에서 상품을 등록하면 이 자리에 표시됩니다. | 데모 명시 — 시안/운영 전 안내 문구 |
| 67 | components-brand | src/components/CategoryNav.tsx:171 (하드코딩, en 문맥) | (no categories) | CategoryNav.tsx의 '(no categories)' 하드코딩 — lang 매핑 없이 영문 단일 표기 |
| 68 | components-brand | lang/ko.json:515 / lang/en.json:515 | demo | 데모 식별자 — 시안 표시 |
| 69 | components-brand | src/components/fixtures/categories.json:59-62 | 데스크 액세서리 | 데모 카테고리명 ko/en 표현 차이 — ko '데스크 액세서리' vs en 'Desk' 단일 단어 |
| 70 | components-brand | src/components/fixtures/products.json:7-9 | 머그컵 | 데모 상품명 — 시안 식별 |
| 71 | components-brand | template.json:11 | 미니멀 D2C 데모 스토어용 사용자 템플릿 (sirsoft-ecommerce 기반) | meta description — 데모 템플릿 정체성 명시 |
| 72 | components-brand | lang/ko.json:12 / lang/en.json:12 | 일상의 한 자리에 머무는 사물을 모은 자리. | base_layout_description (영문 단일, ko 미번역) |
| 73 | components-brand | lang/ko.json:532 / lang/en.json:532 | 이용약관 | 푸터 정책 링크 라벨 (StoreFooter.tsx default fallback 동일) |
| 74 | components-brand | lang/ko.json:113 / lang/en.json:113 | 로그인이 필요합니다 | errors.unauthorized_title 등 |
| 75 | components-brand | src/components/NoticeList.tsx:62 (default 'No notices yet') | No notices yet | NoticeList의 'No notices yet'은 en.json NoticeList default 와 lang.notice.empty_title 중복이지만 동일 — OK |
| 76 | components-brand | src/components/StoreHeader.tsx:198, 209 (aria-label `${brandName} Home`, alt={brandName}) | {brandName} Home | sr-only 라벨/aria 문자열 — 시각 미노출, a11y 트리 전용 |
| 77 | components-brand | src/components/StoreHeader.tsx:210-211 (SrOnly brandName/tagline) | {brandName} {tagline} | sr-only brand/tagline 텍스트 노출 (시각 X, a11y 트리 전용, 동적 보간) |

## 어색 카피 유형별 정리

여러 영역에서 반복되는 문제를 유형으로 묶으면 7가지.

1. **영문 그대로 한국어 화면 노출** — `SHOPPING BAG`(cart eyebrow), `YOU MAY ALSO LIKE`(cross-sell eyebrow 3곳: cart layout, lang, CrossSellStrip), `Checkout`(cart.checkout_title), `Brand Story`(home hero secondary CTA), `+ ' items'`(category.json 하드코딩 — ko 키 `category.count_label` 존재하는데 미사용), `LIFESTYLE` 등. eyebrow류는 의도적 영문 유지 가능하나 ko/en 혼용 기준을 한번 정할 필요.
2. **용어 불일치** — `주문내역`/`주문 내역`(띄어쓰기), `소계`(CartSummary) vs `상품금액`(CheckoutForm·checkout summary), `담기`(quick add) vs `장바구니 담기`, `연락처`의 영문 `Contact` vs `Phone`, `회원`/`계정`(로그인·회원가입 의문문), `비밀번호 재설정` vs `비밀번호 변경`(reset_password 페이지 내 혼용), `받는 분` 키 중복(orders.recipient / addresses.recipient / checkout.shipping.recipient_name).
3. **번역투 / 직역체** — `직접 입금 기한 이후에는…`(vbank_helper — '직접 입금'이 가상계좌와 미스매치), `취소한 주문은 되돌릴 수 없습니다. 이 주문을 취소합니다.`, `다운로드 가능한 쿠폰이 없습니다.`, 비회원 문구의 `가입하신 휴대폰`/`가입 시 비밀번호`(회원가입 용어 혼용), `기본 주소`(en은 Street address), `주문 정보를 만들 수 없습니다`(시스템 어투).
4. **종결 어미/톤 혼용** — 체크박스 라벨 `입력한 배송지를 저장합니다`(평서문), 확인 모달 `선택한 상품을 장바구니에서 삭제합니다.`(평서문 종결), 페이지 부제 `주문 내역을 다시 확인하고 있습니다.`(진행형), `~하세요`(discount.select_placeholder 등) vs `~해 주세요`(checkout 대부분), `적용`/`변경` 단독 명령조 라벨.
5. **띄어쓰기/표기** — `휴대폰번호`, `현금영수증카드`, `쇼핑 계속하기` vs 페이지별 유사 버튼 표기.
6. **ko/en 내용 불일치** — `guest_order_form.notice`(ko만 30분 제한 재조회 문장 추가), `checkout.summary.subtotal` 계열 라벨, `product.care_body` 등 일부 영문이 한글 문장 구조를 그대로 따라감.
7. **데모/시안 문구 노출(의도됨)** — footer `데모 스토어입니다…`, `본 문서는 템플릿 시안 문구입니다…`(약관/개인정보/배송정책), checkout placeholder 메시지. 실제 운영 전 교체 대상 — 정책 본문 자체도 시안이므로 COPY 재작성 시 함께 검토 필요. 배송정책 내 "상품 수령 후 7일 이내" 기산점 모호, 마감 문단이 약관 이야기로 새는 문제는 시안 수정 시 반영.

20ft LOCKED COPY(`작은 공간에서, 큰 가능성을 만듭니다.` 등) 및 금지 표현은 이 템플릿(Still Form = superbify-commerce_minimal) 내에 미발견 — Still Form 고유 브랜드 카피는 `조용한 일상의 물건들` / `Quiet objects for everyday life` 계열로 자체 톤 유지.

참고: 동일 카피가 layout JSON + lang 키 + 컴포넌트 기본값 3곳에 중복 정의된 경우(예: `YOU MAY ALSO LIKE`, `입력한 배송지를 저장합니다`, `개 보유`) 수정 시 3곳을 함께 건드려야 함 — 정리 작업 시 중복 소스 먼저 확인.

## 페이지별 카피 인벤토리

### home-base (58항목)

검증 결과: 4개 파일을 모두 Read하여 entries cross-check. 실제 ko/en 문자열은 lang/*.json에 있어 직접 평가 불가(스코프 외). 검토한 결과 (1) entries의 location/line/구조는 모두 실제 파일과 일치 — 기재된 line number 오류 없음. (2) entries에 over-flagging(괜찮은 문구를 어색하다고 표시) 사례 없음. (3) 기존 두 flag 모두 유효한 컨텍스트/키명명 우려로 유지 결정. (4) 누락 의심되는 추가 항목 — 검사한 home/_user_base/_modal_terms/_modal_privacy 4개 파일에 사용자 노출 하드코딩 텍스트는 없으며, 모든 visible 텍스트가 $t:superbify.* 키를 통해 노출됨. 데이터 소스의 label_key(예: superbify.data_source.new_arrivals)는 어드민/디버그 라벨 가능성 있어 제외 유지. internal _comment 필드와 meta.description은 코드 주석으로 사용자 노출 아님. (5) LOCKED COPY 및 금지 표현은 본 4개 파일에 등장하지 않음(전부 lang/*.json에 위치). entries 총 58개(중복 등록된 flag-bearing 항목 포함).

| 페이지 | 키/위치 | 종류 | ko | en | flag |
|--------|---------|------|----|----|------|
| home | superbify.routes.home.title | seo/meta | $t:superbify.routes.home.title |  |  |
| home | superbify.routes.home.description | seo/meta | $t:superbify.routes.home.description |  |  |
| home | superbify.home.hero.eyebrow | label | $t:superbify.home.hero.eyebrow |  |  |
| home | superbify.home.hero.headline | heading | $t:superbify.home.hero.headline |  |  |
| home | superbify.home.hero.sub | main-copy | $t:superbify.home.hero.sub |  |  |
| home | superbify.home.hero.cta_primary | button | $t:superbify.home.hero.cta_primary |  |  |
| home | superbify.home.hero.cta_secondary | button | $t:superbify.home.hero.cta_secondary |  |  |
| home | superbify.home.featured_categories.eyebrow | label | $t:superbify.home.featured_categories.eyebrow |  |  |
| home | superbify.home.featured_categories.heading | heading | $t:superbify.home.featured_categories.heading |  |  |
| home | superbify.home.featured_categories.empty_label | empty-state | $t:superbify.home.featured_categories.empty_label |  |  |
| home | superbify.common.all | button | $t:superbify.common.all |  |  |
| home | superbify.home.new_arrivals.eyebrow | label | $t:superbify.home.new_arrivals.eyebrow |  |  |
| home | superbify.home.new_arrivals.heading | heading | $t:superbify.home.new_arrivals.heading |  |  |
| home | superbify.shop.empty_title | empty-state | $t:superbify.shop.empty_title |  |  |
| home | superbify.shop.empty_message | empty-state | $t:superbify.shop.empty_message |  |  |
| home | superbify.product.quick_add | button | $t:superbify.product.quick_add |  |  |
| home | superbify.home.popular.eyebrow | label | $t:superbify.home.popular.eyebrow |  |  |
| home | superbify.home.popular.heading | heading | $t:superbify.home.popular.heading |  |  |
| home | superbify.product.view_detail | button | $t:superbify.product.view_detail |  |  |
| home | superbify.product.featured_eyebrow | label | $t:superbify.product.featured_eyebrow |  |  |
| home | superbify.home.story.eyebrow | label | $t:superbify.home.story.eyebrow |  |  |
| home | superbify.home.story.heading | heading | $t:superbify.home.story.heading |  |  |
| home | superbify.home.story.body | main-copy | $t:superbify.home.story.body |  |  |
| home | superbify.home.hero.cta_secondary (reused) | button | $t:superbify.home.hero.cta_secondary |  |  |
| home | superbify.home.editorial.eyebrow | label | $t:superbify.home.editorial.eyebrow |  |  |
| home | superbify.home.editorial.heading | heading | $t:superbify.home.editorial.heading |  |  |
| home | superbify.home.editorial.body | main-copy | $t:superbify.home.editorial.body |  |  |
| home | superbify.home.editorial.cta | button | $t:superbify.home.editorial.cta |  |  |
| home | superbify.home.final_cta.eyebrow | label | $t:superbify.home.final_cta.eyebrow |  |  |
| home | superbify.home.final_cta.heading | heading | $t:superbify.home.final_cta.heading |  |  |
| home | superbify.home.final_cta.body | main-copy | $t:superbify.home.final_cta.body |  |  |
| home | superbify.home.final_cta.cta | button | $t:superbify.home.final_cta.cta |  |  |
| global-header-footer | superbify.base_layout_title | seo/meta | $t:superbify.base_layout_title |  |  |
| global-header-footer | superbify.base_layout_description | seo/meta | $t:superbify.base_layout_description |  |  |
| global-header-footer | superbify.brand.name | brand-intro | $t:superbify.brand.name |  |  |
| global-header-footer | superbify.brand.tagline | brand-intro | $t:superbify.brand.tagline |  |  |
| global-header-footer | superbify.auth.login | button | $t:superbify.auth.login |  |  |
| global-header-footer | superbify.auth.signup | button | $t:superbify.auth.signup |  |  |
| global-header-footer | superbify.mypage.title | button | $t:superbify.mypage.title |  |  |
| global-header-footer | superbify.auth.logout | button | $t:superbify.auth.logout |  |  |
| global-header-footer | superbify.brand.name | brand-intro | $t:superbify.brand.name |  |  |
| global-header-footer | superbify.business.demo_notice | other | $t:superbify.business.demo_notice |  |  |
| global-header-footer | superbify.business.links.terms | label | $t:superbify.business.links.terms |  |  |
| global-header-footer | superbify.business.links.privacy | label | $t:superbify.business.links.privacy |  |  |
| global-header-footer | superbify.business.links.shipping | label | $t:superbify.business.links.shipping |  |  |
| global-header-footer | superbify.business.links.verification | label | $t:superbify.business.links.verification |  |  |
| auth-terms | superbify.policy.terms.title | heading | $t:superbify.policy.terms.title |  |  |
| auth-terms | superbify.auth.register.processing | other | $t:superbify.auth.register.processing |  |  |
| auth-terms | superbify.auth.register.processing (reuse context) | other | $t:superbify.auth.register.processing |  | register form 의 'processing' 키를 약관 모달 로딩 상태로 재사용 — 컨텍스트 불일치. 약관 모달은 가입 절차가 아니므로 '처리 중' 류 문구가 어색할 수 있음 |
| auth-terms | superbify.policy.published_at | other | $t:superbify.policy.published_at: {{termsContent?.data?.published_at \| date}} |  | 라벨 키 'published_at' 을 slug 그대로 보간 — 사용자 노출 문구 안에 영문 key 이름이 그대로 들어가는 형태. ko/en 키 명명 일관성 확인 필요 |
| auth-terms | superbify.policy.no_content | empty-state | $t:superbify.policy.no_content |  |  |
| auth-terms | superbify.common.close | button | $t:superbify.common.close |  |  |
| auth-privacy | superbify.policy.privacy.title | heading | $t:superbify.policy.privacy.title |  |  |
| auth-privacy | superbify.auth.register.processing | other | $t:superbify.auth.register.processing |  |  |
| auth-privacy | superbify.auth.register.processing (reuse context) | other | $t:superbify.auth.register.processing |  | register form 의 'processing' 키를 개인정보처리방침 모달 로딩 상태로 재사용 — 컨텍스트 불일치. 정책 모달은 가입 절차가 아니므로 '처리 중' 류 문구가 어색할 수 있음 |
| auth-privacy | superbify.policy.published_at | other | $t:superbify.policy.published_at: {{privacyContent?.data?.published_at \| date}} |  | 라벨 키 'published_at' 을 slug 그대로 보간 — 사용자 노출 문구 안에 영문 key 이름이 그대로 들어가는 형태. ko/en 키 명명 일관성 확인 필요 |
| auth-privacy | superbify.policy.no_content | empty-state | $t:superbify.policy.no_content |  |  |
| auth-privacy | superbify.common.close | button | $t:superbify.common.close |  |  |

### lang-1 (163항목)

ko.json / en.json 1~250줄 구간 검증. template default 브랜드(Still Form / 조용한 일상의 물건들 / Quiet objects for everyday life)는 commerce template 기본 카피로 20ft LOCKED COPY가 아니다. LOCKED COPY/금지 표현 사용 없음. 20ft copy policy 적용 대상은 20ft active runtime(twentyft-studio)이므로 이 영역은 flag 대상이 아니다. 사용자 노출 카피 기준으로 추출 누락 없음. line 87~106 data_source는 내부 키명 라벨로 사용자 화면 텍스트가 아니므로 제외.

| 페이지 | 키/위치 | 종류 | ko | en | flag |
|--------|---------|------|----|----|------|
| global-meta | superbify.base_layout_title | seo/meta | Still Form | Still Form |  |
| global-meta | superbify.base_layout_description | seo/meta | Home & lifestyle store — SuperBify Commerce Minimal | Home & lifestyle store — SuperBify Commerce Minimal |  |
| global-brand | superbify.brand.name | brand-intro | Still Form | Still Form |  |
| global-brand | superbify.brand.tagline | brand-intro | 조용한 일상의 물건들 | Quiet objects for everyday life |  |
| home | superbify.routes.home.title | seo/meta | Still Form — 조용한 일상의 물건들 | Still Form — Quiet objects for everyday life |  |
| home | superbify.routes.home.description | seo/meta | 일상의 한 자리에 머무는 사물을 모은 자리. | A small collection of objects for everyday spaces. |  |
| shop | superbify.routes.shop.title | seo/meta | Shop — Still Form | Shop — Still Form |  |
| shop | superbify.routes.shop.description | seo/meta | 전체 상품 목록 | All products |  |
| category | superbify.routes.category.title | seo/meta | Category — Still Form | Category — Still Form |  |
| category | superbify.routes.category.description | seo/meta | 카테고리별 상품 | Products in this category |  |
| product | superbify.routes.product.title | seo/meta | Product — Still Form | Product — Still Form |  |
| product | superbify.routes.product.description | seo/meta | 상품 상세 | Product detail |  |
| notice | superbify.routes.notice.title | seo/meta | Notice — Still Form | Notice — Still Form |  |
| notice | superbify.routes.notice.description | seo/meta | 공지사항 | Notices |  |
| story | superbify.routes.story.title | seo/meta | Story — Still Form | Story — Still Form |  |
| story | superbify.routes.story.description | seo/meta | 브랜드 소개 | About the brand |  |
| cart | superbify.routes.cart.title | seo/meta | Cart — Still Form | Cart — Still Form |  |
| cart | superbify.routes.cart.description | seo/meta | 장바구니 | Shopping cart |  |
| checkout | superbify.routes.checkout.title | seo/meta | Checkout — Still Form | Checkout — Still Form |  |
| checkout | superbify.routes.checkout.description | seo/meta | 결제 | Checkout |  |
| order-complete | superbify.routes.order_complete.title | seo/meta | 주문 완료 — Still Form | Order Complete — Still Form |  |
| order-complete | superbify.routes.order_complete.description | seo/meta | 주문이 접수되었습니다 | Your order has been placed |  |
| guest-order | superbify.routes.guest_order_form.title | seo/meta | 비회원 주문 조회 — Still Form | Guest Order Lookup — Still Form |  |
| guest-order | superbify.routes.guest_order_form.description | seo/meta | 주문번호로 주문 내역을 확인합니다 | Look up your order by order number |  |
| guest-order | superbify.auth.guest_continue.title | heading | 비회원 주문 조회 | Guest order lookup |  |
| guest-order | superbify.auth.guest_continue.hint | main-copy | 주문 시 받은 주문번호로 주문 내역을 확인할 수 있습니다. | You can look up your order with the order number you received. |  |
| guest-order | superbify.auth.guest_continue.cta | button | 비회원 주문 조회 | Guest order lookup |  |
| guest-order-detail | superbify.routes.guest_order_show.title | seo/meta | 비회원 주문 상세 — Still Form | Guest Order Detail — Still Form |  |
| guest-order-detail | superbify.routes.guest_order_show.description | seo/meta | 비회원 주문 상세 보기 | View your guest order details |  |
| terms | superbify.routes.terms.title | seo/meta | 이용약관 — Still Form | Terms of Service — Still Form |  |
| terms | superbify.routes.terms.description | seo/meta | 스토어 이용약관 안내 | Store terms of service |  |
| privacy | superbify.routes.privacy.title | seo/meta | 개인정보처리방침 — Still Form | Privacy Policy — Still Form |  |
| privacy | superbify.routes.privacy.description | seo/meta | 개인정보처리방침 안내 | Privacy policy information |  |
| shipping-policy | superbify.routes.shipping_policy.title | seo/meta | 배송·교환·반품 안내 — Still Form | Shipping, Returns & Exchanges — Still Form |  |
| shipping-policy | superbify.routes.shipping_policy.description | seo/meta | 배송, 교환, 반품 안내 | Shipping, exchange, and return information |  |
| notice-detail | superbify.routes.notice_detail.title | seo/meta | 공지 상세 — Still Form | Notice detail — Still Form |  |
| notice-detail | superbify.routes.notice_detail.description | seo/meta | 스토어 공지 상세 보기 | Store notice detail |  |
| login | superbify.routes.login | seo/meta | 로그인 — Still Form | Login — Still Form |  |
| login | superbify.auth.login | label | 로그인 | Login |  |
| login | superbify.auth.signup | label | 회원가입 | Sign up |  |
| login | superbify.auth.register_link | label | 회원가입 | Sign up |  |
| login | superbify.auth.already_member | label | 이미 회원이신가요? | Already a member? |  |
| login | superbify.auth.forgot_password_link | label | 비밀번호를 잊으셨나요? | Forgot your password? |  |
| login | superbify.auth.login_success | toast/error | 로그인되었습니다. | You are signed in. |  |
| login | superbify.auth.already_logged_in | toast/error | 이미 로그인되어 있습니다. | You are already signed in. |  |
| login | superbify.auth.login_form.title | heading | 로그인 | Login |  |
| login | superbify.auth.login_form.subtitle | main-copy | 계정에 로그인하세요 | Sign in to your account |  |
| login | superbify.auth.login_form.email | label | 이메일 | Email |  |
| login | superbify.auth.login_form.email_placeholder | placeholder | 이메일 주소를 입력하세요 | Enter your email address |  |
| login | superbify.auth.login_form.password | label | 비밀번호 | Password |  |
| login | superbify.auth.login_form.password_placeholder | placeholder | 비밀번호를 입력하세요 | Enter your password |  |
| login | superbify.auth.login_form.remember | label | 로그인 상태 유지 | Keep me signed in |  |
| login | superbify.auth.login_form.submit | button | 로그인 | Login |  |
| login | superbify.auth.login_form.processing | button | 로그인 중... | Signing in... |  |
| login | superbify.auth.login_form.no_account | label | 계정이 없으신가요? | Don't have an account? |  |
| login | superbify.auth.login_form.error.invalid | toast/error | 이메일 또는 비밀번호가 올바르지 않습니다. | The email or password is incorrect. |  |
| login | superbify.auth.login_form.error.email_required | toast/error | 이메일을 입력해주세요. | Please enter your email. |  |
| login | superbify.auth.login_form.error.email_invalid | toast/error | 올바른 이메일 형식이 아닙니다. | Please enter a valid email address. |  |
| login | superbify.auth.login_form.error.password_required | toast/error | 비밀번호를 입력해주세요. | Please enter your password. |  |
| register | superbify.routes.register | seo/meta | 회원가입 — Still Form | Sign up — Still Form |  |
| register | superbify.auth.register_success | toast/error | 회원가입이 완료되었습니다. | Your account has been created. |  |
| register | superbify.auth.register.title | heading | 회원가입 | Sign up |  |
| register | superbify.auth.register.subtitle | main-copy | 새 계정을 만드세요 | Create a new account |  |
| register | superbify.auth.register.email | label | 이메일 | Email |  |
| register | superbify.auth.register.email_placeholder | placeholder | 이메일 주소를 입력하세요 | Enter your email address |  |
| register | superbify.auth.register.password | label | 비밀번호 | Password |  |
| register | superbify.auth.register.password_placeholder | placeholder | 비밀번호를 입력하세요 | Enter your password |  |
| register | superbify.auth.register.password_confirm | label | 비밀번호 확인 | Confirm password |  |
| register | superbify.auth.register.password_confirm_placeholder | placeholder | 비밀번호를 다시 입력하세요 | Enter your password again |  |
| register | superbify.auth.register.nickname | label | 닉네임 | Nickname |  |
| register | superbify.auth.register.nickname_placeholder | placeholder | 닉네임을 입력하세요 (선택) | Enter a nickname (optional) |  |
| register | superbify.auth.register.name | label | 이름 | Name |  |
| register | superbify.auth.register.name_placeholder | placeholder | 이름을 입력하세요 | Enter your name |  |
| register | superbify.auth.register.mobile | label | 휴대폰 번호 | Mobile phone |  |
| register | superbify.auth.register.mobile_placeholder | placeholder | 휴대폰 번호를 입력하세요 (선택) | Enter your mobile phone number (optional) |  |
| register | superbify.auth.register.phone | label | 전화번호 | Phone |  |
| register | superbify.auth.register.phone_placeholder | placeholder | 전화번호를 입력하세요 (선택) | Enter your phone number (optional) |  |
| register | superbify.auth.register.language | label | 언어 | Language |  |
| register | superbify.auth.register.section_account | heading | 계정 정보 | Account |  |
| register | superbify.auth.register.section_profile | heading | 프로필 | Profile |  |
| register | superbify.auth.register.section_agreements | heading | 약관 동의 | Agreements |  |
| register | superbify.auth.register.agree_required | label | (필수) | (required) |  |
| register | superbify.auth.register.password_hint | label | 비밀번호는 8자 이상이어야 합니다. | Password must be at least 8 characters. |  |
| register | superbify.auth.register.terms_agree | label | 이용약관에 동의합니다. | I agree to the Terms of Service. |  |
| register | superbify.auth.register.privacy_agree | label | 개인정보처리방침에 동의합니다. | I agree to the Privacy Policy. |  |
| register | superbify.auth.register.terms_link | label | 이용약관 보기 | View Terms of Service |  |
| register | superbify.auth.register.privacy_link | label | 개인정보처리방침 보기 | View Privacy Policy |  |
| register | superbify.auth.register.submit | button | 회원가입 | Sign up |  |
| register | superbify.auth.register.processing | button | 가입 중... | Creating account... |  |
| register | superbify.auth.register.has_account | label | 이미 계정이 있으신가요? | Already have an account? |  |
| register | superbify.auth.register.error.email_required | toast/error | 이메일을 입력해주세요. | Please enter your email. |  |
| register | superbify.auth.register.error.email_invalid | toast/error | 올바른 이메일 형식이 아닙니다. | Please enter a valid email address. |  |
| register | superbify.auth.register.error.email_exists | toast/error | 이미 사용 중인 이메일입니다. | This email is already in use. |  |
| register | superbify.auth.register.error.password_required | toast/error | 비밀번호를 입력해주세요. | Please enter a password. |  |
| register | superbify.auth.register.error.password_min | toast/error | 비밀번호는 {{count}}자 이상이어야 합니다. | Password must be at least {{count}} characters. |  |
| register | superbify.auth.register.error.password_mismatch | toast/error | 비밀번호가 일치하지 않습니다. | Passwords do not match. |  |
| register | superbify.auth.register.error.terms_required | toast/error | 이용약관에 동의해주세요. | Please agree to the Terms of Service. |  |
| register | superbify.auth.register.error.privacy_required | toast/error | 개인정보처리방침에 동의해주세요. | Please agree to the Privacy Policy. |  |
| forgot-password | superbify.routes.forgot_password | seo/meta | 비밀번호 찾기 — Still Form | Forgot password — Still Form |  |
| forgot-password | superbify.auth.forgot_password.title | heading | 비밀번호 찾기 | Forgot password |  |
| forgot-password | superbify.auth.forgot_password.subtitle | main-copy | 이메일로 비밀번호 재설정 링크를 보내드립니다 | We will email you a password reset link |  |
| forgot-password | superbify.auth.forgot_password.email | label | 이메일 | Email |  |
| forgot-password | superbify.auth.forgot_password.email_placeholder | placeholder | 가입한 이메일 주소를 입력하세요 | Enter the email address you registered with |  |
| forgot-password | superbify.auth.forgot_password.submit | button | 재설정 링크 보내기 | Send reset link |  |
| forgot-password | superbify.auth.forgot_password.processing | button | 전송 중... | Sending... |  |
| forgot-password | superbify.auth.forgot_password.success | toast/error | 비밀번호 재설정 이메일을 보냈습니다. | A password reset email has been sent. |  |
| forgot-password | superbify.auth.forgot_password.back_to_login | label | 로그인으로 돌아가기 | Back to login |  |
| reset-password | superbify.routes.reset_password | seo/meta | 비밀번호 재설정 — Still Form | Reset password — Still Form |  |
| reset-password | superbify.auth.reset_password.title | heading | 비밀번호 재설정 | Reset password |  |
| reset-password | superbify.auth.reset_password.subtitle | main-copy | 새 비밀번호를 입력하세요 | Enter a new password |  |
| reset-password | superbify.auth.reset_password.password | label | 새 비밀번호 | New password |  |
| reset-password | superbify.auth.reset_password.password_placeholder | placeholder | 새 비밀번호를 입력하세요 | Enter the new password |  |
| reset-password | superbify.auth.reset_password.password_confirm | label | 비밀번호 확인 | Confirm password |  |
| reset-password | superbify.auth.reset_password.password_confirm_placeholder | placeholder | 새 비밀번호를 다시 입력하세요 | Enter the new password again |  |
| reset-password | superbify.auth.reset_password.submit | button | 비밀번호 변경 | Change password |  |
| reset-password | superbify.auth.reset_password.processing | button | 변경 중... | Updating... |  |
| reset-password | superbify.auth.reset_password.success | toast/error | 비밀번호가 변경되었습니다. | Your password has been changed. |  |
| reset-password | superbify.auth.reset_password.token_invalid | toast/error | 유효하지 않거나 만료된 링크입니다. 비밀번호 찾기를 다시 요청해주세요. | This link is invalid or expired. Please request a password reset again. |  |
| reset-password | superbify.auth.reset_password.go_to_login | button | 로그인 | Log in |  |
| reset-password | superbify.auth.reset_password.go_to_home | button | 홈으로 | Go to home |  |
| mypage | superbify.routes.mypage | seo/meta | 마이페이지 — Still Form | My Page — Still Form |  |
| mypage | superbify.auth.logout | button | 로그아웃 | Log out |  |
| mypage | superbify.mypage.title | heading | 마이페이지 | My Page |  |
| mypage | superbify.mypage.logout_success | toast/error | 로그아웃되었습니다. | You have been signed out. |  |
| mypage | superbify.mypage.cancel | button | 취소 | Cancel |  |
| mypage | superbify.mypage.delete | button | 삭제 | Delete |  |
| mypage | superbify.mypage.tabs.profile | label | 프로필 | Profile |  |
| mypage | superbify.mypage.tabs.orders | label | 주문내역 | Orders |  |
| mypage | superbify.mypage.tabs.addresses | label | 배송지 관리 | Addresses |  |
| mypage | superbify.mypage.tabs.wishlist | label | 찜한 상품 | Wishlist |  |
| mypage | superbify.mypage.tabs.coupons | label | 쿠폰 | Coupons |  |
| mypage | superbify.mypage.tabs.mileage | label | 마일리지 | Mileage |  |
| mypage | superbify.mypage.tabs.inquiries | label | 상품 문의 | Inquiries |  |
| mypage | superbify.mypage.tabs.password | label | 비밀번호 변경 | Change password |  |
| mypage-profile | superbify.routes.mypage_profile | seo/meta | 프로필 — 마이페이지 | Profile — My Page |  |
| mypage-profile-edit | superbify.routes.mypage_profile_edit | seo/meta | 프로필 수정 — 마이페이지 | Edit Profile — My Page |  |
| mypage-change-password | superbify.routes.mypage_change_password | seo/meta | 비밀번호 변경 — 마이페이지 | Change Password — My Page |  |
| mypage-orders | superbify.routes.mypage_orders | seo/meta | 주문내역 — 마이페이지 | Orders — My Page |  |
| mypage-orders | superbify.mypage.orders.empty | empty-state | 주문 내역이 없습니다. | No orders yet. |  |
| mypage-orders | superbify.mypage.orders.order_no | label | 주문번호 | Order number |  |
| mypage-orders | superbify.mypage.orders.status | label | 상태 | Status |  |
| mypage-orders | superbify.mypage.orders.item | label | 상품 | Items |  |
| mypage-orders | superbify.mypage.orders.total | label | 결제금액 | Total |  |
| mypage-orders | superbify.mypage.orders.date | label | 주문일 | Order date |  |
| mypage-orders | superbify.mypage.orders.shipping_to | label | 배송지 | Shipping to |  |
| mypage-orders | superbify.mypage.orders.payment | label | 결제 방법 | Payment |  |
| mypage-order | superbify.routes.mypage_order | seo/meta | 주문 상세 — 마이페이지 | Order Detail — My Page |  |
| mypage-addresses | superbify.routes.mypage_addresses | seo/meta | 배송지 관리 — 마이페이지 | Addresses — My Page |  |
| mypage-wishlist | superbify.routes.mypage_wishlist | seo/meta | 찜한 상품 — 마이페이지 | Wishlist — My Page |  |
| mypage-coupons | superbify.routes.mypage_coupons | seo/meta | 쿠폰 — 마이페이지 | Coupons — My Page |  |
| mypage-mileage | superbify.routes.mypage_mileage | seo/meta | 마일리지 — 마이페이지 | Mileage — My Page |  |
| mypage-inquiries | superbify.routes.mypage_inquiries | seo/meta | 상품 문의 — 마이페이지 | Product Inquiries — My Page |  |
| reorder | superbify.routes.reorder | seo/meta | 재주문 | Reorder |  |
| error-404 | superbify.errors.not_found_title | toast/error | 페이지를 찾을 수 없습니다 | Page not found |  |
| error-404 | superbify.errors.not_found_description | toast/error | 요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다. | The page you requested does not exist or has been moved. |  |
| error-403 | superbify.errors.forbidden_title | toast/error | 접근 권한이 없습니다 | Access denied |  |
| error-403 | superbify.errors.forbidden_description | toast/error | 이 페이지에 접근할 수 있는 권한이 없습니다. | You don't have permission to access this page. |  |
| error-500 | superbify.errors.server_error_title | toast/error | 문제가 발생했습니다 | Something went wrong |  |
| error-500 | superbify.errors.server_error_description | toast/error | 잠시 후 다시 시도해 주세요. | Please try again in a moment. |  |
| error-401 | superbify.errors.unauthorized_title | toast/error | 로그인이 필요합니다 | Sign-in required |  |
| error-401 | superbify.errors.unauthorized_message | toast/error | 회원 전용 페이지입니다. 로그인 후 다시 이용해 주세요. | This page is for members. Please sign in and try again. |  |
| error-401 | superbify.errors.unauthorized_cta_login | button | 로그인하러 가기 | Go to sign in |  |
| error-401 | superbify.errors.unauthorized_cta_home | button | 홈으로 가기 | Go to home |  |

### lang-2 (106항목)

전체 입력 106 entries 검증. 모든 항목이 자연스러운 한국어 카피이며 LOCKED COPY/금지 표현 미사용. 톤은 전반적으로 합쇼체 종결 어미 일관되게 유지. 파일(ko.json 251~500) 대조 결과 추출 누락된 어색 카피는 없음. 한 가지 확인 사항: home.promo.eyebrow의 text_ko가 빈 문자열("")로 기재되어 있으나 실제 파일(ko.json:392)에는 "LIFESTYLE"이 들어가 있어 flag로 표시함. 입력 notes가 shop/category/product/story/notice/cart 영역 152건 포함이라 명시했으나 실제 entries 배열에는 home.promo.eyebrow까지만 포함되어 누락이 있으나, 해당 누락 구간(393~500) 검토 결과 어색한 카피 발견되지 않아 추가하지 않음. cart.delete_confirm_single/multiple은 KO가 동일하고 EN만 단복수 차이이나 자연스러운 한국어 문장이므로 flag 대상 아님. home.story.body의 "시간이 지나도 변하지 않는 사물"은 의도가 본연의 성질을 잃지 않는 사물로 읽혀 brand voice 차원에서 허용 범위.

| 페이지 | 키/위치 | 종류 | ko | en | flag |
|--------|---------|------|----|----|------|
| mypage-orders | mypage.orders.phone | label | 연락처 | Contact |  |
| mypage-orders | mypage.orders.address | label | 주소 | Address |  |
| mypage-orders | mypage.orders.memo | label | 배송 메모 | Delivery memo |  |
| mypage-orders | mypage.orders.payment_date | label | 결제일 | Payment date |  |
| mypage-orders | mypage.orders.cancelled_at | label | 취소일 | Cancelled at |  |
| mypage-orders | mypage.orders.processing | label | 처리 중… | Processing… |  |
| mypage-orders | mypage.orders.reason_placeholder | placeholder | 취소 사유를 선택해 주세요. | Select a cancellation reason. |  |
| mypage-orders | mypage.orders.cancel_success | toast/error | 주문이 취소되었습니다. | Your order has been cancelled. |  |
| mypage-orders | mypage.orders.free_shipping | label | 무료배송 | Free shipping |  |
| mypage-profile | mypage.profile.name | label | 이름 | Name |  |
| mypage-profile | mypage.profile.email | label | 이메일 | Email |  |
| mypage-profile | mypage.profile.phone | label | 휴대폰 | Phone |  |
| mypage-profile | mypage.profile.nickname | label | 닉네임 | Nickname |  |
| mypage-profile | mypage.profile.save | button | 저장 | Save |  |
| mypage-profile | mypage.profile.edit | button | 수정 | Edit |  |
| mypage-profile | mypage.profile.joined | label | 가입일 | Joined |  |
| mypage-profile | mypage.profile.edit_title | heading | 프로필 수정 | Edit profile |  |
| mypage-profile | mypage.profile.updated | toast/error | 프로필을 저장했습니다. | Your profile has been saved. |  |
| mypage-profile | mypage.profile.verify_title | heading | 비밀번호 확인 | Confirm password |  |
| mypage-profile | mypage.profile.verify_message | main-copy | 정보를 수정하기 전 현재 비밀번호를 다시 확인합니다. | Enter your current password before editing your profile. |  |
| mypage-profile | mypage.profile.verify_error | toast/error | 비밀번호가 일치하지 않습니다. | The password does not match. |  |
| mypage-profile | mypage.profile.verify_submit | button | 확인 | Confirm |  |
| mypage-password | mypage.password.current | label | 현재 비밀번호 | Current password |  |
| mypage-password | mypage.password.new | label | 새 비밀번호 | New password |  |
| mypage-password | mypage.password.confirm | label | 새 비밀번호 확인 | Confirm new password |  |
| mypage-password | mypage.password.submit | button | 비밀번호 변경 | Change password |  |
| mypage-password | mypage.password.changed | toast/error | 비밀번호가 변경되었습니다. | Your password has been changed. |  |
| mypage-addresses | mypage.addresses.title | heading | 배송지 관리 | Addresses |  |
| mypage-addresses | mypage.addresses.add | button | 배송지 추가 | Add address |  |
| mypage-addresses | mypage.addresses.edit | button | 수정 | Edit |  |
| mypage-addresses | mypage.addresses.default | label | 기본 배송지 | Default address |  |
| mypage-addresses | mypage.addresses.set_default | button | 기본 배송지로 설정 | Set as default |  |
| mypage-addresses | mypage.addresses.confirm_delete_title | heading | 배송지를 삭제할까요? | Delete this address? |  |
| mypage-addresses | mypage.addresses.confirm_delete_body | main-copy | 삭제한 배송지는 복구할 수 없습니다. | A deleted address cannot be restored. |  |
| mypage-addresses | mypage.addresses.zipcode | label | 우편번호 | Zip code |  |
| mypage-addresses | mypage.addresses.address | label | 주소 | Address |  |
| mypage-addresses | mypage.addresses.address_detail | label | 상세 주소 | Address detail |  |
| mypage-addresses | mypage.addresses.recipient | label | 받는 분 | Recipient |  |
| mypage-addresses | mypage.addresses.phone | label | 연락처 | Phone |  |
| mypage-addresses | mypage.addresses.empty | empty-state | 등록된 배송지가 없습니다. | No saved addresses yet. |  |
| mypage-addresses | mypage.addresses.name | label | 배송지명 | Label |  |
| mypage-addresses | mypage.addresses.save | button | 저장 | Save |  |
| mypage-addresses | mypage.addresses.saved | toast/error | 배송지를 저장했습니다. | The address has been saved. |  |
| mypage-addresses | mypage.addresses.deleted | toast/error | 배송지를 삭제했습니다. | The address has been deleted. |  |
| mypage-addresses | mypage.addresses.default_saved | toast/error | 기본 배송지로 설정했습니다. | The default address has been updated. |  |
| mypage-addresses | mypage.addresses.conflict_title | heading | 이미 사용 중인 배송지명입니다. | This address label is already in use. |  |
| mypage-addresses | mypage.addresses.conflict_body | main-copy | 같은 이름의 배송지를 새 정보로 덮어쓸까요? | Overwrite the existing address with this one? |  |
| mypage-addresses | mypage.addresses.conflict_confirm | button | 덮어쓰기 | Overwrite |  |
| mypage-wishlist | mypage.wishlist.title | heading | 찜한 상품 | Wishlist |  |
| mypage-wishlist | mypage.wishlist.empty | empty-state | 찜한 상품이 없습니다. | Your wishlist is empty. |  |
| mypage-wishlist | mypage.wishlist.remove | button | 삭제 | Remove |  |
| mypage-wishlist | mypage.wishlist.add_to_cart_note | main-copy | 장바구니에 담으려면 상품 페이지에서 담아 주세요. | To add to the cart, add the item from its product page. |  |
| mypage-wishlist | mypage.wishlist.removed | toast/error | 찜 목록에서 삭제했습니다. | Removed from your wishlist. |  |
| mypage-coupons | mypage.coupons.title | heading | 쿠폰 | Coupons |  |
| mypage-coupons | mypage.coupons.empty | empty-state | 보유한 쿠폰이 없습니다. | You have no coupons. |  |
| mypage-coupons | mypage.coupons.available | heading | 다운로드 가능한 쿠폰 | Available coupons |  |
| mypage-coupons | mypage.coupons.download | button | 쿠폰 받기 | Download |  |
| mypage-coupons | mypage.coupons.downloaded | label | 받기 완료 | Downloaded |  |
| mypage-coupons | mypage.coupons.expires | label | 사용 기한 | Valid until |  |
| mypage-coupons | mypage.coupons.owned | heading | 보유 쿠폰 | My coupons |  |
| mypage-coupons | mypage.coupons.no_available | empty-state | 다운로드 가능한 쿠폰이 없습니다. | No coupons to download right now. |  |
| mypage-mileage | mypage.mileage.title | heading | 마일리지 | Mileage |  |
| mypage-mileage | mypage.mileage.balance | label | 보유 마일리지 | Mileage balance |  |
| mypage-mileage | mypage.mileage.history | heading | 적립 내역 | Mileage history |  |
| mypage-mileage | mypage.mileage.empty | empty-state | 적립 내역이 없습니다. | No mileage history yet. |  |
| mypage-mileage | mypage.mileage.earned | label | 적립 | Earned |  |
| mypage-mileage | mypage.mileage.used | label | 사용 | Used |  |
| mypage-mileage | mypage.mileage.date | label | 날짜 | Date |  |
| mypage-mileage | mypage.mileage.disabled | main-copy | 마일리지 기능이 비활성화되어 있습니다. | Mileage is currently disabled. |  |
| mypage-mileage | mypage.mileage.filter.all | button | 전체 | All |  |
| mypage-mileage | mypage.mileage.filter.earn | button | 적립 | Earned |  |
| mypage-mileage | mypage.mileage.filter.use | button | 사용 | Used |  |
| mypage-inquiries | mypage.inquiries.title | heading | 상품 문의 | Product inquiries |  |
| mypage-inquiries | mypage.inquiries.empty | empty-state | 등록한 상품 문의가 없습니다. | No product inquiries yet. |  |
| mypage-inquiries | mypage.inquiries.status_answered | label | 답변 완료 | Answered |  |
| mypage-inquiries | mypage.inquiries.status_waiting | label | 답변 대기 | Awaiting reply |  |
| mypage-inquiries | mypage.inquiries.view_product | button | 상품 보기 | View product |  |
| mypage-inquiries | mypage.inquiries.question | label | 문의 내용 | Question |  |
| mypage-inquiries | mypage.inquiries.reply | label | 판매자 답변 | Seller reply |  |
| mypage-inquiries | mypage.inquiries.filter.all | button | 전체 | All |  |
| mypage-inquiries | mypage.inquiries.filter.pending | button | 답변 대기 | Awaiting reply |  |
| mypage-inquiries | mypage.inquiries.filter.answered | button | 답변 완료 | Answered |  |
| global-nav | nav.shop | label | Shop | Shop |  |
| global-nav | nav.story | label | Story | Story |  |
| global-nav | nav.notice | label | Notice | Notice |  |
| global-nav | nav.cart | label | Cart | Cart |  |
| home | home.hero.eyebrow | label | HOME & LIFESTYLE | HOME & LIFESTYLE |  |
| home | home.hero.headline | main-copy | 조용한 일상의\n물건들 | Quiet objects for\neveryday life |  |
| home | home.hero.sub | main-copy | 손에 익는 재질, 변화하는 결, 천천히 좋아지는 형태. 일상의 한 자리에 머무는 사물을 차곡차곡 모아 봅니다. | Materials that grow familiar with use. Forms that quietly improve with time. A small, careful collection for everyday spaces. |  |
| home | home.hero.cta_primary | button | Shop 둘러보기 | Browse Shop |  |
| home | home.hero.cta_secondary | button | Brand Story | Brand Story |  |
| home | home.featured_categories.eyebrow | label | CATEGORIES | CATEGORIES |  |
| home | home.featured_categories.heading | heading | 카테고리 | Categories |  |
| home | home.featured_categories.empty_label | empty-state | 표시할 카테고리가 없습니다. | No categories to display. |  |
| home | home.new_arrivals.eyebrow | label | NEW | NEW |  |
| home | home.new_arrivals.heading | heading | 새로 들어온 것들 | New arrivals |  |
| home | home.popular.eyebrow | label | POPULAR | POPULAR |  |
| home | home.popular.heading | heading | 인기 상품 | Best Sellers |  |
| home | home.story.eyebrow | label | BRAND STORY | BRAND STORY |  |
| home | home.story.heading | heading | 오래 쓸수록 익어지는 것들 | Things that grow better with time |  |
| home | home.story.body | main-copy | Still Form은 시간이 지나도 변하지 않는 사물을 모은 자리입니다. 목재, 리넨, 도자기 — 손에 닿는 재질이 스스로 말을 거는 물건을 골라 천천히 소개합니다. 화려함보다 차분함, 새것보다 익은 것을 우선합니다. | Still Form gathers objects that hold their character through years of use. Wood that softens, linen that deepens, ceramics that darken at the rim. We choose pieces whose materials speak for themselves. |  |
| home | home.editorial.eyebrow | label | EDITORIAL | EDITORIAL |  |
| home | home.editorial.heading | heading | 조용히, 그러나 단단하게. | Quietly, but firmly. |  |
| home | home.editorial.body | main-copy | 공간에 머무르는 사물은 시간이 흐를수록 더 좋아지는 종류가 있습니다. Still Form은 오래 쓸수록 익어지는 물건을 차분히 모은 자리입니다. | Some objects in a room only get better with time. Still Form is a small, careful collection of those long-keeping things. |  |
| home | home.editorial.cta | button | Shop 둘러보기 | Browse Shop |  |
| home | home.promo.eyebrow | label | —(none) | LIFESTYLE | text_ko 누락 — 파일(ko.json:392) 실제값은 'LIFESTYLE' |

### lang-2b (83항목)

superbify-commerce_minimal lang/ko.json & en.json lines 393-500. 영역: home.promo, home.final_cta, shop, category, product, story, notice, cart(상단). aria 라벨은 제외.

| 페이지 | 키/위치 | 종류 | ko | en | flag |
|--------|---------|------|----|----|------|
| home | home.promo.title | heading | 오늘의 한 권 | One piece at a time |  |
| home | home.promo.description | policy/longform | 책꽂이 위에 머무는 단행본 한 권처럼, 일상에 한 점 더해지는 물건을 소개합니다. | Like a single volume on a shelf — objects earn their place by being used, day after day. |  |
| home | home.final_cta.eyebrow | label | EXPLORE | EXPLORE |  |
| home | home.final_cta.heading | heading | 조용한 일상의 모든 물건을 한 자리에서 | Everyday quiet objects, in one place |  |
| home | home.final_cta.body | policy/longform | 지금 전체 Shop을 둘러보고, 오래 머무를 한 가지 물건을 골라보세요. | Browse the full Shop and find one piece that will stay with you for years. |  |
| home | home.final_cta.cta | button | Shop 전체 보기 | Browse all of Shop |  |
| shop | shop.title | heading | Shop | Shop |  |
| shop | shop.filter_label | label | 카테고리 | Categories |  |
| shop | shop.empty_title | empty-state | 아직 등록된 상품이 없습니다 | No products yet |  |
| shop | shop.empty_message | empty-state | 관리자에서 상품을 등록하면 이 자리에 표시됩니다. | Add products in admin and they will appear here. |  |
| category | category.count_label | label | {{count}}개 상품 | {{count}} items |  |
| category | category.empty_title | empty-state | 이 카테고리에 등록된 상품이 없습니다 | No products in this category |  |
| category | category.empty_message | empty-state | 다른 카테고리를 둘러보거나, 잠시 후 다시 확인해 주세요. | Try another category or check back later. |  |
| product | product.short_description_label | label | 상세 설명 | Description |  |
| product | product.description_label | label | PRODUCT | PRODUCT |  |
| product | product.description_title | heading | 상품 설명 | Description |  |
| product | product.info_label | label | INFO | INFO |  |
| product | product.info_title | heading | 안내 | Information |  |
| product | product.shipping_label | label | SHIPPING | SHIPPING |  |
| product | product.shipping_title | heading | 배송 안내 | Shipping & returns |  |
| product | product.view_detail | button | 자세히 보기 | View details |  |
| product | product.featured_eyebrow | label | 대표 상품 | Featured |  |
| product | product.info.material | label | 소재 | Material |  |
| product | product.info.size | label | 사이즈 | Size |  |
| product | product.info.care | label | 관리 | Care |  |
| product | product.info.material_body | policy/longform | 상품 상세 페이지에서 재질별 관리 방법을 안내합니다. 일반적으로 직사광선을 피해 통풍이 잘 되는 곳에서 보관해 주세요. | Material-specific care instructions are listed on the product detail page. Store away from direct sunlight in a well-ventilated space. |  |
| product | product.info.size_body | policy/longform | 상세 사이즈는 상품 상세 정보의 치수 표를 참고해 주세요. 측정 방법에 따라 1~2cm의 오차가 생길 수 있습니다. | Refer to the size chart on the product detail page. Allow 1–2 cm variance depending on how each piece is measured. |  |
| product | product.info.care_body | policy/longform | 사용 전 부드러운 천으로 가볍게 닦아 주세요. 강한 세제나 연마제는 사용하지 마시고, 필요할 때 부드러운 행주로 관리해 주세요. | Wipe gently with a soft dry cloth before first use. Avoid harsh detergents or abrasives; a soft cloth is enough for daily care. | 한 ko 문장에서 '사용 전'과 '필요할 때' 두 번 부드러운 천/행주를 반복 지시해 살짝 번역투·중복감이 있음 |
| product | product.shipping_body | policy/longform | 평일 기준 2~3일 내 출고되며, 출고 후 1~2일 내 배송이 완료됩니다. 배송비는 결제 단계에서 안내됩니다. 도서산간 지역은 추가 비용이 발생할 수 있습니다. | Orders ship within 2–3 business days and typically arrive 1–2 days after dispatch. Shipping fees are shown at checkout. Remote areas may incur an additional surcharge. |  |
| product | product.quick_add | button | 담기 | Add | ko '담기'가 cart.add_to_cart '장바구니 담기'와 같은 동작인데 한 단어로 짧아 톤/의도 차이 모호 |
| product | product.related_title | heading | 함께 보면 좋은 것들 | You might also like |  |
| product | product.related_eyebrow | label | RELATED | RELATED |  |
| product | product.status_soldout | label | 품절 | Sold out |  |
| product | product.status_stopped | label | 판매중지 | Stopped |  |
| product | product.status_onsale | label | 판매중 | On sale |  |
| product | product.kv.category | label | 분류 | Category |  |
| product | product.kv.status | label | 상태 | Status |  |
| product | product.kv.shipping | label | 배송 | Shipping |  |
| product | product.kv.shipping_fee | label | 배송비 | Shipping fee |  |
| product | product.kv.free_shipping_threshold | label | 무료배송 | Free shipping |  |
| product | product.kv.free_shipping_over | label | :amount 이상 무료 | Free over :amount |  |
| product | product.admin_edit | button | 관리자 수정 | Admin edit |  |
| product | product.coupon.guest_hint | toast/error | 로그인 후 다운로드할 수 있습니다. | Sign in to download coupons. |  |
| product | product.coupon.login_required_toast | toast/error | 로그인이 필요합니다. | Sign-in required. |  |
| product | product.coupon.download_success | toast/error | 쿠폰이 다운로드되었습니다. | Coupon downloaded. |  |
| product | product.coupon.download_failed | toast/error | 쿠폰 다운로드에 실패했습니다. | Coupon download failed. |  |
| story | story.title | heading | Brand Story | Brand Story |  |
| story | story.eyebrow | label | STORY | STORY |  |
| story | story.body | brand-intro | Still Form은 시간이 지나도 변하지 않는 사물을 모은 자리입니다. 손에 익는 목재, 결이 살아있는 리넨, 묵직한 도자기 — 재질이 스스로 말을 거는 물건을 골라 차곡차곡 소개합니다. | Still Form is a small house of objects that hold their character through years of use. Wood that softens, linen that deepens, ceramics that darken at the rim — pieces whose materials speak for themselves. |  |
| notice | notice.title | heading | Notice | Notice |  |
| notice | notice.eyebrow | label | NOTICE | NOTICE |  |
| notice | notice.fixed_badge | label | 고정 | Pinned |  |
| notice | notice.empty_title | empty-state | 등록된 공지가 없습니다 | No notices yet |  |
| notice | notice.empty_message | empty-state | 데모용 템플릿입니다. 실제 공지사항 데이터는 관리자에서 추가할 수 있습니다. | This is a demo template. Real notice data can be added from admin. |  |
| notice | notice.back_to_list | button | 목록으로 | Back to list |  |
| notice | notice.view_count | label | 조회 | views |  |
| notice | notice.prev_post | label | 이전 공지 | Previous |  |
| notice | notice.next_post | label | 다음 공지 | Next |  |
| cart | cart.title | heading | Cart | Cart |  |
| cart | cart.eyebrow | label | SHOPPING BAG | SHOPPING BAG |  |
| cart | cart.empty_title | empty-state | 장바구니가 비어 있습니다 | Your cart is empty |  |
| cart | cart.empty_message | empty-state | Shop 페이지에서 상품을 담아보세요. | Browse the shop and add something you like. |  |
| cart | cart.cta_shop | button | Shop으로 이동 | Go to Shop |  |
| cart | cart.add_to_cart | button | 장바구니 담기 | Add to cart |  |
| cart | cart.buy_now | button | 바로구매 | Buy now |  |
| cart | cart.quantity | label | 수량 | Quantity |  |
| cart | cart.sold_out | label | 품절 | Sold out |  |
| cart | cart.stopped | label | 판매중지 | Stopped |  |
| cart | cart.added_toast | toast/error | 장바구니에 담았습니다. | Added to cart. |  |
| cart | cart.buy_now_toast | toast/error | 장바구니에 담고 결제 페이지로 이동합니다. | Added to cart. Redirecting to checkout. |  |
| cart | cart.summary_title | heading | 주문 요약 | Order summary |  |
| cart | cart.summary_items | label | 상품 수 | Items |  |
| cart | cart.summary_subtotal | label | 소계 | Subtotal |  |
| cart | cart.summary_shipping | label | 배송비 | Shipping |  |
| cart | cart.summary_total | label | 총 결제금액 | Total |  |
| cart | cart.summary_checkout | button | 결제하기 | Checkout |  |
| cart | cart.summary_continue_shopping | button | 쇼핑 계속하기 | Continue shopping |  |
| cart | cart.delete | button | 삭제 | Delete |  |
| cart | cart.apply | button | 변경 | Apply | ko '변경'이 수량 변경 컨텍스트에서는 의미 통하지만 단독 라벨로 톤이 명령조에 가까움 |
| cart | cart.delete_confirm_title | toast/error | 상품을 삭제할까요? | Delete this item? |  |
| cart | cart.delete_confirm_single | toast/error | 선택한 상품을 장바구니에서 삭제합니다. | The selected item will be removed from your cart. |  |
| cart | cart.delete_confirm_multiple | toast/error | 선택한 상품을 장바구니에서 삭제합니다. | The selected items will be removed from your cart. | ko single/multiple 카피가 동일 문장으로 단/복수 구분 없음 — 영문은 구분되지만 한국어는 '상품/상품들' 등 표기 통일 필요 |
| cart | cart.delete_cancel | button | 취소 | Cancel |  |

### lang-3 (158항목)

lang/ko.json:501~721 전수 수집(메인 스레드 직접 검증). cart 후반부, common, policy, business, checkout 전체, order_complete, guest_order_form, guest_order_show. 주요 flag: cart.checkout_title 영문 그대로, cross_sell.eyebrow 영문 eyebrow, vbank_helper '직접 입금' 가상계좌 미스매치, summary.subtotal '상품금액' vs CartSummary '소계' 용어 불일치, count_suffix 어순, guest 문구에 '가입하신' 혼용, guest_order_show.subtitle 진행형 어미. LOCKED COPY·금지 표현 미사용.

| 페이지 | 키/위치 | 종류 | ko | en | flag |
|--------|---------|------|----|----|------|
| cart | cart.items_deleted | toast/error | 장바구니에서 삭제했습니다. | Removed from cart. |  |
| cart | cart.checkout_title | button | Checkout | Checkout | ko 값이 영문 'Checkout' 그대로 — 한국어 화면 영문 노출 |
| cart | cart.checkout_placeholder_title | heading | 결제 단계 준비 중 | Checkout step in progress |  |
| cart | cart.checkout_placeholder_message | main-copy | 결제/배송지/쿠폰 단계는 데모 환경에서 제한적으로 동작합니다. 데모용 템플릿이므로 실제 결제는 진행되지 않습니다. | Payment / shipping / coupon steps are limited in the demo environment. This is a demo template — no real payment is processed. |  |
| cart | cart.update_failed | toast/error | 수량 변경에 실패했습니다. | Failed to update quantity. |  |
| cart | cart.delete_failed | toast/error | 삭제에 실패했습니다. | Failed to delete item. |  |
| cart | cart.cross_sell.eyebrow | heading | YOU MAY ALSO LIKE | YOU MAY ALSO LIKE | 번역투 — 영문 식 eyebrow를 한국어 화면에 그대로 노출 |
| cart | cart.cross_sell.title | heading | 함께 보면 좋은 상품 | You may also like |  |
| global | common.all | label | 전체 | All |  |
| global | common.view_all | button | 전체 보기 | View all |  |
| global | common.demo_marker | label | demo | demo |  |
| global | common.cancel | button | 취소 | Cancel |  |
| global | common.close | button | 닫기 | Close |  |
| policy-modal | policy.terms.title | heading | 이용약관 | Terms of Service |  |
| policy-modal | policy.privacy.title | heading | 개인정보처리방침 | Privacy Policy |  |
| policy-modal | policy.published_at | label | 시행일 | Effective |  |
| policy-modal | policy.no_content | empty-state | 내용이 없습니다. | No content available. |  |
| global-footer | business.demo_notice | other | 데모 스토어입니다. 사업자 정보는 템플릿 config/business-info.json에서 설정할 수 있습니다. | Demo store. Business information can be configured in the template's config/business-info.json. |  |
| global-footer | business.links.terms | label | 이용약관 | Terms of Service |  |
| global-footer | business.links.privacy | label | 개인정보처리방침 | Privacy Policy |  |
| global-footer | business.links.shipping | label | 배송·교환·반품 안내 | Shipping, Returns & Exchanges |  |
| global-footer | business.links.verification | label | 사업자정보확인 | Verify business info |  |
| policy | business.policy.eyebrow | heading | POLICY | POLICY |  |
| policy | business.policy.note | main-copy | 본 문서는 템플릿 시안 문구입니다. 실제 운영 전 사업자 상황에 맞는 약관 작성 및 법적 검토가 필요합니다. | This document is template placeholder wording. Before launching a real store, terms must be written to match the operator's situation and reviewed legally. |  |
| checkout | checkout.title | heading | 결제 | Checkout |  |
| checkout | checkout.logged_in_as | main-copy | {{name}}님으로 주문합니다 | Ordering as {{name}} |  |
| checkout | checkout.loading | other | 주문 정보를 불러오는 중… | Loading checkout… |  |
| checkout | checkout.empty_title | toast/error | 주문 정보를 만들 수 없습니다 | Cannot create checkout | 시스템 어투 — 사용자에게 보이는 오류 제목인데 내부 동작('생성') 기준 서술 |
| checkout | checkout.back_to_cart | button | 장바구니로 돌아가기 | Back to cart |  |
| checkout | checkout.submit_error_title | toast/error | 주문 처리 중 문제가 발생했습니다 | Something went wrong while placing your order |  |
| checkout | checkout.order_failed_fallback | toast/error | 잠시 후 다시 시도해 주세요. | Please try again in a moment. |  |
| checkout | checkout.orderer.title | heading | 주문자 정보 | Orderer details |  |
| checkout | checkout.orderer.name | label | 이름 | Name |  |
| checkout | checkout.orderer.name_placeholder | placeholder | 주문자 이름 | Orderer name |  |
| checkout | checkout.orderer.phone | label | 휴대폰 | Phone |  |
| checkout | checkout.orderer.email | label | 이메일 (선택) | Email (optional) |  |
| checkout | checkout.orderer.email_placeholder | placeholder | you@example.com | you@example.com |  |
| checkout | checkout.guest_password.title | heading | 비회원 조회 비밀번호 | Guest lookup password |  |
| checkout | checkout.guest_password.password | label | 조회 비밀번호 | Lookup password |  |
| checkout | checkout.guest_password.password_placeholder | placeholder | 4자리 이상 | 4+ characters |  |
| checkout | checkout.guest_password.password_confirm | label | 조회 비밀번호 확인 | Confirm lookup password |  |
| checkout | checkout.guest_password.password_confirm_placeholder | placeholder | 비밀번호 재입력 | Re-enter password |  |
| checkout | checkout.guest_password.hint | main-copy | 주문 조회 시 사용할 비밀번호입니다. 가입 시 비밀번호와 다릅니다. | Used to look up this order later. Different from your member password. | 비회원 주문 문구에 '가입 시 비밀번호' — 회원가입 용어 혼용으로 비회원에게 위화감 |
| checkout | checkout.shipping.title | heading | 배송지 정보 | Shipping details |  |
| checkout | checkout.shipping.recipient_name | label | 받는 분 | Recipient |  |
| checkout | checkout.shipping.recipient_name_placeholder | placeholder | 받는 분 이름 | Recipient name |  |
| checkout | checkout.shipping.recipient_phone | label | 연락처 | Phone |  |
| checkout | checkout.shipping.zipcode | label | 우편번호 | Postal code |  |
| checkout | checkout.shipping.address | label | 주소 | Address |  |
| checkout | checkout.shipping.address_placeholder | placeholder | 기본 주소 | Street address | ko '기본 주소' vs en 'Street address' — 의미 어긋남 |
| checkout | checkout.shipping.address_detail | label | 상세 주소 | Detail |  |
| checkout | checkout.shipping.address_detail_placeholder | placeholder | 동/호수 등 | Building / unit / etc. |  |
| checkout | checkout.shipping.memo | label | 배송 메모 | Shipping note |  |
| checkout | checkout.shipping.memo_placeholder | placeholder | 배송 시 요청사항 | Special requests |  |
| checkout | checkout.shipping.saved_addresses | label | 저장된 배송지 | Saved addresses |  |
| checkout | checkout.shipping.manage | button | 배송지 관리 | Manage addresses |  |
| checkout | checkout.shipping.same_as_orderer | label | 주문자 정보와 동일 | Same as orderer |  |
| checkout | checkout.shipping.save_address | label | 입력한 배송지를 저장합니다 | Save this address | 체크박스 라벨인데 평서문 종결 — en 'Save this address' 명령형과 불일치 |
| checkout | checkout.shipping.country | label | 배송국가 | Shipping country |  |
| checkout | checkout.shipping.intl_address | label | 주소 (해외) | Address (International) |  |
| checkout | checkout.shipping.intl_address2 | label | 주소 상세 | Address line 2 |  |
| checkout | checkout.shipping.intl_city | label | 도시 | City |  |
| checkout | checkout.shipping.intl_state | label | 주/도/지역 | State / Province / Region |  |
| checkout | checkout.shipping.intl_postal_code | label | 우편번호 | Postal code |  |
| checkout | checkout.payment.title | heading | 결제 수단 | Payment method |  |
| checkout | checkout.payment.select_method | main-copy | 결제 방법을 선택해 주세요 | Select a payment method |  |
| checkout | checkout.payment.dbank_depositor | label | 입금자명 | Depositor name |  |
| checkout | checkout.payment.dbank_helper | main-copy | 입금 확인 후 배송이 시작됩니다. | Ships after deposit is confirmed. |  |
| checkout | checkout.payment.dbank_accounts | label | 입금 계좌 | Deposit account |  |
| checkout | checkout.payment.refund_bank | label | 환불 계좌 | Refund bank account |  |
| checkout | checkout.payment.bank_select | label | 입금 계좌 선택 | Select deposit account |  |
| checkout | checkout.payment.vbank_helper | main-copy | 직접 입금 기한 이후에는 주문이 자동 취소됩니다. | Orders are auto-cancelled after the deposit deadline. | 번역투 — '직접 입금' 표현이 가상계좌(vbank) 컨텍스트와 미스매치, en에 없는 '직접' 추가 |
| checkout | checkout.payment.deposit_due | label |  (입금 기한 {{days}}일) |  (Deposit due: {{days}} days) |  |
| checkout | checkout.payment.cash_receipt_request | label | 현금영수증 신청 | Request cash receipt |  |
| checkout | checkout.payment.cash_receipt_purpose | label | 증빙 용도 | Receipt type |  |
| checkout | checkout.payment.cash_receipt_income | label | 소득공제용 | Income deduction |  |
| checkout | checkout.payment.cash_receipt_expense | label | 지출증빙용 | Business expense |  |
| checkout | checkout.payment.cash_receipt_identifier_type | label | 발급 수단 | Identifier type |  |
| checkout | checkout.payment.cash_receipt_identifier | label | 현금영수증 번호 | Cash receipt number |  |
| checkout | checkout.payment.cash_receipt_phone | label | 휴대폰번호 | Mobile number | 띄어쓰기 — '휴대폰번호' vs 동일 페이지 '휴대폰 번호' 혼용 |
| checkout | checkout.payment.cash_receipt_card | label | 현금영수증카드 | Cash receipt card | 띄어쓰기 — '현금영수증카드' 자연스러운 표기 아님 |
| checkout | checkout.payment.cash_receipt_business | label | 사업자등록번호 | Business registration number |  |
| checkout | checkout.items.title | heading | 주문 상품 | Order items |  |
| checkout | checkout.items.quantity | label | 수량 | Qty |  |
| checkout | checkout.summary.items | label | 상품 수 | Items |  |
| checkout | checkout.summary.subtotal | label | 상품금액 | Item total | 용어 불일치 — CartSummary는 '소계', checkout summary는 '상품금액' |
| checkout | checkout.summary.shipping | label | 배송비 | Shipping |  |
| checkout | checkout.summary.discount | label | 할인 | Discount |  |
| checkout | checkout.summary.total | label | 총 결제금액 | Total |  |
| checkout | checkout.summary.title | heading | 주문 요약 | Order summary |  |
| checkout | checkout.summary.points_used | label | 적립금 사용 | Mileage |  |
| checkout | checkout.summary.shipping_coupon | label | 배송비 쿠폰 할인 | Shipping coupon discount |  |
| checkout | checkout.summary.unavailable_title | toast/error | 주문할 수 없는 상품이 포함되어 있습니다 | Your order includes unavailable items |  |
| checkout | checkout.summary.unavailable_message | toast/error | 품절·판매중지된 상품을 장바구니에서 제외한 후 다시 시도해 주세요. | Remove sold-out or stopped items in the cart and try again. |  |
| checkout | checkout.submit | button | 결제하기 | Place order |  |
| checkout | checkout.submitting | button | 처리 중… | Processing… |  |
| checkout | checkout.validation.required | toast/error | 필수 입력 항목입니다 | Required |  |
| checkout | checkout.validation.phone_format | toast/error | 올바른 휴대폰 번호가 아닙니다 | Invalid phone number |  |
| checkout | checkout.validation.email_format | toast/error | 올바른 이메일이 아닙니다 | Invalid email |  |
| checkout | checkout.validation.password_min | toast/error | 4자리 이상 입력해 주세요 | Use at least 4 characters | ko '4자리' vs en '4 characters' — 자릿수/글자수 표현 차이(숫자+영문 혼용 가능성) |
| checkout | checkout.validation.password_mismatch | toast/error | 비밀번호가 일치하지 않습니다 | Passwords do not match |  |
| checkout | checkout.page_title | seo/meta | 주문/결제 | Checkout | ko '주문/결제' vs 영문 'Checkout' — ko에는 '결제' title(543)과 '주문/결제' page_title 공존 |
| checkout | checkout.progress.cart | label | 장바구니 | Cart |  |
| checkout | checkout.progress.checkout | label | 주문/결제 | Checkout |  |
| checkout | checkout.progress.complete | label | 완료 | Complete |  |
| checkout | checkout.discount.title | heading | 할인 · 쿠폰 | Discount · Coupons |  |
| checkout | checkout.discount.download | button | 쿠폰 다운로드 | Download coupons |  |
| checkout | checkout.discount.order_coupon | label | 주문 쿠폰 | Order coupon |  |
| checkout | checkout.discount.shipping_coupon | label | 배송비 쿠폰 | Shipping coupon |  |
| checkout | checkout.discount.no_available | empty-state | 사용 가능한 쿠폰이 없습니다 | No coupons available |  |
| checkout | checkout.discount.count_suffix | label | 개 보유 |  available | 어순 — 수량 뒤에 결합되는 접미어로 단독 노출 시 '개 보유' 어색 |
| checkout | checkout.discount.already_used | label | 이미 적용됨 | Already applied |  |
| checkout | checkout.discount.select_placeholder | placeholder | 쿠폰을 선택하세요 | Select a coupon | 톤 — 동일 페이지 select_method는 '~해 주세요'인데 여기는 '~하세요' 혼용 |
| checkout | checkout.discount.discount_code | label | 할인코드 | Discount code |  |
| checkout | checkout.discount.discount_code_placeholder | placeholder | 할인코드를 입력하세요 | Enter discount code | 톤 — '~하세요' vs 페이지 전반 '~해 주세요' 혼용 |
| checkout | checkout.discount.apply | button | 적용 | Apply |  |
| checkout | checkout.mileage.title | heading | 적립금 | Mileage |  |
| checkout | checkout.mileage.available | label | 보유 적립금 | Available mileage |  |
| checkout | checkout.mileage.use_all | button | 전액 사용 | Use all |  |
| checkout | checkout.mileage.apply | button | 적용 | Apply |  |
| checkout | checkout.mileage.input_placeholder | placeholder | 사용할 적립금 | Points to use |  |
| checkout | checkout.pg.error_confirm_failed | toast/error | 결제 승인에 실패했습니다. 다시 시도해 주세요. | Payment confirmation failed. Please try again. |  |
| checkout | checkout.pg.error_amount_mismatch | toast/error | 결제 금액이 일치하지 않습니다. 주문을 다시 진행해 주세요. | Payment amount mismatch. Please place the order again. |  |
| checkout | checkout.pg.error_order_not_found | toast/error | 주문 정보를 찾을 수 없습니다. | Order not found. |  |
| checkout | checkout.pg.error_generic | toast/error | 결제 처리 중 문제가 발생했습니다. | Something went wrong during payment. |  |
| order-complete | order_complete.title | heading | 주문이 접수되었습니다 | Order placed |  |
| order-complete | order_complete.subtitle | main-copy | 주문이 정상적으로 접수되었습니다. | Your order has been received. | title과 subtitle 내용 중복 — '접수되었습니다' 반복 |
| order-complete | order_complete.bank_title | heading | 입금 안내 | Deposit information |  |
| order-complete | order_complete.bank_message | main-copy | 입금 확인 후 배송이 시작됩니다. 아래 계좌로 입금 기한까지 금액을 입금해 주세요. | Ships once deposit is confirmed. Transfer the amount to the account below before the deadline. |  |
| order-complete | order_complete.bank_label | label | 은행 | Bank |  |
| order-complete | order_complete.account_label | label | 계좌번호 | Account |  |
| order-complete | order_complete.holder_label | label | 예금주 | Holder |  |
| order-complete | order_complete.depositor_label | label | 입금자명 | Depositor |  |
| order-complete | order_complete.amount_label | label | 입금 금액 | Amount |  |
| order-complete | order_complete.due_label | label | 입금 기한 | Due by |  |
| order-complete | order_complete.vbank_notice | main-copy | 입금 기한 내 미입금 시 주문이 자동 취소될 수 있습니다. | Order auto-cancels if not deposited by the deadline. |  |
| order-complete | order_complete.guest_notice_title | heading | 비회원 주문 안내 | Guest order |  |
| order-complete | order_complete.guest_notice_lookup | main-copy | 주문번호와 가입하신 휴대폰, 조회 비밀번호로 비회원 주문 조회 페이지에서 다시 확인할 수 있습니다. | Look up this order anytime with the order number, your phone, and the lookup password. | 비회원 주문 문구에 '가입하신 휴대폰' — 회원가입 용어 혼용, 또한 ko만 휴대폰 명시(주문자 휴대폰) |
| order-complete | order_complete.order_number | label | 주문번호 | Order number |  |
| order-complete | order_complete.items_title | heading | 주문 상품 | Order items |  |
| order-complete | order_complete.shipping_title | heading | 배송지 | Shipping address |  |
| order-complete | order_complete.total_label | label | 총 결제금액 | Total |  |
| order-complete | order_complete.view_detail | button | 주문 상세 보기 | View order detail |  |
| order-complete | order_complete.continue_shopping | button | 쇼핑 계속하기 | Continue shopping |  |
| guest-order-form | guest_order_form.title | heading | 비회원 주문 조회 | Guest order lookup |  |
| guest-order-form | guest_order_form.subtitle | main-copy | 주문 시 입력한 주문번호와 휴대폰, 조회 비밀번호로 주문 내역을 다시 확인할 수 있습니다. | Use your order number, phone, and lookup password to see your order again. |  |
| guest-order-form | guest_order_form.order_number | label | 주문번호 | Order number |  |
| guest-order-form | guest_order_form.order_number_placeholder | placeholder | 주문번호 입력 | Order number |  |
| guest-order-form | guest_order_form.orderer_phone | label | 주문자 휴대폰 | Orderer phone |  |
| guest-order-form | guest_order_form.password | label | 조회 비밀번호 | Lookup password |  |
| guest-order-form | guest_order_form.password_placeholder | placeholder | 결제 시 설정한 비밀번호 | Password set at checkout |  |
| guest-order-form | guest_order_form.password_hint | main-copy | 비밀번호는 주문마다 새로 설정한 값입니다. | Set per order at checkout. |  |
| guest-order-form | guest_order_form.submit | button | 주문 조회 | Look up order |  |
| guest-order-form | guest_order_form.submitting | button | 확인 중… | Checking… |  |
| guest-order-form | guest_order_form.not_found | toast/error | 주문을 찾을 수 없습니다. 주문번호, 휴대폰, 비밀번호를 다시 확인해 주세요. | Order not found. Please check your details and try again. |  |
| guest-order-form | guest_order_form.notice | main-copy | 조회 후 주문 상세에서 30분간 주문 조회/배송지 변경이 가능합니다. 30분이 지나면 다시 조회하셔야 합니다. | After lookup, you have 30 minutes to view the order or change the shipping address. | ko만 두 번째 문장(제한 안내) 추가 — en에 없는 정보, '조회하셔야 합니다' 번역투 어미 |
| guest-order-show | guest_order_show.title | heading | 비회원 주문 상세 | Guest order detail |  |
| guest-order-show | guest_order_show.subtitle | main-copy | 주문 내역을 다시 확인하고 있습니다. | Re-viewing your order. | 정적 페이지 부제인데 진행형 어미 — en 'Re-viewing'도 어색(영문 자체 번역투) |

### shop (159항목)

| 페이지 | 키/위치 | 종류 | ko | en | flag |
|--------|---------|------|----|----|------|
| shop | routes.shop.title | seo/meta | Shop — Still Form | Shop — Still Form |  |
| shop | routes.shop.description | seo/meta | 전체 상품 목록 | All products |  |
| shop | shop.title | heading | Shop | Shop |  |
| shop | home.featured_categories.eyebrow | label | CATEGORIES | CATEGORIES |  |
| shop | shop.filter_label | label | 카테고리 | Categories |  |
| shop | common.all | label | 전체 | All |  |
| shop | shop.empty_title | empty-state | 아직 등록된 상품이 없습니다 | No products yet |  |
| shop | shop.empty_message | empty-state | 관리자에서 상품을 등록하면 이 자리에 표시됩니다. | Add products in admin and they will appear here. |  |
| shop | product.quick_add | button | 담기 | Add |  |
| category | inline literal | label | + ' items' (영문 하드코딩, ko 카피 부재) | items | 하드코딩 영문 + 미사용 ko 키 — ko.json의 category.count_label '{{count}}개 상품'이 정의되어 있으나 category.json:80에서 '+ ' items'' 영문 리터럴이 그대로 노출됨 |
| category | routes.category.title | seo/meta | Category — Still Form | Category — Still Form |  |
| category | routes.category.description | seo/meta | 카테고리별 상품 | Products in this category |  |
| category | category.empty_title | empty-state | 이 카테고리에 등록된 상품이 없습니다 | No products in this category |  |
| category | category.empty_message | empty-state | 다른 카테고리를 둘러보거나, 잠시 후 다시 확인해 주세요. | Try another category or check back later. |  |
| product | routes.product.title | seo/meta | Product — Still Form | Product — Still Form |  |
| product | routes.product.description | seo/meta | 상품 상세 | Product detail |  |
| product | product.admin_edit | label | 관리자 수정 | Admin edit |  |
| product | product.kv.category | label | 분류 | Category |  |
| product | product.kv.status | label | 상태 | Status |  |
| product | product.kv.shipping | label | 배송 | Shipping |  |
| product | product.kv.shipping_fee | label | 배송비 | Shipping fee |  |
| product | product.kv.free_shipping_threshold | label | 무료배송 | Free shipping |  |
| product | product.kv.free_shipping_over | label | :amount 이상 무료 | Free over :amount |  |
| product | product.coupon.guest_hint | toast/error | 로그인 후 다운로드할 수 있습니다. | Sign in to download coupons. |  |
| product | product.coupon.login_required_toast | toast/error | 로그인이 필요합니다. | Sign-in required. |  |
| product | product.coupon.download_success | toast/error | 쿠폰이 다운로드되었습니다. | Coupon downloaded. |  |
| product | product.coupon.download_failed | toast/error | 쿠폰 다운로드에 실패했습니다. | Coupon download failed. |  |
| product | cart.add_to_cart | button | 장바구니 담기 | Add to cart |  |
| product | cart.buy_now | button | 바로구매 | Buy now |  |
| product | cart.quantity | label | 수량 | Quantity |  |
| product | cart.sold_out | label | 품절 | Sold out |  |
| product | cart.stopped | label | 판매중지 | Stopped |  |
| product | product.description_label | label | PRODUCT | PRODUCT |  |
| product | product.description_title | heading | 상품 설명 | Description |  |
| product | product.info_label | label | INFO | INFO |  |
| product | product.info_title | heading | 안내 | Information |  |
| product | product.info.material | label | 소재 | Material |  |
| product | product.info.material_body | policy/longform | 상품 상세 페이지에서 재질별 관리 방법을 안내합니다. 일반적으로 직사광선을 피해 통풍이 잘 되는 곳에서 보관해 주세요. | Material-specific care instructions are listed on the product detail page. Store away from direct sunlight in a well-ventilated space. |  |
| product | product.info.size | label | 사이즈 | Size |  |
| product | product.info.size_body | policy/longform | 상세 사이즈는 상품 상세 정보의 치수 표를 참고해 주세요. 측정 방법에 따라 1~2cm의 오차가 생길 수 있습니다. | Refer to the size chart on the product detail page. Allow 1–2 cm variance depending on how each piece is measured. |  |
| product | product.info.care | label | 관리 | Care |  |
| product | product.info.care_body | policy/longform | 사용 전 부드러운 천으로 가볍게 닦아 주세요. 강한 세제나 연마제는 사용하지 마시고, 필요할 때 부드러운 행주로 관리해 주세요. | Wipe gently with a soft dry cloth before first use. Avoid harsh detergents or abrasives; a soft cloth is enough for daily care. |  |
| product | product.shipping_label | label | SHIPPING | SHIPPING |  |
| product | product.shipping_title | heading | 배송 안내 | Shipping & returns |  |
| product | product.shipping_body | policy/longform | 평일 기준 2~3일 내 출고되며, 출고 후 1~2일 내 배송이 완료됩니다. 배송비는 결제 단계에서 안내됩니다. 도서산간 지역은 추가 비용이 발생할 수 있습니다. | Orders ship within 2–3 business days and typically arrive 1–2 days after dispatch. Shipping fees are shown at checkout. Remote areas may incur an additional surcharge. |  |
| product | home.story.eyebrow | label | BRAND STORY | BRAND STORY |  |
| product | home.story.heading | heading | 오래 쓸수록 익어지는 것들 | Things that grow better with time |  |
| product | home.story.body | main-copy | Still Form은 시간이 지나도 변하지 않는 사물을 모은 자리입니다. 목재, 리넨, 도자기 — 손에 닿는 재질이 스스로 말을 거는 물건을 골라 천천히 소개합니다. 화려함보다 차분함, 새것보다 익은 것을 우선합니다. | Still Form gathers objects that hold their character through years of use. |  |
| product | home.hero.cta_secondary | button | Brand Story | Brand Story |  |
| product | product.related_title | heading | 함께 보면 좋은 것들 | You might also like |  |
| product | product.related_eyebrow | label | RELATED | RELATED |  |
| cart | routes.cart.title | seo/meta | Cart — Still Form | Cart — Still Form |  |
| cart | routes.cart.description | seo/meta | 장바구니 | Shopping cart |  |
| cart | cart.eyebrow | label | SHOPPING BAG | SHOPPING BAG | 번역투 — 영문 식 eyebrow 'SHOPPING BAG'를 한국어 화면에 그대로 노출 |
| cart | cart.title | heading | Cart | Cart |  |
| cart | cart.empty_title | empty-state | 장바구니가 비어 있습니다 | Your cart is empty |  |
| cart | cart.empty_message | empty-state | Shop 페이지에서 상품을 담아보세요. | Browse the shop and add something you like. |  |
| cart | cart.cta_shop | button | Shop으로 이동 | Go to Shop |  |
| cart | cart.quantity | label | 수량 | Quantity |  |
| cart | cart.delete | button | 삭제 | Delete |  |
| cart | cart.apply | button | 변경 | Apply |  |
| cart | cart.delete_confirm_title | label | 상품을 삭제할까요? | Delete this item? |  |
| cart | cart.delete_confirm_single | policy/longform | 선택한 상품을 장바구니에서 삭제합니다. | The selected item will be removed from your cart. | 확인 모달 메시지인데 평서문 종결 — 의문형/경고 톤 부재 |
| cart | common.cancel | button | 취소 | Cancel |  |
| cart | cart.cross_sell.eyebrow | label | YOU MAY ALSO LIKE | YOU MAY ALSO LIKE | 번역투 — 영문 식 eyebrow를 한국어 화면에 그대로 노출 |
| cart | cart.cross_sell.title | heading | 함께 보면 좋은 상품 | You may also like |  |
| cart | cart.summary_title | heading | 주문 요약 | Order summary |  |
| cart | cart.summary_items | label | 상품 수 | Items |  |
| cart | cart.summary_subtotal | label | 소계 | Subtotal |  |
| cart | cart.summary_shipping | label | 배송비 | Shipping |  |
| cart | cart.summary_total | label | 총 결제금액 | Total |  |
| cart | cart.summary_checkout | button | 결제하기 | Checkout |  |
| cart | cart.summary_continue_shopping | button | 쇼핑 계속하기 | Continue shopping |  |
| checkout | routes.checkout.title | seo/meta | Checkout — Still Form | Checkout — Still Form |  |
| checkout | routes.checkout.description | seo/meta | 결제 | Checkout |  |
| checkout | checkout.shipping.saved_addresses | heading | 저장된 배송지 | Saved addresses |  |
| checkout | checkout.shipping.manage | button | 배송지 관리 | Manage addresses |  |
| checkout | checkout.shipping.same_as_orderer | label | 주문자 정보와 동일 | Same as orderer |  |
| checkout | checkout.shipping.save_address | label | 입력한 배송지를 저장합니다 | Save this address | 체크박스 라벨인데 평서문 종결 — 라벨/체크 항목 톤과 불일치 |
| checkout | checkout.shipping.country | label | 배송국가 | Shipping country |  |
| checkout | checkout.discount.title | heading | 할인 · 쿠폰 | Discount · Coupons |  |
| checkout | checkout.discount.download | button | 쿠폰 다운로드 | Download coupons |  |
| checkout | checkout.discount.order_coupon | label | 주문 쿠폰 | Order coupon |  |
| checkout | checkout.discount.shipping_coupon | label | 배송비 쿠폰 | Shipping coupon |  |
| checkout | checkout.discount.no_available | label | 사용 가능한 쿠폰이 없습니다 | No coupons available |  |
| checkout | checkout.discount.count_suffix | label | 개 보유 | available | 단독 노출 시 '개 보유' 어순이 어색 — 수량 단위와 결합되어야 자연스러움 |
| checkout | checkout.discount.already_used | label | 이미 적용됨 | Already applied |  |
| checkout | checkout.discount.select_placeholder | placeholder | 쿠폰을 선택하세요 | Select a coupon |  |
| checkout | checkout.discount.discount_code | label | 할인코드 | Discount code |  |
| checkout | checkout.discount.discount_code_placeholder | placeholder | 할인코드를 입력하세요 | Enter discount code |  |
| checkout | checkout.discount.apply | button | 적용 | Apply |  |
| checkout | checkout.mileage.title | heading | 적립금 | Mileage |  |
| checkout | checkout.mileage.available | label | 보유 적립금 | Available mileage |  |
| checkout | checkout.mileage.use_all | button | 전액 사용 | Use all |  |
| checkout | checkout.mileage.apply | button | 적용 | Apply |  |
| checkout | checkout.mileage.input_placeholder | placeholder | 사용할 적립금 | Points to use |  |
| checkout | checkout.summary.points_used | label | 적립금 사용 | Mileage |  |
| checkout | checkout.summary.shipping_coupon | label | 배송비 쿠폰 할인 | Shipping coupon discount |  |
| checkout | checkout.payment.refund_bank | heading | 환불 계좌 | Refund bank account |  |
| checkout | checkout.payment.refund_bank_code | label | 은행 | Bank |  |
| checkout | checkout.payment.refund_bank_account | label | 계좌번호 | Account number |  |
| checkout | checkout.payment.refund_bank_holder | label | 예금주 | Account holder |  |
| checkout | checkout.payment.vbank_helper | policy/longform | 직접 입금 기한 이후에는 주문이 자동 취소됩니다. | Orders are auto-cancelled after the deposit deadline. | 번역투 — 영문 helper 직역, '직접 입금' 표현이 '가상계좌'와 의미상 미스매치 |
| checkout | checkout.page_title | heading | 주문/결제 | Checkout |  |
| checkout | checkout.loading | empty-state | 주문 정보를 불러오는 중… | Loading checkout… |  |
| checkout | checkout.empty_title | heading | 주문 정보를 만들 수 없습니다 | Cannot create checkout |  |
| checkout | checkout.back_to_cart | button | 장바구니로 돌아가기 | Back to cart |  |
| checkout | checkout.submit_error_title | toast/error | 주문 처리 중 문제가 발생했습니다 | Something went wrong while placing your order |  |
| checkout | checkout.order_failed_fallback | toast/error | 잠시 후 다시 시도해 주세요. | Please try again in a moment. |  |
| checkout | checkout.progress.cart | label | 장바구니 | Cart |  |
| checkout | checkout.progress.checkout | label | 주문/결제 | Checkout |  |
| checkout | checkout.progress.complete | label | 완료 | Complete |  |
| guest_order_form | routes.guest_order_form.title | seo/meta | 비회원 주문 조회 — Still Form | Guest Order Lookup — Still Form |  |
| guest_order_form | routes.guest_order_form.description | seo/meta | 주문번호로 주문 내역을 확인합니다 | Look up your order by order number |  |
| guest_order_form | guest_order_form.title | heading | 비회원 주문 조회 | Guest order lookup |  |
| guest_order_form | guest_order_form.subtitle | main-copy | 주문 시 입력한 주문번호와 휴대폰, 조회 비밀번호로 주문 내역을 다시 확인할 수 있습니다. | Use your order number, phone, and lookup password to see your order again. |  |
| guest_order_form | guest_order_form.not_found | toast/error | 주문을 찾을 수 없습니다. 주문번호, 휴대폰, 비밀번호를 다시 확인해 주세요. | Order not found. Please check your details and try again. |  |
| guest_order_form | guest_order_form.order_number | label | 주문번호 | Order number |  |
| guest_order_form | guest_order_form.order_number_placeholder | placeholder | 주문번호 입력 | Order number |  |
| guest_order_form | guest_order_form.orderer_phone | label | 주문자 휴대폰 | Orderer phone |  |
| guest_order_form | guest_order_form.orderer_phone_placeholder | placeholder | 010-0000-0000 | 010-0000-0000 |  |
| guest_order_form | guest_order_form.password | label | 조회 비밀번호 | Lookup password |  |
| guest_order_form | guest_order_form.password_placeholder | placeholder | 결제 시 설정한 비밀번호 | Password set at checkout |  |
| guest_order_form | guest_order_form.password_hint | main-copy | 비밀번호는 주문마다 새로 설정한 값입니다. | Set per order at checkout. |  |
| guest_order_form | guest_order_form.submit | button | 주문 조회 | Look up order |  |
| guest_order_form | guest_order_form.submitting | button | 확인 중… | Checking… |  |
| guest_order_form | guest_order_form.notice | policy/longform | 조회 후 주문 상세에서 30분간 주문 조회/배송지 변경이 가능합니다. 30분이 지나면 다시 조회하셔야 합니다. | After lookup, you have 30 minutes to view the order or change the shipping address. |  |
| guest_order_show | routes.guest_order_show.title | seo/meta | 비회원 주문 상세 — Still Form | Guest Order Detail — Still Form |  |
| guest_order_show | routes.guest_order_show.description | seo/meta | 비회원 주문 상세 보기 | View your guest order details |  |
| guest_order_show | guest_order_show.title | heading | 비회원 주문 상세 | Guest order detail |  |
| guest_order_show | guest_order_show.subtitle | main-copy | 주문 내역을 다시 확인하고 있습니다. | Re-viewing your order. | 정적 페이지 부제인데 진행형 어미('~있습니다') 사용 — 페이지 상태 묘사와 불일치 |
| order_complete | routes.order_complete.title | seo/meta | 주문 완료 — Still Form | Order Complete — Still Form |  |
| order_complete | routes.order_complete.description | seo/meta | 주문이 접수되었습니다 | Your order has been placed |  |
| reorder | routes.reorder | seo/meta | 재주문 | Reorder |  |
| reorder | mypage.orders.processing | main-copy | 처리 중… | Processing… |  |
| reorder | mypage.orders.reorder_success | toast/error | 상품을 장바구니에 담았습니다. | The items were added to your cart. |  |
| reorder | errors.server_error_title | toast/error | 문제가 발생했습니다 | Something went wrong |  |
| notice | routes.notice.title | seo/meta | Notice — Still Form | Notice — Still Form |  |
| notice | routes.notice.description | seo/meta | 공지사항 | Notices |  |
| notice | notice.eyebrow | label | NOTICE | NOTICE |  |
| notice | notice.title | heading | Notice | Notice |  |
| notice | notice.fixed_badge | label | 고정 | Pinned |  |
| notice | notice.empty_title | empty-state | 등록된 공지가 없습니다 | No notices yet |  |
| notice | notice.empty_message | empty-state | 데모용 템플릿입니다. 실제 공지사항 데이터는 관리자에서 추가할 수 있습니다. | This is a demo template. Real notice data can be added from admin. |  |
| notice | notice.row_aria | label | 공지 열기: :t | Open notice: :t |  |
| notice | notice.prev_page_aria | label | 이전 페이지 | Previous page |  |
| notice | notice.next_page_aria | label | 다음 페이지 | Next page |  |
| notice | notice.page_aria | label | :n 페이지 | Page :n |  |
| notice_detail | routes.notice_detail.title | seo/meta | 공지 상세 — Still Form | Notice detail — Still Form |  |
| notice_detail | routes.notice_detail.description | seo/meta | 스토어 공지 상세 보기 | Store notice detail |  |
| notice_detail | notice.back_to_list | button | 목록으로 | Back to list |  |
| notice_detail | notice.view_count | label | 조회 | views |  |
| notice_detail | notice.prev_post | label | 이전 공지 | Previous |  |
| notice_detail | notice.next_post | label | 다음 공지 | Next |  |
| shop_story | routes.story.title | seo/meta | Story — Still Form | Story — Still Form |  |
| shop_story | routes.story.description | seo/meta | 브랜드 소개 | About the brand |  |
| shop_story | story.eyebrow | label | STORY | STORY |  |
| shop_story | story.title | heading | Brand Story | Brand Story |  |
| shop_story | story.body | main-copy | Still Form은 시간이 지나도 변하지 않는 사물을 모은 자리입니다. | Still Form is a small house of objects that hold their character through years of use. |  |

### auth (91항목)

auth 디렉터리 6개 파일(login.json, register.json, forgot_password.json, reset_password.json, partials/auth/_login_form.json, partials/auth/_register_form.json) 사용자 노출 텍스트 83 entries 수집/검증 완료. ⏎  ⏎ LOCKED COPY·금지 표현 5종 모두 발견되지 않음. _modal_terms/_modal_privacy 본문은 수집 범위 밖. ⏎  ⏎ 검증 결과(파일 Read로 확정): ⏎ - 모든 ko/en 텍스트가 lang JSON의 키 값과 정확히 일치 ⏎ - 모든 layout/partial 노드(text/$t:키 참조)가 실제 JSON 트리에 존재 ⏎ - 두 flag 제거: ① `superbify.auth.reset_password.password` flag는 "제목은 재설정인데 버튼은 변경"이라 적었으나 해당 entry는 password 라벨("새 비밀번호")이지 버튼이 아님 — 잘못된 flag. ② `superbify.auth.register.language` flag는 "전화번호 placeholder (선택)"이라 적었으나 해당 entry는 language 필드("언어") — 잘못된 flag. ⏎  ⏎ 남은 flag(legitimate): ⏎ - already_member/no_account: lang.json 정의는 존재하나 login.json에서 미사용 — register.has_account("계정")과 미사용 키("회원") 간 i18n 레벨 일관성. ⏎ - register.has_account: login과 동일 의문에 "회원"/"계정" 혼용(register 노출 라벨과 미사용 already_member 키 사이). ⏎ - forgot_password.submit: title "비밀번호 찾기" vs submit "재설정 링크 보내기" — 한 페이지 내 동일 동작 표현 분리. ⏎ - reset_password.submit: ko는 submit "비밀번호 변경"/processing "변경 중..."이라 title "비밀번호 재설정"과 한 페이지 내 일관성 부족. ⏎ - * asterisk: 수집 메모 (마커 성격 안내). ⏎ - token_validation data_source: 사용자 노출 가능성 낮지만 라벨 inventory에 포함.

| 페이지 | 키/위치 | 종류 | ko | en | flag |
|--------|---------|------|----|----|------|
| auth/login | superbify.routes.login | seo/meta | 로그인 — Still Form | Login — Still Form |  |
| auth/login | superbify.auth.login_form.title | heading | 로그인 | Login |  |
| auth/login | superbify.auth.login_form.subtitle | main-copy | 계정에 로그인하세요 | Sign in to your account |  |
| auth/login | superbify.auth.already_member | other | 이미 회원이신가요? | Already a member? | lang.json에 정의되었으나 login.json에서 미참조(register.has_account와 동일 의문에 회원/계정 혼용 가능성) |
| auth/login | superbify.auth.login_form.no_account | label | 계정이 없으신가요? | Don't have an account? | lang.json에 정의되었으나 login.json에서 미참조(register.has_account와 동일 의문에 회원/계정 혼용 가능성) |
| auth/login | superbify.auth.guest_continue.title | heading | 비회원 주문 조회 | Guest order lookup |  |
| auth/login | superbify.auth.guest_continue.hint | main-copy | 주문 시 받은 주문번호로 주문 내역을 확인할 수 있습니다. | You can look up your order with the order number you received. |  |
| auth/login | superbify.auth.guest_continue.cta | button | 비회원 주문 조회 | Guest order lookup |  |
| auth/login | superbify.auth.forgot_password_link | label | 비밀번호를 잊으셨나요? | Forgot your password? |  |
| auth/login | superbify.auth.register_link | label | 회원가입 | Sign up |  |
| auth/login | (inline) | seo/meta | 무드등이 켜진 Still Form 조명 라이프스타일 | —(none) |  |
| auth/login | superbify.auth.login_form.error.invalid | toast/error | 이메일 또는 비밀번호가 올바르지 않습니다. | The email or password is incorrect. |  |
| auth/login | superbify.auth.login_form.error.email_required | toast/error | 이메일을 입력해주세요. | Please enter your email. |  |
| auth/login | superbify.auth.login_form.error.email_invalid | toast/error | 올바른 이메일 형식이 아닙니다. | Please enter a valid email address. |  |
| auth/login | superbify.auth.login_form.error.password_required | toast/error | 비밀번호를 입력해주세요. | Please enter your password. |  |
| auth/login | superbify.auth.login_form.email | label | 이메일 | Email |  |
| auth/login | superbify.auth.login_form.email_placeholder | placeholder | 이메일 주소를 입력하세요 | Enter your email address |  |
| auth/login | superbify.auth.login_form.password | label | 비밀번호 | Password |  |
| auth/login | superbify.auth.login_form.password_placeholder | placeholder | 비밀번호를 입력하세요 | Enter your password |  |
| auth/login | superbify.auth.login_form.submit | button | 로그인 | Login |  |
| auth/login | superbify.auth.login_form.processing | button | 로그인 중... | Signing in... |  |
| auth/login | superbify.auth.login_success | toast/error | 로그인되었습니다. | You are signed in. |  |
| auth/register | superbify.routes.register | seo/meta | 회원가입 — Still Form | Sign up — Still Form |  |
| auth/register | superbify.auth.register.title | heading | 회원가입 | Sign up |  |
| auth/register | superbify.auth.register.subtitle | main-copy | 새 계정을 만드세요 | Create a new account |  |
| auth/register | superbify.auth.register.has_account | label | 이미 계정이 있으신가요? | Already have an account? | 동일 의문(login/register 간)에 회원/계정 혼용 — register 노출 라벨 |
| auth/register | superbify.auth.login | label | 로그인 | Login |  |
| auth/register | (inline) | seo/meta | 무드등이 켜진 Still Form 조명 라이프스타일 | —(none) |  |
| auth/register | superbify.auth.register.section_account | heading | 계정 정보 | Account |  |
| auth/register | superbify.auth.register.section_profile | heading | 프로필 | Profile |  |
| auth/register | superbify.auth.register.section_agreements | heading | 약관 동의 | Agreements |  |
| auth/register | superbify.auth.register.email | label | 이메일 | Email |  |
| auth/register | superbify.auth.register.email_placeholder | placeholder | 이메일 주소를 입력하세요 | Enter your email address |  |
| auth/register | superbify.auth.register.password | label | 비밀번호 | Password |  |
| auth/register | superbify.auth.register.password_placeholder | placeholder | 비밀번호를 입력하세요 | Enter your password |  |
| auth/register | superbify.auth.register.password_hint | label | 비밀번호는 8자 이상이어야 합니다. | Password must be at least 8 characters. |  |
| auth/register | superbify.auth.register.password_confirm | label | 비밀번호 확인 | Confirm password |  |
| auth/register | superbify.auth.register.password_confirm_placeholder | placeholder | 비밀번호를 다시 입력하세요 | Enter your password again |  |
| auth/register | superbify.auth.register.name | label | 이름 | Name |  |
| auth/register | superbify.auth.register.name_placeholder | placeholder | 이름을 입력하세요 | Enter your name |  |
| auth/register | superbify.auth.register.nickname | label | 닉네임 | Nickname |  |
| auth/register | superbify.auth.register.nickname_placeholder | placeholder | 닉네임을 입력하세요 (선택) | Enter a nickname (optional) |  |
| auth/register | superbify.auth.register.mobile | label | 휴대폰 번호 | Mobile phone |  |
| auth/register | superbify.auth.register.mobile_placeholder | placeholder | 휴대폰 번호를 입력하세요 (선택) | Enter your mobile phone number (optional) |  |
| auth/register | superbify.auth.register.phone | label | 전화번호 | Phone |  |
| auth/register | superbify.auth.register.phone_placeholder | placeholder | 전화번호를 입력하세요 (선택) | Enter your phone number (optional) |  |
| auth/register | superbify.auth.register.language | label | 언어 | Language |  |
| auth/register | superbify.auth.register.terms_agree | label | 이용약관에 동의합니다. | I agree to the Terms of Service. |  |
| auth/register | superbify.auth.register.agree_required | label | (필수) | (required) |  |
| auth/register | superbify.auth.register.terms_link | button | 이용약관 보기 | View Terms of Service |  |
| auth/register | superbify.auth.register.privacy_agree | label | 개인정보처리방침에 동의합니다. | I agree to the Privacy Policy. |  |
| auth/register | superbify.auth.register.privacy_link | button | 개인정보처리방침 보기 | View Privacy Policy |  |
| auth/register | superbify.common.view_all | label | 전체 보기 | View all |  |
| auth/register | superbify.auth.register.submit | button | 회원가입 | Sign up |  |
| auth/register | superbify.auth.register.processing | button | 가입 중... | Creating account... |  |
| auth/register | superbify.auth.register_success | toast/error | 회원가입이 완료되었습니다. | Your account has been created. |  |
| auth/register | superbify.auth.register.error.email_required | toast/error | 이메일을 입력해주세요. | Please enter your email. |  |
| auth/register | superbify.auth.register.error.email_invalid | toast/error | 올바른 이메일 형식이 아닙니다. | Please enter a valid email address. |  |
| auth/register | superbify.auth.register.error.email_exists | toast/error | 이미 사용 중인 이메일입니다. | This email is already in use. |  |
| auth/register | superbify.auth.register.error.password_required | toast/error | 비밀번호를 입력해주세요. | Please enter a password. |  |
| auth/register | superbify.auth.register.error.password_min | toast/error | 비밀번호는 {{count}}자 이상이어야 합니다. | Password must be at least {{count}} characters. |  |
| auth/register | superbify.auth.register.error.password_mismatch | toast/error | 비밀번호가 일치하지 않습니다. | Passwords do not match. |  |
| auth/register | superbify.auth.register.error.terms_required | toast/error | 이용약관에 동의해주세요. | Please agree to the Terms of Service. |  |
| auth/register | superbify.auth.register.error.privacy_required | toast/error | 개인정보처리방침에 동의해주세요. | Please agree to the Privacy Policy. |  |
| auth/register | (inline) | other | * | * | 표시 마커 — 시각 글리프로 사용자에게 노출되는 asterisk(*) 마커. 코드성 prop은 아니나 마크업 요소의 자식 텍스트이므로 수집. |
| auth/register | superbify.data_source.termsContent | other | 이용약관 내용 | Terms content |  |
| auth/register | superbify.data_source.privacyContent | other | 개인정보처리방침 내용 | Privacy policy content |  |
| auth/forgot_password | superbify.routes.forgot_password | seo/meta | 비밀번호 찾기 — Still Form | Forgot password — Still Form |  |
| auth/forgot_password | superbify.auth.forgot_password.title | heading | 비밀번호 찾기 | Forgot password |  |
| auth/forgot_password | superbify.auth.forgot_password.subtitle | main-copy | 이메일로 비밀번호 재설정 링크를 보내드립니다 | We will email you a password reset link |  |
| auth/forgot_password | superbify.auth.forgot_password.email | label | 이메일 | Email |  |
| auth/forgot_password | superbify.auth.forgot_password.email_placeholder | placeholder | 가입한 이메일 주소를 입력하세요 | Enter the email address you registered with |  |
| auth/forgot_password | superbify.auth.forgot_password.submit | button | 재설정 링크 보내기 | Send reset link | 용어 일관성: 같은 페이지 title "비밀번호 찾기"지만 submit은 "재설정 링크 보내기"로 표현 분리 |
| auth/forgot_password | superbify.auth.forgot_password.processing | button | 전송 중... | Sending... |  |
| auth/forgot_password | superbify.auth.forgot_password.success | toast/error | 비밀번호 재설정 이메일을 보냈습니다. | A password reset email has been sent. |  |
| auth/forgot_password | superbify.auth.forgot_password.back_to_login | label | 로그인으로 돌아가기 | Back to login |  |
| auth/reset_password | superbify.routes.reset_password | seo/meta | 비밀번호 재설정 — Still Form | Reset password — Still Form |  |
| auth/reset_password | superbify.auth.reset_password.title | heading | 비밀번호 재설정 | Reset password |  |
| auth/reset_password | superbify.auth.reset_password.subtitle | main-copy | 새 비밀번호를 입력하세요 | Enter a new password |  |
| auth/reset_password | superbify.auth.reset_password.token_invalid | toast/error | 유효하지 않거나 만료된 링크입니다. 비밀번호 찾기를 다시 요청해주세요. | This link is invalid or expired. Please request a password reset again. |  |
| auth/reset_password | superbify.auth.reset_password.go_to_login | button | 로그인 | Log in |  |
| auth/reset_password | superbify.auth.reset_password.go_to_home | button | 홈으로 | Go to home |  |
| auth/reset_password | superbify.auth.reset_password.password | label | 새 비밀번호 | New password |  |
| auth/reset_password | superbify.auth.reset_password.password_placeholder | placeholder | 새 비밀번호를 입력하세요 | Enter the new password |  |
| auth/reset_password | superbify.auth.reset_password.password_confirm | label | 비밀번호 확인 | Confirm password |  |
| auth/reset_password | superbify.auth.reset_password.password_confirm_placeholder | placeholder | 새 비밀번호를 다시 입력하세요 | Enter the new password again |  |
| auth/reset_password | superbify.auth.reset_password.submit | button | 비밀번호 변경 | Change password | 영문은 "Reset password"이지만 ko submit/processing은 "비밀번호 변경"/"변경 중..."으로 같은 페이지 title "비밀번호 재설정"과 다름 |
| auth/reset_password | superbify.auth.reset_password.processing | button | 변경 중... | Updating... |  |
| auth/reset_password | superbify.auth.reset_password.success | toast/error | 비밀번호가 변경되었습니다. | Your password has been changed. |  |
| auth/reset_password | superbify.data_source.token_validation | other | 비밀번호 재설정 토큰 검증 | Password reset token validation | 사용자 노출 가능성 낮음(dataSource label_key), 그러나 inventory 보존 목적 수집 |
| auth/* | superbify.auth.already_logged_in | toast/error | 이미 로그인되어 있습니다. | You are already signed in. |  |

### mypage (131항목)

mypage 영역 카피 인벤토리(검증 완료). 검증 절차: (1) lang/ko.json 전수 확인, (2) layouts/mypage/** JSON에서 실제 사용 컨텍스트 확인. 결과: (a) 일부 entry에서 flag 과다 — 자연스러운 한국어(예: '비밀번호가 변경되었습니다', '찜 목록에서 삭제했습니다', '같은 이름의 배송지를 새 정보로 덮어쓸까요?' 등)에 잘못된 '번역투 의심' flag가 붙어 있어 정리. (b) 'addresses.confirm_delete_body' entry가 손상된 텍스트('삭제한된配送지')로 기록됨 — 실제 ko.json:290은 '삭제한 배송지는 복구할 수 없습니다.'로 정상. (c) 단순 KO↔EN 라벨 쌍(이름/Name, 저장/Save, 연락처/Phone 등)에 'term inconsistency' flag가 다수 부착되었으나 동일 페이지 내 같은 대상에 다른 명칭이 사용되는 사례가 아니므로 정리. (d) 실제 잔존 이슈: (i) '주문내역'(tabs.orders, meta title)과 '주문 내역'(orders.empty)의 띄어쓰기 불일치 — 동일 페이지 mypage-orders 내 발생, (ii) 'orders.phone' 영문 'Contact' vs 'addresses.phone' 영문 'Phone' — 같은 '연락처' 의미인데 영문 표기가 다름, (iii) 'Shop으로 이동' 영문 'Go to Shop' 사용 — 브랜드 영문 라벨 유지 정책상 의도된 것으로 보임(flag 유지 안 함). (e) LOCKED COPY/금지 표현은 발견되지 않음. (f) 동일 항목 중복(verify_message, cancel_confirm_body, mypage.title) 제거 후 통합.

| 페이지 | 키/위치 | 종류 | ko | en | flag |
|--------|---------|------|----|----|------|
| mypage (all tabs except profile_edit) | superbify.mypage.title | heading | 마이페이지 | My Page |  |
| mypage-profile-edit | superbify.mypage.profile.edit_title | heading | 프로필 수정 | Edit profile |  |
| mypage-profile-edit | superbify.mypage.profile.save | button | 저장 | Save |  |
| mypage-profile-edit | superbify.mypage.profile.updated | toast/error | 프로필을 저장했습니다. | Your profile has been saved. |  |
| mypage-profile-edit | superbify.mypage.profile.verify_title | heading | 비밀번호 확인 | Confirm password |  |
| mypage-profile-edit | superbify.mypage.profile.verify_message | other | 정보를 수정하기 전 현재 비밀번호를 다시 확인합니다. | Enter your current password before editing your profile. |  |
| mypage-profile-edit | superbify.mypage.profile.verify_error | toast/error | 비밀번호가 일치하지 않습니다. | The password does not match. |  |
| mypage-profile-edit | superbify.mypage.profile.verify_submit | button | 확인 | Confirm |  |
| mypage-profile-edit | superbify.routes.mypage_profile_edit | seo/meta | 프로필 수정 — 마이페이지 | Edit profile — My Page |  |
| mypage (all tabs) | superbify.mypage.logout_success | toast/error | 로그아웃되었습니다. | You have been signed out. |  |
| mypage multiple | superbify.mypage.cancel | button | 취소 | Cancel |  |
| mypage-addresses | superbify.mypage.delete | button | 삭제 | Delete |  |
| mypage-addresses | superbify.mypage.tabs.addresses | label | 배송지 관리 | Addresses |  |
| mypage-addresses | superbify.mypage.addresses.title | heading | 배송지 관리 | Addresses |  |
| mypage-addresses | superbify.mypage.addresses.empty | empty-state | 등록된 배송지가 없습니다. | No saved addresses yet. |  |
| mypage-addresses | superbify.mypage.addresses.add | button | 배송지 추가 | Add address |  |
| mypage-addresses | superbify.mypage.addresses.edit | button | 수정 | Edit |  |
| mypage-addresses | superbify.mypage.addresses.save | button | 저장 | Save |  |
| mypage-addresses | superbify.mypage.addresses.default | label | 기본 배송지 | Default address |  |
| mypage-addresses | superbify.mypage.addresses.set_default | button | 기본 배송지로 설정 | Set as default |  |
| mypage-addresses | superbify.mypage.addresses.confirm_delete_title | heading | 배송지를 삭제할까요? | Delete this address? |  |
| mypage-addresses | superbify.mypage.addresses.confirm_delete_body | policy/longform | 삭제한 배송지는 복구할 수 없습니다. | A deleted address cannot be restored. |  |
| mypage-addresses | superbify.mypage.addresses.deleted | toast/error | 배송지를 삭제했습니다. | The address has been deleted. |  |
| mypage-addresses | superbify.mypage.addresses.saved | toast/error | 배송지를 저장했습니다. | The address has been saved. |  |
| mypage-addresses | superbify.mypage.addresses.default_saved | toast/error | 기본 배송지로 설정했습니다. | The default address has been updated. |  |
| mypage-addresses | superbify.mypage.addresses.conflict_title | heading | 이미 사용 중인 배송지명입니다. | This address label is already in use. |  |
| mypage-addresses | superbify.mypage.addresses.conflict_body | policy/longform | 같은 이름의 배송지를 새 정보로 덮어쓸까요? | Overwrite the existing address with this one? |  |
| mypage-addresses | superbify.mypage.addresses.conflict_confirm | button | 덮어쓰기 | Overwrite |  |
| mypage-addresses | superbify.mypage.addresses.name | label | 배송지명 | Label |  |
| mypage-addresses | superbify.mypage.addresses.recipient | label | 받는 분 | Recipient | term inconsistency: 'addresses.recipient'(받는 분)과 'orders.recipient'(받는 분) 중복 키 — 같은 의미 두 곳에 노출 |
| mypage-addresses | superbify.mypage.addresses.phone | label | 연락처 | Phone | term inconsistency: 'addresses.phone' 영문 'Phone' vs 'orders.phone' 영문 'Contact' — 같은 '연락처' 의미인데 영문 표기가 다름 |
| mypage-addresses | superbify.mypage.addresses.zipcode | label | 우편번호 | Postal code |  |
| mypage-addresses | superbify.mypage.addresses.address | label | 주소 | Address |  |
| mypage-addresses | superbify.mypage.addresses.address_detail | placeholder | 상세 주소 | Address detail |  |
| mypage-addresses | superbify.routes.mypage_addresses | seo/meta | 배송지 관리 — 마이페이지 | Addresses — My Page |  |
| mypage-profile | superbify.mypage.tabs.profile | label | 프로필 | Profile |  |
| mypage-profile | superbify.mypage.profile.name | label | 이름 | Name |  |
| mypage-profile | superbify.mypage.profile.email | label | 이메일 | Email |  |
| mypage-profile | superbify.mypage.profile.phone | label | 휴대폰 | Mobile |  |
| mypage-profile | superbify.mypage.profile.nickname | label | 닉네임 | Nickname |  |
| mypage-profile | superbify.mypage.profile.joined | label | 가입일 | Joined |  |
| mypage-profile | superbify.mypage.profile.edit | button | 수정 | Edit |  |
| mypage-profile | superbify.routes.mypage_profile | seo/meta | 프로필 — 마이페이지 | Profile — My Page |  |
| mypage-orders | superbify.mypage.tabs.orders | label | 주문내역 | Orders | term inconsistency: '주문내역'(tabs.orders, meta title)과 '주문 내역'(orders.empty)의 띄어쓰기 불일치 — 동일 페이지 mypage-orders 내 발생 |
| mypage-orders | superbify.mypage.orders.empty | empty-state | 주문 내역이 없습니다. | No orders yet. | term inconsistency: '주문 내역'(orders.empty)과 '주문내역'(tabs.orders)의 띄어쓰기 불일치 |
| mypage-orders | superbify.mypage.orders.detail | button | 상세 보기 | View detail |  |
| mypage-orders | superbify.cart.cta_shop | button | Shop으로 이동 | Go to Shop |  |
| mypage-orders | superbify.routes.mypage_orders | seo/meta | 주문내역 — 마이페이지 | Orders — My Page | term inconsistency: routes.mypage_orders 메타 타이틀의 '주문내역'은 tabs.orders와 동일하지만, 같은 페이지의 orders.empty는 '주문 내역'(띄어쓰기)을 사용 — 동일 페이지 mypage-orders 내 일관성 위화감 |
| mypage-wishlist | superbify.mypage.tabs.wishlist | label | 찜한 상품 | Wishlist |  |
| mypage-wishlist | superbify.mypage.wishlist.title | heading | 찜한 상품 | Wishlist |  |
| mypage-wishlist | superbify.mypage.wishlist.empty | empty-state | 찜한 상품이 없습니다. | Your wishlist is empty. |  |
| mypage-wishlist | superbify.mypage.wishlist.remove | other | 삭제 | Remove |  |
| mypage-wishlist | superbify.mypage.wishlist.removed | toast/error | 찜 목록에서 삭제했습니다. | Removed from your wishlist. |  |
| mypage-wishlist | superbify.mypage.wishlist.add_to_cart_note | other | 장바구니에 담으려면 상품 페이지에서 담아 주세요. | To add to the cart, add the item from its product page. |  |
| mypage-wishlist | superbify.routes.mypage_wishlist | seo/meta | 찜한 상품 — 마이페이지 | Wishlist — My Page |  |
| mypage-coupons | superbify.mypage.tabs.coupons | label | 쿠폰 | Coupons |  |
| mypage-coupons | superbify.mypage.coupons.title | heading | 쿠폰 | Coupons |  |
| mypage-coupons | superbify.mypage.coupons.empty | empty-state | 보유한 쿠폰이 없습니다. | You have no coupons. |  |
| mypage-coupons | superbify.mypage.coupons.available | heading | 다운로드 가능한 쿠폰 | Available coupons |  |
| mypage-coupons | superbify.mypage.coupons.owned | heading | 보유 쿠폰 | My coupons |  |
| mypage-coupons | superbify.mypage.coupons.expires | label | 사용 기한 | Valid until |  |
| mypage-coupons | superbify.mypage.coupons.download | button | 쿠폰 받기 | Download |  |
| mypage-coupons | superbify.mypage.coupons.downloaded | toast/error | 받기 완료 | Downloaded |  |
| mypage-coupons | superbify.mypage.coupons.no_available | empty-state | 다운로드 가능한 쿠폰이 없습니다. | No coupons to download right now. | 번역투 의심: 'No coupons to download right now.' 직역. 'right now' 부사 불필요 가능 — 한국 카피 '다운로드 가능한 쿠폰이 없습니다.'는 자연스러우나 영문 보조구 right now는 어색 |
| mypage-coupons | superbify.routes.mypage_coupons | seo/meta | 쿠폰 — 마이페이지 | Coupons — My Page |  |
| mypage-mileage | superbify.mypage.tabs.mileage | label | 마일리지 | Mileage |  |
| mypage-mileage | superbify.mypage.mileage.title | heading | 마일리지 | Mileage |  |
| mypage-mileage | superbify.mypage.mileage.disabled | empty-state | 마일리지 기능이 비활성화되어 있습니다. | Mileage is currently disabled. |  |
| mypage-mileage | superbify.mypage.mileage.balance | label | 보유 마일리지 | Mileage balance |  |
| mypage-mileage | superbify.mypage.mileage.earned | label | 적립 | Earned |  |
| mypage-mileage | superbify.mypage.mileage.used | label | 사용 | Used |  |
| mypage-mileage | superbify.mypage.mileage.date | label | 날짜 | Date |  |
| mypage-mileage | superbify.mypage.mileage.history | heading | 적립 내역 | Mileage history |  |
| mypage-mileage | superbify.mypage.mileage.empty | empty-state | 적립 내역이 없습니다. | No mileage history yet. |  |
| mypage-mileage | superbify.mypage.mileage.filter.all | label | 전체 | All |  |
| mypage-mileage | superbify.mypage.mileage.filter.earn | label | 적립 | Earned |  |
| mypage-mileage | superbify.mypage.mileage.filter.use | label | 사용 | Used |  |
| mypage-mileage | superbify.routes.mypage_mileage | seo/meta | 마일리지 — 마이페이지 | Mileage — My Page |  |
| mypage-inquiries | superbify.mypage.tabs.inquiries | label | 상품 문의 | Product inquiries |  |
| mypage-inquiries | superbify.mypage.inquiries.title | heading | 상품 문의 | Product inquiries |  |
| mypage-inquiries | superbify.mypage.inquiries.empty | empty-state | 등록한 상품 문의가 없습니다. | No product inquiries yet. |  |
| mypage-inquiries | superbify.mypage.inquiries.status_answered | label | 답변 완료 | Answered |  |
| mypage-inquiries | superbify.mypage.inquiries.status_waiting | label | 답변 대기 | Awaiting reply |  |
| mypage-inquiries | superbify.mypage.inquiries.question | label | 문의 내용 | Question |  |
| mypage-inquiries | superbify.mypage.inquiries.reply | label | 판매자 답변 | Seller reply |  |
| mypage-inquiries | superbify.mypage.inquiries.view_product | button | 상품 보기 | View product |  |
| mypage-inquiries | superbify.mypage.inquiries.filter.all | label | 전체 | All |  |
| mypage-inquiries | superbify.mypage.inquiries.filter.pending | label | 답변 대기 | Awaiting reply |  |
| mypage-inquiries | superbify.mypage.inquiries.filter.answered | label | 답변 완료 | Answered |  |
| mypage-inquiries | superbify.routes.mypage_inquiries | seo/meta | 상품 문의 — 마이페이지 | Product inquiries — My Page |  |
| mypage-change-password | superbify.mypage.tabs.password | label | 비밀번호 변경 | Change password |  |
| mypage-change-password | superbify.mypage.password.current | label | 현재 비밀번호 | Current password |  |
| mypage-change-password | superbify.mypage.password.new | label | 새 비밀번호 | New password |  |
| mypage-change-password | superbify.mypage.password.confirm | label | 새 비밀번호 확인 | Confirm new password |  |
| mypage-change-password | superbify.mypage.password.submit | button | 비밀번호 변경 | Change password |  |
| mypage-change-password | superbify.mypage.password.changed | toast/error | 비밀번호가 변경되었습니다. | Your password has been changed. |  |
| mypage-change-password | superbify.routes.mypage_change_password | seo/meta | 비밀번호 변경 — 마이페이지 | Change password — My Page |  |
| mypage-order-show | superbify.mypage.orders.recipient | label | 받는 분 | Recipient | term inconsistency: 'orders.recipient'(받는 분)과 'addresses.recipient'(받는 분) 중복 키 — 같은 의미 두 곳에 노출 |
| mypage-order-show | superbify.mypage.orders.phone | label | 연락처 | Contact | term inconsistency: 'orders.phone' 영문 'Contact' vs 'addresses.phone' 영문 'Phone' — 같은 '연락처' 의미인데 영문 표기가 다름 |
| mypage-order-show | superbify.mypage.orders.address | label | 주소 | Address |  |
| mypage-order-show | superbify.mypage.orders.memo | label | 배송 메모 | Delivery memo |  |
| mypage-order-show | superbify.mypage.orders.shipping_to | heading | 배송지 | Shipping to |  |
| mypage-order-show | superbify.mypage.orders.item | heading | 상품 | Items |  |
| mypage-order-show | superbify.mypage.orders.payment | label | 결제 방법 | Payment |  |
| mypage-order-show | superbify.mypage.orders.total | label | 결제금액 | Total |  |
| mypage-order-show | superbify.mypage.orders.free_shipping | label | 무료배송 | Free shipping |  |
| mypage-order-show | superbify.mypage.orders.order_no | label | 주문번호 | Order number |  |
| mypage-order-show | superbify.mypage.orders.status | label | 상태 | Status |  |
| mypage-order-show | superbify.mypage.orders.history | heading | 주문 진행 | Order history |  |
| mypage-order-show | superbify.mypage.orders.date | label | 주문일 | Order date |  |
| mypage-order-show | superbify.mypage.orders.payment_date | label | 결제일 | Payment date |  |
| mypage-order-show | superbify.mypage.orders.cancelled_at | label | 취소일 | Cancelled at |  |
| mypage-order-show | superbify.mypage.orders.cancel_reason | label | 취소 사유 | Cancellation reason |  |
| mypage-order-show | superbify.mypage.orders.reason_placeholder | placeholder | 취소 사유를 선택해 주세요. | Select a cancellation reason. |  |
| mypage-order-show | superbify.mypage.orders.cancel_confirm_body | policy/longform | 취소한 주문은 되돌릴 수 없습니다. 이 주문을 취소합니다. | A cancelled order cannot be restored. This order will be cancelled. | 번역투 의심: 'A cancelled order cannot be restored. This order will be cancelled.' 직역체. 영문 구조 단편적/반복. 한국어는 '취소한 주문은 되돌릴 수 없습니다. 이 주문을 취소합니다.'로 의미 전달은 되지만 영문 패턴이 어색해 카피 일관성 측면에서 재검토 대상 |
| mypage-order-show | superbify.mypage.orders.cancel_confirm_title | heading | 주문을 취소할까요? | Cancel this order? |  |
| mypage-order-show | superbify.mypage.orders.cancel | button | 주문 취소 | Cancel order |  |
| mypage-order-show | superbify.mypage.orders.cancel_success | toast/error | 주문이 취소되었습니다. | Your order has been cancelled. |  |
| mypage-order-show | superbify.mypage.orders.cancelled | label | 취소됨 | Cancelled |  |
| mypage-order-show | superbify.mypage.orders.reorder | button | 재주문 | Reorder |  |
| mypage-order-show | superbify.mypage.orders.reorder_success | toast/error | 상품을 장바구니에 담았습니다. | Items added to cart. |  |
| mypage-order-show | superbify.mypage.orders.processing | other | 처리 중… | Processing… |  |
| mypage-order-show | superbify.checkout.summary.subtotal | label | 상품금액 | Item total |  |
| mypage-order-show | superbify.cart.delete_cancel | button | 취소 | Cancel | term inconsistency: cart.delete_cancel(취소)을 orders._modal_cancel confirm dialog의 cancelLabel로 재사용 — cart 영역 키를 mypage에 재사용 |
| mypage-order-show | superbify.errors.server_error_title | toast/error | 문제가 발생했습니다 | Something went wrong |  |
| mypage-order-show | superbify.notice.back_to_list | other | 목록으로 | Back to list |  |
| mypage-order-show | superbify.routes.mypage_order | seo/meta | 주문 상세 — 마이페이지 | Order Detail — My Page |  |
| mypage pagination | superbify.notice.prev_page_aria | other | 이전 페이지 | Previous page |  |
| mypage pagination | superbify.notice.next_page_aria | other | 다음 페이지 | Next page |  |
| mypage pagination | superbify.notice.page_aria | other | :n 페이지 | Page :n |  |
| mypage data source | superbify.data_source.current_user | other | 로그인 사용자 | Signed-in user |  |

### policy (72항목)

입력 inventory 검토 후 수정 사항: (1) errors 영역 5건의 flag가 모두 잘못된 판단 — 모든 한국어 메시지는 일관되게 존댓말 종결(~습니다/~입니다/~세요) 사용. "평어/혼용" 플래그 전부 제거. (2) "데모 스토어" 용어 단일 출현 flag 2건 잘못 — privacy sections[1]과 demo_notice에도 동일 표기되어 의도적 구분이므로 제거. (3) 누락 항목 추가: 정책 문단 표제 15개 + 모달에서 사용되는 published_at/no_content/policy.terms.title/policy.privacy.title 4개. (4) shippingReturns sections[1]에서 "수령 후 7일"과 "수령일 이전 7일"이 같은 "7일"을 다른 기산점으로 사용 — 시간 기준 모호함 신규 flag. LOCKED COPY/금지 표현 해당 없음 (Still Form 브랜드, 20ft LOCKED와 무관).

| 페이지 | 키/위치 | 종류 | ko | en | flag |
|--------|---------|------|----|----|------|
| errors-404 | superbify.errors.not_found_description | empty-state | 요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다. | The page you requested does not exist or has been moved. |  |
| errors-404 | superbify.errors.not_found_title | heading | 페이지를 찾을 수 없습니다 | Page not found |  |
| errors-404 | superbify.nav.shop | button | Shop | Shop |  |
| errors-403 | superbify.errors.forbidden_description | empty-state | 이 페이지에 접근할 수 있는 권한이 없습니다. | You don't have permission to access this page. |  |
| errors-403 | superbify.errors.forbidden_title | heading | 접근 권한이 없습니다 | Access denied |  |
| errors-500 | superbify.errors.server_error_description | empty-state | 잠시 후 다시 시도해 주세요. | Please try again in a moment. |  |
| errors-500 | superbify.errors.server_error_title | heading | 문제가 발생했습니다 | Something went wrong |  |
| errors-401 | superbify.errors.unauthorized_message | empty-state | 회원 전용 페이지입니다. 로그인 후 다시 이용해 주세요. | This page is for members. Please sign in and try again. |  |
| errors-401 | superbify.errors.unauthorized_title | heading | 로그인이 필요합니다 | Sign-in required |  |
| errors-401 | superbify.errors.unauthorized_cta_login | button | 로그인하러 가기 | Go to sign in |  |
| errors-401 | superbify.errors.unauthorized_cta_home | button | 홈으로 가기 | Go to home |  |
| shop-story | superbify.routes.story.title | seo/meta | Story — Still Form | Story — Still Form |  |
| shop-story | superbify.routes.story.description | seo/meta | 브랜드 소개 | About the brand |  |
| shop-story | superbify.story.eyebrow | label | STORY | STORY |  |
| shop-story | superbify.story.title | heading | Brand Story | Brand Story |  |
| shop-story | superbify.story.body | brand-intro | Still Form은 시간이 지나도 변하지 않는 사물을 모은 자리입니다. 손에 익는 목재, 결이 살아있는 리넨, 묵직한 도자기 — 재질이 스스로 말을 거는 물건을 골라 차곡차곡 소개합니다. | Still Form is a small house of objects that hold their character through years of use. Wood that softens, linen that deepens, ceramics that darken at the rim — pieces whose materials speak for themselves. |  |
| shop-terms | superbify.routes.terms.title | seo/meta | 이용약관 — Still Form | Terms of Service — Still Form |  |
| shop-terms | superbify.routes.terms.description | seo/meta | 스토어 이용약관 안내 | Store terms of service |  |
| shop-terms | config.policies.terms.title | heading | 이용약관 | Terms of Service |  |
| shop-terms | config.policies.terms.sections[0] | policy/longform | 이 약관은 스틸폼(이하 '스토어')이 운영하는 온라인 쇼핑몰에서 제공하는 서비스와 상품의 이용 조건 및 절차, 스토어와 이용자의 권리·의무, 책임 사항 등을 규정함을 목적으로 합니다. | These terms govern the conditions and procedures for using the services and products of the Still Form online store (the 'Store'), and the rights, duties, and responsibilities of the Store and its users. |  |
| shop-terms | config.policies.terms.sections[1] | policy/longform | 스토어는 상품 전시, 구매, 주문 확인 등 온라인 쇼핑몰 서비스를 제공합니다. 서비스는 연중무휴 운영을 원칙으로 하며, 시스템 점검 등 불가피한 사유로 일시 중단될 수 있습니다. | The Store provides online shopping services including product display, purchase, and order confirmation. Services operate year-round and may be suspended temporarily for system maintenance. |  |
| shop-terms | config.policies.terms.sections[2] | policy/longform | 상품의 가격, 옵션, 재고 등은 주문 시점을 기준으로 합니다. 장바구니에 담긴 상품은 일정 기간 임시 주문으로 보관되며, 결제가 완료되면 주문이 확정됩니다. | Product prices, options, and stock levels are based on the time of order. Cart items are held as a temporary order for a limited period and are confirmed once payment is completed. |  |
| shop-terms | config.policies.terms.sections[2].paragraphs[1] | policy/longform | 데모 스토어에 게시된 상품 이미지와 설명 중 일부는 템플릿 출하용 예시 자산입니다. | Some product images and descriptions in this demo store are template sample assets. |  |
| shop-terms | config.policies.terms.sections[3] | policy/longform | 스토어는 관련 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않고, 지속적이고 안정적으로 상품과 서비스를 제공하기 위해 노력합니다. | The Store shall not act in violation of applicable law, these terms, or public order and morals, and shall strive to provide products and services continuously and reliably. |  |
| shop-terms | config.policies.terms.sections[4] | policy/longform | 스토어에 게시된 공지, 사진, 리뷰 등 콘텐츠에 대한 권리와 관리 책임은 게시 주체에게 있으며, 스토어는 서비스 운영을 위해 필요한 범위에서 게시물을 관리할 수 있습니다. | Rights over and responsibility for postings, photos, and reviews rest with their authors. The Store may moderate postings to the extent necessary to operate the service. |  |
| shop-terms | config.policies.terms.sections[5] | policy/longform | 본 약관은 템플릿 시안 문구입니다. 운영 전 실제 이용약관/개인정보처리방침 작성 및 법적 검토가 필요합니다. | These terms are template scaffolding. Replace all placeholder text and obtain legal review before launching a real store. |  |
| shop-terms | config.business-info.json updated (terms) | label | 2026-09-01 | 2026-09-01 |  |
| shop-terms | config.policies.terms.sections[0].heading | heading | 제1조 (목적) | Article 1 (Purpose) |  |
| shop-terms | config.policies.terms.sections[1].heading | heading | 제2조 (서비스 이용) | Article 2 (Use of the service) |  |
| shop-terms | config.policies.terms.sections[2].heading | heading | 제3조 (상품 정보 및 구매) | Article 3 (Product information and purchase) |  |
| shop-terms | config.policies.terms.sections[3].heading | heading | 제4조 (스토어의 의무) | Article 4 (Duties of the Store) |  |
| shop-terms | config.policies.terms.sections[4].heading | heading | 제5조 (게시물 및 콘텐츠) | Article 5 (Postings and content) |  |
| shop-terms | config.policies.terms.sections[5].heading | heading | 실제 운영 전 확인 | Before launching a real store |  |
| shop-privacy | superbify.routes.privacy.title | seo/meta | 개인정보처리방침 — Still Form | Privacy Policy — Still Form |  |
| shop-privacy | superbify.routes.privacy.description | seo/meta | 개인정보처리방침 안내 | Privacy policy information |  |
| shop-privacy | config.policies.privacy.title | heading | 개인정보처리방침 | Privacy Policy |  |
| shop-privacy | config.policies.privacy.sections[0] | policy/longform | 스토어는 상품 주문 및 배송, 고객 문의 응대, 게시물 이용 등 서비스 제공에 필요한 최소한의 개인정보만을 처리합니다. | The Store processes only the minimum personal information necessary to provide services such as product ordering, delivery, handling customer inquiries, and postings. |  |
| shop-privacy | config.policies.privacy.sections[1] | policy/longform | 주문 과정에서 이름, 연락처, 배송지 주소, 결제에 필요한 정보가 수집될 수 있습니다. 게시물 작성 시 닉네임과 이메일이 처리될 수 있습니다. 이 데모 스토어는 실제 결제나 배송이 발생하지 않습니다. | During ordering the store may collect name, contact details, delivery address, and information needed for payment. Nickname and email may be processed for postings. This demo store does not perform real payments or deliveries. |  |
| shop-privacy | config.policies.privacy.sections[2] | policy/longform | 개인정보는 수집·이용 목적이 달성되면 해당 정보를 지체 없이 파기합니다. 관련 법령에 따라 보존이 필요한 경우 정해진 기간 동안 안전하게 보관합니다. | Personal information is destroyed without delay once the purpose of collection and use is fulfilled. Where retention is required by applicable law, it is kept securely for the statutory period. |  |
| shop-privacy | config.policies.privacy.sections[3] | policy/longform | 이용자는 자신의 개인정보에 대해 열람, 정정·삭제, 처리정지를 요청할 수 있으며, 고객센터를 통해 절차 안내를 받을 수 있습니다. | You may request to view, correct, delete, or suspend the processing of your personal information. Contact customer service for the process. |  |
| shop-privacy | config.policies.privacy.sections[4] | policy/longform | 개인정보 처리 관련 문의는 고객센터(070-123-1234)로 연락할 수 있습니다. | For questions about personal information, contact customer service at 070-123-1234. |  |
| shop-privacy | config.policies.privacy.sections[5] | policy/longform | 본 개인정보처리방침은 템플릿 시안 문구입니다. 운영 전 실제 이용약관/개인정보처리방침 작성 및 법적 검토가 필요합니다. | This privacy policy is template scaffolding. Replace all placeholder text and obtain legal review before launching a real store. |  |
| shop-privacy | config.business-info.json updated (privacy) | label | 2026-09-01 | 2026-09-01 |  |
| shop-privacy | config.policies.privacy.sections[0].heading | heading | 제1조 (개인정보의 처리 목적) | Article 1 (Purpose of processing) |  |
| shop-privacy | config.policies.privacy.sections[1].heading | heading | 제2조 (수집하는 개인정보 항목) | Article 2 (Items collected) |  |
| shop-privacy | config.policies.privacy.sections[2].heading | heading | 제3조 (보관 기간 및 파기) | Article 3 (Retention and disposal) |  |
| shop-privacy | config.policies.privacy.sections[3].heading | heading | 제4조 (이용자 권리) | Article 4 (Your rights) |  |
| shop-privacy | config.policies.privacy.sections[4].heading | heading | 제5조 (개인정보 보호책임자) | Article 5 (Privacy officer) |  |
| shop-privacy | config.policies.privacy.sections[5].heading | heading | 실제 운영 전 확인 | Before launching a real store |  |
| shop-shipping-policy | superbify.routes.shipping_policy.title | seo/meta | 배송·교환·반품 안내 — Still Form | Shipping, Returns & Exchanges — Still Form |  |
| shop-shipping-policy | superbify.routes.shipping_policy.description | seo/meta | 배송, 교환, 반품 안내 | Shipping, exchange, and return information |  |
| shop-shipping-policy | config.policies.shippingReturns.title | heading | 배송·교환·반품 안내 | Shipping, Returns & Exchanges |  |
| shop-shipping-policy | config.policies.shippingReturns.sections[0] | policy/longform | 결제 완료 후 상품을 확인하고 평일 기준 2~3일 내에 출고하며, 출고 후 1~2일 내에 수령하실 수 있습니다. 배송비는 주문 화면에 표시되는 금액을 따릅니다. 도서산간 지역은 추가 배송비가 발생할 수 있습니다. | Orders ship within 2–3 business days after payment confirmation and typically arrive 1–2 days after dispatch. Shipping fees follow the amount shown at checkout. Additional fees may apply to remote areas. |  |
| shop-shipping-policy | config.policies.shippingReturns.sections[1] | policy/longform | 상품 수령 후 7일 이내에 미사용 상품에 한하여 교환·반품을 요청할 수 있습니다. 상품 수령일 이전에 구매의사를 철회하는 경우에도 7일 이내에 취소를 요청할 수 있습니다. | Exchanges and returns may be requested within 7 days of receipt for unused products in original condition. A purchase may be cancelled within 7 days of receipt. | 시간 기산점 모호 — 동일 문장에서 "수령 후 7일 이내"와 "수령일 이전 7일 이내"가 같은 "7일"을 서로 다른 기준일로 사용 |
| shop-shipping-policy | config.policies.shippingReturns.sections[3] | policy/longform | 운영 전 실제 이용약관/개인정보처리방침 작성 및 법적 검토가 필요합니다. | Replace all placeholder text before launching a real store. | 내용-문맥 불일치 — 배송·교환·반품 정책의 마감 문단인데 "이용약관/개인정보처리방침 작성 및 법적 검토"만 언급, 배송 관련 내용은 없음 |
| shop-shipping-policy | config.business-info.json updated (shippingReturns) | label | 2026-09-01 | 2026-09-01 |  |
| shop-shipping-policy | config.policies.shippingReturns.sections[0].heading | heading | 배송 안내 | Shipping |  |
| shop-shipping-policy | config.policies.shippingReturns.sections[1].heading | heading | 교환 및 반품 | Exchanges and returns |  |
| shop-shipping-policy | config.policies.shippingReturns.sections[2].heading | heading | 예외 사항 | Exceptions |  |
| shop-shipping-policy | config.policies.shippingReturns.sections[3].heading | heading | 실제 운영 전 확인 | Before launching a real store |  |
| shop-shipping-policy | config.policies.shippingReturns.sections[2] | policy/longform | 이용자 책임 사유로 상품이 훼손된 경우, 시간 경과로 재판매가 곤란할 정도로 가치가 훼손된 경우, 복제가 가능한 상품의 포장을 개봉한 경우에는 교환·반품이 제한될 수 있습니다. 자세한 사항은 고객센터(070-123-1234)로 문의해 주세요. | Exchanges and returns may be limited if the product is damaged by the user, has lost value over time, or if packaging of a duplicable product has been opened. For details, contact customer service at 070-123-1234. |  |
| policy-chrome | superbify.business.policy.eyebrow | label | POLICY | POLICY |  |
| policy-chrome | superbify.business.policy.note | policy/longform | 본 문서는 템플릿 시안 문구입니다. 실제 운영 전 사업자 상황에 맞는 약관 작성 및 법적 검토가 필요합니다. | This document is template placeholder wording. Before launching a real store, terms must be written to match the operator's situation and reviewed legally. |  |
| global-footer | superbify.business.links.terms | label | 이용약관 | Terms of Service |  |
| global-footer | superbify.business.links.privacy | label | 개인정보처리방침 | Privacy Policy |  |
| global-footer | superbify.business.links.shipping | label | 배송·교환·반품 안내 | Shipping, Returns & Exchanges |  |
| global-footer | superbify.business.links.verification | label | 사업자정보확인 | Verify business info |  |
| global-footer | superbify.business.demo_notice | main-copy | 데모 스토어입니다. 사업자 정보는 템플릿 config/business-info.json에서 설정할 수 있습니다. | Demo store. Business information can be configured in the template's config/business-info.json. |  |
| auth-modal-terms-privacy | superbify.policy.published_at | label | 시행일 | Effective |  |
| auth-modal-terms-privacy | superbify.policy.no_content | empty-state | 내용이 없습니다. | No content available. |  |
| auth-modal-terms | superbify.policy.terms.title | heading | 이용약관 | Terms of Service |  |
| auth-modal-privacy | superbify.policy.privacy.title | heading | 개인정보처리방침 | Privacy Policy |  |

### components-shop (188항목)

검증 결과: 1) 'checkout-couponCountSuffixLabel'(개 보유) 플래그 제거 - 접미사 단독 사용으로 띄어쓰기 문제 없음. 2) CartSummary '소계' vs CheckoutForm '상품금액' 용어 불일치 플래그는 유지. 3) 'checkout-emptyMethodsMessage' 번역투 플래그 유지. 4) EmptyState/CrossSellStrip의 하드코딩 영문 기본값 추가 플래그. 5) LOCKED/금지 표현 발견 없음.

| 페이지 | 키/위치 | 종류 | ko | en | flag |
|--------|---------|------|----|----|------|
| product-detail | addToCartLabel | button | 장바구니 담기 | Add to cart |  |
| product-detail | buyNowLabel | button | 바로구매 | Buy now |  |
| product-detail | quantityLabel | label | 수량 | Quantity |  |
| product-detail | soldOutLabel | button | 품절 | Sold out |  |
| product-detail | stoppedLabel | button | 판매중지 | Stopped |  |
| product-detail | add-panel-submitting-add | button | 담는 중… | Adding… |  |
| product-detail | add-panel-submitting-buy | button | 이동 중… | Redirecting… |  |
| product-detail | purchase-err-additional-option | toast/error | '{name}' 필수 추가 옵션을 선택해 주세요. | Please select required additional option '{name}'. |  |
| product-detail | purchase-err-additional-option-custom | toast/error | '{name}' 직접 입력 값을 입력해 주세요. | Please enter a custom value for '{name}'. |  |
| product-detail | purchase-err-no-option | toast/error | 옵션을 선택해 주세요. | Please select an option. |  |
| product-detail | coupon-guestMessage | label | 로그인이 필요합니다. | Login required. |  |
| product-detail | coupon-loginRequiredToastMessage | toast/error | 로그인이 필요합니다. | Login required. |  |
| product-detail | coupon-downloadSuccessMessage | toast/error | 쿠폰이 다운로드되었습니다. | Coupon downloaded. |  |
| product-detail | coupon-downloadFailedMessage | toast/error | 쿠폰 다운로드에 실패했습니다. | Coupon download failed. |  |
| cart | cart-quantityLabel | label | 수량 | Quantity |  |
| cart | cart-deleteLabel | button | 삭제 | Delete |  |
| cart | cart-applyLabel | button | 변경 | Apply |  |
| cart | cart-deleteConfirmTitle | label | 상품을 삭제할까요? | Delete this item? |  |
| cart | cart-deleteConfirmMessage | empty-state | 선택한 상품을 장바구니에서 삭제합니다. | This will remove the selected item from your cart. |  |
| cart | cart-deleteConfirmConfirmLabel | button | 삭제 | Delete |  |
| cart | cart-deleteConfirmCancelLabel | button | 취소 | Cancel |  |
| cart | cart-option-prefix | label | 옵션: {optionName} | Option: {optionName} |  |
| cart | cart-additional-option-prefix | label | 추가옵션: {label}{custom}{price} | Additional option: {label}{custom}{price} |  |
| cart | cart-summaryTitle | heading | 주문 요약 | Order summary |  |
| cart | cart-itemsLabel | label | 상품 수 | Items |  |
| cart | cart-subtotalLabel | label | 소계 | Subtotal |  |
| cart | cart-shippingLabel | label | 배송비 | Shipping |  |
| cart | cart-totalLabel | label | 총 결제금액 | Total |  |
| cart | cart-checkoutLabel | button | 결제하기 | Checkout |  |
| cart | cart-continueShoppingLabel | button | 쇼핑 계속하기 | Continue shopping |  |
| checkout | checkout-ordererInfoTitle | heading | 주문자 정보 | Orderer information |  |
| checkout | checkout-ordererNameLabel | label | 이름 | Name |  |
| checkout | checkout-ordererNamePlaceholder | placeholder | 주문자 이름 | Orderer name |  |
| checkout | checkout-ordererPhoneLabel | label | 연락처 | Phone |  |
| checkout | checkout-ordererPhonePlaceholder | placeholder | 010-0000-0000 | 010-0000-0000 |  |
| checkout | checkout-ordererEmailLabel | label | 이메일 | Email |  |
| checkout | checkout-ordererEmailPlaceholder | placeholder | name@example.com | name@example.com |  |
| checkout | checkout-guestLookupPasswordLabel | label | 비회원 조회 비밀번호 | Guest lookup password |  |
| checkout | checkout-guestLookupPasswordPlaceholder | placeholder | 8자 이상 | 8+ characters |  |
| checkout | checkout-guestLookupConfirmLabel | label | 비밀번호 확인 | Confirm password |  |
| checkout | checkout-guestLookupConfirmPlaceholder | placeholder | 다시 입력 | Re-enter |  |
| checkout | checkout-guestLookupHint | label | 주문 조회 시 사용할 비밀번호 (8자 이상) | Password for order lookup (8+ characters) |  |
| checkout | checkout-guestLookupSectionTitle | heading | 비회원 주문 조회 비밀번호 | Guest order lookup password |  |
| checkout | checkout-shippingInfoTitle | heading | 배송지 정보 | Shipping information |  |
| checkout | checkout-savedAddressTitle | heading | 저장된 배송지 | Saved addresses |  |
| checkout | checkout-manageAddressesLabel | button | 배송지 관리 | Manage addresses |  |
| checkout | checkout-sameAsOrdererLabel | label | 주문자 정보와 동일 | Same as orderer |  |
| checkout | checkout-saveAddressLabel | label | 입력한 배송지를 저장합니다 | Save the entered address |  |
| checkout | checkout-recipientNameLabel | label | 받는 분 | Recipient |  |
| checkout | checkout-recipientNamePlaceholder | placeholder | 받는 분 이름 | Recipient name |  |
| checkout | checkout-recipientPhoneLabel | label | 연락처 | Phone |  |
| checkout | checkout-recipientPhonePlaceholder | placeholder | 010-0000-0000 | 010-0000-0000 |  |
| checkout | checkout-countryLabel | label | 배송국가 | Country |  |
| checkout | checkout-zipcodeLabel | label | 우편번호 | Postal code |  |
| checkout | checkout-zipcodePlaceholder | placeholder | 우편번호 | Postal code |  |
| checkout | checkout-addressLabel | label | 주소 | Address |  |
| checkout | checkout-addressPlaceholder | placeholder | 기본 주소 | Base address |  |
| checkout | checkout-addressDetailLabel | label | 상세 주소 | Detail address |  |
| checkout | checkout-addressDetailPlaceholder | placeholder | 동/호수 등 | Building/room etc. |  |
| checkout | checkout-intlAddressLabel | label | 주소 (해외) | Address (Intl) |  |
| checkout | checkout-intlAddress1Placeholder | placeholder | 주소 (Street address) | Address (Street address) |  |
| checkout | checkout-intlAddress2Label | label | 주소 상세 | Address detail |  |
| checkout | checkout-intlAddress2Placeholder | placeholder | 아파트/동/호수 등 (Apt, suite, unit) | Apt, suite, unit etc. |  |
| checkout | checkout-intlCityLabel | label | 도시 | City |  |
| checkout | checkout-intlCityPlaceholder | placeholder | 도시 (City) | City |  |
| checkout | checkout-intlStateLabel | label | 주/도/지역 | State / Province / Region |  |
| checkout | checkout-intlStatePlaceholder | placeholder | 주(State) / 도(Province) / 지역 | State / Province / Region |  |
| checkout | checkout-intlPostalCodeLabel | label | 우편번호 | Postal code |  |
| checkout | checkout-intlPostalCodePlaceholder | placeholder | 우편번호 (Postal code) | Postal code |  |
| checkout | checkout-memoLabel | label | 배송 메모 | Delivery memo |  |
| checkout | checkout-memoPlaceholder | placeholder | 배송 메모를 선택하세요 | Select a delivery memo |  |
| checkout | checkout-memo-door | label | 문 앞에 두고 가주세요 | Please leave at the door |  |
| checkout | checkout-memo-security | label | 경비실에 맡겨주세요 | Leave at the front desk |  |
| checkout | checkout-memo-parcel-box | label | 택배함에 넣어주세요 | Place in the parcel locker |  |
| checkout | checkout-memo-call | label | 배송 전 연락 부탁드립니다 | Please contact before delivery |  |
| checkout | checkout-memo-custom-placeholder | placeholder | 배송 메모를 입력해 주세요 | Please enter a delivery memo |  |
| checkout | checkout-paymentMethodTitle | heading | 결제 수단 | Payment method |  |
| checkout | checkout-depositorNameLabel | label | 입금자명 | Depositor name |  |
| checkout | checkout-depositorNamePlaceholder | placeholder | 입금자명 | Depositor name |  |
| checkout | checkout-bankAccountsTitle | heading | 입금 계좌 | Deposit account |  |
| checkout | checkout-bankSelectLabel | label | 입금 계좌 선택 | Select a deposit account |  |
| checkout | checkout-dbankHelperLabel | label | 입금 확인 후 배송이 시작됩니다. | Shipping starts after deposit is confirmed. |  |
| checkout | checkout-vbankHelperLabel | label | 입금 기한이 지나면 주문이 자동 취소됩니다. | If the deposit deadline passes, the order is auto-cancelled. |  |
| checkout | checkout-refundBankTitle | heading | 환불 계좌 | Refund account |  |
| checkout | checkout-refundBankCodeLabel | label | 은행 | Bank |  |
| checkout | checkout-refundBankAccountLabel | label | 계좌번호 | Account number |  |
| checkout | checkout-refundBankHolderLabel | label | 예금주 | Account holder |  |
| checkout | checkout-cashReceiptRequestLabel | label | 현금영수증 신청 | Request cash receipt |  |
| checkout | checkout-cashReceiptPurposeLabel | label | 증빙 용도 | Proof purpose |  |
| checkout | checkout-cashReceiptIncomeLabel | label | 소득공제용 | For income deduction |  |
| checkout | checkout-cashReceiptExpenseLabel | label | 지출증빙용 | For expense proof |  |
| checkout | checkout-cashReceiptIdentifierTypeLabel | label | 발급 수단 | Issue method |  |
| checkout | checkout-cashReceiptIdentifierLabel | label | 현금영수증 번호 | Cash receipt number |  |
| checkout | checkout-cashReceiptIdentifierPlaceholder | placeholder | 휴대폰 번호 또는 카드 번호 | Phone number or card number |  |
| checkout | checkout-cashReceiptIdentifierPhoneLabel | label | 휴대폰번호 | Mobile number |  |
| checkout | checkout-cashReceiptIdentifierCardLabel | label | 현금영수증카드 | Cash receipt card |  |
| checkout | checkout-cashReceiptIdentifierBusinessLabel | label | 사업자등록번호 | Business registration number |  |
| checkout | checkout-discountSectionTitle | heading | 할인 · 쿠폰 | Discount & coupons |  |
| checkout | checkout-couponDownloadLabel | button | 쿠폰 다운로드 | Download coupons |  |
| checkout | checkout-orderCouponLabel | label | 주문 쿠폰 | Order coupon |  |
| checkout | checkout-shippingCouponLabel | label | 배송비 쿠폰 | Shipping coupon |  |
| checkout | checkout-couponNoAvailableLabel | empty-state | 사용 가능한 쿠폰이 없습니다 | No coupons available |  |
| checkout | checkout-couponCountSuffixLabel | label | 개 보유 | owned |  |
| checkout | checkout-couponAlreadyUsedLabel | label | 이미 적용됨 | Already applied |  |
| checkout | checkout-couponSelectPlaceholder | placeholder | 쿠폰을 선택하세요 | Select a coupon |  |
| checkout | checkout-discountCodeLabel | label | 할인코드 | Discount code |  |
| checkout | checkout-discountCodePlaceholder | placeholder | 할인코드를 입력하세요 | Enter a discount code |  |
| checkout | checkout-discountCodeApplyLabel | button | 적용 | Apply |  |
| checkout | checkout-mileageSectionTitle | heading | 적립금 | Points |  |
| checkout | checkout-mileageAvailableLabel | label | 보유 적립금 | Available points |  |
| checkout | checkout-mileageUseAllLabel | button | 전액 사용 | Use all |  |
| checkout | checkout-mileageApplyLabel | button | 적용 | Apply |  |
| checkout | checkout-mileageInputPlaceholder | placeholder | 사용할 적립금 | Points to use |  |
| checkout | checkout-pointsUsedLabel | label | 적립금 사용 | Points used |  |
| checkout | checkout-shippingCouponDiscountLabel | label | 배송비 쿠폰 할인 | Shipping coupon discount |  |
| checkout | checkout-unavailableTitle | label | 주문할 수 없는 상품이 포함되어 있습니다 | Order contains unavailable items |  |
| checkout | checkout-unavailableMessage | label | 품절·판매중지된 상품을 장바구니에서 제외한 후 다시 시도해 주세요. | Please remove sold-out/stopped items from your cart and try again. |  |
| checkout | checkout-summaryTitle | heading | 주문 요약 | Order summary |  |
| checkout | checkout-subtotalLabel | label | 상품금액 | Item amount | CartSummary는 '소계', CheckoutForm은 '상품금액'. 동일 위치(상품 합계) 다른 용어 |
| checkout | checkout-discountLabel | label | 할인 | Discount |  |
| checkout | checkout-shippingFeeLabel | label | 배송비 | Shipping |  |
| checkout | checkout-totalAmountLabel | label | 총 결제금액 | Total |  |
| checkout | checkout-termsAgreement | label | 결제 진행 시 주문 내용 확인 및 결제에 동의합니다. | By proceeding with payment, you confirm and accept the order. |  |
| checkout | checkout-payButtonLabel | button | 결제하기 | Pay |  |
| checkout | checkout-submittingLabel | button | 처리 중… | Processing… |  |
| checkout | checkout-emptyMethodsTitle | empty-state | 결제 수단이 없습니다 | No payment methods available |  |
| checkout | checkout-emptyMethodsMessage | empty-state | 관리자에서 결제 설정을 확인해 주세요. | Please check the payment settings in the admin. | 번역투 - 직역된 '~을/를 확인해 주세요' 톤이 관리자 안내로 부자연스러움 |
| checkout | checkout-err-orderer-name | toast/error | 이름을 입력해 주세요. | Please enter a name. |  |
| checkout | checkout-err-orderer-phone | toast/error | 연락처를 입력해 주세요. | Please enter a phone number. |  |
| checkout | checkout-err-orderer-email | toast/error | 이메일을 입력해 주세요. | Please enter an email. |  |
| checkout | checkout-err-recipient-name | toast/error | 받는 분 이름을 입력해 주세요. | Please enter a recipient name. |  |
| checkout | checkout-err-recipient-phone | toast/error | 받는 분 연락처를 입력해 주세요. | Please enter a recipient phone number. |  |
| checkout | checkout-err-zipcode | toast/error | 우편번호를 입력해 주세요. | Please enter a postal code. |  |
| checkout | checkout-err-address | toast/error | 주소를 입력해 주세요. | Please enter an address. |  |
| checkout | checkout-err-intl-city | toast/error | 도시를 입력해 주세요. | Please enter a city. |  |
| checkout | checkout-err-intl-postal | toast/error | 우편번호를 입력해 주세요. | Please enter a postal code. |  |
| checkout | checkout-err-payment-method | toast/error | 결제 수단을 선택해 주세요. | Please select a payment method. |  |
| checkout | checkout-err-depositor-name | toast/error | 입금자명을 입력해 주세요. | Please enter a depositor name. |  |
| checkout | checkout-err-dbank-bank-code | toast/error | 입금 계좌를 선택해 주세요. | Please select a deposit account. |  |
| checkout | checkout-err-refund-bank | toast/error | 환불 계좌 정보를 모두 입력해 주세요. | Please fill in all refund account fields. |  |
| checkout | checkout-err-cash-receipt-identifier | toast/error | 현금영수증 번호를 입력해 주세요. | Please enter a cash receipt number. |  |
| checkout | checkout-err-guest-password-len | toast/error | 비밀번호는 8자 이상이어야 합니다. | Password must be at least 8 characters. |  |
| checkout | checkout-err-guest-password-match | toast/error | 비밀번호가 일치하지 않습니다. | Passwords do not match. |  |
| checkout | checkout-toast-order-coupon-applied | toast/error | 주문 쿠폰이 적용되었습니다. | Order coupon applied. |  |
| checkout | checkout-toast-order-coupon-removed | toast/error | 주문 쿠폰이 해제되었습니다. | Order coupon removed. |  |
| checkout | checkout-toast-shipping-coupon-applied | toast/error | 배송비 쿠폰이 적용되었습니다. | Shipping coupon applied. |  |
| checkout | checkout-toast-shipping-coupon-removed | toast/error | 배송비 쿠폰이 해제되었습니다. | Shipping coupon removed. |  |
| checkout | checkout-toast-item-coupon-applied | toast/error | 상품 쿠폰이 적용되었습니다. | Item coupon applied. |  |
| checkout | checkout-toast-item-coupon-removed | toast/error | 상품 쿠폰이 해제되었습니다. | Item coupon removed. |  |
| checkout | checkout-toast-mileage-applied | toast/error | 적립금이 적용되었습니다. | Points applied. |  |
| checkout | checkout-toast-mileage-removed | toast/error | 적립금 사용이 취소되었습니다. | Points usage cancelled. |  |
| checkout | checkout-toast-discount-code-applied | toast/error | 할인코드가 적용되었습니다. | Discount code applied. |  |
| checkout | checkout-coupon-empty-cart-message | empty-state | 장바구니가 비어 있습니다. | Your cart is empty. |  |
| checkout | checkout-progressCartLabel | label | 장바구니 | Cart |  |
| checkout | checkout-progressCheckoutLabel | label | 주문/결제 | Order / Payment |  |
| checkout | checkout-progressCompleteLabel | label | 완료 | Complete |  |
| checkout | checkout-title | heading | 결제 | Checkout |  |
| checkout | checkout-loadingLabel | empty-state | 주문 정보를 불러오는 중… | Loading order information… |  |
| checkout | checkout-preparingLabel | empty-state | 준비 중… | Preparing… |  |
| checkout | checkout-PG-error-confirm-failed | toast/error | 결제 승인에 실패했습니다. 다시 시도해 주세요. | Payment approval failed. Please try again. |  |
| checkout | checkout-PG-error-amount-mismatch | toast/error | 결제 금액이 일치하지 않습니다. 주문을 다시 진행해 주세요. | Payment amount mismatch. Please place the order again. |  |
| checkout | checkout-PG-error-order-not-found | toast/error | 주문 정보를 찾을 수 없습니다. | Order information not found. |  |
| checkout | checkout-PG-error-default | toast/error | 결제 처리 중 문제가 발생했습니다. | A problem occurred while processing payment. |  |
| checkout | checkout-emptyTempOrderTitle | empty-state | 주문 정보를 만들 수 없습니다 | Cannot create order information |  |
| checkout | checkout-emptyTempOrderHelper | empty-state | 장바구니가 비어 있거나 결제 가능한 상품이 없을 수 있습니다. | Your cart may be empty or no payable items are available. |  |
| checkout | checkout-backToShopLabel | button | 장바구니로 돌아가기 | Back to cart |  |
| checkout | checkout-guest-order-note | label | 결제 진행 후 발급된 주문번호와 휴대폰, 조회 비밀번호로 비회원 주문 조회 에서 다시 확인할 수 있습니다. | After checkout, you can re-check via Guest Order Lookup with your order number, phone and lookup password. |  |
| checkout | checkout-guest-order-note-link | button | 비회원 주문 조회 | Guest order lookup |  |
| global-modal | confirm-confirmLabel | button | 확인 | Confirm |  |
| global-modal | confirm-cancelLabel | button | 취소 | Cancel |  |
| global-modal | confirm-busy | button | 처리 중… | Processing… |  |
| global-modal | modal-close | button | 닫기 | Close |  |
| product-detail / cart | cross-sell-title | heading | 함께 보면 좋은 상품 | You may also like |  |
| product-detail / cart | cross-sell-eyebrow | label | YOU MAY ALSO LIKE | YOU MAY ALSO LIKE | 영문 리터럴이 그대로 노출됨 - 한국어 페이지에서 부자연스러움 |
| order-complete | order-complete-title | heading | 주문이 접수되었습니다 | Your order has been received |  |
| order-complete | order-complete-successMessage | label | 주문이 정상적으로 접수되었습니다. | Your order has been received successfully. |  |
| order-complete | order-complete-bankDepositMessage | label | 입금 확인 후 배송이 시작됩니다. 아래 계좌로 입금 기한까지 금액을 입금해 주세요. | Shipping starts after deposit is confirmed. Please deposit by the due date. |  |
| order-complete | order-complete-loadingLabel | empty-state | 주문 정보를 불러오는 중… | Loading order information… |  |
| order-complete | order-complete-errorTitle | empty-state | 주문 정보를 찾을 수 없습니다 | Order information not found |  |
| order-complete | order-complete-orderNumberLabel | label | 주문번호 | Order number |  |
| order-complete | order-complete-bankDepositInfoTitle | heading | 입금 안내 | Deposit instructions |  |
| order-complete | order-complete-vbankInfoTitle | heading | 가상계좌 입금 안내 | Virtual account deposit instructions |  |
| order-complete | order-complete-depositBankLabel | label | 은행 | Bank |  |
| order-complete | order-complete-depositAccountLabel | label | 계좌번호 | Account number |  |
| order-complete | order-complete-depositHolderLabel | label | 예금주 | Account holder |  |
| order-complete | order-complete-depositorNameLabel | label | 입금자명 | Depositor name |  |
| order-complete | order-complete-depositAmountLabel | label | 입금 금액 | Deposit amount |  |
| order-complete | order-complete-depositDueLabel | label | 입금 | Deposit due |  |

### components-brand (132항목)

총 1개 영역: components-brand (superbify-commerce_minimal 템플릿의 브랜드·랜딩 카피, 데모 카피, 라벨/버튼/placeholder/empty-state, 정책/페이지 타이틀까지 모두 포함). LOCKED 카피 매치 0건, 금지 표현 매치 0건. 어색 flag 항목: (1) home.story.heading — ko '오래 쓸수록 익어지는 것들'이 store.body / editorial.body / final_cta.body / story.body 등에서 반복되는 모티프라 브랜드 보이스 자체는 OK이나, 스토리 헤딩은 '오래 쓸수록' 행위 주체(쓰는 사람) 암시로 차분/관찰 톤과 미세 어긋남 — flag 유지. (2) home.story.body — '모은 자리입니다/소개합니다/우선합니다' 시제 혼재, 자연스러우나 브랜드 보이스(현재 시제)와 미세 차이 — flag 유지. (3) home.promo.title — ko '오늘의 한 권'(책 단위) vs en 'One piece at a time'(물건 단위) 1:1 매칭 약함 — flag 유지. (4) copyright — 'demo store built on Gnuboard 7' 영문 데모 명시 — flag 유지. (5) business.demo_notice / notice.empty_message / shop.empty_message / business.policy.note — 데모·시안 명시 — flag 유지. (6) category.empty_inline_fallback — CategoryNav.tsx:171 하드코딩 '(no categories)' — flag 유지. (7) fixture.category.desk — ko '데스크 액세서리' vs en 'Desk' 표현 차이 — flag 유지. 그 외 데모 상품명/카피 short_description은 영문 단일 표기로 ko/en 동일, 원본 그대로 — flag 없음. 톤/가격 통화/존댓말 일관 OK. a11y 트리 텍스트(brand.logo.aria_default / brand.sr_only_brand)는 시각 미노출, kind=other 유지.

| 페이지 | 키/위치 | 종류 | ko | en | flag |
|--------|---------|------|----|----|------|
| home | home.story.heading | heading | 오래 쓸수록 익어지는 것들 | Things that grow better with time | 동사 주체 행위성 — ko 헤딩 '오래 쓸수록 익어지는 것들'이 '쓰는 사람' 행위를 암시하여 '조용한 일상의 물건들' 브랜드 톤(차분/관찰)과 미세 어긋남. 다만 store.body / editorial.body / final_cta.body / story.body 등에서 동일 모티프 반복 사용으로 브랜드 보이스 자체는 OK |
| home | home.story.body | brand-intro | Still Form은 시간이 지나도 변하지 않는 사물을 모은 자리입니다. 목재, 리넨, 도자기 — 손에 닿는 재질이 스스로 말을 거는 물건을 골라 천천히 소개합니다. 화려함보다 차분함, 새것보다 익은 것을 우선합니다. | Still Form gathers objects that hold their character through years of use. Wood that softens, linen that deepens, ceramics that darken at the rim. We choose pieces whose materials speak for themselves. | 동사 시제 혼재 — '모은/소개합니다/우선합니다' 일부 과거·현재 시제 섞임. 톤 자체는 OK이나 브랜드 보이스(현재 시제)와 미세 차이 |
| home | home.hero.headline | main-copy | 조용한 일상의 ⏎ 물건들 | Quiet objects for ⏎ everyday life |  |
| home | home.hero.sub | brand-intro | 손에 익는 재질, 변화하는 결, 천천히 좋아지는 형태. 일상의 한 자리에 머무는 사물을 차곡차곡 모아 봅니다. | Materials that grow familiar with use. Forms that quietly improve with time. A small, careful collection for everyday spaces. |  |
| home | home.hero.cta_primary | button | Shop 둘러보기 | Browse Shop |  |
| home | home.hero.cta_secondary | button | Brand Story | Brand Story |  |
| home | home.editorial.heading | heading | 조용히, 그러나 단단하게. | Quietly, but firmly. |  |
| home | home.editorial.body | brand-intro | 공간에 머무르는 사물은 시간이 흐를수록 더 좋아지는 종류가 있습니다. Still Form은 오래 쓸수록 익어지는 물건을 차분히 모은 자리입니다. | Some objects in a room only get better with time. Still Form is a small, careful collection of those long-keeping things. |  |
| home | home.editorial.cta | button | Shop 둘러보기 | Browse Shop |  |
| home | home.promo.title | heading | 오늘의 한 권 | One piece at a time |  |
| home | home.promo.description | brand-intro | 책꽂이 위에 머무는 단행본 한 권처럼, 일상에 한 점 더해지는 물건을 소개합니다. | Like a single volume on a shelf — objects earn their place by being used, day after day. | ko/en 의미 1:1 매칭 약함 — en 'one piece at a time'은 물건 단위 일반 표현, ko '오늘의 한 권'은 책 단위(책 한 권/표지) 종속 어휘 |
| home | home.final_cta.heading | heading | 조용한 일상의 모든 물건을 한 자리에서 | Everyday quiet objects, in one place |  |
| home | home.final_cta.body | brand-intro | 지금 전체 Shop을 둘러보고, 오래 머무를 한 가지 물건을 골라보세요. | Browse the full Shop and find one piece that will stay with you for years. |  |
| home | home.final_cta.cta | button | Shop 전체 보기 | Browse all of Shop |  |
| home | home.hero.eyebrow | label | HOME & LIFESTYLE | HOME & LIFESTYLE |  |
| home | home.featured_categories.eyebrow | label | CATEGORIES | CATEGORIES |  |
| home | home.featured_categories.heading | heading | 카테고리 | Categories |  |
| home | home.featured_categories.empty_label | empty-state | 표시할 카테고리가 없습니다. | No categories to display. |  |
| home | home.new_arrivals.eyebrow | label | NEW | NEW |  |
| home | home.new_arrivals.heading | heading | 새로 들어온 것들 | New arrivals |  |
| home | home.popular.eyebrow | label | POPULAR | POPULAR |  |
| home | home.popular.heading | heading | 인기 상품 | Best Sellers |  |
| home | home.story.eyebrow | label | BRAND STORY | BRAND STORY |  |
| home | home.editorial.eyebrow | label | EDITORIAL | EDITORIAL |  |
| home | home.promo.eyebrow | label | LIFESTYLE | LIFESTYLE |  |
| home | home.final_cta.eyebrow | label | EXPLORE | EXPLORE |  |
| home | routes.home.description | seo/meta | 일상의 한 자리에 머무는 사물을 모은 자리. | A small collection of objects for everyday spaces. | base_layout_description (영문 단일, ko 미번역) |
| home | routes.home.title | seo/meta | Still Form — 조용한 일상의 물건들 | Still Form — Quiet objects for everyday life |  |
| global-footer / global-header | brand.tagline | main-copy | 조용한 일상의 물건들 | Quiet objects for everyday life |  |
| global | brand.name | main-copy | Still Form | Still Form |  |
| global | common.all | label | 전체 | All |  |
| global | common.view_all | label | 전체 보기 | View all |  |
| global | common.cancel | button | 취소 | Cancel |  |
| global | common.close | button | 닫기 | Close |  |
| global | common.demo_marker | label | demo | demo | 데모 식별자 — 시안 표시 |
| global | errors.unauthorized_title | toast/error | 로그인이 필요합니다 | Sign-in required | errors.unauthorized_title 등 |
| global | errors.unauthorized_message | toast/error | 회원 전용 페이지입니다. 로그인 후 다시 이용해 주세요. | This page is for members. Please sign in and try again. |  |
| global | errors.not_found_title | toast/error | 페이지를 찾을 수 없습니다 | Page not found |  |
| global | errors.server_error_title | toast/error | 문제가 발생했습니다 | Something went wrong |  |
| global-footer | copyright | other | © 2026 Still Form — demo store built on Gnuboard 7 | © 2026 Still Form — demo store built on Gnuboard 7 | 데모 명시 저작권 — 'demo store built on Gnuboard 7' 영문 단일 표기, 데모 템플릿 정체성 노출 |
| global-footer | business.demo_notice | other | 데모 스토어입니다. 사업자 정보는 템플릿 config/business-info.json에서 설정할 수 있습니다. | Demo store. Business information can be configured in the template's config/business-info.json. | 데모 안내문 — 사업자 정보 미설정 시 노출되는 시안 문구 |
| global-footer | business.links.terms | label | 이용약관 | Terms of Service | 푸터 정책 링크 라벨 (StoreFooter.tsx default fallback 동일) |
| global-footer | business.links.privacy | label | 개인정보처리방침 | Privacy Policy |  |
| global-footer | business.links.shipping | label | 배송·교환·반품 안내 | Shipping, Returns & Exchanges |  |
| global-footer | business.links.verification | label | 사업자정보확인 | Verify business info |  |
| policy | business.policy.note | policy/longform | 본 문서는 템플릿 시안 문구입니다. 실제 운영 전 사업자 상황에 맞는 약관 작성 및 법적 검토가 필요합니다. | This document is template placeholder wording. Before launching a real store, terms must be written to match the operator's situation and reviewed legally. | 정책 시안 문구 — 운영 전 법적 검토 필요 안내 문구 (의도적 시안 표기) |
| policy | policy.terms.title | policy/longform | 이용약관 | Terms of Service |  |
| policy | policy.privacy.title | policy/longform | 개인정보처리방침 | Privacy Policy |  |
| policy | policy.no_content | policy/longform | 내용이 없습니다. | No content available. |  |
| global-header | nav.shop | label | Shop | Shop |  |
| global-header | nav.story | label | Story | Story |  |
| global-header | nav.notice | label | Notice | Notice |  |
| global-header | nav.cart | label | Cart | Cart |  |
| global-header | auth.login.label | button | 로그인 | Login |  |
| global-header | auth.signup.label | button | 회원가입 | Sign up |  |
| global-header | auth.logout.label | button | 로그아웃 | Log out |  |
| global-header | auth.mypage.label | label | 마이페이지 | My Page |  |
| global-header | brand.logo.aria_default | other | {brandName} Home | {brandName} Home | sr-only 라벨/aria 문자열 — 시각 미노출, a11y 트리 전용 |
| global-header | brand.sr_only_brand | other | {brandName} {tagline} | {brandName} {tagline} | sr-only brand/tagline 텍스트 노출 (시각 X, a11y 트리 전용, 동적 보간) |
| story | story.title | heading | Brand Story | Brand Story |  |
| story | story.eyebrow | label | STORY | STORY |  |
| story | story.body | brand-intro | Still Form은 시간이 지나도 변하지 않는 사물을 모은 자리입니다. 손에 익는 목재, 결이 살아있는 리넨, 묵직한 도자기 — 재질이 스스로 말을 거는 물건을 골라 차곡차곡 소개합니다. | Still Form is a small house of objects that hold their character through years of use. Wood that softens, linen that deepens, ceramics that darken at the rim — pieces whose materials speak for themselves. |  |
| story | routes.story.title | seo/meta | Story — Still Form | Story — Still Form |  |
| notice | notice.title | heading | Notice | Notice |  |
| notice | notice.eyebrow | label | NOTICE | NOTICE |  |
| notice | notice.fixed_badge | label | 고정 | Pinned |  |
| notice | notice.empty_title | empty-state | 등록된 공지가 없습니다 | No notices yet |  |
| notice | notice.empty_message | empty-state | 데모용 템플릿입니다. 실제 공지사항 데이터는 관리자에서 추가할 수 있습니다. | This is a demo template. Real notice data can be added from admin. | 데모 명시 — 시안/운영 전 안내 문구 |
| notice | routes.notice.title | seo/meta | Notice — Still Form | Notice — Still Form |  |
| notice | notice.empty_title_default | empty-state | No notices yet | No notices yet | NoticeList의 'No notices yet'은 en.json NoticeList default 와 lang.notice.empty_title 중복이지만 동일 — OK |
| shop | shop.title | heading | Shop | Shop |  |
| shop | shop.filter_label | label | 카테고리 | Categories |  |
| shop | shop.empty_title | empty-state | 아직 등록된 상품이 없습니다 | No products yet |  |
| shop | shop.empty_message | empty-state | 관리자에서 상품을 등록하면 이 자리에 표시됩니다. | Add products in admin and they will appear here. | 데모 명시 — 시안/운영 전 안내 문구 |
| shop | routes.shop.title | seo/meta | Shop — Still Form | Shop — Still Form |  |
| shop | routes.shop.description | seo/meta | 전체 상품 목록 | All products |  |
| category | category.count_label | label | {{count}}개 상품 | {{count}} items |  |
| category | category.empty_title | empty-state | 이 카테고리에 등록된 상품이 없습니다 | No products in this category |  |
| category | category.empty_message | empty-state | 다른 카테고리를 둘러보거나, 잠시 후 다시 확인해 주세요. | Try another category or check back later. |  |
| category | category.empty_inline_fallback | empty-state | (no categories) | (no categories) | CategoryNav.tsx의 '(no categories)' 하드코딩 — lang 매핑 없이 영문 단일 표기 |
| category | fixture.category.cups | label | 컵 | Cups |  |
| category | fixture.category.lighting | label | 조명 | Lighting |  |
| category | fixture.category.trays | label | 트레이 | Trays |  |
| category | fixture.category.fabric | label | 패브릭 | Fabric |  |
| category | fixture.category.scent | label | 향 | Scent |  |
| category | fixture.category.furniture | label | 소형 가구 | Furniture |  |
| category | fixture.category.desk | label | 데스크 액세서리 | Desk | 데모 카테고리명 ko/en 표현 차이 — ko '데스크 액세서리' vs en 'Desk' 단일 단어 |
| category | routes.category.title | seo/meta | Category — Still Form | Category — Still Form |  |
| category | routes.category.description | seo/meta | 카테고리별 상품 | Products in this category |  |
| product | fixture.product.mug | label | 머그컵 | Stoneware Mug | 데모 상품명 — 시안 식별 |
| product | fixture.product.mug.short_description | other | Heavyweight stoneware mug for daily coffee and tea. | Heavyweight stoneware mug for daily coffee and tea. |  |
| product | fixture.product.glass_cup | label | 글라스 컵 | Clear Glass Cup |  |
| product | fixture.product.glass_cup.short_description | other | Hand-blown clear glass cup, 240ml capacity. | Hand-blown clear glass cup, 240ml capacity. |  |
| product | fixture.product.lamp | label | 테이블 램프 | Table Lamp |  |
| product | fixture.product.lamp.short_description | other | Linen shade table lamp with warm 2700K LED bulb. | Linen shade table lamp with warm 2700K LED bulb. |  |
| product | fixture.product.tray | label | 우드 트레이 | Wooden Tray |  |
| product | fixture.product.tray.short_description | other | Solid oak tray with rounded handles, 38 × 24 cm. | Solid oak tray with rounded handles, 38 × 24 cm. |  |
| product | fixture.product.cushion | label | 쿠션 커버 | Linen Cushion Cover |  |
| product | fixture.product.cushion.short_description | other | Stonewashed linen cushion cover, 45 × 45 cm. | Stonewashed linen cushion cover, 45 × 45 cm. |  |
| product | fixture.product.diffuser | label | 리드 디퓨저 | Reed Diffuser |  |
| product | fixture.product.diffuser.short_description | other | Reed diffuser with cedar and citrus, 200ml. | Reed diffuser with cedar and citrus, 200ml. |  |
| product | fixture.product.pen_stand | label | 펜 스탠드 | Pen Stand |  |
| product | fixture.product.pen_stand.short_description | other | Brass pen stand with cork base, 10 cm height. | Brass pen stand with cork base, 10 cm height. |  |
| product | fixture.product.book_stand | label | 북 스탠드 | Book Stand |  |
| product | fixture.product.book_stand.short_description | other | Folding walnut book stand, adjustable angle. | Folding walnut book stand, adjustable angle. |  |
| product | routes.product.title | seo/meta | Product — Still Form | Product — Still Form |  |
| global-meta | template.description.ko | seo/meta | 미니멀 D2C 데모 스토어용 사용자 템플릿 (sirsoft-ecommerce 기반) | Minimal D2C demo store user template (built on sirsoft-ecommerce) | meta description — 데모 템플릿 정체성 명시 |
| global-meta | template.name | seo/meta | SuperBify Commerce Minimal | SuperBify Commerce Minimal |  |
| cart | routes.cart.title | seo/meta | Cart — Still Form | Cart — Still Form |  |
| cart | cart.title | heading | Cart | Cart |  |
| cart | cart.eyebrow | label | SHOPPING BAG | SHOPPING BAG |  |
| cart | cart.empty_title | empty-state | 장바구니가 비어 있습니다 | Your cart is empty |  |
| cart | cart.empty_message | empty-state | Shop 페이지에서 상품을 담아보세요. | Browse the shop and add something you like. |  |
| cart | cart.cta_shop | button | Shop으로 이동 | Go to Shop |  |
| cart | cart.add_to_cart | button | 장바구니 담기 | Add to cart |  |
| cart | cart.buy_now | button | 바로구매 | Buy now |  |
| cart | cart.added_toast | toast/error | 장바구니에 담았습니다. | Added to cart. |  |
| cart | cart.cross_sell.eyebrow | label | YOU MAY ALSO LIKE | YOU MAY ALSO LIKE |  |
| cart | cart.cross_sell.title | heading | 함께 보면 좋은 상품 | You may also like |  |
| checkout | routes.checkout.title | seo/meta | Checkout — Still Form | Checkout — Still Form |  |
| order-complete | routes.order_complete.title | seo/meta | 주문 완료 — Still Form | Order Complete — Still Form |  |
| login | auth.login_form.title | heading | 로그인 | Login |  |
| login | auth.login_form.subtitle | label | 계정에 로그인하세요 | Sign in to your account |  |
| login | auth.login_form.email_placeholder | placeholder | 이메일 주소를 입력하세요 | Enter your email address |  |
| login | auth.login_form.password_placeholder | placeholder | 비밀번호를 입력하세요 | Enter your password |  |
| login | auth.login_form.remember | label | 로그인 상태 유지 | Keep me signed in |  |
| login | auth.login_form.submit | button | 로그인 | Login |  |
| login | auth.login_form.no_account | label | 계정이 없으신가요? | Don't have an account? |  |
| register | auth.register.title | heading | 회원가입 | Sign up |  |
| register | auth.register.subtitle | label | 새 계정을 만드세요 | Create a new account |  |
| register | auth.register.password_hint | placeholder | 비밀번호는 8자 이상이어야 합니다. | Password must be at least 8 characters. |  |
| register | auth.register.submit | button | 회원가입 | Sign up |  |
