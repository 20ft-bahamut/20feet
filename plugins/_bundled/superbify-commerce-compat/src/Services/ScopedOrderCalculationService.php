<?php

namespace Plugins\Superbify\Commerce\Compat\Services;

use Modules\Sirsoft\Ecommerce\DTO\AppliedPromotions;
use Modules\Sirsoft\Ecommerce\DTO\CouponApplication;
use Modules\Sirsoft\Ecommerce\DTO\ValidationError;
use Modules\Sirsoft\Ecommerce\Enums\CouponTargetScope;
use Modules\Sirsoft\Ecommerce\Models\Coupon;
use Modules\Sirsoft\Ecommerce\Models\CouponIssue;
use Modules\Sirsoft\Ecommerce\Services\OrderCalculationService;

/**
 * ScopedOrderCalculationService
 *
 * WHY: sirsoft-ecommerce 1.1.2 의 OrderCalculationService::applyOrderCoupon 은
 * filterItemsByScope (protected) 를 호출하지 않고 전체 합계에 할인을 적용한다.
 * 따라서 target_scope=PRODUCTS|CATEGORIES 쿠폰이 scope 밖 항목을 포함한 합계로
 * 계산되어, scope 외 항목에도 할인이 안분되는 SEC-COUPON-002 결함이 발생한다.
 *
 * 본 서비스는 OrderCalculationService 를 상속하여 applyOrderCoupon 만 보정한다:
 * - 스냅샷 모드: 부모 동작을 그대로 유지 (OrderAdjustmentService 의 cancel 재계산 호환).
 * - 통상 모드: 쿠폰의 target_scope != ALL 이면 eligible items 만으로
 *   - min_order_amount 검증
 *   - calculateCouponDiscount 베이스 산출
 *   - apportionAmount (eligible items 만 대상)
 *   을 수행하며, scope 매칭 0 이면 ValidationError::invalidTarget 을 추가하고 continue.
 *
 * 부모의 protected 헬퍼(filterItemsByScope, calculateCouponDiscount, apportionAmount)는
 * 그대로 호출되므로 로직 변동 없이 scope 보정만 보장한다.
 *
 * TARGET DEFECT: SEC-COUPON-002.
 * REMOVE WHEN: sirsoft-ecommerce > 1.1.2 에서 applyOrderCoupon 이 filterItemsByScope 를
 * 호출하는 버전이 릴리스되면 이 서비스를 제거한다.
 *
 * @internal CompatServiceProvider 가 OrderCalculationService 바인딩을 본 클래스로 교체한다.
 */
class ScopedOrderCalculationService extends OrderCalculationService
{
    /**
     * 부모 applyOrderCoupon 의 시그니처/리턴 시맨틱을 그대로 유지한다.
     *
     * @param  array  $discountedItems  할인 후 아이템 배열
     * @param  array  $coupons  주문쿠폰 목록
     * @param  array  $preparedItems  준비된 아이템 배열
     * @param  \Modules\Sirsoft\Ecommerce\DTO\CalculationInput|null  $input  계산 입력 (스냅샷 모드 메타 포함)
     * @return array [아이템별 할인 후 금액, AppliedPromotions, ValidationError[]]
     */
    protected function applyOrderCoupon(
        array $discountedItems,
        array $coupons,
        array $preparedItems,
        ?\Modules\Sirsoft\Ecommerce\DTO\CalculationInput $input = null
    ): array {
        $appliedPromotions = new AppliedPromotions;
        $validationErrors = [];

        if (empty($coupons)) {
            return [$discountedItems, $appliedPromotions, $validationErrors];
        }

        // 부모와 동일한 스냅샷 메타 해석 — 스냅샷 모드에서는 부모 로직 그대로 두어
        // OrderAdjustmentService 의 cancel 재계산 호환을 유지한다.
        $snapshotMode = $input->metadata['snapshot_mode'] ?? false;
        $couponSnapshots = $input->metadata['coupon_snapshots'] ?? [];

        // 전체 주문금액 계산 (부모와 동일 베이스).
        $totalOrderAmount = 0;
        foreach ($discountedItems as $item) {
            $totalOrderAmount += $item['discounted_subtotal'] ?? $item['subtotal'] ?? 0;
        }

        foreach ($coupons as $couponIssue) {
            $coupon = $couponIssue->coupon;
            $snapshot = $couponSnapshots[$couponIssue->id] ?? null;

            // 스냅샷 모드 — 부모와 동일 동작 (applied_items 스냅샷 trust).
            if ($snapshotMode) {
                // min_order_amount 검증 (스냅샷 우선)
                $minAmount = $snapshot && isset($snapshot['min_order_amount'])
                    ? (int) $snapshot['min_order_amount']
                    : (int) $coupon->min_order_amount;

                if ($minAmount > 0 && $totalOrderAmount < $minAmount) {
                    $validationErrors[] = ValidationError::minAmountNotMet(
                        $coupon->id,
                        $minAmount,
                        $totalOrderAmount
                    );

                    continue;
                }

                $totalDiscount = $this->calculateCouponDiscount($coupon, $totalOrderAmount, $snapshot);
                $apportioned = $this->apportionAmount($discountedItems, $totalDiscount);
                $appliedItems = [];

                foreach ($apportioned as $optionId => $share) {
                    $discountedItems[$optionId]['order_discount_share'] = ($discountedItems[$optionId]['order_discount_share'] ?? 0) + $share;
                    $appliedItems[] = [
                        'product_option_id' => $optionId,
                        'discount_amount' => $share,
                    ];
                }

                $defaultCurrency = $this->currencyService->getDefaultCurrency();
                $appliedPromotions->addCoupon(new CouponApplication(
                    couponId: $coupon->id,
                    couponIssueId: $couponIssue->id,
                    name: $coupon->getLocalizedName(),
                    targetType: $snapshot['target_type'] ?? $coupon->target_type->value,
                    discountType: $snapshot['discount_type'] ?? $coupon->discount_type->value,
                    discountValue: (float) ($snapshot['discount_value'] ?? $coupon->discount_value),
                    totalDiscount: $totalDiscount,
                    totalDiscountFormatted: $this->currencyService->formatPrice($totalDiscount, $defaultCurrency),
                    minOrderAmount: (int) $coupon->min_order_amount,
                    maxDiscountAmount: (int) ($coupon->discount_max_amount ?? 0),
                    appliedItems: array_map(fn ($item) => [
                        'product_option_id' => $item['product_option_id'],
                        'discount_amount' => $item['discount_amount'],
                        'discount_amount_formatted' => $this->currencyService->formatPrice($item['discount_amount'], $defaultCurrency),
                    ], $appliedItems),
                ));

                break;
            }

            // 통상 모드 — scope 보정 진입점.
            $targetScope = $coupon->target_scope ?? null;
            $targetScopeValue = $targetScope instanceof \BackedEnum
                ? $targetScope->value
                : (is_object($targetScope) && method_exists($targetScope, 'value')
                    ? $targetScope->value
                    : (string) $targetScope);

            // ALL 이면 부모의 동작과 동일 (전체 합계 베이스).
            if ($targetScopeValue === CouponTargetScope::ALL->value || $targetScopeValue === 'all' || $targetScopeValue === '') {
                $minAmount = (int) $coupon->min_order_amount;
                if ($minAmount > 0 && $totalOrderAmount < $minAmount) {
                    $validationErrors[] = ValidationError::minAmountNotMet(
                        $coupon->id,
                        $minAmount,
                        $totalOrderAmount
                    );

                    continue;
                }

                $totalDiscount = $this->calculateCouponDiscount($coupon, $totalOrderAmount, null);
                $apportioned = $this->apportionAmount($discountedItems, $totalDiscount);
                $appliedItems = [];

                foreach ($apportioned as $optionId => $share) {
                    $discountedItems[$optionId]['order_discount_share'] = ($discountedItems[$optionId]['order_discount_share'] ?? 0) + $share;
                    $appliedItems[] = [
                        'product_option_id' => $optionId,
                        'discount_amount' => $share,
                    ];
                }

                $defaultCurrency = $this->currencyService->getDefaultCurrency();
                $appliedPromotions->addCoupon(new CouponApplication(
                    couponId: $coupon->id,
                    couponIssueId: $couponIssue->id,
                    name: $coupon->getLocalizedName(),
                    targetType: $coupon->target_type->value,
                    discountType: $coupon->discount_type->value,
                    discountValue: (float) $coupon->discount_value,
                    totalDiscount: $totalDiscount,
                    totalDiscountFormatted: $this->currencyService->formatPrice($totalDiscount, $defaultCurrency),
                    minOrderAmount: (int) $coupon->min_order_amount,
                    maxDiscountAmount: (int) ($coupon->discount_max_amount ?? 0),
                    appliedItems: array_map(fn ($item) => [
                        'product_option_id' => $item['product_option_id'],
                        'discount_amount' => $item['discount_amount'],
                        'discount_amount_formatted' => $this->currencyService->formatPrice($item['discount_amount'], $defaultCurrency),
                    ], $appliedItems),
                ));

                break;
            }

            // scope != ALL — eligible items 만으로 계산.
            $eligibleItems = $this->filterItemsByScope($preparedItems, $coupon);
            if (empty($eligibleItems)) {
                // applyProductCoupons 와 동일한 패턴 — invalidTarget 으로 차단.
                $validationErrors[] = ValidationError::invalidTarget($coupon->id);

                continue;
            }

            // eligible items 의 subtotal 합산 (applyProductCoupons 와 동일 베이스).
            $eligibleSubtotal = 0;
            $eligibleDiscountedItems = [];
            foreach ($eligibleItems as $eligibleItem) {
                $optionId = $eligibleItem['product_option_id'] ?? null;
                if ($optionId === null) {
                    continue;
                }
                if (! isset($discountedItems[$optionId])) {
                    continue;
                }
                $eligibleSubtotal += $discountedItems[$optionId]['discounted_subtotal']
                    ?? $discountedItems[$optionId]['subtotal']
                    ?? 0;
                $eligibleDiscountedItems[$optionId] = $discountedItems[$optionId];
            }

            if ($eligibleSubtotal <= 0) {
                $validationErrors[] = ValidationError::invalidTarget($coupon->id);

                continue;
            }

            // min_order_amount 검증 — eligible subtotal 을 기준으로 (SEC-COUPON-002 부가 결함 보정).
            $minAmount = (int) $coupon->min_order_amount;
            if ($minAmount > 0 && $eligibleSubtotal < $minAmount) {
                $validationErrors[] = ValidationError::minAmountNotMet(
                    $coupon->id,
                    $minAmount,
                    $eligibleSubtotal
                );

                continue;
            }

            $totalDiscount = $this->calculateCouponDiscount($coupon, $eligibleSubtotal, null);

            // eligible items 만 대상으로 안분.
            $apportioned = $this->apportionAmount($eligibleDiscountedItems, $totalDiscount);
            $appliedItems = [];

            foreach ($apportioned as $optionId => $share) {
                // scope 내 옵션만 share 누적.
                $discountedItems[$optionId]['order_discount_share'] = ($discountedItems[$optionId]['order_discount_share'] ?? 0) + $share;
                $appliedItems[] = [
                    'product_option_id' => $optionId,
                    'discount_amount' => $share,
                ];
            }

            // scope 밖 옵션의 기존 share 는 0 으로 리셋 (applyProductCoupons 와 동일 시맨틱).
            foreach ($discountedItems as $optionId => $_) {
                if (! isset($apportioned[$optionId])) {
                    $discountedItems[$optionId]['order_discount_share'] = 0;
                }
            }

            $defaultCurrency = $this->currencyService->getDefaultCurrency();
            $appliedPromotions->addCoupon(new CouponApplication(
                couponId: $coupon->id,
                couponIssueId: $couponIssue->id,
                name: $coupon->getLocalizedName(),
                targetType: $coupon->target_type->value,
                discountType: $coupon->discount_type->value,
                discountValue: (float) $coupon->discount_value,
                totalDiscount: $totalDiscount,
                totalDiscountFormatted: $this->currencyService->formatPrice($totalDiscount, $defaultCurrency),
                minOrderAmount: (int) $coupon->min_order_amount,
                maxDiscountAmount: (int) ($coupon->discount_max_amount ?? 0),
                appliedItems: array_map(fn ($item) => [
                    'product_option_id' => $item['product_option_id'],
                    'discount_amount' => $item['discount_amount'],
                    'discount_amount_formatted' => $this->currencyService->formatPrice($item['discount_amount'], $defaultCurrency),
                ], $appliedItems),
            ));

            // 주문금액 쿠폰은 하나만 적용.
            break;
        }

        return [$discountedItems, $appliedPromotions, $validationErrors];
    }
}
