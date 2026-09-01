<?php

namespace Plugins\Superbify\Commerce\Compat\Http\Controllers\Public;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Api\Base\PublicBaseController;
use Exception;
use Illuminate\Http\JsonResponse;
use Modules\Sirsoft\Ecommerce\Services\EcommerceSettingsService;

/**
 * Public read-model for the storefront's basic_info block.
 *
 * The SuperBify Commerce Minimal StoreFooter is rendered at runtime from the
 * static `config/business-info.json` seed. To stay compatible with the future
 * admin UI (/admin/ecommerce/settings → 기본정보 탭) without forking the module,
 * this controller projects the `basic_info` category from
 * `EcommerceSettingsService` into a public-safe flat shape that the template
 * can merge over its static seed.
 *
 * SECURITY: only the keys listed in PUBLIC_SAFE_FIELDS are returned. Admin-only
 * flags, internal IDs, and anything not on the whitelist is dropped at the
 * controller layer. Empty strings (admin field not configured) round-trip as
 * empty strings so the template can detect "admin has not set this yet" and
 * fall back to the static seed for that field only.
 *
 * ROBUSTNESS: any failure (sirsoft-ecommerce not installed/active, settings
 * file missing, etc.) returns 200 with an empty data object — not 5xx — so
 * the template can silently degrade. A 500 would crash the page render.
 */
class ShopInfoController extends PublicBaseController
{
    /**
     * Public-safe basic_info keys. Order is irrelevant (consumed as an object),
     * but documented here as the single edit point.
     *
     * Mapping consumed by the template (templates/_bundled/superbify-commerce_minimal/
     * src/components/StoreFooter.tsx → fetchShopInfo merge):
     *   - business_number            → businessRegistrationNumber
     *   - mail_order_number          → ecommerceRegistrationNumber
     *   - zipcode + base_address + detail_address → businessAddress (trim-joined)
     *   - phone                      → customerServicePhone
     *   - email                      → customerServiceEmail
     *   - ceo_name                   → representative
     *   - company_name               → companyName (fallback: shop_name)
     *
     * Field notes:
     *   - shop_name: kept separately so the template can fall back to it for
     *     companyName when company_name is empty.
     *   - privacy_officer + privacy_officer_email: not yet consumed by the
     *     StoreFooter but included for forward compatibility (the footer
     *     currently has no privacy_officer field; including them does not
     *     leak any sensitive value beyond what is already publicly displayed
     *     elsewhere on the storefront via policies).
     *   - telecom_number: not consumed by the footer but exposed so the
     *     template may surface it in a future revision without another
     *     endpoint round-trip.
     *   - business_type / business_category: included for the same reason
     *     (footer does not yet render them; future-proofing without cost).
     */
    private const PUBLIC_SAFE_FIELDS = [
        'shop_name',
        'company_name',
        'business_number',
        'ceo_name',
        'business_type',
        'business_category',
        'zipcode',
        'base_address',
        'detail_address',
        'phone',
        'fax',
        'email',
        'privacy_officer',
        'privacy_officer_email',
        'mail_order_number',
        'telecom_number',
    ];

    /**
     * Public ctor — keeps the DI surface minimal and aligned with the
     * parent PublicBaseController contract.
     */
    public function __construct(
        private readonly EcommerceSettingsService $settingsService
    ) {
        parent::__construct();
    }

    /**
     * GET /api/plugins/superbify-commerce-compat/shop-info
     *
     * Returns a public-safe projection of the admin-configured basic_info
     * category. Empty strings are preserved (do not collapse to null) so
     * the template can detect "admin field unset" vs "admin field set to
     * empty literal" — both are treated as "use the static seed" by the
     * template merge layer, but the wire shape stays faithful.
     *
     * @return JsonResponse 200 with `{success:true, data:{<key>: <string>}}`
     *                      even when no fields are configured or the module
     *                      is unavailable (degrade gracefully).
     */
    public function show(): JsonResponse
    {
        try {
            // EcommerceSettingsService::getSettings() returns the merged
            // (defaults + saved) shape. Reading 'basic_info' is safe even
            // when the saved file is missing — defaults fill the gaps.
            $basic = $this->settingsService->getSettings('basic_info');
        } catch (Exception) {
            // Degrade gracefully: module not installed, settings broken,
            // or service unavailable — the template should fall back to
            // its static seed rather than fail the render.
            return ResponseHelper::success('common.success', $this->emptyPayload());
        }

        if (! is_array($basic)) {
            return ResponseHelper::success('common.success', $this->emptyPayload());
        }

        $payload = [];
        foreach (self::PUBLIC_SAFE_FIELDS as $key) {
            $value = $basic[$key] ?? '';
            // Strict whitelist projection: only strings pass through,
            // anything else is normalized to empty string. Numbers, bools,
            // arrays, nulls — all flattened. This is the only path that
            // touches user-saved values before the wire.
            $payload[$key] = is_string($value) ? trim($value) : '';
        }

        return ResponseHelper::success('common.success', $payload);
    }

    /**
     * Empty-but-shape-stable payload. Keeps the wire contract consistent
     * between "admin has set nothing" and "module unavailable" — the
     * template only checks for non-empty strings per field, so this is
     * indistinguishable from "all fields empty" by design.
     *
     * @return array<string, string>
     */
    private function emptyPayload(): array
    {
        $empty = [];
        foreach (self::PUBLIC_SAFE_FIELDS as $key) {
            $empty[$key] = '';
        }

        return $empty;
    }
}
