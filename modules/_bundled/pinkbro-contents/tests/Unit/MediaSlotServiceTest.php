<?php

namespace Modules\Pinkbro\Contents\Tests\Unit;

use Illuminate\Support\Str;
use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Services\ContentMetaService;
use Modules\Pinkbro\Contents\Services\MediaSlotService;
use Modules\Pinkbro\Contents\Tests\PinkbroContentsTestCase;
use Modules\Sirsoft\Board\Models\Attachment;

class MediaSlotServiceTest extends PinkbroContentsTestCase
{
    public function test_slot_registry_is_the_single_source_and_matches_spec(): void
    {
        $this->assertSame([
            'hero_main', 'hero_sub', 'why_stage', 'package_stage', 'estimate_bg',
            'case_1', 'case_2', 'case_3', 'case_4',
            'site_og',
            'services_floor', 'services_glass', 'services_awning',
            'services_sign', 'services_kitchen', 'services_air',
        ], MediaSlotService::slotKeys());
    }

    public function test_resolve_returns_null_url_when_slot_is_empty(): void
    {
        $this->assertSame(
            ['url' => null, 'alt' => null],
            app(MediaSlotService::class)->resolve('hero_main')
        );
    }

    public function test_resolve_all_returns_every_slot_with_null_url_when_empty(): void
    {
        $all = app(MediaSlotService::class)->resolveAll();

        $this->assertCount(16, $all);
        $this->assertSame(['url' => null, 'alt' => null], $all['hero_main']);
    }

    public function test_resolve_returns_null_url_when_attachment_row_is_gone(): void
    {
        $service = app(MediaSlotService::class);
        // 존재하지 않는 첨부 id 를 직접 메타에 심는다 — 삭제된 첨부 방어 검증.
        // 이 hash 는 board_attachments 에 저장되지 않으므로 컬럼 폭과 무관하다.
        app(ContentMetaService::class)
            ->set(null, null, MetaDomain::MEDIA, 'hero_main', [
                'attachment_id' => 999999,
                'hash' => 'deadbeef',
                'alt' => null,
            ]);

        $this->assertSame(['url' => null, 'alt' => null], $service->resolve('hero_main'));
    }

    public function test_unknown_slot_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        app(MediaSlotService::class)->resolve('nope_slot');
    }

    public function test_labels_cover_every_slot_key(): void
    {
        $labels = MediaSlotService::labels();

        $this->assertSame(MediaSlotService::slotKeys(), array_keys($labels));

        foreach ($labels as $slot => $label) {
            $this->assertArrayHasKey('ko', $label, "slot {$slot} has no ko label");
            $this->assertArrayHasKey('en', $label, "slot {$slot} has no en label");
        }
    }

    public function test_link_stores_attachment_id_hash_and_alt(): void
    {
        $attachment = $this->createAttachment();

        app(MediaSlotService::class)->link('hero_main', $attachment->id, '히어로 대체 텍스트');

        $stored = app(ContentMetaService::class)->get(null, null, MetaDomain::MEDIA, 'hero_main');

        // payload 모양 고정 — 키가 늘거나 줄면 실패한다(순서는 계약이 아니다).
        $this->assertEqualsCanonicalizing(['attachment_id', 'hash', 'alt'], array_keys($stored));
        $this->assertSame($attachment->id, $stored['attachment_id']);
        // 해시는 픽스처가 계산한 값이 아니라 DB 에 실제로 저장된 행의 값과 비교한다
        // — board_attachments.hash 는 12자 컬럼이라 폭이 바뀌어도 어긋나지 않는다.
        $this->assertSame($attachment->fresh()->hash, $stored['hash']);
        $this->assertSame('히어로 대체 텍스트', $stored['alt']);
    }

    public function test_link_rejects_missing_attachment(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        app(MediaSlotService::class)->link('hero_main', 999999);
    }

    public function test_link_rejects_unknown_slot(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        app(MediaSlotService::class)->link('nope_slot', 1);
    }

    public function test_resolve_returns_url_and_alt_after_link(): void
    {
        $attachment = $this->createAttachment();

        $service = app(MediaSlotService::class);
        $service->link('hero_main', $attachment->id, '대체 텍스트');

        $resolved = $service->resolve('hero_main');

        $this->assertNotNull($resolved['url']);
        // URL 이 그 첨부의 해시로 조립된다 — 아무 URL 이나 돌아오면 실패한다.
        $this->assertStringContainsString($attachment->hash, $resolved['url']);
        $this->assertSame('대체 텍스트', $resolved['alt']);
    }

    public function test_unlink_removes_only_the_named_slot(): void
    {
        $first = $this->createAttachment();
        $second = $this->createAttachment();

        $service = app(MediaSlotService::class);
        $service->link('hero_main', $first->id);
        $service->link('hero_sub', $second->id);

        $service->unlink('hero_main');

        $this->assertSame(['url' => null, 'alt' => null], $service->resolve('hero_main'));
        // 살아남은 슬롯이 "그 첨부" 를 그대로 가리키는지까지 본다.
        $surviving = $service->resolve('hero_sub');
        $this->assertNotNull($surviving['url']);
        $this->assertStringContainsString($second->hash, $surviving['url']);
    }

    public function test_unlink_rejects_unknown_slot(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        app(MediaSlotService::class)->unlink('nope_slot');
    }

    // ── linkedAttachmentId / relabel / attachmentInUse ─────────────────────

    public function test_linked_attachment_id_is_null_for_an_unset_slot(): void
    {
        $this->assertNull(app(MediaSlotService::class)->linkedAttachmentId('hero_main'));
    }

    public function test_linked_attachment_id_matches_the_linked_attachment(): void
    {
        $attachment = $this->createAttachment();
        $service = app(MediaSlotService::class);
        $service->link('hero_main', $attachment->id);

        $this->assertSame($attachment->id, $service->linkedAttachmentId('hero_main'));
    }

    public function test_relabel_changes_only_the_alt(): void
    {
        $attachment = $this->createAttachment();
        $service = app(MediaSlotService::class);
        $service->link('hero_main', $attachment->id, '처음');

        $this->assertTrue($service->relabel('hero_main', '바뀜'));

        $resolved = $service->resolve('hero_main');
        $this->assertSame('바뀜', $resolved['alt']);
        // 첨부 참조는 그대로다 — relabel 은 새 첨부를 만들지 않는다.
        $this->assertSame($attachment->id, $service->linkedAttachmentId('hero_main'));
        $this->assertStringContainsString($attachment->hash, $resolved['url']);
    }

    public function test_relabel_is_false_when_the_slot_is_not_linked(): void
    {
        $this->assertFalse(app(MediaSlotService::class)->relabel('hero_main', '문구'));
    }

    public function test_relabel_is_false_when_the_linked_attachment_row_is_gone(): void
    {
        // 첨부 행이 사라진 슬롯은 resolve() 가 url null 로 본다 — 그 상태를
        // "연결됨" 으로 취급해 alt 만 남은 유령 슬롯을 만들지 않는다.
        app(ContentMetaService::class)->set(null, null, MetaDomain::MEDIA, 'hero_main', [
            'attachment_id' => 999999,
            'hash' => 'deadbeef',
            'alt' => null,
        ]);

        $this->assertFalse(app(MediaSlotService::class)->relabel('hero_main', '문구'));
    }

    public function test_attachment_in_use_sees_other_slots_but_not_the_excepted_one(): void
    {
        $attachment = $this->createAttachment();
        $service = app(MediaSlotService::class);
        $service->link('hero_main', $attachment->id);

        // 다른 첨부는 어느 슬롯도 가리키지 않는다.
        $this->assertFalse($service->attachmentInUse($attachment->id + 12345));

        // 가리키는 슬롯이 있으면 true — 제외 대상이 아니면 자기 자신도 포함한다.
        $this->assertTrue($service->attachmentInUse($attachment->id));
        // 제외 대상으로 넘긴 슬롯은 세지 않는다 (재연결 직전 판정에 쓴다).
        $this->assertFalse($service->attachmentInUse($attachment->id, 'hero_main'));
    }

    public function test_resolve_all_reflects_linked_slots(): void
    {
        $attachment = $this->createAttachment();
        app(MediaSlotService::class)->link('case_1', $attachment->id);

        $all = app(MediaSlotService::class)->resolveAll();

        $this->assertCount(16, $all);
        $this->assertNotNull($all['case_1']['url']);
        $this->assertStringContainsString($attachment->hash, $all['case_1']['url']);
        $this->assertSame(['url' => null, 'alt' => null], $all['case_2']);
    }

    /**
     * 슬롯 해석 검증용 최소 첨부 행. 저장소·디스크는 건드리지 않는다.
     *
     * hash 는 board_attachments 의 `string('hash', 12)` 컬럼에 맞춘 12자다.
     * 모델의 정식 생성기(Attachment::generateUniqueHash)와 같은 폭을 쓴다 —
     * 길이를 늘리면 strict 모드에서 SQLSTATE[22001] 로 죽는다.
     */
    private function createAttachment(): Attachment
    {
        return Attachment::create([
            'board_id' => 0,
            'post_id' => null,
            'hash' => Str::random(12),
            'original_filename' => 'photo.jpg',
            'stored_filename' => 'photo.jpg',
            'disk' => 'public',
            'path' => 'attachments/photo.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
            'collection' => 'default',
            'order' => 0,
        ]);
    }
}
