<?php

namespace Modules\Pinkbro\Contents\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 관리자 동시작업 할인(discount) 수정 검증 — 전역 DISCOUNT 메타.
 *
 * discount 도메인은 게시판·게시글에 매이지 않은 전역 메타이며 키가 `steps` 하나뿐이다
 * (SPEC §4.5). `steps` 는 키별 갱신이 아니라 **배열 전체 교체**다 — 3단계를 2단계로
 * 줄여 보내면 2단계가 저장된다. 이 도메인만의 예외다.
 *
 * 원소 계약은 `condition` + `amount_label` 두 키다 (시더 `DISCOUNT_STEPS` 원문).
 * 목록을 보냈다면 원소는 계약을 온전히 갖춰야 한다.
 *
 * 권한은 라우트 미들웨어(`permission:admin,pinkbro-contents.site.update`)가 판정한다.
 */
class DiscountUpdateRequest extends FormRequest
{
    /**
     * 허용 키 목록 — 이 도메인은 `steps` 하나뿐이다.
     *
     * @var array<int, string>
     */
    public const KEYS = ['steps'];

    /**
     * 인가 판정은 라우트 미들웨어가 한다 — 여기서는 통과시킨다.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'steps' => ['sometimes', 'required', 'array'],
            'steps.*' => ['array'],
            'steps.*.condition' => ['required', 'string', 'max:100'],
            'steps.*.amount_label' => ['required', 'string', 'max:100'],
        ];
    }
}
