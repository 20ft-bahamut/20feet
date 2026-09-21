<?php

namespace Modules\Pinkbro\Contents\Tests\Feature;

use Illuminate\Support\Facades\DB;
use Modules\Pinkbro\Contents\Database\Seeders\PinkbroContentsSeeder;
use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Services\ContentMetaService;
use Modules\Pinkbro\Contents\Tests\PinkbroContentsTestCase;

/**
 * 관리자 문의 API — 목록·단건·상태 변경.
 *
 * 모든 모듈 테스트는 PinkbroContentsTestCase 를 상속한다 (RefreshDatabase 포함,
 * 모듈 라우트를 `api/modules/pinkbro-contents` prefix 로 등록, 모듈 권한 트리 생성).
 * 테스트 DB 미가용 환경에서는 setUp 단계에서 skip 된다.
 *
 * 문의는 공개 접수 엔드포인트(POST inquiry)로 만든다 — 관리자 API 가 소비하는
 * 데이터는 실제 접수 경로가 만든 것과 같아야 하기 때문이다 (게시판 비밀글 + 메타).
 * 상태 검증은 `Rule::enum` (InquiryStatus) 이고, 권한은
 * `pinkbro-contents.inquiries.{read|update}` 다.
 */
class AdminInquiryApiTest extends PinkbroContentsTestCase
{
    private const BASE = '/api/modules/pinkbro-contents/admin/inquiry';

    private const PUBLIC_ENDPOINT = '/api/modules/pinkbro-contents/inquiry';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PinkbroContentsSeeder::class);
    }

    /**
     * 공개 접수 엔드포인트로 문의 1건을 만들고 원문 게시글 id 를 돌려준다.
     */
    private function submit(array $overrides = []): int
    {
        $this->postJson(self::PUBLIC_ENDPOINT, $this->payload($overrides))->assertCreated();

        $boardId = (int) DB::table('boards')->where('slug', 'pinkbro_inquiry')->value('id');

        return (int) DB::table('board_posts')->where('board_id', $boardId)->latest('id')->value('id');
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'business_type' => '카페',
            'services' => ['바닥 기계세척', '유리창 세척'],
            'store_size' => '24평, 외부 유리 8m',
            'contact' => '010-1234-5678',
            'message' => '작업 희망일은 10월 첫째 주입니다.',
            'privacy_consent' => true,
            'website' => '',
        ], $overrides);
    }

    public function test_it_lists_submitted_inquiries_with_meta(): void
    {
        $first = $this->submit();
        $second = $this->submit(['business_type' => '에어컨', 'contact' => '010-0000-0000']);

        $res = $this->actingAsAdmin()->getJson(self::BASE);

        $res->assertOk()->assertJsonStructure([
            'data' => [
                'data' => [
                    ['id', 'business_type', 'services', 'store_size', 'contact', 'message', 'status', 'created_at'],
                ],
                'meta' => ['total', 'per_page', 'current_page'],
            ],
        ]);

        $this->assertSame(2, $res->json('data.meta.total'));
        $this->assertSame(20, $res->json('data.meta.per_page'));
        $this->assertSame(1, $res->json('data.meta.current_page'));

        $items = $res->json('data.data');
        $this->assertCount(2, $items);

        // 최신순 — 나중에 접수한 문의가 먼저 온다.
        $this->assertSame($second, $items[0]['id']);
        $this->assertSame($first, $items[1]['id']);
        $this->assertSame('에어컨', $items[0]['business_type']);
        $this->assertSame(['바닥 기계세척', '유리창 세척'], $items[0]['services']);
        $this->assertSame('010-0000-0000', $items[0]['contact']);
        $this->assertSame('new', $items[0]['status']);
        $this->assertNotNull($items[0]['created_at']);
    }

    public function test_it_filters_by_status(): void
    {
        $this->submit();
        $target = $this->submit(['business_type' => '병원']);

        $this->actingAsAdmin()->putJson(self::BASE.'/'.$target, ['status' => 'in_progress'])->assertOk();

        $res = $this->actingAsAdmin()->getJson(self::BASE.'?status=in_progress');

        $res->assertOk();
        $this->assertSame(1, $res->json('data.meta.total'));
        $this->assertSame($target, $res->json('data.data.0.id'));
        $this->assertSame('in_progress', $res->json('data.data.0.status'));
    }

    public function test_it_shows_a_single_inquiry(): void
    {
        $id = $this->submit(['store_size' => '12평']);

        $res = $this->actingAsAdmin()->getJson(self::BASE.'/'.$id);

        $res->assertOk()->assertJsonStructure([
            'data' => ['id', 'business_type', 'services', 'store_size', 'contact', 'message', 'status', 'created_at'],
        ]);
        $this->assertSame($id, $res->json('data.id'));
        $this->assertSame('12평', $res->json('data.store_size'));
    }

    public function test_it_updates_status_and_internal_note(): void
    {
        $boardId = (int) DB::table('boards')->where('slug', 'pinkbro_inquiry')->value('id');
        $id = $this->submit();

        $res = $this->actingAsAdmin()->putJson(self::BASE.'/'.$id, [
            'status' => 'done',
            'internal_note' => '완료',
        ]);

        $res->assertOk();
        $this->assertSame('done', $res->json('data.status'));

        $meta = app(ContentMetaService::class);
        $this->assertSame('done', $meta->get($boardId, $id, MetaDomain::INQUIRY, 'status'));
        $this->assertSame('완료', $meta->get($boardId, $id, MetaDomain::INQUIRY, 'internal_note'));
    }

    public function test_an_invalid_status_is_rejected(): void
    {
        $id = $this->submit();

        $res = $this->actingAsAdmin()->putJson(self::BASE.'/'.$id, ['status' => 'bogus']);

        $res->assertStatus(422);
    }

    public function test_permission_is_required(): void
    {
        $this->getJson(self::BASE)->assertUnauthorized();
    }
}
