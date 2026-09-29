# Changelog

이 프로젝트의 모든 주요 변경사항을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며,
[Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [Unreleased]

## [0.3.0] - 2026-09-29

### Added

- **사례(case) 커버 업로드 — 저장 API 가 `cover_temp_key` 를 슬롯 연결로 푸는 경로.**
  case 도메인의 생성·수정(`admin/content/{domain}`)이 검증 통과 요청에 1회용 연산 키
  `cover_temp_key` 를 받으면, 저장 트랜잭션 안에서 그 임시 첨부를 `cover_slot` 이
  가리키는 슬롯에 연결합니다(`MediaSlotLinkService::linkTemp` — 미디어 API 와 같은
  공용 경로, `AdminContentController::linkCaseCover`). 연결 실패(예: 검증과 연결 사이
  키 소비)면 사례 게시글·메타 쓰기도 함께 롤백됩니다 — 연결이 호출자 트랜잭션 안에서
  세이브포인트로 중첩되기 때문입니다. 업로드와 저장이 한 흐름이므로 "글은 저장,
  사진은 실패" 상태를 만들지 않습니다. 대신 커버 연결 실패는 422 로 보입니다.
  `cover_temp_key` 는 메타 표(`ContentStoreRequest::FIELDS`)에 넣지 않은 키라 컨트롤러가
  `pullCoverTempKey` 로 검증 통과 데이터에서 떼어냅니다.
- `ContentStoreRequest` case 규칙 — `cover_temp_key` 는 `board_attachments` 의
  임시 첨부( board_id=0 · post_id NULL · 삭제 안 된 행, max 64자)만 받고,
  `cover_slot` 은 `required_with:cover_temp_key` + `Rule::in(caseSlotKeys())` 로
  목록 밖 키를 받지 않습니다. `prepareForValidation` 이 빈 문자열을 null 로
  정규화합니다("미지정" 은 null — 부분 갱신에서 메타 삭제). 수정 요청
  (`ContentUpdateRequest`)도 생성 요청을 상속하므로 같은 규칙을 씁니다.
- `AdminContentResource` — case 도메인 응답(목록·단건·생성·수정 공통)에
  `cover{slot,url,alt}` 컴포지트를 추가했습니다. 컨트롤러 `payload` 가
  `cover_slot` 메타를 `MediaSlotService::resolve` 로 해석해 내려주고, 레지스트리 밖
  키(레거시 손입력 잔여값)는 해석하지 않고 url null 로 돌려줍니다. 이 키는 메타 키가
  아니므로 `KEYS` 정합성 표에 넣지 않았습니다 — 정합성 테스트가 비교하는 범위가 유지됩니다.
- `MediaSlotService::caseSlotKeys()` — 레지스트리에서 `case_` 접두 키만 고르는 파생
  목록입니다. 요청 검증과 관리자 폼 선택지가 각자 목록을 적을 때 어긋나지 않게
  레지스트리가 유일한 출처로 유지됩니다.
- **관리자 사례 폼에 커버 업로더**(`resources/layouts/admin/admin_content_form.json` +
  `partials/admin_content_form/_field_group_case.json`). 미리보기 · 업로더
  (`case_cover_uploader`) · 커버 해제 버튼이 들어갔고 업로더 계약은 미디어 폼 슬롯
  하나와 같습니다(collection `main`, maxFiles 1, `autoUpload false`, init_actions 가
  생성한 tempKey 를 FormData `temp_key` 로) — 이벤트 이름은 미디어 폼의 16개와
  겹치지 않는 `upload:pinkbro-contents:case_cover` 입니다. 저장 버튼은 case 도메인이면
  emitEvent 로 업로드를 실행하고, 실제로 업로드된 첨부가 있을 때만
  `cover_temp_key` 를 싣습니다(파일 없는 저장은 커버 없이 메타만 갱신).
  커버 해제는 미디어 폼과 같은 슬롯 단위 DELETE(첨부 파일은 남습니다)이며 대상은
  폼 값이 아니라 리소스가 보고한 현재 연결 슬롯입니다.
- 사례 폼의 `cover_slot` 입력을 손 입력에서 select 로 바꿨습니다. 선택지는
  `GET admin/media` 응답의 case_ 슬롯(키·라벨 모두 레지스트리 파생)이고, 기록값이
  목록 밖이면 첫 항목으로, 빈값은 그대로 둡니다(랜딩은 카드 순번 폴백).
- Feature 테스트 `AdminCaseCoverApiTest` 6개 — 생성/수정에서 커버 연결, 목록 밖
  슬롯 422, 업로드에 슬롯 없음 422, 모르는 temp_key 422, 연결 실패 롤백(사례 게시글
  쓰기 흔적 제거). DB 미가용 환경 skip 을 선례와 같이 setUp 에서 유지합니다.

### Changed

- `AdminMediaController::link` 본문의 연결 체인(임시 첨부 확보 → 앵커 게시글 확보 →
  이전 첨부 release → temp_key 소비 → 슬롯 메타 기록)을 공용 서비스
  `MediaSlotLinkService` 로 추출했습니다. 사례 저장이 같은 코드를 써야 하기 위해서입니다.
  동작 변화는 없습니다(alt-only 경로에서 첨부 상한·release 조건·앵커 생성 규칙과
  게시판 404 확인 시점 포함) — 근거 주석도 옮겨간 곳에 있습니다.

## [0.2.0] - 2026-09-23

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

- 푸터 카피 7키를 추가했습니다(82키 → 89키). 값은 원문 `body.html` 479~488행 그대로입니다.
  - `footer_core_service_heading`(479행) · `footer_core_service`(480행 — 원문 `<br>` 을
    개행(`\n`)으로 보존한 스칼라) · `footer_more_service_heading`(483행) ·
    `footer_more_service`(484행) · `footer_contact_heading`(487행) ·
    `footer_contact_phone_label`·`footer_contact_kakao_label`(488행의 표시 라벨 2줄).
  - Contact 의 값(전화번호·채널 URL·지역)은 SITE 도메인이 갖습니다(`site.phone` /
    `site.kakao_channel` / `site.region`) — COPY 는 표시 라벨만 갖습니다.
- 관리자 copy 편집 폼(`resources/layouts/admin/admin_copy_form.json`)에 푸터 7키 필드를
  추가하고, `CopyUpdateRequest` 의 허용 키 목록을 82키 → 89키(스칼라 77개 → 84개)로
  확장했습니다. `AdminSiteApiTest` 의 키 수 단언도 함께 갱신했습니다.

### Fixed

- 시더가 원문의 인라인 마크업을 그대로 저장하도록 복원했습니다. FAQ 답변 8건
  (`body.html` 333~361행 — 여덟 답변 모두 첫 문장이 `<strong>`)과 `pricing_field`
  (264행), `estimate_panel_note`(456행) 값에 `<strong>` 마크업을 넣었습니다(10건).
  강조 경계는 원본과 글자 단위로 일치합니다(345행은 "네. 기본가는 … 150,000원~입니다."
  까지, 349행은 "아닙니다. … 기준가입니다." 까지). 표시 계층이 경계를 추정하지 않습니다.

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
