<?php

namespace Modules\Pinkbro\Contents\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Modules\Pinkbro\Contents\Http\Requests\Admin\MediaLinkRequest;
use Modules\Pinkbro\Contents\Services\MediaSlotService;
use Modules\Sirsoft\Board\Enums\PostStatus;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Models\Post;
use Modules\Sirsoft\Board\Services\AttachmentService;
use Modules\Sirsoft\Board\Services\PostService;

/**
 * 관리자 미디어 슬롯 API — GET / PUT / DELETE `admin/media`.
 *
 * 슬롯 레지스트리(16키)와 슬롯 → URL 해석은 전부 `MediaSlotService` 가 한다.
 * 이 컨트롤러는 슬롯을 다시 정의하지 않고, 목록을 응답 모양으로 펴기만 한다.
 *
 * ## 메타 위치는 전역 스코프다
 * `MediaSlotService::link()` 는 `board_id`·`post_id` 가 둘 다 null 인 MEDIA 메타를
 * 쓴다 — 공개 읽기(`MediaController` → `resolveAll()`)가 읽는 바로 그 행이다.
 * 그래서 이 API 는 슬롯 메타를 게시판·게시글에 매이게 하지 않는다.
 *
 * ## 첨부는 왜 게시글에 붙는가
 * 파일 저장과 첨부 수명은 G7 `sirsoft-board` 첨부가 맡는다. 첨부 행은 게시글에
 * 매여야 살아남으므로(temp_key 소비 + 게시판 이동), `pinkbro_media` 게시판
 * (시더가 만든다, `is_active = false` 로 공개 목록에 안 뜬다)의 앵커 게시글
 * 하나를 쓴다. 앵커 게시글은 시더가 만들지 않으므로 **없으면 이 컨트롤러가
 * 만든다** — 게시판만 있고 글이 없으면 첫 연결이 실패하기 때문이다.
 * 앵커 post_id 를 별도 메타 키(`_anchor`)에 기록하지는 않는다: 현재 코드에서
 * 그 키를 읽는 곳이 없다 (SPEC §4.5 와 구현이 어긋나는 지점 — 코드를 따랐다).
 *
 * ## 첨부 상한 주의
 * 앵커 게시글의 첨부는 재연결 시에도 쌓인다(슬롯 메타만 새 첨부로 바뀐다).
 * `pinkbro_media` 의 `max_file_count` 는 16 이고 슬롯도 16개라, 누적 17번째
 * 연결은 `AttachmentLimitExceededException` 으로 실패한다 — 슬롯을 여러 번
 * 갈아끼우면 도달한다. 이 태스크의 범위 밖이라 동작을 바꾸지 않고 보고한다.
 */
class AdminMediaController extends Controller
{
    /**
     * 첨부의 앵커가 되는 숨김 게시판 slug — 시더가 만든 이름 그대로다.
     * 여기서 새 게시판을 만들지 않는다.
     */
    private const BOARD_SLUG = 'pinkbro_media';

    /**
     * 앵커 게시글 제목.
     *
     * 공개 목록에 뜨지 않는(`is_active = false`) 게시판의 행 하나를 가리키는
     * 기술 식별자다 — 브랜드 카피가 아니고 어디에도 노출되지 않는다.
     */
    private const ANCHOR_TITLE = 'media-anchor';

    public function __construct(private readonly MediaSlotService $slots) {}

    /**
     * 슬롯 16개 전량 — 키·라벨·현재 url/alt.
     *
     * 게시판·게시글이 필요 없다: 슬롯 메타는 전역 스코프다.
     */
    public function index(): JsonResponse
    {
        return $this->slotsResponse();
    }

    /**
     * 업로드된 임시 첨부 1건을 슬롯에 연결한다.
     *
     * 순서: 임시 첨부 확보 → 앵커 게시글 확보 → 공식 쓰기 경로로 첨부 연결 →
     * 슬롯 메타 기록. 첨부 연결과 메타 기록은 한 트랜잭션이다 — 절반만 반영된
     * 상태(첨부는 붙었는데 슬롯은 빈 상태)를 만들지 않는다.
     */
    public function link(MediaLinkRequest $request): JsonResponse
    {
        $data = $request->validated();
        $board = $this->mediaBoard();

        // 연결되고 나면 temp_key 가 비워져 다시 조회할 수 없다 — 먼저 확보한다.
        // 정렬은 `order` 오름차순이다 (`getByTempKey`). 슬롯 하나에는 첨부 하나가
        // 대응하므로 가장 마지막에 올린 첨부를 그 슬롯의 것으로 본다.
        $pending = app(AttachmentService::class)->getTempAttachments($board->slug, $data['temp_key']);

        if ($pending->isEmpty()) {
            // FormRequest 의 exists 규칙과 같은 판정이다. 여기까지 왔다면 검증과
            // 연결 사이에 키가 소비된 것이므로, 조용히 성공을 돌려주지 않고 422 로 끝낸다.
            throw ValidationException::withMessages([
                'temp_key' => [__('validation.exists', ['attribute' => 'temp_key'])],
            ]);
        }

        $attachment = $pending->last();

        DB::transaction(function () use ($board, $attachment, $data, $request): void {
            $anchor = $this->anchorPost($board, $request->ip());

            // 공식 쓰기 경로 — temp_key 첨부 연결 + after_update 훅 + 캐시 무효화.
            // 첨부 연결을 직접 하지 않고 이 경로를 쓰는 것은 참조 관리자 컨트롤러와 같다.
            app(PostService::class)->updatePost($board->slug, (int) $anchor->id, [
                'temp_key' => $data['temp_key'],
            ]);

            $this->slots->link($data['slot'], (int) $attachment->id, $data['alt'] ?? null);
        });

        return $this->slotsResponse();
    }

    /**
     * 슬롯 하나를 해제한다 — 그 슬롯의 메타 행만 지운다.
     *
     * 연결된 첨부 자체는 남긴다(다른 슬롯이 참조하지 않는지 이 계층은 모른다).
     * 연결돼 있지 않은 슬롯도 204 다 — 해제는 멱등이다.
     */
    public function destroy(string $slot): JsonResponse
    {
        try {
            $this->slots->unlink($slot);
        } catch (InvalidArgumentException) {
            // 알 수 없는 슬롯은 422 다 — 서비스의 도메인 예외를 500 으로 흘리지 않는다.
            // 메시지는 PUT 의 `Rule::in` 이 내는 것과 같은 문구를 쓴다.
            throw ValidationException::withMessages([
                'slot' => [__('validation.in', ['attribute' => 'slot'])],
            ]);
        }

        return response()->json(null, 204);
    }

    /**
     * 슬롯 16개를 레지스트리 순서대로 편다.
     *
     * 라벨은 `MediaSlotService::labels()` 그대로다 (`{ko, en}`) — 관리자 화면이
     * 언어를 고르는 자리를 서버가 정하지 않는다. 키 집합·순서는 서비스가 정한다.
     */
    private function slotsResponse(): JsonResponse
    {
        $labels = MediaSlotService::labels();
        $resolved = $this->slots->resolveAll();
        $slots = [];

        foreach (MediaSlotService::slotKeys() as $key) {
            $slots[] = [
                'key' => $key,
                'label' => $labels[$key],
                'url' => $resolved[$key]['url'],
                'alt' => $resolved[$key]['alt'],
            ];
        }

        return response()->json(['data' => ['slots' => $slots]]);
    }

    /**
     * 미디어 앵커 게시판 — 시더가 만든다. 없으면(모듈 미시딩) 404 다.
     */
    private function mediaBoard(): Board
    {
        return Board::query()->where('slug', self::BOARD_SLUG)->first() ?? abort(404);
    }

    /**
     * 앵커 게시글 — `pinkbro_media` 의 가장 오래된 살아있는 글.
     *
     * 시더는 게시판만 만들고 글은 만들지 않으므로, 첫 연결 시점에 한 번 만든다.
     * 두 번째부터는 위 조회가 그 글을 다시 찾는다 — 앵커를 가리키는 별도
     * 메타 키를 두지 않아도 결정적이다 (이 게시판에 글을 쓰는 경로는 여기뿐이다).
     */
    private function anchorPost(Board $board, ?string $ip): Post
    {
        $existing = Post::query()
            ->where('board_id', $board->id)
            ->where('status', '!=', PostStatus::Deleted->value)
            ->orderBy('id')
            ->first();

        if ($existing) {
            return $existing;
        }

        // 생성도 공식 경로(PostService)를 쓴다 — 시더·콘텐츠 CRUD 와 같은 이유.
        return app(PostService::class)->createPost($board->slug, [
            'title' => self::ANCHOR_TITLE,
            'content' => '',
            'content_mode' => 'text',
            'ip_address' => $ip,
            'is_notice' => false,
            'is_secret' => false,
            'status' => PostStatus::Published->value,
        ]);
    }
}
