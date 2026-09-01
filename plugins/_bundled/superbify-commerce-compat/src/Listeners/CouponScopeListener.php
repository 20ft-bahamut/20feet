<?php

namespace Plugins\Superbify\Commerce\Compat\Listeners;

use App\Contracts\Extension\HookListenerInterface;

/**
 * CouponScopeListener
 *
 * WHY: sirsoft-ecommerce 1.1.2 의 applyOrderCoupon (OrderCalculationService.php:1376-1452) 은
 * filterItemsByScope (같은 파일 1940-1981) 호출 없이 전체 합계에 할인을 적용한다. 따라서
 * target_scope=PRODUCTS|CATEGORIES 쿠폰이 scope 밖 항목을 포함한 합계로 계산되어, scope 외
 * 항목에도 할인이 안분되는 SEC-COUPON-002 결함이 발생한다.
 *
 * 결함 보정 경로: 본 리스너는 별도 필터 훅을 구독하지 않고, CompatServiceProvider 가
 * OrderCalculationService 컨테이너 바인딩을 ScopedOrderCalculationService 로 교체한다.
 * ScopedOrderCalculationService::applyOrderCoupon 는 부모 시그니처/리턴 형식을 유지하며
 * 통상 모드에서만 scope 보정을 수행하고 스냅샷 모드(취소 재계산)는 부모 동작을 그대로
 * 보존한다.
 *
 * HookListenerInterface 구현체로 등록되도록 getSubscribedHooks() 를 노출하지만, 실제로
 * 구독하는 훅은 없다 (scope 보정은 컨테이너 바인딩 경로로 처리). 이는 정책상 모듈이
 * 노출하지 않는 비공식 훅 이름을 선언하지 않기 위함이다.
 *
 * TARGET DEFECT: SEC-COUPON-002.
 *
 * DETECTION: coupon.target_scope != ALL && eligible_subtotal < total_subtotal.
 *
 * REMOVE WHEN: sirsoft-ecommerce > 1.1.2 에서 applyOrderCoupon 이 filterItemsByScope 를
 * 호출하는 버전이 릴리스되면 ScopedOrderCalculationService 와 함께 본 클래스를 제거한다.
 */
class CouponScopeListener implements HookListenerInterface
{
    /**
     * @return array<string, array{method?: string, priority?: int, type?: string, sync?: bool}>
     */
    public static function getSubscribedHooks(): array
    {
        // scope 보정은 CompatServiceProvider 의 컨테이너 바인딩 경로로 처리되므로
        // 별도 필터/액션 훅을 구독하지 않는다. 시그니처 유지를 위해 빈 배열 반환.
        return [];
    }

    /**
     * @param  mixed  ...$args
     * @return void
     */
    public function handle(...$args): void
    {
        // no-op: scope 보정은 ScopedOrderCalculationService::applyOrderCoupon 에서 처리.
    }
}
