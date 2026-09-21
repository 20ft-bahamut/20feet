# Changelog

이 프로젝트의 모든 주요 변경사항을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며,
[Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [Unreleased]

### Added

- 시더 `COPY` 상수에 원문(`_workspace/pinkbro/source/body.html`)에만 있고 키가 없던
  문구 30개를 추가했습니다(45키 → 75키). 값은 원문 그대로이며, 어느 행에서 왔는지는
  상수의 주석에 남겼습니다.
  - about: `about_stage_eyebrow`(68행) · `about_side_eyebrow`(76행)
  - service: `service_eyebrow`(100행) · `extra_box_cta`(166행)
  - package: `package_stage_eyebrow`(175행) · `package_a_label`(182행) ·
    `package_b_label`(197행) · `package_c_label`(212행) · `package_{a,b,c}_note` 와
    `_sub`(193·208·225행의 `.pkg-note` 두 줄) · `benefit_eyebrow`(232행)
  - pricing/estimator: `pricing_eyebrow`(251행) · `pricing_notice_label`(259행) ·
    `estimator_eyebrow`(275행) · `estimator_air_label`(291행) ·
    `estimator_row_count`·`estimator_row_base`·`estimator_row_discount`·
    `estimator_row_discount_amount`(303~306행) · `estimator_summary_total_label`(309행) ·
    `estimator_cta_submit`·`estimator_cta_kakao`(314~315행)
  - faq: `faq_eyebrow`(326행)
  - projects: `projects_eyebrow`(371행) · `projects_card_kicker`·`projects_link_label`(379행)
- `estimator_summary_heading`(‘예상 기본금액 요약’)은 0.1.0 에 이미 있으므로 중복 키를
  만들지 않았습니다.
- 헤더·히어로·모바일바 7키를 추가했습니다(75키 → 82키). 값은 원문 그대로입니다.
  - hero: `hero_cta_primary`(32행) · `hero_cta_secondary`(33행) ·
    `hero_visual_message_label`(53행)
  - header: `header_cta`(15행)
  - mobile bar: `mobile_cta_estimate`(16·498행 — 두 자리가 같은 문자열이라 키 하나) ·
    `mobile_cta_phone`(497행) · `mobile_cta_kakao`(499행)
  - `BRAND MESSAGE` 는 기존 `hero_visual_label`(상단 배지, 50행)과 다른 자리라
    이름을 `hero_visual_message_label` 로 구분했습니다.

### Note

- 시더는 멱등합니다. `module:seed pinkbro-contents --class=PinkbroContentsSeeder` 를 다시
  돌리면 새 키만 upsert 되고 기존 값은 그대로입니다.

## [0.1.0] - 2026-09-18

### Added

- 모듈 골격을 추가했습니다. 식별자 `pinkbro-contents`, 네임스페이스 `Modules\Pinkbro\Contents`.
- 권한 4개 카테고리(콘텐츠·미디어·사이트 설정·문의)와 관리자 메뉴 5개 항목을 선언했습니다.
- 서비스 프로바이더, 모듈 다국어(`src/lang/{ko,en}`), 공개 API 라우트 파일 자리를 만들었습니다.
- 관리자 라우트 정의(`resources/routes/admin.json`)와 관리자 SPA 다국어 자리를 만들었습니다.
- 구조화 메타 테이블 `pinkbro_meta`(`board_id`/`post_id` nullable 확장)와 조회·저장·삭제 서비스를 추가했습니다.
- 미디어 슬롯 16종 레지스트리와 슬롯→첨부 URL 해석 서비스를 추가했습니다.
- 시더 `PinkbroContentsSeeder` 를 추가하고 `module.php::getSeeders()` 에 연결했습니다.
  - 게시판 6종(`pinkbro_service`, `pinkbro_package`, `pinkbro_case`, `pinkbro_faq`, `pinkbro_inquiry`, `pinkbro_media`)을 멱등하게 생성합니다. 문의 게시판은 비회원 글쓰기 권한과 관리자 알림을 갖습니다.
  - 서비스 6종(에어컨 종류별 `air_types` 포함)·패키지 3종·작업사례 4종·FAQ 8종을 게시글과 메타로 주입합니다.
  - 사이트 레벨 `site`·`copy`·`discount` 메타를 주입합니다. 카피는 소스 추출본 원문 그대로입니다.
