<?php

namespace Modules\Twentyft\Content\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Models\Post;
use Modules\Twentyft\Content\Enums\InquiryBudgetRange;
use Modules\Twentyft\Content\Enums\InquiryProjectType;
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
     * 프로젝트 문의 상세 (관리자용)
     *
     * 접수 시 저장한 메타 11종과 게시글 본문을 함께 돌려줍니다.
     * 목록은 요약 컬럼만 보여주므로, 전화·예산·희망 일정·참고 링크처럼
     * 목록에 없는 값은 이 응답이 유일한 열람 경로입니다.
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

        $meta = $this->metaService->inquiryMeta($board->id, $post->id);

        $status = InquiryStatus::tryFrom((string) $meta['internal_status']) ?? InquiryStatus::NEW;

        return response()->json([
            'data' => [
                'postId' => $post->id,
                'title' => $post->title,
                'content' => (string) $post->content,
                'authorName' => $post->author_name,
                'createdAt' => $post->created_at?->toIso8601String(),
                'createdAtLabel' => $post->created_at?->format('Y-m-d H:i'),
                'name' => $meta['name'],
                'email' => $meta['email'],
                'phone' => $meta['phone'],
                'company' => $meta['company'],
                'projectType' => $meta['project_type'],
                'projectTypeLabel' => self::projectTypeLabel($meta['project_type']),
                'budgetRange' => $meta['budget_range'],
                'budgetRangeLabel' => self::budgetRangeLabel($meta['budget_range']),
                'desiredSchedule' => $meta['desired_schedule'],
                'currentSiteUrl' => $meta['current_site_url'],
                'referenceUrl' => $meta['reference_url'],
                'privacyConsent' => (bool) $meta['privacy_consent'],
                'internalStatus' => $status->value,
                'internalStatusLabel' => $status->label(),
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

        // 문자열이 아닌 값(배열·객체)을 그대로 tryFrom 에 넘기면 TypeError 로 500 이 된다.
        // 관리자 화면은 항상 문자열을 보내므로 422 로 정리한다.
        $status = $request->input('status');
        if (! is_string($status) || ! InquiryStatus::tryFrom($status)) {
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

    /**
     * 유형/예산의 관리자 화면 라벨 — 현재 로케일
     *
     * `InquiryProjectType::label()` 은 접수 시 게시글 제목에 박히는 값이라 로케일을 태우지 않는다.
     * 화면 표시용 라벨은 별도 번역 키를 쓴다. 접수 때 제목이 관리자 로케일에 따라 바뀌면
     * 같은 문의가 시점마다 다른 제목으로 저장된다.
     */
    private static function projectTypeLabel(mixed $value): ?string
    {
        $type = InquiryProjectType::tryFrom((string) $value);

        return $type ? __('twentyft-content::enums.inquiry_project_type.'.$type->value) : null;
    }

    private static function budgetRangeLabel(mixed $value): ?string
    {
        $range = InquiryBudgetRange::tryFrom((string) $value);

        return $range ? __('twentyft-content::enums.inquiry_budget_range.'.$range->value) : null;
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
            'project_type_label' => self::projectTypeLabel($meta['project_type']),
            'budget_range' => $meta['budget_range'],
            'internal_status' => $meta['internal_status'],
            'internal_status_label' => InquiryStatus::tryFrom((string) $meta['internal_status'])?->label(),
            'created_at' => $post->created_at?->toIso8601String(),
            'created_at_label' => $post->created_at?->format('Y-m-d H:i'),
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
