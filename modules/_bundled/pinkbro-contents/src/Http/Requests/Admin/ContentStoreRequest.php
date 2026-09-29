<?php

namespace Modules\Pinkbro\Contents\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Pinkbro\Contents\Services\MediaSlotService;

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
 * 예외는 1회용 연산 키다: `cover_temp_key`(case) 는 메타 행이 아니라 임시 첨부를
 * 가리키는 키라 응답 계약에 없다 — `rules()` 에서 도메인별로 붙이므로 이 표
 * (메타 키 목록)에 넣지 않는다. 정합성 테스트는 FIELDS 만 본다.
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

        if ($domain === 'case') {
            // 커버 업로드는 사례 도메인에만 있다. temp_key 규약은 `MediaLinkRequest`
            // (슬롯 연결 FormRequest)와 같다: 업로드 직후 상태의 임시 첨부
            // (board_id=0, post_id NULL, 삭제 안 된 행)를 가리키는 키여야 하고,
            // 연결되면 temp_key 가 비워지므로 소비된 키 재발송은 exists 로 422 낸다.
            // 이 키는 응답 계약(`AdminContentResource::KEYS`)에 없는 1회용 연산 키라
            // 메타 표(`self::FIELDS`)에 넣지 않는다 — 컨트롤러가 메타 저장에서 떼어낸다.
            $rules['cover_temp_key'] = [
                'nullable',
                'string',
                'max:64',
                Rule::exists('board_attachments', 'temp_key')->where(function ($q): void {
                    $q->where('board_id', 0)->whereNull('post_id')->whereNull('deleted_at');
                }),
            ];

            // cover_slot 은 목록 밖 키를 받지 않는다 — 선택지도 검증도
            // `MediaSlotService::caseSlotKeys()` 파생이다 (레지스트리가 유일한 출처).
            // 업로드가 있으면 슬롯 정해진다 — 어느 슬롯에 붙일지 없는 저장은
            // 조용히 넘어가지 않는다(required_with). 주의: 부분 갱신 모드의
            // `sometimes` 를 cover_slot 에서 뺀다 — sometimes 는 "키 없음" 을
            // 건너뛰므로 업로드가 있는데 슬롯 없는 저장을 잡지 못한다. 없는 키는
            // nullable 이 흘려보내고 required_with 만 업로드 조합을 잡는다.
            $rules['cover_slot'] = [
                ...self::FIELDS[$domain]['cover_slot'],
                'required_with:cover_temp_key',
                Rule::in(MediaSlotService::caseSlotKeys()),
            ];
        }

        return $rules;
    }

    /**
     * 빈 문자열은 목록 밖이라 `Rule::in` 이 422 를 낸다. "미지정" 은 빈 문자열이
     * 아니라 null 로 정규화한다 — 부분 갱신(수정)에선 null 이 "메타 삭제" 다.
     * 업로드 후 저장 재시도에서도 소비된 temp_key 를 null 로 만들어 같은 규칙을 탄다.
     */
    protected function prepareForValidation(): void
    {
        foreach (['cover_slot', 'cover_temp_key'] as $key) {
            if ($this->input($key) === '') {
                $this->merge([$key => null]);
            }
        }
    }
}
