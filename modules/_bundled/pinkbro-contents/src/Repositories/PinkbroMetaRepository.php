<?php

namespace Modules\Pinkbro\Contents\Repositories;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Modules\Pinkbro\Contents\Models\PinkbroMeta;

/**
 * PinkbroMeta Eloquent 기반 구현.
 *
 * 모든 조회/삭제는 (board_id, post_id, domain) 범위로 좁힌 뒤 key 로 한 번 더 좁힌다.
 * board_id / post_id 가 null 인 행은 "게시판·게시글에 매이지 않은 전역 메타"(사이트 설정,
 * 브랜드 문구 등)를 뜻하며, Eloquent 가 null 비교를 whereNull 로 변환해 준다.
 */
class PinkbroMetaRepository
{
    /**
     * 메타 저장/갱신 — 4키(board_id, post_id, domain, key) 기준 upsert.
     */
    public function upsert(?int $boardId, ?int $postId, string $domain, string $key, mixed $value): PinkbroMeta
    {
        return PinkbroMeta::updateOrCreate(
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
     * 단일 메타 행 조회
     */
    public function find(?int $boardId, ?int $postId, string $domain, string $key): ?PinkbroMeta
    {
        return $this->scoped($boardId, $postId, $domain)
            ->where('key', $key)
            ->first();
    }

    /**
     * 범위 내 모든 메타 행 조회
     *
     * @return Collection<int, PinkbroMeta>
     */
    public function allFor(?int $boardId, ?int $postId, string $domain): Collection
    {
        return $this->scoped($boardId, $postId, $domain)->get();
    }

    /**
     * 범위 내 메타 전체 삭제 — 삭제된 행 수를 돌려준다.
     */
    public function deleteFor(?int $boardId, ?int $postId, string $domain): int
    {
        return $this->scoped($boardId, $postId, $domain)->delete();
    }

    /**
     * 범위 내 키 1건 삭제 — 삭제된 행 수를 돌려준다.
     */
    public function deleteKey(?int $boardId, ?int $postId, string $domain, string $key): int
    {
        return $this->scoped($boardId, $postId, $domain)
            ->where('key', $key)
            ->delete();
    }

    /**
     * (board_id, post_id, domain) 로 좁힌 쿼리
     *
     * @return Builder<PinkbroMeta>
     */
    private function scoped(?int $boardId, ?int $postId, string $domain): Builder
    {
        return PinkbroMeta::query()
            ->where('board_id', $boardId)
            ->where('post_id', $postId)
            ->where('domain', $domain);
    }
}
