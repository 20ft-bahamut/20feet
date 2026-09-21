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
use Modules\Pinkbro\Contents\Http\Controllers\Api\Admin\AdminInquiryController;
use Modules\Pinkbro\Contents\Http\Controllers\Api\Admin\AdminMediaController;
use Modules\Pinkbro\Contents\Http\Controllers\Api\Admin\AdminSiteController;
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
| `{domain}` 은 콘텐츠 4도메인으로 제약한다 (`service|package|case|faq`). 알 수 없는
| 도메인은 라우트에 걸리지 않아 404 다 — 결과는 예전과 같지만(컨트롤러의 404 정리)
| 판정 자리가 라우터로 올라온다. 제약이 없으면 아래 사이트 설정 라우트
| (`admin/site` 등)가 등록 순서에 따라 이 그룹에 먼저 걸려 404 가 된다.
| `{id}` 는 숫자만 받는다: 숫자가 아닌 값이 컨트롤러의 int 파라미터에 닿으면
| TypeError 로 500 이 된다.
|
| 응답은 목록만 이중 중첩(`{data: {data: [...], meta: {...}}}`)이다.
*/
Route::prefix('admin/{domain}')
    ->where(['domain' => 'service|package|case|faq'])
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

/*
| 관리자 사이트 설정 API — site / copy / discount
|
| GET api/modules/pinkbro-contents/admin/site
| PUT api/modules/pinkbro-contents/admin/site
| GET|PUT api/modules/pinkbro-contents/admin/copy
| GET|PUT api/modules/pinkbro-contents/admin/discount
|
| 세 도메인은 게시판·게시글에 매이지 않은 전역 메타다 (SPEC §4.5) — 콘텐츠 CRUD 의
| `{domain}` 그룹과 달리 게시글 id 가 없어 경로가 한 단계 얕다. 그래서 콘텐츠
| 그룹의 `{domain}` 을 4도메인으로 제약해 두었다 (위 주석 참조).
|
| 인증·관리자·스로틀 값은 콘텐츠 그룹과 같다. 권한은 읽기/수정 두 갈래로만
| 나눈다: `pinkbro-contents.site.{read|update}` (module.php 의 site 카테고리).
| 세 도메인이 한 카테고리를 공유한다 — 사이트 설정은 한 화면에서 함께 편집된다.
|
| PUT 은 부분 갱신이고, 응답은 공개 읽기와 같은 단일 래핑(`{data: {...}}`)이다.
| 관리자 읽기는 공개 읽기와 같은 리소스를 쓴다.
*/
Route::middleware(['auth:sanctum', 'admin', 'throttle:600,1'])
    ->group(function () {
        Route::get('admin/site', [AdminSiteController::class, 'site'])
            ->middleware('permission:admin,pinkbro-contents.site.read')
            ->name('admin.site.read');

        Route::put('admin/site', [AdminSiteController::class, 'updateSite'])
            ->middleware('permission:admin,pinkbro-contents.site.update')
            ->name('admin.site.update');

        Route::get('admin/copy', [AdminSiteController::class, 'copy'])
            ->middleware('permission:admin,pinkbro-contents.site.read')
            ->name('admin.copy.read');

        Route::put('admin/copy', [AdminSiteController::class, 'updateCopy'])
            ->middleware('permission:admin,pinkbro-contents.site.update')
            ->name('admin.copy.update');

        Route::get('admin/discount', [AdminSiteController::class, 'discount'])
            ->middleware('permission:admin,pinkbro-contents.site.read')
            ->name('admin.discount.read');

        Route::put('admin/discount', [AdminSiteController::class, 'updateDiscount'])
            ->middleware('permission:admin,pinkbro-contents.site.update')
            ->name('admin.discount.update');
    });

/*
| 관리자 미디어 슬롯 API — 업로드된 첨부를 슬롯에 연결/해제
|
| GET    api/modules/pinkbro-contents/admin/media
| PUT    api/modules/pinkbro-contents/admin/media
| DELETE api/modules/pinkbro-contents/admin/media/{slot}
|
| 인증·관리자·스로틀 값은 위 두 관리자 그룹과 같다. 권한은 읽기/수정 두 갈래다:
| `pinkbro-contents.media.{read|update}` (module.php 의 media 카테고리).
|
| 이 그룹이 콘텐츠 CRUD 그룹(`admin/{domain}`)보다 **뒤에** 있어도 `admin/media`
| 가 그쪽에 삼켜지지 않는 이유는 그 그룹의 `{domain}` 이 service|package|case|faq
| 로 제약돼 있기 때문이다 (위 주석 참조). 제약이 풀리면 admin/media 는
| 콘텐츠 그룹에 먼저 걸려 403 이 된다 — 404 가 아니라서 권한 문제로 오인하기 쉽다.
|
| GET 은 게시판·게시글이 필요 없다 (슬롯 메타는 전역 스코프다). PUT 의 본문은
| `{slot, temp_key, alt?}` 이고, 응답은 GET 과 같은 `{data: {slots: [...]}}` 다 —
| 리소스 하나에 응답 모양 하나. DELETE 는 204 이다.
*/
Route::middleware(['auth:sanctum', 'admin', 'throttle:600,1'])
    ->prefix('admin/media')
    ->name('admin.media.')
    ->group(function () {
        Route::get('/', [AdminMediaController::class, 'index'])
            ->middleware('permission:admin,pinkbro-contents.media.read')
            ->name('index');

        Route::put('/', [AdminMediaController::class, 'link'])
            ->middleware('permission:admin,pinkbro-contents.media.update')
            ->name('link');

        Route::delete('/{slot}', [AdminMediaController::class, 'destroy'])
            ->middleware('permission:admin,pinkbro-contents.media.update')
            ->name('destroy');
    });

/*
| 관리자 문의 API — 목록·단건·상태 변경
|
| GET api/modules/pinkbro-contents/admin/inquiry
| GET api/modules/pinkbro-contents/admin/inquiry/{id}
| PUT  api/modules/pinkbro-contents/admin/inquiry/{id}
|
| 인증·관리자·스로틀 값은 위 세 관리자 그룹과 같다. 권한은 읽기/수정 두 갈래다:
| `pinkbro-contents.inquiries.{read|update}` (module.php 의 inquiries 카테고리).
|
| 이 그룹이 콘텐츠 CRUD 그룹(`admin/{domain}`)보다 뒤에 있어도 `admin/inquiry` 가
| 그쪽에 삼켜지지 않는 이유는 그 그룹의 `{domain}` 이 service|package|case|faq
| 로 제약돼 있기 때문이다 (위 주석 참조). 문의는 접수 때만 만들어지므로 POST/DELETE
| 를 두지 않는다. `{id}` 는 숫자만 받는다: 숫자가 아닌 값이 컨트롤러의 int
| 파라미터에 닿으면 TypeError 로 500 이 된다.
|
| 응답은 목록만 이중 중첩(`{data: {data: [...], meta: {total, per_page, current_page}}}`)이고
| 단건·수정은 단일 래핑(`{data: {...}}`)이다 — 콘텐츠 관리자 API 와 같은 계약.
| PUT 의 본문은 `{status?, internal_note?}` 이고, status 는 InquiryStatus enum 이다.
*/
Route::middleware(['auth:sanctum', 'admin', 'throttle:600,1'])
    ->prefix('admin/inquiry')
    ->name('admin.inquiry.')
    ->group(function () {
        Route::get('/', [AdminInquiryController::class, 'index'])
            ->middleware('permission:admin,pinkbro-contents.inquiries.read')
            ->name('index');

        Route::get('/{id}', [AdminInquiryController::class, 'show'])
            ->where('id', '[0-9]+')
            ->middleware('permission:admin,pinkbro-contents.inquiries.read')
            ->name('show');

        Route::put('/{id}', [AdminInquiryController::class, 'update'])
            ->where('id', '[0-9]+')
            ->middleware('permission:admin,pinkbro-contents.inquiries.update')
            ->name('update');
    });
