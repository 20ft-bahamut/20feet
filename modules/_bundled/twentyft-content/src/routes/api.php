<?php

use Illuminate\Support\Facades\Route;
use Modules\Twentyft\Content\Http\Controllers\Api\Admin\InquiryAdminController;
use Modules\Twentyft\Content\Http\Controllers\Api\Admin\PortfolioAdminController;
use Modules\Twentyft\Content\Http\Controllers\Api\Admin\SuperBifyAdminController;
use Modules\Twentyft\Content\Http\Controllers\Api\InquiryController;
use Modules\Twentyft\Content\Http\Controllers\Api\PortfolioController;
use Modules\Twentyft\Content\Http\Controllers\Api\SuperBifyController;

/*
|--------------------------------------------------------------------------
| 20ft Content Public API Routes
|--------------------------------------------------------------------------
|
| ModuleRouteServiceProvider가 자동으로 prefix를 적용합니다.
| - URL prefix: 'api/modules/20ft-content'
| - Name prefix: 'api.modules.20ft-content.'
|
| 템플릿 레이아웃 JSON의 data_sources가 소비하는 엔드포인트는
| 전부 이 파일에 둡니다.
|
*/

/*
| Portfolio 공개 API
*/
Route::prefix('portfolio')
    ->middleware(['optional.sanctum', 'throttle:600,1'])
    ->name('portfolio.')
    ->group(function () {
        Route::get('/projects', [PortfolioController::class, 'index'])
            ->name('projects.index');

        Route::get('/projects/{slug}', [PortfolioController::class, 'show'])
            ->where('slug', '^[a-z][a-z0-9-]*$')
            ->name('projects.show');
    });

/*
| SuperBify 공개 API
*/
Route::prefix('superbify')
    ->middleware(['optional.sanctum', 'throttle:600,1'])
    ->name('superbify.')
    ->group(function () {
        Route::get('/projects', [SuperBifyController::class, 'index'])
            ->name('projects.index');

        Route::get('/projects/{slug}', [SuperBifyController::class, 'show'])
            ->where('slug', '^[a-z][a-z0-9-]*$')
            ->name('projects.show');
    });

/*
| Project Inquiry — backend ready, UI disabled until privacy copy finalized
*/
Route::prefix('inquiries')
    ->middleware(['optional.sanctum', 'throttle:60,1'])
    ->name('inquiries.')
    ->group(function () {
        Route::post('/', [InquiryController::class, 'store'])
            ->name('store');
    });

/*
|--------------------------------------------------------------------------
| 20ft Content Admin API Routes
|--------------------------------------------------------------------------
|
| 템플릿 레이아웃 JSON의 data_sources가 소비하는 관리자 엔드포인트입니다.
| prefix: api/modules/20ft-content/admin
|
*/
Route::prefix('admin/portfolio')
    ->middleware(['auth:sanctum', 'admin', 'throttle:600,1'])
    ->name('admin.portfolio.')
    ->group(function () {
        Route::get('/projects', [PortfolioAdminController::class, 'index'])
            ->middleware('permission:admin,twentyft-content.portfolio.read')
            ->name('projects.index');

        Route::get('/projects/{post_id}', [PortfolioAdminController::class, 'show'])
            ->middleware('permission:admin,twentyft-content.portfolio.read')
            ->name('projects.show');

        Route::put('/projects/{post_id}', [PortfolioAdminController::class, 'update'])
            ->middleware('permission:admin,twentyft-content.portfolio.update')
            ->name('projects.update');

        Route::patch('/projects/{post_id}/status', [PortfolioAdminController::class, 'updateStatus'])
            ->middleware('permission:admin,twentyft-content.portfolio.update')
            ->name('projects.status');
    });

Route::prefix('admin/superbify')
    ->middleware(['auth:sanctum', 'admin', 'throttle:600,1'])
    ->name('admin.superbify.')
    ->group(function () {
        Route::get('/projects', [SuperBifyAdminController::class, 'index'])
            ->middleware('permission:admin,twentyft-content.superbify.read')
            ->name('projects.index');

        Route::get('/projects/{post_id}', [SuperBifyAdminController::class, 'show'])
            ->middleware('permission:admin,twentyft-content.superbify.read')
            ->name('projects.show');

        Route::put('/projects/{post_id}', [SuperBifyAdminController::class, 'update'])
            ->middleware('permission:admin,twentyft-content.superbify.update')
            ->name('projects.update');

        Route::patch('/projects/{post_id}/status', [SuperBifyAdminController::class, 'updateStatus'])
            ->middleware('permission:admin,twentyft-content.superbify.update')
            ->name('projects.status');
    });

Route::prefix('admin/inquiries')
    ->middleware(['auth:sanctum', 'admin', 'throttle:600,1'])
    ->name('admin.inquiries.')
    ->group(function () {
        Route::get('/', [InquiryAdminController::class, 'index'])
            ->middleware('permission:admin,twentyft-content.inquiries.read')
            ->name('index');

        Route::patch('/{post_id}/status', [InquiryAdminController::class, 'updateStatus'])
            ->middleware('permission:admin,twentyft-content.inquiries.update')
            ->name('status');
    });
