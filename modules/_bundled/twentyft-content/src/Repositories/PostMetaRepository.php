<?php

namespace Modules\Twentyft\Content\Repositories;

use Modules\Twentyft\Content\Models\PostMeta;
use Modules\Twentyft\Content\Repositories\Contracts\PostMetaRepositoryInterface;

/**
 * PostMeta Eloquent 기반 구현
 */
class PostMetaRepository implements PostMetaRepositoryInterface
{
    /**
     * 단일 메타 값 조회
     */
    public function get(int $boardId, int $postId, string $domain, string $key, mixed $default = null): mixed
    {
        $row = PostMeta::where('board_id', $boardId)
            ->where('post_id', $postId)
            ->where('domain', $domain)
            ->where('key', $key)
            ->first();

        return $row?->value ?? $default;
    }

    /**
     * 모든 메타 조회
     */
    public function getAll(int $boardId, int $postId, string $domain): array
    {
        $rows = PostMeta::where('board_id', $boardId)
            ->where('post_id', $postId)
            ->where('domain', $domain)
            ->get(['key', 'value']);

        $result = [];
        foreach ($rows as $row) {
            $result[$row->key] = $row->value;
        }

        return $result;
    }

    /**
     * 메타 저장/갱신
     */
    public function set(int $boardId, int $postId, string $domain, string $key, mixed $value): void
    {
        PostMeta::updateOrCreate(
            [
                'board_id' => $boardId,
                'post_id' => $postId,
                'domain' => $domain,
                'key' => $key,
            ],
            [
                'value' => $value,
            ]
        );
    }

    /**
     * 단일 메타 삭제
     */
    public function delete(int $boardId, int $postId, string $domain, string $key): void
    {
        PostMeta::where('board_id', $boardId)
            ->where('post_id', $postId)
            ->where('domain', $domain)
            ->where('key', $key)
            ->delete();
    }

    /**
     * 도메인 메타 전체 삭제
     */
    public function deleteAll(int $boardId, int $postId, string $domain): void
    {
        PostMeta::where('board_id', $boardId)
            ->where('post_id', $postId)
            ->where('domain', $domain)
            ->delete();
    }
}
