# 20ft Context Routing Map

목적: 매 작업마다 모든 Markdown을 읽지 않고, 필요한 문서만 선택한다.

## Always

메인 세션은 다음만 항상 알고 있으면 된다.

- `CLAUDE.md`
- `20ftdocs/19_CURRENT_DECISIONS.md`

루트에 `20ft-website-summary.md`가 있으면 제품 전체 방향을 재확인할 때만 읽는다.

## 20ft Product / Design Routes

### Home
- `20ftdocs/03_DESIGN_SYSTEM.md`
- `20ftdocs/04_CONTENT.md`
- `20ftdocs/05_HOME.md`
- `20ftdocs/10_COMPONENTS.md`
- `20ftdocs/13_RESPONSIVE_ACCESSIBILITY_SEO.md`
- `20ftdocs/15_ACCEPTANCE.md` 중 Home/Brand/Typography/G7 Safety/Runtime QA
- `20ftdocs/17_ASSETS.md`
- Home의 `ABOUT 20FT` 카피/Founder 맥락을 실제로 수정할 때만 `20ftdocs/08_ABOUT.md`

### Portfolio
- `20ftdocs/06_PORTFOLIO.md`
- `20ftdocs/11_DATA_MODELS.md`
- `20ftdocs/03_DESIGN_SYSTEM.md`
- `20ftdocs/10_COMPONENTS.md`
- `20ftdocs/13_RESPONSIVE_ACCESSIBILITY_SEO.md`
- `20ftdocs/15_ACCEPTANCE.md` 중 Portfolio/G7 Safety

### SuperBify
- `20ftdocs/07_SUPERBIFY.md`
- `20ftdocs/11_DATA_MODELS.md`
- `20ftdocs/03_DESIGN_SYSTEM.md`
- `20ftdocs/10_COMPONENTS.md`
- `20ftdocs/13_RESPONSIVE_ACCESSIBILITY_SEO.md`
- `20ftdocs/15_ACCEPTANCE.md` 중 SuperBify/G7 Safety
- 반드시 `20ftdocs/19_CURRENT_DECISIONS.md`의 타입 Override 확인

### Project Inquiry
- `20ftdocs/09_PROJECT_INQUIRY.md`
- `20ftdocs/11_DATA_MODELS.md`
- `20ftdocs/03_DESIGN_SYSTEM.md`
- `20ftdocs/13_RESPONSIVE_ACCESSIBILITY_SEO.md`
- `20ftdocs/15_ACCEPTANCE.md` 중 Inquiry/G7 Safety

### Brand / Copy
- `20ftdocs/02_BRAND.md`
- `20ftdocs/03_DESIGN_SYSTEM.md`
- `20ftdocs/04_CONTENT.md`
- `20ftdocs/17_ASSETS.md`

### Release / Runtime
- `20ftdocs/00_AI_HARNESS.md`
- `20ftdocs/12_G7_TEMPLATE_RULES.md`
- `20ftdocs/14_IMPLEMENTATION_PLAN.md`
- `20ftdocs/15_ACCEPTANCE.md`
- `20ftdocs/18_RELEASE_NOTES.md`

## G7 Technical Routes

G7 문서는 `twentyft-gnuboard-researcher`가 먼저 Grep/Glob으로 필요한 문서만 찾고 해당 부분만 읽는다.

### User Template scaffold / manifest / route
- `docs/ai-tools/skills/create-template.md`
- `docs/extension/template-basics.md`
- `docs/extension/template-routing.md`
- `docs/extension/template-workflow.md`
- `docs/frontend/template-development.md`
- `templates/_bundled/gnuboard7-hello_user_template/**`
- 필요 시 `templates/_bundled/sirsoft-basic/**`

### Layout JSON / component
- `AGENTS.md`의 `레이아웃 JSON 구현 규칙`, `프론트엔드/템플릿 시스템`
- `docs/frontend/layout-json.md`
- `docs/frontend/layout-json-components*.md`
- `docs/frontend/layout-json-features*.md`
- `docs/frontend/components.md`
- `docs/frontend/component-props.md`
- `docs/frontend/component-props-composite.md`
- `docs/frontend/layout-testing.md`

### Data source / API binding
- `docs/frontend/data-sources.md`
- `docs/frontend/data-sources-advanced.md`
- `docs/frontend/data-binding.md`
- `docs/frontend/data-binding-i18n.md`
- 관련 실제 API 문서 (`docs/backend/api/**`)
- 공식 유사 layout JSON

### Navigation / actions
- `docs/frontend/actions.md`
- `docs/frontend/actions-handlers-navigation.md`
- `docs/frontend/g7core-api.md`
- `docs/extension/menus.md` (메뉴 연동이 필요할 때만)

### Security
- `docs/extension/template-security.md`
- `docs/frontend/security.md`
- Form/API가 있다면 관련 backend validation/auth/security 문서

### Build / test / update
- `AGENTS.md`의 테스트 프로토콜, npm install 규칙, 빌드 vs 확장 업데이트
- `docs/testing-guide.md`
- `docs/frontend/layout-testing.md`
- `docs/extension/template-commands.md`
- `docs/extension/template-workflow.md`

## Research Output Contract

연구 에이전트는 원문을 길게 붙이지 말고 아래만 반환한다.

```text
SCOPE
VERIFIED RULES
- rule — source path/heading
OFFICIAL PATTERNS
- pattern — sample path
COMMANDS / TESTS
CONFLICTS
UNKNOWNS / BLOCKERS
```

확인되지 않은 것을 “가능하다”고 쓰지 않는다.
