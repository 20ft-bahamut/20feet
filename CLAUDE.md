# 20ft Website / Gnuboard 7 — Project Constitution

이 저장소는 G7 원본 위에서 **20ft 공식 Website User Template**을 개발한다. 이 파일을 모든 작업에서 가장 먼저 따른다.

## 1. 절대 규칙

- **기존 G7 Core, G7 공식 Module/Plugin/Template, 공식 docs는 수정하지 않는다.** 읽고 참조만 한다.

### 1.1 COPY POLICY

20ft 브랜드 카피는 구현 대상이지 AI 창작 대상이 아니다.

사용자가 승인한 브랜드 문구와 페이지 카피를 임의로 재작성하거나 의역하지 않는다.
새 카피가 필요한 경우 자동 생성하지 않고 `COPY REQUIRED`로 사용자에게 요청한다.

특히 다음 LOCKED COPY를 변경하지 않는다:

- `작은 공간에서, 큰 가능성을 만듭니다.`
- `작은 공간에서 가능성을 만듭니다.`
- `A SMALL SPACE. INFINITE POSSIBILITIES.`
- `JUST FOR FUN.`
- `Software Studio`
- `Digital Garage`

다음 표현은 20ft 포지션과 맞지 않으므로 사용하지 않는다:

- `공간의 새로운 가능성을 디자인합니다`
- `브랜드 디자인 파트너`
- `공간의 가치를 발견하고 확장`
- `브랜드 · 공간 · 디지털` / `브랜드·공간·디지털`
- `작은 공간에서 계속 만듭니다`
- 20ft Template 개발 SSoT: `templates/_bundled/twentyft-studio/**`
- Active Runtime Copy(`templates/twentyft-studio/**`) 직접 편집 금지.
- `.env`, `.env.*`, `storage/logs/**` 읽기/출력 금지.
- Core 변경이 필요해 보이면 수정하지 말고 `BLOCKER` + 공식 확장 대안을 보고한다.
- 가짜 프로젝트/고객/수치/Screenshot/버전/가격/Download/GitHub/SIR 링크를 만들지 않는다.

### 1.1.1 COMMERCE TEMPLATE PARITY POLICY

SuperBify Commerce Template(`templates/_bundled/superbify-commerce_minimal`)은
sirsoft-ecommerce 기본 기능을 제거하거나 축소하지 않는다.

- Custom Template은 UI/UX를 변경할 수 있지만 Checkout/Cart/Product/Order의
  기능과 데이터 계약(form field name, payload, API, payment flow)은
  기본 Ecommerce Module·기본 sirsoft-basic Template과 동등하게 유지한다.
- 새 G7 Ecommerce 기능이 존재하면 가능한 한 재사용/노출한다.
  기능 축소(숨김/삭제/하드코딩 대체)는 금지하며, Presentation만 바꾼다.
- 기준 회귀: `_workspace/still-form/CHECKOUT_PARITY_MATRIX.md` +
  `templates/_bundled/superbify-commerce_minimal/__tests__/components/CheckoutParity.test.tsx`.

## 2. 현재 제품 범위

```text
HOME              /
PORTFOLIO         /portfolio → /portfolio/{slug}
SUPERBIFY         /superbify → /superbify/{slug}
PROJECT INQUIRY   /inquiry
```

- Top nav: `Portfolio / SuperBify / Project Inquiry`
- v1 독립 About/Services/Works/Contact 메뉴·페이지 없음. About은 Home 섹션.
- 상세 결정은 `20ftdocs/19_CURRENT_DECISIONS.md`가 우선한다.

## 3. Source of Truth

### G7 기술
1. `AGENTS.md`
2. 관련 `docs/**`
3. 현재 실제 구현 + 공식 `_bundled` 샘플

지원 여부/JSON Layout/props/actions/data binding/명령을 추측하지 않는다. 문서가 모호하면 실제 코드를 검증한다.

### 20ft 제품/디자인
1. 현재 사용자 요청
2. `20ftdocs/19_CURRENT_DECISIONS.md`
3. 루트 `20ft-website-summary.md`가 있으면 해당 문서
4. 관련 `20ftdocs/*.md`
5. `20ftdocs/15_ACCEPTANCE.md`

충돌 시 최신 사용자 결정/Current Decisions가 기존 v1.2 문서를 override한다. 원본 `20ftdocs`는 수정하지 않는다(19_CURRENT_DECISIONS만 사용자 요청 시 갱신 가능).

## 4. Context 규율

- 큰 Markdown을 메인 컨텍스트에 통째로 로드하지 않는다.
- 먼저 `.claude/reference/doc-map.md`로 필요한 문서만 고른다.
- `AGENTS.md`/`docs/**` 전체 읽기 금지: **Grep/Glob → 필요한 구간 Read → compact evidence**.
- 20ft 요구 조사: `twentyft-product-researcher`
- G7 기술 조사: `twentyft-gnuboard-researcher`
- 구조 결정: `twentyft-template-architect`
- 구현: `twentyft-template-engineer`
- 독립 QA: `twentyft-qa-reviewer`
- Runtime 검증: `twentyft-runtime-verifier`
- 긴 탐색 로그는 넘기지 말고 `경로 + 확인 규칙 + 적용 영향 + blocker`만 다음 단계에 전달한다.
- 지속 가치가 있는 compact note만 `_workspace/20ft/**`에 남긴다.

## 5. 기본 작업 흐름

일반 구현은 사용자가 `/twentyft-template <scope>`로 실행한다.

```text
제품/디자인 조사 ─┐
                  ├→ Architecture Gate → Implementation → Independent QA → Fix/QA loop
G7 기술 조사 ────┘
```

독립 조사는 병렬 가능. 구현은 Architecture Gate 이후. 새 Module/Plugin이 필요하다는 결론은 **USER APPROVAL REQUIRED**이며 승인 전에 생성하지 않는다.

## 6. 수정 경계

Claude 구현 작업의 직접 수정 허용:

- `templates/_bundled/twentyft-studio/**`
- `_workspace/20ft/**`
- 사용자 요청 시 `20ftdocs/19_CURRENT_DECISIONS.md`

그 외 기존 G7 파일은 읽기 전용으로 취급한다. 파일 수정 차단 Hook은 사용하지 않는다. Claude는 작업 전 `git status --short`, 작업 후 `git diff`를 확인하여 경계를 스스로 지킨다.

## 7. G7 / Runtime 품질

- 공식 Template 기능과 기존 G7 기능을 먼저 사용한다. 메뉴마다 새 Module을 만들지 않는다.
- `_bundled` source → 관련 test/typecheck/build → 독립 QA 순서.
- src/layout 변경 시 현재 G7 규칙에 맞는 component/layout test와 production dist 정책을 확인한다.
- 일반 구현에서 install/activate/update/`--force`를 실행하지 않는다.
- Runtime 변경은 사용자 명시 요청 후 `/twentyft-runtime-sync`에서만 검토한다.
- `git reset --hard`, `git clean`, `git add .` 금지.


## 8. 실패 / 재시도 규칙

- 동일한 Bash 명령 또는 동일한 Tool 동작이 같은 이유로 2회 실패하면 세 번째 자동 재시도를 하지 않는다.
- Permission/사용자 거부/Tool 오류와 build/test 실패를 구분한다.
- 실패 시 `FAILED COMMAND / FAILURE TYPE / LIKELY CAUSE / NEXT ACTION` 형식으로 보고하고 중단한다.
- QA 자동 수정 루프는 최대 1회만 허용한다. 같은 결함이 재현되면 사용자에게 보고한다.

## 9. 완료 보고

최소 보고:
- 변경 파일
- 적용한 20ft/G7 근거 경로
- build/typecheck/test 결과
- blocker/미검증 항목
- `IMPLEMENTATION COMPLETE / REVIEW PENDING`

구현 AI는 최종 Visual PASS를 스스로 선언하지 않는다. 최종 디자인 승인은 사용자 판단이다.
