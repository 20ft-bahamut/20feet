<?php

namespace Modules\Pinkbro\Contents\Tests;

use App\Contracts\Extension\HookListenerInterface;
use App\Enums\ExtensionOwnerType;
use App\Enums\ExtensionStatus;
use App\Extension\HookListenerRegistrar;
use App\Extension\HookManager;
use App\Extension\ModuleManager;
use App\Http\Middleware\PermissionMiddleware;
use App\Models\Module;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Modules\Pinkbro\Contents\Providers\PinkbroContentsServiceProvider;
use Tests\TestCase;

/**
 * PinkBro Contents 모듈 테스트 베이스 클래스
 *
 * 이 모듈은 `_bundled` 에 있고 설치되어 있지 않다. 따라서 테스트 앱에서는
 * ModuleRouteServiceProvider 가 이 모듈을 보지 못한다:
 *  - app/Providers/ModuleRouteServiceProvider.php:49 `base_path('modules')` 만 스캔 → `_bundled` 제외
 *  - app/Providers/ModuleRouteServiceProvider.php:96-98 활성 목록(modules 테이블) 검사
 * 그 결과 src/routes/api.php 가 라우터에 올라가지 않아, Feature 테스트가
 * `/api/modules/pinkbro-contents/...` 로 실제 요청을 보내면 전부 404 가 된다.
 *
 * 이 클래스가 그 부트스트랩을 대신 수행한다 — 라우트 등록, 모듈 인스턴스/훅 리스너,
 * 활성 상태 행, 그리고 설치 시점에 생성되는 권한 트리·역할 할당까지.
 *
 * 선례(그대로 이식): modules/_bundled/sirsoft-board/tests/ModuleTestCase.php
 *
 * ## 이식하지 않은 단계 (이유 있음)
 *  - registerModuleAutoload(): tests/bootstrap.php 가 `_bundled` 아래 각 모듈 디렉토리의
 *    composer.json 을 읽어 autoload.psr-4 를 prepend 등록한다 — 이 모듈의 경우
 *    `Modules\Pinkbro\Contents\` → `<module>/src/` 와
 *    `Modules\Pinkbro\Contents\Tests\` → `<module>/tests/` 가 이미 등록된다.
 *    루트 composer.json 에는 `Modules\` 매핑이 없지만 이 부트스트랩 경로가 담당하므로
 *    중복 오토로더를 추가하지 않는다.
 *  - runModuleMigrationIfNeeded(): Tests\TestCase::setUpTraits() → loadExtensionMigrations() 가
 *    모든 _bundled 모듈의 database/migrations 를 migrator 에 등록하고, RefreshDatabase 의
 *    `migrate:fresh` → `migrate` 가 `$migrator->paths()` 를 함께 실행하므로 이 모듈의 마이그레이션은
 *    자동 적용된다. (선례가 migrate:fresh 를 직접 부르는 것은 DatabaseTransactions 를 쓰기 때문이다)
 */
abstract class PinkbroContentsTestCase extends TestCase
{
    use RefreshDatabase;

    /**
     * 모듈 식별자 — 디렉토리명이자 module.json 의 identifier.
     *
     * 모듈 권한 식별자의 접두(`pinkbro-contents.content.read`)이기도 하다.
     */
    protected const MODULE_IDENTIFIER = 'pinkbro-contents';

    /**
     * 모듈 벤더 — module.json 의 vendor.
     */
    protected const MODULE_VENDOR = 'pinkbro';

    /**
     * 테스트용으로 등록하는 모듈 버전 (module.json 의 version).
     */
    protected const MODULE_VERSION = '0.1.0';

    /**
     * HookManager static state 스냅샷 — tearDown 에서 복원하여 테스트 간 훅 격리 보장.
     *
     * @var array{hooks: array, filters: array, dispatching: array}|null
     */
    private ?array $hookSnapshot = null;

    /**
     * 테스트 DB 미가용 환경에서 실패 대신 skip 으로 갈라낸다.
     * 선례: modules/_bundled/twentyft-content/tests/Feature/InquiryAdminApiTest.php:45-53
     */
    protected function beforeRefreshingDatabase(): void
    {
        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            $this->markTestSkipped('테스트 DB에 접속할 수 없어 건너뜁니다: '.$e->getMessage());
        }
    }

    /**
     * 모듈 루트 경로를 반환합니다.
     *
     * __DIR__ 을 기반으로 동적 해석하여 _bundled/활성 디렉토리 모두에서 동작합니다.
     *
     * @return string 모듈 루트 절대 경로
     */
    protected function getModuleBasePath(): string
    {
        // __DIR__ = {module_root}/tests/ → dirname = {module_root}
        return dirname(__DIR__);
    }

    /**
     * 테스트 환경 설정
     *
     * 순서는 선례(ModuleTestCase)와 동일하게 유지한다 — 모듈 인스턴스 주입이
     * 라우트/권한 단계보다 먼저여야 하고, 역할 행이 권한 할당보다 먼저여야 한다.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // 모듈 ServiceProvider 등록 (Repository 바인딩 + src/lang 다국어 네임스페이스 로드)
        $this->app->register(PinkbroContentsServiceProvider::class);

        // 모듈을 활성화 상태로 등록 (modules 테이블 행)
        $this->registerModuleAsActive();

        // ModuleManager 메모리 맵에 활성 모듈들을 로드 (테스트 컨테이너 싱글톤이 빈 경우 대비)
        $this->app->make(ModuleManager::class)->loadModules();

        // _bundled 디렉토리 모듈은 loadModules() 가 스캔하지 않으므로
        // 모듈 인스턴스 주입 + module.php 의 getHookListeners() 수동 등록
        $this->registerBundledModuleInstance();

        // 모듈 라우트를 수동으로 등록 (Feature 테스트가 실제 요청을 태울 수 있게)
        $this->registerModuleRoutes();

        // 기본 역할 생성 — 아래 권한 할당의 전제
        $this->createDefaultRoles();

        // 설치 시점과 같은 경로로 모듈 권한 트리 생성 + 역할 할당
        // (미설치 모듈이므로 이 단계가 없으면 `permission:admin,pinkbro-contents.content.read` 가 403)
        $this->createModulePermissions();

        // HookManager 상태 스냅샷 (tearDown 에서 복원하여 테스트 내 추가 훅만 제거)
        $this->snapshotHookManager();

        // PermissionMiddleware::$guestRoleCache 초기화 — 이전 테스트에서 로드된 guest role/permissions
        // 캐시가 롤백 후에도 남아 다음 테스트의 새 permission 설정이 반영되지 않는 문제 회피.
        PermissionMiddleware::clearGuestRoleCache();
    }

    /**
     * tearDown 에 HookManager 상태 복원.
     */
    protected function tearDown(): void
    {
        $this->restoreHookManager();

        parent::tearDown();
    }

    /**
     * HookManager static $hooks / $filters / $dispatching 를 스냅샷.
     */
    private function snapshotHookManager(): void
    {
        $ref = new \ReflectionClass(HookManager::class);
        $this->hookSnapshot = [
            'hooks' => $ref->getProperty('hooks')->getValue(),
            'filters' => $ref->getProperty('filters')->getValue(),
            'dispatching' => $ref->getProperty('dispatching')->getValue(),
        ];
    }

    /**
     * 스냅샷 시점으로 HookManager 복원.
     */
    private function restoreHookManager(): void
    {
        if ($this->hookSnapshot === null) {
            return;
        }

        $ref = new \ReflectionClass(HookManager::class);
        $ref->getProperty('hooks')->setValue(null, $this->hookSnapshot['hooks']);
        $ref->getProperty('filters')->setValue(null, $this->hookSnapshot['filters']);
        $ref->getProperty('dispatching')->setValue(null, $this->hookSnapshot['dispatching']);

        $this->hookSnapshot = null;
    }

    /**
     * 모듈을 활성화 상태로 등록합니다.
     *
     * module.json 의 식별자/벤더/이름을 그대로 쓴다 — 새 값을 만들지 않는다.
     */
    protected function registerModuleAsActive(): void
    {
        if (Module::where('identifier', self::MODULE_IDENTIFIER)->exists()) {
            return;
        }

        Module::create([
            'identifier' => self::MODULE_IDENTIFIER,
            'vendor' => self::MODULE_VENDOR,
            'name' => ['ko' => '핑크브로 콘텐츠', 'en' => 'PinkBro Contents'],
            'status' => ExtensionStatus::Active->value,
            'version' => self::MODULE_VERSION,
            'config' => [],
        ]);
    }

    /**
     * _bundled 디렉토리 모듈 인스턴스 + 훅 리스너 수동 등록.
     *
     * ModuleManager::loadModules() 는 modules/ (활성) 디렉토리만 스캔하고
     * _bundled 는 메타데이터만 로드하므로, 테스트 환경에서는 module.php 의
     * getHookListeners() 가 선언한 리스너들을 수동으로 등록해야 실제 부트 시점과
     * 동일한 훅 흐름이 복원된다.
     */
    protected function registerBundledModuleInstance(): void
    {
        $moduleClass = \Modules\Pinkbro\Contents\Module::class;

        // PSR-4 매핑은 `Modules\Pinkbro\Contents\ → src/` 이므로 Module 클래스는
        // src/Module.php 가 아니라 모듈 루트의 module.php 에 있다 — 직접 require 한다.
        if (! class_exists($moduleClass)) {
            require_once $this->getModuleBasePath().'/module.php';
        }

        $module = new $moduleClass;

        /** @var ModuleManager $manager */
        $manager = $this->app->make(ModuleManager::class);

        // ModuleManager.modules 에 인스턴스 주입 (getModule() 이 이 맵을 읽는다)
        $reflection = new \ReflectionClass($manager);
        $modulesProp = $reflection->getProperty('modules');
        $modulesProp->setAccessible(true);
        $current = $modulesProp->getValue($manager);
        if (! isset($current[self::MODULE_IDENTIFIER])) {
            $current[self::MODULE_IDENTIFIER] = $module;
            $modulesProp->setValue($manager, $current);
        }

        // 훅 리스너 등록 — module.php 의 getHookListeners() 반환 클래스들을 HookListenerRegistrar 로 등록
        if (method_exists($module, 'getHookListeners')) {
            foreach ($module->getHookListeners() as $listenerClass) {
                if (! class_exists($listenerClass)) {
                    continue;
                }
                if (! in_array(HookListenerInterface::class, class_implements($listenerClass), true)) {
                    continue;
                }
                try {
                    HookListenerRegistrar::register($listenerClass, self::MODULE_IDENTIFIER);
                } catch (\Throwable $e) {
                    // 중복 등록 등 무해한 예외는 무시 (snapshot/restore 패턴이 정리)
                }
            }
        }
    }

    /**
     * 모듈 라우트를 등록합니다.
     *
     * prefix/name 은 ModuleRouteServiceProvider.php:124-127 이 활성 모듈에 적용하는
     * 것과 같은 값이다 — 이후 태스크의 Feature 테스트가 부르는 경로
     * `/api/modules/pinkbro-contents/...` 와 이름 `api.modules.pinkbro-contents.*` 가
     * 그대로 성립한다.
     *
     * 등록 대상은 모듈이 선언한 src/routes/api.php 하나뿐이다 (web.php 는 없다).
     */
    protected function registerModuleRoutes(): void
    {
        $apiRoutesFile = $this->getModuleBasePath().'/src/routes/api.php';

        if (file_exists($apiRoutesFile)) {
            Route::prefix('api/modules/'.self::MODULE_IDENTIFIER)
                ->name('api.modules.'.self::MODULE_IDENTIFIER.'.')
                ->middleware('api')
                ->group($apiRoutesFile);
        }
    }

    /**
     * 기본 역할들을 생성합니다.
     *
     * module.php 의 getPermissions() 가 admin/manager 역할에 권한을 선언하므로
     * manager 까지 만든다. 이름은 config('core.roles')(설치 시더와 같은 출처)를
     * 그대로 쓰고, 새 문구를 만들지 않는다.
     */
    protected function createDefaultRoles(): void
    {
        $definitions = collect(config('core.roles', []))->keyBy('identifier');

        foreach (['admin', 'manager', 'user', 'guest'] as $identifier) {
            $definition = $definitions->get($identifier);

            Role::firstOrCreate(
                ['identifier' => $identifier],
                [
                    'name' => $definition['name'] ?? ['ko' => $identifier, 'en' => $identifier],
                    'description' => $definition['description'] ?? null,
                    'extension_type' => ExtensionOwnerType::Core,
                    'extension_identifier' => 'core',
                    'is_active' => true,
                ]
            );
        }
    }

    /**
     * 모듈이 module.php 에 선언한 권한 트리를 생성하고 선언된 역할에 할당합니다.
     *
     * 설치 시점에는 ModuleManager::installModule() 이
     * ModuleManager::createModulePermissions()(:2114) 와
     * assignPermissionsToRoles()(:2256) 을 호출해 이 일을 한다. 테스트에서는 모듈이
     * 설치되지 않으므로 그 권한 행이 존재하지 않고, 결과적으로
     * `permission:admin,pinkbro-contents.{category}.{action}` 미들웨어가 403 을 낸다.
     *
     * 설치 경로와 동일한 코드를 쓰기 위해 위 두 protected 메서드를 Reflection 으로
     * 호출한다 — 이 저장소의 코어 테스트가 쓰는 방식 그대로다
     * (tests/Unit/Extension/ModuleCleanupStaleEntriesTest.php:82-83,
     *  tests/Feature/Module/ModuleRolePermissionSyncTest.php:131,188).
     * 권한 식별자(`{module}.{category}.{action}`)·type·resource_route_key·역할 할당을
     * 여기서 다시 구현하지 않으므로 module.php 정의와 어긋날 수 없다.
     *
     * 전제: createDefaultRoles() 가 먼저 실행되어야 한다 — 할당 대상 역할 행이 없으면
     * ExtensionRoleSyncHelper 가 그 역할을 조용히 건너뛴다.
     */
    protected function createModulePermissions(): void
    {
        $manager = $this->app->make(ModuleManager::class);
        $module = $manager->getModule(self::MODULE_IDENTIFIER);

        if ($module === null) {
            // registerBundledModuleInstance() 가 먼저 실행되어야 한다. 조용히 넘어가면
            // 이후 관리자 API 테스트가 원인 모를 403 으로 무더기 실패한다.
            $this->fail(
                'ModuleManager 에 '.self::MODULE_IDENTIFIER.' 인스턴스가 없습니다. '
                .'registerBundledModuleInstance() 가 먼저 실행되어야 합니다.'
            );
        }

        $this->invokeModuleManagerMethod($manager, 'createModulePermissions', [$module]);
        $this->invokeModuleManagerMethod($manager, 'assignPermissionsToRoles', [$module]);
    }

    /**
     * ModuleManager 의 protected 메서드를 호출합니다 (설치 Phase 격리 실행용).
     *
     * @param  string  $method  메서드명
     * @param  array  $args  인자
     * @return mixed 반환값
     */
    private function invokeModuleManagerMethod(ModuleManager $manager, string $method, array $args): mixed
    {
        return (new \ReflectionMethod($manager, $method))->invokeArgs($manager, $args);
    }

    /**
     * 관리자 역할을 가진 사용자를 생성합니다.
     *
     * createModulePermissions() 가 끝난 뒤라면 인자 없이 호출해도 module.php 가
     * admin 역할에 선언한 권한(`pinkbro-contents.content.read` 등)을 이미 갖는다.
     * 그 밖의 권한이 필요하면 식별자를 넘긴다.
     *
     * @param  array  $permissions  추가 권한 식별자 목록
     * @return User
     */
    protected function createAdminUser(array $permissions = []): User
    {
        $adminRole = Role::where('identifier', 'admin')->first();
        $user = User::factory()->create();
        $user->roles()->attach($adminRole->id);

        // 추가 권한이 있으면 생성 및 할당
        if (! empty($permissions)) {
            foreach ($permissions as $permissionIdentifier) {
                $permission = Permission::firstOrCreate(
                    ['identifier' => $permissionIdentifier],
                    [
                        'name' => ['ko' => $permissionIdentifier, 'en' => $permissionIdentifier],
                        'type' => 'admin',
                    ]
                );
                $adminRole->permissions()->syncWithoutDetaching([$permission->id]);
            }
        }

        return $user;
    }

    /**
     * 일반 사용자를 생성합니다.
     *
     * @return User
     */
    protected function createUser(): User
    {
        $userRole = Role::where('identifier', 'user')->first();
        $user = User::factory()->create();
        $user->roles()->attach($userRole->id);

        return $user;
    }
}
