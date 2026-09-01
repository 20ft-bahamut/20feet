<?php

namespace Plugins\Superbify\Commerce\Compat\Services;

use Illuminate\Support\Facades\DB;
use Modules\Sirsoft\Ecommerce\Exceptions\InsufficientStockException;
use Modules\Sirsoft\Ecommerce\Repositories\Contracts\ProductOptionRepositoryInterface;

/**
 * StockReservationService
 *
 * WHY: sirsoft-ecommerce 1.1.2 의 StockService 는 재고 검증 후 즉시 차감만 한다. 결제 진행
 * 중 임시주문이 재고를 점유하지 않아 동시 주문 시 두 주문이 validateStock 를 통과한 뒤
 * deductStock 단계에서 한 주문이 부족 예외를 받는 race 가 발생한다 (SEC-STOCK-001). 본
 * 서비스는 cart.before_add / order.before_create / stock.after_deduct / stock.after_restore
 * 훅에서 호출되어 available = stock - SUM(active reservations) 로 가용 재고를 보장한다.
 * 만료된 예약은 ExpireStockReservationsCommand 가 30분 간격으로 expired 처리한다.
 *
 * TARGET DEFECT: SEC-STOCK-001 / OUT-OF-STOCK.
 *
 * DETECTION: SUM(qty WHERE status='active' AND product_option_id=?) > option.stock_quantity.
 *
 * REMOVE WHEN: sirsoft-ecommerce 가 자체 reservation/oversell 방지 메커니즘을 도입하면.
 */
class StockReservationService
{
    public function __construct(
        protected ProductOptionRepositoryInterface $optionRepository
    ) {}

    /**
     * 특정 옵션의 가용 재고 = stock_quantity - SUM(active reservations).
     */
    public function available(int $productOptionId): int
    {
        $option = $this->optionRepository->findById($productOptionId);
        if (! $option) {
            return 0;
        }

        $reserved = (int) DB::table('ecommerce_stock_reservations')
            ->where('product_option_id', $productOptionId)
            ->where('status', 'active')
            ->sum('qty');

        return max(0, ((int) $option->stock_quantity) - $reserved);
    }

    /**
     * 주어진 옵션+수량으로 cart.before_add 시 가용성을 검증. 부족 시 InsufficientStockException
     * throw — StockReservationListener 가 catch 하여 CartUnavailableException 으로 wrapping.
     *
     * @throws InsufficientStockException
     */
    public function assertAvailableForCartAdd(int $productOptionId, int $quantity): void
    {
        if ($quantity <= 0) {
            return;
        }

        $available = $this->available($productOptionId);

        if ($available < $quantity) {
            $option = $this->optionRepository->findById($productOptionId);
            $productName = $option && $option->product ? $option->product->getLocalizedName() : '';
            $optionName = $option ? $option->getLocalizedOptionName() : '';

            throw new InsufficientStockException(
                __('sirsoft-ecommerce::messages.stock.insufficient', [
                    'product_name' => $productName,
                    'option_name' => $optionName,
                    'available' => $available,
                    'requested' => $quantity,
                ])
            );
        }
    }

    /**
     * order.before_create 시 tempOrder items 의 가용성을 검증. 부족 시 InsufficientStockException
     * — OrderProcessingService catch 가 422 변환.
     *
     * @param  array  $items  [['product_option_id'=>int, 'quantity'=>int], ...]
     * @throws InsufficientStockException
     */
    public function assertAvailableForOrder(array $items): void
    {
        foreach ($items as $item) {
            $optionId = (int) ($item['product_option_id'] ?? 0);
            $quantity = (int) ($item['quantity'] ?? 0);
            if ($optionId <= 0 || $quantity <= 0) {
                continue;
            }

            $available = $this->available($optionId);
            if ($available < $quantity) {
                $option = $this->optionRepository->findById($optionId);
                $productName = $option && $option->product ? $option->product->getLocalizedName() : '';
                $optionName = $option ? $option->getLocalizedOptionName() : '';

                throw new InsufficientStockException(
                    __('sirsoft-ecommerce::messages.stock.insufficient', [
                        'product_name' => $productName,
                        'option_name' => $optionName,
                        'available' => $available,
                        'requested' => $quantity,
                    ])
                );
            }
        }
    }

    /**
     * 예약 생성 — order.before_create 시 temp_order_id 토큰으로 활성 예약 잡는다.
     * 멱등: 동일 token 으로 재호출 시 기존 active 예약을 그대로 사용한다.
     */
    public function reserve(int $productOptionId, int $quantity, string $token, ?int $orderId = null, ?\DateTimeInterface $expiresAt = null): void
    {
        if ($quantity <= 0 || $token === '') {
            return;
        }

        // 멱등 가드 — 동일 token 의 active 예약이 있으면 그대로 둠
        $existing = DB::table('ecommerce_stock_reservations')
            ->where('token', $token)
            ->where('product_option_id', $productOptionId)
            ->where('status', 'active')
            ->first();

        if ($existing) {
            return;
        }

        DB::table('ecommerce_stock_reservations')->insert([
            'product_option_id' => $productOptionId,
            'order_id' => $orderId,
            'qty' => $quantity,
            'status' => 'active',
            'source' => 'order',
            'token' => $token,
            'expires_at' => $expiresAt?->format('Y-m-d H:i:s'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * 주문 ID 기준 모든 active 예약을 consumed 로 전환 (stock.after_deduct).
     * 멱등: 이미 consumed 인 것은 스킵.
     */
    public function consumeForOrder(int $orderId): int
    {
        return DB::table('ecommerce_stock_reservations')
            ->where('order_id', $orderId)
            ->where('status', 'active')
            ->update([
                'status' => 'consumed',
                'updated_at' => now(),
            ]);
    }

    /**
     * 주문 ID 기준 모든 active 예약을 released 로 전환 (stock.after_restore).
     * 멱등: 이미 released 인 것은 스킵.
     */
    public function releaseForOrder(int $orderId): int
    {
        return DB::table('ecommerce_stock_reservations')
            ->where('order_id', $orderId)
            ->where('status', 'active')
            ->update([
                'status' => 'released',
                'updated_at' => now(),
            ]);
    }

    /**
     * 만료 대상 active 예약을 expired 로 전환 (ExpireStockReservationsCommand).
     */
    public function expireOverdue(): int
    {
        return DB::table('ecommerce_stock_reservations')
            ->where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->update([
                'status' => 'expired',
                'updated_at' => now(),
            ]);
    }

    /**
     * 만료 시각 산출 — order_settings.auto_cancel_days 가 있으면 그에 따르고, 없으면
     * null (정책 미정). 임의 TTL 금지.
     */
    public function resolveExpiry(?array $orderSettings): ?\DateTimeImmutable
    {
        $days = (int) ($orderSettings['auto_cancel_days'] ?? 0);
        if ($days <= 0) {
            return null;
        }

        return (new \DateTimeImmutable())->modify('+'.$days.' days');
    }
}
