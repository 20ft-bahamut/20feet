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
