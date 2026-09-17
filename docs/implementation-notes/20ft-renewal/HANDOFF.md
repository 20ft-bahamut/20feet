# 인수인계

## 1. 결과 요약

외주 수주를 첫 화면에서 읽을 수 있게 IA·메뉴·홈·서비스·사례·진행 안내·소개·문의·헤더·푸터를
함께 개편했다. 문의는 화면만 만든 것이 아니라 로컬 서버에 실제로 접수된다.

## 2. 로컬 프리뷰

```bash
# 서버 (이미 떠 있으면 생략)
php artisan serve --host=127.0.0.1 --port=8000

# 스크린샷 + 라우트 스모크 (데스크톱/모바일)
node _workspace/20ft/renewal-qa/shoot.mjs _workspace/20ft/renewal-qa/after after

# 본문 표시 검증 (최초접속 / 새로고침 / 메뉴 클릭)
node _workspace/20ft/renewal-qa/verify-body.mjs

# 홈 전용 검증 (390px / 1440px 섹션·넘침·이미지 비율)
node _workspace/20ft/renewal-qa/home-check.mjs

# 문의 실제 접수 흐름
node _workspace/20ft/renewal-qa/inquiry-flow.mjs

# 문의 관리자 상세 화면 (API 키·목록 라벨·상세·상태 변경·권한 경계)
node _workspace/20ft/renewal-qa/inquiry-admin-detail.mjs
```

브라우저로 볼 때 **일반 새로고침을 한 번 해야 한다.** 템플릿 갱신 이전에 열어 둔 탭은
옛 컴포넌트 번들을 계속 실행해 본문이 빈 채로 보인다(아래 6번 참조).

## 3. 변경 목록

### 라우트 (`routes.json`)

| 경로 | 레이아웃 | 비고 |
|---|---|---|
| `/` | `home` | 유지 |
| `/services` | `services/index` | 추가 |
| `/services/website` | `services/website` | 추가 |
| `/services/commerce` | `services/commerce` | 추가 |
| `/services/web-development` | `services/web-development` | 추가 |
| `/process` | `process` | 추가 |
| `/portfolio` | `portfolio/index` | 유지 |
| `/portfolio/:slug` | `portfolio/detail` | 유지 |
| `/about` | `about` | 유지 |
| `/inquiry` | `inquiry` | 유지 |
| `/superbify`, `/superbify/:slug` | `superbify/*` | 유지 |
| `/403`, `/404`, `/500` | `errors/*` | 유지 |

### 홈 완성 단계 (2차, 홈 전용)

재작성: `HomeHero`(이미지 제거·문구 교체), `HomeServices`(상황 한 줄 + 상세 링크로 축약),
`HomeCases`(실제 화면 + 구분선 + 제목·한 문장·상세 링크의 넓은 행), `HomeExperience`(추상 카드 제거,
관련 사례·소개 연결), `HomeProcess`(단계별 고객 행동 한 줄), `HomeInquiryCTA`(기획서 무관 안내)

수정: `src/content/services.ts`(`situation` 추가), `src/content/process.ts`(`customerAction` 추가),
`layouts/home.json`(Hero props 제거·Experience cases 연결), `src/styles/design-tokens.css`,
`src/components/BrandLogo.tsx`(로고 늘어남 수정)

홈 순서: 첫 화면 → 제작 서비스 → 대표 작업 → 담당자 경험 → 진행 방법 → 자주 묻는 질문 → 문의.

> 하네스/요청의 2번(실제 작업 화면)과 4번(대표 작업)은 **하나의 섹션으로 합쳤다.**
> "동일 이미지를 아래에서 반복하지 마" 제약 때문에 두 섹션이 같은 화면을 두 번 쓸 수 없었다.
> 합친 섹션이 두 요구를 모두 만족한다(실제 화면 + 구분 표기 + 제목 + 한 문장 + 상세 링크).
> 자주 묻는 질문은 요청 목록에 없었지만 하네스 03 §6 에 있고 문의 진입 장벽을 낮추므로 유지했다.

### 사례·소개·푸터 단계 (3차)

- 데이터 수정: `twentyft_post_meta` (board `portfolio`, post 7, key `year`) 2006 → 2026. 1행.
- 신규: `src/content/portfolio.ts` (이전 주소 표)
- 재작성: `PortfolioList`(목록), `PortfolioDetail`(역할 표기·이전 주소 안내), `SiteFooter`(3열)
- 수정: `AboutPage`(순서·표현), `HomeCases`·`HomeExperience`·`ServicePage`·`ProcessPage`(내부 방침 문구),
  `src/content/services.ts`(note 3건), `src/content/nav.ts`(푸터 열),
  `layouts/portfolio/index.json`(superbify 데이터 소스), `layouts/portfolio/detail.json`(slug 전달),
  `lang/ko.json`·`lang/en.json`, `src/styles/design-tokens.css`
- 검증: `node _workspace/20ft/renewal-qa/cases-about-footer.mjs` 42/42

### 문구 교정 단계 (4차)

- 신규: `src/content/demos.ts`(자체 데모 고객용 표기), `docs/implementation-notes/20ft-renewal/COPY-REVIEW.md`
- 수정: `src/content/services.ts`(전면 재작성), `src/content/process.ts`(단계 축약·FAQ),
  `ServicePage`(자료 배치 순서·본문 폭), `HomeServices`·`HomeCases`·`HomeProcess`·`HomeInquiryCTA`,
  `ServicesList`, `PortfolioList`·`PortfolioDetail`, `ProcessPage`, `AboutPage`,
  `layouts/home.json`(사례 섹션을 첫 화면 다음으로), `src/styles/design-tokens.css`, `lang/ko.json`·`lang/en.json`
- DB·모듈 변경 **없음**
- 검증: `node _workspace/20ft/renewal-qa/copy-correction.mjs` 76/76

### 템플릿 (SSoT: `templates/_bundled/twentyft-studio/`)

신규 컴포넌트
- `HomeServices`, `HomeCases`, `HomeExperience`, `HomeProcess`, `HomeFaq`, `HomeInquiryCTA`
- `ServicesList`, `ServicePage`, `ProcessPage`
- `src/content/services.ts`, `src/content/inquiry.ts`, `src/content/process.ts`, `src/content/nav.ts`
- `src/utils/sanitizeHtml.ts`

재작성
- `SiteHeader`, `SiteFooter`, `HomeHero`, `PortfolioList`, `PortfolioDetail`,
  `SuperBifyList`, `SuperBifyDetail`, `AboutPage`, `InquiryForm`, `PrimaryButton`(variant 추가)

삭제(대체됨)
- `HomeWhatWeBuild`, `HomeHowWeWork`, `SelectedPortfolio`, `AboutPreview`,
  `InquiryMottoCTA`, `SuperBifyPreview`

레이아웃 JSON
- 수정: `home.json`, `about.json`, `portfolio/index.json`
- 추가: `services/index.json`, `services/website.json`, `services/commerce.json`,
  `services/web-development.json`, `process.json`

매니페스트·설정
- `template.json` (0.2.0 → 0.3.0, 설명, 컴포넌트 목록)
- `components.json` (v0.3.0, 25 composite)
- `routes.json` (v1.1.0)
- `lang/ko.json`, `lang/en.json`
- `src/index.ts`, `src/styles/design-tokens.css`
- `dist/**` (빌드 산출물)

테스트
- 수정: `__tests__/layouts/{home,home-responsive,about,about-responsive,inquiry,portfolio,superbify}.test.tsx`,
  `__tests__/components/editor-attrs.test.tsx`, `__tests__/components/InquiryForm.test.tsx`
- 추가: `__tests__/layouts/{services,process}.test.tsx`, `__tests__/utils/sanitizeHtml.test.ts`

### 확장 코드

**없음.** `modules/twentyft-content` 는 조사만 했고 한 줄도 바꾸지 않았다.
문의 유형은 기존 enum 안에서 매핑했고 서버 계약 변경이 불필요했다.

### 설정·데이터 변경

- DB `templates` 행: `version` 0.2.0 → 0.3.0 (동기화 명령이 수행)
- DB `template_layouts`: 기존 11행 유지 + 신규 5행 추가 = 16행. 전부 디스크와 일치
- 관리자 레이아웃 편집 이력(`template_layout_versions`)은 0행 — 덮어쓴 사용자 값 없음
- DB `twentyft_post_meta` 1행: portfolio post 7 `year` 2006 → 2026 (사실 오류 정정)
- 콘텐츠 글·slug·게시판 권한·첨부는 변경 없음

## 4. 검증

`QA-RESULTS.md` 참조. 요약: 타입 검사 PASS, 테스트 119/119, 라우트 24/24,
본문 표시 28/28, 문의 흐름 18/18, 홈 390/1440 전부 통과,
사례·소개·푸터 42/42, 문구 교정 76/76, 단위 테스트 141/141.

문의 관리자 상세(모듈 작업): 모듈 테스트 10/10(`InquiryAdminDetailTest`),
레이아웃 표현식 게이트 42/42(`SafeLayoutExpressionsTest`),
브라우저 검증 38/38(`inquiry-admin-detail.mjs` — 상세 API 키, 권한 경계 403/404,
목록 라벨, 상세 렌더, 상태 변경 저장·복구, 콘솔 오류 0).

### 문의 관리자 상세 화면 (모듈)

| 경로 | 레이아웃 | 비고 |
|---|---|---|
| `/admin/20ft-content/inquiries` | `twentyft-content.admin_inquiry_index` | 행 링크가 상세로 변경, 라벨 컬럼 |
| `/admin/20ft-content/inquiries/:post_id` | `twentyft-content.admin_inquiry_detail` | 신규 |

| API | 권한 | 비고 |
|---|---|---|
| `GET /api/modules/twentyft-content/admin/inquiries/{post_id}` | `twentyft-content.inquiries.read` | 신규 |
| `PATCH /api/modules/twentyft-content/admin/inquiries/{post_id}/status` | `twentyft-content.inquiries.update` | 기존 |

모듈 반영 절차(템플릿과 다르다):

```bash
cd /home/bahamut/20feet
php artisan module:update twentyft-content --source=bundled --force
php artisan module:refresh-layout twentyft-content
php artisan module:cache-clear
php artisan cache:clear
```

주의: `modules/twentyft-content/**` 는 설치본 복사 디렉터리다(루트 `.gitignore` 의 `modules/*/`).
직접 편집하지 않는다 — SSoT 는 `modules/_bundled/twentyft-content/**`.

## 5. 운영 전 필요한 입력

| 항목 | 현재 | 필요한 값 |
|---|---|---|
| 문의 수신 | 로컬 게시판에 저장됨 | 담당자 알림 경로(수신 주소·알림 설정) |
| 개인정보 문구 | 초안 (`COPY REQUIRED`) | 법적 검토본, 보유 기간 |
| 공개 연락처 | 없음 | 푸터에 게시할 연락 방법 |
| 예산 구간 필드 | 폼에서 제외 | 노출 여부 결정 |
| Roastery 자체 데모 | 미게시 (근거는 `DECISIONS.md`) | SuperBify 콘텐츠 등록 여부 |
| 사례 정식 slug | `saas` 유지, 이전 주소는 안내 링크로 처리 | `purepol-saas` 로 바꿀지 여부 |

비밀 값은 이 문서에 적지 않는다.

## 6. 적용·원복 시 주의

### 반영 절차 (G7 공식 명령만 사용)

```bash
cd templates/_bundled/twentyft-studio && npm run build
cd /home/bahamut/20feet
php artisan template:update twentyft-studio --source=bundled --force
php artisan template:refresh-layout twentyft-studio
php artisan template:cache-clear
```

`templates/twentyft-studio/` 를 손으로 고치지 않는다. 다음 `template:update` 가 덮어쓴다.

### 원복

1. DB 레이아웃: `_workspace/20ft/runtime-layouts-snapshot-pre-renewal.json` 의
   `layouts[].content` 를 `template_layouts.content` 에 되돌린다.
2. 런타임 파일: `_workspace/20ft/renewal-runtime-backup/twentyft-studio-pre-renewal/` 를
   `templates/twentyft-studio/` 로 복사한다.
3. `php artisan template:cache-clear`

초기화 버튼이나 DB 삭제로 되돌리지 않는다.

### 알려진 함정

- **레이아웃은 DB, 라우트는 디스크**에서 온다. 한쪽만 고치면 화면이 안 바뀐다.
- **컴포넌트 번들은 `Cache-Control: immutable, max-age=31536000`** 으로 URL 단위 1년 캐시된다.
  `?v=`(= `ext.cache_version`)가 바뀌어야 갱신된다. 템플릿 갱신 이전에 열어 둔 탭은
  새로고침 전까지 옛 번들을 실행하며, **엔진은 모르는 컴포넌트를 조용히 빈 자리로 렌더한다.**
  증상: 헤더·푸터만 보이고 본문이 빔. 새로고침하면 해결된다.
- QA 스크립트는 반드시 방문자 UA를 지정한다. Playwright 기본 UA의 `HeadlessChrome` 은
  G7 `SeoMiddleware` 의 봇 판별에 걸려 코어 번들을 로드하지 않는 SEO HTML을 받는다.
- `config('app.env')` 가 `production` 이다. DB·런타임을 건드리는 명령 전에는 항상 스냅샷을 뜬다.
- 문의 엔드포인트는 `throttle:10,1` 이다. 반복 검증 시 429가 정상 응답으로 나올 수 있다.

## 7. 상태 판정

**구현 완료 / 운영 공개 차단 있음** — 5번 항목이 해소되어야 배포 승인 요청이 가능하다.
운영 배포는 이번 작업 범위가 아니며 수행하지 않았다.
