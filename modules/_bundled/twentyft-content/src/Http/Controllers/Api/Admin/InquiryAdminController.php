<?php

namespace Modules\Twentyft\Content\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Models\Post;
use Modules\Twentyft\Content\Enums\InquiryStatus;
use Modules\Twentyft\Content\Http\Resources\InquiryAdminListResource;
use Modules\Twentyft\Content\Services\PostMetaService;

/**
 * 프로젝트 문의 관리자 API
 */
class InquiryAdminController extends Controller
{
    private const BOARD_SLUG = 'project-inquiry';

    public function __construct(
        private readonly PostMetaService $metaService
    ) {}

    /**
     * 프로젝트 문의 목록 (관리자용)
     */
    public function index(Request $request): JsonResponse
    {
        $board = $this->getBoard();
        if (! $board) {
            return $this->emptyResponse($request);
        }

        $page = $request->integer('page', 1);
        $perPage = $request->integer('per_page', 20);

        $query = Post::where('board_id', $board->id)
            ->where('status', '!=', 'deleted')
            ->orderByDesc('created_at');

        $posts = $query->get();

        $items = [];
        foreach ($posts as $post) {
            $meta = $this->metaService->inquiryMeta($board->id, $post->id);

            if ($request->has('status') && ($meta['internal_status'] ?? '') !== $request->input('status')) {
                continue;
            }

            if ($request->has('project_type') && ($meta['project_type'] ?? '') !== $request->input('project_type')) {
                continue;
            }

            if ($request->filled('keyword')) {
                $keyword = mb_strtolower($request->input('keyword'));
                $haystack = mb_strtolower(implode(' ', [
                    (string) $post->title,
                    $meta['name'] ?? '',
                    $meta['email'] ?? '',
                    $meta['company'] ?? '',
                ]));
                if (! str_contains($haystack, $keyword)) {
                    continue;
                }
            }

            $items[] = $this->mapListItem($post, $meta);
        }

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
                'data' => InquiryAdminListResource::collection($paginator),
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
     * 문의 상태 변경
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
        if (! InquiryStatus::tryFrom($status)) {
            return response()->json(['message' => 'Invalid status'], 422);
        }

        $this->metaService->set($board->id, $post->id, 'inquiry', 'internal_status', $status);

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
            'title' => $post->title,
            'name' => $meta['name'],
            'email' => $meta['email'],
            'phone' => $meta['phone'],
            'company' => $meta['company'],
            'project_type' => $meta['project_type'],
            'budget_range' => $meta['budget_range'],
            'internal_status' => $meta['internal_status'],
            'created_at' => $post->created_at?->toIso8601String(),
        ];
    }

    private function emptyResponse(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'data' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $request->integer('per_page', 20),
                    'total' => 0,
                ],
            ],
        ]);
    }
}
