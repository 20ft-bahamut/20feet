# 저장소 조사

조사 시점: 2026-09-16. 근거는 실제 파일·실행 출력이다.

## 1. 실행 환경

| 항목 | 값 | 근거 |
|---|---|---|
| 프레임워크 | Laravel 12 (`laravel/framework ^12.0`) + G7 7.0.8 | `composer.json`, `php artisan --version`, `<meta name="generator">` |
| PHP | 8.4.23 | `php -v` |
| 패키지 관리자 | composer + npm (lockfile 둘 다 존재) | `composer.lock`, `package-lock.json` |
| DB | MySQL (localhost:3306), database `20feet` | 질의 오류 메시지의 qualifier, `config/database.php` |
| 로컬 서빙 | `php artisan serve` — `127.0.0.1:8000` (pid 확인) | `ss -ltnp`, curl 200 |
| 템플릿 빌드 | `vite build` (IIFE), 산출물 `dist/css/components.css`, `dist/js/components.iife.js` | `templates/_bundled/twentyft-studio/vite.config.ts` |

주의: `config('app.env')` 는 `production` 이지만 `APP_URL` 은 `http://127.0.0.1:8000` 이고
호스트는 WSL2 개발 머신이다. 포트 80 은 무관한 LNMP 기본 페이지를 반환한다.
그럼에도 **운영 표기 환경이므로 DB·런타임 변경은 전부 스냅샷 후 수행**했다.

## 2. 템플릿 소스 ↔ 런타임

- SSoT: `templates/_bundled/twentyft-studio/**` (git 추적)
- 서빙 사본: `templates/twentyft-studio/**` (루트 `.gitignore` `templates/*/`, `!templates/_bundled/` 로 미추적)
- 직접 편집 금지 대상은 런타임 사본이며, 반영은 G7 공식 명령으로만 한다.

### 레이아웃 JSON이 서빙되는 경로 (중요)

디스크의 `layouts/*.json` 을 고쳐도 즉시 반영되지 않는다.

```
GET /api/layouts/{identifier}/{name}.json
  → LayoutService → template_layouts.content (DB)   ← 실제 서빙 본문
```

- 디스크 → DB 동기화는 `TemplateManager::refreshTemplateLayouts()` 에서만 일어난다.
- 트리거: `template:install`, `template:update`(직전 상태가 active일 때), `template:refresh-layout`.
- `routes.json` 은 반대로 **디스크에서 요청 시점에 읽고** 캐시 키 `template.routes.{id}.v{cacheVersion}` 에 담는다.
- 캐시 무효화: `template:update` / `template:cache-clear` / `ext.cache_version` 증가.

즉 **레이아웃은 DB, 라우트는 디스크** — 두 저장 위치가 다르다. 이번 작업에서 둘 다 갱신했다.

### 활성 템플릿 판정

DB `templates` 테이블의 `status` enum 값 `active`. (`is_active` 불리언 컬럼은 없다 —
`docs/extension/template-security.md`, `template-caching.md` 일부 서술은 실제 스키마와 다르다.)

## 3. 콘텐츠·문의 구조

- 모듈 `twentyft-content` (내부 모듈, `internal: true`).
- 게시글 = `sirsoft-board` 의 `board_posts` (단일 테이블 + `board_id`),
  구조화 메타 = `twentyft_post_meta` (`board_id, post_id, domain, key, value JSON`).
- 게시판 slug: `portfolio`, `superbify`, `project-inquiry` — `TwentyftContentSeeder` 가 생성.
- 공개 API prefix: `/api/modules/twentyft-content/...`
  (`app/Providers/ModuleRouteServiceProvider.php` 가 `modules/` 하위 **디렉터리명**을 prefix로 쓴다.
  모듈 소스 주석의 `api/modules/20ft-content` 는 오래된 값이다.)
- 문의 등록: `POST /api/modules/twentyft-content/inquiries`, `optional.sanctum` + `throttle:10,1`.
  CSRF 미적용(api 그룹) — 실제 POST로 확인.
- 관리자 문의 화면: `/admin/20ft-content/inquiries`, 권한 `twentyft-content.inquiries.read`.

### 실데이터 (로컬 DB)

- portfolio 1건: `saas` / 퓨어폴 SaaS (SOFTWARE, RELEASED, role CTO, relatedUrl purepol.kr)
- superbify 1건: `superbify-commerce-minimal` (TEMPLATE, v0.4.0, 7.0.0+)

하네스가 관찰한 공개 사이트에는 Roastery 데모와 Commerce Compat 플러그인도 보였으나
**로컬 DB에는 없다.** 따라서 화면을 하드코딩하지 않고 데이터 소스로 연결해,
운영자가 콘텐츠를 추가하면 자동으로 나타나게 했다.

## 4. 문의 기능의 기존 상태

- 서버: **이미 완성되어 동작**. `InquiryStoreRequest` + `InquiryController::store` → 게시판 저장 + 메타 11건.
  실측 결과 `POST` → `201` + `{"message":"문의가 접수되었습니다...","inquiry_id":"..."}`.
- 프런트: 미완성이었다. `InquiryForm.tsx` 가 모든 입력 `disabled` + `onSubmit` 없음 +
  '준비 중' 배너였고, **필드명이 서버 계약과 불일치**(`projectType`/`message` vs `project_type`/`description`,
  `privacy_consent` 누락). 재사용 불가 → 재작성.

## 5. 재사용 / 수정 / 신규 / 외부 입력 필요

**재사용**
- 디자인 토큰 `src/styles/design-tokens.css`, 브랜드 SVG 자산, `BrandLogo`
- `Container`, `PrimaryButton`, `TextLink`, `Tag`, `Status`, `LoadingRows`, `SectionEyebrow`, `basic/*`
- 기존 라우트 `/`, `/portfolio`, `/portfolio/:slug`, `/about`, `/inquiry`, `/superbify`, `/superbify/:slug`
- `twentyft-content` 공개 API 전부

**수정**
- `SiteHeader`, `SiteFooter` (IA·라벨·구성)
- `HomeHero`, `PortfolioList`, `PortfolioDetail`, `SuperBifyList`, `SuperBifyDetail`, `AboutPage`, `InquiryForm`
- `layouts/home.json`, `layouts/about.json`, `layouts/portfolio/index.json`
- `routes.json`, `lang/ko.json`, `lang/en.json`, `template.json`, `components.json`, `src/index.ts`

**신규**
- 컴포넌트: `HomeServices`, `HomeCases`, `HomeExperience`, `HomeProcess`, `HomeFaq`, `HomeInquiryCTA`,
  `ServicesList`, `ServicePage`, `ProcessPage`
- 콘텐츠 정의: `src/content/{services,inquiry,process,nav}.ts`
- 유틸: `src/utils/sanitizeHtml.ts`
- 레이아웃: `services/index`, `services/website`, `services/commerce`, `services/web-development`, `process`
- 라우트 5개

**삭제(대체)**
- `HomeWhatWeBuild`, `HomeHowWeWork`, `SelectedPortfolio`, `AboutPreview`, `InquiryMottoCTA`, `SuperBifyPreview`
  → 각각 `HomeServices`, `HomeProcess`, `HomeCases`, `HomeExperience`, `HomeInquiryCTA` 로 대체.
  참조가 남지 않은 것을 grep으로 확인 후 삭제.

**외부 입력 필요**
- 문의 수신 주소·알림 설정, 개인정보 처리방침 문구, 공개 연락처.
