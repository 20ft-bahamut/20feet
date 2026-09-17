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

        // 공개 글만 모아 두고 두 번 훑는다.
        // 예전에는 '저장된 slug 또는 제목에서 만든 slug' 를 한 번에 비교해 먼저 걸린 글이 이겼다.
        // 그래서 관리자가 정한 slug 와 다른 글이 제목 때문에 먼저 걸리면 다른 사례가 열렸다.
        $public = [];
        foreach ($posts as $post) {
            $meta = PostMetaService::portfolioMetaFromArray($metaByPost[$post->id] ?? []);

            if (($meta['visibility'] ?? Visibility::PRIVATE->value) !== Visibility::PUBLIC->value) {
                continue;
            }

            $public[] = [$post, $meta];
        }

        // 1) 게시판에 저장된 slug 를 먼저 본다 — 관리자가 정한 값이 유일한 기준이다.
        foreach ($public as [$post, $meta]) {
            if (($meta['slug'] ?? '') !== '' && $meta['slug'] === $slug) {
                return response()->json([
                    'data' => new PortfolioDetailResource($this->mapDetailItem($post, $meta)),
                ]);
            }
        }

        // 2) slug 를 저장한 적 없는 글만 제목에서 만든 값으로 찾는다.
        foreach ($public as [$post, $meta]) {
            if (($meta['slug'] ?? '') === '' && $this->slugFromTitle($post) === $slug) {
                return response()->json([
                    'data' => new PortfolioDetailResource($this->mapDetailItem($post, $meta)),
                ]);
            }
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
            // 소개 페이지가 목록만으로 '역할 · 사용 기술'을 보여준다.
            // 상세에만 있던 값을 목록에서도 내보낸다.
            'role' => $meta['role'],
            'tech_stack' => $meta['tech_stack'],
        ];
    }

    /**
     * 상세용 아이템 매핑
     *
     * @return array<string, mixed>
     */
    private function mapDetailItem(Post $post, array $meta): array
    {
        // 커버를 한 번만 해석해 갤러리에서 같은 첨부를 제외합니다.
        // (제외하지 않으면 대표 이미지와 '실제 화면' 첫 장이 같은 파일이 됩니다)
        $cover = $this->coverAttachment($post, $meta);

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
            'cover_image_url' => $this->attachmentUrl($cover),
            'gallery_image_urls' => $this->galleryUrls(
                $meta['gallery_attachment_ids'] ?? [],
                $post,
                $cover?->id
            ),
        ];
    }

    /**
     * 커버로 쓸 첨부 — 메타 지정 우선, 없으면 순서상 첫 이미지.
     *
     * 이미지가 아닌 첨부파일(preview_url 미제공)이 <img> 를 깨지 않도록 is_image 로 거릅니다.
     */
    private function coverAttachment(Post $post, array $meta): ?Attachment
    {
        $coverAttachmentId = $meta['cover_image_attachment_id'] ?? null;

        $attachment = null;
        if ($coverAttachmentId) {
            $attachment = $post->attachments->firstWhere('id', (int) $coverAttachmentId)
                ?? Attachment::find((int) $coverAttachmentId);
        }

        if (! $attachment) {
            $attachment = $post->attachments
                ->filter(fn (Attachment $a): bool => $a->is_image)
                ->sortBy('order')
                ->first();
        }

        return $attachment && $attachment->is_image ? $attachment : null;
    }

    /**
     * 커버 이미지 URL
     */
    private function coverImageUrl(Post $post, array $meta): ?string
    {
        return $this->attachmentUrl($this->coverAttachment($post, $meta));
    }

    private function attachmentUrl(?Attachment $attachment): ?string
    {
        if (! $attachment) {
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
     *
     * 커버로 쓰인 첨부는 제외합니다 — 같은 화면을 두 번 보여주지 않기 위해서입니다.
     * 제외하고 남는 이미지가 없으면 빈 배열이고, 화면은 그 섹션을 그리지 않습니다.
     */
    private function galleryUrls(array $attachmentIds, Post $post, ?int $excludeAttachmentId = null): array
    {
        // 메타 미지정 시 게시글의 이미지 첨부를 순서대로 사용합니다.
        if (empty($attachmentIds)) {
            return $post->attachments
                ->filter(fn (Attachment $a): bool => $a->is_image && $a->id !== $excludeAttachmentId)
                ->sortBy('order')
                ->map(fn (Attachment $a): ?string => $this->attachmentUrl($a))
                ->filter()
                ->values()
                ->all();
        }

        $urls = [];
        foreach ($attachmentIds as $id) {
            if ($excludeAttachmentId !== null && (int) $id === $excludeAttachmentId) {
                continue;
            }

            $url = $this->attachmentUrl(Attachment::find((int) $id));
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
