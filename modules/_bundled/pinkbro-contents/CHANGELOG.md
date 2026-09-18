# Changelog

이 프로젝트의 모든 주요 변경사항을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며,
[Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

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
