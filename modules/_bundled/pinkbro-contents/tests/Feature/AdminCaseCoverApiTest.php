<?php

namespace Modules\Pinkbro\Contents\Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Pinkbro\Contents\Database\Seeders\PinkbroContentsSeeder;
use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Services\ContentMetaService;
use Modules\Pinkbro\Contents\Services\MediaSlotLinkService;
use Modules\Pinkbro\Contents\Tests\PinkbroContentsTestCase;
use Modules\Sirsoft\Board\Models\Attachment;
use Modules\Sirsoft\Board\Models\Board;

/**
 * 사례(case) 커버 업로드 — 저장 API 가 `cover_temp_key` 를 슬롯 연결로 푸는 경로.
 *
 * 관리자 사례 폼이 업로드를 섞은 저장(레이아웃 `admin_content_form.json` 의
 * emitEvent 계약)을 보내면, 사례 저장 트랜잭션 안에서 `MediaSlotLinkService` 가
 * 미디어 API 와 같은 코드로 연결한다. 여기서 잡는 계약:
 *  - 커버 업로드는 임시 첨부를 `cover_slot` 이 가리키는 슬롯에 연결하고,
 *    응답의 `cover{slot,url,alt}` 로 해석 결과를 돌려준다.
 *  - `cover_slot` 은 목록 밖 키(case_1..case_4 이외)를 받지 않는다.
 *  - 연결 실패면 사례 게시글·메타 쓰기도 함께 롤백된다 — "글은 저장, 사진은
 *    실패" 를 만들지 않는다. 폭탄은 board_posts UPDATE 중 `temp_key` 컬럼을
 *    만지는 쿼리(앵커 게시글의 임시키 소비)에서 터뜨린다 — 그 시점엔 사례
 *    게시글 쓰기가 이미 통과한 상태라 롤백 없이는 흔적이 남는다.
 *
 * 테스트 DB 미가용 환경에서는 setUp 단계에서 skip 된다 (선례: AdminMediaApiTest).
 */
class AdminCaseCoverApiTest extends PinkbroContentsTestCase
{
    private const BASE = '/api/modules/pinkbro-contents/admin';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PinkbroContentsSeeder::class);
    }

    /**
     * 업로드 직후 상태의 임시 첨부 1건 — 선례(AdminMediaApiTest::createTempAttachment)와
     * 같은 계약이다: hash 12자(board_attachments.hash 컬럼 길이), 실제 파일 없음
     * (물리 이동은 tmp 경로 부재로 건너뛰어지고 DB 행만 이동한다).
     */
    private function createTempAttachment(string $tempKey, string $filename = 'cover.jpg'): Attachment
    {
        return Attachment::create([
            'board_id' => 0,
            'post_id' => null,
            'temp_key' => $tempKey,
            'hash' => Str::random(12),
            'original_filename' => $filename,
            'stored_filename' => $filename,
            'disk' => 'local',
            'path' => 'pinkbro_media/temp/'.$tempKey.'/'.$filename,
            'mime_type' => 'image/jpeg',
            'size' => 1024,
            'collection' => 'attachments',
            'order' => 0,
        ]);
    }

    private function boardId(string $slug): int
    {
        return (int) Board::query()->where('slug', $slug)->value('id');
    }

    private function meta(): ContentMetaService
    {
        return app(ContentMetaService::class);
    }

    /**
     * board_posts UPDATE 중 `temp_key` 를 쓰는 쿼리(앵커 게시글의 임시키 소비,
     * PostService::updatePost)에서 폭탄을 터뜨린다 — 사례 게시글 UPDATE 는
     * 이미 통과한 뒤라, 롤백이 정상 동작이 아니라면 그 흔적이 남는다.
     * 던진 예외는 쿼리와 트랜잭션을 실패시킨다.
     */
    private function explodeOnAnchorTempKeyConsume(): void
    {
        DB::listen(function ($query): void {
            $sql = strtolower($query->sql);
            if (str_starts_with($sql, 'update') && str_contains($sql, 'board_posts') && str_contains($sql, 'temp_key')) {
                throw new \RuntimeException('chaos: rollback test');
            }
        });
    }

    /** @return array<int, array<string, mixed>> */
    private function listCases(): array
    {
        return $this->actingAsAdmin()
            ->getJson(self::BASE.'/case')
            ->assertOk()
            ->json('data.data');
    }

    public function test_creating_a_case_links_the_uploaded_cover_to_its_slot(): void
    {
        $this->actingAsAdmin();

        $this->createTempAttachment('tk-case-new');

        $res = $this->postJson(self::BASE.'/case', [
            'title' => '커버 사례',
            'summary' => '요약',
            'blog_url' => '',
            'cover_slot' => 'case_2',
            'cover_temp_key' => 'tk-case-new',
            'sort' => 7,
        ])->assertCreated();

        // 응답의 cover 는 슬롯 메타를 해석한 결과다 (컨트롤러 payload).
        $this->assertSame('case_2', $res->json('data.cover.slot'));
        $this->assertNotNull($res->json('data.cover.url'));

        $postId = (int) $res->json('data.id');
        $this->assertGreaterThan(0, $postId);

        // 임시 첨부는 앵커 게시글로 이동하고 temp_key 는 비워진다 (소비).
        $this->assertFalse(
            Attachment::query()->where('temp_key', 'tk-case-new')->exists(),
            '연결되면 temp_key 조회가 사라진다 (temp_key 는 null 로 소비된다)'
        );

        $linked = Attachment::query()
            ->where('original_filename', 'cover.jpg')
            ->where('board_id', $this->boardId(MediaSlotLinkService::BOARD_SLUG))
            ->whereNotNull('post_id')
            ->first();
        $this->assertNotNull($linked);
        $this->assertNull($linked->temp_key);

        // 슬롯 메타는 전역 스코프에 기록된다 (공개 API 가 읽는 그 행).
        $row = $this->meta()->get(null, null, MetaDomain::MEDIA, 'case_2');
        $this->assertSame((int) $linked->id, (int) ($row['attachment_id'] ?? 0));

        // 연산 키는 응답 계약에 없다 — 메타 행으로 흘러들지도 않는다.
        $this->assertDatabaseMissing('pinkbro_meta', [
            'board_id' => $this->boardId('pinkbro_case'),
            'post_id' => $postId,
            'key' => 'cover_temp_key',
        ]);
    }

    public function test_updating_a_case_links_the_uploaded_cover_to_its_slot(): void
    {
        $target = $this->listCases()[0];
        $this->createTempAttachment('tk-case-fix');

        $res = $this->putJson(self::BASE.'/case/'.$target['id'], [
            'title' => $target['title'],
            'cover_slot' => 'case_3',
            'cover_temp_key' => 'tk-case-fix',
        ])->assertOk();

        $this->assertSame('case_3', $res->json('data.cover.slot'));
        $this->assertNotNull($res->json('data.cover.url'));

        $row = $this->meta()->get(null, null, MetaDomain::MEDIA, 'case_3');
        $this->assertNotEmpty($row['attachment_id']);
    }

    public function test_a_cover_slot_outside_the_case_slot_list_is_rejected(): void
    {
        $target = $this->listCases()[0];

        foreach (['case_9', 'hero_main', 'not-a-slot'] as $slot) {
            $res = $this->putJson(self::BASE.'/case/'.$target['id'], [
                'title' => $target['title'],
                'cover_slot' => $slot,
            ])->assertStatus(422);

            $this->assertIsString($res->json('errors.cover_slot.0'));
        }
    }

    public function test_a_cover_upload_without_a_slot_is_rejected(): void
    {
        $this->actingAsAdmin();

        $this->createTempAttachment('tk-case-no-slot');

        $this->postJson(self::BASE.'/case', [
            'title' => '슬롯 없는 업로드',
            'cover_temp_key' => 'tk-case-no-slot',
        ])->assertStatus(422)->assertJsonStructure(['errors' => ['cover_slot']]);
    }

    public function test_an_unknown_cover_temp_key_is_a_validation_error(): void
    {
        $target = $this->listCases()[0];

        $res = $this->putJson(self::BASE.'/case/'.$target['id'], [
            'title' => $target['title'],
            'cover_slot' => 'case_1',
            'cover_temp_key' => 'never-uploaded',
        ])->assertStatus(422);

        $this->assertIsString($res->json('errors.cover_temp_key.0'));
    }

    /**
     * 롤백 증명 — 연결 실패(폭탄) 때 사례 게시글 제목 수정과 cover_slot 메타
     * 변경이 함께 원상복구되어야 한다.
     */
    public function test_a_link_failure_rolls_the_case_update_back(): void
    {
        $target = $this->listCases()[1];
        $targetId = (int) $target['id'];
        $caseBoardId = $this->boardId('pinkbro_case');

        $titleBefore = $this->meta()->get($caseBoardId, $targetId, MetaDomain::CASE, 'title') ?? $target['title'];
        $coverSlotBefore = $this->meta()->get($caseBoardId, $targetId, MetaDomain::CASE, 'cover_slot');

        $this->createTempAttachment('tk-case-rollback');
        $this->explodeOnAnchorTempKeyConsume();

        $res = $this->putJson(self::BASE.'/case/'.(string) $targetId, [
            'title' => '롤백되면 흔적이 남는 제목',
            'cover_slot' => 'case_1',
            'cover_temp_key' => 'tk-case-rollback',
        ]);

        $res->assertServerError();

        // 게시글 제목(메타 출처가 게시글 컬럼)과 cover_slot 메타가 모두 원상복구.
        $this->assertSame($titleBefore, $this->meta()->get($caseBoardId, $targetId, MetaDomain::CASE, 'title') ?? $target['title']);
        $this->assertSame($coverSlotBefore, $this->meta()->get($caseBoardId, $targetId, MetaDomain::CASE, 'cover_slot'));

        // 슬롯 메타(MEDIA)에 연결 흔적이 남는다 — 롤백이면 반드시 빈 값.
        $this->assertNull($this->meta()->get(null, null, MetaDomain::MEDIA, 'case_1'));

        // 임시 첨부는 아직 소비되지 않은 채 남는다 — 트랜잭션이 통째로 돌아갔다.
        $attachment = Attachment::query()->where('temp_key', 'tk-case-rollback')->first();
        $this->assertNotNull($attachment);
        $this->assertSame(0, (int) $attachment->board_id);
        $this->assertNull($attachment->post_id);
    }
}