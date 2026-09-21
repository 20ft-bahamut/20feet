# Changelog

이 프로젝트의 모든 주요 변경사항을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며,
[Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [Unreleased]

### Fixed

- **`#package` 섹션 패딩 누락.** 원문 `section { padding:110px 0 }`(source/styles.css 63행,
  720px 이하 82px — 310행)이 이 섹션 루트에만 빠져 있어 섹션 높이가 원문보다 220px 짧았다
  (1233 vs 1453). `.pb-packages` 에 같은 규칙·같은 중단점 구조를 추가해 1453 으로 일치했다.
- **중복 렌더 제거 — 동시작업 할인 표.** 원문 `#pricing`(body.html 247~321행)에는 할인 표가
  없고 표는 `#package` 의 `.benefit-box`(229~243행)에만 있습니다. `PriceDiscount` 가
  `discount` 데이터로 표를 한 번 더 그리던 렌더를 제거하고, 그 때문에 필요했던 `steps` prop
  과 스켈레톤·빈 상태·`.pb-pricing-step*` CSS 를 함께 지웠습니다. 표는 이제
  `PackageList`(`benefit_items`) 한 곳에서만 그립니다. `discount` 데이터 소스는
  `EstimateCalculator` 가 계속 쓰므로 유지합니다.

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
