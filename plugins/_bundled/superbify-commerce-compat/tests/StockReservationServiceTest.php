<?php

namespace Plugins\Superbify\Commerce\Compat\Tests;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Modules\Sirsoft\Ecommerce\Exceptions\InsufficientStockException;
use Plugins\Superbify\Commerce\Compat\Services\StockReservationService;

/**
 * STOCK-001..010: StockReservationService 단위/통합 테스트.
 *
 * 시나리오:
 * - 001: 가용 재고 = stock - SUM(active).
 * - 002: cart add 시 부족 → 예외.
 * - 003: order create 시 부족 → 예외.
 * - 004: 예약 생성 → 상태 active.
 * - 005: reservation consume (order.id) → 상태 consumed.
 * - 006: reservation release (order.id) → 상태 released.
 * - 007: expireOverdue → expires_at < now → expired.
 * - 008: token 멱등 — 동일 token 재호출 시 row 추가 없음.
 * - 009: min_order_amount 와 무관하게 stock 만 본다 (qty > available 시 차단).
 * - 010: auto_cancel_days 설정 → expires_at 세팅.
 */
class StockReservationServiceTest extends CompatTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // 본 픽스의 마이그레이션이 schema 에 포함되었는지 확인. 없으면 스킵 (RefreshDatabase 가 처리).
        if (! Schema::hasTable('ecommerce_stock_reservations')) {
            $this->markTestSkipped('ecommerce_stock_reservations 테이블 미생성 (마이그레이션 부재)');
        }

        // 깨끗한 reservation 테이블 보장
        DB::table('ecommerce_stock_reservations')->delete();
    }

    /**
     * STOCK-001: 가용 재고 = stock - SUM(active reservations).
     */
    public function test_available_subtracts_active_reservations(): void
    {
        $option = $this->makeOptionStub(10); // stock=10
        $repo = $this->makeOptionRepositoryStub([10 => $option]);
        $service = new StockReservationService($repo);

        $this->assertSame(10, $service->available(10));

        $service->reserve(10, 3, 'token-a');
        $this->assertSame(7, $service->available(10));

        $service->reserve(10, 5, 'token-b');
        $this->assertSame(2, $service->available(10));

        // consumed 된 것은 제외
        $service->reserve(10, 4, 'token-c', 999);
        DB::table('ecommerce_stock_reservations')->where('token', 'token-c')->update(['status' => 'consumed']);
        $this->assertSame(2, $service->available(10));

        // released 된 것도 제외
        DB::table('ecommerce_stock_reservations')->where('token', 'token-a')->update(['status' => 'released']);
        $this->assertSame(7, $service->available(10));
    }

    /**
     * STOCK-002: cart.before_add 의 가용성 검증 — 부족 시 예외.
     */
    public function test_cart_add_rejects_when_insufficient(): void
    {
        $option = $this->makeOptionStub(5);
        $repo = $this->makeOptionRepositoryStub([5 => $option]);
        $service = new StockReservationService($repo);

        $service->reserve(5, 3, 'token-pre');

        $this->expectException(InsufficientStockException::class);
        $service->assertAvailableForCartAdd(5, 5); // 5 > 2
    }

    /**
     * STOCK-003: order.before_create 의 가용성 검증.
     */
    public function test_order_create_rejects_when_insufficient(): void
    {
        $option = $this->makeOptionStub(5);
        $repo = $this->makeOptionRepositoryStub([5 => $option]);
        $service = new StockReservationService($repo);

        $service->reserve(5, 3, 'token-pre');

        $this->expectException(InsufficientStockException::class);
        $service->assertAvailableForOrder([['product_option_id' => 5, 'quantity' => 5]]);
    }

    /**
     * STOCK-004: 예약 생성 후 row 가 active 상태로 들어간다.
     */
    public function test_reservation_inserts_with_active_status(): void
    {
        $option = $this->makeOptionStub(10);
        $repo = $this->makeOptionRepositoryStub([10 => $option]);
        $service = new StockReservationService($repo);

        $service->reserve(10, 4, 'token-001', null, (new \DateTimeImmutable())->modify('+1 day'));

        $row = DB::table('ecommerce_stock_reservations')->where('token', 'token-001')->first();
        $this->assertNotNull($row);
        $this->assertSame('active', $row->status);
        $this->assertSame(4, (int) $row->qty);
        $this->assertNotNull($row->expires_at);
    }

    /**
     * STOCK-005: consumeForOrder → consumed 전환.
     */
    public function test_consume_for_order_marks_active_as_consumed(): void
    {
        $option = $this->makeOptionStub(10);
        $repo = $this->makeOptionRepositoryStub([10 => $option]);
        $service = new StockReservationService($repo);

        $service->reserve(10, 4, 'token-001', 100);
        $count = $service->consumeForOrder(100);

        $this->assertSame(1, $count);
        $this->assertSame('consumed', DB::table('ecommerce_stock_reservations')->where('token', 'token-001')->value('status'));
    }

    /**
     * STOCK-006: releaseForOrder → released 전환.
     */
    public function test_release_for_order_marks_active_as_released(): void
    {
        $option = $this->makeOptionStub(10);
        $repo = $this->makeOptionRepositoryStub([10 => $option]);
        $service = new StockReservationService($repo);

        $service->reserve(10, 4, 'token-001', 100);
        $count = $service->releaseForOrder(100);

        $this->assertSame(1, $count);
        $this->assertSame('released', DB::table('ecommerce_stock_reservations')->where('token', 'token-001')->value('status'));
    }

    /**
     * STOCK-007: expireOverdue → expires_at < now → expired.
     */
    public function test_expire_overdue_marks_past_reservations_as_expired(): void
    {
        $option = $this->makeOptionStub(10);
        $repo = $this->makeOptionRepositoryStub([10 => $option]);
        $service = new StockReservationService($repo);

        // 과거 expires_at
        $past = (new \DateTimeImmutable())->modify('-1 hour');
        $service->reserve(10, 4, 'token-past', null, $past);
        $service->reserve(10, 4, 'token-future', null, (new \DateTimeImmutable())->modify('+1 day'));

        $count = $service->expireOverdue();
        $this->assertSame(1, $count);
        $this->assertSame('expired', DB::table('ecommerce_stock_reservations')->where('token', 'token-past')->value('status'));
        $this->assertSame('active', DB::table('ecommerce_stock_reservations')->where('token', 'token-future')->value('status'));
    }

    /**
     * STOCK-008: 동일 token 재호출 시 row 가 추가되지 않는다 (멱등).
     */
    public function test_reservation_is_idempotent_on_token(): void
    {
        $option = $this->makeOptionStub(10);
        $repo = $this->makeOptionRepositoryStub([10 => $option]);
        $service = new StockReservationService($repo);

        $service->reserve(10, 4, 'token-idem');
        $service->reserve(10, 4, 'token-idem');
        $service->reserve(10, 4, 'token-idem');

        $count = DB::table('ecommerce_stock_reservations')->where('token', 'token-idem')->count();
        $this->assertSame(1, $count, '동일 token 멱등 — 1 row 만 존재');
    }

    /**
     * STOCK-009: option 존재 + qty > available → 차단, option 없으면 0 + 차단.
     */
    public function test_assert_available_for_order_rejects_missing_option(): void
    {
        $repo = $this->makeOptionRepositoryStub([]);
        $service = new StockReservationService($repo);

        $this->expectException(InsufficientStockException::class);
        $service->assertAvailableForOrder([['product_option_id' => 999, 'quantity' => 1]]);
    }

    /**
     * STOCK-010: auto_cancel_days 설정 시 expires_at 산출.
     */
    public function test_resolve_expiry_uses_auto_cancel_days(): void
    {
        $repo = $this->makeOptionRepositoryStub([]);
        $service = new StockReservationService($repo);

        // 미설정 → null
        $this->assertNull($service->resolveExpiry([]));
        $this->assertNull($service->resolveExpiry(['auto_cancel_days' => 0]));

        // 7일 → 미래
        $exp = $service->resolveExpiry(['auto_cancel_days' => 7]);
        $this->assertNotNull($exp);
        $this->assertGreaterThan(new \DateTimeImmutable(), $exp);
        $this->assertSame((new \DateTimeImmutable())->format('Y-m-d'), $exp->modify('-7 days')->format('Y-m-d'));
    }

    protected function makeOptionStub(int $stock): object
    {
        return new class($stock) {
            public $stock_quantity;
            public $product;
            public function __construct(int $s) {
                $this->stock_quantity = $s;
                $this->product = new class {
                    public function getLocalizedName(): string { return 'Test Product'; }
                };
            }
            public function getLocalizedOptionName(): string { return 'Test Option'; }
        };
    }

    protected function makeOptionRepositoryStub(array $map): object
    {
        return new class($map) {
            public function __construct(private array $map) {}
            public function findById(int $id)
            {
                return $this->map[$id] ?? null;
            }
        };
    }
}