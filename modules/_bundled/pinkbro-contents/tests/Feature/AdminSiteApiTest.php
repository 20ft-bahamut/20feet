<?php

namespace Modules\Pinkbro\Contents\Tests\Feature;

use Laravel\Sanctum\Sanctum;
use Modules\Pinkbro\Contents\Database\Seeders\PinkbroContentsSeeder;
use Modules\Pinkbro\Contents\Http\Requests\Admin\CopyUpdateRequest;
use Modules\Pinkbro\Contents\Http\Requests\Admin\DiscountUpdateRequest;
use Modules\Pinkbro\Contents\Http\Requests\Admin\SiteUpdateRequest;
use Modules\Pinkbro\Contents\Tests\PinkbroContentsTestCase;

/**
 * 관리자 사이트 설정 API — site / copy / discount.
 *
 * 모든 모듈 테스트는 PinkbroContentsTestCase 를 상속한다 (RefreshDatabase 포함,
 * 모듈 라우트를 `api/modules/pinkbro-contents` prefix 로 등록, 모듈 권한 트리 생성).
 * 테스트 DB 미가용 환경에서는 setUp 단계에서 skip 된다.
 *
 * 세 도메인은 게시판·게시글에 매이지 않은 전역 메타(board_id=null, post_id=null)다
 * (SPEC §4.5) — 공개 읽기(`SiteController`)가 읽는 바로 그 행을 관리자 API 가 쓴다.
 * 그래서 이 파일의 모든 쓰기 검증은 **공개 엔드포인트로 다시 읽어서** 확인한다:
 * 공개 API 로 읽히지 않는 쓰기는 증명된 것이 아니다.
 *
 * PUT 은 부분 갱신이다 — 보낸 키만 쓰고 나머지는 남긴다. 예외는 `discount.steps`
 * 하나뿐이고 그 값은 배열 전체 교체다.
 */
class AdminSiteApiTest extends PinkbroContentsTestCase
{
    private const BASE = '/api/modules/pinkbro-contents/admin';

    private const PUBLIC_BASE = '/api/modules/pinkbro-contents';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PinkbroContentsSeeder::class);
    }

    /**
     * 시더가 쓰는 카피 키→값 원문 — 키 목록의 출처다.
     *
     * 손으로 적은 목록과 비교하지 않는다: 시더 상수가 계약이다.
     *
     * @return array<string, mixed>
     */
    private function seederCopy(): array
    {
        return (new \ReflectionClass(PinkbroContentsSeeder::class))->getConstant('COPY');
    }

    /**
     * 공개 엔드포인트로 사이트 설정을 다시 읽는다.
     *
     * @return array<string, mixed>
     */
    private function readSite(): array
    {
        return $this->getJson(self::PUBLIC_BASE.'/site')->assertOk()->json('data');
    }

    /**
     * 공개 엔드포인트로 섹션 문구를 다시 읽는다.
     *
     * @return array<string, mixed>
     */
    private function readCopy(): array
    {
        return $this->getJson(self::PUBLIC_BASE.'/copy')->assertOk()->json('data');
    }

    /**
     * 공개 엔드포인트로 할인 단계를 다시 읽는다.
     *
     * @return array<int, array<string, string>>
     */
    private function readDiscount(): array
    {
        return $this->getJson(self::PUBLIC_BASE.'/discount')->assertOk()->json('data.steps');
    }

    // ── site ────────────────────────────────────────────────────────────────

    public function test_site_update_persists_contact_changes(): void
    {
        $res = $this->actingAsAdmin()->putJson(self::BASE.'/site', [
            'phone' => '010-9999-8888',
            'kakao_channel' => 'http://pf.kakao.com/_test',
            'brand_name' => '핑크브로클린케어',
            'region' => '부산·울산·경남',
        ]);

        $res->assertOk();

        // 응답은 공개 읽기와 같은 단일 래핑이고 갱신 후 값을 담는다.
        $res->assertJsonPath('data.phone', '010-9999-8888')
            ->assertJsonPath('data.kakao_channel', 'http://pf.kakao.com/_test');

        $this->getJson(self::PUBLIC_BASE.'/site')
            ->assertJsonPath('data.phone', '010-9999-8888');
    }

    /**
     * 관리자 읽기는 공개 읽기와 같은 키·값을 돌려준다 (같은 리소스를 쓴다).
     */
    public function test_admin_read_endpoints_return_the_domain_meta(): void
    {
        $this->actingAsAdmin()
            ->getJson(self::BASE.'/site')
            ->assertOk()
            ->assertJsonPath('data.brand_name', '핑크브로클린케어')
            ->assertJsonPath('data.phone', '010-4348-8158');

        $copy = $this->actingAsAdmin()->getJson(self::BASE.'/copy')->assertOk();
        $this->assertCount(count($this->seederCopy()), $copy->json('data'));

        $this->actingAsAdmin()
            ->getJson(self::BASE.'/discount')
            ->assertOk()
            ->assertJsonStructure(['data' => ['steps']]);
        $this->assertCount(3, $this->actingAsAdmin()->getJson(self::BASE.'/discount')->json('data.steps'));
    }

    /**
     * 부분 갱신 — 보낸 키만 쓰고 나머지 키는 그대로 남는다.
     *
     * 시더가 넣은 8키 중 phone 하나만 PUT 한 뒤, 다른 키(kakao_channel·brand_name)가
     * 살아있는지 본다. 전체 교체 구현이면 여기서 null 이 되어 실패한다.
     */
    public function test_partial_update_does_not_wipe_untouched_keys(): void
    {
        $before = $this->readSite();

        $this->actingAsAdmin()->putJson(self::BASE.'/site', ['phone' => '010-1111-2222'])->assertOk();

        $after = $this->readSite();

        $this->assertSame('010-1111-2222', $after['phone']);

        // 건드리지 않은 키는 값도 자리도 그대로다.
        $this->assertSame($before['kakao_channel'], $after['kakao_channel']);
        $this->assertSame($before['brand_name'], $after['brand_name']);
        $this->assertSame($before['og_image_slot'], $after['og_image_slot']);
        $this->assertSame(array_keys($before), array_keys($after));
    }

    public function test_site_update_with_an_empty_body_changes_nothing(): void
    {
        $before = $this->readSite();

        $this->actingAsAdmin()->putJson(self::BASE.'/site', [])->assertOk();

        $this->assertSame($before, $this->readSite());
    }

    // ── copy ────────────────────────────────────────────────────────────────

    public function test_copy_update_persists_section_headline(): void
    {
        $this->actingAsAdmin()->putJson(self::BASE.'/copy', [
            'hero_headline' => 'F&B 매장 전문\n위생 클린케어',
        ])->assertOk();

        $this->getJson(self::PUBLIC_BASE.'/copy')
            ->assertJsonPath('data.hero_headline', "F&B 매장 전문\n위생 클린케어");
    }

    /**
     * 문구 하나만 PUT 해도 나머지 문구가 사라지지 않는다 — copy 도메인의 부분 갱신 증명.
     */
    public function test_copy_partial_update_leaves_the_other_sections_intact(): void
    {
        $before = $this->readCopy();
        $this->assertCount(count($this->seederCopy()), $before);

        $this->actingAsAdmin()->putJson(self::BASE.'/copy', ['hero_lead' => '수정된 리드 문구'])->assertOk();

        $after = $this->readCopy();

        $this->assertSame('수정된 리드 문구', $after['hero_lead']);
        $this->assertSame($before['about_message'], $after['about_message']);
        $this->assertSame($before['footer_text'], $after['footer_text']);
        $this->assertCount(count($before), $after);
    }

    /**
     * 시더가 쓰는 카피 키 82개를 전부 받는다 — 목록이 짧으면 문구가 조용히 사라진다.
     *
     * 시더 원문을 그대로 PUT 하고, 공개 API 로 되읽어 값까지 같은지 본다.
     */
    public function test_copy_update_accepts_every_key_the_seeder_writes(): void
    {
        $seeded = $this->seederCopy();

        $this->actingAsAdmin()->putJson(self::BASE.'/copy', $seeded)->assertOk();

        $after = $this->readCopy();

        // 키 순서는 저장 순서에 기대지 않는다 — 값 집합으로 비교한다.
        ksort($seeded);
        ksort($after);

        $this->assertCount(count($seeded), $after);
        $this->assertSame($seeded, $after);
    }

    // ── discount ────────────────────────────────────────────────────────────

    public function test_discount_update_replaces_all_three_steps(): void
    {
        $steps = [
            ['condition' => '2개 항목', 'amount_label' => '3%'],
            ['condition' => '3~4개 항목', 'amount_label' => '5%'],
            ['condition' => '5개 이상', 'amount_label' => '10%'],
        ];

        $res = $this->actingAsAdmin()->putJson(self::BASE.'/discount', ['steps' => $steps]);

        $res->assertOk()->assertJsonPath('data.steps', $steps);

        $this->getJson(self::PUBLIC_BASE.'/discount')->assertJsonPath('data.steps', $steps);
    }

    /**
     * `steps` 는 키별 갱신이 아니라 **배열 전체 교체**다 (SPEC §4.5의 유일한 예외).
     *
     * 단계 수를 3→2로 줄여 보낸다. 교체가 아니면(원소별 병합) 시더의 3단계가 남는다.
     */
    public function test_discount_update_replaces_the_whole_steps_array(): void
    {
        $steps = [
            ['condition' => '2개 항목', 'amount_label' => '3%'],
            ['condition' => '4개 이상', 'amount_label' => '7%'],
        ];

        $this->actingAsAdmin()->putJson(self::BASE.'/discount', ['steps' => $steps])->assertOk();

        $after = $this->readDiscount();

        $this->assertSame($steps, $after);
        $this->assertCount(2, $after);

        // 시더에만 있던 단계는 사라졌다 — 다른 할인 도메인 키도 생기지 않았다.
        $this->assertNotContains('5개 이상', array_column($after, 'condition'));
        $this->assertSame(['steps'], array_keys($this->getJson(self::PUBLIC_BASE.'/discount')->json('data')));
    }

    // ── 허용 키 경계 ────────────────────────────────────────────────────────

    /**
     * 목록 밖의 키는 422 가 아니라 조용히 무시된다 — 그리고 다른 도메인을 건드리지 않는다.
     */
    public function test_keys_outside_the_domain_are_ignored_not_rejected(): void
    {
        $before = $this->readSite();

        $this->actingAsAdmin()->putJson(self::BASE.'/site', [
            'phone' => '010-7777-6666',
            'steps' => [['condition' => '무시', 'amount_label' => '0%']],
            'hero_headline' => '무시될 키',
        ])->assertOk();

        $after = $this->readSite();

        $this->assertSame('010-7777-6666', $after['phone']);
        $this->assertSame(array_keys($before), array_keys($after));

        // discount·copy 도메인은 손대지 않았다.
        $this->assertCount(3, $this->readDiscount());
        $this->assertSame('F&B 매장 전문\n<em>위생 클린케어</em>', $this->readCopy()['hero_headline']);
    }

    public function test_site_update_rejects_a_value_of_the_wrong_type(): void
    {
        $this->actingAsAdmin()
            ->putJson(self::BASE.'/site', ['phone' => ['010-4348-8158']])
            ->assertStatus(422)
            ->assertJsonValidationErrors('phone');

        // 검증 실패는 아무것도 쓰지 않는다.
        $this->assertSame('010-4348-8158', $this->readSite()['phone']);
    }

    /**
     * 검증 표(입력 계약)가 응답·저장 계약과 같은 키 집합인지.
     *
     * site 는 리소스(SiteResource)가 키 집합을 고정하고, copy 는 시더 상수가 원문이다.
     * 어긋나면 "보낼 수는 있지만 읽히지 않는 키" 또는 그 반대가 생긴다.
     */
    public function test_the_accepted_key_lists_match_what_the_domains_read_back(): void
    {
        // site — 공개 읽기 키 집합과 정확히 같다.
        $this->assertSame(
            $this->sorted(SiteUpdateRequest::allowedKeys()),
            $this->sorted(array_keys($this->readSite()))
        );

        // copy — 시더가 쓰는 82키와 정확히 같다 (짧은 목록 금지).
        $this->assertSame(
            $this->sorted(CopyUpdateRequest::allowedKeys()),
            $this->sorted(array_keys($this->seederCopy()))
        );

        // discount — `steps` 하나뿐이다.
        $this->assertSame(['steps'], DiscountUpdateRequest::KEYS);
    }

    public function test_the_declared_key_lists_have_no_duplicates(): void
    {
        foreach ([SiteUpdateRequest::allowedKeys(), CopyUpdateRequest::allowedKeys()] as $keys) {
            $this->assertSame(count($keys), count(array_unique($keys)));
        }
    }

    /**
     * @param  array<int, string>  $keys
     * @return array<int, string>
     */
    private function sorted(array $keys): array
    {
        sort($keys);

        return $keys;
    }

    // ── 401 / 403 ───────────────────────────────────────────────────────────

    public function test_unauthenticated_requests_are_rejected(): void
    {
        foreach (['site', 'copy', 'discount'] as $domain) {
            $this->getJson(self::BASE.'/'.$domain)->assertUnauthorized();
            $this->putJson(self::BASE.'/'.$domain, [])->assertUnauthorized();
        }
    }

    public function test_a_user_without_the_permission_is_forbidden(): void
    {
        // user 역할은 이 모듈의 권한을 하나도 갖지 않는다 — 403 이어야 한다.
        Sanctum::actingAs($this->createUser(), ['*'], 'sanctum');

        foreach (['site', 'copy', 'discount'] as $domain) {
            $this->getJson(self::BASE.'/'.$domain)->assertForbidden();
            $this->putJson(self::BASE.'/'.$domain, [])->assertForbidden();
        }
    }
}
