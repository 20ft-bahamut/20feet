# 20ft Content Engine — Implementation Plan

> Approved scope: single lightweight internal module `20ft-content`.
> Goal: Board + Meta + Admin UI + Public API bridge only.

## 1. Module Identity

- **Path**: `modules/_bundled/20ft/twentyft-content/`
- **Identifier**: `20ft-content`
- **Vendor**: `20ft`
- **Namespace**: `Modules\_20ft\Content\` (PSR-4)
- **Visibility**: internal module (`module.json` hidden or internal flag as supported by G7)
- **Dependencies**: `sirsoft-board` (for board post storage)

## 2. Database Schema

### `twentyft_post_meta`

Structured metadata for Portfolio/SuperBify/Inquiry posts.

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigIncrements | PK |
| `board_id` | unsignedBigInteger | G7 board id (partition key) |
| `post_id` | unsignedBigInteger | G7 board_posts id |
| `domain` | string(32) | `portfolio` / `superbify` / `inquiry` |
| `key` | string(64) | meta key, namespaced |
| `value` | json/nullable | stored as JSON for arrays/objects |
| `created_at` / `updated_at` | timestamps | |

Unique composite: `[board_id, post_id, domain, key]`.

Index: `(domain, key, value)` for filtering (e.g. `featured=true`).

### Why this shape

- One board post = one portfolio/superbify/inquiry record.
- Body stays in `board_posts`.
- Structured fields live in `twentyft_post_meta` rows (EAV-style but lightweight).

## 3. Domain Data Mapping

### Portfolio

Board slug: `portfolio`
Meta keys (prefix `portfolio.`):

- `slug` — public URL slug (mirrors board post title/slug mapping)
- `summary` — list/home short description
- `year` — project year
- `types` — JSON array of `WEB`, `COMMERCE`, `SOFTWARE`, `OPEN_SOURCE`
- `status` — `BUILDING`, `OPERATING`, `RELEASED`, `RESEARCH`, `ARCHIVED`
- `visibility` — `PUBLIC`, `PRIVATE`
- `is_featured` — boolean
- `sort_order` — integer
- `client_name` — string
- `role` — JSON array
- `tech_stack` — JSON array
- `related_url` — string
- `cover_image_attachment_id` — bigint
- `gallery_attachment_ids` — JSON array

### SuperBify

Board slug: `superbify`
Meta keys (prefix `superbify.`):

- `slug`
- `summary`
- `type` — `MODULE`, `PLUGIN`, `TEMPLATE`, `INTEGRATION`, `DEVELOPER_TOOL`, `OPEN_SOURCE`
- `status` — `IDEA`, `RESEARCH`, `BUILDING`, `RELEASED`, `MAINTENANCE`, `ARCHIVED`
- `visibility`
- `is_featured`
- `sort_order`
- `version`
- `g7_compatibility`
- `license`
- `github_url`, `sir_url`, `docs_url`, `release_url`, `demo_url`
- `cover_image_attachment_id`
- `screenshot_attachment_ids`

### Inquiry

Board slug: `project-inquiry`
Meta keys (prefix `inquiry.`):

- `name`
- `email`
- `phone`
- `company`
- `project_type`
- `current_site_url`
- `budget_range`
- `desired_schedule`
- `reference_url`
- `privacy_consent` — boolean
- `internal_status` — `NEW`, `REVIEWING`, `REPLIED`, `MEETING`, `ESTIMATING`, `CLOSED`
- `submitted_ip` — stored server-side, never exposed

Board post title auto-generated:

```text
[웹서비스] 홍길동 - 2026-08-25
[웹서비스] ABC Corp / 홍길동 - 2026-08-25
```

## 4. Public API Endpoints

Prefix: `api/modules/20ft-content/`

### Portfolio

- `GET /portfolio/projects`
  - query: `page`, `per_page`, `featured` (0/1), `type`, `status`
  - returns: public DTO list (no PRIVATE, no internal IDs)
- `GET /portfolio/projects/{slug}`
  - returns: public detail DTO with body, gallery URLs

### SuperBify

- `GET /superbify/projects`
  - query: `page`, `per_page`, `featured`, `type`, `status`
- `GET /superbify/projects/{slug}`

### Inquiry (backend-ready, disabled in UI)

- `POST /inquiries`
  - accepts inquiry form payload
  - validates via FormRequest
  - creates board post in `project-inquiry` board
  - stores meta
  - returns success message
  - rate limited, CSRF protected via G7 defaults

## 5. Admin Structure

### Menus (from `module.php`)

```text
20ft 콘텐츠
├ Portfolio
├ SuperBify
└ 프로젝트 문의
```

### Admin UI Approach

Phase 1: Use G7 board admin for post list/read/create/delete; provide custom **meta input panel** via admin layout extension or plugin page.

- Portfolio/SuperBify: link from admin menu to a custom admin page that loads the board post list with a meta editor side panel.
- Inquiry: custom admin list showing inquiry-specific columns (name, company, project type, budget, status, registered date).

If admin layout extension proves insufficient, fallback to dedicated admin controller + layout JSON within the module.

## 6. Frontend Changes (templates/_bundled/twentyft-studio)

### Types (`src/types/template.d.ts`)

Extend `PortfolioItem` and `SuperBifyItem` to include all v1 fields:

- PortfolioItem: `id`, `slug`, `title`, `summary`, `description/body`, `types`, `year`, `status`, `visibility`, `featured`, `coverImageUrl`, `galleryUrls`, `clientName`, `role`, `techStack`, `relatedUrl`, `isFixture?`
- SuperBifyItem: `id`, `slug`, `title`, `type`, `summary`, `description/body`, `status`, `version`, `compatibility`, `license`, `links`, `coverImageUrl`, `screenshotUrls`, `isFixture?`

### Data Sources in Layouts

Update layout JSONs to use `type: "api"`:

- `layouts/home.json`
  - `SelectedPortfolio`: `GET 20ft-content/portfolio/projects?featured=1&per_page=3`
  - `SuperBifyPreview`: `GET 20ft-content/superbify/projects?featured=1&per_page=3`
  - **Remove `useFixtures: true` props.**
- `layouts/portfolio/index.json`
  - `GET 20ft-content/portfolio/projects`
- `layouts/portfolio/detail.json`
  - `GET 20ft-content/portfolio/projects/{slug}` with `{{route.slug}}`
- `layouts/superbify/index.json`
  - `GET 20ft-content/superbify/projects`
- `layouts/superbify/detail.json`
  - `GET 20ft-content/superbify/projects/{slug}`

### Component Updates

- `SelectedPortfolio.tsx`: use real items, fix detail link to `/portfolio/${item.slug}`, remove fixture fallback in production.
- `SuperBifyPreview.tsx`: use real items, remove fixture fallback.
- `PortfolioList.tsx`: use real items, keep empty state.
- `PortfolioDetail.tsx`: render full detail fields (cover, gallery, role, tech stack, related URL).
- `SuperBifyList.tsx`: render type/status tags.
- `SuperBifyDetail.tsx`: render full detail fields (compatibility, installation, usage, changelog, links conditionally).
- `InquiryForm.tsx`: keep disabled/coming-soon UI, but add a TODO comment pointing to the ready backend endpoint.

## 7. Fixture Policy

- `useFixtures: true` removed from `home.json`.
- Fixtures remain in source as design-only helpers but are never auto-rendered in production.
- Empty state takes precedence when no public data exists.

## 8. Validation & Security

- All query params use allow-list validation.
- Slug format validation: `/^[a-z][a-z0-9-]*$/`.
- `visibility=PRIVATE` never returned by public API.
- Inquiry endpoint uses G7 CSRF/rate-limit/spam protection.
- No raw internal IDs, file paths, or admin info exposed.

## 9. Build & QA

Per `templates/_bundled/twentyft-studio/package.json`:

```bash
cd /home/bahamut/20feet/templates/_bundled/twentyft-studio
npm run type-check
npm run test:run
npm run build
```

Module side (no npm):

- PHP syntax check on module files.
- Verify route names use `name()`.
- Verify migrations are reversible.

## 10. Implementation Order

1. Create module skeleton: `module.json`, `composer.json`, `module.php`, ServiceProvider.
2. Migration: `twentyft_post_meta`.
3. Domain models + repository + meta helper.
4. Public API controllers + FormRequests + resources for Portfolio.
5. Public API controllers for SuperBify.
6. Inquiry backend controller (private board write).
7. Admin menu + minimal admin list pages.
8. Frontend type extensions + component updates.
9. Layout JSON data source updates.
10. Remove `useFixtures`, fix `SelectedPortfolio` link.
11. Type-check, tests, build.
12. QA: PRIVATE leak check, responsive check.

## 11. Remaining User Dependencies

- Real portfolio screenshots/images must be uploaded by user.
- Real SuperBify product versions/links must be provided by user.
- Privacy/consent copy for Inquiry live submission.
- Admin meta input UI final approval after first draft.

## 12. Non-Goals (Explicitly Excluded)

- No G7 Core changes.
- No active runtime template (`templates/twentyft-studio/**`) direct edits.
- No fake data.
- No estimate/quote/contract/payment/invoice features.
- No CRM/lead pipeline.
- No generic CMS for other domains.
