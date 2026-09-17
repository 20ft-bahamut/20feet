# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - 2026-09-17

### Added
- 프로젝트 문의 상세 화면 — `admin_inquiry_detail` 레이아웃 + 라우트 `*/admin/20ft-content/inquiries/:post_id`.
  목록이 6개 컬럼만 보여주던 탓에 전화·예산·희망 일정·현재 사이트·참고 링크·개인정보 동의 기록을
  열람할 화면이 없었다. 상세는 메타 11종 + 게시글 본문을 한 화면에 모으고 처리 상태를 변경한다.
- `GET /api/modules/twentyft-content/admin/inquiries/{post_id}` — 상세 응답
  (`permission:admin,twentyft-content.inquiries.read`). 상태 변경은 기존 `PATCH .../status` 재사용.
- `InquiryStatus::label()` — 관리자 화면용 한국어 라벨(신규/검토 중/회신함/미팅 진행/견적 작성/종료).
- 목록 응답에 `projectTypeLabel` / `internalStatusLabel` / `createdAtLabel` 추가 — 목록이 `WEB`·`NEW` 같은
  enum 원문과 ISO 타임스탬프를 그대로 노출하던 것을 한국어 라벨·`Y-m-d H:i` 로 교체(기존 키는 유지).
- 문의 목록 행 링크를 게시판 글 편집에서 문의 상세로 변경. 게시판 본문 편집은 상세 화면의
  `게시판에서 본문 수정` 버튼으로 남긴다(본문 편집 경로 자체는 제거하지 않음).

### Fixed
- 상세 화면의 URL·이메일 링크가 값이 없을 때도 `href=""` 앵커로 렌더되던 문제 —
  클릭하면 현재 페이지가 다시 로드돼 고장난 링크처럼 보였다. 값이 있을 때만 앵커를 만들고,
  없으면 `-` 텍스트를 둔다. (회귀 테스트: `test_link_fields_never_render_an_anchor_without_a_value`)
- 상태 변경 카드가 읽기 권한만 가진 운영자에게도 보이던 문제 — 눌러도 PATCH 가 403 이었다.
  카드에 `permissions: ["twentyft-content.inquiries.update"]` 를 선언해 서버가 노드를 제거한다.
  (회귀 테스트: `test_status_control_is_gated_by_the_update_permission`)
- `InquiryStatus::label()` 이 한국어를 하드코딩해, en 로케일 운영자에게 Select 옵션은 영어인데
  목록·상세 라벨은 한국어로 나오던 문제 — `labelKey()` + `trans` 로 교체하고
  `src/lang/{ko,en}/enums.php` 를 추가했다. 유형·예산의 표시용 라벨도 같은 방식으로 번역한다.
  (`InquiryProjectType::label()` 은 접수 시 게시글 제목에 저장되는 값이라 건드리지 않았다)
- 숫자가 아닌 `post_id` 가 컨트롤러의 `int` 파라미터에 닿아 TypeError → 500 이 되던 문제 —
  라우트에 `[0-9]+` 제약을 걸어 404 로 돌린다.
- 상태 변경 API 에 배열·객체를 보내면 `tryFrom` 에서 TypeError → 500 이 되던 문제 — 422 로 정리.
  (기존 코드였으나 상세 화면에서 상태 변경을 노출하면서 함께 손봤다)
- `tests/Feature/InquiryAdminApiTest.php` 추가 — 커널을 띄워 권한 경계(401/403), 404·422 분기,
  응답 계약, 로케일 라벨, 게시판 격리를 실제 요청으로 검증한다. 테스트 DB 접속이 없는 환경에서는
  `beforeRefreshingDatabase()` 가 건너뛴다(환경 미비와 테스트 실패를 구분).

### Changed
- `resources/lang/ko.json` / `en.json` — `common.back_to_list`, `admin.inquiries.detail_*`,
  `admin.sections.{receipt,inquirer,request,internal_status}_info`, `admin.fields.{post_id,desired_schedule,
  current_site_url,reference_url,privacy_consent,...,current_status}`, `admin.inquiry_status.*`,
  `admin.messages.status_*` 추가.

## [0.1.3] - 2026-08-27

### Added
- 관리자 Portfolio/SuperBify 폼에 이미지 업로드 지원 — `FileUploader` (sirsoft-board 첨부 엔드포인트 + temp_key 플로우) 카드 추가, `대표 이미지 첨부 ID` 숫자 입력을 업로드된 이미지 선택 Select 로 교체.
- Admin show 응답에 `attachments` (AttachmentResource) 포함 — FileUploader initialFiles / 대표 이미지 선택 옵션으로 사용.
- Admin update가 `temp_key` 를 받아 `PostService::updatePost` 로 첨부를 게시글에 연결.
- 공개 상세 API: 갤러리/스크린샷 메타 미지정 시 게시글의 이미지 첨부 전체를 순서대로 사용 (업로드만으로 커버+갤러리 구성).

### Fixed
- 공개 Portfolio/SuperBify 목록·상세가 `status != 'trash'` 로 조회해 `blinded`(블라인드) 게시글까지 노출하던 문제 — `published` 상태만 조회하도록 수정. Admin API는 `deleted` 배제로 교정.
- 한글 제목 slug가 `slugFromTitle` 정규식에서 전부 제거되어 `untitled` 로 붕괴하던 문제 — 유니코드 slug 허용 + 빈 값 시 `post-{id}` 고유 fallback. 상세 라우트 정규식도 유니코드 허용으로 교정.
- Admin update에서 제목 저장과 메타 갱신이 비원자적으로 처리되던 문제 — `DB::transaction` 적용.
- Admin update metaFields 누락 — Portfolio `gallery_attachment_ids`, SuperBify `screenshot_attachment_ids` 가 저장되지 않던 문제.
- Admin update에 slug 중복 검증 추가 (같은 게시판 내 중복 slug → 422).
- Admin 목록 키워드 검색이 `Post.title` 을 배열처럼 참조해 항상 빈 값이던 문제.
- SuperBify 상세 응답에 `links.download` / `links.purchase` 누락 — 템플릿이 참조하는데 미방출되던 문제.
- 커버 이미지 fallback이 이미지가 아닌 첨부파일(preview_url 미제공)을 골라 `<img>` 를 깨뜨리던 문제 — `is_image` 필터 적용.
- Inquiry 접수가 `Post::create` 직접 호출로 PostService 쓰기 경로(알림 `notify_admin_on_post`, before/after_create 훅, 캐시 무효화)를 우회하던 문제 — `PostService::createPost` 경유로 변경.
- 스팸 대응 — 문의 엔드포인트 throttle 60/min → 10/min 강화, honeypot 필드 검증 추가.

### Changed
- 공개 목록/상세의 N+1 제거: 메타를 게시판 단위 1회 일괄 조회(`PostMetaRepositoryInterface::getAllByBoard` 추가), attachments eager-load, 커버 이미지는 적재된 컬렉션에서 해석.
- PostMetaService: `portfolioMetaFromArray` / `superbifyMetaFromArray` 일괄 정규화 메서드 추가. SuperBify 메타에 `download_url` / `purchase_url` 포함.

### Added
- `ContentMetaCleanupListener` — 게시글 삭제(`sirsoft-board.post.after_delete`) 및 게시판 삭제(`sirsoft-board.board.posts.before_force_delete`) 시 `twentyft_post_meta` 고아 행 정리. module `getHookListeners()` 에 등록.

### Security
- `InquiryStoreRequest` honeypot(`website` 필드) 검증.

## [0.1.2] - 2026-08-25

### Added
- Portfolio / SuperBify / 프로젝트 문의 공개 및 관리자 API.
- `twentyft_post_meta` 도메인 메타 테이블 및 시더(3개 운영 게시판).
- 관리자 UI 레이아웃 JSON.