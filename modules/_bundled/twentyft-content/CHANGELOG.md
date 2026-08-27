# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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