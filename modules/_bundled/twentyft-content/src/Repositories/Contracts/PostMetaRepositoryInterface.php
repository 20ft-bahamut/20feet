<?php

namespace Modules\Twentyft\Content\Repositories\Contracts;

/**
 * PostMeta 접근 인터페이스
 */
interface PostMetaRepositoryInterface
{
    /**
     * 특정 게시글의 단일 메타 값을 조회합니다.
     *
     * @param int $boardId
     * @param int $postId
     * @param string $domain
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function get(int $boardId, int $postId, string $domain, string $key, mixed $default = null): mixed;

    /**
     * 특정 게시글의 모든 메타를 배열로 조회합니다.
     *
     * @param int $boardId
     * @param int $postId
     * @param string $domain
     * @return array<string, mixed>
     */
    public function getAll(int $boardId, int $postId, string $domain): array;

    /**
     * 특정 게시글에 메타 값을 저장하거나 갱신합니다.
     *
     * @param int $boardId
     * @param int $postId
     * @param string $domain
     * @param string $key
     * @param mixed $value
     * @return void
     */
    public function set(int $boardId, int $postId, string $domain, string $key, mixed $value): void;

    /**
     * 특정 키의 메타를 삭제합니다.
     *
     * @param int $boardId
     * @param int $postId
     * @param string $domain
     * @param string $key
     * @return void
     */
    public function delete(int $boardId, int $postId, string $domain, string $key): void;

    /**
     * 특정 도메인의 메타를 모두 삭제합니다.
     *
     * @param int $boardId
     * @param int $postId
     * @param string $domain
     * @return void
     */
    public function deleteAll(int $boardId, int $postId, string $domain): void;
}
