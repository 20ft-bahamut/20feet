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
use Modules\Sirsoft\Board\Models\Attachment;
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
 * 앵커 게시글의 첨부는 재연결 시에도 쌓인다 — 그래서 재연결 경로가 **이전 첨부를 놓아준다**
 * (`release()`). 놓아주지 않으면 갈아끼울 때마다 앵커 게시글의 첨부가 하나씩 늘어
 * 무한히 쌓인다 (실측: 교체 20회 = 첨부 20개 누적).
 *
 * `max_file_count` 판정(`AttachmentService::assertAttachmentCountWithin`)은 **게시글 기준**으로
 * 세지만 컬렉션을 `attachments` 로 고정해 조회한다. 이 모듈의 업로드는 `collection: main`
 * (레이아웃의 FileUploader `collection`)이라 지금은 그 판정에 0 으로 잡힌다 — 즉 상한은
 * 아직 물지 않는다. 그래도 놓아주는 이유는 두 가지다: ① 누적은 실제로 무한하고,
 * ② 컬렉션이 정렬되는 순간 앵커가 곧바로 상한에 걸린다. 놓아주면 슬롯 수만큼만
 * 살아있으므로 어느 쪽이든 성립한다.
 *
 * 놓아주는 순서는 **새 첨부를 붙이기 전**이다. 상한 판정은 "기존 첨부 + 이번에 붙일 개수" 를
 * 보므로, 슬롯 16개가 다 찬 상태의 교체는 먼저 놓아야 16 이하로 남는다.
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
     * 슬롯을 연결한다 — 두 가지 모드가 있다.
     *
     * ① `temp_key` 가 있는 요청: 업로드된 임시 첨부 1건을 슬롯에 연결한다.
     *    순서: 임시 첨부 확보 → 앵커 게시글 확보 → 이전 첨부 놓아주기 →
     *    공식 쓰기 경로로 첨부 연결 → 슬롯 메타 기록. 첨부 연결과 메타 기록은
     *    한 트랜잭션이다 — 절반만 반영된 상태(첨부는 붙었는데 슬롯은 빈 상태)를
     *    만들지 않는다.
     *
     * ② `temp_key` 가 없는 요청: **새 업로드 없이 대체 텍스트만** 바꾼다.
     *    이미 연결된 슬롯에만 허용하고(`MediaSlotService::relabel`), 연결된 첨부가
     *    없는 슬롯이면 422 다 — 붙일 대상이 없는 저장을 성공으로 위장하지 않는다.
     *    이 경로는 앵커 게시글의 첨부 예산을 쓰지 않는다(첨부를 새로 만들지 않는다).
     */
    public function link(MediaLinkRequest $request): JsonResponse
    {
        $data = $request->validated();
        $board = $this->mediaBoard();
        $slot = $data['slot'];
        $tempKey = $data['temp_key'] ?? null;

        if ($tempKey === null) {
            // `alt` 가 아예 없는 요청은 바꿀 것이 없다 — 조용한 성공을 만들지 않고
            // `temp_key` 누락과 같은 422 로 끝낸다 (FormRequest 가 내는 문구를 그대로 쓴다).
            if (! array_key_exists('alt', $data)) {
                throw ValidationException::withMessages([
                    'temp_key' => [__('validation.exists', ['attribute' => 'temp_key'])],
                ]);
            }

            if (! $this->slots->relabel($slot, $data['alt'])) {
                throw ValidationException::withMessages([
                    'temp_key' => [__('validation.exists', ['attribute' => 'temp_key'])],
                ]);
            }

            return $this->slotsResponse();
        }

        // 연결되고 나면 temp_key 가 비워져 다시 조회할 수 없다 — 먼저 확보한다.
        // 정렬은 `order` 오름차순이다 (`getByTempKey`). 슬롯 하나에는 첨부 하나가
        // 대응하므로 가장 마지막에 올린 첨부를 그 슬롯의 것으로 본다.
        $pending = app(AttachmentService::class)->getTempAttachments($board->slug, $tempKey);

        if ($pending->isEmpty()) {
            // FormRequest 의 exists 규칙과 같은 판정이다. 여기까지 왔다면 검증과
            // 연결 사이에 키가 소비된 것이므로, 조용히 성공을 돌려주지 않고 422 로 끝낸다.
            throw ValidationException::withMessages([
                'temp_key' => [__('validation.exists', ['attribute' => 'temp_key'])],
            ]);
        }

        $attachment = $pending->last();

        DB::transaction(function () use ($board, $attachment, $data, $slot, $tempKey, $request): void {
            $anchor = $this->anchorPost($board, $request->ip());

            // 새 첨부를 붙이기 전에, 이 슬롯이 이전에 가리키던 첨부를 놓아준다.
            // 순서가 중요하다 — 상한 판정은 "앵커의 기존 첨부 + 이번에 붙일 개수" 를
            // 보므로, 먼저 놓아야 슬롯 16개가 다 찬 상태의 교체가 상한에 걸리지 않는다.
            $previous = $this->slots->linkedAttachmentId($slot);

            app(PostService::class)->updatePost($board->slug, (int) $anchor->id, [
                'temp_key' => $tempKey,
            ]);

            $this->release($board, $anchor, $previous, (int) $attachment->id, $slot);

            $this->slots->link($slot, (int) $attachment->id, $data['alt'] ?? null);
        });

        return $this->slotsResponse();
    }

    /**
     * 재연결로 더 이상 쓰이지 않게 된 이전 첨부를 놓아준다.
     *
     * `AttachmentService::delete()` 는 **소프트 삭제**다 — 물리 파일은 남고(휴지통),
     * 보존기간이 지나면 운영자가 켠 `sirsoft-board:prune-attachments` 가 정리한다.
     * 그래서 "파일을 지우지 않고 연결만 놓는다" 는 요구와 맞는다: 되돌릴 수 있고,
     * 파일을 즉시 파기하지 않는다.
     *
     * 손대지 않는 조건 (하나라도 걸리면 그대로 둔다):
     *  - 이전 첨부가 없거나, 새 첨부와 같은 첨부다 (갈아끼운 게 아니다)
     *  - 다른 슬롯이 아직 그 첨부를 가리킨다 (`attachmentInUse`)
     *  - 그 첨부가 이 앵커 게시글의 것이 아니다 — 메타가 게시판 밖 첨부를 가리키는
     *    상태에서 호출되더라도 남의 첨부를 건드리지 않는다
     *
     * 이 메서드는 **새 연결을 쓰기 전에** 부른다. 그래서 `attachmentInUse` 에 지금 슬롯을
     * 제외 대상으로 넘긴다 — 아직 그 슬롯이 이전 첨부를 가리키고 있기 때문이다.
     */
    private function release(Board $board, Post $anchor, ?int $previousId, int $newId, string $slot): void
    {
        if ($previousId === null || $previousId === $newId) {
            return;
        }

        if ($this->slots->attachmentInUse($previousId, $slot)) {
            return;
        }

        $attachment = Attachment::query()
            ->whereKey($previousId)
            ->where('board_id', $board->id)
            ->where('post_id', $anchor->id)
            ->first();

        if (! $attachment) {
            return;
        }

        app(AttachmentService::class)->delete($board->slug, $previousId, 'admin');
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
