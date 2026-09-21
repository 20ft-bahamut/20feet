<?php

namespace Modules\Pinkbro\Contents\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 관리자 콘텐츠 생성 검증 — 도메인 4종 공용 (service / package / case / faq).
 *
 * 도메인은 라우트 파라미터(`{domain}`)에서 온다. 라우트가 도메인을 제약하지 않으므로
 * 알 수 없는 도메인이면 규칙이 비고, 컨트롤러가 404 로 정리한다 (500 아님).
 *
 * 통과한 키만 저장된다 — `validated()` 는 여기 규칙이 있는 키만 돌려주므로
 * 목록 밖의 키는 조용히 버려진다.
 *
 * 도메인 키 집합은 이 표(입력 계약)와 `AdminContentResource::KEYS`(응답 계약) 두 곳에
 * 있다 — 입출력 키가 같아야 하므로 어긋나면 `AdminContentApiTest` 의 정합성 테스트가
 * 실패한다. 키를 늘릴 때는 양쪽을 함께 고친다.
 *
 * 필수 키는 도메인마다 하나다: 게시글 제목 컬럼의 값 출처(`title`, faq 는 `question`).
 * 나머지 키는 전부 선택이다 — 값이 없으면 메타 행을 만들지 않는다.
 *
 * 권한은 라우트 미들웨어(`permission:admin,pinkbro-contents.content.create`)가 판정한다.
 */
class ContentStoreRequest extends FormRequest
{
    /**
     * 도메인별 필드 규칙.
     *
     * 값에 `required` 를 두지 않는다 — 필수 여부는 REQUIRED 가 정하고, 부분 갱신
     * 여부는 `$partial` 이 정하므로 두 모드가 같은 표를 공유할 수 있다.
     *
     * @var array<string, array<string, array<int, string>>>
     */
    protected const FIELDS = [
        'service' => [
            'slug' => ['nullable', 'string', 'max:100'],
            'title' => ['string', 'max:200'],
            'tag' => ['nullable', 'string', 'max:100'],
            'summary' => ['nullable', 'string', 'max:2000'],
            'base_price' => ['nullable', 'string', 'max:100'],
            'criteria' => ['nullable', 'string', 'max:2000'],
            'extra_note' => ['nullable', 'string', 'max:1000'],
            'photo_slot' => ['nullable', 'string', 'max:100'],
            'air_types' => ['nullable', 'array'],
            'air_types.*' => ['array'],
            'air_types.*.kind' => ['required', 'string', 'max:100'],
            'air_types.*.price_label' => ['required', 'string', 'max:100'],
            'air_types.*.price_value' => ['required', 'integer', 'min:0'],
            'air_types.*.default_selected' => ['nullable', 'boolean'],
            'sort' => ['nullable', 'integer'],
            'is_visible' => ['nullable', 'boolean'],
        ],
        'package' => [
            'title' => ['string', 'max:200'],
            'summary' => ['nullable', 'string', 'max:2000'],
            'includes' => ['nullable', 'array'],
            'includes.*' => ['string', 'max:200'],
            'base_total' => ['nullable', 'string', 'max:100'],
            'price' => ['nullable', 'string', 'max:100'],
            'discount_rate' => ['nullable', 'integer', 'min:0', 'max:100'],
            'is_featured' => ['nullable', 'boolean'],
            'sort' => ['nullable', 'integer'],
        ],
        'case' => [
            'title' => ['string', 'max:200'],
            'summary' => ['nullable', 'string', 'max:2000'],
            // blog_url 은 시드 시점에 빈 문자열이다 (SPEC §12) — `url` 규칙을 쓰지 않는다.
            'blog_url' => ['nullable', 'string', 'max:500'],
            'cover_slot' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'integer'],
        ],
        'faq' => [
            'question' => ['string', 'max:500'],
            'answer' => ['nullable', 'string', 'max:5000'],
            'sort' => ['nullable', 'integer'],
        ],
    ];

    /**
     * 도메인별 필수 키 — 게시글 제목 컬럼의 값 출처다.
     *
     * @var array<string, string>
     */
    protected const REQUIRED = [
        'service' => 'title',
        'package' => 'title',
        'case' => 'title',
        'faq' => 'question',
    ];

    /**
     * 부분 갱신 모드 여부.
     *
     * false(생성)면 필수 키가 required 이고, true(수정)면 모든 키가 sometimes 다 —
     * 보내지 않은 키는 검증도 저장도 하지 않는다.
     */
    protected bool $partial = false;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $domain = (string) $this->route('domain');
        $required = self::REQUIRED[$domain] ?? null;
        $rules = [];

        foreach (self::FIELDS[$domain] ?? [] as $key => $constraints) {
            // 와일드카드 하위 키는 두 모드에서 같은 규칙을 쓴다 (원소 단위 계약).
            if (str_contains($key, '*')) {
                $rules[$key] = $constraints;

                continue;
            }

            $rules[$key] = match (true) {
                $this->partial => ['sometimes', ...$constraints],
                $key === $required => ['required', ...$constraints],
                default => $constraints,
            };
        }

        return $rules;
    }
}
