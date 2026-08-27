<?php

namespace Modules\Twentyft\Content\Services;

use Modules\Twentyft\Content\Repositories\Contracts\PostMetaRepositoryInterface;

/**
 * Domain별 메타 접근 헬퍼
 *
 * domain + key namespace를 감추고, 도메인별 기본값을 제공합니다.
 */
class PostMetaService
{
    public function __construct(
        private readonly PostMetaRepositoryInterface $repository
    ) {}

    /**
     * 특정 도메인+게시글의 메타를 모두 조회합니다.
     *
     * @param  int  $boardId
     * @param  int  $postId
     * @param  string  $domain
     * @return array<string, mixed>
     */
    public function all(int $boardId, int $postId, string $domain): array
    {
        return $this->repository->getAll($boardId, $postId, $domain);
    }

    /**
     * 단일 메타 조회
     */
    public function get(int $boardId, int $postId, string $domain, string $key, mixed $default = null): mixed
    {
        return $this->repository->get($boardId, $postId, $domain, $key, $default);
    }

    /**
     * 메타 저장
     */
    public function set(int $boardId, int $postId, string $domain, string $key, mixed $value): void
    {
        $this->repository->set($boardId, $postId, $domain, $key, $value);
    }

    /**
     * 게시판 단위로 도메인 메타를 일괄 조회합니다. (N+1 방지)
     *
     * @param  int  $boardId
     * @param  string  $domain
     * @return array<int, array<string, mixed>> post_id => meta
     */
    public function allByBoard(int $boardId, string $domain): array
    {
        return $this->repository->getAllByBoard($boardId, $domain);
    }

    /**
     * Portfolio 메타 기본 구조를 반환합니다.
     *
     * @param  int  $boardId
     * @param  int  $postId
     * @return array<string, mixed>
     */
    public function portfolioMeta(int $boardId, int $postId): array
    {
        return self::portfolioMetaFromArray(
            $this->repository->getAll($boardId, $postId, 'portfolio')
        );
    }

    /**
     * 일괄 조회된 Portfolio 메타 배열을 기본 구조로 정규화합니다.
     *
     * @param  array<string, mixed>  $meta
     * @return array<string, mixed>
     */
    public static function portfolioMetaFromArray(array $meta): array
    {
        return [
            'slug' => $meta['slug'] ?? null,
            'summary' => $meta['summary'] ?? null,
            'year' => $meta['year'] ?? null,
            'types' => $meta['types'] ?? [],
            'status' => $meta['status'] ?? 'BUILDING',
            'visibility' => $meta['visibility'] ?? 'PRIVATE',
            'is_featured' => $meta['is_featured'] ?? false,
            'sort_order' => $meta['sort_order'] ?? 0,
            'client_name' => $meta['client_name'] ?? null,
            'role' => $meta['role'] ?? [],
            'tech_stack' => $meta['tech_stack'] ?? [],
            'related_url' => $meta['related_url'] ?? null,
            'github_url' => $meta['github_url'] ?? null,
            'cover_image_attachment_id' => $meta['cover_image_attachment_id'] ?? null,
            'gallery_attachment_ids' => $meta['gallery_attachment_ids'] ?? [],
        ];
    }

    /**
     * SuperBify 메타 기본 구조를 반환합니다.
     */
    public function superbifyMeta(int $boardId, int $postId): array
    {
        return self::superbifyMetaFromArray(
            $this->repository->getAll($boardId, $postId, 'superbify')
        );
    }

    /**
     * 일괄 조회된 SuperBify 메타 배열을 기본 구조로 정규화합니다.
     *
     * @param  array<string, mixed>  $meta
     * @return array<string, mixed>
     */
    public static function superbifyMetaFromArray(array $meta): array
    {
        return [
            'slug' => $meta['slug'] ?? null,
            'summary' => $meta['summary'] ?? null,
            'type' => $meta['type'] ?? 'MODULE',
            'status' => $meta['status'] ?? 'RESEARCH',
            'visibility' => $meta['visibility'] ?? 'PRIVATE',
            'is_featured' => $meta['is_featured'] ?? false,
            'sort_order' => $meta['sort_order'] ?? 0,
            'version' => $meta['version'] ?? null,
            'g7_compatibility' => $meta['g7_compatibility'] ?? null,
            'license' => $meta['license'] ?? null,
            'github_url' => $meta['github_url'] ?? null,
            'sir_url' => $meta['sir_url'] ?? null,
            'docs_url' => $meta['docs_url'] ?? null,
            'release_url' => $meta['release_url'] ?? null,
            'demo_url' => $meta['demo_url'] ?? null,
            'download_url' => $meta['download_url'] ?? null,
            'purchase_url' => $meta['purchase_url'] ?? null,
            'cover_image_attachment_id' => $meta['cover_image_attachment_id'] ?? null,
            'screenshot_attachment_ids' => $meta['screenshot_attachment_ids'] ?? [],
        ];
    }

    /**
     * Inquiry 메타 기본 구조를 반환합니다.
     */
    public function inquiryMeta(int $boardId, int $postId): array
    {
        $meta = $this->repository->getAll($boardId, $postId, 'inquiry');

        return [
            'name' => $meta['name'] ?? null,
            'email' => $meta['email'] ?? null,
            'phone' => $meta['phone'] ?? null,
            'company' => $meta['company'] ?? null,
            'project_type' => $meta['project_type'] ?? null,
            'current_site_url' => $meta['current_site_url'] ?? null,
            'budget_range' => $meta['budget_range'] ?? null,
            'desired_schedule' => $meta['desired_schedule'] ?? null,
            'reference_url' => $meta['reference_url'] ?? null,
            'privacy_consent' => $meta['privacy_consent'] ?? false,
            'internal_status' => $meta['internal_status'] ?? 'NEW',
        ];
    }
}
