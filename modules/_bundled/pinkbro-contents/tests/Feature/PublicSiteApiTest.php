<?php

namespace Modules\Pinkbro\Contents\Tests\Feature;

use Modules\Pinkbro\Contents\Database\Seeders\PinkbroContentsSeeder;
use Modules\Pinkbro\Contents\Tests\PinkbroContentsTestCase;

/**
 * 공개 API 계약 — site / copy / discount / media-slots.
 *
 * 모든 모듈 테스트는 PinkbroContentsTestCase 를 상속한다 (RefreshDatabase 포함,
 * 모듈 라우트를 `api/modules/pinkbro-contents` prefix 로 등록).
 * 테스트 DB 미가용 환경에서는 setUp 단계에서 skip 된다.
 *
 * 네 엔드포인트 모두 무인증 공개 읽기다 — 권한 미들웨어를 두지 않는다.
 */
class PublicSiteApiTest extends PinkbroContentsTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PinkbroContentsSeeder::class);
    }

    public function test_site_endpoint_returns_seeded_contact(): void
    {
        $res = $this->getJson('/api/modules/pinkbro-contents/site');

        $res->assertOk()
            ->assertJsonPath('data.phone', '010-4348-8158')
            ->assertJsonPath('data.kakao_channel', 'http://pf.kakao.com/_gmcuG');
    }

    public function test_copy_endpoint_returns_hero_keys(): void
    {
        $res = $this->getJson('/api/modules/pinkbro-contents/copy');

        $res->assertOk()->assertJsonStructure(['data' => ['hero_headline', 'hero_lead', 'hero_pills']]);
    }

    public function test_discount_endpoint_returns_three_steps(): void
    {
        $res = $this->getJson('/api/modules/pinkbro-contents/discount');

        $res->assertOk();
        $this->assertCount(3, $res->json('data.steps'));
    }

    public function test_media_slots_endpoint_lists_every_slot_with_null_url_when_empty(): void
    {
        $res = $this->getJson('/api/modules/pinkbro-contents/media-slots');

        $res->assertOk()
            ->assertJsonPath('data.hero_main.url', null)
            ->assertJsonPath('data.hero_main.alt', null);
        $this->assertCount(16, $res->json('data'));
    }

    public function test_endpoints_are_reachable_without_authentication(): void
    {
        foreach (['site', 'copy', 'discount', 'media-slots'] as $path) {
            $this->getJson("/api/modules/pinkbro-contents/{$path}")->assertOk();
        }
    }
}
