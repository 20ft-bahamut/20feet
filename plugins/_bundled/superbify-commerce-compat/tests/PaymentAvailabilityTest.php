<?php

namespace Plugins\Superbify\Commerce\Compat\Tests;

use Plugins\Superbify\Commerce\Compat\Services\PaymentAvailability;
use Plugins\Superbify\Commerce\Compat\Listeners\PaymentMethodGuardListener;

/**
 * PAYMENT-VAL-001..007: PaymentAvailability + PaymentMethodGuardListener 단위 테스트.
 *
 * 시나리오:
 * - 001: 카탈로그 외 ID → 차단.
 * - 002: 카탈로그 O + is_active=false → 차단.
 * - 003: 카탈로그 O + is_active=true + PG provider 등록 → 통과.
 * - 004: 카탈로그 O + needs_pg=true + default_pg_provider 미등록 → 차단.
 * - 005: dbank (internal, needs_pg=false) + provider 미등록이어도 통과.
 * - 006: listener 가 payment_method 룰에 Closure 추가하여 검증.
 * - 007: 빈 문자열/잘못된 타입 → 차단.
 */
class PaymentAvailabilityTest extends CompatTestCase
{
    /**
     * PAYMENT-VAL-001..007: PaymentAvailability 는 카탈로그 미존재 ID 차단.
     */
    public function test_unknown_payment_id_is_rejected(): void
    {
        $availability = new PaymentAvailability();
        $this->assertFalse($availability->isOrderablePaymentMethod('unknown_method_xyz'));
    }

    /**
     * PAYMENT-VAL-002: 카탈로그 O + is_active=false → 차단.
     */
    public function test_inactive_payment_method_rejected(): void
    {
        $settings = $this->makeSettingsStub([
            'payment_methods' => [
                ['id' => 'card', 'is_active' => false],
            ],
            'default_pg_provider' => null,
        ]);
        $resolver = $this->makeResolverStub(['card'], ['card' => true], ['card' => true]);
        $availability = new PaymentAvailability($settings, $resolver);

        $this->assertFalse($availability->isOrderablePaymentMethod('card'));
    }

    /**
     * PAYMENT-VAL-003: 카탈로그 O + is_active=true + PG provider 등록 → 통과.
     */
    public function test_active_with_pg_provider_passes(): void
    {
        $settings = $this->makeSettingsStub([
            'payment_methods' => [
                ['id' => 'card', 'is_active' => true],
            ],
            'default_pg_provider' => 'iamport',
        ]);
        $resolver = $this->makeResolverStub(['card'], ['card' => true], ['card' => true]);
        $availability = new PaymentAvailability($settings, $resolver);

        $this->assertTrue($availability->isOrderablePaymentMethod('card'));
    }

    /**
     * PAYMENT-VAL-004: needs_pg=true + provider 미등록 → 차단.
     */
    public function test_needs_pg_but_no_provider_rejected(): void
    {
        $settings = $this->makeSettingsStub([
            'payment_methods' => [
                ['id' => 'card', 'is_active' => true],
            ],
            'default_pg_provider' => null,
        ]);
        $resolver = $this->makeResolverStub(['card'], ['card' => true], ['card' => true]);
        $availability = new PaymentAvailability($settings, $resolver);

        $this->assertFalse($availability->isOrderablePaymentMethod('card'));
    }

    /**
     * PAYMENT-VAL-005: needs_pg=false (dbank) + provider 미등록이어도 통과.
     */
    public function test_internal_method_with_no_pg_provider_passes(): void
    {
        $settings = $this->makeSettingsStub([
            'payment_methods' => [
                ['id' => 'dbank', 'is_active' => true],
            ],
            'default_pg_provider' => null,
        ]);
        $resolver = $this->makeResolverStub(['dbank'], ['dbank' => false], ['dbank' => false]);
        $availability = new PaymentAvailability($settings, $resolver);

        $this->assertTrue($availability->isOrderablePaymentMethod('dbank'));
    }

    /**
     * PAYMENT-VAL-006: listener 가 payment_method 룰에 Closure 추가하여 검증.
     */
    public function test_listener_appends_closure_rule(): void
    {
        $settings = $this->makeSettingsStub([
            'payment_methods' => [
                ['id' => 'card', 'is_active' => false],
            ],
            'default_pg_provider' => null,
        ]);
        $resolver = $this->makeResolverStub(['card'], ['card' => true], ['card' => true]);
        $availability = new PaymentAvailability($settings, $resolver);
        $listener = new PaymentMethodGuardListener($availability);

        $rules = ['payment_method' => ['required', 'string']];
        $modified = $listener->handleCreateValidationRules($rules, null);

        $this->assertIsArray($modified['payment_method']);
        $this->assertGreaterThan(2, count($modified['payment_method']), '기존 룰 + Closure 추가');
        $this->assertSame('required', $modified['payment_method'][0]);

        // Closure 룰 실행
        $fails = [];
        $last = end($modified['payment_method']);
        $this->assertIsCallable($last);
        $last('payment_method', 'card', function ($msg) use (&$fails) {
            $fails[] = $msg;
        });
        $this->assertNotEmpty($fails, 'inactive card → fail() 호출');
    }

    /**
     * PAYMENT-VAL-007: 빈 문자열 차단.
     */
    public function test_empty_string_rejected(): void
    {
        $availability = new PaymentAvailability();
        $this->assertFalse($availability->isOrderablePaymentMethod(''));
    }

    /**
     * Helper: stub settings (EcommerceSettingsService 시그니처 일부).
     */
    protected function makeSettingsStub(array $orderSettings): object
    {
        return new class($orderSettings) {
            private array $order;
            public function __construct(array $o) { $this->order = $o; }
            public function getSettings(string $cat): array
            {
                return $cat === 'order_settings' ? $this->order : [];
            }
            public function getRegisteredPgProviders(): array
            {
                return ['iamport', 'kakao'];
            }
        };
    }

    /**
     * Helper: stub PaymentMethodResolver (시그니처 일부).
     */
    protected function makeResolverStub(array $allValid, array $needsPg, array $builtin): object
    {
        return new class($allValid, $needsPg, $builtin) {
            public function __construct(private array $allValid, private array $needsPg, private array $builtin) {}
            public function allValidIds(): array { return $this->allValid; }
            public function needsPgProvider(string $id): bool { return $this->needsPg[$id] ?? false; }
            public function isBuiltin(string $id): bool { return $this->builtin[$id] ?? false; }
        };
    }
}