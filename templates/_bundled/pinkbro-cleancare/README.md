# PinkBro CleanCare (pinkbro-cleancare)

핑크브로클린케어 랜딩 페이지를 렌더링하는 Gnuboard 7 **사용자 템플릿**(`type: user`).

- 식별자: `pinkbro-cleancare` · vendor: `pinkbro` · 버전: `0.1.0`
- 현재 상태: 골격(basic 컴포넌트 `Div` 1종) + 빌드/테스트 규격. 섹션 컴포넌트와 레이아웃은 후속 작업에서 추가된다.
- 페이지 카피는 이 템플릿에 하드코딩하지 않는다. 콘텐츠는 모듈 `pinkbro-contents` API 가 공급한다.

## 의존성

`template.json` 의 모듈 의존:

| 모듈 | 최소 버전 | 용도 |
|---|---|---|
| `pinkbro-contents` | `>=0.1.0` | 랜딩 콘텐츠(서비스·패키지·사례·FAQ·문의) 공개 API |
| `sirsoft-board` | `>=1.0.0` | 문의 접수 게시판 |

## 빌드 / 테스트

**모든 npm·vite 명령은 이 템플릿 디렉토리 안에서 실행한다.** (저장소 루트에서 빌드하면 G7 코어의 `public/build/core/*.min.js` 산출물이 지워진다.)

```bash
cd templates/_bundled/pinkbro-cleancare
npm install
G7_BUILD_SOURCEMAP=0 npx vite build   # 배포 빌드 — 소스맵 없음
npx vitest run                        # 테스트 (규격: happy-dom + src/test-setup.ts)
npm run type-check                    # tsc --noEmit
```

`G7_BUILD_SOURCEMAP` 미설정 시 소스맵을 생성한다(로컬 디버깅용).

## 산출물 계약

| 산출물 | 소비처 |
|---|---|
| `dist/js/components.iife.js` | 템플릿 컴포넌트 IIFE 번들 (`assets.js`) |
| `dist/css/components.css` | `resources/views/app.blade.php` 가 활성 사용자 템플릿에 대해 **무조건** 링크 |

`src/index.ts` 의 `import './styles/design-tokens.css'` 가 이 CSS 산출물을 만든다. 이 import 를 지우면 CSS 파일이 생성되지 않아 모든 페이지에서 404 가 난다.

## 구조

```
pinkbro-cleancare/
├── template.json          # 템플릿 매니페스트 (dependencies/assets/components/error_config)
├── routes.json            # 라우트 정의 (현재 `/` 1건)
├── components.json        # 컴포넌트 레지스트리 매니페스트
├── vite.config.ts         # lib iife 빌드 · external react 3종 · asset 경로 분기
├── vitest.config.ts       # happy-dom + 템플릿 로컬 setup (코어 경로 의존 없음)
├── lang/{ko,en}.json      # UI 메타 문자열 (브랜드 카피 아님)
└── src/
    ├── index.ts           # CSS import · export · ComponentRegistry 자동 등록
    ├── test-setup.ts      # @testing-library/jest-dom
    ├── styles/design-tokens.css
    └── components/basic/Div.tsx
```

## 컴포넌트 등록 규칙

`components.json` 항목의 `name`, 레이아웃 노드의 `name`, `src/index.ts` 의 `registry.register({ metadata: { name } })` 값이 **같은 문자열**이어야 한다. 불일치하면 레지스트리가 경고만 남기고 건너뛰어 컴포넌트가 화면에서 조용히 사라진다.

## 디자인 토큰

`src/styles/design-tokens.css` 가 유일한 스타일 출처다. 모든 커스텀 프로퍼티는 `--pb-` 접두사를 쓴다. 폰트는 Google Fonts CDN `@import` 로 로드하므로 번들 폰트 파일이 없다(`assets.fonts` 는 빈 배열).
