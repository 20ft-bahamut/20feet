<?php

namespace Modules\Twentyft\Content\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Twentyft\Content\Enums\PortfolioStatus;
use Modules\Twentyft\Content\Enums\PortfolioType;
use Modules\Twentyft\Content\Enums\Visibility;
use Modules\Twentyft\Content\Http\Requests\PortfolioListRequest;
use Modules\Twentyft\Content\Http\Resources\PortfolioDetailResource;
use Modules\Twentyft\Content\Http\Resources\PortfolioListResource;
use Modules\Twentyft\Content\Services\PostMetaService;
use Modules\Sirsoft\Board\Models\Attachment;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Models\Post;

/**
 * Portfolio 공개 API
 */
class PortfolioController extends Controller
{
    private const BOARD_SLUG = 'portfolio';

    public function __construct(
        private readonly PostMetaService $metaService
    ) {
    }

    /**
     * Portfolio 목록
     */
    public function index(PortfolioListRequest $request): JsonResponse
    {
        $board = $this->getBoard();
        if (! $board) {
            return $this->emptyResponse($request);
        }

        $page = $request->integer('page', 1);
        $perPage = $request->integer('per_page', 12);

        $query = Post::where('board_id', $board->id)
            ->where('status', '!=', 'trash')
            ->orderByDesc('created_at');

        $posts = $query->get();

        $items = [];
        foreach ($posts as $post) {
            $meta = $this->metaService->portfolioMeta($board->id, $post->id);

            if (($meta['visibility'] ?? 'PRIVATE') !== Visibility::PUBLIC->value) {
                continue;
            }

            if ($request->has('type') && ! in_array($request->input('type'), $meta['types'] ?? [], true)) {
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

        // sort_order 기준 정렬, 값이 같으면 생성일 내림차
        usort($items, function (array $a, array $b): int {
            $orderA = $a['_sort_order'] ?? 0;
            $orderB = $b['_sort_order'] ?? 0;
            if ($orderA !== $orderB) {
                return $orderA <=> $orderB;
            }
            return strtotime($b['created_at'] ?? 'now') <=> strtotime($a['created_at'] ?? 'now');
        });

        // paginate manually
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
            'data' => PortfolioListResource::collection($paginator),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Portfolio 상세 (slug 기반)
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
            $meta = $this->metaService->portfolioMeta($board->id, $post->id);

            if (($meta['visibility'] ?? 'PRIVATE') !== Visibility::PUBLIC->value) {
                continue;
            }

            if (($meta['slug'] ?? '') !== $slug) {
                continue;
            }

            return response()->json([
                'data' => new PortfolioDetailResource($this->mapDetailItem($post, $meta)),
            ]);
        }

        return response()->json(['message' => 'Not found'], 404);
    }

    /**
     * 게시판 조회
     */
    private function getBoard(): ?Board
    {
        return Board::where('slug', self::BOARD_SLUG)->first();
    }

    /**
     * 목록용 아이템 매핑
     */
    private function mapListItem(Post $post, array $meta): array
    {
        $coverAttachmentId = $meta['cover_image_attachment_id'] ?? null;
        if (! $coverAttachmentId) {
            $coverAttachmentId = $post->attachments()->first()?->id ?? $post->thumbnailAttachment?->id;
        }

        return [
            'public_id' => $this->publicId($post),
            'slug' => $meta['slug'] ?? $this->slugFromTitle($post->title),
            'title' => $post->title,
            'summary' => $meta['summary'],
            'year' => $meta['year'],
            'types' => $meta['types'],
            'status' => $meta['status'],
            'is_featured' => (bool) $meta['is_featured'],
            '_sort_order' => (int) ($meta['sort_order'] ?? 0),
            'created_at' => $post->created_at?->toIso8601String(),
            'cover_image_url' => $this->attachmentUrl($coverAttachmentId),
        ];
    }

    /**
     * 상세용 아이템 매핑
     */
    private function mapDetailItem(Post $post, array $meta): array
    {
        $coverAttachmentId = $meta['cover_image_attachment_id'] ?? null;
        if (! $coverAttachmentId) {
            $coverAttachmentId = $post->attachments()->first()?->id ?? $post->thumbnailAttachment?->id;
        }

        return [
            'public_id' => $this->publicId($post),
            'slug' => $meta['slug'] ?? $this->slugFromTitle($post->title),
            'title' => $post->title,
            'summary' => $meta['summary'],
            'description' => $post->content,
            'year' => $meta['year'],
            'types' => $meta['types'],
            'status' => $meta['status'],
            'is_featured' => (bool) $meta['is_featured'],
            'client_name' => $meta['client_name'],
            'role' => $meta['role'],
            'tech_stack' => $meta['tech_stack'],
            'related_url' => $meta['related_url'],
            'github_url' => $meta['github_url'],
            'cover_image_url' => $this->attachmentUrl($coverAttachmentId),
            'gallery_image_urls' => $this->galleryUrls($meta['gallery_attachment_ids'] ?? []),
        ];
    }

    /**
     * 공개 id 생성
     */
    private function publicId(Post $post): string
    {
        return hash('xxh64', 'portfolio:'.$post->id);
    }

    /**
     * 제목에서 slug fallback 생성
     */
    private function slugFromTitle(string $title): string
    {
        $slug = preg_replace('/[^a-z0-9-]+/i', '-', strtolower(trim($title)));
        $slug = trim($slug, '-');

        return $slug === '' ? 'untitled' : $slug;
    }

    /**
     * 첨부파일 URL 조회
     */
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

    /**
     * 갤러리 URL 목록 조회
     */
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

    /**
     * 게시판이 없을 때 빈 응답
     */
    private function emptyResponse(PortfolioListRequest $request): JsonResponse
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
