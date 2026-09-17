# 검증 결과

> PASS / FAIL / BLOCKED / NOT RUN. 로컬 검증과 외부 실제 수신을 구분한다.

환경: `php artisan serve` @ `http://127.0.0.1:8000`, Playwright Chromium, 방문자 UA.

## 실행 명령과 결과

| 검사 | 명령 | 결과 |
|---|---|---|
| 타입 검사 | `npx tsc --noEmit` (템플릿 루트) | PASS (오류 0) |
| 단위·레이아웃 테스트 | `npx vitest run` | PASS 119/119 (14 files) |
| 번들 빌드 | `npm run build` | PASS (`dist/css/components.css` 7.05 kB, `dist/js/components.iife.js` 158.49 kB) |
| 런타임 반영 | `php artisan template:update twentyft-studio --source=bundled --force` | PASS (0.2.0 → 0.3.0) |
| DB 레이아웃 동기화 | `php artisan template:refresh-layout twentyft-studio` | PASS |
| 캐시 무효화 | `php artisan template:cache-clear` | PASS (263개 삭제) |
| 라우트 스모크 | `node _workspace/20ft/renewal-qa/shoot.mjs` | PASS 24/24 (12 라우트 × 데스크톱/모바일) |
| 문의 흐름 | `node _workspace/20ft/renewal-qa/inquiry-flow.mjs` | PASS 18/18 |
| 본문 표시 | `node _workspace/20ft/renewal-qa/verify-body.mjs` | PASS 28/28 |
| 구번들 재현 | `node _workspace/20ft/renewal-qa/repro-stale-bundle.mjs` | 재현 성공(아래 원인 분석) |

## 본문 누락 원인 분석 (2026-09-16 보고 대응)

### 증상

`/`, `/services`, `/services/website`, `/process` 본문 없음.
`/portfolio`, `/about`, `/inquiry` 정상.

### 조사 결과

1. **본문이 생성되지 않는가, 숨겨지는가** — 구번들 상태에서는 컴포넌트가 아예 렌더되지 않았다.
   래퍼 `div` 는 존재하고 내부가 비어 있다(`mainChildren` 69 대 정상 174, `section` 0개).
   CSS `display`/`visibility`/`opacity` 는 모두 정상값이었다 — 숨김 문제가 아니다.
2. **라우트·콘텐츠 전달** — 정상 페이지와 비정상 페이지 모두
   `GET /api/layouts/twentyft-studio/{name}.json` 이 200이고,
   응답 JSON에 `ServicesList`, `ServicePage`, `ProcessPage`, `HomeServices` 등이 들어 있다.
3. **컴포넌트 매니페스트** — `GET /api/templates/twentyft-studio/components` 가
   신규 composite 9개를 포함해 25개를 반환한다.
4. **번들 자산** — 런타임 사본·SSoT·서빙 응답의 md5가 동일(`5ce2361c…`).
5. **저장된 레이아웃 설정** — DB `template_layouts` 16행 전부 디스크와 일치(drift 0).
   기존 11행은 삭제되지 않았고 `template_layout_versions` 는 0행(관리자 편집 이력 없음).

### 확정 원인

**조회에 사용된 브라우저 문서가 템플릿 갱신 이전의 컴포넌트 번들(v0.2.0)을 실행하고 있었다.**

레이아웃 JSON은 v0.3.0(신규 컴포넌트 이름 포함)인데 번들은 v0.2.0이라,
엔진이 모르는 컴포넌트 이름을 빈 자리로 렌더한 것이다.
v0.2.0 번들에도 존재하던 `HomeHero`·`PortfolioList`·`AboutPage`·`InquiryForm` 만 살아남아
보고된 페이지 조합과 정확히 일치한다.

재현: `_workspace/20ft/renewal-qa/repro-stale-bundle.mjs` 가 백업해 둔 v0.2.0 번들을
응답으로 주입하면 같은 증상이 그대로 나온다.

```
구번들: /                     sections=[home-hero]        ← 첫 소개 영역 뒤 바로 푸터
구번들: /services             sections=[(없음)]
구번들: /services/website     sections=[(없음)]
구번들: /process              sections=[(없음)]
구번들: /portfolio            sections=[(없음)]  ← PortfolioList 는 구번들에도 있어 본문 렌더
구번들: /about                sections=[about-why, about-person, …]  ← 구 AboutPage 섹션 구성
현재번들: 11개 라우트 전부 정상
```

배포 관점 확인:
- SPA HTML 응답 헤더는 `Cache-Control: no-cache, private` → 새로고침 시 항상 재검증된다.
- 번들 자산은 `Cache-Control: immutable, max-age=31536000` → URL 단위로 1년 캐시된다.
- 따라서 `?v=` 가 바뀌어야 한다. 현재 `?v=1789529260`(= 새 번들 mtime 2026-09-16T03:27:40Z)이고,
  갱신 전 번들 mtime은 2026-09-02T08:12:25Z 였다 → **URL이 실제로 바뀌었다.**
- 결론: 소스 결함이 아니라, 갱신 이전에 열려 있던 문서가 옛 번들을 계속 실행한 상태다.
  새로고침하면 새 URL로 받아온다.

부수 확인: 엔진은 알 수 없는 컴포넌트에 대해 콘솔 경고조차 남기지 않는다
(`__tests__`/재현 스크립트에서 확인). 사용자에게 아무 신호 없이 백지가 되므로
템플릿 갱신 직후에는 새로고침이 필요하다.

## 사례·소개·푸터 검증 (`cases-about-footer.mjs`, 390px / 1440px) — 42/42 PASS

| 항목 | 390px | 1440px |
|---|---|---|
| 목록 제목·설명 | PASS | PASS |
| 고객 프로젝트 + 자체 제작 데모 동시 노출 | PASS | PASS |
| 연도 2026 (2006 미노출) | PASS | PASS |
| 목록 격자 빈칸 | 0 | 0 (열 2개 모두 채움) |
| 목록 가로 넘침 | 0px | 0px |
| 이미지 비율 유지 | PASS | PASS |
| 이전 주소 안내 | PASS | PASS |
| 상세 역할/CTO, "담당 범위" 없음 | PASS | PASS |
| 성과 수치 없음 | PASS | PASS |
| 소개 "주요 프로젝트" / 내부 방침 없음 | PASS | PASS |
| 슬로건 반복 (A SMALL SPACE 1회) | PASS | PASS |
| 푸터 3열 / 문의 링크 1개 / 슬로건 없음 | PASS | PASS |
| 푸터 링크 줄바꿈 | 0 | 0 |
| 푸터 높이 비중 | 350/4417px (7.9%) | 226/3898px (5.8%) |
| 예기치 않은 콘솔 오류 | 0 | 0 |

### 데이터 수정 근거 (연도 2006 → 2026)

- 값의 출처: `twentyft_post_meta` (board `portfolio`, post 7, domain `portfolio`, key `year`).
  시더·기본값·날짜 처리 어디에서도 만들어지지 않는다 — 관리자 입력값이다.
  (`modules/twentyft-content/database/seeders/`, `database/seeders/` 에 2006 없음)
- 2006 이 성립하지 않는 근거:
  - 같은 사례의 `tech_stack` 이 `svelte`(2016 공개), `CI4`(CodeIgniter 4, 2020 공개)다.
    2006 년 작업이 이 기술을 쓸 수 없다.
  - 게시글 작성일이 2026-08-26 이다.
  - 사용자가 확인한 이전 공개 사이트 표기값은 2026 이었다.
- 조치: 메타 1행만 수정. 화면 코드에서 연도를 덮어쓰지 않았다.
  공개 API 재확인 결과 `year: "2026"`.

### 이전 주소 (`/portfolio/purepol-saas`) 조사

- 현재 공개 글은 post 7 `퓨어폴 SaaS` 하나이고 저장된 slug 메타는 `saas` → 현재 주소 `/portfolio/saas`.
- `purepol-saas` 는 slug 메타가 아니라 **제목에서 만들어지는 fallback slug** 다.
  `PortfolioController::slugFromTitle()` 이 옛 제목 `PUREPOL SaaS` 를 `purepol-saas` 로 바꿨다.
  이후 제목이 `퓨어폴 SaaS` 로 바뀌면서 fallback 값이 `퓨어폴-saas` 가 되어 매칭이 끊겼다.
- 조치: 데이터·식별자를 건드리지 않고, 이전 주소로 들어온 방문자에게 현재 주소를 안내하는
  링크를 상세 화면에 두었다(`src/content/portfolio.ts` 의 이전 주소 표).
  게시글·메타·slug 는 그대로다.

## 홈 완성 검증 (`home-check.mjs`, 390px / 1440px)

| 항목 | 390px | 1440px |
|---|---|---|
| 섹션 7개 표시 | PASS | PASS |
| 가로 넘침 | 0px | 0px |
| H1 줄 수 | 2줄 (자연 접힘) | 2줄 (의미 단위) |
| 이미지 왜곡/잘림 | 0.1% | 0.1% |
| 푸터 로고 비율 | 0.4% | 0.4% |
| 홈 본문 문의 링크 | 2개 | 2개 |
| 콘솔 오류 | 0 | 0 |

섹션 높이(390 / 1440): hero 465/536 · services 853/505 · cases 1237/2028 ·
experience 702/485 · process 963/584 · faq 613/486 · inquiry 473/554.

이 단계에서 발견해 수정한 결함 3건:
1. **푸터 로고 가로 늘어남** — 세로 flex 컨테이너의 `align-items: stretch` 가 img 폭을 늘려
   비율이 3.9 → 21.2 로 왜곡. `BrandLogo` 기본 스타일에 `alignSelf: flex-start` +
   `objectFit: contain` 추가.
2. **작업 이미지 잘림** — 원본이 16:9 인데 21:9 로 잘라 24% 를 버렸다. 자산 비율과 같은
   16:9 로 표시.
3. **좁은 화면에서 공백 소실** — `.hero-line-break` 를 `display:none` 으로 끄면
   `<br>` 뒤 공백까지 사라져 "쇼핑몰,업무에" 로 붙었다. `<br>` 뒤에 `{' '}` 추가.

## 페이지별 본문 검증 (`verify-body.mjs`, 28/28 PASS)

세 가지 접근 방식 모두 통과.

| 경로 | 최초접속 | 새로고침 | 메뉴 클릭 |
|---|---|---|---|
| `/` | PASS | PASS | (홈) |
| `/services` | PASS | PASS | PASS |
| `/services/website` | PASS | PASS | PASS (서비스 카드 → 상세 동선) |
| `/services/commerce` | PASS | PASS | — |
| `/services/web-development` | PASS | PASS | — |
| `/process` | PASS | PASS | PASS |
| `/portfolio` | PASS | PASS | PASS |
| `/portfolio/saas` | PASS | PASS | — |
| `/about` | PASS | PASS | PASS |
| `/inquiry` | PASS | PASS | PASS |
| `/superbify` | PASS | PASS | — |

## 고객 흐름 (브라우저 확인)

- **홈페이지 의뢰**: `/` → 제작 서비스 → `/services/website` → `/process` → `/inquiry?type=WEB` — PASS
- **쇼핑몰 의뢰**: `/` → `/services/commerce` → 자체 제작 데모(`자체 제작 데모` 표기) → `/inquiry?type=COMMERCE` — PASS
- **웹프로그램 의뢰**: `/` → `/services/web-development` → 퓨어폴 사례(`고객 프로젝트`, `역할 CTO`) → `/inquiry?type=INTERNAL_SYSTEM` — PASS
- **기존 SuperBify 방문**: 푸터 `SuperBify` → `/superbify` → 상세 — PASS
- **커머스 데모 확인**: `/portfolio` → `자체 제작 데모` 배지 → `제품 자세히 보기` → `/superbify/superbify-commerce-minimal` — PASS

## 화면

| 항목 | 환경 | 결과 | 증거 |
|---|---|---|---|
| 가로 넘침 없음 | 360 / 390 / 768 / 1280 / 1440 | PASS | `shoot.mjs` 24/24, 넘침 요소 리포트 0 |
| 콘솔 오류 없음 | 데스크톱·모바일 | PASS | 실패 요청·pageerror 0 |
| 모바일 메뉴 열림/Esc 닫힘 | 390 | PASS | `SiteHeader` 키보드 핸들러 + 렌더 확인 |
| 레이블–컨트롤 연결 | `/inquiry` | PASS | 7개 필드 전부 `label[for]` 존재 |
| 오류 상태 전달 | `/inquiry` | PASS | `aria-invalid`, `role=alert`, 색상 외 텍스트 병행 |
| 대체 텍스트 | 전 페이지 | PASS | 사례·데모 이미지에 화면 설명 alt |
| 터치 영역 | 390 | PASS | 버튼 최소 높이 2.75rem(44px) 이상 |

## 문의

| 항목 | 결과 | 증거 |
|---|---|---|
| 정상 저장/접수 | PASS | 실제 폼 제출 → `201` → 완료 화면. 게시판 `project-inquiry` 에 행 생성 확인 |
| 입력 검증(클라이언트) | PASS | 빈 제출·잘못된 이메일에서 요청 0건, 필드별 오류 표시 |
| 입력 검증(서버) | PASS | 클라이언트 우회 POST → `422`, `errors` 에 email/project_type/description/privacy_consent |
| 서버 오류·전송 실패 | PASS | 네트워크 차단 시 실패 안내, 성공 화면 미표시 |
| 재시도·중복 | PASS | 실패 후 입력 보존 → 재전송 성공. 연속 클릭 3회에도 POST 1건 |
| 스팸 방어 | PASS | 허니팟 값 존재 시 서버 `422`. 폼은 허니팟을 전송하지 않음 |
| 요청 제한 | 확인됨 | 엔드포인트 `throttle:10,1` — 초과 시 429, 화면에 별도 안내 문구 존재 |
| CSRF·권한 | 확인됨 | api 그룹(CSRF 미적용) + `optional.sanctum`. 관리자 조회는 `auth:sanctum`+`admin`+permission |
| 출력 이스케이프 | PASS | 게시판 본문 `sanitizeHtml` 적용. 이메일·입력 링크를 HTML로 렌더하지 않음 |
| 개인정보·로그 | PASS | 콘솔에 문의 내용·비밀키 출력 없음. 서버는 비식별 상태만 기록 |
| 관리자 확인 경로 | 확인됨 | `/admin/20ft-content/inquiries` (권한 `twentyft-content.inquiries.read`) |
| 실제 외부 수신 확인 | **NOT RUN** | 승인 없이 외부 발송하지 않음. 로컬 저장까지만 검증 |

검증에 사용한 테스트 문의는 확인 후 삭제했다(작성자 `__QA_RENEWAL__`, `__recon_probe__` 행).
기존 문의 1건(`Tester`, 2026-08-25)은 삭제하지 않았다.

## G7 회귀

| 항목 | 결과 | 증거 |
|---|---|---|
| 20ft Studio 기존 설정 | PASS | 기존 레이아웃 11개 유지, DB drift 0, 초기화 없음 |
| 20ft 콘텐츠·게시판 | PASS | portfolio/superbify/project-inquiry 게시판 유지, 공개 API 200 |
| 레이아웃 편집 | PASS(간접) | `template_layout_versions` 0행 — 편집 이력이 없어 보존할 값이 없음 |
| 기존 경로 | PASS | 12개 라우트 전부 200, 삭제·변경 없음 |
| 코어 비수정 | PASS | `git status` 에 `app/`, `resources/`, `routes/`, `public/build/`, `modules/` 변경 없음 |
| 다른 템플릿 | PASS | `sirsoft-basic`, `superbify-*` 변경 없음 |

## 캡처 목록

`_workspace/20ft/renewal-qa/home/` — 홈 전체/첫 화면, 390px·1440px (4장)
`_workspace/20ft/renewal-qa/after/` (24장, 데스크톱 1280 / 모바일 390)
`_workspace/20ft/renewal-qa/after/inquiry-success-desktop.png` (접수 완료 화면)
`_workspace/20ft/renewal-qa/before/` (개편 전 — 아래 주의)

주의: `before/` 캡처는 당시 QA 스크립트가 Playwright 기본 UA(`HeadlessChrome`)를 썼기 때문에
G7 의 SEO 봇 경로로 빠져 빈 화면으로 찍혔다. **개편 전 기준선으로 쓸 수 없다.**
스크립트는 방문자 UA를 명시하도록 수정했고, 현재 `after/` 캡처는 정상이다.
개편 전 런타임 디렉터리는 `_workspace/20ft/renewal-runtime-backup/` 에 보관돼 있다.

## 미실행 항목과 원인

- 실제 외부 메일 수신 확인 — 승인 필요, 수신 설정 미확정.
- 스크린리더 실제 낭독 — 도구 없음. 자동 접근성 검사로 대체.
- 운영 서버 배포 — 요청 범위 밖.
- 실제 모바일 기기 — 뷰포트 에뮬레이션으로 대체.

## 문의 관리자 상세 (모듈 작업) 검증

| 항목 | 결과 | 근거 |
|---|---|---|
| 모듈 정적 테스트 | PASS 14/14 | `modules/_bundled/twentyft-content/tests/Feature/InquiryAdminDetailTest.php` |
| 모듈 HTTP 테스트 | **미실행(skip 14)** | `InquiryAdminApiTest.php` — 이 환경은 테스트 DB(`g7_testing`) 접속이 거부된다. 저장소 전체 DB 테스트가 같은 이유로 실행 불가(`tests/Feature/Api/Admin/AdminAuthTest.php` 도 동일 오류). 파일은 남겼고 DB가 있는 환경에서 실행해야 한다. |
| 레이아웃 표현식 안전성 게이트 | PASS 42/42 | `vendor/bin/phpunit tests/Feature/Rules/SafeLayoutExpressionsTest.php` (모듈 레이아웃 전수 스캔) |
| 브라우저 검증 | PASS 48/48 | `node _workspace/20ft/renewal-qa/inquiry-admin-detail.mjs` |
| 상세 API 키 | PASS | 메타 11종 + 본문 + 라벨 전부 응답 |
| 권한 경계 | PASS | 읽기 권한만(admin 역할 없음) 200 / 권한 없음 403 / 미인증 401 / 없는 글 404 / 숫자 아닌 id 404 / 읽기 권한만으로 상태 변경 403 |
| 상태 변경 저장 | PASS | PATCH 200 → 재조회 REVIEWING → 원래 NEW 로 복구 |
| 잘못된 상태 값 | PASS | 문자열 `BOGUS` → 422, 배열 `["NEW"]` → 422 (500 아님) |
| 공개 문의 접수 회귀 | PASS 18/18 | `inquiry-flow.mjs` |
| 목록 화면 | PASS | 유형·상태 한국어 라벨, ISO 원문 미노출, 행 링크가 상세(`/inquiries/{id}`) |
| 상세 화면 | PASS | 접수/문의자/요청/처리 4개 섹션, 본문 개행 보존, 게시판 편집 링크 유지 |
| 빈 값 링크 | PASS | `href=""` 앵커 0개 — 값이 없으면 `-` 텍스트만 |
| 권한 게이팅 | PASS | 읽기 전용 운영자 화면에 상태 변경 카드 없음(서버가 노드 제거), 문의 내용은 열람 가능 |
| 로케일 | PASS | 헤더에서 EN 전환 시 상태 `New`·유형 `Website`, 한국어 라벨 잔존 0. 복구 후 `신규` |
| 콘솔 오류 | PASS | 0건 |
| 다크 모드 / 좁은 화면(820px) | PASS | 렌더 정상, 가로 넘침 0 |
| 런타임 동기화 | PASS | SSoT ↔ 런타임 diff 0, DB `template_layouts.content` 가 파일과 의미 동일 |
| 독립 리뷰 | 5건 확인 → 전부 수정 | 레이아웃·권한·i18n·라우트 제약·예외 처리. 아래 표 |

### 독립 리뷰에서 확인된 결함과 수정

| 결함 | 심각도 | 수정 |
|---|---|---|
| 값이 없을 때 `href=""` 앵커 렌더 (URL·메일) | 중 | 값이 있을 때만 앵커, 없으면 `-` 텍스트. 정적 회귀 테스트 추가 |
| 상태 변경 카드가 읽기 권한자에게도 노출 | 하 | 카드에 `permissions: [...update]` 선언 — 서버가 노드 제거 |
| 서버 라벨이 한국어 하드코딩 (en 화면 혼용) | 하 | `labelKey()` + `trans`, `src/lang/{ko,en}/enums.php` 추가 |
| 숫자 아닌 `post_id` → TypeError 500 | 하 | 라우트 제약 `[0-9]+` → 404 |
| 배열 상태 값 → TypeError 500 (기존 코드) | 하 | `is_string` 가드 → 422 |

기각된 지적(수정 불필요로 판정): blinded 게시글 노출(기존 목록과 동일한 G7 관례), 목록 조회의
전체 조회·N+1(이번 변경 이전부터 있던 구조), 오류 문구 미바인딩(도달 불가) 등.

캡처: `_workspace/20ft/renewal-qa/inquiry-admin/` (목록·상세·상태 카드·다크·좁은 화면·EN)

## 고객 관점 QA(2026-09-16) 반영 검증

외부 리뷰 12개 항목을 코드·DB로 먼저 검증한 뒤(독립 리뷰 5관점 + 반증 검증, 확인 25건 / 기각 1건)
수정했다. 검증 결과와 수정 내역:

| QA 항목 | 검증 | 처리 |
|---|---|---|
| 1 대표 이미지가 갤러리에 반복 | 확인 | 커버로 쓰인 첨부를 갤러리에서 제외. 포스트 7은 첨부가 1장뿐이라 '실제 화면' 섹션이 사라짐 |
| 2 확대/원본 경로 없음 | 확인 | `ZoomableImage` 신설 — 눌러서 확대, Esc·닫기·배경 클릭, 초점 복귀, 원본 링크. 모바일은 화면 폭에 줄이지 않아 실제로 확대됨 |
| 3 홈 사례가 차지하는 높이 | 확인(측정) | 고객 사례 이미지는 그대로 두고(줄이면 업무 화면을 못 읽음) 자체 제작 데모만 넓은 화면에서 설명 옆 배치. 사례 영역 1908 → 1341px, 서비스 시작 2515 → 1949px |
| 4 사례 문구가 어려움 | 확인 | **미수정** — 게시판 요약(DB 내용)이라 소유자 승인 필요. `COPY REQUIRED` |
| 5 소개에 역할·기술이 안 보임 | 확인 | 실제 결함. 목록 API가 `role`/`tech_stack`을 내보내지 않아 컴포넌트가 그릴 값이 없었다. 목록 응답에 추가 |
| 6 공개 화면의 내부 표현 | 확인 | '확인된 역할과 기술'→'프로젝트 정보', 상세·목록·머리말의 게시 상태('공개') 제거, SuperBify 목록의 enum 원문(`TEMPLATE`/`RELEASED`)을 고객 표기로, 자료 분류 설명 문장 삭제 |
| 7 브랜드 설명 비중 | 부분 확인 | 경력 자료가 저장소·DB 어디에도 없음(공개 항목 2건). 지어낼 수 없어 코드 변경 없음 — `COPY REQUIRED` + 자료 필요 |
| 8 홈페이지 사례 부족 | 확인 | 공개 가능한 홈페이지 작업 없음. 자료 부족으로 기록 |
| 9 데모 상세 중복·데모 링크 | 확인 | 커버 제외로 중복 제거, UI 캡처가 없어 '화면' 섹션 자동 숨김, 브랜드·상품 사진 3장 유지. 데모 링크는 `demo_url` 미등록(DB 내용) |
| 10 서비스 상세 중복 / 버튼 정렬 | 확인 / 확인 | 버튼 정렬은 `height:100%` 누락이 원인 → 수정. 리드·목록 중복 문장은 어느 쪽을 남길지 소유자 결정 필요 — `COPY REQUIRED` |
| 11 진행 안내가 홈과 동일 | **기각** | /process 에는 홈에 없는 FAQ 5건과 CTA가 있다. 변경 없음 |
| 12 제목 인상 반복 / 모바일 | 확인 | 섹션 제목 크기를 토큰으로 모으고 굵기 700 → 600, 금색 라벨 자간 0.12em → 0.06em, 360px 히어로 `·업무 관리까지` 줄바꿈 방지, 소개 모바일 히어로 간격 56 → 24px |

| 검증 | 결과 |
|---|---|
| QA 반영 검증 (`qa-review-fixes.mjs`) | PASS 39/39 |
| 본문 표시 | PASS 28/28 |
| 홈 (섹션·넘침·이미지 비율) | PASS |
| 사례·소개·푸터 | PASS 42/42 |
| 문구 교정 | PASS 76/76 |
| 마무리 교정 | PASS 89/89 |
| 템플릿 단위 테스트 / 타입 검사 | PASS 150/150 / 0오류 |
| 모듈 테스트 | PASS 14/14 (HTTP 14건은 테스트 DB 부재로 skip) |
| 레이아웃 표현식 게이트 | PASS 42/42 |
| 런타임 동기화 | 템플릿·모듈 모두 SSoT ↔ 런타임 diff 0 |
| 가로 넘침 / 콘솔 오류 | 360·390·768·1440 전부 0 / 0 |

미수정·미검증
- 확대 화면의 브라우저 뒤로 가기로 닫기는 **미구현**. G7 라우터가 popstate 를 처리하므로
  history 항목을 넣으면 화면 이동과 충돌할 위험이 있다. 닫기 버튼·Esc·배경 클릭은 동작한다.
- 사례 요약 문구, 담당 범위 문장, 서비스 리드/목록 중복, 경력·홈페이지 사례 자료는
  소유자 승인 또는 자료가 필요하다(`COPY REQUIRED`).
- HTTP 레벨 모듈 테스트는 이 환경에서 실행 불가(테스트 DB 접속 거부).

## 고객 관점 QA 2차(2026-09-17) — 확대창 결함과 편집 항목

검토자가 잡은 확대창 결함 3건은 실제 버그였다. 원인과 수정:

| 결함 | 원인 | 수정 |
|---|---|---|
| Z1 왼쪽 일부에 닿을 수 없음 | 확대창을 `justify-content: center` 로 가운데 정렬 → 이미지가 영역보다 클 때 시작점이 음수로 밀려(scrollLeft=0 인데 이미지 left=-441) 스크롤로도 왼쪽에 닿지 못함 | 안쪽 래퍼에 `margin: auto` — 들어맞으면 가운데, 넘치면 시작점 유지 |
| Z2 가로 이동 시 닫기 버튼이 화면 밖 | 닫기·원본 버튼이 스크롤 영역 **안**에 있어 이미지와 함께 밀림 | 조작 줄을 스크롤 영역 **바깥**(하단 고정)으로 분리, 터치 영역 44px, safe-area 여백 |
| Z3 Tab 이 배경 페이지로 빠짐 | `aria-modal` 만 있고 초점을 가두지 않음 | Tab·Shift+Tab 을 확대창 내부에서 순환, 닫을 때 초점 복귀 |

추가로 확인된 문제: 닫을 때 초점 복귀가 페이지를 끌고 가 읽던 위치가 바뀜(900 → 442).
`focus({ preventScroll: true })` 로 수정 — 초점 복귀와 읽던 위치를 함께 지킨다.

편집 항목:

| 항목 | 처리 |
|---|---|
| C1 사례 요약이 어려움 | DB 메타(게시판 요약)를 검토자가 제시한 문장으로 교체. 홈·목록·상세·소개에 동시 반영 |
| C2 쇼핑몰 브랜드·상품 갤러리 | 화면에서 제거(원본 첨부는 게시판에 그대로). 외주 고객의 제작 범위 판단에 기여하지 않음 |
| C3 서비스 상세 문장 중복 | 네 항목을 요약하던 앞 문장 삭제, 목록 유지 |
| C4 진행 안내 단계 영역 | FAQ 유지, 단계 간격 48 → 28px·내부 간격 20 → 8px·제목 아래 여백 72 → 48px |
| C5 경력·담당 범위·새 사례 | 자료 없음 — 보류 목록 |

검증 (완료 기준은 '실제로 쓸 수 있는가'):

| 항목 | 결과 |
|---|---|
| `zoom-viewer.mjs` | PASS 33/33 |
| 360·390px 네 모서리 실제 이동 | 360: img(24,62)↔(336,714) / 390: img(24,62)↔(366,714), 스크롤 영역 1206px |
| 가로 이동 후 닫기 버튼 | 이동 전후 모두 212~288px(화면 안), 76×44px, 그 상태로 바로 닫힘 |
| Tab·Shift+Tab | 5회 연속 모두 확대창 안(원본 링크 ↔ 닫기 순환) |
| Esc·닫기 후 복구 | 본문 스크롤 복구, 초점 트리거 복귀, 페이지 위치 이동 없음 |
| C1~C4 | 4개 경로에서 새 요약 확인·옛 문장 0, 갤러리 미노출, 중복 문장 제거, FAQ 유지 |
| 기존 스위트 | qa-review-fixes 39/39, verify-body 28/28, home-check 통과, cases 42/42, copy 76/76, final 90/90 |
| 템플릿 테스트 / 타입 | 150/150 / 0오류 |
| 모듈 테스트 / 표현식 게이트 | 14/14(HTTP 14 skip) / 42/42 |
| 런타임 동기화 | 템플릿·모듈 diff 0 |

남은 미검증·보류
- 실물 휴대폰 터치, 실제 문의 전송·수신, 관리자 콘텐츠 편집 화면은 미검증.
- 모바일 뒤로 가기로 확대창 닫기는 미구현(라우터와 함께 별도 검토 필요).
- C5 경력·담당 범위·새 홈페이지 사례는 실제 자료 필요.

## 최종 판정

**구현 완료 / 운영 공개 차단 있음.**
본문 누락은 소스 결함이 아니라 갱신 이전 문서가 실행한 구번들 때문이며, 현재 소스·DB·런타임은
세 가지 접근 방식 모두에서 정상 렌더된다. 차단 항목은 수신 설정·개인정보 문구·공개 연락처다.
