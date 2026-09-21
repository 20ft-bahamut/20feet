# Changelog

이 프로젝트의 모든 주요 변경사항을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며,
[Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [Unreleased]

### Fixed

- **`#package` 스테이지 도입 카피의 대비 복원 — 원문 스크림 되살림.** 원문
  `source/styles.css` 156~158행의 `.package-stage::before` 는 다크 그라디언트
  (`linear-gradient(120deg, rgba(10,11,15,.84) 0%, .66 44%, .24 100%)`)와 Unsplash 스톡
  사진을 **한 선언**으로 갖고 있었습니다. 스톡 URL 을 제거할 때 그라디언트까지 함께
  사라져, 스테이지에 사진이 들어오는 순간 흰색 제목·핑크 눈금·서브 문단이 밝은 사진 위에서
  읽히지 않았습니다(형제 섹션인 `.pb-inquiry-shell::before`·`.pb-why-stage::before` 는
  그라디언트를 남겼는데 이 섹션만 빠져 있었습니다). 그라디언트 오버레이만 원문 값 그대로
  되살리고, 스크림이 **사진 위·카피 아래**에 오도록 `::before` 에 `z-index:1`,
  `.pb-package-copy` 를 `z-index:2` 로 맞췄습니다(원문의 상대 순서와 같습니다).
  업로드된 슬롯 이미지든 번들 자리표시자든 대비는 동일합니다. CSS 검사 테스트가 세 정지점·
  z 순서·`unsplash.com` 부재를 고정합니다.

- **원문에 없는 굵기 제거 — 예상견적 패널 제목.** 원문 `.estimate-panel h3`(styles.css 234행)은
  `font-weight` 를 선언하지 않으므로 h3 기본값 700 이 적용됩니다. 우리
  `.pb-inquiry-panel-title` 은 800 을 선언하고 있었습니다(→ 700). 같은 파일의
  `.pb-field-label` 800 은 원문 239행이 **실제로 선언하는** 값이라 그대로 두었습니다.
- **계산기에 컨테이너 누락.** 원문은 `#pricing > .wrap`(1280) 안에 `.estimator` 카드가
  들어가는데(styles.css 199~200행), 레이아웃이 `#pricing` 아래에 이 컴포넌트를 바로 놓아
  루트가 뷰포트 폭(1440)으로 퍼져 있었습니다 — 요약 박스 내용 폭이 544 vs 원문 473 이던
  원인입니다. 계산기 루트(로딩 스켈레톤·빈 상태 포함)가 다른 섹션과 같은 컨테이너
  (`min(calc(100% - 40px), 1280px)`, 720px 이하 24px)를 갖도록 했습니다. 이제 체인이
  원문과 동일합니다: estimator 1280 → grid 1218 → 열 668.625/525.375 → 요약 박스 525 →
  내용 473.
- **`#package` 섹션 패딩 누락.** 원문 `section { padding:110px 0 }`(source/styles.css 63행,
  720px 이하 82px — 310행)이 이 섹션 루트에만 빠져 있어 섹션 높이가 원문보다 220px 짧았다
  (1233 vs 1453). `.pb-packages` 에 같은 규칙·같은 중단점 구조를 추가해 1453 으로 일치했다.
- **중복 렌더 제거 — 동시작업 할인 표.** 원문 `#pricing`(body.html 247~321행)에는 할인 표가
  없고 표는 `#package` 의 `.benefit-box`(229~243행)에만 있습니다. `PriceDiscount` 가
  `discount` 데이터로 표를 한 번 더 그리던 렌더를 제거하고, 그 때문에 필요했던 `steps` prop
  과 스켈레톤·빈 상태·`.pb-pricing-step*` CSS 를 함께 지웠습니다. 표는 이제
  `PackageList`(`benefit_items`) 한 곳에서만 그립니다. `discount` 데이터 소스는
  `EstimateCalculator` 가 계속 쓰므로 유지합니다.
- **원문에 없는 굵기 제거 — 예상견적 요약 박스.** 원문 `.summary-box h3`(styles.css 211행)와
  `.summary-total b`(216행)는 `font-weight` 를 선언하지 않으므로 기본값(700, h3/b)이
  적용됩니다. 우리 CSS 는 둘 다 800 을 선언하고 있어 원문보다 굵게 보였습니다
  (700 으로 정정). 나머지 요약 박스 값(28px/1.16/-.04em, 행 14px · `rgba(255,255,255,.80)`
  · strong 800/#fff, 라벨 13px · 자간 .12em · 대문자 · #ffb9d6, 값 900 42px Manrope +
  16px Noto small, 노트 13px/1.72)은 원문과 이미 일치함을 측정으로 확인했습니다.
- **`(복수 선택 가능)` 힌트 크기.** 원문(body.html 431행)은 `<span>` 이고 크기를
  `.field label`(13px)에서 상속합니다. 우리는 `<small>` 이라 UA 의 `smaller`(≈10.8px)가
  적용돼 원문보다 작았습니다 — 마크업을 `<span>` 으로, CSS 를 `.pb-field-label span`
  으로 되돌려 13px 상속으로 맞췄습니다(색 `#8b909b` · 굵기 600 유지). 폼의 나머지
  필드 라벨은 전부 13px/800/`--ink` 로 원문과 일치했습니다.
- **FAQ 답변 첫 문장 강조 복원.** 원문은 여덟 답변 모두 첫 문장을 `<strong>` 으로
  감쌌지만 모듈이 답변을 평문으로 저장해 굵기가 사라져 있었습니다. 표시 단계에서
  첫 문장 경계를 추정해 그 문장만 굵게 렌더합니다(`src/lib/faqAnswer.ts`,
  `.pb-faq-answer strong { color: var(--pb-ink) }` — 원문 262행).
  판정 규칙(마침표 + 공백 + 뒤 텍스트)과 한계는 README [알려진 한계] 8번에 기록했습니다.
  저장값은 글자 단위로 그대로 렌더됩니다(문구·부호·공백을 바꾸지 않습니다).

### Added

- **원문에만 있던 문구 37키 복원** — 모듈 `copy` 도메인에 키가 없어 렌더되지 않던 눈금·
  라벨·CTA 를 시더에 추가하고 전부 배선했습니다(45키 → 82키).
  - 1차 30키: `about_stage_eyebrow`, `about_side_eyebrow`, `service_eyebrow`,
    `extra_box_cta`, `package_stage_eyebrow`, `package_a_label`·`package_b_label`·
    `package_c_label`, `package_{a,b,c}_note`(+`_sub`), `benefit_eyebrow`, `pricing_eyebrow`,
    `pricing_notice_label`, `estimator_eyebrow`, `estimator_air_label`,
    `estimator_row_count`·`estimator_row_base`·`estimator_row_discount`·
    `estimator_row_discount_amount`, `estimator_summary_total_label`, `estimator_cta_submit`,
    `estimator_cta_kakao`, `faq_eyebrow`, `projects_eyebrow`, `projects_card_kicker`,
    `projects_link_label`.
  - 2차 7키: `hero_cta_primary`·`hero_cta_secondary` — 히어로의 CTA 2개입니다. 이 키가
    없던 동안 히어로에는 **행동 유도 수단이 하나도 없었습니다**(원문 32·33행).
    `hero_visual_message_label`(원문 53행 `BRAND MESSAGE`), `header_cta`(원문 15행),
    `mobile_cta_estimate`·`mobile_cta_phone`·`mobile_cta_kakao`(원문 16·497~499행).
    값은 전부 원문 `body.html` 그대로입니다.
- 문구가 없을 때의 계약은 그대로입니다 — 키가 `null` 이면 각 컴포넌트가 그 문구를
  조용히 생략하고, 리터럴로 대체하지 않습니다. `SiteHeader`·`MobileBar` 의 라벨
  기본값 리터럴은 제거하고 두 컴포넌트가 `copy` 페이로드를 받도록 바꿨습니다
  (`SiteFooter` 와 같은 방식, `_user_base.json` 이 바인딩).
- 컴포넌트·레이아웃 테스트가 복원된 문구의 렌더와 미렌더를 각각 검증하고,
  `.pb-packages` 패딩 회귀를 CSS 검사로 막습니다. 테스트 17 파일 / 241개.
- **배경·스테이지·작업사례 커버 슬롯에 번들 자리표시자 사진 배선.** `hero_main`·
  `why_stage`·`package_stage`·`estimate_bg`·`case_1`~`case_4` 슬롯이 비어 있을 때
  중립 CSS 블록만 남아 페이지가 비어 보이던 자리를, 이미 승인된 서비스 사진 6장
  (`public/images/service-*.webp`)으로 채웁니다. `src/lib/serviceAssets.ts` 에
  `SLOT_PHOTO`(슬롯 키 → 자산 경로)와 `slotPhotoFor()` 를 추가해 서비스 사진과 같은
  2단 폴백을 씁니다 — **슬롯 URL 우선, 없으면 번들 자산, 둘 다 없으면 중립 CSS 블록**.
  소비처는 `Hero`(hero_main) · `AboutSection`(why_stage) · `PackageList`(package_stage) ·
  `InquiryForm`(estimate_bg) · `CaseGallery`(case_1~4, 카드 순번 = 슬롯 순번)이며
  `CaseGallery` 에 `media` prop 과 레이아웃 바인딩을 새로 추가했습니다. 새 이미지 파일은
  추가하지 않았고 외부 URL 도 쓰지 않습니다. 관리자가 슬롯에 업로드하면 그 이미지가
  항상 이깁니다. 테스트 18 파일 / 269개.

## [0.1.0] - 2026-09-19

PinkBro CleanCare 랜딩 페이지 사용자 템플릿(`pinkbro-cleancare`) 최초 릴리스.

### Added

- **섹션 8종** — 히어로(`#top`) / 브랜드 소개(`#about`) / 서비스 6종 그리드(`#service`) /
  패키지 3종(`#package`) / 가격·할인·예상견적(`#pricing`) / FAQ 8문항(`#faq`) /
  작업사례 4개(`#projects`) / 간편견적 문의(`#estimate`). 8개 섹션 모두 앵커 id 를 갖습니다.
- **예상견적 계산기** — 선택한 항목 종류 수 기준 할인 적용
  (2개 3% · 3~4개 5% · 5개 이상 10%). 할인 단계는 모듈의 `condition` 문자열에서 파싱합니다
  ([한계는 README 참조](README.md#할인-단계-파싱의-한계-중요)).
- **문의 폼 → 모듈 연동** — `POST /api/modules/pinkbro-contents/inquiry` 로 제출하고
  `pinkbro-contents` 모듈의 문의 게시판에 비밀글로 저장합니다. 클라이언트 1차 검증 +
  서버 검증 오류(422) 매핑, 더블 서밋 차단, 숨김 허니팟 필드(`website`) 포함.
- **카피 계약 45키** — `CopyData` 타입 45키를 선언하고 섹션 컴포넌트가 전부 소비합니다.
  페이지 카피를 템플릿에 하드코딩하지 않고 모듈 `copy` 도메인에서 받습니다.
- **이미지 슬롯** — 모듈이 등록한 16종 슬롯을 소비합니다. 슬롯이 비어 있으면 CSS 폴백
  또는 번들 자산으로 대체되고, 서비스·사례 슬롯은 게시글의 `photo_slot` / `cover_slot`
  메타를 통해 연결됩니다.
- **번들 자산 8종** — 소스 PNG 7장(20,995,653 B, 약 21 MB)을 WebP 로 변환해
  427,828 B(약 0.43 MB)로 줄였고(약 98% 감소), `og-image.png` 는 원본 그대로 복사했습니다.
  `dist/images/` 합계 1,119,986 B(약 1.1 MB).
- **SEO 메타데이터** — 라우트 메타 타이틀·설명, `og:image`, 그리고 JSON-LD
  `Organization` / `LocalBusiness` / `FAQPage` 구조화 데이터.
- **레이아웃** — `layouts/home.json`(`extends: _user_base`), `layouts/_user_base.json`,
  에러 레이아웃 3종(`errors/{403,404,500}.json`).
- **공개 API 데이터 소스 8종** — `site` · `copy` · `discount` · `services` · `packages` ·
  `cases` · `faq` · `media-slots`.
- **컴포넌트 등록** — basic 15종 + composite 12종.
- **빌드/테스트 규격** — lib IIFE(`dist/js/components.iife.js`), `dist/css/components.css`,
  `dist/index.d.ts`, external react 3종, `G7_BUILD_SOURCEMAP` 로 소스맵 제어. 커밋된
  `dist/` 에는 소스맵이 없습니다. 테스트 17 파일 / 206개, `tsc --noEmit` 0 오류.

### 알려진 한계

- 작업사례 카드의 블로그 URL 은 관리자가 입력할 때까지 비어 있고, 그동안 카드는
  링크가 아닌 `<div aria-disabled="true">` 로 렌더됩니다.
- JSON-LD `FAQPage` 는 레이아웃에 원문으로 고정되어 있어 관리자의 FAQ 편집이
  구조화 데이터에 반영되지 않습니다.
- JSON-LD `logo`·`image` 는 절대 URL 이 아니라 루트 상대 경로입니다.
- 콘텐츠를 편집하는 관리자 화면은 `pinkbro-contents` 모듈 0.1.0 에 아직 없습니다
  (관리자 라우트 정의가 비어 있음). 구조화 필드는 `pinkbro_meta` 행으로 존재합니다.
- `error_config` 는 키 6종을 선언하지만 레이아웃 파일은 3종(`403`/`404`/`500`)입니다.
