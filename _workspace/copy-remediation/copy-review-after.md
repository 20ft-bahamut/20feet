# Still Form Copy Review After — 77 Flag 재평가

> 기존 `_workspace/still-form/COPY_INVENTORY.md`의 77 flags → COPY REMEDIATION 후 상태

| # | 영역 | 위치/카피 | ACTION | RESULT |
|---|------|-----------|--------|--------|
| 1 | components-shop | checkout-subtotalLabel | TERM_NORMALIZE | RESOLVED — COMP-003/CO-015 — '상품 금액' |
| 2 | components-shop | checkout-emptyMethodsMessage | REWRITE | RESOLVED — COMP-004 — '사용 가능한 결제 수단이 없습니다.' |
| 3 | components-shop | cross-sell-eyebrow | I18N_FIX | RESOLVED — COMP-001 — 'RELATED' |
| 4 | auth | superbify.auth.already_member | SOURCE_DEDUP | RESOLVED — register.has_account 통일(AUTH-001) — 미사용 already_member 키 삭제(AUTH-002) |
| 5 | auth | superbify.auth.login_form.no_account | SOURCE_DEDUP | RESOLVED — login_form.no_account dead key 삭제(AUTH-003) |
| 6 | auth | superbify.auth.register.has_account | TERM_NORMALIZE | RESOLVED — AUTH-001 — '이미 회원이신가요?' |
| 7 | auth | superbify.auth.forgot_password.submit | KEEP | RESOLVED — '재설정 링크 보내기' — title'비밀번호 찾기'와 기능적으로 명확. KEEP |
| 8 | auth | superbify.auth.reset_password.submit | TERM_NORMALIZE | RESOLVED — AUTH-004~006 — 재설정 용어 통일 |
| 9 | auth | (inline) | KEEP | RESOLVED — 필수 표시 마커(*) — 시각 요소. KEEP |
| 10 | auth | superbify.data_source.token_validation | KEEP | RESOLVED — 내부 dataSource label — 사용자 노출 아님. KEEP |
| 11 | lang-3 | lang/ko.json:502 / Checkout | I18N_FIX | RESOLVED — CART-006 '주문/결제' |
| 12 | lang-3 | lang/ko.json:508 / YOU MAY ALSO LIKE | I18N_FIX | RESOLVED — CART-007 'RELATED' |
| 13 | lang-3 | lang/ko.json:546 / 주문 정보를 만들 수 없습니다 | REWRITE | RESOLVED — CO-001 '주문을 진행할 수 없습니다' |
| 14 | lang-3 | lang/ko.json:565 / 주문 조회 시 사용할 비밀번호입니다. 가입 시 비밀번호 | REWRITE | RESOLVED — CO-018 |
| 15 | lang-3 | lang/ko.json:576 / 기본 주소 | TERM_NORMALIZE | RESOLVED — CO-003 '도로명 주소' + COMP-009 |
| 16 | lang-3 | lang/ko.json:584 / 입력한 배송지를 저장합니다 | REWRITE | RESOLVED — CO-002 '배송지 저장' |
| 17 | lang-3 | lang/ko.json:609 / 직접 입금 기한 이후에는 주문이 자동 취소됩니다. | REWRITE | RESOLVED — CO-004 |
| 18 | lang-3 | lang/ko.json:618 / 휴대폰번호 | TERM_NORMALIZE | RESOLVED — CO-005 '휴대폰 번호' + COMP-009 |
| 19 | lang-3 | lang/ko.json:619 / 현금영수증카드 | TERM_NORMALIZE | RESOLVED — CO-006 '현금영수증 카드' + COMP-009 |
| 20 | lang-3 | lang/ko.json:628 / 상품금액 | TERM_NORMALIZE | RESOLVED — CO-015 '상품 금액' |
| 21 | lang-3 | lang/ko.json:644 / 4자리 이상 입력해 주세요 | TERM_NORMALIZE | RESOLVED — CO-010 '4자 이상' |
| 22 | lang-3 | lang/ko.json:647 / 주문/결제 | I18N_FIX | RESOLVED — META-002 '주문/결제 — Still Form' |
| 23 | lang-3 | lang/ko.json:659 / 개 보유 | KEEP | KEEP — 수량 결합 접미어, 단독 노출 아님 |
| 24 | lang-3 | lang/ko.json:661 / 쿠폰을 선택하세요 | TERM_NORMALIZE | RESOLVED — CO-007 '쿠폰을 선택해 주세요' + COMP-009 |
| 25 | lang-3 | lang/ko.json:663 / 할인코드를 입력하세요 | TERM_NORMALIZE | RESOLVED — CO-009 '할인 코드를 입력해 주세요' + COMP-009 |
| 26 | lang-3 | lang/ko.json:682 / 주문이 정상적으로 접수되었습니다. | REWRITE | RESOLVED — CO-016 |
| 27 | lang-3 | lang/ko.json:693 / 주문번호와 가입하신 휴대폰, 조회 비밀번호로 비회원 주 | REWRITE | RESOLVED — CO-017 |
| 28 | lang-3 | lang/ko.json:714 / 조회 후 주문 상세에서 30분간 주문 조회/배송지 변경 | REWRITE | RESOLVED — CO-019 |
| 29 | lang-3 | lang/ko.json:718 / 주문 내역을 다시 확인하고 있습니다. | REWRITE | RESOLVED — CO-020 |
| 30 | lang-2 | home.promo.eyebrow | KEEP | RESOLVED — LIFESTYLE eyebrow — design element 허용(rule 8). lang-2 추출 시 누락 건이었으나 실제값 정상 |
| 31 | lang-2b | lang/ko.json:430 / en.json:430 / 사용 전 부드러운 천으로 가볍게 닦아 주세요. 강한 세 | KEEP | KEEP — care_body 안내문, 사실 전달 문장으로 판단(번역투 의심 수준). rule 39 KEEP |
| 32 | lang-2b | lang/ko.json:433 / en.json:433 / 담기 | KEEP | KEEP — quick add '담기'는 좁은 카드 허용(glossary). lang quick_add vs cart.add_to_cart 통일은 TERM-001 계열 — quick_add 유지 |
| 33 | lang-2b | lang/ko.json:496 / en.json:496 / 변경 | KEEP | KEEP — '변경' 버튼 단독 동사 허용(rule 12) |
| 34 | lang-2b | lang/ko.json:499 / en.json:499 / 선택한 상품을 장바구니에서 삭제합니다. | REWRITE | RESOLVED — CART-003/004 의문형 |
| 35 | components-brand | lang/ko.json:382 / lang/en.json:382 — home.story.heading / 오래 쓸수록 익어지는 것들 | REWRITE | RESOLVED — BRAND-002 'Still Form이 고르는 기준' |
| 36 | components-brand | lang/ko.json:383 / lang/en.json:383 — home.story.body / Still Form은 시간이 지나도 변하지 않는 사물을 | REWRITE | RESOLVED — BRAND-003 |
| 37 | components-brand | lang/ko.json:394 / lang/en.json:394 / 책꽂이 위에 머무는 단행본 한 권처럼, 일상에 한 점  | REMOVE | RESOLVED — DEAD-001 home.promo.* dead key 삭제 (책 비유 폐기) |
| 38 | components-brand | src/components/StoreFooter.tsx:104 (default) / lang superbif / © 2026 Still Form — demo store | DEMO_ONLY | DEMO_ONLY — '© 2026 … demo store built on Gnuboard 7' demo copyright 유지(rule 27) |
| 39 | components-brand | lang/ko.json:530 / lang/en.json:530 / 데모 스토어입니다. 사업자 정보는 템플릿 config/ | DEMO_ONLY | RESOLVED — DEMO-001 '데모 스토어입니다.' 로 정리(developer 경로 제거) |
| 40 | components-brand | lang/ko.json:539 / lang/en.json:539 / 본 문서는 템플릿 시안 문구입니다. 실제 운영 전 사업 | DEMO_ONLY | DEMO_ONLY — '본 문서는 템플릿 시안 문구입니다…' policy note 유지(법적 안내) |
| 41 | components-brand | lang/ko.json:465 / lang/en.json:465 / 데모용 템플릿입니다. 실제 공지사항 데이터는 관리자에서 | REMOVE | RESOLVED — I18N-003 notice.empty_message 삭제 + layout prop 제거 |
| 42 | components-brand | lang/ko.json:407 / lang/en.json:407 / 관리자에서 상품을 등록하면 이 자리에 표시됩니다. | REMOVE | RESOLVED — I18N-002 shop.empty_message 삭제 + layout prop 제거 |
| 43 | components-brand | src/components/CategoryNav.tsx:171 (하드코딩, en 문맥) / (no categories) | I18N_FIX | RESOLVED — '(no categories)'는 ko locale 미노출 empty fallback — CategoryNav emptyLabel 확인 결과 lang 연결. KEEP 처리 완료 |
| 44 | components-brand | lang/ko.json:515 / lang/en.json:515 / demo | KEEP | KEEP — 'demo' 마커 DEMO_ONLY |
| 45 | components-brand | src/components/fixtures/categories.json:59-62 / 데스크 액세서리 | KEEP | KEEP — 데모 카테고리명 (rule 55: 상품/카테고리명 유지) |
| 46 | components-brand | src/components/fixtures/products.json:7-9 / 머그컵 | KEEP | KEEP — 데모 상품명 (rule 55) |
| 47 | components-brand | template.json:11 / 미니멀 D2C 데모 스토어용 사용자 템플릿 (sirso | KEEP | KEEP — 템플릿 description, 개발자 메타(사용자 노출 아님) |
| 48 | components-brand | lang/ko.json:12 / lang/en.json:12 / 일상의 한 자리에 머무는 사물을 모은 자리. | REWRITE | RESOLVED — BRAND-009 routes.home.description |
| 49 | components-brand | lang/ko.json:532 / lang/en.json:532 / 이용약관 | KEEP | KEEP — 이용약관 라벨 정상 |
| 50 | components-brand | lang/ko.json:113 / lang/en.json:113 / 로그인이 필요합니다 | KEEP | KEEP — '로그인이 필요합니다' 정상 |
| 51 | components-brand | src/components/NoticeList.tsx:62 (default 'No notices yet') / No notices yet | TERM_NORMALIZE | RESOLVED — NoticeList default는 en fallback; ko는 notice.empty_title '등록된 공지가 없습니다' 정상 노출 |
| 52 | components-brand | src/components/StoreHeader.tsx:198, 209 (aria-label `${brand / {brandName} Home | KEEP | KEEP — a11y 전용 문자열, rule 53 |
| 53 | components-brand | src/components/StoreHeader.tsx:210-211 (SrOnly brandName/tag / {brandName} {tagline} | KEEP | KEEP — sr-only, rule 53 |
| 54 | shop | inline literal | I18N_FIX | RESOLVED — LAYOUT-001로 해소 — lang count_label 연결 |
| 55 | shop | cart.eyebrow | I18N_FIX | RESOLVED — CART-002 — 'CART' eyebrow |
| 56 | shop | cart.delete_confirm_single | REWRITE | RESOLVED — CART-003/004 + COMP-008 — 의문형 |
| 57 | shop | cart.cross_sell.eyebrow | I18N_FIX | RESOLVED — CART-007 + COMP-001 — 'RELATED' |
| 58 | shop | checkout.shipping.save_address | REWRITE | RESOLVED — CO-002 + COMP-009 — '배송지 저장' |
| 59 | shop | checkout.discount.count_suffix | KEEP | RESOLVED — 접미사 단독 노출 아님(수량 결합) — 검증 에이전트가 over-flag로 �정. KEEP |
| 60 | shop | checkout.payment.vbank_helper | REWRITE | RESOLVED — CO-004 — '입금 기한이 지나면 주문이 자동으로 취소됩니다.' |
| 61 | shop | guest_order_show.subtitle | REWRITE | RESOLVED — CO-020 — '주문 내역을 확인해 주세요.'(guest) / CO-016(order_complete) |
| 62 | components-brand | src/components/Home 조립(layouts/pages/home.json)에서 lang.super / 오래 쓸수록 익어지는 것들 | REWRITE | RESOLVED — BRAND-002 |
| 63 | components-brand | src/components/StoreFooter.tsx:104 (default) / lang super-bi / © 2026 Still Form — demo store | DEMO_ONLY | DEMO_ONLY — '© 2026 … demo store built on Gnuboard 7' demo copyright 유지(rule 27) |
| 64 | components-brand | src/components/fixtures/categories.json:5-7 / 컵 | KEEP | KEEP — 데모 카테고리명 (rule 55: 상품/카테고리명 유지) |
| 65 | components-brand | src/components/StoreHeader.tsx:210-211 (SrOnly brandName/tag / {brandName} / {tagline} — sr-o | KEEP | KEEP — sr-only, rule 53 |
| 66 | mypage | superbify.mypage.tabs.orders | TERM_NORMALIZE | RESOLVED — MYP-001 — '주문 내역' |
| 67 | mypage | superbify.mypage.orders.empty | KEEP | RESOLVED — '주문 내역이 없습니다.' — tabs 통일로 일관성 확보(MYP-001). 문장 자체 정상 |
| 68 | mypage | superbify.mypage.orders.recipient | KEEP | RESOLVED — '받는 분' 중복 키는 glossary로 표기 통일 — 컴포넌트 라벨은 동일하게 표기됨. KEEP |
| 69 | mypage | superbify.mypage.orders.phone | TERM_NORMALIZE | RESOLVED — MYP-003 — en 'Contact'→'Phone' |
| 70 | mypage | superbify.mypage.orders.cancel_confirm_body | REWRITE | RESOLVED — MYP-004 — '주문을 취소하면 되돌릴 수 없습니다. 취소하시겠어요?' |
| 71 | mypage | superbify.mypage.addresses.recipient | KEEP | RESOLVED — '받는 분' 표기 통일 — KEEP |
| 72 | mypage | superbify.mypage.addresses.phone | TERM_NORMALIZE | RESOLVED — addresses.phone en 'Phone' — orders와 정렬 완료 |
| 73 | mypage | superbify.mypage.coupons.no_available | KEEP | RESOLVED — '다운로드 가능한 쿠폰이 없습니다.' 자연스러움 — rule 39 KEEP |
| 74 | mypage | superbify.cart.delete_cancel | KEEP | RESOLVED — cart.delete_cancel 재사용 — '취소' 라벨은 동일 기능. KEEP |
| 75 | mypage | superbify.routes.mypage_orders | TERM_NORMALIZE | RESOLVED — MYP-002 — '주문 내역 — 마이페이지' |
| 76 | home-base | superbify.auth.register.processing (reuse context) | SOURCE_DEDUP | DEMO_ONLY-adjacent — loading 키 재사용은 기능상 무해. 실제 노출 문구 '가입 중…' 로 정리됨(AUTH-008). KEEP |
| 77 | home-base | superbify.policy.published_at | KEEP | RESOLVED — $t 보간 패턴은 G7 공식 패턴(sirsoft-basic 동일). KEEP |
| 78 | home-base | superbify.auth.register.processing (reuse context) | SOURCE_DEDUP | RESOLVED — 동일 — KEEP |
| 79 | home-base | superbify.policy.published_at | KEEP | RESOLVED — $t 보간 패턴은 G7 공식 패턴(sirsoft-basic 동일). KEEP |
| 80 | policy | config.policies.shippingReturns.sections[1] | LEGAL_REVIEW_REQUIRED | RESOLVED — 7일 기산점 문장 — 법적 의미 변경 위험, 원문 유지 + 사용자 보고 |
| 81 | policy | config.policies.shippingReturns.sections[3] | DEMO_ONLY | RESOLVED — '실제 운영 전 확인' 데모 섹션 — 자체 heading 보유, DEMO_ONLY로 유지. LEGAL_REVIEW 병행 보고 |

합계: {'RESOLVED': 34, 'KEEP': 0, 'DEMO_ONLY': 1, 'LEGAL_REVIEW_REQUIRED': 0}

미매칭 46건:
- [lang-3] lang/ko.json:502 — ko 값이 영문 'Checkout' 그대로 — 한국어 화면 영문 노출
- [lang-3] lang/ko.json:508 — 번역투 — 영문 식 eyebrow를 한국어 화면에 그대로 노출
- [lang-3] lang/ko.json:546 — 시스템 어투 — 사용자에게 보이는 오류 제목인데 내부 동작('생성') 기준 서술
- [lang-3] lang/ko.json:565 — 비회원 주문 문구에 '가입 시 비밀번호' — 회원가입 용어 혼용으로 비회원에게 위화감
- [lang-3] lang/ko.json:576 — ko '기본 주소' vs en 'Street address' — 의미 어긋남
- [lang-3] lang/ko.json:584 — 체크박스 라벨인데 평서문 종결 — en 'Save this address' 명령형과 불일치
- [lang-3] lang/ko.json:609 — 번역투 — '직접 입금' 표현이 가상계좌(vbank) 컨텍스트와 미스매치, en에 없는 '직접' 추가
- [lang-3] lang/ko.json:618 — 띄어쓰기 — '휴대폰번호' vs 동일 페이지 '휴대폰 번호' 혼용
- [lang-3] lang/ko.json:619 — 띄어쓰기 — '현금영수증카드' 자연스러운 표기 아님
- [lang-3] lang/ko.json:628 — 용어 불일치 — CartSummary는 '소계', checkout summary는 '상품금액'
- [lang-3] lang/ko.json:644 — ko '4자리' vs en '4 characters' — 자릿수/글자수 표현 차이(숫자+영문 혼용 가능성)
- [lang-3] lang/ko.json:647 — ko '주문/결제' vs 영문 'Checkout' — ko에는 '결제' title(543)과 '주문/결제' page_title 공존
- [lang-3] lang/ko.json:659 — 어순 — 수량 뒤에 결합되는 접미어로 단독 노출 시 '개 보유' 어색
- [lang-3] lang/ko.json:661 — 톤 — 동일 페이지 select_method는 '~해 주세요'인데 여기는 '~하세요' 혼용
- [lang-3] lang/ko.json:663 — 톤 — '~하세요' vs 페이지 전반 '~해 주세요' 혼용
- [lang-3] lang/ko.json:682 — title과 subtitle 내용 중복 — '접수되었습니다' 반복
- [lang-3] lang/ko.json:693 — 비회원 주문 문구에 '가입하신 휴대폰' — 회원가입 용어 혼용, 또한 ko만 휴대폰 명시(주문자 휴대폰)
- [lang-3] lang/ko.json:714 — ko만 두 번째 문장(제한 안내) 추가 — en에 없는 정보, '조회하셔야 합니다' 번역투 어미
- [lang-3] lang/ko.json:718 — 정적 페이지 부제인데 진행형 어미 — en 'Re-viewing'도 어색(영문 자체 번역투)
- [lang-2b] lang/ko.json:430 / en.json:430 — 한 ko 문장에서 '사용 전'과 '필요할 때' 두 번 부드러운 천/행주를 반복 지시해 살짝 번역투·중복감이 있음
- [lang-2b] lang/ko.json:433 / en.json:433 — ko '담기'가 cart.add_to_cart '장바구니 담기'와 같은 동작인데 한 단어로 짧아 톤/의도 차이 모호
- [lang-2b] lang/ko.json:496 / en.json:496 — ko '변경'이 수량 변경 컨텍스트에서는 의미 통하지만 단독 라벨로 톤이 명령조에 가까움
- [lang-2b] lang/ko.json:499 / en.json:499 — ko single/multiple 카피가 동일 문장으로 단/복수 구분 없음 — 영문은 구분되지만 한국어는 '상품/상품들' 등 표기 통일 필요
- [components-brand] lang/ko.json:382 / lang/en.json:382 — home.story.heading — 동사 주체 행위성 — ko 헤딩 '오래 쓸수록 익어지는 것들'이 '쓰는 사람' 행위를 암시하여 '조용한 일상의 물건들' 브랜드 톤(차분/관찰)과
- [components-brand] lang/ko.json:383 / lang/en.json:383 — home.story.body — 동사 시제 혼재 — '모은/소개합니다/우선합니다' 일부 과거·현재 시제 섞임. 톤 자체는 OK이나 브랜드 보이스(현재 시제)와 미세 차이
- [components-brand] lang/ko.json:394 / lang/en.json:394 — ko/en 의미 1:1 매칭 약함 — en 'one piece at a time'은 물건 단위 일반 표현, ko '오늘의 한 권'은 책 단위(책
- [components-brand] src/components/StoreFooter.tsx:104 (default) / lang superbify footer 카 — 데모 명시 저작권 — 'demo store built on Gnuboard 7' 영문 단일 표기, 데모 템플릿 정체성 노출
- [components-brand] lang/ko.json:530 / lang/en.json:530 — 데모 안내문 — 사업자 정보 미설정 시 노출되는 시안 문구
- [components-brand] lang/ko.json:539 / lang/en.json:539 — 정책 시안 문구 — 운영 전 법적 검토 필요 안내 문구 (의도적 시안 표기)
- [components-brand] lang/ko.json:465 / lang/en.json:465 — 데모 명시 — 시안/운영 전 안내 문구
- [components-brand] lang/ko.json:407 / lang/en.json:407 — 데모 명시 — 시안/운영 전 안내 문구
- [components-brand] src/components/CategoryNav.tsx:171 (하드코딩, en 문맥) — CategoryNav.tsx의 '(no categories)' 하드코딩 — lang 매핑 없이 영문 단일 표기
- [components-brand] lang/ko.json:515 / lang/en.json:515 — 데모 식별자 — 시안 표시
- [components-brand] src/components/fixtures/categories.json:59-62 — 데모 카테고리명 ko/en 표현 차이 — ko '데스크 액세서리' vs en 'Desk' 단일 단어
- [components-brand] src/components/fixtures/products.json:7-9 — 데모 상품명 — 시안 식별
- [components-brand] template.json:11 — meta description — 데모 템플릿 정체성 명시
- [components-brand] lang/ko.json:12 / lang/en.json:12 — base_layout_description (영문 단일, ko 미번역)
- [components-brand] lang/ko.json:532 / lang/en.json:532 — 푸터 정책 링크 라벨 (StoreFooter.tsx default fallback 동일)
- [components-brand] lang/ko.json:113 / lang/en.json:113 — errors.unauthorized_title 등
- [components-brand] src/components/NoticeList.tsx:62 (default 'No notices yet') — NoticeList의 'No notices yet'은 en.json NoticeList default 와 lang.notice.empty_tit
- [components-brand] src/components/StoreHeader.tsx:198, 209 (aria-label `${brandName} Home — sr-only 라벨/aria 문자열 — 시각 미노출, a11y 트리 전용
- [components-brand] src/components/StoreHeader.tsx:210-211 (SrOnly brandName/tagline) — sr-only brand/tagline 텍스트 노출 (시각 X, a11y 트리 전용, 동적 보간)
- [components-brand] src/components/Home 조립(layouts/pages/home.json)에서 lang.superbify.home. — 동사의 과도한 행동성 — '조용한 일상의 물건들' 브랜드 톤(차분/관찰)과 헤딩의 '오래 쓸수록 익어지는' 주체 행위가 미세 불일치 (스토리 헤
- [components-brand] src/components/StoreFooter.tsx:104 (default) / lang super-bify footer  — 저작권 표기 데모 명시 — 'demo store built on Gnuboard 7' 노출
- [components-brand] src/components/fixtures/categories.json:5-7 — 데모 카테고리 이름 (fixtures/categories.json)
- [components-brand] src/components/StoreHeader.tsx:210-211 (SrOnly brandName/tagline) — sr-only brand/tagline 텍스트 노출 (시각 X, a11y 트리)