<?php

namespace Modules\Twentyft\Content\Listeners;

use App\Contracts\Extension\HookListenerInterface;
use Modules\Sirsoft\Board\Models\Post;
use Modules\Twentyft\Content\Models\PostMeta;

/**
 * 게시글/게시판 삭제 시 twentyft_post_meta 고아 행을 정리합니다.
 *
 * G7 규정(DB CASCADE 금지, 어플리케이션 명시 삭제)에 따라
 * sirsoft-board 삭제 흐름에 연동됩니다. 리스너는 멱등해야 합니다.
 */
class ContentMetaCleanupListener implements HookListenerInterface
{
    /**
     * 구독할 훅 목록을 반환합니다.
     *
     * @return array<string, array<string, mixed>>
     */
    public static function getSubscribedHooks(): array
    {
        return [
            // 단일 게시글 삭제 (휴지통/영구 삭제 공통)
            'sirsoft-board.post.after_delete' => [
                'method' => 'handlePostAfterDelete',
                'priority' => 10,
                'sync' => true,
            ],
            // 게시판 삭제 시 글 ID 목록 일괄 통지 (1,000건 chunk)
            'sirsoft-board.board.posts.before_force_delete' => [
                'method' => 'handleBoardPostsBeforeForceDelete',
                'priority' => 10,
                'sync' => true,
            ],
        ];
    }

    /**
     * {@inheritDoc}
     */
    public function handle(...$args): void {}

    /**
     * 단일 게시글 삭제 시 해당 글의 메타를 정리합니다.
     */
    public function handlePostAfterDelete(Post $post): void
    {
        PostMeta::where('board_id', $post->board_id)
            ->where('post_id', $post->id)
            ->delete();
    }

    /**
     * 게시판 삭제 시 삭제 예정 글들의 메타를 일괄 정리합니다.
     *
     * @param  mixed  ...$args  [Board $board, int[] $postIds]
     */
    public function handleBoardPostsBeforeForceDelete(...$args): void
    {
        $board = $args[0] ?? null;
        $postIds = $args[1] ?? [];

        if (! $board || empty($postIds)) {
            return;
        }

        PostMeta::where('board_id', $board->id)
            ->whereIn('post_id', $postIds)
            ->delete();
    }
}
