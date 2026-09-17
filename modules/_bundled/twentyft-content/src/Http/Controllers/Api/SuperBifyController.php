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

        // Portfolio 와 같은 규칙 — 저장된 slug 를 먼저 보고, 저장된 값이 없는 글만
        // 제목에서 만든 slug 로 찾는다. 그래야 관리자가 정한 주소가 다른 글에 가려지지 않는다.
        $public = [];
        foreach ($posts as $post) {
            $meta = PostMetaService::superbifyMetaFromArray($metaByPost[$post->id] ?? []);

            if (($meta['visibility'] ?? Visibility::PRIVATE->value) !== Visibility::PUBLIC->value) {
                continue;
            }

            $public[] = [$post, $meta];
        }

        foreach ($public as [$post, $meta]) {
            if (($meta['slug'] ?? '') !== '' && $meta['slug'] === $slug) {
                return response()->json([
                    'data' => new SuperBifyDetailResource($this->mapDetailItem($post, $meta)),
                ]);
            }
        }

        foreach ($public as [$post, $meta]) {
            if (($meta['slug'] ?? '') === '' && $this->slugFromTitle($post) === $slug) {
                return response()->json([
                    'data' => new SuperBifyDetailResource($this->mapDetailItem($post, $meta)),
                ]);
            }
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
        // 커버를 한 번만 해석해 스크린샷 목록에서 같은 첨부를 제외합니다.
        // (제외하지 않으면 대표 화면과 '화면' 첫 장이 같은 파일이 됩니다)
        $cover = $this->coverAttachment($post, $meta);

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
            'cover_image_url' => $this->attachmentUrl($cover),
            'screenshot_image_urls' => $this->galleryUrls(
                $meta['screenshot_attachment_ids'] ?? [],
                $post,
                $cover?->id
            ),
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
     * 화면 이미지 URL 목록 조회
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
