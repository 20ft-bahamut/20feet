<?php

namespace Modules\Pinkbro\Contents\Tests\Feature;

use Modules\Pinkbro\Contents\Database\Seeders\PinkbroContentsSeeder;
use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Services\ContentMetaService;
use Modules\Pinkbro\Contents\Tests\PinkbroContentsTestCase;

/**
 * 공개 문의 접수 API 계약 — POST inquiry.
 *
 * 모든 모듈 테스트는 PinkbroContentsTestCase 를 상속한다 (RefreshDatabase 포함,
 * 모듈 라우트를 `api/modules/pinkbro-contents` prefix 로 등록).
 * 테스트 DB 미가용 환경에서는 setUp 단계에서 skip 된다.
 *
 * 무인증 공개 쓰기다 — 권한 미들웨어를 두지 않고, 스로틀만 건다.
 * 저장은 문의 게시판의 비밀글이며, 알림은 게시판 `notify_admin_on_post`
 * 플래그가 발화시킨다 (이 모듈에는 알림 코드가 없다).
 */
class PublicInquiryApiTest extends PinkbroContentsTestCase
{
    private const ENDPOINT = '/api/modules/pinkbro-contents/inquiry';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PinkbroContentsSeeder::class);
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

    public function test_a_valid_inquiry_is_stored_as_a_secret_post(): void
    {
        $res = $this->postJson(self::ENDPOINT, $this->payload());

        $res->assertCreated()->assertJsonStructure(['data' => ['inquiry_id']]);

        $boardId = \DB::table('boards')->where('slug', 'pinkbro_inquiry')->value('id');
        $post = \DB::table('board_posts')->where('board_id', $boardId)->first();

        $this->assertNotNull($post);
        $this->assertSame(1, (int) $post->is_secret);
    }

    public function test_inquiry_meta_captures_every_field(): void
    {
        $this->postJson(self::ENDPOINT, $this->payload())->assertCreated();

        $boardId = \DB::table('boards')->where('slug', 'pinkbro_inquiry')->value('id');
        $postId = \DB::table('board_posts')->where('board_id', $boardId)->value('id');
        $meta = app(ContentMetaService::class);

        $this->assertSame('카페', $meta->get($boardId, $postId, MetaDomain::INQUIRY, 'business_type'));
        $this->assertSame(['바닥 기계세척', '유리창 세척'], $meta->get($boardId, $postId, MetaDomain::INQUIRY, 'services'));
        $this->assertSame('010-1234-5678', $meta->get($boardId, $postId, MetaDomain::INQUIRY, 'contact'));
        $this->assertSame('new', $meta->get($boardId, $postId, MetaDomain::INQUIRY, 'status'));
    }

    public function test_inquiry_id_is_hashed_not_the_raw_post_id(): void
    {
        $res = $this->postJson(self::ENDPOINT, $this->payload());
        $boardId = \DB::table('boards')->where('slug', 'pinkbro_inquiry')->value('id');
        $postId = \DB::table('board_posts')->where('board_id', $boardId)->value('id');

        $this->assertNotSame((string) $postId, (string) $res->json('data.inquiry_id'));
    }

    public function test_missing_required_fields_return_422_with_snake_case_errors(): void
    {
        $res = $this->postJson(self::ENDPOINT, $this->payload([
            'business_type' => '',
            'contact' => '',
            'privacy_consent' => false,
        ]));

        $res->assertStatus(422)->assertJsonStructure(['message', 'errors']);
        $this->assertArrayHasKey('business_type', $res->json('errors'));
        $this->assertArrayHasKey('contact', $res->json('errors'));
        $this->assertArrayHasKey('privacy_consent', $res->json('errors'));
    }

    public function test_honeypot_blocks_bots(): void
    {
        $this->postJson(self::ENDPOINT, $this->payload(['website' => 'http://spam.example']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('website');
    }

    public function test_inquiry_is_created_without_authentication(): void
    {
        $this->postJson(self::ENDPOINT, $this->payload())->assertCreated();
    }
}
