<?php

namespace Modules\Pinkbro\Contents\Tests\Feature;

use Modules\Pinkbro\Contents\Database\Seeders\PinkbroContentsSeeder;
use Modules\Pinkbro\Contents\Tests\PinkbroContentsTestCase;

/**
 * 공개 API 계약 — services / packages / cases / faq.
 *
 * 모든 모듈 테스트는 PinkbroContentsTestCase 를 상속한다 (RefreshDatabase 포함,
 * 모듈 라우트를 `api/modules/pinkbro-contents` prefix 로 등록).
 * 테스트 DB 미가용 환경에서는 setUp 단계에서 skip 된다.
 *
 * 네 엔드포인트 모두 무인증 공개 읽기다 — 권한 미들웨어를 두지 않는다.
 */
class PublicContentApiTest extends PinkbroContentsTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PinkbroContentsSeeder::class);
    }

    public function test_services_returns_six_sorted_items(): void
    {
        $res = $this->getJson('/api/modules/pinkbro-contents/services');

        $res->assertOk();
        $this->assertCount(6, $res->json('data'));
        $this->assertSame('바닥 기계세척', $res->json('data.0.title'));
        $this->assertSame('250,000원~', $res->json('data.0.base_price'));
    }

    public function test_service_photo_is_null_until_a_slot_is_uploaded(): void
    {
        $res = $this->getJson('/api/modules/pinkbro-contents/services');

        $res->assertJsonPath('data.0.photo.url', null);
    }

    public function test_air_care_service_exposes_four_air_types_with_integer_prices(): void
    {
        $res = $this->getJson('/api/modules/pinkbro-contents/services');
        $air = collect($res->json('data'))->firstWhere('slug', 'air-care');

        $this->assertNotNull($air);
        $this->assertCount(4, $air['air_types']);
        $this->assertSame(80000, $air['air_types'][0]['price_value']);
        $this->assertSame(150000, $air['air_types'][3]['price_value']);
        $this->assertTrue($air['air_types'][3]['default_selected']);
    }

    public function test_packages_returns_three_items_with_component_lists(): void
    {
        $res = $this->getJson('/api/modules/pinkbro-contents/packages');

        $res->assertOk();
        $this->assertCount(3, $res->json('data'));
        $this->assertIsArray($res->json('data.0.includes'));
        $this->assertNotEmpty($res->json('data.0.includes'));
    }

    public function test_cases_returns_four_items_with_empty_blog_url(): void
    {
        $res = $this->getJson('/api/modules/pinkbro-contents/cases');

        $res->assertOk();
        $this->assertCount(4, $res->json('data'));
        $this->assertSame('', $res->json('data.0.blog_url'));
    }

    public function test_faq_returns_eight_items(): void
    {
        $res = $this->getJson('/api/modules/pinkbro-contents/faq');

        $res->assertOk();
        $this->assertCount(8, $res->json('data'));
        $this->assertNotEmpty($res->json('data.0.question'));
        $this->assertNotEmpty($res->json('data.0.answer'));
    }
}
