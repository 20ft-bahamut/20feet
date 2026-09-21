<?php

namespace Modules\Pinkbro\Contents\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Pinkbro\Contents\Services\MediaSlotService;

/**
 * 관리자 미디어 슬롯 연결 요청 검증 — PUT `admin/media`.
 *
 * `slot` 은 `MediaSlotService::slotKeys()` 로 제약한다. 그 목록이 슬롯의 유일한
 * 출처다 — 여기서 16키를 다시 적지 않고 서비스에서 읽는다. 제약이 없으면
 * 서비스의 `assertKnown()` 이 던지는 `InvalidArgumentException` 이 컨트롤러를
 * 지나 500 이 된다. 알 수 없는 슬롯은 422 다.
 *
 * `temp_key` 는 **업로드 직후 상태**의 첨부를 가리킨다: `board_attachments` 에
 * `board_id = 0`, `post_id IS NULL`, `deleted_at IS NULL` 로 남아 있는 행의 키다 —
 * `AttachmentService::getTempAttachments()` 가 조회하는 바로 그 조건이다.
 * 그래서 없는 키·이미 소비된 키·삭제된 키는 모두 422 가 되고 컨트롤러까지
 * 내려가지 않는다 (조용히 아무것도 연결하지 않는 성공 응답을 만들지 않는다).
 *
 * `alt` 는 선택이다. 보내지 않으면 `null` 로 남는다.
 *
 * 권한은 라우트 미들웨어(`permission:admin,pinkbro-contents.media.update`)가 판정한다.
 */
class MediaLinkRequest extends FormRequest
{
    /**
     * 인가 판정은 라우트 미들웨어가 한다 — 여기서는 통과시킨다.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'slot' => [
                'required',
                'string',
                Rule::in(MediaSlotService::slotKeys()),
            ],
            'temp_key' => [
                'required',
                'string',
                'max:64',
                Rule::exists('board_attachments', 'temp_key')->where(function ($query): void {
                    $query->where('board_id', 0)
                        ->whereNull('post_id')
                        ->whereNull('deleted_at');
                }),
            ],
            'alt' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
