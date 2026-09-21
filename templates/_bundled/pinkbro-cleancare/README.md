# PinkBro CleanCare (pinkbro-cleancare)

핑크브로클린케어(부산·울산·경남 F&B 매장 전문 위생 클린케어) 랜딩 페이지를 렌더링하는
Gnuboard 7 **사용자 템플릿**(`type: user`)입니다.

한 페이지에 섹션 8종·예상견적 계산기·문의 폼을 담고, 모든 콘텐츠는 모듈
`pinkbro-contents` 의 공개 API 가 공급합니다. **이 템플릿에는 페이지 카피가 하드코딩되어
있지 않습니다** — 관리자가 모듈 쪽에서 문구·가격·사례·사진을 바꾸면 페이지가 따라갑니다.

| 항목 | 값 (`template.json` 원문) |
|---|---|
| 식별자 | `pinkbro-cleancare` |
| 벤더 | `pinkbro` |
| 버전 | `0.1.0` |
| 타입 | `user` |
| 라이선스 | MIT (`LICENSE`) |
| 작성자 | `pinkbro` |
| G7 요구 버전 | `>=7.0.0` |
| 로케일 | `ko`, `en` |
| `release_date` | `2026-09-18` |
| 다크 모드 / 반응형 / 다국어 | 미지원 / 지원 / 지원 |

## 페이지 구성

라우트는 `/` 1건(`routes.json`)이며 `home` 레이아웃을 씁니다. 섹션 8종은 모두
앵커 id 를 갖고 있어 상단 내비게이션에서 바로 이동할 수 있습니다.

| # | 앵커 | 섹션 | 소비하는 데이터 소스 |
|---|---|---|---|
| 01 | `#top` | 히어로 — 헤드라인·브랜드 메시지·행동 유도 | `copy` + `site` + `media` |
| 02 | `#about` | WHY PINKBRO — 브랜드 관점 | `copy` + `media.why_stage` |
| 03 | `#service` | 서비스 6종 그리드 | `services` + `copy` + `media` 사진 슬롯 |
| 04 | `#package` | 패키지 3종 + 동시작업 혜택 | `packages` + `copy` + `media.package_stage` |
| 05 | `#pricing` | 가격 고지 3블록 · 동시작업 할인 단계 · **예상견적 계산기** | `copy` + `discount` + `services` + `site` |
| 06 | `#faq` | FAQ 8문항 | `faq` + `copy` |
| 07 | `#projects` | 작업사례 갤러리 | `cases` + `copy` |
| 08 | `#estimate` | 간편견적 문의 폼 | `copy` + `services` + `site` + `media.estimate_bg` |

레이아웃 JSON 이 선언한 API 데이터 소스 8종 (`layouts/home.json`):

| id | 엔드포인트 | 로딩 |
|---|---|---|
| `pinkbro_site` | `GET /api/modules/pinkbro-contents/site` | blocking |
| `pinkbro_copy` | `GET /api/modules/pinkbro-contents/copy` | blocking |
| `pinkbro_discount` | `GET /api/modules/pinkbro-contents/discount` | progressive |
| `pinkbro_services` | `GET /api/modules/pinkbro-contents/services` | progressive |
| `pinkbro_packages` | `GET /api/modules/pinkbro-contents/packages` | progressive |
| `pinkbro_cases` | `GET /api/modules/pinkbro-contents/cases` | progressive |
| `pinkbro_faq` | `GET /api/modules/pinkbro-contents/faq` | progressive |
| `pinkbro_media` | `GET /api/modules/pinkbro-contents/media-slots` | progressive |

여덟 소스 모두 `auto_fetch: true` 이며 인증이 필요 없습니다.

## 의존성

`template.json` 의 모듈 의존 (플러그인 의존은 없음):

| 모듈 | 최소 버전 | 용도 |
|---|---|---|
| `pinkbro-contents` | `>=0.1.0` | 랜딩 콘텐츠(서비스·패키지·사례·FAQ·문의·미디어 슬롯) 공개 API |
| `sirsoft-board` | `>=1.0.0` | 문의 접수 및 콘텐츠 게시글 저장 |

`pinkbro-contents` 자체도 `sirsoft-board >= 1.0.0` 에 의존합니다.

## 설치

**순서를 지켜야 합니다.** 순서를 어기면 페이지가 콘텐츠 없이 렌더됩니다 — 아래
[설치 순서가 중요한 이유](#설치-순서가-중요한-이유) 참조.

### 1. `sirsoft-board` 설치 + 활성화

```bash
php artisan module:install sirsoft-board
php artisan module:activate sirsoft-board
```

관리자 화면(모듈 관리)에서 설치·활성화해도 같습니다.

### 2. 관리자 템플릿 활성화

`sirsoft-admin_basic`(`type: admin`)이 활성이어야 관리자 화면이 뜹니다. 이미 활성이면
건너뜁니다.

```bash
php artisan template:activate sirsoft-admin_basic
```

### 3. `pinkbro-contents` 설치 + 활성화

```bash
php artisan module:install pinkbro-contents
php artisan module:activate pinkbro-contents
```

`module:install` 한 번이 **마이그레이션과 시더를 함께** 실행합니다
(`ModuleManager::installModule()` 의 Phase 1 = 마이그레이션, Phase 3 = 시더). 시더가
게시판 6종(`pinkbro_service` / `pinkbro_package` / `pinkbro_case` / `pinkbro_faq` /
`pinkbro_inquiry` / `pinkbro_media`)과 서비스 6종·패키지 3종·사례 4종·FAQ 8종, 그리고
사이트 레벨 `site`·`copy`·`discount` 메타를 주입합니다.

### 4. `pinkbro-cleancare` 설치 + 활성화

```bash
php artisan template:install pinkbro-cleancare
php artisan template:activate pinkbro-cleancare
```

`template:activate` 는 모듈 의존성이 활성 상태인지 검사합니다. 3번을 건너뛰면 여기서
막힙니다(`--force` 로 우회할 수 있지만, 우회하면 콘텐츠가 비어 있습니다).

### 설치 순서가 중요한 이유

레이아웃의 데이터 소스 8종은 전부 `/api/modules/pinkbro-contents/*` 를 가리킵니다.
모듈이 설치·활성화되기 전에는 이 엔드포인트가 **존재하지 않아 404** 를 돌려주고,
템플릿은 정상적으로 렌더되지만 **모든 섹션이 빈 상태**로 나옵니다. 화면이 깨져 보이지
않고 그냥 비어 보이기 때문에 순서를 틀렸다는 사실이 늦게 드러납니다.

또한 `pinkbro-contents` 의 시더는 `sirsoft-board` 의 `BoardService` 로 게시판을 만들므로,
`sirsoft-board` 가 **활성화된 뒤에** `module:install pinkbro-contents` 를 실행해야 합니다.

### 이전 템플릿으로 되돌리기

```bash
php artisan template:activate {이전-식별자}
```

## 관리자 편집

콘텐츠의 **저장 위치**는 아래와 같습니다. 템플릿이 아니라 모듈이 소유합니다.

| 편집 대상 | 저장 위치 |
|---|---|
| 서비스 6종 (기본가·사진 슬롯·에어컨 기종별 가격) | 게시판 `pinkbro_service` 게시글 + `service` 메타 |
| 패키지 3종 | 게시판 `pinkbro_package` 게시글 + `package` 메타 |
| 작업사례 4개 (제목·요약·썸네일 슬롯·블로그 URL) | 게시판 `pinkbro_case` 게시글 + `case` 메타 |
| FAQ 8문항 | 게시판 `pinkbro_faq` 게시글 + `faq` 메타 |
| 문의 접수 내역 | 게시판 `pinkbro_inquiry` 게시글 + `inquiry` 메타 |
| 연락처·브랜드 문구 (전화·카카오 채널·태그라인 등) | `site` 메타 |
| 섹션 문구 75키 | `copy` 메타 |
| 동시작업 할인 단계 | `discount` 메타 |
| 이미지 슬롯 16종 | `media` 메타 (슬롯 키 → 첨부 id) |

메타는 모듈의 `pinkbro_meta` 테이블에 저장되고, 도메인은
`service` / `package` / `case` / `faq` / `inquiry` / `media` / `site` / `copy` / `discount`
9종입니다(`src/Enums/MetaDomain.php`).

> **관리자 화면 상태 (0.1.0 기준, 숨기지 않고 적습니다).** 모듈은 관리자 메뉴 5개 항목과
> 권한 4개 카테고리를 선언하지만(`module.php`), `resources/routes/admin.json` 의 라우트
> 배열은 **비어 있고 관리자 컨트롤러도 없습니다** — 즉 이 버전에는 콘텐츠를 편집하는
> 관리자 화면이 아직 없습니다. 게시글의 제목·본문은 `sirsoft-board` 가 제공하는 게시판
> 관리 화면에서 다룰 수 있지만, 가격·`blog_url`·`cover_slot`·`photo_slot` 등 구조화 필드는
> `pinkbro_meta` 행이므로 화면 없이 편집해야 합니다. 화면이 필요하면 모듈 쪽 후속 작업이
> 필요하며, 그건 이 템플릿의 범위 밖입니다.

### 이미지 슬롯 16종

슬롯 키의 유일한 출처는 모듈의 `MediaSlotService::SLOTS`
(`modules/_bundled/pinkbro-contents/src/Services/MediaSlotService.php:21-38`)입니다.
슬롯에 첨부를 연결하지 않으면 해당 자리는 CSS 폴백 또는 번들 자산으로 대체됩니다.

| 슬롯 키 | 의미 | 어느 섹션에 쓰이는가 |
|---|---|---|
| `hero_main` | 히어로 대표 이미지 | `#top` (`Hero.tsx`) |
| `hero_sub` | 히어로 보조 이미지 | **이 템플릿은 소비하지 않음** (모듈에만 등록됨) |
| `why_stage` | 브랜드 소개 이미지 | `#about` |
| `package_stage` | 패키지 섹션 이미지 | `#package` |
| `estimate_bg` | 견적 섹션 배경 | `#estimate` |
| `case_1` | 작업사례 1 썸네일 | `#projects` (사례 1 `cover_slot`) |
| `case_2` | 작업사례 2 썸네일 | `#projects` (사례 2 `cover_slot`) |
| `case_3` | 작업사례 3 썸네일 | `#projects` (사례 3 `cover_slot`) |
| `case_4` | 작업사례 4 썸네일 | `#projects` (사례 4 `cover_slot`) |
| `site_og` | 공유 이미지(og:image) | SEO — `og:image`, JSON-LD `logo`·`image` |
| `services_floor` | 바닥 기계세척 사진 | `#service` (서비스 `photo_slot`) |
| `services_glass` | 유리창 세척 사진 | `#service` |
| `services_awning` | 접이식 어닝 세척 사진 | `#service` |
| `services_sign` | 간판 세척 사진 | `#service` |
| `services_kitchen` | 상업용 후드 세척 사진 | `#service` |
| `services_air` | 에어컨 분해세척 사진 | `#service` |

서비스·사례 슬롯은 게시글의 `photo_slot` / `cover_slot` 메타를 통해서만 연결됩니다
(`ContentController` 가 `MediaSlotService::resolve()` 로 `{url, alt}` 를 만들어 내려줍니다).

## 예상견적 계산기 (`#pricing`)

선택한 **항목 종류 수**에 따라 할인이 적용됩니다.

| 항목 종류 수 | 할인율 |
|---|---|
| 2개 | 3% |
| 3~4개 | 5% |
| 5개 이상 | 10% |
| 그 외(0~1개) | 0% |

기본가는 선택한 서비스의 기본가 합계이고, 할인액은 `round(기본가 × 할인율 ÷ 100)`,
최종 금액은 `기본가 − 할인액` 입니다.

### 할인 단계 파싱의 한계 (중요)

할인율은 모듈이 내려주는 **`condition` 문자열을 정규식으로 파싱**해 결정합니다
(`src/lib/estimate.ts` 의 `discountRateFor`). 모듈이 구조화된 임계값
(`min_count`/`max_count`)을 함께 내려주지 않기 때문입니다.

파서가 인식하는 형태는 시더가 넣는 다음 세 가지뿐입니다.

- `N개 항목` — 정확히 N개
- `N~M개 항목` (또는 `N-M개 항목`) — N 이상 M 이하
- `N개 이상` — N 이상

**관리자가 `condition` 문자열을 이 세 형태에서 벗어나게 고치면**(예: `두 항목부터`,
`3개 이상 5개 미만`) 어떤 구간에도 매칭되지 않아 **할인율이 조용히 0% 가 됩니다.**
오류가 나지 않고 금액만 원래대로 나오므로 발견이 늦습니다. 견고하게 만들려면 모듈이
구조화된 임계값을 함께 내려줘야 하고, 그건 모듈 계약 변경이라 이 템플릿에서 하지
않았습니다. 할인 문구를 고칠 때는 위 세 형태를 유지하세요.

할인율 자체는 `amount_label` 에서 `N%` 를 뽑아 씁니다 — 라벨에 `%` 가 없으면 0% 입니다.

## 문의 폼 (`#estimate`)

폼은 `POST /api/modules/pinkbro-contents/inquiry` 로 제출되며(비회원 허용, CSRF 불필요,
IP당 분당 10건 스로틀), 성공 시 모듈의 문의 게시판에 비밀글로 저장됩니다. 응답 코드는
201(성공) / 422(검증 실패) / 429(스로틀 초과) / 503(게시판 미비) 입니다.

### 허니팟 필드 (`website`)

폼에는 화면에 보이지 않고 키보드로도 닿지 않는 `website` 입력이 숨겨져 있습니다
(`display: none` + `aria-hidden="true"` + `tabIndex={-1}`). 서버는 이 필드에
`prohibited` 규칙을 걸어 두었으므로, **값이 채워져 오면 봇으로 간주해 422 를 돌려줍니다.**

**부작용:** 공격적인 자동완성(autofill) 확장 프로그램이나 비밀번호 관리자가 숨겨진
필드까지 채우면, 사람이 정상적으로 작성한 문의가 **422 로 차단**될 수 있습니다. 문의
제출이 검증 오류 없이 실패한다면 이 필드를 먼저 의심하세요. 오류 메시지는 필드별 오류가
아니라 공통 안내로 표시됩니다(허니팟은 필드 오류로 매핑하지 않음 — 의도된 동작).

## 빌드 / 테스트

### 반드시 템플릿 디렉터리 안에서 실행합니다

```bash
cd templates/_bundled/pinkbro-cleancare
npm install
G7_BUILD_SOURCEMAP=0 npx vite build   # 배포 빌드 — 소스맵 없음
npx vitest run                        # 테스트 (17 파일 / 206개)
npx tsc --noEmit                      # 타입 검사
```

**저장소 루트에서 `npm run build` / `vite build` 를 실행하지 마세요.** 루트 빌드는 G7
코어의 `public/build/core/*.min.js` 산출물을 **삭제**하며, 복구하려면 코어 번들 3종
(`devtools.min.js`, `layout-editor.min.js`, `template-engine.min.js`)을 다시 빌드해야
합니다. 템플릿 빌드는 반드시 템플릿 디렉터리에서 돌립니다.

### `G7_BUILD_SOURCEMAP=0`

배포 빌드에는 `G7_BUILD_SOURCEMAP=0` 을 붙입니다. 이 값을 주지 않으면 `dist/` 에 소스맵이
함께 나갑니다. 커밋된 `dist/` 에는 `sourceMappingURL` 참조도 `.map` 파일도 없습니다.

### Node 버전

Vite 7 은 Node 20.19+ 또는 22.12+ 를 요구합니다. Node 20.17 에서도 빌드는 **성공**하지만
업그레이드 권고 경고가 출력됩니다.

### 산출물 계약

| 산출물 | 소비처 |
|---|---|
| `dist/js/components.iife.js` | 템플릿 컴포넌트 IIFE 번들 (`assets.js`) |
| `dist/css/components.css` | `resources/views/app.blade.php` 가 활성 사용자 템플릿에 대해 **무조건** 링크 |
| `dist/index.d.ts` | 타입 선언 진입점 |
| `dist/images/*` | 번들 자산 8개 (`assets.images`) |

`src/index.ts` 의 `import './styles/design-tokens.css'` 가 CSS 산출물을 만듭니다. 이
import 를 지우면 CSS 파일이 생성되지 않아 모든 페이지에서 404 가 납니다.

### `dist/` 는 커밋되어 있습니다

**서버에 Node 가 없어도 이 템플릿은 동작합니다.** 빌드 결과물(`dist/`, 46개 파일)이
저장소에 함께 커밋되어 있으므로, 설치 서버는 `npm install` 없이 그대로 설치·활성화하면
됩니다. Node 가 필요한 것은 이 템플릿을 **수정**할 때뿐입니다.

### 릴리스 ZIP (실행하지 않음 — 사용자 승인 필요)

템플릿 디렉터리에 자체 git 저장소를 만들고 `git archive` 로 ZIP 을 뜨는 절차입니다.
**저장소 구조를 바꾸는 작업이므로 사용자 확인 후에만 실행합니다.** 아래는 기록용이며
이 저장소에서는 실행하지 않았습니다.

```bash
# (사용자 확인 후 실행)
cd templates/_bundled/pinkbro-cleancare
git init && git add -A && git commit -m "feat: initial release v0.1.0"
git tag v0.1.0
git archive --prefix=pinkbro-cleancare-0.1.0/ -o /tmp/pinkbro-cleancare-0.1.0.zip HEAD
```

## 컴포넌트 등록 규칙

`components.json` 항목의 `name`, 레이아웃 노드의 `name`, `src/index.ts` 의
`registry.register({ metadata: { name } })` 값이 **같은 문자열**이어야 합니다. 불일치하면
레지스트리가 경고만 남기고 건너뛰어 컴포넌트가 화면에서 조용히 사라집니다.

등록된 컴포넌트: basic 15종(`Div` `Button` `H2` `H3` `H4` `P` `A` `Img` `Span` `Details`
`Summary` `Input` `Select` `Textarea` `Label`), composite 12종(`Hero` `AboutSection`
`ServiceGrid` `PackageList` `PriceDiscount` `FaqList` `CaseGallery` `EstimateCalculator`
`InquiryForm` `SiteHeader` `SiteFooter` `MobileBar`).

레이아웃은 `layouts/home.json`(`extends: _user_base`), `layouts/_user_base.json`, 그리고
에러 레이아웃 3종(`layouts/errors/{403,404,500}.json`)입니다.

## 알려진 한계 (숨기지 않고 기록)

1. **작업사례 카드의 블로그 URL 이 아직 비어 있습니다.** 사례 4개의 `blog_url` 이
   비어 있으면 `CaseGallery` 는 `<a>` 대신 `aria-disabled="true"` 인 `<div>` 로 카드를
   렌더합니다 — 즉 해당 카드는 **링크가 아닙니다**. 관리자가 `case` 메타에 URL 을 넣으면
   그때부터 링크가 됩니다.
2. **JSON-LD `FAQPage` 블록은 레이아웃에 고정되어 있습니다.** 구조화 데이터의 FAQ 8문항은
   `layouts/home.json` 에 **원문으로** 적혀 있고 모듈 `faq` 데이터 소스에서 파생되지
   않습니다. 따라서 관리자가 FAQ 를 고쳐도 **구조화 데이터에는 반영되지 않습니다**
   (화면의 FAQ 목록은 모듈에서 오므로 반영됩니다). 둘을 맞추려면 레이아웃을 함께
   수정해야 합니다.
3. **JSON-LD 의 `logo`·`image` 는 상대 URL 입니다.** 레이아웃 JSON 이 절대 URL 을 만들
   수단이 없어 값을 지어내지 않고 루트 상대 경로
   (`/api/templates/assets/pinkbro-cleancare?file=images/og-image.png`)를 씁니다. 일부
   구조화 데이터 소비자는 절대 URL 을 요구합니다.
4. **`hero_sub` 슬롯은 모듈에 등록되어 있지만 이 템플릿은 쓰지 않습니다.** 비워 두어도
   화면에 영향이 없습니다.
5. **관리자 편집 화면이 아직 없습니다** — 위 [관리자 편집](#관리자-편집) 절의 경고를
   참조하세요.
6. **`error_config` 는 키 6종을 선언하지만 파일은 3종입니다.** `template.json` 은
   `401`/`403`/`404`/`500`/`503`/`maintenance` 를 선언하나 `layouts/errors/` 에 있는 것은
   `403`/`404`/`500` 3종입니다. G7 의 설치 검증은 `404`/`403`/`500` 만 파일 존재를
   확인하므로 설치는 통과하지만, 나머지 3종은 레이아웃 파일 없이 이름만 선언된 상태입니다.
7. **CHANGELOG 의 `0.1.0` 날짜(2026-09-19)와 `template.json` 의 `release_date`
   (2026-09-18)가 하루 다릅니다** — 전자는 문서 작성일, 후자는 매니페스트에 기록된
   릴리스 날짜입니다. 버전 번호는 양쪽 모두 `0.1.0` 으로 같습니다.

## 미해결 / 관리자 입력 대기

- 실제 매장 사진 — 히어로·브랜드 소개·패키지·견적 배경(4곳)과 서비스 사진 6장은 현재
  번들 자산으로 대체되어 있습니다. 관리자 업로드 슬롯으로 교체하는 것이 전제입니다.
- 작업사례 블로그 URL 4개.

## 디자인 토큰

`src/styles/design-tokens.css` 가 스타일 출처 중 하나이며 모든 커스텀 프로퍼티는 `--pb-`
접두사를 씁니다. 폰트는 Google Fonts CDN `@import` 로 로드하므로 번들 폰트 파일이
없습니다(`assets.fonts` 는 빈 배열).

## 구조

```
pinkbro-cleancare/
├── template.json          # 템플릿 매니페스트 (dependencies/assets/components/error_config)
├── routes.json            # 라우트 정의 (`/` 1건)
├── components.json        # 컴포넌트 레지스트리 매니페스트
├── vite.config.ts         # lib iife 빌드 · external react 3종 · asset 경로 분기
├── vitest.config.ts       # happy-dom + 템플릿 로컬 setup (코어 경로 의존 없음)
├── lang/{ko,en}.json      # UI 메타 문자열 (브랜드 카피 아님)
├── assets/                # 소스 이미지 원본 (빌드 입력, dist 아님)
├── dist/                  # 커밋되는 빌드 산출물
│   ├── js/components.iife.js
│   ├── css/components.css
│   ├── images/            # 번들 자산 8개
│   └── index.d.ts + src/  # 타입 선언
├── layouts/
│   ├── _user_base.json
│   ├── home.json
│   └── errors/{403,404,500}.json
└── src/
    ├── index.ts           # CSS import · export · ComponentRegistry 자동 등록
    ├── lib/               # types · estimate · inquiry · serviceAssets · templateAsset
    ├── styles/            # design-tokens.css + 컴포넌트별 CSS
    └── components/        # basic/ 15종 + composite 12종
```

## 번들 자산

| | 값 |
|---|---|
| 소스 원본 (`assets/images/`) | PNG 7장, 20,995,653 B (약 21 MB) |
| 변환 결과 (`dist/images/` 의 WebP 7장) | 427,828 B (약 0.43 MB) — 약 98% 감소 |
| `dist/images/og-image.png` | 692,158 B — 압축하지 않고 원본 복사 |
| `dist/images/` 합계 | 1,119,986 B (약 1.1 MB) |

## 라이선스

MIT — `LICENSE` 참조.
