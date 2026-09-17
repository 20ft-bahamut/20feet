# 구현 상태 — 20ft 외주 수주 중심 개편

- 최종 갱신: 2026-09-16
- 현재 단계: 구현 완료 / 운영 공개 차단 있음 (수신 설정·개인정보 문구 미확정)
- 작업 브랜치/작업 위치: `main`, 커밋하지 않음(작업 트리 변경 상태)
- 실제 G7 버전: 7.0.8 (`php artisan template:list`, 관리자 화면 하단과 일치)
- 20ft Studio 경로/식별자/버전:
  - SSoT(소스): `templates/_bundled/twentyft-studio/` — `identifier: twentyft-studio`
  - 런타임(서빙): `templates/twentyft-studio/` — 루트 `.gitignore`의 `templates/*/` 규칙으로 미추적
  - 버전: 0.2.0 → **0.3.0**
- 콘텐츠 의존성: `modules/twentyft-content` (v0.1.3, 내부 모듈) + `sirsoft-board`

## 완료한 작업

1. 하네스 `docs/20ft-renewal-harness/` 01–11 + README/START-HERE + templates 전부 읽음.
2. 저장소·G7·런타임 조사(레이아웃 저장 위치, 라우트 소비 방식, 문의 API 계약, 콘텐츠 모델).
3. IA·라우트 개편: `/services`, `/services/website`, `/services/commerce`,
   `/services/web-development`, `/process` 신설. `/`, `/portfolio`, `/portfolio/:slug`,
   `/about`, `/inquiry`, `/superbify`, `/superbify/:slug` 경로 보존.
4. 헤더·푸터·홈 7개 섹션·서비스 4페이지·진행 안내·소개·문의 재작성.
5. 문의 기능 실제 접수 구현 (`POST /api/modules/twentyft-content/inquiries`).
6. 브라우저 검증 3종: 라우트 스모크 24/24, 문의 흐름 18/18, 본문 표시 28/28.
7. 런타임 반영: `template:update --source=bundled --force` → `template:refresh-layout` → `template:cache-clear`.
8. **홈 완성(2차)**: 첫 화면 문구·위계 정돈, 실제 작업 화면 2건(PurPol·커머스 데모) 확보,
   서비스 3종 상황 연결, 담당자 경험에 사례 연결, 진행 단계별 고객 행동, 문의 마무리.
   홈 전용 검증 390px/1440px 전부 통과(`home-check.mjs`).
   이 단계에서 푸터 로고 왜곡·작업 이미지 잘림·좁은 화면 공백 소실 3건을 추가 수정.
9. **사례·소개·푸터 정돈(3차)**: 사례 연도 데이터 오류 수정, 이전 주소 안내,
   목록에 자체 제작 데모 복귀(배지 구분), 내부 작성 방침 문구 제거, 소개 순서·표현 정리,
   푸터 3열 재구성. 검증 42/42(`cases-about-footer.mjs`).
10. **문구 교정(4차)**: 내부 지침·방어 문구 5건 제거, 반복 표현 정리, 홈·서비스·진행 안내·소개
    카피 교정, 사례 순서 고정, 자체 데모 고객용 표기 분리. 전후 기록은 `COPY-REVIEW.md`.
    검증 76/76(`copy-correction.mjs`) + 기존 스위트 전부 통과.
11. **마무리 교정(5차)**: 이전 주소가 오류 없이 사례로 연결, 페이지별 문서 제목·설명·canonical,
    소개 main 중첩 제거, 문의 접근성(required·오류 초점·개인정보 상세), 남은 문구 정리,
    한국어 줄바꿈 다듬기. 검증 88/88(`final-correction.mjs`).
12. **편집 정리(6차)**: 홈을 7섹션 → 6섹션으로 줄이고 리듬·위계·간격을 정리.
    FAQ를 /process 로 넘기고, 소개의 '일하는 방식'을 /process 로 이동.
    사례 이미지를 전폭으로 키워 실제 화면을 읽을 수 있게 함. 검증 5종 전부 통과.
13. **문의 메타 열람 화면(7차, 모듈)**: 프로젝트 문의 메타 11종을 볼 화면이 없던 문제를 해결.
    `modules/_bundled/twentyft-content` 에 상세 API + 상세 레이아웃 + 상세 라우트 추가,
    목록 행을 게시판 편집에서 문의 상세로 변경, 목록·상세에 한국어 라벨 적용.
    모듈 0.1.3 → 0.1.4. 검증 38/38(`inquiry-admin-detail.mjs`) + 모듈 테스트 10/10.

## 이번 단계(7차) 요약 — 문의 관리자 상세

- 문제: 목록이 6개 컬럼(제목·문의자·회사·유형·상태·작성일)만 보여주고 행 링크가 게시판 글 편집으로 갔다.
  `twentyft_post_meta`(domain=`inquiry`)에 저장한 전화·예산·희망 일정·현재 사이트·참고 링크·동의 기록을
  볼 화면이 어디에도 없었고, 관리자 API 응답에도 일부 키가 없었다.
- 추가: `GET /api/modules/twentyft-content/admin/inquiries/{post_id}` (권한 `...inquiries.read`),
  라우트 `*/admin/20ft-content/inquiries/:post_id`, 레이아웃 `admin_inquiry_detail`.
- 상세 화면 구성: 접수 정보(작성일·게시글 번호·개인정보 동의) / 문의자 정보(이름·회사·이메일·연락처) /
  요청 정보(유형·예산·희망 일정·현재 사이트·참고 링크·문의 본문) / 처리 상태(라벨 + 상태 변경).
  본문은 `whitespace-pre-wrap` 으로 개행을 보존한다.
- 라벨: `InquiryStatus::label()` 신설 + 목록 응답에 `projectTypeLabel`·`internalStatusLabel`·`createdAtLabel` 추가.
  기존 키는 그대로 두었다(제거·이름 변경 없음).
- 본문 편집 경로는 없애지 않고 상세 화면의 `게시판에서 본문 수정` 버튼으로 옮겼다.
- 상태 변경은 기존 `PATCH .../status` 재사용. 저장 성공 시 목록으로 이동한다(라벨이 즉시 어긋나지 않게).
- 변경 파일: `src/Enums/InquiryStatus.php`, `src/Http/Controllers/Api/Admin/InquiryAdminController.php`,
  `src/Http/Resources/InquiryAdminListResource.php`, `src/routes/api.php`, `resources/routes/admin.json`,
  `resources/layouts/admin/admin_inquiry_index.json`, `resources/layouts/admin/admin_inquiry_detail.json`(신규),
  `resources/lang/{ko,en}.json`, `module.json`, `CHANGELOG.md`,
  `tests/Feature/InquiryAdminDetailTest.php`(신규)
- 반영: `module:update twentyft-content --source=bundled --force` → `module:refresh-layout` →
  `module:cache-clear` → `cache:clear`. 런타임 `modules/twentyft-content` 와 SSoT diff 0.
- 독립 리뷰(레이아웃 엔진·보안·회귀·제품 4개 관점 + 반증 검증)에서 5건이 확인되어 전부 수정:
  빈 `href=""` 앵커, 상태 카드 권한 미게이팅, 서버 라벨 한국어 하드코딩(en 화면 혼용),
  숫자 아닌 `post_id` 500, 배열 상태 값 500. 상세는 `QA-RESULTS.md`.
- 남은 미검증: `InquiryAdminApiTest.php`(HTTP 레벨 14건)는 이 환경에서 테스트 DB 접속이
  거부되어 **skip** 된다. 저장소 전체 DB 테스트가 같은 이유로 실행 불가다. DB가 있는 환경에서
  실행해야 통과 여부가 확정된다.

## 이번 단계(6차) 요약

- 홈 구성: 첫 화면 → 주요 제작 사례 → 제작 서비스 → 경력 → 진행 방법 → 문의 (7→6)
- 삭제·이동: 홈 FAQ(→ /process), 소개 '일하는 방식'(→ /process), 홈 CTA의 서비스 목록(→ 제작 서비스 섹션과 중복)
- 위계: H1 49px / 홈 H2 32px (이전에는 H2 36~40px로 평평했음). 홈 소개 라벨(eyebrow) 4개 제거, 소개 페이지 5개 → 1개
- 사례 이미지: 550px 2열 → 1142px 전폭 (원본 비율 16:9 유지)
- 페이지 높이: 홈 4199 → 4310px(이미지 확대분 포함), 모바일 5729 → 4344px, 소개 3801 → 3085px
- 변경 파일: `HomeHero`·`HomeCases`·`HomeServices`·`HomeExperience`·`HomeProcess`·`HomeInquiryCTA`,
  `AboutPage`, `layouts/home.json`, `src/styles/design-tokens.css`

## 9차 — 고객 관점 QA 2차 (2026-09-17)

- 확대창 결함 3건 수정: (Z1) 가운데 정렬 때문에 원본 왼쪽이 스크롤로도 닿지 않던 문제 →
  안쪽 래퍼 `margin:auto`, (Z2) 가로 이동 시 닫기 버튼이 함께 밀리던 문제 → 조작 줄을
  스크롤 영역 밖 하단 고정, (Z3) Tab 이 배경으로 빠지던 문제 → 확대창 내부 순환.
- 부수 수정: 닫을 때 초점 복귀가 페이지를 끌고 가 읽던 위치가 바뀌던 문제(`preventScroll`).
- 편집: C1 사례 요약 교체(DB 메타, 4개 화면 동시 반영), C2 브랜드·상품 갤러리 화면에서 제거,
  C3 서비스 상세 중복 문장 삭제, C4 진행 안내 단계 간격 압축(FAQ 유지).
- C5(경력·담당 범위·새 사례)는 자료 없음 — 보류.
- 검증: `zoom-viewer.mjs` 33/33 + 기존 6종 전부 통과, 템플릿 150/150, 타입 0오류,
  모듈 14/14, 표현식 게이트 42/42, 템플릿·모듈 런타임 diff 0.
- 미검증: 실물 휴대폰 터치, 실제 문의 전송·수신, 관리자 편집 화면, 모바일 뒤로 가기 닫기.

## 10차 — 사용자 지정 문구 편집 (2026-09-17)

- 지시받은 '현재 → 교체' 문장 10건을 그대로 적용(소개 첫 설명·홈 경력·이름 유래·마무리 슬로건 삭제·
  SuperBify 소개·진행 안내 제목/설명·사례 표시 이름·사례 링크·상세 문의 안내).
- 상세 문의 안내·버튼을 대표 화면 아래로 이동(기술 정보보다 앞), 하단 중복 제거.
- 이름 유래 영역 높이 457 → 316px, 마무리 영역은 링크만 남아 160px(1440px).
- 새 문구·새 슬로건을 만들지 않았다. DB 콘텐츠는 수정하지 않았다(문구는 모두 템플릿 소스).
- 검증: `copy-edit-verify.mjs` 66/66 + 기존 7종 전부 통과, 단위 151/151, 타입 0오류,
  모듈 14/14, 표현식 게이트 42/42, 360·390·1440 넘침 0.
- 주의: CLAUDE.md §1.1 의 LOCKED COPY 목록에 있던 `작은 공간에서, 큰 가능성을 만듭니다.` ·
  `A SMALL SPACE. INFINITE POSSIBILITIES.` · `JUST FOR FUN.` 을 사용자 지시로 삭제했다.
  정책 문서와 현재 구현이 어긋난 상태이므로 정책 쪽 정리가 필요하다.

## 진행 중인 작업과 변경 파일

변경 파일 전체 목록은 `HANDOFF.md` 참조.

## 8차 — 고객 관점 QA 반영 (2026-09-16 리뷰)

- 12개 항목을 코드·DB로 먼저 검증(독립 리뷰 25건 확인 / 1건 기각) 후 수정.
- 실제 결함: (1) 대표 이미지가 갤러리에 반복(커버 첨부 미제외), (2) 확대·원본 경로 부재,
  (3) 소개 페이지 역할·기술 미표시(목록 API 가 `role`/`tech_stack` 을 안 내보냄),
  (4) 공개 화면의 게시 상태·내부 표현, (5) 서비스 3열 버튼 높이 어긋남(카드 `height:100%` 누락).
- 360px 히어로 `·업무 관리까지` 줄바꿈, 소개 모바일 히어로 간격, 금색 라벨 자간,
  섹션 제목 굵기(700→600)·크기 토큰화.
- 홈 사례 영역: 고객 사례 이미지는 유지, 자체 제작 데모만 설명 옆 배치. 1908 → 1341px.
- `/process` 중복 지적은 기각(홈에 없는 FAQ·CTA 존재).
- 검증: `qa-review-fixes.mjs` 39/39 + 기존 5종 전부 통과, 템플릿 테스트 150/150, 타입 0오류,
  모듈 테스트 14/14, 표현식 게이트 42/42, 360·390·768·1440 넘침 0.
- 미수정(승인·자료 필요): 사례 요약 문구, 담당 범위 문장, 서비스 리드/목록 중복, 경력 자료,
  홈페이지 사례, 데모 링크. 상세는 `QA-RESULTS.md`.

## 미확정 사실·사용자 답변 대기

0. `/superbify/superbify-commerce-compat`,
   `/superbify/superbify-commerce-roastery-brand-commerce-template-for-gnuboard-g7` —
   로컬 DB 에 해당 제품 글이 없다(게시판에 3건뿐). 조회 조건·slug 문제가 아니라 데이터 부족이며,
   운영 DB 에는 있을 수 있으므로 배포 시 확인 항목으로 남긴다.
   `/portfolio/purepol-saas` 정식 주소 전환(301)은 G7 라우팅에 리디렉션 계층이 없어 내용 유지로 처리했다.
0-1. `superbify-roastery` 를 SuperBify 콘텐츠로 게시할지 — 미게시 상태(근거는 DECISIONS).
   또한 `/portfolio/saas` 의 정식 slug 를 `purepol-saas` 로 바꿀지 — 현재는 이전 주소 안내로만 처리.
1. 문의 수신 경로(수신 이메일/알림)와 운영자 확인 담당 — 현재 로컬 저장까지만 검증됨.
2. 개인정보 수집 동의 문구의 법적 검토본 — 현재 문구는 `COPY REQUIRED`.
3. 공개할 연락처(이메일·전화 등) — 저장소에서 승인된 값을 찾지 못함.
4. 예산 구간 선택 필드 노출 여부 — 모듈 enum에 가격 구간이 있으나 공개 폼에는 넣지 않음.

## 실패 또는 미실행 검사

- HTTP 301/308 리디렉션: **불가**. G7 `routes.json` 에 리디렉션 필드가 없고 코어 수정은 금지 범위다.
  대신 이전 주소에 같은 사례를 렌더하고 canonical 을 대표 주소로 지정했다.

- 실제 외부 메일·메시지 수신 확인: **미실행** (승인 없이 외부 발송 금지).
- 운영 서버 배포: **미실행** (요청 범위 밖).
- 스크린리더 실제 낭독 확인: **미실행** (자동 검사로 대체: 레이블 연결, aria-invalid, role=alert).

## 다음 행동

1. 위 1~3번 값 확정 후 개인정보 문구·연락처 반영.
2. 확정 후 `docs/implementation-notes/20ft-renewal/` 갱신 및 배포 승인 요청.

## 배포 차단 항목

- [ ] 문의 실제 수신 설정 (수신 주소·알림) 미확정 — 접수는 저장되지만 담당자 알림 경로 미확인
- [ ] 개인정보 수집·이용 문구 법적 검토 (현재 초안)
- [ ] 공개 연락처 미정

## 사용자 변경 보존 메모

- 동기화 전 DB 레이아웃 스냅샷: `_workspace/20ft/runtime-layouts-snapshot-pre-renewal.json`
- 동기화 전 런타임 디렉터리 백업: `_workspace/20ft/renewal-runtime-backup/twentyft-studio-pre-renewal/`
- `template_layout_versions` 행 수 0 — 관리자가 레이아웃 편집기로 저장한 이력 없음.
  따라서 덮어쓸 사용자 편집본이 존재하지 않았다.
- 기존 레이아웃 11개는 삭제되지 않고 유지됨(현재 16개 = 기존 11 + 신규 5).
