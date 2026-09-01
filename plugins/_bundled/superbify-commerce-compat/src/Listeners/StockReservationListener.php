<?php

namespace Plugins\Superbify\Commerce\Compat\Listeners;

use App\Contracts\Extension\HookListenerInterface;
use Illuminate\Support\Facades\DB;
use Modules\Sirsoft\Ecommerce\Exceptions\CartUnavailableException;
use Modules\Sirsoft\Ecommerce\Exceptions\InsufficientStockException;
use Plugins\Superbify\Commerce\Compat\Services\StockReservationService;

/**
 * StockReservationListener
 *
 * WHY: sirsoft-ecommerce 1.1.2 의 StockService 가 옵션 재고만 검증/차감하여, 동시 주문 race 와
 * 결제 진행 중 임시주문이 재고를 점유하지 않는 결함이 있다 (SEC-STOCK-001). 본 리스너는
 * cart.before_add / order.before_create / stock.after_deduct / stock.after_restore 훅에서
 * 호출되어 available = stock - SUM(active reservations) 로 가용 재고를 검증하고, 결제
 * 확정 시 reservation → consumed 전환을, 주문 취소/환불 시 released 전환을 한다.
 *
 * - cart.before_add (doAction)         : CartService.php:188 — $data. 부족 시
 *   CartUnavailableException → CartController 가 422 cart_unavailable 로 매핑.
 * - order.before_create (doAction)     : OrderProcessingService.php:112 —
 *   ($tempOrder,$ordererInfo,$shippingInfo,$paymentMethod). 부족 시
 *   InsufficientStockException → HandlesOrderCreation catch 가 422 변환.
 * - stock.after_deduct (doAction)      : StockService.php:115 — $order. active → consumed.
 * - stock.after_restore (doAction)     : StockService.php:157 — $order. active → released.
 *
 * TARGET DEFECT: SEC-STOCK-001 / OUT-OF-STOCK.
 *
 * REMOVE WHEN: sirsoft-ecommerce 가 자체 reservation/oversell 방지 메커니즘을 도입하면.
 */
class StockReservationListener implements HookListenerInterface
{
    public function __construct(protected StockReservationService $service) {}

    /**
     * 4개 액션 훅에 구독. 모두 doAction 이고 in-process mutation 임무이므로 sync=true.
     *
     * - cart.before_add     (CartService::addToCart — line 188)
     * - order.before_create (OrderProcessingService::processOrder — line 112)
     * - stock.after_deduct  (StockService::deductStock — line 115)
     * - stock.after_restore (StockService::restoreStock — line 157)
     */
    public static function getSubscribedHooks(): array
    {
        return [
            'sirsoft-ecommerce.cart.before_add' => [
                'method' => 'handleCartBeforeAdd',
                'priority' => 20,
                'type' => 'action',
                'sync' => true,
            ],
            'sirsoft-ecommerce.order.before_create' => [
                'method' => 'handleOrderBeforeCreate',
                'priority' => 20,
                'type' => 'action',
                'sync' => true,
            ],
            'sirsoft-ecommerce.stock.after_deduct' => [
                'method' => 'handleStockAfterDeduct',
                'priority' => 20,
                'type' => 'action',
                'sync' => true,
            ],
            'sirsoft-ecommerce.stock.after_restore' => [
                'method' => 'handleStockAfterRestore',
                'priority' => 20,
                'type' => 'action',
                'sync' => true,
            ],
        ];
    }

    /**
     * HookListenerInterface::handle — 4개 액션을 구독하므로 단일 entry 가 아닌
     * 각각의 method 키로 호출된다. 본 메서드는 단일 구독이 아닌 라우터로 사용한다.
     *
     * @param  mixed  ...$args
     * @return void
     */
    public function handle(...$args): void
    {
        // 라우팅 — HookListenerRegistrar 가 method 키를 직접 지정하므로 일반적으로는
        // 도달하지 않는다. 도달 시 첫 인자에 따라 분기 (방어적 fallback).
        $first = $args[0] ?? null;
        $hookName = \App\Extension\HookManager::getRunningHook();

        if ($hookName === 'sirsoft-ecommerce.cart.before_add') {
            $this->handleCartBeforeAdd(...$args);

            return;
        }
        if ($hookName === 'sirsoft-ecommerce.order.before_create') {
            $this->handleOrderBeforeCreate(...$args);

            return;
        }
        if ($hookName === 'sirsoft-ecommerce.stock.after_deduct') {
            $this->handleStockAfterDeduct(...$args);

            return;
        }
        if ($hookName === 'sirsoft-ecommerce.stock.after_restore') {
            $this->handleStockAfterRestore(...$args);

            return;
        }

        // hookName 알 수 없음 — 첫 인자 타입으로 추론 (방어적).
        if (is_array($first)) {
            $this->handleCartBeforeAdd(...$args);
        } elseif (is_object($first)) {
            $this->handleStockAfterDeduct(...$args);
        }
    }

    /**
     * Hook: sirsoft-ecommerce.cart.before_add (doAction)
     *
     * CartService::addToCart 가 호출되며 첫 인자는 array $data. 옵션+수량 부족 시
     * CartUnavailableException throw → CartController::store 의 catch 블록에서
     * 422 cart_unavailable 코드로 매핑된다 (CartController.php:155).
     *
     * @param  mixed  $data
     * @param  mixed  ...$args
     * @return void
     */
    public function handleCartBeforeAdd($data = null, ...$args): void
    {
        if (! is_array($data)) {
            return;
        }

        $optionId = (int) ($data['product_option_id'] ?? 0);
        $quantity = (int) ($data['quantity'] ?? 0);

        if ($optionId <= 0 || $quantity <= 0) {
            return;
        }

        try {
            $this->service->assertAvailableForCartAdd($optionId, $quantity);
        } catch (InsufficientStockException $e) {
            // CartController 의 catch 가 422 cart_unavailable 로 매핑.
            throw new CartUnavailableException(
                $e->getMessage(),
                [['product_option_id' => $optionId, 'available' => $this->service->available($optionId), 'requested' => $quantity]]
            );
        }
    }

    /**
     * Hook: sirsoft-ecommerce.order.before_create (doAction)
     *
     * OrderProcessingService::processOrder 가 호출되며 args: ($tempOrder, $ordererInfo,
     * $shippingInfo, $paymentMethod). tempOrder.items 의 각 라인에 대해 가용 재고 검증.
     * 부족 시 InsufficientStockException throw — OrderProcessingService 의 catch 블록이
     * 422 로 변환한다. 통과 시 temp_order_id 토큰으로 active 예약 생성 (멱등).
     *
     * @param  mixed  $tempOrder
     * @param  mixed  $ordererInfo
     * @param  mixed  $shippingInfo
     * @param  mixed  $paymentMethod
     * @param  mixed  ...$args
     * @return void
     */
    public function handleOrderBeforeCreate($tempOrder = null, $ordererInfo = null, $shippingInfo = null, $paymentMethod = null, ...$args): void
    {
        if (! is_object($tempOrder)) {
            return;
        }

        $items = $tempOrder->items ?? [];
        if (! is_array($items) || empty($items)) {
            return;
        }

        // 가용성 검증 — 부족 시 InsufficientStockException (OrderProcessingService::catch 가 422 변환)
        $this->service->assertAvailableForOrder($items);

        // temp_order_id 토큰으로 active 예약 생성 (멱등: 재호출 시 기존 active 유지)
        $token = 'temp_order:'.((int) $tempOrder->id);
        $expiresAt = $this->service->resolveExpiry($this->loadOrderSettings());

        foreach ($items as $item) {
            $optionId = (int) ($item['product_option_id'] ?? 0);
            $quantity = (int) ($item['quantity'] ?? 0);
            if ($optionId <= 0 || $quantity <= 0) {
                continue;
            }
            $this->service->reserve($optionId, $quantity, $token, null, $expiresAt);
        }
    }

    /**
     * Hook: sirsoft-ecommerce.stock.after_deduct (doAction)
     *
     * StockService::deductStock 가 호출되며 args: ($order). token=temp_order:* 인 active
     * 예약을 order_id 매핑 후 consumed 로 전환. 멱등 가드 포함.
     *
     * @param  mixed  $order
     * @param  mixed  ...$args
     * @return void
     */
    public function handleStockAfterDeduct($order = null, ...$args): void
    {
        if (! is_object($order)) {
            return;
        }

        $orderId = (int) ($order->id ?? 0);
        if ($orderId <= 0) {
            return;
        }

        // token=temp_order:* 예약을 order_id 로 매핑 후 consumed 전환.
        DB::table('ecommerce_stock_reservations')
            ->whereNull('order_id')
            ->where('status', 'active')
            ->where('source', 'order')
            ->update([
                'order_id' => $orderId,
                'status' => 'consumed',
                'updated_at' => now(),
            ]);

        // 안전망: 동일 order_id 의 active 가 남아있으면 consumed 전환 (멱등 가드).
        $this->service->consumeForOrder($orderId);
    }

    /**
     * Hook: sirsoft-ecommerce.stock.after_restore (doAction)
     *
     * StockService::restoreStock 가 호출되며 args: ($order). order_id 기준 active 예약을
     * released 로 전환 (취소/환불 시점 재고 복원에 맞춰 가용 재고 회복). 멱등 가드 포함.
     *
     * @param  mixed  $order
     * @param  mixed  ...$args
     * @return void
     */
    public function handleStockAfterRestore($order = null, ...$args): void
    {
        if (! is_object($order)) {
            return;
        }

        $orderId = (int) ($order->id ?? 0);
        if ($orderId <= 0) {
            return;
        }

        $this->service->releaseForOrder($orderId);
    }

    /**
     * order_settings 안전 조회 — 모듈 service 가 container 에 없으면 빈 배열.
     */
    protected function loadOrderSettings(): array
    {
        if (! class_exists('\Modules\\Sirsoft\\Ecommerce\\Services\\EcommerceSettingsService')) {
            return [];
        }

        try {
            $service = app(\Modules\Sirsoft\Ecommerce\Services\EcommerceSettingsService::class);

            return $service->getSettings('order_settings');
        } catch (\Throwable $e) {
            return [];
        }
    }
}
