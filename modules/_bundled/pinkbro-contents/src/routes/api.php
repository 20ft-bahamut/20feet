<?php

/*
|--------------------------------------------------------------------------
| PinkBro Contents Public API Routes
|--------------------------------------------------------------------------
|
| ModuleRouteServiceProvider가 자동으로 prefix를 적용합니다.
| - URL prefix: 'api/modules/pinkbro-contents'
| - Name prefix: 'api.modules.pinkbro-contents.'
|
| 템플릿 레이아웃 JSON의 data_sources가 소비하는 엔드포인트는
| 전부 이 파일에 둡니다.
|
| 이 파일의 경로는 위 prefix 뒤에 그대로 붙습니다 — 여기서 다시
| prefix('public') 같은 세그먼트를 덧붙이지 않습니다.
|
*/

use Illuminate\Support\Facades\Route;
use Modules\Pinkbro\Contents\Http\Controllers\Api\Admin\AdminContentController;
use Modules\Pinkbro\Contents\Http\Controllers\Api\ContentController;
use Modules\Pinkbro\Contents\Http\Controllers\Api\InquiryController;
use Modules\Pinkbro\Contents\Http\Controllers\Api\MediaController;
use Modules\Pinkbro\Contents\Http\Controllers\Api\SiteController;

/*
| 사이트 레벨 공개 API — 무인증 읽기 (권한 미들웨어 없음)
|
| GET api/modules/pinkbro-contents/site
| GET api/modules/pinkbro-contents/copy
| GET api/modules/pinkbro-contents/discount
| GET api/modules/pinkbro-contents/media-slots
*/
Route::get('site', [SiteController::class, 'site'])->name('site');
Route::get('copy', [SiteController::class, 'copy'])->name('copy');
Route::get('discount', [SiteController::class, 'discount'])->name('discount');
Route::get('media-slots', [MediaController::class, 'slots'])->name('media-slots');

/*
| 콘텐츠 목록 공개 API — 무인증 읽기 (권한 미들웨어 없음)
|
| GET api/modules/pinkbro-contents/services
| GET api/modules/pinkbro-contents/packages
| GET api/modules/pinkbro-contents/cases
| GET api/modules/pinkbro-contents/faq
*/
Route::get('services', [ContentController::class, 'services'])->name('services');
Route::get('packages', [ContentController::class, 'packages'])->name('packages');
Route::get('cases', [ContentController::class, 'cases'])->name('cases');
Route::get('faq', [ContentController::class, 'faq'])->name('faq');

/*
| 문의 접수 공개 API — 무인증 쓰기
|
| POST api/modules/pinkbro-contents/inquiry
|
| 비회원도 제출하므로 권한 미들웨어를 두지 않는다. 스로틀은 선례
| (twentyft-content 문의 store)와 같은 IP당 분당 10건이다. 검증 실패는
| 422 `{message, errors}`, 게시판 미비는 503, 초과는 429 다.
*/
Route::post('inquiry', [InquiryController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('inquiry');

/*
| 관리자 콘텐츠 CRUD API — service / package / case / faq
|
| GET    api/modules/pinkbro-contents/admin/{domain}
| GET    api/modules/pinkbro-contents/admin/{domain}/{id}
| POST   api/modules/pinkbro-contents/admin/{domain}
| PUT    api/modules/pinkbro-contents/admin/{domain}/{id}
| DELETE api/modules/pinkbro-contents/admin/{domain}/{id}
|
| 인증·관리자·스로틀 값은 참조 관리자 그룹(twentyft-content)과 같다. 권한은
| 엔드포인트마다 `pinkbro-contents.content.{action}` 로 나눈다.
|
| `{domain}` 은 라우트에서 제약하지 않는다 — 알 수 없는 도메인은 컨트롤러가 404 로
| 정리한다(관리자 레이아웃이 404 핸들러를 갖는다). `{id}` 는 숫자만 받는다:
| 숫자가 아닌 값이 컨트롤러의 int 파라미터에 닿으면 TypeError 로 500 이 된다.
|
| 응답은 목록만 이중 중첩(`{data: {data: [...], meta: {...}}}`)이다.
*/
Route::prefix('admin/{domain}')
    ->middleware(['auth:sanctum', 'admin', 'throttle:600,1'])
    ->name('admin.content.')
    ->group(function () {
        Route::get('/', [AdminContentController::class, 'index'])
            ->middleware('permission:admin,pinkbro-contents.content.read')
            ->name('index');

        Route::get('/{id}', [AdminContentController::class, 'show'])
            ->where('id', '[0-9]+')
            ->middleware('permission:admin,pinkbro-contents.content.read')
            ->name('show');

        Route::post('/', [AdminContentController::class, 'store'])
            ->middleware('permission:admin,pinkbro-contents.content.create')
            ->name('store');

        Route::put('/{id}', [AdminContentController::class, 'update'])
            ->where('id', '[0-9]+')
            ->middleware('permission:admin,pinkbro-contents.content.update')
            ->name('update');

        Route::delete('/{id}', [AdminContentController::class, 'destroy'])
            ->where('id', '[0-9]+')
            ->middleware('permission:admin,pinkbro-contents.content.delete')
            ->name('destroy');
    });
