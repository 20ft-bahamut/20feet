<?php

namespace Plugins\Superbify\Commerce\Compat\Tests;

use App\Enums\ExtensionStatus;
use App\Extension\Testing\ExtensionTestAllowlist;
use App\Models\Module as ModuleRegistration;
use App\Models\Plugin as PluginRegistration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Modules\Sirsoft\Ecommerce\Providers\EcommerceServiceProvider;
use Tests\TestCase;

/**
 * Compat 플러그인 테스트 베이스.
 *
 * 모듈 부트 + 플러그인 등록 행 보장 + 마이그레이션 패스 포함.
 * ExtensionTestAllowlist 를 통해 본 플러그인 + 모듈을 명시적으로 허용한다.
 */
abstract class CompatTestCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        // 앱 인스턴스 생성 전 allowlist 설정 (PluginServiceProvider::register 가드 통과용).
        ExtensionTestAllowlist::set([
            'modules/sirsoft-ecommerce',
            'plugins/superbify-commerce-compat',
        ]);

        parent::setUp();

        $this->bootModule();
        $this->ensurePluginRegistered();
    }

    protected function tearDown(): void
    {
        ExtensionTestAllowlist::reset();
        parent::tearDown();
    }

    /**
     * 모듈 부트 — ServiceProvider 등록 + 모듈 인스턴스 등록 + 마이그레이션 행 보장.
     */
    protected function bootModule(): void
    {
        if (! class_exists(EcommerceServiceProvider::class)) {
            return;
        }

        $this->app->register(EcommerceServiceProvider::class);

        $manager = $this->app->make(\App\Extension\ModuleManager::class);
        $moduleClass = \Modules\Sirsoft\Ecommerce\Module::class;

        if (! class_exists($moduleClass)) {
            $moduleBasePath = base_path('modules/_bundled/sirsoft-ecommerce');
            if (file_exists($moduleBasePath.'/module.php')) {
                require_once $moduleBasePath.'/module.php';
            }
        }

        if (class_exists($moduleClass)) {
            try {
                $reflection = new \ReflectionClass($manager);
                if ($reflection->hasProperty('modules')) {
                    $modulesProp = $reflection->getProperty('modules');
                    $modulesProp->setAccessible(true);
                    $current = $modulesProp->getValue($manager);
                    $current['sirsoft-ecommerce'] = new $moduleClass;
                    $modulesProp->setValue($manager, $current);
                }
            } catch (\Throwable $e) {
                // 모듈 매니저 구조 변경 가능 — 무시.
            }
        }

        ModuleRegistration::updateOrCreate(
            ['identifier' => 'sirsoft-ecommerce'],
            [
                'vendor' => 'sirsoft',
                'name' => ['ko' => '이커머스', 'en' => 'Ecommerce'],
                'status' => ExtensionStatus::Active->value,
                'version' => '1.0.0',
            ]
        );
    }

    /**
     * 플러그인 등록 행 보장.
     */
    protected function ensurePluginRegistered(): void
    {
        if (! Schema::hasTable('plugins')) {
            return;
        }

        PluginRegistration::updateOrCreate(
            ['identifier' => 'superbify-commerce-compat'],
            [
                'vendor' => 'superbify',
                'name' => ['ko' => 'SuperBify 커머스 컴패터블', 'en' => 'SuperBify Commerce Compat'],
                'status' => ExtensionStatus::Active->value,
                'version' => '1.0.0',
            ]
        );
    }

    /**
     * migrateFreshUsing — 모듈 + 본 플러그인 마이그레이션 경로를 모두 포함.
     */
    protected function migrateFreshUsing(): array
    {
        $paths = ['database/migrations'];
        foreach (glob(base_path('modules/_bundled/*/database/migrations'), GLOB_ONLYDIR) as $p) {
            $paths[] = str_replace(base_path().DIRECTORY_SEPARATOR, '', $p);
        }
        $pluginPath = base_path('plugins/_bundled/superbify-commerce-compat/src/Migrations');
        if (is_dir($pluginPath)) {
            $paths[] = str_replace(base_path().DIRECTORY_SEPARATOR, '', $pluginPath);
        }

        return [
            '--drop-views' => true,
            '--drop-types' => true,
        ];
    }
}
