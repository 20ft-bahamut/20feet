# Still Form Copy Style Guide

> COPY REMEDIATION 작업의 판단 기준. Source of Truth: 사용자 지시(2026-09-02) + `_workspace/still-form/COPY_INVENTORY.md`(BEFORE evidence).

## 1. 판단 순서

```
1. 이해 → 2. 기능 → 3. 자연스러운 한국어 → 4. 브랜드 → 5. 감성
```

감성이 이해보다 앞서면 실패. Still Form은 시집/에세이가 아니라 Commerce Website.

## 2. Voice

- 짧다, 담백하다, 구체적이다, 과장하지 않는다
- 실제 사물(컵·접시·조명·패브릭·재질·형태·크기·쓰임)과 실제 행동(고르다·쓰다·놓다·담다·확인하다·구매하다)을 말한다
- 한국 사람이 실제로 쓸 법한 문장
- 설명할 필요 없는 것은 설명하지 않는다. **한 문장을 지워도 의미가 유지되면 지운다. 한 단어로 충분하면 세 단어를 쓰지 않는다.**

## 3. LOCKED COPY (변경 금지)

| 텍스트 | 위치 |
|--------|------|
| `Still Form` | Brand name 전역 |
| `조용한 일상의 물건들` (ko) / `Quiet objects for everyday life` (en) | Main tagline — hero.headline, meta.title |

이 한 문장이 브랜드 감성을 담당한다. 다른 Section에서 `조용한 / 일상 / 머무는 / 천천히` 반복 금지.

## 4. AI COPY 금지 표현군

근거 없는 한 새로 사용하지 않는다. 기존 카피에 있으면 우선 교정 대상:

```
머무는 사물 / 오래 머무를 / 시간을 담다 / 시간이 스며들다 / 스며드는 /
이야기를 담다 / 말을 걸다 / 재질이 말을 걸다 / 차곡차곡 / 천천히 소개합니다 /
익어지는 물건 / 익은 것 / 조용하지만 단단한 / 조용히, 그러나 단단하게 /
공간에 한 점 / 일상의 한켠 / 일상의 한 자리 / 결을 담다 / 본연의 / 온전한 /
가치 있는 / 당신의 일상 / 특별한 순간 / 오래도록 함께할 / 소중한 /
취향을 완성하다 / 삶을 채우다 / 공간을 채우다 / 감각적인 / 섬세한 감성 /
특별한 경험 / 하나의 이야기 / 시간이 흐를수록 좋아지는 / 오래 쓸수록 익어지는
```

Rewrite 후보 구조(AI detection heuristic):
`A보다 B`, `X가 아니라 Y`, `시간이 지나면…`, `일상 속…`, `공간 안에서…`,
`…을 담다`, `…을 이야기하다`, `…을 만나다`, `…을 발견하다`, `…과 함께하다`
— 같은 패턴 2회 이상 반복 금지.

## 5. 반복 단어 감시 목록

`조용 / 일상 / 오래 / 시간 / 머물 / 차분 / 천천히 / 공간 / 이야기 / 감성 / 취향`
— 전체 카피에서 빈도 확인, 필요 이상 반복 시 줄인다. Tagline은 예외.

## 6. Home Section 역할 분리 (같은 철학 반복 금지)

| Section | 역할 |
|---------|------|
| Hero | 브랜드/쇼핑몰 소개 |
| Story | 상품을 고르는 기준 |
| Editorial | 실제 생활에서 사용하는 제품 |
| Promo | 특정 제품/카테고리 추천 |
| Final CTA | 전체 상품 탐색 |

## 7. Functional English 제거

- 유지 허용(Design/Editorial element): `HOME & LIFESTYLE`, `EDITORIAL`, `EXPLORE`, `NEW`, `POPULAR`, `RELATED`, `CATEGORIES`, `POLICY`, `LIFESTYLE`, `PRODUCT`, `INFO`, `SHIPPING`(label 한정), `BRAND STORY`
- 제거 대상(Functional): `Checkout`(버튼), `SHOPPING BAG`, `YOU MAY ALSO LIKE`, `+ items`, `demo` 마커는 유지(DEMO_ONLY)
- 영어 Eyebrow + 한국어 Heading이 같은 뜻 반복 시 eyebrow 줄이거나 역할 분리 (예: `RELATED` + `함께 보면 좋은 상품`)
- ko Locale에서 기능 UI는 한국어 기본. en Locale에서는 자연스러운 영어.

## 8. 문장 Tone

- 사용자 안내: `~해 주세요` 기본 (쿠폰을 선택해 주세요)
- 버튼: 짧은 동사 허용 (`적용`, `삭제`, `주문 조회`). 문맥상 목적어 포함(`수량 변경`)이 더 명확하면 사용
- Checkbox label: 평서문 금지. 선택 행위 표현 (`배송지 저장`)
- Confirm dialog: 평서문 종결 금지 → 의문형 (`…삭제하시겠어요?`)
- Error: 시스템 어투 금지. 사용자 관점 (`주문을 진행할 수 없습니다`). Backend error code는 임의 은폐/변경 금지
- Static page 부제: 진행형 금지. 불필요한 subtitle은 삭제 우선 검토

## 9. 띄어쓰기 통일

`주문내역 → 주문 내역`, `휴대폰번호 → 휴대폰 번호`, `현금영수증카드 → 현금영수증 카드`, `할인코드 → 할인 코드` — 동일 개념 전수 검색.

## 10. 길이

버튼 2~8자, 라벨 짧게, helper 1문장, empty state heading 1줄 + (필요 시) body 1줄, marketing body 2~3문장 이하. 한 Section에서 브랜드 철학 4~5문장 설명 금지.

## 11. 데모/법적 문구 분리

- DEMO_ONLY: `데모 스토어입니다…`, `관리자에서 상품을 등록하면…`(public empty state에서는 제외), `본 문서는 템플릿 시안 문구입니다…` — 일반 UX 카피와 섞지 않음
- Legal(약관/개인정보/배송정책 본문): 명백한 오타·띄어쓰기·UI 라벨만 수정. 법적 의미 변경 가능성 있으면 `LEGAL_REVIEW_REQUIRED` 표시 후 원문 유지
- A11y(aria-label/sr-only): 감성 이유로 변경하지 않음. 기능 명확성만 확보
- 변수/interpolation token(`{{count}}` 등) 절대 훼손 금지

## 12. 실제 사람 말 테스트 (모든 주요 카피)

1. 한국 쇼핑몰 운영자가 직접 썼다고 해도 어색하지 않은가?
2. 사진 없이 읽어도 무슨 뜻인가?
3. 형용사/추상명사를 하나 빼도 의미가 유지되면 빼는 것이 낫지 않은가?
4. 사용자가 지금 무엇을 할 수 있는지 알 수 있는가?