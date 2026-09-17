# 결정 기록

> 확인하지 않은 사실은 결정으로 덮어쓰지 않는다.

| 날짜 | 쟁점 | 확인 근거 | 결정 | 영향 파일/경로 | 추가 확인 |
|---|---|---|---|---|---|
| 2026-09-16 | 수정 대상 | DB `templates` 행 `identifier=twentyft-studio`, `status=active`, `type=user` / `template.json` | 기존 활성 사용자 템플릿을 개편. 신규 템플릿 생성·교체 없음 | `templates/_bundled/twentyft-studio/**` | — |
| 2026-09-16 | 레이아웃 반영 방법 | `LayoutService` → `template_layouts.content` 서빙, 디스크 편집만으로는 미반영 | 디스크 편집 후 `template:update --source=bundled --force` + `template:refresh-layout` + `template:cache-clear` | 런타임 사본·DB 레이아웃 | — |
| 2026-09-16 | 런타임 변경 안전성 | DB↔디스크 레이아웃 drift 0, `template_layout_versions` 0행, `user_modified_at` NULL | 스냅샷 2종 확보 후 진행 (DB JSON + 런타임 디렉터리 백업) | `_workspace/20ft/runtime-layouts-snapshot-pre-renewal.json` | — |
| 2026-09-16 | 홈 H1과 LOCKED COPY 충돌 | CLAUDE.md §1.1은 `작은 공간에서, 큰 가능성을 만듭니다.`를 LOCKED로 지정. 하네스 04는 첫 화면 H1을 제작 서비스 문장으로 요구 | H1은 제작 서비스 문장으로. LOCKED 문구는 **문구를 바꾸지 않은 채** 위치만 소개 페이지로 옮겨 각 1회만 노출(푸터에서는 제거) | `HomeHero.tsx`, `AboutPage.tsx`, `SiteFooter.tsx` | 사용자 확인 권장 |
| 2026-09-16 | 사례 성격 구분 | 두 게시판이 이미 성격을 나눔 (`portfolio`=진행 프로젝트, `superbify`=자체 제품) | 새 필드를 만들지 않고 게시판 구분을 화면에 표기 (`고객 프로젝트` / `자체 제작 데모`) | `HomeCases.tsx`, `ServicePage.tsx`, `PortfolioList/Detail`, `SuperBify*` | — |
| 2026-09-16 | 커머스 데모가 로컬에 없음 | 로컬 DB superbify 1건뿐. 하네스가 본 Roastery는 공개 사이트 값 | 하드코딩하지 않고 데이터 소스로 연결. 없으면 빈 상태 안내 | `layouts/services/commerce.json`, `ServicePage.tsx` | 운영 콘텐츠 확인 |
| 2026-09-16 | 문의 유형 라벨 ↔ 서버 enum | `InquiryProjectType` = WEB, COMMERCE, WEB_SERVICE, GNUBOARD7, SYSTEM_IMPROVEMENT, INTERNAL_SYSTEM, OTHER | **모듈을 수정하지 않고** 화면 라벨만 고객 언어로 매핑 (홈페이지→WEB, 쇼핑몰→COMMERCE, 웹프로그램→INTERNAL_SYSTEM, 개선→SYSTEM_IMPROVEMENT, 미정→OTHER) | `src/content/inquiry.ts` | 관리자 화면에는 enum 라벨로 표시됨 |
| 2026-09-16 | 예산 구간 필드 | `InquiryBudgetRange` 에 가격 구간이 이미 정의되어 있으나, 공개 폼에 노출하면 가격표로 읽힘. 하네스 01·04가 가격 약속 금지 | 공개 폼에서 **제외**(서버는 선택 필드라 생략 가능) | `InquiryForm.tsx` | 사용자 확인 권장 |
| 2026-09-16 | 게시판 본문 HTML 렌더 | 상세 API의 `description` 이 raw HTML. 기존 `SuperBifyDetail` 은 태그를 텍스트로 노출하는 버그 | `sanitizeHtml` 로 허용 태그·속성만 남기고 렌더. `script`/`on*`/`javascript:`/`data:` 제거 | `src/utils/sanitizeHtml.ts`, `PortfolioDetail.tsx`, `SuperBifyDetail.tsx` | — |
| 2026-09-16 | 개인정보 동의 문구 | 승인된 정책 문서를 찾지 못함(템플릿·모듈·20ftdocs 모두) | 사실에 근거한 최소 문구로 구현하고 **COPY REQUIRED + 배포 차단 항목**으로 기록. 보유 기간은 확인 전까지 게시하지 않음 | `InquiryForm.tsx`, `STATUS.md` | 사용자 승인 필요 |
| 2026-09-16 | 사례 연도 2006 | 시더·기본값·날짜 처리에 없음. 같은 사례 기술이 svelte(2016)·CI4(2020)이고 작성일이 2026-08-26 | 관리자 입력 오류로 판단해 메타 1행을 2026 으로 수정. 화면 코드에서 덮어쓰지 않음 | `twentyft_post_meta` post 7 / key `year` | 이전 공개 사이트 표기와 일치 확인 |
| 2026-09-16 | 이전 주소 `/portfolio/purepol-saas` | 옛 제목 `PUREPOL SaaS` 의 fallback slug. 제목이 바뀌며 매칭 끊김 | slug·게시글을 바꾸지 않고, 이전 주소 방문자에게 현재 주소를 안내하는 링크만 둠 | `src/content/portfolio.ts`, `PortfolioDetail.tsx` | 정식 slug 변경은 사용자 확인 필요 |
| 2026-09-16 | 자체 제작 데모가 사례 목록에서 빠짐 | `/portfolio` 가 portfolio 게시판만 조회 | superbify 데이터 소스를 추가해 같은 목록에서 배지로 구분 | `layouts/portfolio/index.json`, `PortfolioList.tsx` | — |
| 2026-09-16 | Roastery 데모 미노출 | `superbify-roastery` 는 저장소에 실물이 있으나 상위 저장소 미추적·자체 git 보유, `templates` 행 `status=inactive`(v0.1.6, 디스크는 v0.1.7), SuperBify 콘텐츠 글 없음 | 공개 가능 여부가 확인되지 않아 게시하지 않음. 운영자가 콘텐츠를 등록하면 목록에 자동 포함됨 | — | 게시 여부 사용자 확인 필요 |
| 2026-09-16 | 상세의 `role: ["CTO"]` | 게시판 메타에 적힌 직함. 실제 담당 범위 근거 없음 | '담당 범위' 대신 '역할'로 표기하고 기여 범위는 덧붙이지 않음 | `PortfolioDetail.tsx` | — |
| 2026-09-16 | 푸터 문의 링크 중복 | 서비스별 `/inquiry?type=...` 3개 + 일반 문의 1개 | 문의 진입을 1개로 모으고 유형 선택은 문의 화면에서 | `src/content/nav.ts`, `SiteFooter.tsx` | — |

| 2026-09-16 | 이전 주소를 301 로 보낼 수 있는가 | G7 `docs/extension/template-routing.md` 의 route 필드는 path/layout_name/permissions/meta 뿐이고, 코어 번들에도 리디렉션 처리가 없다 | 서버 리디렉션 불가 → **이전 주소에 같은 사례를 렌더**하고 canonical 을 대표 주소로 지정. 데이터·식별자 변경 없음 | `routes.json`, `layouts/portfolio/purepol-saas.json` | 정식 slug 전환은 사용자 확인 |
| 2026-09-16 | Compat·Roastery 주소가 404 | 로컬 superbify 게시판에 글이 3건뿐(테스트 2 + Minimal 1). 조회 조건·slug·가시성 문제 아님 | 콘텐츠를 지어내지 않고 배포 전 확인 항목으로 기록 | — | 운영 DB 확인 필요 |
| 2026-09-16 | 클라이언트 문서 제목 | 코어 엔진 번들에 `document.title`/canonical 처리가 없음 | 템플릿 훅(`usePageMeta`)으로 페이지별 제목·설명·canonical 적용. canonical 은 현재 origin 기준 | `src/content/seo.ts`, `src/hooks/usePageMeta.ts` | 코어가 처리하게 되면 훅 제거 가능 |
| 2026-09-16 | 데모 스크린샷 분류 | 첨부 4장을 직접 열어 확인: 1장 UI 콜라주(1672x941), 3장 브랜드 로고·상품 사진(1254x1254) | `src/content/demos.ts` 에 첨부 id→성격 표를 두고 화면/브랜드·상품을 분리. 확인되지 않은 첨부는 화면으로 간주 | `src/content/demos.ts`, `SuperBifyDetail.tsx` | 관리자가 이미지를 바꾸면 표도 갱신 필요 |
| 2026-09-16 | 개인정보 보유 기간 | 승인된 운영 정책 문서를 찾지 못함 | 수집 항목·목적만 게시하고 **보유 기간은 게시하지 않음**. 배포 차단 항목으로 기록 | `InquiryForm.tsx` | 운영 정책 확인 필요 |

## 라우트 매핑

| 기존 경로 | 변경 후 경로 | 유지/추가/리디렉션 | 검증 |
|---|---|---|---|
| `/` | `/` | 유지 (구성 전면 변경) | 브라우저 200, 본문 확인 |
| — | `/services` | 추가 | 브라우저 200, 본문 확인 |
| — | `/services/website` | 추가 | 브라우저 200, 본문 확인 |
| — | `/services/commerce` | 추가 | 브라우저 200, 본문 확인 |
| — | `/services/web-development` | 추가 | 브라우저 200, 본문 확인 |
| — | `/process` | 추가 | 브라우저 200, 본문 확인 |
| `/portfolio` | `/portfolio` | 유지 | 브라우저 200, 본문 확인 |
| `/portfolio/:slug` | `/portfolio/:slug` | 유지 (`/portfolio/saas` 확인) | 브라우저 200, 본문 확인 |
| `/about` | `/about` | 유지 (구성 전면 변경) | 브라우저 200, 본문 확인 |
| `/inquiry` | `/inquiry` | 유지 (기능 활성화) | 브라우저 200, 실제 접수 201 |
| `/superbify` | `/superbify` | 유지 | 브라우저 200, 본문 확인 |
| `/superbify/:slug` | `/superbify/:slug` | 유지 | 브라우저 200 |

리디렉션은 필요하지 않았다 — 기존 경로를 모두 그대로 두었다.

## 콘텐츠 사실 출처

| 문구·주장 | 근거 | 확인 상태 | 노출 위치 |
|---|---|---|---|
| 20년 넘게 웹을 만들어왔습니다 / PHP 기반, 프로젝트별 Node.js·프런트엔드 | 기존 `AboutPage.tsx` 의 승인된 소개 문구 | 기존 사이트 게시 내용 | `/about`, 홈 경험 섹션 |
| 퓨어폴 SaaS — 제빙기 위생관리, 매장·계약·케어 일정·위생 데이터·리포트·안심 QR | 게시판 콘텐츠 메타 + 요약 | DB 실데이터 | `/portfolio/saas`, 홈 사례, 웹프로그램 상세 |
| 역할 `CTO` | 게시판 메타 `role` | DB 실데이터. 직함이며 담당 범위·단독 수행으로 확대 해석하지 않음 | 사례 상세(역할) |
| SuperBify 는 자체 개발 제품 | 게시판 분리 + 콘텐츠 | DB 실데이터 | `/superbify`, 홈 사례, 커머스 상세 |
| 고객사 납품 쇼핑몰 | **근거 없음** | 미확인 → 게시하지 않음 | — |
| 가격·납기·수정 횟수·무상 지원·응답 시간·조직 규모 | **근거 없음** | 미확인 → 게시하지 않음 | — |

## G7 코어·템플릿·확장 경계

- 수정한 것: `templates/_bundled/twentyft-studio/**`(SSoT), `_workspace/20ft/**`(검증 도구),
  `docs/implementation-notes/20ft-renewal/**`(기록), 런타임 사본은 **G7 공식 명령으로만** 갱신.
- 수정하지 않은 것: G7 코어(`app/`, `resources/`, `routes/`, `public/build/**`),
  `modules/twentyft-content/**`, 다른 템플릿.
- `twentyft-content` 는 조사만 하고 **변경하지 않았다** — 문의 유형은 기존 enum 안에서 매핑됐고,
  서버 계약을 바꿀 필요가 없었다.

## 기존 레이아웃 설정 호환 계획

- 동기화 전 11개 레이아웃은 모두 디스크와 동일했고 관리자 편집 이력이 없어, 덮어쓸 사용자 값이 없었다.
- 신규 5개는 추가이며 기존 이름을 바꾸거나 지우지 않았다.
- 기존 레이아웃에 없던 신규 섹션은 코드 기본값으로 렌더된다(레이아웃 JSON이 섹션 목록의 SSoT).
- 초기화·삭제로 해결하지 않았다. 되돌리려면 `_workspace/20ft/runtime-layouts-snapshot-pre-renewal.json` 사용.
