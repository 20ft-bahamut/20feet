<?php

namespace Modules\Twentyft\Content\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Sirsoft\Board\Http\Resources\AttachmentResource;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Models\Post;
use Modules\Sirsoft\Board\Services\PostService;
use Modules\Twentyft\Content\Enums\SuperBifyStatus;
use Modules\Twentyft\Content\Http\Resources\SuperBifyAdminListResource;
use Modules\Twentyft\Content\Models\PostMeta;
use Modules\Twentyft\Content\Services\PostMetaService;

/**
 * SuperBify 관리자 API
 */
class SuperBifyAdminController extends Controller
{
    private const BOARD_SLUG = 'superbify';

    public function __construct(
        private readonly PostMetaService $metaService
    ) {}

    /**
     * SuperBify 목록 (관리자용)
     */
    public function index(Request $request): JsonResponse
    {
        $board = $this->getBoard();
        if (! $board) {
            return $this->emptyResponse($request);
        }

        $page = $request->integer('page', 1);
        $perPage = $request->integer('per_page', 15);

        $query = Post::where('board_id', $board->id)
            ->where('status', '!=', 'deleted')
            ->orderByDesc('created_at');

        $posts = $query->get();

        $items = [];
        foreach ($posts as $post) {
            $meta = $this->metaService->superbifyMeta($board->id, $post->id);

            if ($request->has('status') && ($meta['status'] ?? '') !== $request->input('status')) {
                continue;
            }

            if ($request->has('type') && ($meta['type'] ?? '') !== $request->input('type')) {
                continue;
            }

            if ($request->filled('keyword')) {
                $keyword = mb_strtolower($request->input('keyword'));
                $haystack = mb_strtolower(implode(' ', [
                    (string) $post->title,
                    $meta['slug'] ?? '',
                ]));
                if (! str_contains($haystack, $keyword)) {
                    continue;
                }
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
            'data' => [
                'data' => SuperBifyAdminListResource::collection($paginator),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ],
        ]);
    }

    /**
     * SuperBify 단일 조회 (관리자용)
     */
    public function show(int $postId): JsonResponse
    {
        $board = $this->getBoard();
        if (! $board) {
            return response()->json(['message' => 'Board not found'], 404);
        }

        $post = Post::where('board_id', $board->id)
            ->where('id', $postId)
            ->where('status', '!=', 'deleted')
            ->first();

        if (! $post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        $meta = $this->metaService->superbifyMeta($board->id, $post->id);

        return response()->json([
            'data' => [
                'postId' => $post->id,
                'title' => $post->title,
                'slug' => $meta['slug'] ?? $this->slugFromTitle($post->title),
                'summary' => $meta['summary'],
                'type' => $meta['type'] ?? 'MODULE',
                'status' => $meta['status'] ?? 'RESEARCH',
                'visibility' => $meta['visibility'] ?? 'PRIVATE',
                'isFeatured' => (bool) ($meta['is_featured'] ?? false),
                'sortOrder' => (int) ($meta['sort_order'] ?? 0),
                'version' => $meta['version'] ?? null,
                'g7Compatibility' => $meta['g7_compatibility'] ?? null,
                'license' => $meta['license'] ?? null,
                'githubUrl' => $meta['github_url'] ?? null,
                'sirUrl' => $meta['sir_url'] ?? null,
                'docsUrl' => $meta['docs_url'] ?? null,
                'releaseUrl' => $meta['release_url'] ?? null,
                'demoUrl' => $meta['demo_url'] ?? null,
                'coverImageAttachmentId' => $meta['cover_image_attachment_id'] ?? null,
                // FileUploader initialFiles / 대표 이미지 선택 옵션
                'attachments' => AttachmentResource::collectionFor(
                    $post->load(['attachments' => fn ($query) => $query->orderBy('order')])->attachments
                ),
            ],
        ]);
    }

    /**
     * SuperBify 메타 수정 (관리자용)
     */
    public function update(Request $request, int $postId): JsonResponse
    {
        $board = $this->getBoard();
        if (! $board) {
            return response()->json(['message' => 'Board not found'], 404);
        }

        $post = Post::where('board_id', $board->id)
            ->where('id', $postId)
            ->where('status', '!=', 'deleted')
            ->first();

        if (! $post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        // slug 중복 검증 — 같은 게시판 내 다른 글과 slug가 겹치면 상세 조회가 섀도잉됩니다.
        $newSlug = $request->input('slug');
        if ($newSlug !== null) {
            $currentSlug = $this->metaService->get($board->id, $post->id, 'superbify', 'slug');
            if ($newSlug !== $currentSlug && $this->slugExists($board->id, 'superbify', (string) $newSlug, $post->id)) {
                return response()->json([
                    'message' => '이미 사용 중인 slug 입니다.',
                    'errors' => ['slug' => ['이미 사용 중인 slug 입니다.']],
                ], 422);
            }
        }

        // 제목 저장 + 첨부 연결 + 메타 갱신을 원자적으로 처리
        DB::transaction(function () use ($board, $post, $request): void {
            $tempKey = $request->input('tempKey') ?? $request->input('temp_key');

            if ($request->has('title') || $tempKey !== null) {
                // PostService 경유 — 첨부(temp_key) 연결 + update 훅 + 캐시 무효화
                app(PostService::class)
                    ->updatePost(self::BOARD_SLUG, $post->id, [
                        'title' => $request->input('title', $post->title),
                        'temp_key' => $tempKey,
                    ]);
            } elseif ($request->has('title')) {
                $post->title = $request->input('title');
                $post->save();
            }

            $metaFields = [
                'slug' => 'scalar',
                'summary' => 'json',
                'type' => 'scalar',
                'status' => 'scalar',
                'visibility' => 'scalar',
                'is_featured' => 'bool',
                'sort_order' => 'int',
                'version' => 'scalar',
                'g7_compatibility' => 'scalar',
                'license' => 'scalar',
                'github_url' => 'scalar',
                'sir_url' => 'scalar',
                'docs_url' => 'scalar',
                'release_url' => 'scalar',
                'demo_url' => 'scalar',
                'download_url' => 'scalar',
                'purchase_url' => 'scalar',
                'cover_image_attachment_id' => 'int',
                'screenshot_attachment_ids' => 'json',
            ];

            foreach ($metaFields as $key => $type) {
                if (! $request->has(Str::camel($key)) && ! $request->has($key)) {
                    continue;
                }

                $value = $request->input(Str::camel($key)) ?? $request->input($key);

                if ($key === 'screenshot_attachment_ids') {
                    $value = is_array($value) ? array_values(array_map('intval', $value)) : [];
                }

                $this->metaService->set($board->id, $post->id, 'superbify', $key, $this->coerceMetaValue($value, $type));
            }
        });

        return response()->json([
            'message' => 'SuperBify updated',
            'data' => [
                'post_id' => $post->id,
            ],
        ]);
    }

    /**
     * SuperBify 상태 변경
     */
    public function updateStatus(Request $request, int $postId): JsonResponse
    {
        $board = $this->getBoard();
        if (! $board) {
            return response()->json(['message' => 'Board not found'], 404);
        }

        $post = Post::where('board_id', $board->id)
            ->where('id', $postId)
            ->where('status', '!=', 'deleted')
            ->first();

        if (! $post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        $status = $request->input('status');
        if (! SuperBifyStatus::tryFrom($status)) {
            return response()->json(['message' => 'Invalid status'], 422);
        }

        $this->metaService->set($board->id, $post->id, 'superbify', 'status', $status);

        return response()->json([
            'message' => 'Status updated',
            'data' => [
                'post_id' => $post->id,
                'status' => $status,
            ],
        ]);
    }

    private function getBoard(): ?Board
    {
        return Board::where('slug', self::BOARD_SLUG)->first();
    }

    private function mapListItem(Post $post, array $meta): array
    {
        return [
            'post_id' => $post->id,
            'slug' => $meta['slug'] ?? $this->slugFromTitle($post->title),
            'title' => $post->title,
            'summary' => $meta['summary'],
            'type' => $meta['type'],
            'status' => $meta['status'],
            'visibility' => $meta['visibility'],
            'is_featured' => (bool) $meta['is_featured'],
            '_sort_order' => (int) ($meta['sort_order'] ?? 0),
            'created_at' => $post->created_at?->toIso8601String(),
        ];
    }

    /**
     * 같은 게시판 내 slug 중복 여부 (자기 자신 제외)
     */
    private function slugExists(int $boardId, string $domain, string $slug, int $excludePostId): bool
    {
        // value 컬럼은 JSON cast 이므로 디코딩 후 비교합니다.
        return PostMeta::query()
            ->where('board_id', $boardId)
            ->where('domain', $domain)
            ->where('key', 'slug')
            ->where('post_id', '!=', $excludePostId)
            ->get()
            ->contains(fn (PostMeta $row): bool => (string) $row->value === $slug);
    }

    private function slugFromTitle(array|string $title): string
    {
        $text = is_array($title) ? ($title['ko'] ?? $title['en'] ?? '') : $title;
        $slug = preg_replace('/[^\p{L}\p{N}-]+/u', '-', mb_strtolower(trim((string) $text)));
        $slug = trim((string) $slug, '-');

        return $slug === '' ? 'untitled' : $slug;
    }

    private function emptyResponse(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'data' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $request->integer('per_page', 15),
                    'total' => 0,
                ],
            ],
        ]);
    }

    private function coerceMetaValue(mixed $value, string $type): mixed
    {
        return match ($type) {
            'bool' => (bool) $value,
            'int' => is_null($value) ? null : (int) $value,
            'json' => $value,
            default => is_null($value) ? null : (string) $value,
        };
    }
}
