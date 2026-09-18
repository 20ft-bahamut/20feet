<?php

namespace Modules\Pinkbro\Contents\Tests\Feature;

use App\Enums\ExtensionOwnerType;
use App\Models\Permission;
use App\Models\Role;
use Modules\Pinkbro\Contents\Database\Seeders\PinkbroContentsSeeder;
use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Services\ContentMetaService;
use Modules\Pinkbro\Contents\Tests\PinkbroContentsTestCase;

/**
 * 시더 계약 — 게시판 6종 + 콘텐츠 주입.
 *
 * 모든 테스트는 PinkbroContentsTestCase 를 상속한다 (RefreshDatabase 포함).
 * 테스트 DB 미가용 환경에서는 setUp 단계에서 skip 된다.
 *
 * 기반 TestCase 가 public seed() 를 이미 갖고 있어 private 시더 래퍼를 둘 수 없다
 * (Access level to ...::seed() must be public). 각 테스트가 직접 클래스를 지정한다.
 */
class PinkbroContentsSeederTest extends PinkbroContentsTestCase
{
    public function test_it_creates_all_six_boards(): void
    {
        $this->seed(PinkbroContentsSeeder::class);

        foreach (['pinkbro_service', 'pinkbro_package', 'pinkbro_case', 'pinkbro_faq', 'pinkbro_inquiry', 'pinkbro_media'] as $slug) {
            $this->assertDatabaseHas('boards', ['slug' => $slug]);
        }
    }

    public function test_inquiry_board_is_always_secret_and_notifies_admin(): void
    {
        $this->seed(PinkbroContentsSeeder::class);

        $board = \DB::table('boards')->where('slug', 'pinkbro_inquiry')->first();
        $this->assertNotNull($board);
        $this->assertSame('always', $board->secret_mode);
        // D12 — 새 문의는 관리자에게 알림된다. 별도 알림 코드 없이 게시판 플래그가 발화한다.
        $this->assertSame(1, (int) $board->notify_admin_on_post);
    }

    /**
     * 비회원 문의 접수의 전제 — guest 에게 글쓰기/첨부 권한이 실제로 부여된다.
     *
     * 새 테스트 DB 에는 역할 행이 없다(설치 시더는 테스트에서 돌지 않는다). 그래서
     * 설치 시더와 같은 출처(config('core.roles'))로 역할 행을 먼저 만든 뒤 시딩한다.
     * BoardPermissionService 는 존재하지 않는 역할을 조용히 건너뛰므로 이 사전 조건이
     * 없으면 부여 자체가 일어나지 않아 검증이 성립하지 않는다.
     *
     * 전체 집합을 등호로 비교하지 않는다 — 게시판을 BoardService::createBoard 로 만들면
     * 게시판 스코프 manager/step 역할이 모든 권한에 추가 주입된다
     * (BoardService::injectBoardRolesToPermissions; 선례
     * sirsoft-board tests/Feature/Admin/BoardManagementTest.php::test_custom_permissions_still_include_manager_step).
     * 주입은 더하기만 하므로, 시더가 선언한 역할이 실제로 붙었는지를 포함 검사로 본다.
     */
    public function test_inquiry_board_grants_guest_write_permissions(): void
    {
        $this->createCoreRoles('admin', 'user', 'guest');

        $this->seed(PinkbroContentsSeeder::class);

        foreach (['posts.write', 'attachments.upload'] as $action) {
            $permission = Permission::where('identifier', "sirsoft-board.pinkbro_inquiry.{$action}")->first();

            $this->assertNotNull($permission, "권한 sirsoft-board.pinkbro_inquiry.{$action} 이 생성되지 않았습니다.");

            $roleIdentifiers = $permission->roles()->pluck('identifier')->all();

            // 시더가 선언한 역할. guest 가 빠지면 이 루프가 실패한다 — 이것이 요구사항이다.
            foreach (['admin', 'user', 'guest'] as $identifier) {
                $this->assertContains(
                    $identifier,
                    $roleIdentifiers,
                    "sirsoft-board.pinkbro_inquiry.{$action} 에 {$identifier} 역할이 부여되지 않았습니다."
                );
            }
        }
    }

    /**
     * 설치 시더와 같은 출처(config('core.roles'))로 코어 역할 행을 만든다.
     *
     * 새 이름을 만들지 않는다 — 시더가 만드는 이름은 설치 시더의 값 그대로다.
     */
    private function createCoreRoles(string ...$identifiers): void
    {
        foreach (config('core.roles') as $definition) {
            if (! in_array($definition['identifier'], $identifiers, true)) {
                continue;
            }

            Role::updateOrCreate(
                ['identifier' => $definition['identifier']],
                [
                    'name' => $definition['name'],
                    'description' => $definition['description'] ?? null,
                    'extension_type' => ExtensionOwnerType::Core,
                    'extension_identifier' => 'core',
                ]
            );
        }
    }

    public function test_it_seeds_six_services_with_module_copy(): void
    {
        $this->seed(PinkbroContentsSeeder::class);

        $services = \DB::table('board_posts')
            ->where('board_id', \DB::table('boards')->where('slug', 'pinkbro_service')->value('id'))
            ->pluck('title')
            ->all();

        $this->assertContains('바닥 기계세척', $services);
        $this->assertContains('에어컨 분해세척', $services);
        $this->assertCount(6, $services);
    }

    public function test_it_seeds_site_level_meta(): void
    {
        $this->seed(PinkbroContentsSeeder::class);
        $meta = app(ContentMetaService::class);

        $this->assertSame('010-4348-8158', $meta->get(null, null, MetaDomain::SITE, 'phone'));
        $this->assertSame('http://pf.kakao.com/_gmcuG', $meta->get(null, null, MetaDomain::SITE, 'kakao_channel'));
        $this->assertIsArray($meta->get(null, null, MetaDomain::DISCOUNT, 'steps'));
    }

    public function test_it_seeds_eight_faq_items(): void
    {
        $this->seed(PinkbroContentsSeeder::class);

        $count = \DB::table('board_posts')
            ->where('board_id', \DB::table('boards')->where('slug', 'pinkbro_faq')->value('id'))
            ->count();

        $this->assertSame(8, $count);
    }

    public function test_running_twice_is_idempotent(): void
    {
        $this->seed(PinkbroContentsSeeder::class);
        $before = \DB::table('board_posts')->count();
        $this->seed(PinkbroContentsSeeder::class);
        $after = \DB::table('board_posts')->count();

        $this->assertSame($before, $after);
        $this->assertSame(6, \DB::table('boards')->whereIn('slug', [
            'pinkbro_service', 'pinkbro_package', 'pinkbro_case',
            'pinkbro_faq', 'pinkbro_inquiry', 'pinkbro_media',
        ])->count());
    }
}
