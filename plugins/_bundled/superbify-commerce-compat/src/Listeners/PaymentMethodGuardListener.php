<?php

namespace Plugins\Superbify\Commerce\Compat\Listeners;

use App\Contracts\Extension\HookListenerInterface;
use Plugins\Superbify\Commerce\Compat\Services\PaymentAvailability;

/**
 * PaymentMethodGuardListener
 *
 * WHY: CreateOrderRequest::rules() 의 payment_method 화이트리스트는 카탈로그(builtin 8종 +
 * 플러그인 확장수단)에 등록된 모든 ID 를 허용한다. 그러나 이 커머스의 order_settings 에서
 * 비활성화되었거나, needs_pg=true 인데 default_pg_provider 가 미등록된 수단은 카탈로그를
 * 통과해도 PG 라우팅 실패로 generic 500 이 떨어진다.
 *
 * 본 리스너는 sirsoft-ecommerce.order.create_validation_rules 필터 훅의 후미에 payment_method
 * 키의 Rule 을 교체 (Closure 룰로) 하여 settings 기반 활성/PG provider 가용성 검증을 추가한다.
 *
 * TARGET DEFECT: PAY-006 (inactive payment_method accepted), PAY-002 (vbank/dbank PG provider
 * 미등록 시 결제 실패), PAY-005 (간편결제 등 확장수단 미등록).
 *
 * DETECTION: payment_method ID in catalog but is_active=false OR needs_pg=true with
 * default_pg_provider not in registered providers.
 *
 * REMOVE WHEN: CreateOrderRequest 가 settings 기반 활성/PG provider 검증을 내장하게 되면.
 */
class PaymentMethodGuardListener implements HookListenerInterface
{
    public function __construct(protected PaymentAvailability $availability) {}

    /**
     * Hook: sirsoft-ecommerce.order.create_validation_rules (filter)
     *
     * 필터 시그니처: ($rules, $request) → 수정된 $rules.
     */
    public static function getSubscribedHooks(): array
    {
        return [
            'sirsoft-ecommerce.order.create_validation_rules' => [
                'method' => 'handleCreateValidationRules',
                'priority' => 20,
                'type' => 'filter',
            ],
        ];
    }

    /**
     * HookListenerInterface::handle — 본 리스너는 단일 필터만 구독하므로 route 불필요.
     *
     * @param  mixed  ...$args
     * @return void
     */
    public function handle(...$args): void
    {
        // 단일 필터 구독 — 이 메서드는 호출되지 않는다 (HookListenerRegistrar 가 method 키로 직접 호출).
    }

    /**
     * 필터 진입점.
     *
     * @param  array  $rules
     * @param  mixed  $request
     * @return array
     */
    public function handleCreateValidationRules($rules, $request = null): array
    {
        if (! is_array($rules) || ! isset($rules['payment_method'])) {
            return $rules;
        }

        // 기존 payment_method rules 는 유지 (catalog whitelist 검증 보존) — 후미에 Closure 추가.
        $existing = $rules['payment_method'];

        $closure = function (string $attribute, $value, callable $fail) {
            if (! is_string($value) || $value === '') {
                return;
            }
            if (! $this->availability->isOrderablePaymentMethod($value)) {
                $fail('사용할 수 없는 결제수단입니다.');
            }
        };

        if (is_array($existing)) {
            $existing[] = $closure;
            $rules['payment_method'] = $existing;

            return $rules;
        }

        if (is_string($existing)) {
            $rules['payment_method'] = [$existing, $closure];

            return $rules;
        }

        // 미인식 포맷 — 보수적으로 Closure 룰로 교체.
        $rules['payment_method'] = [$closure];

        return $rules;
    }
}
