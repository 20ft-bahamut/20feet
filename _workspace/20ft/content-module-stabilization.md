# 20ft Content 모듈 안정화 (2026-08-27)

## 배경
- 실서버 배포 전 twentyft-content 아키텍처 판정 + 버그 전수 조사 수행.
- 판정: 모듈 분리 아키텍처 자체는 옳음(board에 extra-fields/CPT 없음 확인). 실행 위생 문제였음.

## 확정 수정 (modules/_bundled/twentyft-content, v0.1.2 → 0.1.3)
- CRITICAL: 한글 제목 slug 전부 `untitled` 붕괴 → 유니코드 slug + `post-{id}` fallback. 라우트 정규식도 `[^/]+` 교체.
- HIGH: 공개 API `status != 'trash'` — trash 무효 literal이라 blinded 노출 → `published` 만 조회. Admin은 `deleted` 배제.
- HIGH: Admin update DB::transaction 적용 + metaFields 누락 복구 (portfolio `gallery_attachment_ids`, superbify `screenshot_attachment_ids`, `download_url`/`purchase_url`).
- HIGH: Admin slug 중복 검증(422) + 목록 검색 `$post->title['ko']` 문자열 버그 수정.
- HIGH: 공개 목록 N+1 제거 — `PostMetaRepositoryInterface::getAllByBoard` 배치 조회 + `with('attachments')` + `portfolioMetaFromArray`/`superbifyMetaFromArray` 정규화.
- HIGH: Inquiry가 Post::create 직접 호출 → `PostService::createPost` 경유 (알림/훅/캐시 무효화 정상화).
- MEDIUM: `ContentMetaCleanupListener` 추가 — post/board 삭제 시 twentyft_post_meta 정리, module.php getHookListeners 등록.
- MEDIUM: inquiry throttle 10/min + honeypot(`website` prohibited). 커버 이미지 `is_image` 필터.
- debug 필드(`_debug_*`) controller + resource 제거. seeder [TEST] 샘플 active→bundled backport.

## 검증 상태
- php -l 전원 통과, Pint passed, `route:list` 15 라우트 정상 등록.
- 테스트 실행 불가: `tests/bootstrap.php`가 `.env.testing` 강제 (사용자 생성 필요). DB 테스트는 .env.testing 준비 후.
- slug 유니코드 로직은 php -r 로직 검증 완료 (한글 보존, 빈 값 fallback).

## Admin 폼 이미지 UX (2026-08-27 추가, v0.1.3)
- `대표 이미지 첨부 ID` 숫자 입력 제거 → G7 공식 `FileUploader` 카드(sirsoft-board 첨부 엔드포인트 + temp_key 플로우) + 업로드 이미지 선택 Select.
- Admin show에 `attachments`(AttachmentResource) 포함. Admin update는 `temp_key` 받아 `PostService::updatePost`로 첨부 연결.
- 공개 상세: 갤러리/스크린샷 메타 미지정 시 게시글 이미지 첨부 전체 사용 — 업로드만으로 커버+갤러리 구성.
- 검증: JSON/lint/Pint 통과. **런타임 반영 + 브라우저 QA 미검증** (FileUploader props는 board 공식 레이아웃과 동일 패턴 복사).
- 대표 이미지 미지정 시 첫 이미지 자동 사용은 공개 API cover fallback이 처리.

## 미처리 / 다음 단계
- **런타임 미반영**: 수정은 전부 `_bundled`(SSoT). active(`modules/twentyft-content`)는 구버전. `php artisan module:update twentyft-content --force` 또는 /twentyft-runtime-sync에서 반영 필요.
- `modules/twentyft-content` active copy에만 있던 커밋 없음 확인(커밋은 전부 bundled 경로).
- 문의 폼 프런트엔드는 개인정보 카피 확정(COPY REQUIRED)까지 disabled 유지.
- PortfolioDetail.tsx 원시 HTML 렌더링 sanitize — 관리자 입력 신뢰 전제, 별도 검토 항목.
- slugFromTitle 4곳 중복 — 이후 Support 클래스 추출 후보.