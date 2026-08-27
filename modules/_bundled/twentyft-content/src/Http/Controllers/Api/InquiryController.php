<?php

namespace Modules\Twentyft\Content\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Services\PostService;
use Modules\Twentyft\Content\Enums\InquiryProjectType;
use Modules\Twentyft\Content\Enums\InquiryStatus;
use Modules\Twentyft\Content\Http\Requests\InquiryStoreRequest;
use Modules\Twentyft\Content\Services\PostMetaService;

/**
 * Project Inquiry API
 *
 * Public write only. List/detail are private to admin.
 * Frontend form remains disabled until privacy copy is finalized.
 */
class InquiryController extends Controller
{
    private const BOARD_SLUG = 'project-inquiry';

    public function __construct(
        private readonly PostMetaService $metaService
    ) {}

    /**
     * 문의 등록
     */
    public function store(InquiryStoreRequest $request): JsonResponse
    {
        $board = Board::where('slug', self::BOARD_SLUG)->first();
        if (! $board) {
            return response()->json([
                'message' => 'Inquiry board is not ready.',
            ], 503);
        }

        $validated = $request->validated();

        $title = $this->buildTitle($validated);

        try {
            $post = DB::transaction(function () use ($board, $title, $validated, $request) {
                // PostService 경유 — before/after_create 훅, 알림(notify_admin_on_post),
                // 캐시 무효화가 정상 발화되도록 보드의 공식 쓰기 경로를 사용합니다.
                $post = app(PostService::class)
                    ->createPost(self::BOARD_SLUG, [
                        'title' => $title,
                        'content' => $validated['description'],
                        'content_mode' => 'text',
                        'author_name' => $validated['name'],
                        'ip_address' => $request->ip(),
                        'is_secret' => true,
                        'status' => 'published',
                    ]);

                $this->storeInquiryMeta($board->id, $post->id, $validated);

                return $post;
            });
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'message' => '문의 접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            ], 500);
        }

        return response()->json([
            'message' => '문의가 접수되었습니다. 내용을 확인한 뒤 연락드리겠습니다.',
            'inquiry_id' => hash('xxh64', 'inquiry:'.$post->id),
        ], 201);
    }

    /**
     * 관리자 목록에서 표시할 제목 생성
     */
    private function buildTitle(array $validated): string
    {
        $type = InquiryProjectType::tryFrom($validated['project_type'])?->label() ?? $validated['project_type'];
        $name = $validated['name'];
        $company = $validated['company'] ?? null;
        $date = now()->format('Y-m-d');

        if (! empty($company)) {
            return sprintf('[%s] %s / %s - %s', $type, $company, $name, $date);
        }

        return sprintf('[%s] %s - %s', $type, $name, $date);
    }

    /**
     * Inquiry 메타 저장
     */
    private function storeInquiryMeta(int $boardId, int $postId, array $validated): void
    {
        $metaMap = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'company' => $validated['company'] ?? null,
            'project_type' => $validated['project_type'],
            'current_site_url' => $validated['current_site_url'] ?? null,
            'budget_range' => $validated['budget_range'] ?? null,
            'desired_schedule' => $validated['desired_schedule'] ?? null,
            'reference_url' => $validated['reference_url'] ?? null,
            'privacy_consent' => true,
            'internal_status' => InquiryStatus::NEW->value,
        ];

        foreach ($metaMap as $key => $value) {
            $this->metaService->set($boardId, $postId, 'inquiry', $key, $value);
        }
    }
}
