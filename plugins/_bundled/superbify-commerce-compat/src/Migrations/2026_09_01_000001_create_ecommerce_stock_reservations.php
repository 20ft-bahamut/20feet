<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ecommerce_stock_reservations
 *
 * WHY: sirsoft-ecommerce 1.1.2 는 옵션 단위 재고를 차감만 한다 (SEC-STOCK-001). 결제 진행
 * 중인 임시주문은 재고를 점유하지 않아 race 가 발생한다 (두 주문이 동시에 validateStock 를
 * 통과하고 차감 직전에 재고 부족). 본 테이블은 (product_option_id, qty, status, token) 단위로
 * 활성 예약을 추적하여 available = stock - SUM(active) 로 가용 재고를 계산한다.
 *
 * 제약:
 * - token unique nullable — 멱등키 (temp_order_id 또는 order_id 또는 멱등 UUID).
 *   unique(order_id, product_option_id) consumed 전환 시 멱등 가드.
 * - status enum: active / consumed / released / expired.
 * - source enum: order / event — 어떤 경로로 예약되었는지 추적용.
 *
 * 인덱스:
 * - (product_option_id, status) — 가용 재고 합계 쿼리용.
 * - (order_id) — 주문 단위 조회용.
 * - (status, expires_at) — 만료 cron 대상 조회용.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ecommerce_stock_reservations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_option_id');
            $table->unsignedBigInteger('order_id')->nullable();
            $table->unsignedInteger('qty');
            $table->enum('status', ['active', 'consumed', 'released', 'expired'])->default('active');
            $table->enum('source', ['order', 'event'])->default('order');
            $table->string('token')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->unique('token');
            $table->index(['product_option_id', 'status'], 'esr_option_status_idx');
            $table->index(['order_id'], 'esr_order_idx');
            $table->index(['status', 'expires_at'], 'esr_status_expires_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ecommerce_stock_reservations');
    }
};