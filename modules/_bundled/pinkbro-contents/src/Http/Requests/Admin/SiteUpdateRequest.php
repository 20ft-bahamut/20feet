<?php

namespace Modules\Pinkbro\Contents\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 관리자 사이트 설정(site) 수정 검증 — 전역 SITE 메타.
 *
 * site 도메인은 게시판·게시글에 매이지 않은 전역 메타다 (SPEC §4.5) —
 * `board_id` / `post_id` 는 둘 다 null 이고 컨트롤러가 그렇게 쓴다.
 *
 * 규칙은 전부 `sometimes|required` 다: 보내지 않은 키는 검증도 저장도 하지 않아
 * "메타 행을 지우지 않는 수정" 이 된다. 보냈는데 비었으면 422 다 — 사이트 설정을
 * 빈 값으로 덮어쓰는 요청은 폼 실수이지 의도가 아니다.
 *
 * 허용 키는 SPEC §4.5 의 site 목록 8개 그대로다 (`SiteResource` 가 돌려주는
 * 응답 키 집합과 같다 — 어긋나면 AdminSiteApiTest 의 정합성 테스트가 실패한다).
 * 목록 밖의 키는 규칙이 없으므로 `validated()` 에서 조용히 빠진다 (422 가 아니다).
 *
 * 권한은 라우트 미들웨어(`permission:admin,pinkbro-contents.site.update`)가 판정한다.
 */
class SiteUpdateRequest extends FormRequest
{
    /**
     * 키 → 검증 제약 (SPEC §4.5 의 site 키 8개).
     *
     * @var array<string, array<int, string>>
     */
    protected const FIELDS = [
        'brand_name' => ['string', 'max:100'],
        'brand_name_en' => ['string', 'max:100'],
        'tagline' => ['string', 'max:200'],
        'eyebrow' => ['string', 'max:200'],
        'phone' => ['string', 'max:50'],
        'kakao_channel' => ['string', 'max:500'],
        'region' => ['string', 'max:200'],
        'og_image_slot' => ['string', 'max:100'],
    ];

    /**
     * 허용 키 목록 — 저장·응답 계약과의 정합성 검사가 읽는다.
     *
     * 이름이 `keys()` 가 아닌 이유: 상위 `Illuminate\Http\Request` 가 비정적
     * `keys()` 를 이미 갖고 있어 정적 메서드로 재선언할 수 없다.
     *
     * @return array<int, string>
     */
    public static function allowedKeys(): array
    {
        return array_keys(self::FIELDS);
    }

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
        $rules = [];

        foreach (self::FIELDS as $key => $constraints) {
            $rules[$key] = ['sometimes', 'required', ...$constraints];
        }

        return $rules;
    }
}
