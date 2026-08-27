<?php

namespace Modules\Twentyft\Content\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Sirsoft\Board\Enums\PostStatus;
use Modules\Sirsoft\Board\Models\Attachment;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Models\Post;
use Modules\Twentyft\Content\Enums\Visibility;
use Modules\Twentyft\Content\Http\Requests\SuperBifyListRequest;
use Modules\Twentyft\Content\Http\Resources\SuperBifyDetailResource;
use Modules\Twentyft\Content\Http\Resources\SuperBifyListResource;
use Modules\Twentyft\Content\Services\PostMetaService;

/**
 * SuperBify 공개 API
 */
class SuperBifyController extends Controller
{
    private const BOARD_SLUG = 'superbify';

    public function __construct(
        private readonly PostMetaService $metaService
    ) {}

    /**
     * SuperBify 목록
     */
    public function index(SuperBifyListRequest $request): JsonResponse
    {
        $board = $this->getBoard();
        if (! $board) {
            return $this->emptyResponse($request);
        }

        $page = $request->integer('page', 1);
        $perPage = $request->integer('per_page', 12);

        // 공개 목록은 published 상태만. (blinded/deleted 노출 방지)
        $posts = Post::where('board_id', $board->id)
            ->where('status', PostStatus::Published->value)
            ->with('attachments')
            ->orderByDesc('created_at')
            ->get();

        // 메타를 게시글 수와 무관하게 1회 조회 (N+1 방지)
        $metaByPost = $this->metaService->allByBoard($board->id, 'superbify');

        $items = [];
        foreach ($posts as $post) {
            $meta = PostMetaService::superbifyMetaFromArray($metaByPost[$post->id] ?? []);

            if (($meta['visibility'] ?? Visibility::PRIVATE->value) !== Visibility::PUBLIC->value) {
                continue;
            }

            if ($request->has('type') && ($meta['type'] ?? '') !== $request->input('type')) {
                continue;
            }

            if ($request->has('status') && ($meta['status'] ?? '') !== $request->input('status')) {
                continue;
            }

            if ($request->boolean('featured') && ! ($meta['is_featured'] ?? false)) {
                continue;
            }

            $items[] = $this->mapListItem($post, $meta);
        }

        usort($items, function (array $a, array $b): int {
            $orderA = $a['_sort_order'] ?? 0;
            $orderB = $b['_sort_order'] ?? 0;
            if ($orderA !== $orderB) {
                return $orderA <=> $orderB;
            }

            return strtotime($b['created_at'] ?? 'now') <=> strtotime($a['created_at'] ?? 'now');
        });

        $total = count($items);
        $items = array_slice($items, ($page - 1) * $perPage, $perPage);

        $paginator = new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => $request->url()]
        );

        return response()->json([
            'data' => SuperBifyListResource::collection($paginator),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * SuperBify 상세 (slug 기반)
     */
    public function show(string $slug): JsonResponse
    {
        $board = $this->getBoard();
        if (! $board) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $posts = Post::where('board_id', $board->id)
            ->where('status', PostStatus::Published->value)
            ->with('attachments')
            ->get();

        $metaByPost = $this->metaService->allByBoard($board->id, 'superbify');

        foreach ($posts as $post) {
            $meta = PostMetaService::superbifyMetaFromArray($metaByPost[$post->id] ?? []);

            if (($meta['visibility'] ?? Visibility::PRIVATE->value) !== Visibility::PUBLIC->value) {
                continue;
            }

            if (($meta['slug'] ?? '') !== $slug && $this->slugFromTitle($post) !== $slug) {
                continue;
            }

            return response()->json([
                'data' => new SuperBifyDetailResource($this->mapDetailItem($post, $meta)),
            ]);
        }

        return response()->json(['message' => 'Not found'], 404);
    }

    private function getBoard(): ?Board
    {
        return Board::where('slug', self::BOARD_SLUG)->first();
    }

    /**
     * @return array<string, mixed>
     */
    private function mapListItem(Post $post, array $meta): array
    {
        return [
            'public_id' => $this->publicId($post),
            'slug' => $meta['slug'] ?? $this->slugFromTitle($post),
            'title' => $post->title,
            'summary' => $meta['summary'],
            'type' => $meta['type'],
            'status' => $meta['status'],
            'version' => $meta['version'],
            'g7_compatibility' => $meta['g7_compatibility'],
            'is_featured' => (bool) $meta['is_featured'],
            '_sort_order' => (int) ($meta['sort_order'] ?? 0),
            'created_at' => $post->created_at?->toIso8601String(),
            'cover_image_url' => $this->coverImageUrl($post, $meta),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapDetailItem(Post $post, array $meta): array
    {
        return [
            'public_id' => $this->publicId($post),
            'slug' => $meta['slug'] ?? $this->slugFromTitle($post),
            'title' => $post->title,
            'summary' => $meta['summary'],
            'description' => $post->content,
            'type' => $meta['type'],
            'status' => $meta['status'],
            'version' => $meta['version'],
            'g7_compatibility' => $meta['g7_compatibility'],
            'license' => $meta['license'],
            'is_featured' => (bool) $meta['is_featured'],
            'github_url' => $meta['github_url'],
            'sir_url' => $meta['sir_url'],
            'docs_url' => $meta['docs_url'],
            'release_url' => $meta['release_url'],
            'demo_url' => $meta['demo_url'],
            'download_url' => $meta['download_url'],
            'purchase_url' => $meta['purchase_url'],
            'cover_image_url' => $this->coverImageUrl($post, $meta),
            'screenshot_image_urls' => $this->galleryUrls($meta['screenshot_attachment_ids'] ?? [], $post),
        ];
    }

    private function publicId(Post $post): string
    {
        return hash('xxh64', 'superbify:'.$post->id);
    }

    /**
     * 제목에서 slug fallback 생성 (유니코드 허용 — 한글 제목도 slug 유지)
     *
     * 빈 값인 경우 post id 접미사로 고유성을 확보합니다.
     */
    private function slugFromTitle(Post $post): string
    {
        $slug = preg_replace('/[^\p{L}\p{N}-]+/u', '-', mb_strtolower(trim((string) $post->title)));
        $slug = trim((string) $slug, '-');

        return $slug === '' ? 'post-'.$post->id : $slug;
    }

    /**
     * 커버 이미지 URL — 메타 지정 attachment 우선, 없으면 게시글 첨부 중 첫 이미지.
     * 이미지가 아닌 첨부파일(preview_url 미제공)이 <img> 를 깨지 않도록 is_image 로 필터합니다.
     */
    private function coverImageUrl(Post $post, array $meta): ?string
    {
        $attachment = null;

        $coverAttachmentId = $meta['cover_image_attachment_id'] ?? null;
        if ($coverAttachmentId) {
            $attachment = $post->attachments->firstWhere('id', (int) $coverAttachmentId)
                ?? Attachment::find((int) $coverAttachmentId);
        }

        if (! $attachment) {
            $attachment = $post->attachments->first(fn (Attachment $a): bool => $a->is_image);
        }

        if (! $attachment || ! $attachment->is_image) {
            return null;
        }

        return $attachment->preview_url ?? $attachment->download_url;
    }

    private function galleryUrls(array $attachmentIds, Post $post): array
    {
        // 메타 미지정 시 게시글의 이미지 첨부 전체를 순서대로 사용합니다.
        if (empty($attachmentIds)) {
            return $post->attachments
                ->filter(fn (Attachment $a): bool => $a->is_image)
                ->sortBy('order')
                ->map(fn (Attachment $a): ?string => $a->preview_url ?? $a->download_url)
                ->filter()
                ->values()
                ->all();
        }

        $urls = [];
        foreach ($attachmentIds as $id) {
            $attachment = Attachment::find((int) $id);
            if ($attachment) {
                $url = $attachment->preview_url ?? $attachment->download_url;
                if ($url) {
                    $urls[] = $url;
                }
            }
        }

        return $urls;
    }

    private function emptyResponse(SuperBifyListRequest $request): JsonResponse
    {
        return response()->json([
            'data' => [],
            'meta' => [
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $request->integer('per_page', 12),
                'total' => 0,
            ],
        ]);
    }
}
