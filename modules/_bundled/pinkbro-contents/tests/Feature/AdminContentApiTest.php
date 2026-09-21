<?php

namespace Modules\Pinkbro\Contents\Tests\Feature;

use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Modules\Pinkbro\Contents\Database\Seeders\PinkbroContentsSeeder;
use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Http\Requests\Admin\ContentStoreRequest;
use Modules\Pinkbro\Contents\Http\Resources\Admin\AdminContentResource;
use Modules\Pinkbro\Contents\Services\ContentMetaService;
use Modules\Pinkbro\Contents\Tests\PinkbroContentsTestCase;
use Modules\Sirsoft\Board\Models\Board;

/**
 * 관리자 콘텐츠 CRUD API — service / package / case / faq.
 *
 * 모든 모듈 테스트는 PinkbroContentsTestCase 를 상속한다 (RefreshDatabase 포함,
 * 모듈 라우트를 `api/modules/pinkbro-contents` prefix 로 등록, 모듈 권한 트리 생성).
 * 테스트 DB 미가용 환경에서는 setUp 단계에서 skip 된다.
 *
 * 인증은 선례(`twentyft-content` InquiryAdminApiTest)와 같이
 * `Sanctum::actingAs` 로 한다 — 헬퍼는 베이스 클래스(`actingAsAdmin`)에 있다.
 *
 * 관리자 응답은 공개 API 와 다르다: 목록이 `{data: {data: [...], meta: {...}}}` 이중 중첩이고,
 * 단건·생성·수정은 `{data: {...}}` 단일 래핑이다.
 */
class AdminContentApiTest extends PinkbroContentsTestCase
{
    private const BASE = '/api/modules/pinkbro-contents/admin';

    /** 도메인 → 시더가 만든 게시판 slug (시더 BOARDS 키 그대로). */
    private const BOARDS = [
        'service' => 'pinkbro_service',
        'package' => 'pinkbro_package',
        'case' => 'pinkbro_case',
        'faq' => 'pinkbro_faq',
    ];

    /** 도메인 → 시더가 넣은 게시글 수 (수정·삭제 테스트의 기준선). */
    private const SEEDED_COUNTS = [
        'service' => 6,
        'package' => 3,
        'case' => 4,
        'faq' => 8,
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PinkbroContentsSeeder::class);
    }

    private function boardId(string $domain): int
    {
        return (int) Board::query()->where('slug', self::BOARDS[$domain])->value('id');
    }

    private function meta(): ContentMetaService
    {
        return app(ContentMetaService::class);
    }

    /**
     * 도메인 목록을 관리자 API 로 읽어 `data.data` 를 돌려준다.
     *
     * @return array<int, array<string, mixed>>
     */
    private function listItems(string $domain): array
    {
        return $this->actingAsAdmin()
            ->getJson(self::BASE.'/'.$domain)
            ->assertOk()
            ->json('data.data');
    }

    // ── 생성 ────────────────────────────────────────────────────────────────

    public function test_it_creates_a_service_post(): void
    {
        $res = $this->actingAsAdmin()->postJson(self::BASE.'/service', [
            'slug' => 'test-care',
            'title' => '테스트 서비스',
            'tag' => 'Test Care',
            'summary' => '요약',
            'criteria' => '기준',
            'base_price' => '10,000원~',
            'extra_note' => '메모',
            'photo_slot' => 'services_floor',
            'sort' => 9,
            'is_visible' => true,
        ]);

        $res->assertCreated();

        // 응답은 도메인 키 전체를 갖는 단일 래핑이다 (목록만 이중 중첩).
        $res->assertJsonStructure(['data' => [
            'id', 'slug', 'title', 'tag', 'summary', 'criteria',
            'base_price', 'extra_note', 'photo_slot', 'air_types', 'sort', 'is_visible',
        ]]);

        $boardId = $this->boardId('service');

        $this->assertDatabaseHas('board_posts', [
            'board_id' => $boardId,
            'title' => '테스트 서비스',
            'status' => 'published',
        ]);

        // slug 는 게시글 컬럼이 아니라 메타 행에 저장된다 (SPEC §4.5).
        $this->assertFalse(Schema::hasColumn('board_posts', 'slug'));

        $postId = (int) $res->json('data.id');
        $this->assertGreaterThan(0, $postId);

        $meta = $this->meta();
        $this->assertSame('test-care', $meta->get($boardId, $postId, MetaDomain::SERVICE, 'slug'));
        $this->assertSame('services_floor', $meta->get($boardId, $postId, MetaDomain::SERVICE, 'photo_slot'));
        $this->assertTrue($meta->get($boardId, $postId, MetaDomain::SERVICE, 'is_visible'));
        $this->assertSame(9, $meta->get($boardId, $postId, MetaDomain::SERVICE, 'sort'));
    }

    public function test_it_creates_a_faq_post_with_the_question_as_the_post_title(): void
    {
        $res = $this->actingAsAdmin()->postJson(self::BASE.'/faq', [
            'question' => '테스트 질문?',
            'answer' => '테스트 답변',
            'sort' => 9,
        ]);

        $res->assertCreated();

        $postId = (int) $res->json('data.id');
        $boardId = $this->boardId('faq');

        // FAQ 도메인에는 title 키가 없다 — 게시글 제목은 question 이다 (시더와 같은 규칙).
        $this->assertDatabaseHas('board_posts', [
            'id' => $postId,
            'board_id' => $boardId,
            'title' => '테스트 질문?',
        ]);

        $this->assertSame('테스트 답변', $this->meta()->get($boardId, $postId, MetaDomain::FAQ, 'answer'));
    }

    public function test_create_requires_the_title_key_of_the_domain(): void
    {
        // service 는 title, faq 는 question 이 필수다 — faq 는 title 을 받지 않는다.
        $missingTitle = $this->actingAsAdmin()
            ->postJson(self::BASE.'/service', ['tag' => 'Test Care'])
            ->assertStatus(422);

        $this->assertIsString($missingTitle->json('errors.title.0'));

        $this->actingAsAdmin()
            ->postJson(self::BASE.'/faq', ['title' => 'title 은 faq 키가 아니다'])
            ->assertStatus(422)
            ->assertJsonStructure(['errors' => ['question']]);
    }

    // ── 목록 ────────────────────────────────────────────────────────────────

    public function test_the_admin_list_is_double_nested_and_sorted(): void
    {
        $res = $this->actingAsAdmin()->getJson(self::BASE.'/service');

        $res->assertOk();
        $res->assertJsonStructure(['data' => [
            'data' => [['id', 'slug', 'title', 'tag', 'summary', 'criteria', 'base_price', 'extra_note', 'photo_slot', 'air_types', 'sort', 'is_visible']],
            'meta' => ['total'],
        ]]);

        // 공개 API 의 평탄 목록(`data.0`)이 아니다 — 이중 중첩이 계약이다.
        $this->assertNull($res->json('data.0'));

        $this->assertSame(self::SEEDED_COUNTS['service'], $res->json('data.meta.total'));
        $this->assertSame('바닥 기계세척', $res->json('data.data.0.title'));
        $this->assertSame('floor-care', $res->json('data.data.0.slug'));
    }

    public function test_it_shows_a_single_post_with_every_domain_key(): void
    {
        $first = $this->listItems('service')[0];

        $res = $this->actingAsAdmin()->getJson(self::BASE.'/service/'.$first['id']);

        $res->assertOk();
        $res->assertJsonPath('data.id', $first['id']);
        $res->assertJsonPath('data.slug', 'floor-care');
        $res->assertJsonPath('data.title', '바닥 기계세척');
        $res->assertSame($first, $res->json('data'));
    }

    // ── 수정 ────────────────────────────────────────────────────────────────

    public function test_it_updates_a_post_and_leaves_the_other_posts_untouched(): void
    {
        $boardId = $this->boardId('service');
        $before = collect($this->listItems('service'))->keyBy('id');
        $targetId = (int) $before->firstWhere('slug', 'glass-care')['id'];

        $this->actingAsAdmin()->putJson(self::BASE.'/service/'.$targetId, [
            'title' => '수정된 유리창 세척',
            'summary' => '수정된 요약',
            'sort' => 42,
        ])->assertOk();

        $meta = $this->meta();

        $this->assertDatabaseHas('board_posts', ['id' => $targetId, 'title' => '수정된 유리창 세척']);
        $this->assertSame('수정된 요약', $meta->get($boardId, $targetId, MetaDomain::SERVICE, 'summary'));
        $this->assertSame(42, $meta->get($boardId, $targetId, MetaDomain::SERVICE, 'sort'));

        // 보내지 않은 키는 그대로 남는다 (부분 갱신).
        $this->assertSame($before[$targetId]['slug'], $meta->get($boardId, $targetId, MetaDomain::SERVICE, 'slug'));
        $this->assertSame($before[$targetId]['criteria'], $meta->get($boardId, $targetId, MetaDomain::SERVICE, 'criteria'));

        // 나머지 5건은 제목·메타 모두 불변이다.
        $after = collect($this->listItems('service'))->keyBy('id');
        $this->assertCount(self::SEEDED_COUNTS['service'], $after);

        foreach ($before as $id => $item) {
            $this->assertSame($item['title'], $meta->get($boardId, $id, MetaDomain::SERVICE, 'title'));

            if ($id === $targetId) {
                continue;
            }

            $this->assertSame($item, $after[(int) $id]);
        }
    }

    /**
     * 수정은 부분 갱신이다 — 필수 키(title)를 빼고 보내도 422 가 아니어야 한다.
     *
     * 관리자 폼은 바뀐 필드만 보낼 수 있다. 이 규칙이 깨지면 모든 부분 저장이 422 가 된다.
     */
    public function test_update_accepts_a_body_without_the_title_key(): void
    {
        $boardId = $this->boardId('service');
        $target = collect($this->listItems('service'))->firstWhere('slug', 'floor-care');

        $this->actingAsAdmin()
            ->putJson(self::BASE.'/service/'.$target['id'], ['tag' => 'Partial Tag'])
            ->assertOk();

        $meta = $this->meta();

        $this->assertSame('Partial Tag', $meta->get($boardId, $target['id'], MetaDomain::SERVICE, 'tag'));
        $this->assertSame($target['slug'], $meta->get($boardId, $target['id'], MetaDomain::SERVICE, 'slug'));
        $this->assertDatabaseHas('board_posts', ['id' => $target['id'], 'title' => '바닥 기계세척']);
    }

    // ── 삭제 ────────────────────────────────────────────────────────────────

    public function test_it_deletes_a_post_and_its_meta(): void
    {
        $boardId = $this->boardId('service');
        $targetId = (int) $this->listItems('service')[0]['id'];

        $this->assertDatabaseHas('pinkbro_meta', ['board_id' => $boardId, 'post_id' => $targetId]);

        $this->actingAsAdmin()->deleteJson(self::BASE.'/service/'.$targetId)->assertNoContent();

        $this->assertDatabaseMissing('pinkbro_meta', ['board_id' => $boardId, 'post_id' => $targetId]);
        $this->assertSame(0, \DB::table('pinkbro_meta')->where('post_id', $targetId)->count());

        // 게시글은 소프트 삭제된다 (PostService::deletePost) — 목록에서 빠진다.
        $this->assertDatabaseHas('board_posts', ['id' => $targetId, 'status' => 'deleted']);

        $this->assertNotContains(
            $targetId,
            array_column($this->listItems('service'), 'id')
        );
    }

    // ── 도메인 4종 ──────────────────────────────────────────────────────────

    public function test_every_domain_creates_on_its_own_board_and_lists_it_back(): void
    {
        $payloads = [
            'service' => ['title' => '신규 서비스', 'summary' => '요약', 'sort' => 7],
            'package' => ['title' => '신규 패키지', 'summary' => '요약', 'includes' => ['바닥 기계세척'], 'sort' => 7],
            'case' => ['title' => '신규 사례', 'summary' => '요약', 'blog_url' => '', 'cover_slot' => 'case_1', 'sort' => 7],
            'faq' => ['question' => '신규 질문?', 'answer' => '신규 답변', 'sort' => 7],
        ];

        foreach ($payloads as $domain => $payload) {
            $created = $this->actingAsAdmin()
                ->postJson(self::BASE.'/'.$domain, $payload)
                ->assertCreated()
                ->json('data.id');

            $this->assertDatabaseHas('board_posts', [
                'id' => $created,
                'board_id' => $this->boardId($domain),
            ]);

            $list = $this->actingAsAdmin()->getJson(self::BASE.'/'.$domain)->assertOk();

            $this->assertSame(self::SEEDED_COUNTS[$domain] + 1, $list->json('data.meta.total'));
            $this->assertContains($created, array_column($list->json('data.data'), 'id'));
        }
    }

    // ── 404 / 401 / 403 ─────────────────────────────────────────────────────

    /**
     * 입력 계약(검증 표)과 응답 계약(리소스 키)이 같은 키 집합을 갖는지.
     *
     * 두 표가 어긋나면 "보낼 수는 있지만 응답에 안 나오는 키" 또는 그 반대가 생긴다.
     */
    public function test_the_input_and_output_domain_key_lists_stay_aligned(): void
    {
        $fields = (new \ReflectionClass(ContentStoreRequest::class))->getConstant('FIELDS');

        foreach (AdminContentResource::KEYS as $domain => $keys) {
            $declared = array_values(array_filter(
                array_keys($fields[$domain] ?? []),
                fn (string $key): bool => ! str_contains($key, '*')
            ));

            $this->assertSame($keys, $declared, "도메인 {$domain} 의 입력/응답 키 집합이 어긋납니다.");
        }
    }

    public function test_an_unknown_domain_is_not_found(): void
    {
        $this->actingAsAdmin()->getJson(self::BASE.'/bogus')->assertNotFound();
        $this->actingAsAdmin()->getJson(self::BASE.'/bogus/1')->assertNotFound();
        $this->actingAsAdmin()->postJson(self::BASE.'/bogus', ['title' => 'x'])->assertNotFound();
        $this->actingAsAdmin()->putJson(self::BASE.'/bogus/1', ['title' => 'x'])->assertNotFound();
        $this->actingAsAdmin()->deleteJson(self::BASE.'/bogus/1')->assertNotFound();
    }

    public function test_an_unknown_or_non_numeric_post_id_is_not_found(): void
    {
        foreach (['999999', 'not-a-number'] as $id) {
            $this->actingAsAdmin()->getJson(self::BASE.'/service/'.$id)->assertNotFound();
            $this->actingAsAdmin()->putJson(self::BASE.'/service/'.$id, ['title' => 'x'])->assertNotFound();
            $this->actingAsAdmin()->deleteJson(self::BASE.'/service/'.$id)->assertNotFound();
        }
    }

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $this->getJson(self::BASE.'/service')->assertUnauthorized();
        $this->postJson(self::BASE.'/service', [])->assertUnauthorized();
        $this->putJson(self::BASE.'/service/1', [])->assertUnauthorized();
        $this->deleteJson(self::BASE.'/service/1')->assertUnauthorized();
    }

    public function test_a_user_without_the_permission_is_forbidden(): void
    {
        // user 역할은 이 모듈의 권한을 하나도 갖지 않는다 — 403 이어야 한다.
        Sanctum::actingAs($this->createUser(), ['*'], 'sanctum');

        $this->getJson(self::BASE.'/service')->assertForbidden();
        $this->postJson(self::BASE.'/service', ['title' => 'x'])->assertForbidden();
        $this->deleteJson(self::BASE.'/service/1')->assertForbidden();
    }
}
