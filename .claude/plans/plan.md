# Plan: 20ft Content 전용 관리자 UI (Method 2)

## 1. 현재 상황

- **Method 1 완료**: `/admin/board/portfolio|superbify|project-inquiry` 접근 가능
  - 원인: 프로그램 생성된 board에 `BoardPermissionService::ensureBoardPermissions()` 미호출로 동적 권한 부재
  - 조치: `TwentyftContentSeeder` 추가 → board 존재 시 권한 보장, 부재 시 `BoardService::createBoard()` 생성
  - 검증: `test@test.com` / `qwer1234` 계정으로 `/admin/board/superbify` 정상 접근 및 게시글 목록 확인

- **Method 2 목표**: G7 board admin에 의존하지 않는 20ft Content 전용 관리자 UI 추가
  - 진입점: `/admin/20ft-content`
  - 섹션: `/admin/20ft-content/portfolio`, `/admin/20ft-content/superbify`, `/admin/20ft-content/inquiries`

## 2. 범위 및 원칙

- G7 Core 미수정.
- `modules/_bundled/twentyft-content/**` 내부에서만 작업.
- 복잡한 게시글 작성/수정 폼은 이미 검증된 G7 board admin(`/admin/board/{slug}/create`, `/admin/board/{slug}/{id}/edit`)에 위임.
- 전용 UI는 **목록 조회 + 핵심 메타 노출 + 상태 변경 + board admin으로의 링크**에 집중.
- `twentyft-content.*` 권한과 연동.

## 3. IA 및 라우트

```text
/admin/20ft-content                      ← 20ft Content 대시보드 (3개 섹션 카드)
/admin/20ft-content/portfolio            ← Portfolio 전용 목록
/admin/20ft-content/superbify            ← SuperBify 전용 목록
/admin/20ft-content/inquiries            ← 프로젝트 문의 전용 목록
```

- 기존 `/admin/board/*`는 그대로 유지 (Method 1).
- `module.php`의 admin menu URL을 위 전용 경로로 변경.

## 4. 생성/변경 파일

### 새 파일
- `modules/_bundled/twentyft-content/src/Http/Controllers/Api/Admin/PortfolioAdminController.php`
- `modules/_bundled/twentyft-content/src/Http/Controllers/Api/Admin/SuperBifyAdminController.php`
- `modules/_bundled/twentyft-content/src/Http/Controllers/Api/Admin/InquiryAdminController.php`
- `modules/_bundled/twentyft-content/src/Http/Resources/PortfolioAdminListResource.php`
- `modules/_bundled/twentyft-content/src/Http/Resources/SuperBifyAdminListResource.php`
- `modules/_bundled/twentyft-content/src/Http/Resources/InquiryAdminListResource.php`
- `modules/_bundled/twentyft-content/src/routes/admin.php`
- `modules/_bundled/twentyft-content/resources/routes/admin.json`
- `modules/_bundled/twentyft-content/resources/layouts/admin/admin_20ft_content_dashboard.json`
- `modules/_bundled/twentyft-content/resources/layouts/admin/admin_portfolio_index.json`
- `modules/_bundled/twentyft-content/resources/layouts/admin/admin_superbify_index.json`
- `modules/_bundled/twentyft-content/resources/layouts/admin/admin_inquiry_index.json`
- `modules/_bundled/twentyft-content/resources/lang/ko.json`
- `modules/_bundled/twentyft-content/resources/lang/en.json`

### 수정 파일
- `modules/_bundled/twentyft-content/module.php`
  - `getAdminMenus()` URL을 전용 경로로 변경
  - `getConfig()` 또는 ServiceProvider에 admin routes 등록
- `modules/_bundled/twentyft-content/src/Providers/ContentServiceProvider.php`
  - admin route boot 추가 (존재 시)
- `modules/_bundled/twentyft-content/module.json`
  - version bump

## 5. Admin API 설계

### Portfolio
- `GET /api/modules/twentyft-content/admin/portfolio`
  - param: `page`, `per_page`, `status`, `type`, `keyword`
  - 응답: 게시글 목록 + 메타(slug, title, year, types, status, is_featured, created_at, cover_image_url)
- `PATCH /api/modules/twentyft-content/admin/portfolio/{post_id}/status`
  - body: `status`

### SuperBify
- `GET /api/modules/twentyft-content/admin/superbify`
  - param: `page`, `per_page`, `status`, `type`, `keyword`
  - 응답: 게시글 목록 + 메타(slug, title, year, type, status, is_featured, created_at, cover_image_url)
- `PATCH /api/modules/twentyft-content/admin/superbify/{post_id}/status`

### Inquiry
- `GET /api/modules/twentyft-content/admin/inquiries`
  - param: `page`, `per_page`, `status`, `project_type`, `keyword`
  - 응답: 문의 목록 + 메타(contact_name, contact_email, contact_company, project_type, budget_range, status, created_at)
- `PATCH /api/modules/twentyft-content/admin/inquiries/{post_id}/status`

### 공통
- 권한 middleware: `permission:admin,twentyft-content.{domain}.{action}`
- 존재하지 않는 post_id → 404
- status enum validation

## 6. Admin Layout 설계

### Dashboard (`admin_20ft_content_dashboard`)
- 3개 카드 (Portfolio / SuperBify / 프로젝트 문의)
- 각 카드에:
  - 총 게시글 수
  - 최근 N일 신규/변경 수
  - "관리하기" 버튼 → 해당 섹션 이동

### Portfolio / SuperBify / Inquiry Index
- `PageHeader` + "Board Admin에서 관리" 링크
- `DataGrid`로 목록 표시
- 컬럼:
  - Portfolio: 제목, slug, year, types, status, featured, 작성일
  - SuperBify: 제목, slug, year, type, status, featured, 작성일
  - Inquiry: 문의자, 회사, project_type, budget_range, status, 작성일
- 행 클릭: 상세 보기 모달 또는 `/admin/board/{slug}/{post_id}`로 이동
- 상태 변경: 행 내 Select + 저장 버튼
- "새로 만들기" 버튼: `/admin/board/{slug}/create`로 이동

## 7. 언어 리소스

`resources/lang/ko.json` / `en.json`에 추가:
- `admin.dashboard.title`
- `admin.portfolio.title`, `admin.portfolio.description`
- `admin.superbify.title`, `admin.superbify.description`
- `admin.inquiries.title`, `admin.inquiries.description`
- `admin.fields.status`, `admin.fields.type`, `admin.fields.year`, `admin.actions.manage_in_board`

## 8. 권한 연동

- Layout `permissions` 배열에 `twentyft-content.portfolio.read` 등 사용.
- Route `meta.permission`에 동일 권한 사용.
- API route middleware에 `permission:admin,twentyft-content.{domain}.read` / `.update` 적용.

## 9. 검증 파이프라인

1. `composer dump-autoload`
2. `php artisan module:update twentyft-content --source=bundled --force`
3. `php artisan module:seed twentyft-content --force` (기존 board/권한 유지, 샘플은 skip)
4. Playwright Chromium:
   - `/admin/login` → `/admin/20ft-content` 대시보드 접근
   - `/admin/20ft-content/portfolio` 목록 로드
   - `/admin/20ft-content/superbify` 목록 로드
   - `/admin/20ft-content/inquiries` 목록 로드
   - 각 섹션 "Board Admin에서 관리" 링크가 `/admin/board/{slug}`로 연결되는지 확인

## 10. 완료 조건

- `/admin/20ft-content` 접속 시 3개 섹션 카드 노출
- 각 섹션 전용 목록 페이지 정상 렌더링
- DataGrid에 실제 게시글/문의 데이터 표시
- 상태 변경 API 호출 후 반영
- "Board Admin에서 관리" 링크로 기존 board admin 접근 가능
- build/typecheck/test 통과
- 최종 상태: `IMPLEMENTATION COMPLETE / REVIEW PENDING`
