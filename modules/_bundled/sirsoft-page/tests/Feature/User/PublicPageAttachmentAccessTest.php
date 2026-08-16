<?php

namespace Modules\Sirsoft\Page\Tests\Feature\User;

// FeatureTestCase를 수동으로 require (autoload 전에 로드 필요)
require_once __DIR__.'/../../FeatureTestCase.php';

use App\Models\User;
use Mockery;
use Modules\Sirsoft\Page\Models\Page;
use Modules\Sirsoft\Page\Models\PageAttachment;
use Modules\Sirsoft\Page\Services\PageAttachmentService;
use Modules\Sirsoft\Page\Tests\FeatureTestCase;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * 공개 페이지 첨부 미리보기/다운로드 접근 게이트 테스트 (KVE-2026-1914 A-6 S-1)
 *
 * preview() 는 과거 발행상태 무관 공개 서빙이라, 미발행(초안) 페이지의 첨부 썸네일을
 * hash 만 있으면 무인가로 볼 수 있었다(preview↔download 게이트 불일치). 이 클래스는
 * preview 가 download 와 동일하게 "발행 첨부는 공개, 미발행 첨부는 pages.read 관리자만"
 * 게이트를 적용하는지 실제 HTTP 요청으로 고정한다.
 *
 * 게이트 통과/차단을 응답코드로 명확히 구분하기 위해 Service 를 모킹한다 —
 * 게이트 통과 시 200(스트리밍), 게이트 차단 시 컨트롤러가 Service 호출 전에 404 를 낸다.
 */
class PublicPageAttachmentAccessTest extends FeatureTestCase
{
    private const BASE = '/api/modules/sirsoft-page/pages/attachment';

    protected function tearDown(): void
    {
        Page::where('slug', 'like', 'attach-access-%')->forceDelete();
        Mockery::close();
        parent::tearDown();
    }

    /**
     * Service 를 모킹해 게이트 통과 시 200 을 반환하도록 만든다.
     *
     * @param  PageAttachment  $attachment  getByHash 가 반환할 첨부
     */
    private function mockServicePassThrough(PageAttachment $attachment): void
    {
        $svc = Mockery::mock(PageAttachmentService::class);
        $svc->shouldReceive('getByHash')->andReturn($attachment);
        $svc->shouldReceive('preview')->andReturn(new StreamedResponse(fn () => null, 200));
        $svc->shouldReceive('download')->andReturn(new StreamedResponse(fn () => null, 200));
        $this->app->instance(PageAttachmentService::class, $svc);
    }

    /**
     * 첨부를 만든다.
     *
     * @param  bool  $published  부모 페이지 발행 여부
     * @param  string  $slug  페이지 슬러그
     * @return PageAttachment 생성된 첨부
     */
    private function makeAttachment(bool $published, string $slug): PageAttachment
    {
        $pageFactory = Page::factory()->state(['slug' => $slug]);
        if ($published) {
            $pageFactory = $pageFactory->published();
        }
        $page = $pageFactory->create();

        return PageAttachment::factory()->image()->create(['page_id' => $page->id]);
    }

    // ── preview 게이트 (S-1 핵심) ──────────────────────────

    /**
     * 미발행 페이지 첨부 미리보기는 비인가 사용자에게 404 로 차단된다 (S-1 수정 핵심)
     *
     * @scenario resource=page_attachment, parent_state=restricted
     *
     * @effects unpublished_page_attachment_preview_blocked_for_guest
     */
    public function test_unpublished_preview_blocked_for_anonymous(): void
    {
        $attachment = $this->makeAttachment(false, 'attach-access-draft');
        $this->mockServicePassThrough($attachment);

        $this->getJson(self::BASE.'/'.$attachment->hash.'/preview')
            ->assertStatus(404);
    }

    /**
     * 미발행 페이지 첨부 미리보기는 권한 없는 로그인 사용자에게도 404 로 차단된다
     *
     * @scenario resource=page_attachment, parent_state=restricted
     *
     * @effects unpublished_page_attachment_preview_blocked_without_permission
     */
    public function test_unpublished_preview_blocked_for_user_without_permission(): void
    {
        $attachment = $this->makeAttachment(false, 'attach-access-draft-user');
        $this->mockServicePassThrough($attachment);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson(self::BASE.'/'.$attachment->hash.'/preview')
            ->assertStatus(404);
    }

    /**
     * 미발행 페이지 첨부 미리보기는 pages.read 관리자에게 허용된다 (초안 편집 썸네일 회귀 방지)
     *
     * @scenario resource=page_attachment, parent_state=restricted
     *
     * @effects unpublished_page_attachment_preview_allowed_with_pages_read
     */
    public function test_unpublished_preview_allowed_for_admin_with_pages_read(): void
    {
        $attachment = $this->makeAttachment(false, 'attach-access-draft-admin');
        $this->mockServicePassThrough($attachment);

        $admin = $this->createAdminUser(['sirsoft-page.pages.read']);

        $this->actingAs($admin)
            ->getJson(self::BASE.'/'.$attachment->hash.'/preview')
            ->assertStatus(200);
    }

    /**
     * 발행된 페이지 첨부 미리보기는 비인가 사용자에게도 공개된다 (정상 흐름 회귀 방지)
     *
     * @scenario resource=page_attachment, parent_state=public
     *
     * @effects published_page_attachment_preview_still_public
     */
    public function test_published_preview_allowed_for_anonymous(): void
    {
        $attachment = $this->makeAttachment(true, 'attach-access-live');
        $this->mockServicePassThrough($attachment);

        $this->getJson(self::BASE.'/'.$attachment->hash.'/preview')
            ->assertStatus(200);
    }

    // ── download 게이트 (기존 동작 회귀 대조) ──────────────

    /**
     * 미발행 페이지 첨부 다운로드는 비인가 사용자에게 404 로 차단된다 (기존 게이트 회귀 대조)
     *
     * @scenario resource=page_attachment, parent_state=restricted
     *
     * @effects unpublished_page_attachment_download_blocked_for_guest
     */
    public function test_unpublished_download_blocked_for_anonymous(): void
    {
        $attachment = $this->makeAttachment(false, 'attach-access-dl-draft');
        $this->mockServicePassThrough($attachment);

        $this->getJson(self::BASE.'/'.$attachment->hash)
            ->assertStatus(404);
    }

    /**
     * 미발행 페이지 첨부 다운로드는 pages.read 관리자에게 허용된다.
     *
     * preview 축은 4건(게스트/무권한 회원/관리자/발행글)인데 download 축은 차단 1건뿐이라
     * 두 경로의 커버리지 강도가 갈려 있었다. 게이트를 조일 때 download 만 과차단으로
     * 회귀해도 스위트가 green 이 되므로 허용 축을 함께 고정한다.
     *
     * @scenario resource=page_attachment, parent_state=restricted
     *
     * @effects unpublished_page_attachment_download_allowed_with_pages_read
     */
    public function test_unpublished_download_allowed_for_admin_with_pages_read(): void
    {
        $attachment = $this->makeAttachment(false, 'attach-access-dl-draft-admin');
        $this->mockServicePassThrough($attachment);

        $admin = $this->createAdminUser(['sirsoft-page.pages.read']);

        $this->actingAs($admin)
            ->getJson(self::BASE.'/'.$attachment->hash)
            ->assertStatus(200);
    }

    /**
     * 발행된 페이지 첨부 다운로드는 비인가 사용자에게도 공개된다 (정상 흐름 회귀 방지).
     *
     * @scenario resource=page_attachment, parent_state=public
     *
     * @effects published_page_attachment_download_still_public
     */
    public function test_published_download_allowed_for_anonymous(): void
    {
        $attachment = $this->makeAttachment(true, 'attach-access-dl-live');
        $this->mockServicePassThrough($attachment);

        $this->getJson(self::BASE.'/'.$attachment->hash)
            ->assertStatus(200);
    }
}
