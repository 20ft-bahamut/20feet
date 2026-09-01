<?php

use Illuminate\Support\Facades\Route;
use Plugins\Superbify\Commerce\Compat\Http\Controllers\Public\ShopInfoController;

/*
 * SuperBify Commerce Compat plugin API routes.
 *
 * URL prefix: /api/plugins/superbify-commerce-compat (PluginRouteServiceProvider auto-applied)
 *
 * Purpose: SuperBify Commerce Minimal's StoreFooter must read live
 * ADMIN-configured basic_info (shop_name, company_name, business_number,
 * ceo_name, address, phone, fax, email, privacy_officer, mail_order_number,
 * telecom_number, ...) and fall back to the static config/business-info.json
 * seed only when admin fields are empty.
 *
 * Why this lives here (and not in sirsoft-ecommerce):
 *   - The upstream EcommerceSettingsService does not expose basic_info
 *     publicly; only shipping/payment/checkout/review have public read
 *     endpoints (see modules/sirsoft-ecommerce .../Public/EcommerceSettingsController).
 *   - Module sources are READ-ONLY by policy (CLAUDE.md 1).
 *   - The compat plugin is the approved extension point: it lives at
 *     plugins/_bundled/superbify-commerce-compat, the only authoritative
 *     surface to add new public read endpoints that depend on the
 *     sirsoft-ecommerce settings service without editing the module.
 *
 * SECURITY MODEL:
 *   - Public, no auth (same model as the GDPR plugin's /settings route).
 *   - Whitelist-only field projection: the controller never echoes back
 *     raw user input — it reads ONLY the public-safe basic_info keys
 *     listed in ShopInfoController::PUBLIC_SAFE_FIELDS and returns them
 *     with leading/trailing whitespace stripped. Anything not in the
 *     whitelist is dropped, including admin-only internal flags.
 *   - Failed lookups degrade gracefully (empty payload + 200) so the
 *     template can silently fall back to its static seed rather than
 *     hard-failing the page render.
 */

// Public, no auth — template footer reads this on mount to overlay
// admin-configured basic_info onto the static config/business-info.json seed.
Route::get('/shop-info', [ShopInfoController::class, 'show'])
    ->name('api.superbify-commerce-compat.shop-info');
