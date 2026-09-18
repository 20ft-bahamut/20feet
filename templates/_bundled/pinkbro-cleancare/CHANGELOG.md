# Changelog

이 프로젝트의 모든 주요 변경사항을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며,
[Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [0.1.0] - 2026-09-18

### Added

- 핑크브로클린케어 랜딩 페이지 사용자 템플릿 (`pinkbro-cleancare`) 신규 생성
- `template.json` — `type: user`, 모듈 의존 `pinkbro-contents >=0.1.0` / `sirsoft-board >=1.0.0`,
  `assets.css`/`assets.js` 등록, 에러 레이아웃 6종 키(401/403/404/500/503/maintenance)
- `routes.json` — `/` 라우트 1건 (`home` 레이아웃)
- `components.json` — Basic `Div` 1종 등록
- `src/index.ts` — `design-tokens.css` import + `Div` export + ComponentRegistry 자동 등록(warn 폴백)
- `src/styles/design-tokens.css` — Google Fonts CDN `@import`(Manrope / Noto Sans KR) + `--pb-*` 토큰
- `src/components/basic/Div.tsx` — forwardRef 기반 HTML wrapper
- 빌드 규격 — lib IIFE(`dist/js/components.iife.js`) + `dist/css/components.css`, external react 3종,
  `G7_BUILD_SOURCEMAP` 로 소스맵 제어
- 테스트 규격 — `vitest` + happy-dom + 템플릿 로컬 `src/test-setup.ts` (코어 경로 의존 없음)
- 다국어 지원 (ko/en)
