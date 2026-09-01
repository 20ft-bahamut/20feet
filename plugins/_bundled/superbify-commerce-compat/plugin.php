<?php

namespace Plugins\Superbify\Commerce\Compat;

use App\Extension\AbstractPlugin;
use Plugins\Superbify\Commerce\Compat\Console\Commands\ExpireStockReservationsCommand;
use Plugins\Superbify\Commerce\Compat\Listeners\CouponScopeListener;
use Plugins\Superbify\Commerce\Compat\Listeners\OptionGroupsDerivationListener;
use Plugins\Superbify\Commerce\Compat\Listeners\PaymentMethodGuardListener;
use Plugins\Superbify\Commerce\Compat\Listeners\StockReservationListener;

/**
 * SuperBify 커머스 컴패터블 플러그인.
 *
 * sirsoft-ecommerce 1.1.2 의 공식 Hook 확장점(doAction / applyFilters)에서
 * 4종 결함을 보완한다. 본 플러그인은 모듈 원본을 수정하지 않고 선언된 훅에만
 * 개입한다.
 *
 * - FIX 1 (SEC-COUPON-002): CouponScopeListener — product.after_read 후속 보정과
 *   order.before_create 흐름의 보정 서비스를 통해 applyOrderCoupon 의 scope 결함을
 *   보완한다 (ScopedOrderCalculationService 가 OrderCalculationService 를 컨테이너
 *   바인딩으로 대체).
 *   TARGET DEFECT: order coupon scope-out 항목도 할인에 포함되는 결함
 *   (OrderCalculationService::applyOrderCoupon 이 filterItemsByScope 를 호출하지 않음).
 *   DETECTION: coupon.target_scope != ALL && eligible_subtotal < total_subtotal.
 *   REMOVE WHEN: sirsoft-ecommerce > 1.1.2 에서 applyOrderCoupon 이 filterItemsByScope 를
 *   호출하게 되면 (릴리스 노트 확인) ScopedOrderCalculationService + CouponScopeListener 를 제거.
 *
 * - FIX 2 (PAY-006/002/005): PaymentMethodGuardListener — order.create_validation_rules 후미에
 *   settings 기반 활성/PG provider 가용성 룰을 추가한다.
 *   TARGET DEFECT: 화이트리스트(Rule::in) 만 통과해 PG 라우팅 실패로 generic 500 이 떨어지는 결함.
 *   DETECTION: payment_method is inactive in order_settings OR needs_pg=true 인데
 *   default_pg_provider 가 미등록.
 *   REMOVE WHEN: CreateOrderRequest 가 settings 기반 활성/PG provider 검증을 내장하면.
 *
 * - FIX 3 (OPT-020): OptionGroupsDerivationListener — product.after_read 훅에서 option_groups 가
 *   null/[]/'' 인 경우 activeOptions 로 in-memory 파생 (저장 금지).
 *   TARGET DEFECT: getDetail() 호출 시 option_groups 가 비어 채워진 1D 회귀.
 *   DETECTION: Product.option_groups == null/[]/'' && activeOptions.count >= 1.
 *   REMOVE WHEN: sirsoft-ecommerce 가 getDetail() 내에서 자동 rebuildOptionGroups 를 호출.
 *
 * - FIX 4 (SEC-STOCK-001 / OUT-OF-STOCK): StockReservationListener + Service + Migration + Command.
 *   cart.before_add 에서 available=stock-SUM(active) 검증, order.before_create 에서 active 예약
 *   생성, stock.after_deduct 에서 consumed 전환, stock.after_restore 에서 released 전환.
 *   부족 예외는 InsufficientStockException 으로 던져 HandlesOrderCreation catch 가 422 로 변환.
 *   TARGET DEFECT: 동시 주문 race 와 결제 미완료 임시주문이 재고를 점유하지 않는 결함.
 *   DETECTION: SUM(qty WHERE status=active) > option.stock_quantity 인 경우.
 *   REMOVE WHEN: sirsoft-ecommerce 가 자체 reservation/oversell 방지 메커니즘을 도입하면.
 */
class Plugin extends AbstractPlugin
{
    public function getMetadata(): array
    {
        return [
            'author' => 'SuperBify',
            'license' => 'MIT',
            'keywords' => ['ecommerce', 'compat', 'security', 'stock', 'coupon', 'payment', 'option-groups'],
        ];
    }

    /**
     * 훅 리스너 목록 반환.
     *
     * PluginManager::registerPluginHookListeners (app/Extension/PluginManager.php:2943) 가
     * 이 배열의 각 엔트리가 HookListenerInterface 를 구현하는 리스너 클래스 이름이라고 가정한다.
     * 각 클래스의 정적 `getSubscribedHooks()` 가 자신의 구독 훅을 선언한다. type=filter 는
     * 항상 동기, type=action + sync=true 는 동기 실행.
     *
     * @return array<int, string> HookListenerInterface 구현 FQCN 목록
     */
    public function getHookListeners(): array
    {
        return [
            // FIX 1 — coupon scope corrector (SEC-COUPON-002)
            // 자체 선언한 before/after discount/payment 훅은 모듈에 존재하지 않으므로 제거.
            // 동일 효과는 ScopedOrderCalculationService 가 OrderCalculationService 컨테이너
            // 바인딩을 대체하여 applyOrderCoupon 호출 시점에 즉시 적용한다.
            CouponScopeListener::class,

            // FIX 2 — payment method availability guard (PAY-006/002/005)
            PaymentMethodGuardListener::class,

            // FIX 3 — option_groups derivation (OPT-020)
            OptionGroupsDerivationListener::class,

            // FIX 4 — stock reservation (SEC-STOCK-001 / OUT-OF-STOCK)
            StockReservationListener::class,
        ];
    }

    /**
     * 스케줄 작업 — 예약 만료 처리 (30분 간격).
     *
     * AbstractPlugin::getSchedules() 반환 형식과 동일 — 코어 스케줄러가 plugin-specific
     * schedule 등록을 처리한다. command 는 artisan command ID 문자열.
     */
    public function getSchedules(): array
    {
        return [
            [
                'command' => 'superbify-commerce-compat:expire-stock-reservations',
                'schedule' => 'everyThirtyMinutes',
                'description' => '만료된 재고 예약을 released 상태로 전환하여 옵션의 가용 재고를 복구합니다.',
            ],
        ];
    }

    /**
     * 동적 테이블 — uninstall 시 일괄 삭제 대상.
     */
    public function getDynamicTables(): array
    {
        return ['ecommerce_stock_reservations'];
    }

    // 콘솔 커맨드 등록은 src/Providers/CompatServiceProvider::boot() ($this->commands()) 담당.
    // AbstractPlugin 은 $app 프로퍼티가 없으므로 activate() 오버라이드에서 컨테이너에 접근하지 않는다.
}
