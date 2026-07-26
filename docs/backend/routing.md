# 라우트 네이밍 및 경로

> **상위 문서**: [백엔드 가이드 인덱스](./index.md)

---

## TL;DR (5초 요약)

```text
1. 모든 라우트는 name() 필수: ->name('api.users.index')
2. 접두사: api.*, web.*, vendor-module.*
3. URL: /api/admin/*, /api/auth/*, /api/public/*
4. 권한: permission: 또는 Middleware에서 체크
5. REST 패턴: index, store, show, update, destroy
6. .js/.css/.json/.map 로 끝나는 라우트 = dualSuffix/dualSuffixSegment/dualAsset 매크로 필수
```

---

## 목차

1. [라우트 이름 규칙](#라우트-이름-규칙)
2. [URL 경로 규칙](#url-경로-규칙)
3. [권한 체크](#권한-체크)
4. [라우트 정의 예시](#라우트-정의-예시)
5. [개발 체크리스트](#개발-체크리스트)

---

## 라우트 이름 규칙

### 필수 원칙

- **모든 라우트는 `name` 필수**
- 일관된 네이밍 컨벤션 준수

### 접두사 규칙

| 타입 | 접두사 | 예시 |
|------|--------|------|
| API | `api.` | `api.users.index` |
| WEB | `web.` | `web.dashboard` |
| 모듈 | `[vendor-module].` | `sirsoft-ecommerce.products.index` |
| 플러그인 | `[vendor-plugin].` | `sirsoft-payment.settings` |

### 조합 규칙

```php
// 코어 API
->name('api.users.index')
->name('api.users.store')

// 모듈 API
->name('api.sirsoft-ecommerce.products.index')
->name('api.sirsoft-ecommerce.products.store')

// 플러그인 API
->name('api.sirsoft-payment.transactions.index')
```

---

## URL 경로 규칙

### 경로 패턴

| 타입 | 패턴 | 예시 |
|------|------|------|
| 코어 | `/admin/[기능명]` | `/admin/users` |
| 모듈 | `/admin/[vendor-module]/[기능명]` | `/admin/sirsoft-ecommerce/products` |
| 플러그인 | `/admin/[vendor-plugin]/[기능명]` | `/admin/sirsoft-payment/settings` |
| 모듈 공개 API | `/api/modules/[vendor-module]/[기능명]` | `/api/modules/sirsoft-ecommerce/products` |
| 플러그인 공개 API | `/api/plugins/[vendor-plugin]/[기능명]` | `/api/plugins/sirsoft-gdpr/consent` |

### 리소스 URL 규칙

```text
# 목록 조회
GET /admin/sirsoft-ecommerce/products

# 단일 조회
GET /admin/sirsoft-ecommerce/products/{id}

# 생성
POST /admin/sirsoft-ecommerce/products

# 수정
PUT /admin/sirsoft-ecommerce/products/{id}

# 삭제
DELETE /admin/sirsoft-ecommerce/products/{id}
```

### 라이선스 API 라우트

코어 및 확장의 LICENSE 파일 내용을 반환하는 API 엔드포인트입니다.

```text
GET /api/admin/license                          # 코어 LICENSE 반환
GET /api/admin/modules/{identifier}/license     # 모듈 LICENSE 반환
GET /api/admin/plugins/{identifier}/license     # 플러그인 LICENSE 반환
GET /api/admin/templates/{identifier}/license   # 템플릿 LICENSE 반환
```

### 정적 확장자로 끝나는 동적 엔드포인트

`.js` / `.css` / `.json` / `.map` 으로 끝나는 라우트는 `Route::get()` 으로 단일 등록하지 않는다.
`Route::dualSuffix()` / `dualSuffixSegment()` / `dualAsset()` 매크로로 **확장자 형태와 확장자 없는 형태를
동시에** 등록한다. 코어 라우트와 확장 라우트 파일 모두에 적용된다.

nginx/Apache 의 표준적 정적 최적화 블록은 URL 마지막 확장자로 분기하며, nginx 에서 정규식 location 은
프리픽스 location 보다 먼저 매칭된다. 그래서 `try_files ... /index.php` 폴백이 실행될 기회 없이 nginx 가
직접 파일시스템을 열려 시도해 404 가 된다. aaPanel / CyberPanel / Plesk 기본 템플릿에 들어있는 블록이라
드물지 않으며, 그런 서버에서는 해당 엔드포인트가 통째로 죽는다.

```nginx
location ~* \.(js|css|json)$ { expires max; access_log off; }
```

```php
// 잘못된 등록 — 확장자 없는 형태가 생기지 않는다
Route::get('{identifier}/routes.json', [Ctrl::class, 'getRoutes'])->name('...');

// 접미사 제거형 — routes.json + routes
Route::dualSuffix('{identifier}/routes', 'json', [Ctrl::class, 'getRoutes'])
    ->name('api.public.templates.routes');

// 세그먼트 강등형 — 접미사가 종류를 구분해 제거 불가 (bundle.js + bundle/js)
Route::dualSuffixSegment('bundle', 'js', [Ctrl::class, 'serveBundleJs'])
    ->name('api.public.modules.bundle.js');

// 쿼리 이동형 — 경로가 곧 파일명 (assets/{id}/js/a.js + assets/{id}?file=js/a.js)
Route::dualAsset('assets/{identifier}', [Ctrl::class, 'serveAsset'])
    ->name('api.public.templates.assets');
```

매크로가 반환하는 프록시는 `name()` 을 양쪽에 적용하며(확장자 없는 쪽은 `.extensionless` 접미사),
`middleware()` 등 나머지 호출도 두 라우트에 함께 전달한다. 한쪽에만 걸리는 가드가 생기지 않는다.

URL 을 만드는 쪽도 문자열로 직접 조립하지 않는다. 서버는 `App\Support\AssetUrl`, 프론트엔드는
`resources/js/core/support/assetUrl.ts` 를 경유해야 현재 모드에 맞는 형태가 나온다. 두 구현은 동일 규칙을
공유하므로 한쪽만 바꾸면 서버가 만든 URL 과 클라이언트가 만든 URL 이 어긋나 그 자산만 404 가 된다.

자동 차단: 정적 검사 대상 (위반 시 차단). 면제는 인라인 주석
`// audit:allow dynamic-route-static-extension reason: ...`.

두 형태는 모두 영구 유지한다 — 확장자 형태를 제거하면 URL 을 하드코딩한 서드파티 확장이 깨진다.
엔드포인트별 변환 규칙 표와 프로브 판정 절차: [API 레퍼런스 진입점](./api/README.md) "자산 URL 이중 모드".

---

## 권한 체크

### 권한 체크 방식

```text
주의: FormRequest의 authorize() 메서드 사용 금지
필수: 라우트에 permission 미들웨어 체인
```

### 권한 미들웨어 사용

```php
// ✅ DO: 라우트에 permission 미들웨어 사용
Route::get('/products', [ProductController::class, 'index'])
    ->middleware('permission:sirsoft-ecommerce.products.view')
    ->name('api.sirsoft-ecommerce.products.index');

// ❌ DON'T: FormRequest에서 권한 체크
class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        // 이 방식 사용 금지
        return $this->user()->can('view-products');
    }
}
```

### 권한 네이밍 규칙

```text
[vendor-module].[resource].[action]

예시:
sirsoft-ecommerce.products.view
sirsoft-ecommerce.products.create
sirsoft-ecommerce.products.edit
sirsoft-ecommerce.products.delete
```

---

## 라우트 정의 예시

### 모듈 라우트 파일

```php
// modules/_bundled/sirsoft-ecommerce/src/routes/api.php

use Illuminate\Support\Facades\Route;
use Modules\Sirsoft\Ecommerce\Controllers\Api\Admin\ProductController;

// ModuleRouteServiceProvider 가 URL prefix('api/modules/sirsoft-ecommerce')와
// name prefix('api.modules.sirsoft-ecommerce.')를 자동 적용한다.
// 라우트 파일 내부 group 에는 관리자 세그먼트('admin')만 두고, 접두는 중복 입력하지 않는다.
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    // 상품 관리 (권한 체크 포함) → 최종 URL: /api/modules/sirsoft-ecommerce/admin/products
    Route::get('/products', [ProductController::class, 'index'])
        ->middleware('permission:sirsoft-ecommerce.products.view')
        ->name('products.index'); // 최종 name: api.modules.sirsoft-ecommerce.products.index

    Route::post('/products', [ProductController::class, 'store'])
        ->middleware('permission:sirsoft-ecommerce.products.create')
        ->name('products.store');

    Route::get('/products/{id}', [ProductController::class, 'show'])
        ->middleware('permission:sirsoft-ecommerce.products.view')
        ->name('products.show');

    Route::put('/products/{id}', [ProductController::class, 'update'])
        ->middleware('permission:sirsoft-ecommerce.products.edit')
        ->name('products.update');

    Route::delete('/products/{id}', [ProductController::class, 'destroy'])
        ->middleware('permission:sirsoft-ecommerce.products.delete')
        ->name('products.destroy');
});
```

### 코어 라우트 파일

```php
// routes/api.php

use App\Http\Controllers\Api\Admin\UserController;

Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    // 사용자 관리
    Route::get('/users', [UserController::class, 'index'])
        ->middleware('permission:users.view')
        ->name('api.users.index');

    Route::post('/users', [UserController::class, 'store'])
        ->middleware('permission:users.create')
        ->name('api.users.store');
});
```

### 권한 바이패스 라우트 (except 옵션)

자기 자신 또는 소유자에 대해 권한 체크를 바이패스하는 라우트:

```php
// routes/api.php

Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    // 사용자 수정: 자기 자신은 core.users.update 권한 없이 수정 가능
    Route::put('/users/{user}', [UserController::class, 'update'])
        ->middleware('permission:admin,core.users.update,except:self:user')
        ->name('api.admin.users.update');

    // 메뉴 수정: 소유자는 core.menus.update 권한 없이 수정 가능 (향후 적용 예시)
    Route::put('/menus/{menu}', [MenuController::class, 'update'])
        ->middleware('permission:admin,core.menus.update,except:owner:menu')
        ->name('api.admin.menus.update');
});
```

> 상세 문법: [middleware.md](middleware.md) "permission 미들웨어 except 옵션" 참조

### 사용자 컨텍스트 라우트 (permission:user)

사용자(프론트엔드) 라우트는 `permission:user,...` 미들웨어와 **user 타입 권한 식별자**를 함께 사용합니다.

```php
// routes/api.php — 사용자 알림 라우트 예시

Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    Route::prefix('notifications')->group(function () {
        Route::get('/', [UserNotificationController::class, 'index'])
            ->middleware('permission:user,core.user-notifications.read')
            ->name('api.user.notifications.index');

        Route::patch('{notification}/read', [UserNotificationController::class, 'markAsRead'])
            ->middleware('permission:user,core.user-notifications.update')
            ->name('api.user.notifications.read');

        Route::delete('{notification}', [UserNotificationController::class, 'destroy'])
            ->middleware('permission:user,core.user-notifications.delete')
            ->name('api.user.notifications.destroy');
    });
});
```

```text
⚠️ CRITICAL: 사용자 라우트에 admin 타입 권한 식별자를 사용하면 항상 403 응답
✅ 사용자 컨텍스트 권한은 별도 식별자(예: core.user-notifications.*)로 정의 + permission:user 미들웨어 사용
```

`permissions.identifier` 단일 unique 제약 때문에 같은 식별자로 admin/user 권한 두 행을 생성할 수 없습니다. 같은 도메인이라도 컨텍스트가 다르면 식별자를 분리하세요. 상세 규칙: [extension/permissions.md](../extension/permissions.md#권한-타입-permission-type)

### 공개 API 라우트

```php
// modules/_bundled/sirsoft-ecommerce/src/routes/api.php

use Modules\Sirsoft\Ecommerce\Controllers\Api\Public\ProductController;

// ModuleRouteServiceProvider 가 URL prefix('api/modules/sirsoft-ecommerce')와
// name prefix('api.modules.sirsoft-ecommerce.')를 자동 적용한다.
// 라우트 파일에서 prefix/name 접두를 중복 입력하지 않는다.
Route::prefix('products')->group(function () {
    // 공개 상품 API (인증 불필요) → 최종 URL: /api/modules/sirsoft-ecommerce/products
    Route::get('/', [ProductController::class, 'index'])
        ->name('public.products.index'); // 최종 name: api.modules.sirsoft-ecommerce.public.products.index

    Route::get('/{id}', [ProductController::class, 'show'])
        ->name('public.products.show');
});
```

---

## 개발 체크리스트

### 라우트 정의 시 확인사항

- [ ] 라우트에 `name()` 메서드로 이름 지정
- [ ] 적절한 접두사 사용 (api., web., vendor-module.)
- [ ] URL 경로 규칙 준수 (/admin/[vendor-module]/[기능명])
- [ ] 권한이 필요한 라우트에 `permission` 미들웨어 적용
- [ ] 인증이 필요한 라우트에 `auth:sanctum` 미들웨어 적용
- [ ] 관리자 라우트에 `admin` 미들웨어 적용
- [ ] FormRequest의 `authorize()` 메서드에서 권한 체크하지 않음

### 라우트 테스트 확인사항

- [ ] 인증 없이 접근 시 401 반환
- [ ] 권한 없이 접근 시 403 반환
- [ ] 올바른 권한으로 접근 시 성공

---

## 관련 문서

- [컨트롤러 계층 구조](./controllers.md) - 컨트롤러 네이밍 규칙
- [미들웨어 등록 규칙](./middleware.md) - 미들웨어 실행 순서
- [검증 로직 구현](./validation.md) - FormRequest 사용 규칙

### SEO 라우트

| URL | 메서드 | 라우트명 | 컨트롤러 | 비고 |
|-----|--------|---------|---------|------|
| /sitemap.xml | GET | web.sitemap | SitemapController@index | catch-all보다 위에 정의 |
| /api/admin/seo/stats | GET | api.admin.seo.stats | SeoCacheController | 관리자 전용 |
| /api/admin/seo/clear-cache | POST | api.admin.seo.clear-cache | SeoCacheController | 관리자 전용 |
| /api/admin/seo/warmup | POST | api.admin.seo.warmup | SeoCacheController | 관리자 전용 |
| /api/admin/seo/cached-urls | GET | api.admin.seo.cached-urls | SeoCacheController | 관리자 전용 |

> 상세: [seo-system.md](seo-system.md)
