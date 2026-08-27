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
use Modules\Twentyft\Content\Http\Requests\PortfolioListRequest;
use Modules\Twentyft\Content\Http\Resources\PortfolioDetailResource;
use Modules\Twentyft\Content\Http\Resources\PortfolioListResource;
use Modules\Twentyft\Content\Services\PostMetaService;

/**
 * Portfolio 공개 API
 */
class PortfolioController extends Controller
{
    private const BOARD_SLUG = 'portfolio';

    public function __construct(
        private readonly PostMetaService $metaService
    ) {}

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

        // 공개 목록은 published 상태만. (blinded/deleted 노출 방지)
        $posts = Post::where('board_id', $board->id)
            ->where('status', PostStatus::Published->value)
            ->with('attachments')
            ->orderByDesc('created_at')
            ->get();

        // 메타를 게시글 수와 무관하게 1회 조회 (N+1 방지)
        $metaByPost = $this->metaService->allByBoard($board->id, 'portfolio');

        $items = [];
        foreach ($posts as $post) {
            $meta = PostMetaService::portfolioMetaFromArray($metaByPost[$post->id] ?? []);

            if (($meta['visibility'] ?? Visibility::PRIVATE->value) !== Visibility::PUBLIC->value) {
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
            ->where('status', PostStatus::Published->value)
            ->with('attachments')
            ->get();

        $metaByPost = $this->metaService->allByBoard($board->id, 'portfolio');

        foreach ($posts as $post) {
            $meta = PostMetaService::portfolioMetaFromArray($metaByPost[$post->id] ?? []);

            if (($meta['visibility'] ?? Visibility::PRIVATE->value) !== Visibility::PUBLIC->value) {
                continue;
            }

            if (($meta['slug'] ?? '') !== $slug && $this->slugFromTitle($post) !== $slug) {
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
     *
     * @return array<string, mixed>
     */
    private function mapListItem(Post $post, array $meta): array
    {
        return [
            'public_id' => $this->publicId($post),
            'slug' => $meta['slug'] ?? $this->slugFromTitle($post),
            'title' => $post->title,
            'summary' => $meta['summary'],
            'year' => $meta['year'],
            'types' => $meta['types'],
            'status' => $meta['status'],
            'is_featured' => (bool) $meta['is_featured'],
            '_sort_order' => (int) ($meta['sort_order'] ?? 0),
            'created_at' => $post->created_at?->toIso8601String(),
            'cover_image_url' => $this->coverImageUrl($post, $meta),
        ];
    }

    /**
     * 상세용 아이템 매핑
     *
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
            'year' => $meta['year'],
            'types' => $meta['types'],
            'status' => $meta['status'],
            'is_featured' => (bool) $meta['is_featured'],
            'client_name' => $meta['client_name'],
            'role' => $meta['role'],
            'tech_stack' => $meta['tech_stack'],
            'related_url' => $meta['related_url'],
            'github_url' => $meta['github_url'],
            'cover_image_url' => $this->coverImageUrl($post, $meta),
            'gallery_image_urls' => $this->galleryUrls($meta['gallery_attachment_ids'] ?? [], $post),
        ];
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

    /**
     * 공개 id 생성
     */
    private function publicId(Post $post): string
    {
        return hash('xxh64', 'portfolio:'.$post->id);
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
     * 갤러리 URL 목록 조회
     */
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
