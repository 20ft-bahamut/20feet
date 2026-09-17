<?php

namespace Modules\Twentyft\Content\Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Models\Post;
use Modules\Twentyft\Content\Services\PostMetaService;
use Tests\TestCase;

/**
 * 프로젝트 문의 관리자 API — 실제 요청을 태워 검증한다.
 *
 * 정적 테스트(`InquiryAdminDetailTest`)는 JSON 모양만 본다. 여기서는 커널을 띄워
 * 권한 미들웨어, 라우트 제약, 404/422 분기, 응답 계약, 로케일 라벨을 확인한다.
 * 레이아웃의 `initLocal: "form"` 이 기대하는 응답 키도 이 계약에 포함된다.
 */
class InquiryAdminApiTest extends TestCase
{
    use RefreshDatabase;

    private const BASE = '/api/modules/twentyft-content/admin/inquiries';

    private const BOARD_SLUG = 'project-inquiry';

    private Board $board;

    private Post $post;

    /** 읽기 + 쓰기 권한을 가진 운영자 */
    private User $operator;

    /** 읽기 권한만 가진 운영자 */
    private User $reader;

    /**
     * 테스트 DB에 접속할 수 없으면 migrate:fresh 를 시도하기 전에 건너뛴다.
     *
     * 이 저장소의 DB 테스트는 `.env.testing` 의 테스트 DB를 쓴다. 그 접속 정보가 없는
     * 환경(예: 테스트 DB 미생성)에서는 RefreshDatabase 가 접속 오류로 죽어
     * "테스트 실패"와 "환경 미비"가 구분되지 않는다. 여기서 갈라 놓는다.
     */
    protected function beforeRefreshingDatabase(): void
    {
        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            $this->markTestSkipped('테스트 DB에 접속할 수 없어 건너뜁니다: '.$e->getMessage());
        }
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->board = Board::create([
            'name' => ['ko' => '프로젝트 문의', 'en' => 'Project Inquiry'],
            'slug' => self::BOARD_SLUG,
            'type' => 'basic',
        ]);

        $this->post = Post::create([
            'board_id' => $this->board->id,
            'title' => '[웹사이트] 테스트 문의자 - 2026-09-16',
            'content' => "첫 줄\n둘째 줄",
            'author_name' => '테스트 문의자',
            'ip_address' => '127.0.0.1',
            'is_secret' => true,
            'status' => 'published',
        ]);

        $meta = app(PostMetaService::class);
        foreach ([
            'name' => '테스트 문의자',
            'email' => 'tester@example.com',
            'phone' => null,
            'company' => null,
            'project_type' => 'WEB',
            'current_site_url' => null,
            'budget_range' => null,
            'desired_schedule' => null,
            'reference_url' => null,
            'privacy_consent' => true,
            'internal_status' => 'NEW',
        ] as $key => $value) {
            $meta->set($this->board->id, $this->post->id, 'inquiry', $key, $value);
        }

        $this->operator = $this->makeUser([
            'twentyft-content.inquiries.read',
            'twentyft-content.inquiries.update',
        ]);
        $this->reader = $this->makeUser(['twentyft-content.inquiries.read']);
    }

    /**
     * 지정한 권한만 가진 운영자를 만든다.
     *
     * @param  array<int, string>  $permissions
     */
    private function makeUser(array $permissions): User
    {
        $role = Role::firstOrCreate(
            ['identifier' => 'inquiry_test_'.md5(implode(',', $permissions))],
            ['name' => ['ko' => '테스트 역할', 'en' => 'Test Role']]
        );

        foreach ($permissions as $identifier) {
            $permission = Permission::firstOrCreate(
                ['identifier' => $identifier],
                [
                    'name' => ['ko' => $identifier, 'en' => $identifier],
                    'type' => 'admin',
                ]
            );
            $role->permissions()->syncWithoutDetaching([$permission->id]);
        }

        // admin 역할은 사이트 전체 권한을 갖는다. 권한 경계를 실제로 보려면 붙이지 않는다.
        $user = User::factory()->create();
        $user->roles()->attach($role->id);

        return $user;
    }

    private function actingAsOperator(User $user): self
    {
        Sanctum::actingAs($user, ['*'], 'sanctum');

        return $this;
    }

    // ── 접근 경계 ───────────────────────────────────────────────────────────

    public function test_detail_requires_authentication(): void
    {
        $this->getJson(self::BASE.'/'.$this->post->id)->assertStatus(401);
    }

    public function test_detail_denies_a_user_without_the_read_permission(): void
    {
        $this->actingAsOperator(User::factory()->create())
            ->getJson(self::BASE.'/'.$this->post->id)
            ->assertStatus(403);
    }

    public function test_status_change_denies_a_read_only_operator(): void
    {
        $this->actingAsOperator($this->reader)
            ->patchJson(self::BASE.'/'.$this->post->id.'/status', ['status' => 'CLOSED'])
            ->assertStatus(403);

        $this->assertSame(
            'NEW',
            app(PostMetaService::class)->get($this->board->id, $this->post->id, 'inquiry', 'internal_status')
        );
    }

    // ── 상세 응답 계약 ──────────────────────────────────────────────────────

    public function test_detail_returns_every_stored_meta_key_and_the_body(): void
    {
        $response = $this->actingAsOperator($this->operator)
            ->getJson(self::BASE.'/'.$this->post->id)
            ->assertStatus(200);

        // 레이아웃이 initLocal: "form" 으로 그대로 바인딩하는 키들이다.
        $response->assertJsonStructure([
            'data' => [
                'postId', 'title', 'content', 'authorName', 'createdAt', 'createdAtLabel',
                'name', 'email', 'phone', 'company',
                'projectType', 'projectTypeLabel',
                'budgetRange', 'budgetRangeLabel',
                'desiredSchedule', 'currentSiteUrl', 'referenceUrl',
                'privacyConsent', 'internalStatus', 'internalStatusLabel',
            ],
        ]);

        $response->assertJsonPath('data.content', "첫 줄\n둘째 줄");
        $response->assertJsonPath('data.name', '테스트 문의자');
        $response->assertJsonPath('data.email', 'tester@example.com');
        $response->assertJsonPath('data.privacyConsent', true);
        $response->assertJsonPath('data.internalStatus', 'NEW');
    }

    public function test_detail_returns_a_locale_aware_label(): void
    {
        $this->actingAsOperator($this->operator);

        $this->app->setLocale('ko');
        $this->getJson(self::BASE.'/'.$this->post->id)
            ->assertJsonPath('data.internalStatusLabel', '신규')
            ->assertJsonPath('data.projectTypeLabel', '웹사이트');

        $this->app->setLocale('en');
        $this->getJson(self::BASE.'/'.$this->post->id)
            ->assertJsonPath('data.internalStatusLabel', 'New')
            ->assertJsonPath('data.projectTypeLabel', 'Website');
    }

    public function test_detail_returns_null_labels_for_values_that_were_never_stored(): void
    {
        // 예산 미입력은 정상 상태다 — 라벨이 null 이면 화면은 '-' 를 그린다.
        $this->actingAsOperator($this->operator)
            ->getJson(self::BASE.'/'.$this->post->id)
            ->assertStatus(200)
            ->assertJsonPath('data.budgetRange', null)
            ->assertJsonPath('data.budgetRangeLabel', null)
            ->assertJsonPath('data.currentSiteUrl', null);
    }

    public function test_detail_returns_404_for_an_unknown_post(): void
    {
        $this->actingAsOperator($this->operator)
            ->getJson(self::BASE.'/999999')
            ->assertStatus(404);
    }

    /**
     * 컨트롤러의 int 파라미터에 숫자가 아닌 값이 닿으면 TypeError 로 500 이 된다.
     * 라우트 제약이 그 전에 404 로 돌린다.
     */
    public function test_detail_returns_404_for_a_non_numeric_post_id(): void
    {
        $this->actingAsOperator($this->operator)
            ->getJson(self::BASE.'/not-a-number')
            ->assertStatus(404);
    }

    // ── 상태 변경 ───────────────────────────────────────────────────────────

    public function test_status_change_persists_for_an_operator_with_the_update_permission(): void
    {
        $this->actingAsOperator($this->operator)
            ->patchJson(self::BASE.'/'.$this->post->id.'/status', ['status' => 'REVIEWING'])
            ->assertStatus(200);

        $this->assertSame(
            'REVIEWING',
            app(PostMetaService::class)->get($this->board->id, $this->post->id, 'inquiry', 'internal_status')
        );
    }

    public function test_status_change_rejects_an_unknown_status(): void
    {
        $this->actingAsOperator($this->operator)
            ->patchJson(self::BASE.'/'.$this->post->id.'/status', ['status' => 'BOGUS'])
            ->assertStatus(422);
    }

    /**
     * 배열을 그대로 tryFrom 에 넘기면 TypeError 로 500 이 난다(nullable enum 파라미터).
     * 422 로 정리돼 있어야 한다.
     */
    public function test_status_change_rejects_a_non_string_status_without_a_server_error(): void
    {
        $this->actingAsOperator($this->operator)
            ->patchJson(self::BASE.'/'.$this->post->id.'/status', ['status' => ['NEW']])
            ->assertStatus(422);
    }

    public function test_status_change_returns_404_for_a_non_numeric_post_id(): void
    {
        $this->actingAsOperator($this->operator)
            ->patchJson(self::BASE.'/abc/status', ['status' => 'NEW'])
            ->assertStatus(404);
    }

    // ── 목록 ────────────────────────────────────────────────────────────────

    public function test_list_exposes_labels_alongside_the_raw_values(): void
    {
        $this->actingAsOperator($this->reader)
            ->getJson(self::BASE)
            ->assertStatus(200)
            ->assertJsonPath('data.data.0.projectType', 'WEB')
            ->assertJsonPath('data.data.0.projectTypeLabel', '웹사이트')
            ->assertJsonPath('data.data.0.internalStatusLabel', '신규')
            ->assertJsonPath('data.data.0.createdAtLabel', $this->post->created_at->format('Y-m-d H:i'));
    }

    public function test_list_does_not_leak_a_post_from_another_board(): void
    {
        $other = Board::create([
            'name' => ['ko' => '다른 게시판', 'en' => 'Other'],
            'slug' => 'other-board-'.uniqid(),
            'type' => 'basic',
        ]);
        $foreign = Post::create([
            'board_id' => $other->id,
            'title' => '다른 게시판 글',
            'content' => '내용',
            'author_name' => 'x',
            'ip_address' => '127.0.0.1',
            'status' => 'published',
        ]);

        $response = $this->actingAsOperator($this->reader)->getJson(self::BASE)->assertStatus(200);

        $ids = array_column($response->json('data.data'), 'postId');
        $this->assertContains($this->post->id, $ids);
        $this->assertNotContains($foreign->id, $ids);
    }
}
