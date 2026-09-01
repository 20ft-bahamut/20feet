<?php

namespace Plugins\Superbify\Commerce\Compat\Providers;

use App\Extension\BasePluginServiceProvider;
use Illuminate\Support\Facades\Log;
use Modules\Sirsoft\Ecommerce\Services\OrderCalculationService;
use Plugins\Superbify\Commerce\Compat\Console\Commands\ExpireStockReservationsCommand;
use Plugins\Superbify\Commerce\Compat\Services\ScopedOrderCalculationService;

/**
 * Compat 플러그인 서비스 프로바이더.
 *
 * sirsoft-ecommerce 모듈이 활성 상태일 때만 OrderCalculationService 컨테이너 바인딩을
 * ScopedOrderCalculationService 로 교체한다. 모듈 비활성/미설치 환경에서는 부모 클래스의
 * 동작을 그대로 사용한다 (바인딩 변경 안 함 → 모듈 부재 시 NPE 회피).
 *
 * 모듈 활성 판정: `class_exists` + ExtensionManager 식별자 확인. 두 조건 모두 보수적 통과
 * 방식 (failure-soft) — 모듈 부트 실패 환경에서도 본 바인딩은 활성만 시키고 클래스 부재면
 * skip 한다.
 */
class CompatServiceProvider extends BasePluginServiceProvider
{
    protected string $pluginIdentifier = 'superbify-commerce-compat';

    public function register(): void
    {
        parent::register();

        $this->bindScopedOrderCalculationService();
    }

    public function boot(): void
    {
        parent::boot();

        if ($this->app->runningInConsole()) {
            $this->commands([
                ExpireStockReservationsCommand::class,
            ]);
        }
    }

    /**
     * OrderCalculationService 바인딩을 ScopedOrderCalculationService 로 교체한다.
     *
     * 모듈 부재/비활성 환경에서는 바인딩을 건드리지 않는다 (보수적 — 모듈 측 코드가
     * 호출되지 않으면 본 바인딩도 발화되지 않음).
     */
    private function bindScopedOrderCalculationService(): void
    {
        // 모듈 클래스 부재 시 skip.
        if (! class_exists(OrderCalculationService::class)) {
            return;
        }

        if (! class_exists(ScopedOrderCalculationService::class)) {
            return;
        }

        try {
            $active = $this->isSirsoftEcommerceActive();
        } catch (\Throwable $e) {
            Log::debug('Compat: 모듈 활성 판정 실패 — 부모 바인딩 유지', [
                'error' => $e->getMessage(),
            ]);

            return;
        }

        if (! $active) {
            return;
        }

        $this->app->bind(OrderCalculationService::class, ScopedOrderCalculationService::class);

        Log::debug('Compat: OrderCalculationService → ScopedOrderCalculationService 바인딩 적용');
    }

    /**
     * sirsoft-ecommerce 모듈이 활성 상태인지 판정한다.
     *
     * ExtensionManager 가 식별자를 모르고, PluginManager 는 모듈을 다루지 않으므로
     * 두 가지 신호를 결합한다:
     *  - 모듈 부트스트랩 클래스 존재
     *  - 모듈 인스턴스/매니저 가 활성 식별자를 노출하는지 (PluginManager 가 활성
     *    식별자 목록을 들고 있는 패턴을 차용)
     */
    private function isSirsoftEcommerceActive(): bool
    {
        // 가장 보수적인 신호: 모듈 부트 클래스 부재 시 비활성으로 간주.
        if (! class_exists(\Modules\Sirsoft\Ecommerce\Module::class)) {
            return false;
        }

        // ExtensionManager 가 활성 모듈 식별자 집합을 노출하면 그에 따른다.
        if (class_exists(\App\Extension\ExtensionManager::class)) {
            try {
                $em = $this->app->make(\App\Extension\ExtensionManager::class);
                if (method_exists($em, 'getActiveModuleIdentifiers')) {
                    $ids = (array) $em->getActiveModuleIdentifiers();
                    return in_array('sirsoft-ecommerce', $ids, true);
                }
            } catch (\Throwable $e) {
                // ExtensionManager 가 비정상 상태면 모듈 클래스 존재만으로 활성 간주.
            }
        }

        // fallback: 모듈 클래스 존재 + 컨테이너 부트 성공으로 활성 간주.
        return true;
    }
}
