<?php

namespace Modules\Pinkbro\Contents\Tests\Feature;

use Illuminate\Support\Facades\DB;
use Modules\Pinkbro\Contents\Database\Seeders\PinkbroContentsSeeder;
use Modules\Pinkbro\Contents\Listeners\MetaCleanupListener;
use Modules\Pinkbro\Contents\Tests\PinkbroContentsTestCase;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Services\PostService;

/**
 * 게시글 삭제 시 pinkbro_meta 고아 행 정리 검증.
 *
 * 리스너가 실제로 발화하는지 확인하는 것이 목적이라 삭제는 반드시 공식
 * 경로(PostService::deletePost)로 한다 — 직접 DB::table()->delete() 는
 * `sirsoft-board.post.after_delete` 훅을 우회하므로 리스너 발화를 증명하지 못한다.
 */
class MetaCleanupTest extends PinkbroContentsTestCase
{
    /**
     * 게시글 1건 삭제 → 그 글의 메타 행 전부 삭제.
     */
    public function test_deleting_a_post_removes_its_meta_rows(): void
    {
        $this->seed(PinkbroContentsSeeder::class);

        $board = Board::query()->where('slug', 'pinkbro_service')->firstOrFail();
        $post = DB::table('board_posts')->where('board_id', $board->id)->firstOrFail();

        $metaCountBefore = DB::table('pinkbro_meta')->where('post_id', $post->id)->count();
        $this->assertGreaterThan(0, $metaCountBefore);

        // 공식 삭제 경로 — after_delete 훅이 발화하는 유일한 경로다.
        app(PostService::class)->deletePost($board->slug, (int) $post->id);

        $this->assertSame(0, DB::table('pinkbro_meta')->where('post_id', $post->id)->count());
    }

    /**
     * 게시글 삭제는 사이트 레벨 메타(board_id·post_id 둘 다 null)를 건드리지 않는다.
     */
    public function test_deleting_one_post_does_not_touch_site_level_meta(): void
    {
        $this->seed(PinkbroContentsSeeder::class);

        $siteMetaCount = DB::table('pinkbro_meta')
            ->whereNull('board_id')
            ->whereNull('post_id')
            ->count();
        $this->assertGreaterThan(0, $siteMetaCount);

        $board = Board::query()->where('slug', 'pinkbro_service')->firstOrFail();
        $post = DB::table('board_posts')->where('board_id', $board->id)->firstOrFail();

        app(PostService::class)->deletePost($board->slug, (int) $post->id);

        $this->assertSame(
            $siteMetaCount,
            DB::table('pinkbro_meta')
                ->whereNull('board_id')
                ->whereNull('post_id')
                ->count()
        );
    }

    /**
     * 게시판 벌크 정리 훅 핸들러 — 삭제 예정 글들의 메타만 지우고 사이트 레벨은 남긴다.
     *
     * deleteBoard() 의 권한 스코프(sirsoft-board.boards.delete)를 통과시키려면
     * 보드 권한까지 세팅해야 해 훅 경로 전체를 테스트로 두지 않았다 — 핸들러를
     * 직접 호출하는 보조 증거다. 발화 지점(BoardService.php:593)과 페이로드
     * ([Board, int[] postIds])는 참조 원문과 동일하게 구독한다.
     */
    public function test_board_bulk_cleanup_removes_meta_for_deleted_post_ids_only(): void
    {
        $this->seed(PinkbroContentsSeeder::class);

        $board = Board::query()->where('slug', 'pinkbro_service')->firstOrFail();
        $postIds = DB::table('board_posts')
            ->where('board_id', $board->id)
            ->pluck('id')
            ->map(fn (int $id): int => $id)
            ->all();
        $this->assertNotEmpty($postIds);

        app(MetaCleanupListener::class)->handleBoardPostsBeforeForceDelete($board, $postIds);

        $this->assertSame(0, DB::table('pinkbro_meta')->whereIn('post_id', $postIds)->count());
        $this->assertGreaterThan(
            0,
            DB::table('pinkbro_meta')->whereNull('board_id')->whereNull('post_id')->count()
        );
    }
}
