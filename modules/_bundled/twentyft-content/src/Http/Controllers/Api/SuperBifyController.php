<?php

namespace Modules\Twentyft\Content\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Twentyft\Content\Enums\Visibility;
use Modules\Twentyft\Content\Http\Requests\SuperBifyListRequest;
use Modules\Twentyft\Content\Http\Resources\SuperBifyDetailResource;
use Modules\Twentyft\Content\Http\Resources\SuperBifyListResource;
use Modules\Twentyft\Content\Services\PostMetaService;
use Modules\Sirsoft\Board\Models\Attachment;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Models\Post;

/**
 * SuperBify 공개 API
 */
class SuperBifyController extends Controller
{
    private const BOARD_SLUG = 'superbify';

    public function __construct(
        private readonly PostMetaService $metaService
    ) {
    }

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

        $posts = Post::where('board_id', $board->id)
            ->where('status', '!=', 'trash')
            ->orderByDesc('created_at')
            ->get();

        $items = [];
        foreach ($posts as $post) {
            $meta = $this->metaService->superbifyMeta($board->id, $post->id);

            if (($meta['visibility'] ?? 'PRIVATE') !== Visibility::PUBLIC->value) {
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
            ->where('status', '!=', 'trash')
            ->get();

        foreach ($posts as $post) {
            $meta = $this->metaService->superbifyMeta($board->id, $post->id);

            if (($meta['visibility'] ?? 'PRIVATE') !== Visibility::PUBLIC->value) {
                continue;
            }

            if (($meta['slug'] ?? '') !== $slug) {
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

    private function mapListItem(Post $post, array $meta): array
    {
        return [
            'public_id' => $this->publicId($post),
            'slug' => $meta['slug'] ?? $this->slugFromTitle($post->title),
            'title' => $post->title,
            'summary' => $meta['summary'],
            'type' => $meta['type'],
            'status' => $meta['status'],
            'version' => $meta['version'],
            'g7_compatibility' => $meta['g7_compatibility'],
            'is_featured' => (bool) $meta['is_featured'],
            '_sort_order' => (int) ($meta['sort_order'] ?? 0),
            'created_at' => $post->created_at?->toIso8601String(),
            'cover_image_url' => $this->attachmentUrl($meta['cover_image_attachment_id'] ?? null),
        ];
    }

    private function mapDetailItem(Post $post, array $meta): array
    {
        return [
            'public_id' => $this->publicId($post),
            'slug' => $meta['slug'] ?? $this->slugFromTitle($post->title),
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
            'cover_image_url' => $this->attachmentUrl($meta['cover_image_attachment_id'] ?? null),
            'screenshot_image_urls' => $this->galleryUrls($meta['screenshot_attachment_ids'] ?? []),
        ];
    }

    private function publicId(Post $post): string
    {
        return hash('xxh64', 'superbify:'.$post->id);
    }

    private function slugFromTitle(string $title): string
    {
        $slug = preg_replace('/[^a-z0-9-]+/i', '-', strtolower(trim($title)));
        $slug = trim($slug, '-');

        return $slug === '' ? 'untitled' : $slug;
    }

    private function attachmentUrl(?int $attachmentId): ?string
    {
        if (! $attachmentId) {
            return null;
        }

        $attachment = Attachment::find($attachmentId);
        if (! $attachment) {
            return null;
        }

        return $attachment->preview_url ?? $attachment->download_url;
    }

    private function galleryUrls(array $attachmentIds): array
    {
        $urls = [];
        foreach ($attachmentIds as $id) {
            $url = $this->attachmentUrl((int) $id);
            if ($url) {
                $urls[] = $url;
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
