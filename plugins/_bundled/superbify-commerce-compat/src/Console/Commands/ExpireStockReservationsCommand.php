<?php

namespace Plugins\Superbify\Commerce\Compat\Console\Commands;

use Illuminate\Console\Command;
use Plugins\Superbify\Commerce\Compat\Services\StockReservationService;

/**
 * superbify-commerce-compat:expire-stock-reservations
 *
 * 활성 예약은 expires_at 이 지나면 옵션의 가용 재고에서 제외되어야 한다 (SEC-STOCK-001).
 * 본 커맨드는 expires_at <= now 인 active 예약을 expired 로 마크하여 available 계산에서
 * 제외한다. Plugin::getSchedules() 가 30분 간격으로 이 커맨드를 스케줄한다.
 *
 * 주의: auto_cancel_days 가 미설정이면 expires_at 자체가 NULL 이므로 이 커맨드의 대상이
 * 없다 (정책 미정). 임의 TTL 은 적용하지 않는다.
 */
class ExpireStockReservationsCommand extends Command
{
    protected $signature = 'superbify-commerce-compat:expire-stock-reservations';

    protected $description = 'expires_at 이 경과한 active 재고 예약을 expired 로 전환하여 가용 재고를 복구합니다.';

    public function handle(StockReservationService $service): int
    {
        $count = $service->expireOverdue();

        $this->info(sprintf('재고 예약 만료 처리: %d 건', $count));

        return self::SUCCESS;
    }
}
