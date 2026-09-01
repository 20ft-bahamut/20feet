<?php

namespace Plugins\Superbify\Commerce\Compat\Tests;

use Modules\Sirsoft\Ecommerce\DTO\ValidationError;
use Modules\Sirsoft\Ecommerce\Enums\CouponTargetScope;
use Plugins\Superbify\Commerce\Compat\Listeners\CouponScopeListener;
use Plugins\Superbify\Commerce\Compat\Services\ScopedOrderCalculationService;

/**
 * COUPON-SCOPE-001..006: ScopedOrderCalculationService::applyOrderCoupon 보정 단위 테스트.
 *
 * 시나리오:
 * - 001: target_scope=ALL 일 때 그대로 통과 (전체 합계 기준).
 * - 002: target_scope=PRODUCTS, 매칭 0 → invalidTarget ValidationError.
 * - 003: target_scope=PRODUCTS, 부분 매칭 → eligible subtotal 로만 할인 재계산 + scope 밖 share=0.
 * - 004: target_scope=CATEGORIES, 부분 매칭 → 동일 시맨틱.
 * - 005: excluded 가 우선 차단.
 * - 006: INVARIANT (0 ≤ discount ≤ eligible, scope 밖 share == 0, total ≥ 0).
 *
 * CouponScopeListener 자체는 getSubscribedHooks() 가 빈 배열을 반환하는 no-op 라우터이며
 * 실제 scope 보정은 CompatServiceProvider 가 컨테이너에 바인딩한 ScopedOrderCalculationService
 * 가 수행한다. 본 테스트는 그 보정 결과를 검증한다.
 */
class CouponScopeListenerTest extends CompatTestCase
{
    /**
     * 리스너가 HookListenerInterface 의 getSubscribedHooks 를 노출하는지 확인.
     */
    public function test_listener_exposes_subscribed_hooks_method(): void
    {
        $this->assertTrue(method_exists(CouponScopeListener::class, 'getSubscribedHooks'));
        $hooks = CouponScopeListener::getSubscribedHooks();
        $this->assertIsArray($hooks);
        // scope 보정은 CompatServiceProvider 경로로 처리 — 리스너는 자체 구독 훅 없음.
        $this->assertCount(0, $hooks);
    }

    /**
     * ScopedOrderCalculationService 가 OrderCalculationService 를 상속.
     */
    public function test_scoped_service_extends_order_calculation_service(): void
    {
        $this->assertTrue(
            is_subclass_of(ScopedOrderCalculationService::class, \Modules\Sirsoft\Ecommerce\Services\OrderCalculationService::class)
        );
    }

    /**
     * 001: ALL scope 쿠폰은 보정 없이 부모와 동일 시맨틱 (전체 합계 기준).
     * 본 픽스에서는 모든 SCOPE 가 통상 모드 경로로 들어가므로, ALL 도 통과한다.
     * 검증: scope 보정 후에도 데이터 구조는 유지된다.
     */
    public function test_all_scope_coupon_runs_through_correction_without_change(): void
    {
        $service = $this->makeService();
        $coupon = $this->makeCoupon([
            'discount_type' => 'fixed',
            'discount_value' => 5000,
            'target_scope' => CouponTargetScope::ALL,
            'min_order_amount' => 0,
        ]);
        $couponIssue = $this->makeCouponIssue($coupon, 1);

        $discounted = [
            10 => ['product_id' => 1, 'product_option_id' => 10, 'subtotal' => 8000, 'discounted_subtotal' => 8000, 'order_discount_share' => 0],
            11 => ['product_id' => 2, 'product_option_id' => 11, 'subtotal' => 7000, 'discounted_subtotal' => 7000, 'order_discount_share' => 0],
        ];
        $prepared = [
            ['product_id' => 1, 'product_option_id' => 10, 'product' => $this->makeProduct([1])],
            ['product_id' => 2, 'product_option_id' => 11, 'product' => $this->makeProduct([1])],
        ];

        $reflection = new \ReflectionClass($service);
        $method = $reflection->getMethod('applyOrderCoupon');
        $method->setAccessible(true);

        [$outItems, $appliedPromos, $errors] = $method->invoke($service, $discounted, [$couponIssue], $prepared, null);

        $this->assertEmpty($errors);
        $this->assertNotEmpty($appliedPromos->coupons ?? []);
        $this->assertSame(5000, $this->sumShare($outItems), 'ALL scope: discount 5000 (정액)');
    }

    /**
     * 002: PRODUCTS scope + 매칭 0 → invalidTarget ValidationError.
     */
    public function test_products_scope_zero_match_returns_invalid_target(): void
    {
        $service = $this->makeService();
        $coupon = $this->makeCoupon([
            'discount_type' => 'percent',
            'discount_value' => 10,
            'target_scope' => CouponTargetScope::PRODUCTS,
            'included_product_ids' => [99],
        ]);
        $couponIssue = $this->makeCouponIssue($coupon, 1);

        $discounted = [
            10 => ['product_id' => 1, 'product_option_id' => 10, 'subtotal' => 8000, 'discounted_subtotal' => 8000, 'order_discount_share' => 0],
        ];
        $prepared = [
            ['product_id' => 1, 'product_option_id' => 10, 'product' => $this->makeProduct([1])],
        ];

        [, , $errors] = $this->invokeApplyOrderCoupon($service, $discounted, [$couponIssue], $prepared);
        $this->assertNotEmpty($errors);
        $this->assertSame(ValidationError::invalidTarget(1)->code ?? null, $errors[0]->code ?? null);
    }

    /**
     * 003: PRODUCTS scope + 부분 매칭 → eligible 만으로 할인 재계산 + scope 밖 share=0.
     */
    public function test_products_scope_partial_match_corrects_share(): void
    {
        $service = $this->makeService();
        $coupon = $this->makeCoupon([
            'discount_type' => 'percent',
            'discount_value' => 10,
            'target_scope' => CouponTargetScope::PRODUCTS,
            'included_product_ids' => [1],
        ]);
        $couponIssue = $this->makeCouponIssue($coupon, 1);

        $discounted = [
            10 => ['product_id' => 1, 'product_option_id' => 10, 'subtotal' => 8000, 'discounted_subtotal' => 8000, 'order_discount_share' => 0],
            11 => ['product_id' => 2, 'product_option_id' => 11, 'subtotal' => 20000, 'discounted_subtotal' => 20000, 'order_discount_share' => 0],
        ];
        $prepared = [
            ['product_id' => 1, 'product_option_id' => 10, 'product' => $this->makeProduct([1])],
            ['product_id' => 2, 'product_option_id' => 11, 'product' => $this->makeProduct([1])],
        ];

        [$outItems, , $errors] = $this->invokeApplyOrderCoupon($service, $discounted, [$couponIssue], $prepared);
        $this->assertEmpty($errors);

        $this->assertSame(0, $outItems[11]['order_discount_share'], 'scope 밖 옵션 share == 0');
        $this->assertSame(800, $outItems[10]['order_discount_share'], 'scope 내 옵션만 10% 할인 (8000 의 10%)');
        $this->assertSame(800, $this->sumShare($outItems), '총합 == 800 (전체 28000 의 10% 가 아닌 eligible 8000 의 10%)');
    }

    /**
     * 004: CATEGORIES scope + 부분 매칭 → 동일 시맨틱.
     */
    public function test_categories_scope_partial_match(): void
    {
        $service = $this->makeService();
        $coupon = $this->makeCoupon([
            'discount_type' => 'fixed',
            'discount_value' => 1000,
            'target_scope' => CouponTargetScope::CATEGORIES,
            'included_category_ids' => [10],
        ]);
        $couponIssue = $this->makeCouponIssue($coupon, 1);

        $discounted = [
            10 => ['product_id' => 1, 'product_option_id' => 10, 'subtotal' => 8000, 'discounted_subtotal' => 8000, 'order_discount_share' => 0],
            11 => ['product_id' => 2, 'product_option_id' => 11, 'subtotal' => 20000, 'discounted_subtotal' => 20000, 'order_discount_share' => 0],
        ];
        $prepared = [
            ['product_id' => 1, 'product_option_id' => 10, 'product' => $this->makeProduct([10])],
            ['product_id' => 2, 'product_option_id' => 11, 'product' => $this->makeProduct([20])],
        ];

        [$outItems, , $errors] = $this->invokeApplyOrderCoupon($service, $discounted, [$couponIssue], $prepared);
        $this->assertEmpty($errors);

        $this->assertSame(1000, $outItems[10]['order_discount_share']);
        $this->assertSame(0, $outItems[11]['order_discount_share']);
    }

    /**
     * 005: ALL scope + excluded_product_ids → coupon 보존 (ALL 분기는 excluded 만 차단하지만
     * filterItemsByScope 는 ALL 분기에서 전체 반환 — 시맨틱 동일). 보정 경로에서도 전체 합계
     * 기준으로 동작.
     */
    public function test_all_scope_with_excluded_runs_through_correction(): void
    {
        $service = $this->makeService();
        $coupon = $this->makeCoupon([
            'discount_type' => 'fixed',
            'discount_value' => 3000,
            'target_scope' => CouponTargetScope::ALL,
            'excluded_product_ids' => [2],
        ]);
        $couponIssue = $this->makeCouponIssue($coupon, 1);

        $discounted = [
            10 => ['product_id' => 1, 'product_option_id' => 10, 'subtotal' => 8000, 'discounted_subtotal' => 8000, 'order_discount_share' => 0],
            11 => ['product_id' => 2, 'product_option_id' => 11, 'subtotal' => 20000, 'discounted_subtotal' => 20000, 'order_discount_share' => 0],
        ];
        $prepared = [
            ['product_id' => 1, 'product_option_id' => 10, 'product' => $this->makeProduct([1])],
            ['product_id' => 2, 'product_option_id' => 11, 'product' => $this->makeProduct([1])],
        ];

        [$outItems, , $errors] = $this->invokeApplyOrderCoupon($service, $discounted, [$couponIssue], $prepared);
        $this->assertEmpty($errors);

        // ALL scope — 전체 합계 28000 ≥ 3000 → 3000 정액 적용
        $this->assertSame(3000, $this->sumShare($outItems));
    }

    /**
     * 006: INVARIANT 검증 (scope 보정 후에도 0 ≤ total ≤ eligible).
     */
    public function test_invariant_zero_to_eligible_and_scope_outside_share_zero(): void
    {
        $service = $this->makeService();
        $coupon = $this->makeCoupon([
            'discount_type' => 'percent',
            'discount_value' => 50,
            'target_scope' => CouponTargetScope::PRODUCTS,
            'included_product_ids' => [1],
        ]);
        $couponIssue = $this->makeCouponIssue($coupon, 1);

        $discounted = [
            10 => ['product_id' => 1, 'product_option_id' => 10, 'subtotal' => 10000, 'discounted_subtotal' => 10000, 'order_discount_share' => 0],
            11 => ['product_id' => 2, 'product_option_id' => 11, 'subtotal' => 30000, 'discounted_subtotal' => 30000, 'order_discount_share' => 0],
            12 => ['product_id' => 3, 'product_option_id' => 12, 'subtotal' => 5000, 'discounted_subtotal' => 5000, 'order_discount_share' => 0],
        ];
        $prepared = [
            ['product_id' => 1, 'product_option_id' => 10, 'product' => $this->makeProduct([1])],
            ['product_id' => 2, 'product_option_id' => 11, 'product' => $this->makeProduct([1])],
            ['product_id' => 3, 'product_option_id' => 12, 'product' => $this->makeProduct([1])],
        ];

        [$outItems, , ] = $this->invokeApplyOrderCoupon($service, $discounted, [$couponIssue], $prepared);

        $total = $this->sumShare($outItems);
        $this->assertGreaterThanOrEqual(0, $total);
        $this->assertLessThanOrEqual(10000, $total, 'total ≤ eligible (10000)');
        $this->assertSame(0, $outItems[11]['order_discount_share']);
        $this->assertSame(0, $outItems[12]['order_discount_share']);
    }

    private function sumShare(array $items): int
    {
        $sum = 0;
        foreach ($items as $item) {
            $sum += (int) ($item['order_discount_share'] ?? 0);
        }

        return $sum;
    }

    private function invokeApplyOrderCoupon($service, array $discounted, array $coupons, array $prepared): array
    {
        $reflection = new \ReflectionClass($service);
        $method = $reflection->getMethod('applyOrderCoupon');
        $method->setAccessible(true);

        return $method->invoke($service, $discounted, $coupons, $prepared, null);
    }

    /**
     * CouponTargetScope 를 가진 Coupon 스텁. ScopedOrderCalculationService::applyOrderCoupon 은
     * 부모 filterItemsByScope (protected) 를 호출하므로 target_scope / 관계 구조가 정합해야 한다.
     */
    protected function makeCoupon(array $config): object
    {
        return new class($config) {
            public $discount_type;
            public $discount_value;
            public $target_scope;
            public $min_order_amount;
            public $discount_max_amount;
            public $target_type;
            public $includedProducts;
            public $excludedProducts;
            public $includedCategories;
            public $excludedCategories;

            public function __construct(array $cfg)
            {
                $scope = $cfg['target_scope'] ?? null;
                if ($scope instanceof \Modules\Sirsoft\Ecommerce\Enums\CouponTargetScope) {
                    $this->target_scope = $scope;
                } else {
                    $this->target_scope = is_object($scope) && property_exists($scope, 'value')
                        ? $scope
                        : (object) ['value' => is_string($scope) ? $scope : 'all'];
                }

                $this->discount_type = (object) ['value' => $cfg['discount_type']];
                $this->target_type = (object) ['value' => 'order'];
                $this->discount_value = $cfg['discount_value'];
                $this->min_order_amount = $cfg['min_order_amount'] ?? 0;
                $this->discount_max_amount = $cfg['discount_max_amount'] ?? 0;
                $this->includedProducts = collect(array_map(fn ($id) => (object) ['id' => $id], $cfg['included_product_ids'] ?? []));
                $this->excludedProducts = collect(array_map(fn ($id) => (object) ['id' => $id], $cfg['excluded_product_ids'] ?? []));
                $this->includedCategories = collect(array_map(fn ($id) => (object) ['id' => $id], $cfg['included_category_ids'] ?? []));
                $this->excludedCategories = collect(array_map(fn ($id) => (object) ['id' => $id], $cfg['excluded_category_ids'] ?? []));
            }

            public function getLocalizedName(): string
            {
                return 'Test Coupon';
            }
        };
    }

    protected function makeCouponIssue(object $coupon, int $id): object
    {
        return new class($coupon, $id) {
            public $id;
            public $coupon;

            public function __construct($coupon, $id)
            {
                $this->coupon = $coupon;
                $this->id = $id;
            }
        };
    }

    protected function makeProduct(array $categoryIds): object
    {
        return new class($categoryIds) {
            public $categories;

            public function __construct(array $ids)
            {
                $this->categories = collect(array_map(fn ($id) => (object) ['id' => $id], $ids));
            }
        };
    }

    /**
     * ScopedOrderCalculationService 인스턴스를 reflection 으로 생성 (생성자 의존성 우회).
     */
    private function makeService(): ScopedOrderCalculationService
    {
        return (new \ReflectionClass(ScopedOrderCalculationService::class))->newInstanceWithoutConstructor();
    }
}
