<?php

namespace Modules\Pinkbro\Contents\Tests\Feature;

use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Modules\Pinkbro\Contents\Database\Seeders\PinkbroContentsSeeder;
use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Services\ContentMetaService;
use Modules\Pinkbro\Contents\Services\MediaSlotService;
use Modules\Pinkbro\Contents\Tests\PinkbroContentsTestCase;
use Modules\Sirsoft\Board\Models\Attachment;
use Modules\Sirsoft\Board\Models\Board;

/**
 * 관리자 미디어 슬롯 API — GET / PUT / DELETE `admin/media`.
 *
 * 모든 모듈 테스트는 PinkbroContentsTestCase 를 상속한다 (RefreshDatabase 포함,
 * 모듈 라우트를 `api/modules/pinkbro-contents` prefix 로 등록, 모듈 권한 트리 생성).
 * 테스트 DB 미가용 환경에서는 setUp 단계에서 skip 된다.
 *
 * ## 이 파일이 고정하는 계약
 *  - 슬롯 레지스트리(16키)는 `MediaSlotService` 가 유일한 출처다. 이 테스트는 슬롯
 *    목록을 손으로 적지 않고 서비스에서 읽어 비교한다 — 목록이 늘면 테스트도 같이 는다.
 *  - 메타는 **전역 스코프**(board_id=null, post_id=null)에 쓰인다. `MediaSlotService::link`
 *    가 그렇게 쓰고, 공개 읽기(`MediaController`)가 그 행을 읽는다. 그래서 모든 쓰기
 *    검증은 **공개 엔드포인트로 다시 읽어서** 확인한다 — 공개 API 로 읽히지 않는 쓰기는
 *    증명된 것이 아니다 (AdminSiteApiTest 와 같은 규칙).
 *  - `temp_key` 는 업로드 직후 상태의 첨부(board_id=0, post_id=null, temp_key 보유)를
 *    가리킨다. 연결되면 첨부는 `pinkbro_media` 게시판의 앵커 게시글에 붙고 temp_key 는
 *    비워진다 (`AttachmentService::linkTempAttachmentsWithMove` 계약).
 *  - 슬롯 해제는 **슬롯 단위**다. `deleteFor` 로 MEDIA 도메인을 통째로 지우면 다른 슬롯이
 *    함께 날아간다 — 그 회귀를 `test_delete_releases_only_the_target_slot` 이 막는다.
 */
class AdminMediaApiTest extends PinkbroContentsTestCase
{
    private const BASE = '/api/modules/pinkbro-contents/admin/media';

    private const PUBLIC_BASE = '/api/modules/pinkbro-contents/media-slots';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PinkbroContentsSeeder::class);
    }

    /**
     * 업로드 직후 상태의 임시 첨부 1건.
     *
     * `hash` 는 12자다 (`board_attachments.hash` 컬럼 길이 = 12, 모델 생성 훅도
     * `Str::random(12)`) — 긴 해시는 strict mode 에서 SQLSTATE[22001] 로 죽는다.
     *
     * 실제 파일은 만들지 않는다. `tmp` 경로는 존재하지 않으므로 연결 시 물리 이동
     * (`StorageInterface::get` → null)이 건너뛰어지고 DB 행만 이동한다 — 테스트가
     * 실제 파일시스템을 건드리지 않는다.
     */
    private function createTempAttachment(string $tempKey, string $filename = 'hero.jpg'): Attachment
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

    /**
     * 슬롯 1개의 현재 메타 행 (전역 스코프).
     *
     * @return array<string, mixed>|null
     */
    private function metaFor(string $slot): ?array
    {
        $row = app(ContentMetaService::class)->get(null, null, MetaDomain::MEDIA, $slot);

        return is_array($row) ? $row : null;
    }

    /**
     * 공개 엔드포인트로 슬롯 전체를 다시 읽는다.
     *
     * @return array<string, array{url: string|null, alt: string|null}>
     */
    private function readPublicSlots(): array
    {
        return $this->getJson(self::PUBLIC_BASE)->assertOk()->json('data');
    }

    /**
     * 슬롯 하나를 연결한다 (테스트 전제 조건 세팅).
     */
    private function linkSlot(string $slot, string $tempKey, ?string $alt = null): void
    {
        $this->putJson(self::BASE, array_filter([
            'slot' => $slot,
            'temp_key' => $tempKey,
            'alt' => $alt,
        ], fn ($v) => $v !== null))->assertOk();
    }

    // ── GET ────────────────────────────────────────────────────────────────

    public function test_media_index_lists_all_sixteen_slots_with_labels(): void
    {
        $res = $this->actingAsAdmin()->getJson(self::BASE);

        $res->assertOk();
        $this->assertCount(16, $res->json('data.slots'));
        $this->assertSame('hero_main', $res->json('data.slots.0.key'));
        $this->assertArrayHasKey('ko', $res->json('data.slots.0.label'));
        $this->assertArrayHasKey('en', $res->json('data.slots.0.label'));
    }

    public function test_media_index_key_set_is_the_service_registry_in_order(): void
    {
        $slots = $this->actingAsAdmin()->getJson(self::BASE)->assertOk()->json('data.slots');

        // 손으로 적은 목록과 비교하지 않는다: 서비스 레지스트리가 계약이다.
        $this->assertSame(MediaSlotService::slotKeys(), array_column($slots, 'key'));
        $this->assertSame(MediaSlotService::labels(), array_column($slots, 'label', 'key'));
    }

    public function test_media_index_reports_unset_slots_as_null_not_missing(): void
    {
        $slots = $this->actingAsAdmin()->getJson(self::BASE)->assertOk()->json('data.slots');

        foreach ($slots as $slot) {
            $this->assertNull($slot['url']);
            $this->assertNull($slot['alt']);
        }
    }

    public function test_media_index_reports_a_linked_slot(): void
    {
        $attachment = $this->createTempAttachment('tk-index');
        $this->actingAsAdmin();
        $this->linkSlot('hero_main', 'tk-index', '매장 외관');

        $slots = collect($this->getJson(self::BASE)->assertOk()->json('data.slots'))->keyBy('key');

        $this->assertNotNull($slots['hero_main']['url']);
        $this->assertSame('매장 외관', $slots['hero_main']['alt']);
        $this->assertSame(
            '/api/modules/sirsoft-board/boards/pinkbro_media/attachment/'.$attachment->hash.'/preview',
            $slots['hero_main']['url']
        );
    }

    // ── PUT ────────────────────────────────────────────────────────────────

    public function test_linking_a_slot_stores_the_attachment_reference(): void
    {
        $attachment = $this->createTempAttachment('tk-hero');
        $this->actingAsAdmin();

        $res = $this->putJson(self::BASE, [
            'slot' => 'hero_main',
            'temp_key' => 'tk-hero',
            'alt' => '매장 외관',
        ])->assertOk();

        // ① 응답은 GET 과 같은 모양이다 — 리소스 하나에 응답 모양 하나.
        $slots = collect($res->json('data.slots'))->keyBy('key');
        $this->assertCount(16, $slots);
        $this->assertSame('hero_main', $slots->keys()->first());
        $this->assertSame('매장 외관', $slots['hero_main']['alt']);
        $this->assertNotNull($slots['hero_main']['url']);

        // ② 메타에 첨부 참조가 기록된다 (전역 스코프).
        $meta = $this->metaFor('hero_main');
        $this->assertSame($attachment->id, $meta['attachment_id']);
        $this->assertSame($attachment->hash, $meta['hash']);
        $this->assertSame('매장 외관', $meta['alt']);

        // ③ 임시 첨부가 실제로 앵커 게시글에 연결됐다 (temp_key 소비 + 게시판 이동).
        $linked = $attachment->fresh();
        $this->assertNotNull($linked->post_id);
        $this->assertNull($linked->temp_key);
        $this->assertSame(
            Board::where('slug', 'pinkbro_media')->value('id'),
            $linked->board_id
        );

        // ④ 공개 엔드포인트가 그 슬롯을 서빙한다 — 공개로 안 읽히면 증명된 게 아니다.
        $public = $this->readPublicSlots();
        $this->assertNotNull($public['hero_main']['url']);
        $this->assertSame('매장 외관', $public['hero_main']['alt']);
    }

    public function test_linking_without_alt_leaves_alt_null(): void
    {
        $this->createTempAttachment('tk-no-alt');
        $this->actingAsAdmin();

        $this->linkSlot('hero_sub', 'tk-no-alt');

        $meta = $this->metaFor('hero_sub');
        $this->assertNotNull($meta['attachment_id']);
        $this->assertNull($meta['alt']);
    }

    public function test_relinking_a_slot_replaces_the_previous_attachment(): void
    {
        $first = $this->createTempAttachment('tk-first', 'first.jpg');
        $second = $this->createTempAttachment('tk-second', 'second.jpg');
        $this->actingAsAdmin();

        $this->linkSlot('hero_main', 'tk-first');
        $this->linkSlot('hero_main', 'tk-second');

        $this->assertSame($second->id, $this->metaFor('hero_main')['attachment_id']);
        $this->assertNotSame($first->id, $this->metaFor('hero_main')['attachment_id']);
    }

    // ── 재연결 시 이전 첨부 놓아주기 (첨부 상한) ─────────────────────────────

    /**
     * 앵커 게시글의 **살아있는** 첨부 수.
     *
     * `max_file_count` 판정이 보는 집합과 같은 조건이다 (소프트 삭제 제외 · 게시글 기준).
     */
    private function anchorAttachmentCount(): int
    {
        $boardId = Board::where('slug', 'pinkbro_media')->value('id');

        return Attachment::query()
            ->where('board_id', $boardId)
            ->whereNotNull('post_id')
            ->count();
    }

    public function test_relinking_releases_the_previous_attachment(): void
    {
        $first = $this->createTempAttachment('tk-rel-1', 'one.jpg');
        $second = $this->createTempAttachment('tk-rel-2', 'two.jpg');
        $this->actingAsAdmin();

        $this->linkSlot('hero_main', 'tk-rel-1');
        $this->assertSame(1, $this->anchorAttachmentCount());

        $this->linkSlot('hero_main', 'tk-rel-2');

        // 이전 첨부는 놓인다 — 행은 남지만(소프트 삭제) 살아있는 첨부가 아니다.
        $this->assertTrue(
            Attachment::withTrashed()->findOrFail($first->id)->trashed(),
            '재연결이 이전 첨부를 놓지 않았다'
        );

        // 파일은 지우지 않는다 — 경로가 그대로 남아 보존기간 뒤 정리 대상이 된다.
        $this->assertSame('pinkbro_media/'.date('Y/m/d').'/one.jpg', Attachment::withTrashed()->find($first->id)->path);

        // 새 첨부만 살아있다 — 앵커 게시글의 첨부 수가 늘지 않는다.
        $this->assertSame(1, $this->anchorAttachmentCount());
        $this->assertSame($second->id, $this->metaFor('hero_main')['attachment_id']);
    }

    public function test_relinking_does_not_release_an_attachment_another_slot_still_points_at(): void
    {
        $shared = $this->createTempAttachment('tk-shared', 'shared.jpg');
        $this->createTempAttachment('tk-next', 'next.jpg');
        $this->actingAsAdmin();

        $this->linkSlot('hero_main', 'tk-shared');

        // case_1 이 같은 첨부를 가리키게 만든다 — API 로는 생기지 않지만
        // 메타를 직접 만진 상태를 서비스 계층은 방어해야 한다.
        app(MediaSlotService::class)->link('case_1', $shared->id, '공유');

        $this->linkSlot('hero_main', 'tk-next');

        // 다른 슬롯이 아직 가리키므로 놓지 않는다 — 파일이 사라지면 안 된다.
        $this->assertFalse(Attachment::withTrashed()->findOrFail($shared->id)->trashed());
        $this->assertSame($shared->id, $this->metaFor('case_1')['attachment_id']);
    }

    public function test_swapping_a_slot_more_often_than_the_board_limit_keeps_the_anchor_bounded(): void
    {
        $boardLimit = (int) Board::where('slug', 'pinkbro_media')->value('max_file_count');
        $swaps = $boardLimit + 4;

        $this->actingAsAdmin();

        for ($i = 0; $i < $swaps; $i++) {
            $this->createTempAttachment('tk-swap-'.$i, "swap-{$i}.jpg");
            $this->linkSlot('hero_main', 'tk-swap-'.$i);
        }

        // 교체 횟수가 상한을 넘어도 앵커 게시글의 살아있는 첨부는 1개다.
        $this->assertGreaterThan($boardLimit, $swaps);
        $this->assertSame(1, $this->anchorAttachmentCount());
        $this->assertNotNull($this->metaFor('hero_main')['attachment_id']);
    }

    // ── alt 만 저장 (새 업로드 없는 경로) ────────────────────────────────────

    public function test_alt_only_update_persists_without_a_new_upload(): void
    {
        $attachment = $this->createTempAttachment('tk-alt', 'alt.jpg');
        $this->actingAsAdmin();

        $this->linkSlot('hero_main', 'tk-alt', '처음 문구');

        // temp_key 없이 alt 만 — 이미지 교체 없이 문구만 고치는 경로.
        $res = $this->putJson(self::BASE, [
            'slot' => 'hero_main',
            'alt' => '바뀐 문구',
        ])->assertOk();

        // ① 응답이 그 값을 돌려준다.
        $slots = collect($res->json('data.slots'))->keyBy('key');
        $this->assertSame('바뀐 문구', $slots['hero_main']['alt']);

        // ② 메타가 바뀌고, 첨부 참조는 그대로다.
        $meta = $this->metaFor('hero_main');
        $this->assertSame('바뀐 문구', $meta['alt']);
        $this->assertSame($attachment->id, $meta['attachment_id']);

        // ③ 첨부 예산을 쓰지 않는다 — 첨부는 그대로 살아있고 앵커 수가 늘지 않는다.
        $this->assertFalse(Attachment::withTrashed()->findOrFail($attachment->id)->trashed());
        $this->assertSame(1, $this->anchorAttachmentCount());

        // ④ 공개로 다시 읽어서 확인한다.
        $this->assertSame('바뀐 문구', $this->readPublicSlots()['hero_main']['alt']);
    }

    public function test_alt_only_update_on_an_unlinked_slot_is_rejected(): void
    {
        $this->actingAsAdmin();

        // 붙일 대상이 없으면 성공으로 위장하지 않는다.
        $this->putJson(self::BASE, [
            'slot' => 'hero_sub',
            'alt' => '문구',
        ])->assertStatus(422);

        $this->assertNull($this->metaFor('hero_sub'));
    }

    public function test_alt_only_request_without_alt_is_rejected(): void
    {
        $this->createTempAttachment('tk-noalt', 'noalt.jpg');
        $this->actingAsAdmin();
        $this->linkSlot('hero_main', 'tk-noalt', '보존되어야 한다');

        // temp_key 도 alt 도 없는 요청은 바꿀 것이 없다 — 조용한 200 을 만들지 않는다.
        $this->putJson(self::BASE, ['slot' => 'hero_main'])->assertStatus(422);

        $this->assertSame('보존되어야 한다', $this->metaFor('hero_main')['alt']);
    }

    public function test_alt_only_update_does_not_change_the_attachment_reference(): void
    {
        $this->createTempAttachment('tk-keep-1', 'keep-1.jpg');
        $second = $this->createTempAttachment('tk-keep-2', 'keep-2.jpg');
        $this->actingAsAdmin();

        // 두 번 갈아끼운 뒤 alt 만 고친다 — 이미 놓인 첨부가 되살아나면 안 된다.
        $this->linkSlot('hero_main', 'tk-keep-1');
        $this->linkSlot('hero_main', 'tk-keep-2');

        $this->putJson(self::BASE, ['slot' => 'hero_main', 'alt' => '문구'])->assertOk();

        $this->assertSame($second->id, $this->metaFor('hero_main')['attachment_id']);
        $this->assertSame(1, $this->anchorAttachmentCount());
    }

    public function test_linking_an_unknown_slot_is_rejected(): void
    {
        $this->createTempAttachment('tk-unknown-slot');

        $this->actingAsAdmin()->putJson(self::BASE, [
            'slot' => 'not_a_slot',
            'temp_key' => 'tk-unknown-slot',
        ])->assertStatus(422);
    }

    public function test_linking_with_a_missing_temp_key_is_rejected(): void
    {
        $this->actingAsAdmin()->putJson(self::BASE, [
            'slot' => 'hero_main',
        ])->assertStatus(422);
    }

    public function test_linking_with_an_unknown_temp_key_is_a_validation_error_not_a_server_error(): void
    {
        $this->actingAsAdmin()->putJson(self::BASE, [
            'slot' => 'hero_main',
            'temp_key' => 'never-uploaded',
        ])->assertStatus(422);
    }

    public function test_a_consumed_temp_key_cannot_be_linked_again(): void
    {
        $this->createTempAttachment('tk-once');
        $this->actingAsAdmin();

        $this->linkSlot('hero_main', 'tk-once');

        // 같은 temp_key 재사용 — 첨부는 이미 앵커에 붙어 temp_key 가 비었다.
        $this->putJson(self::BASE, [
            'slot' => 'case_1',
            'temp_key' => 'tk-once',
        ])->assertStatus(422);

        // 실패한 요청은 두 번째 슬롯을 건드리지 않는다.
        $this->assertNull($this->metaFor('case_1'));
    }

    // ── DELETE ─────────────────────────────────────────────────────────────

    public function test_delete_releases_only_the_target_slot(): void
    {
        $this->createTempAttachment('tk-a', 'a.jpg');
        $this->createTempAttachment('tk-b', 'b.jpg');
        $this->actingAsAdmin();

        $this->linkSlot('hero_main', 'tk-a', 'A');
        $this->linkSlot('case_1', 'tk-b', 'B');

        $this->deleteJson(self::BASE.'/hero_main')->assertNoContent();

        // 대상 슬롯만 비었다.
        $this->assertNull($this->metaFor('hero_main'));

        // 나머지 슬롯은 그대로다 — `deleteFor` 였다면 여기서 함께 날아간다.
        $this->assertNotNull($this->metaFor('case_1'));

        $public = $this->readPublicSlots();
        $this->assertNull($public['hero_main']['url']);
        $this->assertNull($public['hero_main']['alt']);
        $this->assertNotNull($public['case_1']['url']);
        $this->assertSame('B', $public['case_1']['alt']);
    }

    public function test_delete_does_not_touch_other_metas_of_the_same_row_scope(): void
    {
        $this->createTempAttachment('tk-scope');
        $this->actingAsAdmin();
        $this->linkSlot('hero_main', 'tk-scope');

        // 같은 전역 스코프(board_id=null, post_id=null)의 다른 도메인도 함께 산다.
        app(ContentMetaService::class)->set(null, null, MetaDomain::MEDIA, 'site_og', [
            'attachment_id' => 999, 'hash' => 'x', 'alt' => null,
        ]);

        $this->deleteJson(self::BASE.'/hero_main')->assertNoContent();

        $this->assertNull($this->metaFor('hero_main'));
        $this->assertNotNull($this->metaFor('site_og'));
    }

    public function test_delete_of_a_known_slot_that_is_not_linked_is_still_no_content(): void
    {
        $this->actingAsAdmin()
            ->deleteJson(self::BASE.'/services_air')
            ->assertNoContent();
    }

    public function test_delete_of_an_unknown_slot_is_a_validation_error_not_a_server_error(): void
    {
        $this->actingAsAdmin()
            ->deleteJson(self::BASE.'/not_a_slot')
            ->assertStatus(422);
    }

    // ── 401 / 403 ──────────────────────────────────────────────────────────

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $this->getJson(self::BASE)->assertUnauthorized();
        $this->putJson(self::BASE, ['slot' => 'hero_main', 'temp_key' => 'x'])->assertUnauthorized();
        $this->deleteJson(self::BASE.'/hero_main')->assertUnauthorized();
    }

    public function test_a_user_without_the_permission_is_forbidden(): void
    {
        // user 역할은 이 모듈의 권한을 하나도 갖지 않는다 — 403 이어야 한다.
        Sanctum::actingAs($this->createUser(), ['*'], 'sanctum');

        $this->getJson(self::BASE)->assertForbidden();
        $this->putJson(self::BASE, ['slot' => 'hero_main', 'temp_key' => 'x'])->assertForbidden();
        $this->deleteJson(self::BASE.'/hero_main')->assertForbidden();
    }

    public function test_admin_routes_are_not_swallowed_by_the_content_domain_group(): void
    {
        // `admin/{domain}` 그룹은 service|package|case|faq 로 제약돼 있다.
        // 제약이 풀리면 admin/media 가 그 그룹에 먼저 걸려 403 이 된다 (404 가 아니라).
        $this->getJson('/api/modules/pinkbro-contents/admin/media')->assertUnauthorized();
        $this->getJson('/api/modules/pinkbro-contents/admin/media/hero_main')->assertNotFound();
    }
}
