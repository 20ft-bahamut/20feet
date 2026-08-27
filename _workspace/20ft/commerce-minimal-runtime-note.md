# SuperBify Commerce Minimal — Runtime Sync Note (2026-08-27)

## Runtime state
- Active user template: `superbify-commerce_minimal` v0.1.0
- `twentyft-studio` deactivated (복귀: `php artisan template:activate twentyft-studio`)
- Demo data: 7 categories + 8 products (Still Form, `ecommerce_products`/`ecommerce_categories`)
- Commits: `58a6d9f8` (v0.1.0) → `a20d9c90` (identifier rename) → `d78050bb` (runtime render fixes)

## Verified (Playwright headless, 127.0.0.1:8000)
- `/`, `/shop`, `/shop/product/{code}`, `/cart` — 모두 200, 0 4xx/5xx, 0 console error
- Cart flow: POST /cart/key 200 → GET /cart 200 (X-Cart-Key)
- Layout API: `/api/layouts/superbify-commerce_minimal/*.json` 200
- Asset: IIFE 43.38 kB data-URI 방식, CSS 200

## G7 pain points (기록용 — Core 개선 후보)
1. **Template dir name rule**: `TemplateManager::loadTemplates()` regex `^[a-z0-9]+-[a-z0-9_]+$` — 하이픈 1개만 허용( vendor 구분자). 템플릿 부분에 하이픈 쓰면 scan에서 **조용히 skip**되고 `template:activate`는 "템플릿을 찾을 수 없습니다"만 출력. 원인 파악까지 3단계 디버깅 필요했음. install은 성공했다고 나오므로 더 혼란.
2. **IIFE global name casing**: engine `getGlobalVariableName()` = `templateId.split(/[-_]/).map(ucfirst-lowercase-rest).join('')`. Vite `lib.name`이 이 파생값과 정확히 일치해야 함. 불일치 시 `BUNDLE_NOT_LOADED` + "초기화 실패" 화면. install/activate 단계에서 검증해주면 좋음.
3. **`template:refresh-layout`**: runtime dir(`templates/{id}/layouts`) 기준. `_bundled`에서 바로 갱신하려면 `template:update --source=bundled --force` 먼저.
4. **DB layout vs filesystem**: `template:update --force`가 DB layout을 재등록하지 않음 → JSON 변경 시 `template:refresh-layout` 별도 실행 필요.

## Image replacement guide
- 슬롯 매니페스트: `templates/_bundled/superbify-commerce_minimal/assets/images/manifest.json`
- 현재 placeholder SVG 25개. 실사진 교체 방법: 같은 슬롯 파일명으로 교체하거나(자동 data-URI 반영, 재빌드 필요) 상품 등록 시 admin에서 썸네일 업로드(thumbnail_url 우선 렌더).
- 빌드 후 반영: `npm run build` → `php artisan template:update superbify-commerce_minimal --source=bundled --force` → `php artisan template:refresh-layout superbify-commerce_minimal` → `php artisan template:cache-clear`

## 남은 작업
1. 이미지 실물 에셋 교체 (21슬롯)
2. 상품 상세 → 장바구니 담기 CTA (옵션 확정 후 G7 cart API 연결)
3. Checkout 상세 UI (후속 단계)
4. Visual 최종 승인 — 사용자