<?php

namespace Modules\Pinkbro\Contents\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Modules\Pinkbro\Contents\Http\Requests\Admin\MediaLinkRequest;
use Modules\Pinkbro\Contents\Services\MediaSlotLinkService;
use Modules\Pinkbro\Contents\Services\MediaSlotService;

/**
 * 관리자 미디어 슬롯 API — GET / PUT / DELETE `admin/media`.
 *
 * 슬롯 레지스트리(16키)와 슬롯 → URL 해석은 전부 `MediaSlotService` 가 한다.
 * 이 컨트롤러는 슬롯을 다시 정의하지 않고, 목록을 응답 모양으로 펴기만 한다.
 *
 * ## temp_key → 연결 체인은 어디 갔나
 * `link()` 의 임시 첨부 확보 → 앵커 확보 → 놓아주기 → temp_key 소비 → 슬롯 메타 기록
 * 순서는 이제 공용 서비스 `MediaSlotLinkService` 가 담당한다. 사례 저장
 * (`AdminContentController`)이 같은 코드를 써야 하므로 컨트롤러 본문에서 추출했다 —
 * 이 컨트롤러의 동작 변화는 없다(코드 이동이다). 상한·release·앵커 근거 주석은
 * 옮겨간 곳에 있다.
 */
class AdminMediaController extends Controller
{
    public function __construct(
        private readonly MediaSlotService $slots,
        private readonly MediaSlotLinkService $linker,
    ) {}

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
        $slot = $data['slot'];
        $tempKey = $data['temp_key'] ?? null;

        if ($tempKey === null) {
            // 게시판이 없으면(모듈 미시딩) temp_key 경로와 달리 404 가 먼저다 —
            // 추출 전 `link()` 의 확인 시점은 분기 앞이었다.
            $this->linker->mediaBoard();

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

        $this->linker->linkTemp($slot, $tempKey, $data['alt'] ?? null, $request->ip());

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
}
