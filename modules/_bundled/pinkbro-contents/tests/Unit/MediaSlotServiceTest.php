<?php

namespace Modules\Pinkbro\Contents\Tests\Unit;

use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Services\ContentMetaService;
use Modules\Pinkbro\Contents\Services\MediaSlotService;
use Modules\Pinkbro\Contents\Tests\PinkbroContentsTestCase;

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
        // 존재하지 않는 첨부 id 를 직접 메타에 심는다 — 삭제된 첨부 방어 검증
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

        $this->assertSame([
            'attachment_id' => $attachment->id,
            'hash' => $attachment->hash,
            'alt' => '히어로 대체 텍스트',
        ], app(ContentMetaService::class)->get(null, null, MetaDomain::MEDIA, 'hero_main'));
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
        $this->assertNotNull($service->resolve('hero_sub')['url']);
    }

    public function test_unlink_rejects_unknown_slot(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        app(MediaSlotService::class)->unlink('nope_slot');
    }

    public function test_resolve_all_reflects_linked_slots(): void
    {
        $attachment = $this->createAttachment();
        app(MediaSlotService::class)->link('case_1', $attachment->id);

        $all = app(MediaSlotService::class)->resolveAll();

        $this->assertCount(16, $all);
        $this->assertNotNull($all['case_1']['url']);
        $this->assertSame(['url' => null, 'alt' => null], $all['case_2']);
    }

    /**
     * 슬롯 해석 검증용 최소 첨부 행. 저장소·디스크는 건드리지 않는다.
     */
    private function createAttachment(): \Modules\Sirsoft\Board\Models\Attachment
    {
        return \Modules\Sirsoft\Board\Models\Attachment::create([
            'board_id' => 0,
            'post_id' => null,
            'hash' => \Illuminate\Support\Str::random(32),
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
