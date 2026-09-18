<?php

namespace Modules\Pinkbro\Contents\Tests\Unit;

use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Services\ContentMetaService;
use Modules\Pinkbro\Contents\Tests\PinkbroContentsTestCase;

class ContentMetaServiceTest extends PinkbroContentsTestCase
{

    private function service(): ContentMetaService
    {
        return app(ContentMetaService::class);
    }

    public function test_set_then_get_returns_stored_value(): void
    {
        $s = $this->service();
        $s->set(null, null, MetaDomain::SITE, 'phone', '010-4348-8158');

        $this->assertSame('010-4348-8158', $s->get(null, null, MetaDomain::SITE, 'phone'));
    }

    public function test_set_is_idempotent_on_same_key(): void
    {
        $s = $this->service();
        $s->set(null, null, MetaDomain::SITE, 'phone', '010-0000-0000');
        $s->set(null, null, MetaDomain::SITE, 'phone', '010-4348-8158');

        $this->assertSame('010-4348-8158', $s->get(null, null, MetaDomain::SITE, 'phone'));
        $this->assertSame(1, \DB::table('pinkbro_meta')->where('domain', 'site')->count());
    }

    public function test_array_value_round_trips(): void
    {
        $s = $this->service();
        $steps = [['condition' => '2개 항목', 'amount_label' => '3%']];
        $s->set(null, null, MetaDomain::DISCOUNT, 'steps', $steps);

        $this->assertSame($steps, $s->get(null, null, MetaDomain::DISCOUNT, 'steps'));
    }

    public function test_get_returns_default_when_missing(): void
    {
        $this->assertSame('fallback', $this->service()->get(null, null, MetaDomain::SITE, 'nope', 'fallback'));
    }

    public function test_all_for_scopes_by_board_and_post(): void
    {
        $s = $this->service();
        $s->set(7, 11, MetaDomain::SERVICE, 'title', '바닥 기계세척');
        $s->set(7, 12, MetaDomain::SERVICE, 'title', '유리창 세척');

        $this->assertSame(['title' => '바닥 기계세척'], $s->allFor(7, 11, MetaDomain::SERVICE));
        $this->assertSame(['title' => '유리창 세척'], $s->allFor(7, 12, MetaDomain::SERVICE));
    }

    public function test_delete_for_removes_only_scoped_rows(): void
    {
        $s = $this->service();
        $s->set(7, 11, MetaDomain::SERVICE, 'title', 'A');
        $s->set(7, 12, MetaDomain::SERVICE, 'title', 'B');

        $this->assertSame(1, $s->deleteFor(7, 11, MetaDomain::SERVICE));
        $this->assertNull($s->get(7, 11, MetaDomain::SERVICE, 'title'));
        $this->assertSame('B', $s->get(7, 12, MetaDomain::SERVICE, 'title'));
    }

    public function test_delete_key_removes_single_key_only(): void
    {
        $s = $this->service();
        $s->set(null, null, MetaDomain::MEDIA, 'hero', ['attachment_id' => 1]);
        $s->set(null, null, MetaDomain::MEDIA, 'about', ['attachment_id' => 2]);

        $this->assertSame(1, $s->deleteKey(null, null, MetaDomain::MEDIA, 'hero'));
        $this->assertNull($s->get(null, null, MetaDomain::MEDIA, 'hero'));
        $this->assertSame(['attachment_id' => 2], $s->get(null, null, MetaDomain::MEDIA, 'about'));
    }
}
