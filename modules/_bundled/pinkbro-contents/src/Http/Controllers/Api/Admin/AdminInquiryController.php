<?php

namespace Modules\Pinkbro\Contents\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Modules\Pinkbro\Contents\Enums\InquiryStatus;
use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Http\Resources\Admin\AdminInquiryResource;
use Modules\Pinkbro\Contents\Services\ContentMetaService;
use Modules\Pinkbro\Contents\Services\InquiryService;
use Modules\Sirsoft\Board\Enums\PostStatus;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Models\Post;

/**
 * 관리자 문의 API — 목록·단건·상태 변경 (SPEC §4.7, §4.8).
 *
 * 소비 엔진은 공개 접수 API 와 같은 게시판 `pinkbro_inquiry` (InquiryService::BOARD_SLUG) +
 * `MetaDomain::INQUIRY` 메타다. 여기서 새 게시판을 만들지 않는다. 문의는 접수 때만
 * 만들어진다 — 이 컨트롤러는 생성·삭제를 두지 않는다 (D10 의 CRUD 는 콘텐츠 4도메인의 것).
 *
 * 응답 모양은 관리자 콘텐츠 API (Task 8) 를 따른다: 목록만 이중 중첩
 * (`{data: {data: [...], meta: {total, per_page, current_page}}}`), 단건·수정은
 * 단일 래핑(`{data: {...}}`)이다 — 관리자 레이아웃의 data_sources 계약.
 *
 * 목록은 최신순(`created_at` 내림차순, 같은 초 접수분은 id 내림차순)이고, 상태 필터는
 * 참조 백엔드 컨트롤러(InquiryAdminController)와 같은 메타 조사 후 걸러내기다.
 * 페이지네이션은 참조와 같은 수동 `LengthAwarePaginator`.
 *
 * 컨트롤러는 얇다: 상태·내부 메모 검증은 컨트롤러 내 validate(`Rule::enum`)로 끝내고
 * 쓰기는 `ContentMetaService` 가 맡는다.
 */
class AdminInquiryController extends Controller
{
    public function __construct(private readonly ContentMetaService $meta) {}

    /**
     * 문의 목록 — 최신순, `?status=` 로 상태 필터.
     *
     * 게시판이 없으면(모듈 미시딩) 빈 목록으로 200 을 유지한다 — 관리자 콘텐츠 API 와 같은 규칙.
     */
    public function index(Request $request): JsonResponse
    {
        $board = $this->board();

        if ($board === null) {
            return response()->json([
                'data' => [
                    'data' => [],
                    'meta' => [
                        'total' => 0,
                        'per_page' => $request->integer('per_page', 20),
                        'current_page' => 1,
                    ],
                ],
            ]);
        }

        $page = max(1, $request->integer('page', 1));
        $perPage = max(1, $request->integer('per_page', 20));

        $posts = Post::query()
            ->where('board_id', $board->id)
            ->where('status', '!=', PostStatus::Deleted->value)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        $items = [];

        foreach ($posts as $post) {
            $meta = $this->meta->allFor((int) $board->id, (int) $post->id, MetaDomain::INQUIRY);

            if ($request->filled('status') && (string) ($meta['status'] ?? '') !== (string) $request->input('status')) {
                continue;
            }

            $items[] = $this->payload($post, $meta);
        }

        $total = count($items);
        $slice = array_slice($items, ($page - 1) * $perPage, $perPage);

        $paginator = new LengthAwarePaginator(
            $slice,
            $total,
            $perPage,
            $page,
            ['path' => $request->url()]
        );

        return response()->json([
            'data' => [
                // paginator 가 아니라 slice 배열을 넘긴다 — ResourceCollection 은
                // paginator 를 받으면 links/meta 키를 중첩해 이 응답의 meta 계약을 깬다.
                // 페이지네이션 값은 위 meta 에 수동으로 넣는다 (콘텐츠 API 와 같은 모양).
                'data' => AdminInquiryResource::collection($slice),
                'meta' => [
                    'total' => $paginator->total(),
                    'per_page' => $paginator->perPage(),
                    'current_page' => $paginator->currentPage(),
                ],
            ],
        ]);
    }

    /**
     * 단건 — 게시글 1건 + 문의 메타 전체.
     */
    public function show(int $id): JsonResponse
    {
        [$board, $post] = $this->contextOr404($id);

        return AdminInquiryResource::make(
            $this->payload($post, $this->meta->allFor((int) $board->id, (int) $post->id, MetaDomain::INQUIRY))
        )->response();
    }

    /**
     * 상태·내부 메모 변경 — 보내온 키만 갱신한다 (부분 갱신).
     *
     * `status` 는 `Rule::enum(InquiryStatus::class)` 로 검증한다. 문자열이 아닌 값(배열·객체)도
     * 검증 규칙이 걸러 422 가 된다 — 참조 백엔드의 tryFrom 500 문제를 검증 단계에서 막는다.
     * `internal_note` 는 메타 행(`key='internal_note'`, SPEC §4.5)이다.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        [$board, $post] = $this->contextOr404($id);

        $data = $request->validate([
            'status' => ['sometimes', Rule::enum(InquiryStatus::class)],
            'internal_note' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        $pairs = array_intersect_key($data, array_flip(['status', 'internal_note']));

        DB::transaction(function () use ($board, $post, $pairs): void {
            $this->meta->setMany((int) $board->id, (int) $post->id, MetaDomain::INQUIRY, $pairs);
        });

        return AdminInquiryResource::make(
            $this->payload($post->refresh(), $this->meta->allFor((int) $board->id, (int) $post->id, MetaDomain::INQUIRY))
        )->response();
    }

    /**
     * @return array{0: Board, 1: Post}
     */
    private function contextOr404(int $id): array
    {
        $board = $this->board();

        $post = $board === null
            ? null
            : Post::query()
                ->where('board_id', $board->id)
                ->where('id', $id)
                ->where('status', '!=', PostStatus::Deleted->value)
                ->first();

        return [$board ?? abort(404), $post ?? abort(404)];
    }

    private function board(): ?Board
    {
        return Board::query()->where('slug', InquiryService::BOARD_SLUG)->first();
    }

    /**
     * 리소스에 넘길 배열 — 게시글 식별자 + 접수 시각 + 문의 메타.
     *
     * 키 집합은 리소스가 고정한다. 여기서는 값만 채운다.
     *
     * @return array{id: int, created_at: ?string, meta: array<string, mixed>}
     */
    private function payload(Post $post, array $meta): array
    {
        return [
            'id' => (int) $post->id,
            'created_at' => $post->created_at?->toIso8601String(),
            'meta' => $meta,
        ];
    }
}
