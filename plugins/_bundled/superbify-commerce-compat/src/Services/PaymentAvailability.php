<?php

namespace Plugins\Superbify\Commerce\Compat\Services;

use Illuminate\Container\Container;
use Modules\Sirsoft\Ecommerce\Services\EcommerceSettingsService;

/**
 * PaymentAvailability
 *
 * WHY: CreateOrderRequest 의 payment_method 화이트리스트 (Rule::in(PaymentMethodResolver::allValidIds()))
 * 는 카탈로그(builtin 8종 + 플러그인 확장수단)에 등록된 모든 ID 를 허용한다. 하지만 이 커머스
 * 의 order_settings.payment_methods 중 is_active=false 이거나, needs_pg=true 인데
 * default_pg_provider 가 미등록인 수단은 카탈로그를 통과해도 PG 라우팅 실패로 generic 500
 * 이 떨어진다. 본 서비스는 PaymentMethodResolver + EcommerceSettingsService 를 조합해
 * "이 설치본에서 지금 주문 가능한 결제수단인지" 를 판정한다.
 *
 * TARGET DEFECT: PAY-006 / PAY-002 / PAY-005.
 *
 * DETECTION: payment_method ID in catalog but is_active=false OR needs_pg=true with
 * default_pg_provider not in registered providers.
 *
 * REMOVE WHEN: CreateOrderRequest 가 settings 기반 활성/PG provider 검증을 내장하게 되면.
 */
class PaymentAvailability
{
    public function __construct(
        protected ?EcommerceSettingsService $settingsService = null,
        protected ?\PaymentMethodResolver $methodResolver = null
    ) {}

    /**
     * 이 결제수단이 현재 이 커머스에서 주문 가능한지 판정.
     */
    public function isOrderablePaymentMethod(string $methodId): bool
    {
        if ($methodId === '') {
            return false;
        }

        $resolver = $this->resolveResolver();
        if ($resolver === null) {
            return true; // 모듈 미로드 시 보수적 통과
        }

        // 1. 카탈로그에 등록되지 않은 ID → 차단
        if (! in_array($methodId, $resolver->allValidIds(), true)) {
            return false;
        }

        // 카탈로그 통과 후 settings 활성/PG provider 판정
        $settings = $this->loadOrderPaymentMethods();
        $entry = $this->findPaymentMethodEntry($settings, $methodId);

        // settings 가 비어있으면 (초기 설치) 모든 카탈로그 수단 허용 (보수적)
        if ($entry === null) {
            return true;
        }

        // 2. is_active=false 면 차단
        if (array_key_exists('is_active', $entry) && $entry['is_active'] === false) {
            return false;
        }

        // 3. needs_pg=true 인데 default_pg_provider 가 미등록이면 차단
        $needsPg = $resolver->needsPgProvider($methodId);
        if ($needsPg) {
            $registeredProviders = $this->resolveRegisteredPgProviders();
            $providerId = $settings['default_pg_provider'] ?? null;
            if (! is_string($providerId) || $providerId === '' || ! in_array($providerId, $registeredProviders, true)) {
                return false;
            }
        }

        return true;
    }

    /**
     * CartUnavailableException 등에서 사용할 human-readable 사유 메시지.
     */
    public function rejectionReason(string $methodId): ?string
    {
        if ($methodId === '') {
            return '사용할 수 없는 결제수단입니다.';
        }

        $resolver = $this->resolveResolver();
        if ($resolver === null) {
            return null;
        }

        if (! in_array($methodId, $resolver->allValidIds(), true)) {
            return '사용할 수 없는 결제수단입니다.';
        }

        $settings = $this->loadOrderPaymentMethods();
        $entry = $this->findPaymentMethodEntry($settings, $methodId);
        if ($entry === null) {
            return null;
        }

        if (array_key_exists('is_active', $entry) && $entry['is_active'] === false) {
            return '사용할 수 없는 결제수단입니다.';
        }

        if ($resolver->needsPgProvider($methodId)) {
            $registeredProviders = $this->resolveRegisteredPgProviders();
            $providerId = $settings['default_pg_provider'] ?? null;
            if (! is_string($providerId) || $providerId === '' || ! in_array($providerId, $registeredProviders, true)) {
                return '사용할 수 없는 결제수단입니다.';
            }
        }

        return null;
    }

    /**
     * order_settings 에서 payment_methods 배열 로드.
     */
    protected function loadOrderPaymentMethods(): array
    {
        $service = $this->resolveSettings();
        if ($service === null) {
            return [];
        }

        try {
            $order = $service->getSettings('order_settings');
        } catch (\Throwable $e) {
            return [];
        }

        return $order['payment_methods'] ?? [];
    }

    protected function findPaymentMethodEntry(array $methods, string $methodId): ?array
    {
        foreach ($methods as $entry) {
            if (! is_array($entry)) {
                continue;
            }
            $candidates = [$entry['id'] ?? null, $entry['method_id'] ?? null, $entry['identifier'] ?? null];
            if (in_array($methodId, $candidates, true)) {
                return $entry;
            }
        }

        return null;
    }

    protected function resolveRegisteredPgProviders(): array
    {
        $service = $this->resolveSettings();
        if ($service !== null && method_exists($service, 'getRegisteredPgProviders')) {
            try {
                return $service->getRegisteredPgProviders();
            } catch (\Throwable $e) {
                // 폴백
            }
        }

        return [];
    }

    protected function resolveResolver(): ?\PaymentMethodResolver
    {
        if ($this->methodResolver !== null) {
            return $this->methodResolver;
        }

        $container = Container::getInstance();
        if ($container->bound(\PaymentMethodResolver::class)) {
            try {
                $this->methodResolver = $container->make(\PaymentMethodResolver::class);

                return $this->methodResolver;
            } catch (\Throwable $e) {
                return null;
            }
        }

        return null;
    }

    protected function resolveSettings(): ?EcommerceSettingsService
    {
        if ($this->settingsService !== null) {
            return $this->settingsService;
        }

        $container = Container::getInstance();
        if ($container->bound(EcommerceSettingsService::class)) {
            try {
                $this->settingsService = $container->make(EcommerceSettingsService::class);

                return $this->settingsService;
            } catch (\Throwable $e) {
                return null;
            }
        }

        return null;
    }
}
