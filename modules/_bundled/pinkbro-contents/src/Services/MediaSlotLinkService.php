<?php

namespace Modules\Pinkbro\Contents\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\Sirsoft\Board\Enums\PostStatus;
use Modules\Sirsoft\Board\Models\Attachment;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Models\Post;
use Modules\Sirsoft\Board\Services\AttachmentService;
use Modules\Sirsoft\Board\Services\PostService;

/**
 * 임시 첨부(temp_key) → 미디어 슬롯 연결 — 미디어 API 와 사례 저장이 같이 쓰는 공용 경로.
 *
 * 연결 순서(임시 첨부 확보 → 앵커 게시글 확보 → 이전 첨부 놓아주기 → temp_key 소비 →
 * 슬롯 메타 기록)는 원래 `AdminMediaController::link` 본문에 인라인이었다. 사례 저장
 * (`AdminContentController`)이 같은 코드를 쓰려면 컨트롤러 밖 계층이어야 한다 —
 * 컨트롤러 메서드를 그대로 부르는 형태는 컨트롤러의 404 조작·private 의존까지
 * 사례 저장 흐름에 심는 셈이므로 쓰지 않는다(정찰 CASE_COVER_CONTRACT §5.2).
 *
 * 코드 이동이지 동작 변경이 아니다: 미디어 화면이 지금까지 쓴 규칙을 그대로 옮긴다.
 * 주의 사항(첨부 상한·release 조건·앵커 생성)의 근거 주석도 함께 옮겨 왔다.
 *
 * ## 메타 위치는 전역 스코프다
 * `MediaSlotService::link()` 는 `board_id`·`post_id` 가 둘 다 null 인 MEDIA 메타를
 * 쓴다 — 공개 읽기(`MediaController` → `resolveAll()`)가 읽는 바로 그 행이다.
 * 그래서 이 서비스는 슬롯 메타를 게시판·게시글에 매이게 하지 않는다.
 *
 * ## 첨부는 왜 게시글에 붙는가
 * 파일 저장과 첨부 수명은 G7 `sirsoft-board` 첨부가 맡는다. 첨부 행은 게시글에
 * 매여야 살아남으므로(temp_key 소비 + 게시판 이동), `pinkbro_media` 게시판
 * (시더가 만든다, `is_active = false` 로 공개 목록에 안 뜬다)의 앵커 게시글
 * 하나를 쓴다. 앵커 게시글은 시더가 만들지 않으므로 **없으면 만든다** —
 * 게시판만 있고 글이 없으면 첫 연결이 실패하기 때문이다.
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
class MediaSlotLinkService
{
    /**
     * 첨부의 앵커가 되는 숨김 게시판 slug — 시더가 만든 이름 그대로다.
     * 여기서 새 게시판을 만들지 않는다.
     */
    public const BOARD_SLUG = 'pinkbro_media';

    /**
     * 앵커 게시글 제목.
     *
     * 공개 목록에 뜨지 않는(`is_active = false`) 게시판의 행 하나를 가리키는
     * 기술 식별자다 — 브랜드 카피가 아니고 어디에도 노출되지 않는다.
     */
    public const ANCHOR_TITLE = 'media-anchor';

    public function __construct(private readonly MediaSlotService $slots) {}

    /**
     * 임시 첨부를 슬롯에 연결한다.
     *
     * 임시 첨부는 연결되면 temp_key 가 비워져 다시 조회할 수 없으므로 트랜잭션 밖에서
     * 먼저 확보한다(원래 link()와 같은 순서). 정렬은 `order` 오름차순이다
     * (`AttachmentRepository::getByTempKey`) — 슬롯 하나에는 첨부 하나가 대응하므로
     * 가장 마지막에 올린 첨부를 그 슬롯의 것으로 본다.
     *
     * 첨부 연결(임시키 소비·놓아주기·슬롯 메타 기록)은 한 트랜잭션이다 — 절반만
     * 반영된 상태(첨부는 붙었는데 슬롯은 빈 상태)를 만들지 않는다. 호출자가 이미
     * 트랜잭션 안이라면(사례 저장) 이 트랜잭션은 세이브포인트로 중첩되며, 예외가
     * 돌면 호출자의 트랜잭션도 함께 실패한다.
     *
     * @param string $tempKey 업로드 직후 상태의 임시 첨부가 가진키. 검증은
     *                        상층의 FormRequest(exists 규칙)가 하고, 여기서도
     *                        "검증과 연결 사이 소비" 를 422 로 다시 잡는다.
     * @param ?string $alt 슬롯 메타에 기록할 대체 텍스트. 바꾸지 않으려면 null.
     *
     * @throws ValidationException 검증과 연결 사이에 임시 첨부가 소비/삭제됐을 때.
     *                             FormRequest 의 exists 규칙이 내는 문구를 그대로 쓴다.
     */
    public function linkTemp(string $slot, string $tempKey, ?string $alt, ?string $ip): void
    {
        $board = $this->mediaBoard();

        $pending = app(AttachmentService::class)->getTempAttachments($board->slug, $tempKey);

        if ($pending->isEmpty()) {
            // FormRequest 의 exists 규칙과 같은 판정이다. 여기까지 왔다면 검증과
            // 연결 사이에 키가 소비된 것이므로, 조용히 성공을 돌려주지 않고 422 로 끝낸다.
            throw ValidationException::withMessages([
                'temp_key' => [__('validation.exists', ['attribute' => 'temp_key'])],
            ]);
        }

        $attachment = $pending->last();

        DB::transaction(function () use ($board, $attachment, $slot, $tempKey, $alt, $ip): void {
            $anchor = $this->anchorPost($board, $ip);

            // 새 첨부를 붙이기 전에, 이 슬롯이 이전에 가리키던 첨부를 놓아준다.
            // 순서가 중요하다 — 상한 판정은 "앵커의 기존 첨부 + 이번에 붙일 개수" 를
            // 보므로, 먼저 놓아야 슬롯 16개가 다 찬 상태의 교체가 상한에 걸리지 않는다.
            $previous = $this->slots->linkedAttachmentId($slot);

            app(PostService::class)->updatePost($board->slug, (int) $anchor->id, [
                'temp_key' => $tempKey,
            ]);

            $this->release($board, $anchor, $previous, (int) $attachment->id, $slot);

            $this->slots->link($slot, (int) $attachment->id, $alt);
        });
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
     * 미디어 앵커 게시판 — 시더가 만든다. 없으면(모듈 미시딩) 404 다.
     *
     * `linkTemp` 가 쓰는 것 외에, 미디어 API 가 원래 `link()` 진입 시점에 게시판을
     * 확인하던 동작(alt-only 경로도 404)을 보존하기 위해 공개한다.
     */
    public function mediaBoard(): Board
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