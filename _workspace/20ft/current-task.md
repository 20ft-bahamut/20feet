# 20ft Content Engine — Runtime Activated + Test Data Seeded

## Scope
- Portfolio public domain (`/portfolio`, `/portfolio/{slug}`)
- SuperBify public domain (`/superbify`, `/superbify/{slug}`)
- Project Inquiry backend (`/inquiry` UI는 live submit off)

## Module
- `modules/_bundled/twentyft-content/**` (identifier: `twentyft-content`)
- 설치/활성 완료: `php artisan module:install twentyft-content --force` / `php artisan module:activate twentyft-content`
- migration: `twentyft_post_meta` 테이블 생성 완료
- admin menu: `20ft 콘텐츠 → Portfolio / SuperBify / 프로젝트 문의`
- permissions: 15개 생성 완료

## Boards Created
- `portfolio` (id=1, type=gallery, file upload enabled)
- `superbify` (id=2, type=basic)
- `project-inquiry` (id=3, type=basic)

## Test Data Seeded
- Portfolio public × 2, private × 1
- SuperBify public × 1, private × 1
- Inquiry test submission × 1

## Verified API Endpoints
- `GET /api/modules/twentyft-content/portfolio/projects` ✓
- `GET /api/modules/twentyft-content/portfolio/projects/test-portfolio-api-1` ✓
- `GET /api/modules/twentyft-content/portfolio/projects?type=WEB` ✓
- `GET /api/modules/twentyft-content/superbify/projects` ✓
- `GET /api/modules/twentyft-content/superbify/projects/test-superbify-api` ✓
- `POST /api/modules/twentyft-content/inquiries` ✓ (privacy_consent=1)
- Private items correctly excluded ✓

## Frontend Runtime
- `npm run build` ✓
- `npm run type-check` ✓
- `npm test` 52 passed ✓
- `php artisan template:update twentyft-studio --source=bundled --force` ✓
- `php artisan template:cache-clear` / `cache:clear` / `view:clear` / `route:clear` ✓
- `php artisan module:update twentyft-content --force` ✓
- `php artisan module:cache-clear` ✓

## Browser Verification (Playwright headless)
- `/portfolio` → Portfolio list with 2 public items renders ✓
- `/portfolio/test-portfolio-api-1` → Portfolio detail (Role, Tech, Status, Project Story) renders ✓
- `/superbify` → SuperBify list with public item renders ✓
- `/superbify/test-superbify-api` → SuperBify detail (Module/Release, Compatibility, Overview) renders ✓
- `/` → Home hero + Selected Portfolio preview + SuperBify preview renders ✓

## Remaining user dependencies
1. Replace placeholder `[TEST]` posts with real Portfolio projects + screenshots
2. Replace placeholder `[TEST]` SuperBify items with real products
3. Finalize privacy/consent copy before enabling Inquiry live submit on frontend
4. Browser QA / design final approval

## Notes
- Module identifier changed from invalid `20ft-content` to valid `twentyft-content`
- Module namespace changed from `Modules\_20ft\Content` to `Modules\Twentyft\Content`
- Route slug regex fixed from delimited `/.../` to pattern-only `^[a-z][a-z0-9-]*$`
- Migration index on JSON `value` column removed for MySQL compatibility
- Public API DTO keys aligned to component camelCase props (`coverImageUrl`, `clientName`, `techStack`, `relatedUrl`, `galleryImageUrls`, `screenshotImageUrls`)
