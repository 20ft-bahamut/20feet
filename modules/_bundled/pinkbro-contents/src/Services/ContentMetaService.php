<?php

namespace Modules\Pinkbro\Contents\Services;

use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Models\PinkbroMeta;
use Modules\Pinkbro\Contents\Repositories\PinkbroMetaRepository;

/**
 * 콘텐츠 메타 도메인 헬퍼.
 *
 * HTTP 를 알지 못한다 — 도메인/키/값 행을 정규화해 저장·조회·삭제만 한다.
 * board_id / post_id 가 null 이면 게시판·게시글에 매이지 않은 전역 메타를 뜻한다.
 */
class ContentMetaService
{
    public function __construct(private readonly PinkbroMetaRepository $repository) {}

    public function set(?int $boardId, ?int $postId, MetaDomain $domain, string $key, mixed $value): PinkbroMeta
    {
        return $this->repository->upsert($boardId, $postId, $domain->value, $key, $value);
    }

    public function get(?int $boardId, ?int $postId, MetaDomain $domain, string $key, mixed $default = null): mixed
    {
        $row = $this->repository->find($boardId, $postId, $domain->value, $key);

        return $row?->value ?? $default;
    }

    public function allFor(?int $boardId, ?int $postId, MetaDomain $domain): array
    {
        return $this->repository->allFor($boardId, $postId, $domain->value)
            ->mapWithKeys(fn (PinkbroMeta $row) => [$row->key => $row->value])
            ->all();
    }

    public function setMany(?int $boardId, ?int $postId, MetaDomain $domain, array $pairs): void
    {
        foreach ($pairs as $key => $value) {
            $this->set($boardId, $postId, $domain, $key, $value);
        }
    }

    public function deleteFor(?int $boardId, ?int $postId, MetaDomain $domain): int
    {
        return $this->repository->deleteFor($boardId, $postId, $domain->value);
    }

    public function deleteKey(?int $boardId, ?int $postId, MetaDomain $domain, string $key): int
    {
        return $this->repository->deleteKey($boardId, $postId, $domain->value, $key);
    }
}
