# SHIP-ISLAND-012 → RESOLVED (Case A: 데이터/API 경로 문제였음)

기능 존재 확인 (sirsoft-ecommerce 1.1.2):
- 모델: ExtraFeeTemplate + ShippingPolicyCountrySetting::getExtraFeeForZipcode (:275-330, 범위 "63xxx-63yyy", 와일드카드 "63*", 정확일치 지원)
- 계산: OrderCalculationService::calculateExtraShippingFee (:1214-1240, KR 전용, per-unit multiply 지원)
- Admin: /admin/extra-fee-templates CRUD (ExtraFeeTemplateStoreRequest)

QA TEST DATA (생성):
- extra-fee-template id=1 (zipcode 63558, fee 3000, 제주산간, active)
- shipping-policy id=4 QA E2E 도서산간 정책 (fixed 3000 + extra {63558:3000})
- 기존 policy 2 수정 건: extra_fee_settings {63000-63999: 3000} (이전 세션 shipping 에이전트가 추가)

BEFORE/AFTER (GET /api/.../checkout?zipcode=... runtime):
- zipcode 63558 (정책4 연결 상품): base 3000 + extra 3000 = 6,000 / final 86,000 (subtotal 80,000)
- zipcode 06611: base 3000, extra 0 = 3,000 / final 83,000
- zipcode 63100: policy2 범위(63000-63999)이지만 product가 policy 4 → extra 0 (product-policy 연계 정상)

RESULT: PASS — shipping preview API(GET /checkout?zipcode=)에서 도서산간 추가배송비 정확 반영.
학습: 배송비 재계산은 GET /checkout 쿼리파라미터(zipcode/region/country_code) 기반이며 PUT /checkout의 shipping_address는 주문생성 시에만 사용.
