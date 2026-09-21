<?php

namespace Modules\Pinkbro\Contents\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 관리자 섹션 문구(copy) 수정 검증 — 전역 COPY 메타.
 *
 * copy 도메인은 게시판·게시글에 매이지 않은 전역 메타다 (SPEC §4.5) —
 * `board_id` / `post_id` 는 둘 다 null 이다.
 *
 * **키 목록의 출처는 시더다.** `PinkbroContentsSeeder::COPY` 가 현재 82키를 쓰고,
 * 그 82키를 전부 받는다. SPEC §4.5 의 copy 행은 목록이 `…` 로 줄여 적혀 있어
 * 그대로 옮기면 문구가 조용히 사라진다 — 그래서 짧은 목록을 손으로 적지 않는다.
 * `AdminSiteApiTest::test_the_accepted_key_lists_match_what_the_domains_read_back`
 * 이 이 목록과 시더 상수를 집합으로 비교한다 (키를 늘리면 시더와 함께 고쳐야 한다).
 *
 * 값 모양은 세 가지다:
 *  - 스칼라 문구 77개 — `string`
 *  - 문자열 목록 2개(`hero_pills` `estimate_checklist`) — `array` + 원소 `string`
 *  - 객체 목록 3개(`about_perspectives` `hero_scope` `benefit_items`) — 원소 계약 고정
 *
 * 규칙은 전부 `sometimes|required` 다 (부분 갱신). 보낸 목록의 원소는 계약을
 * 온전히 갖춰야 한다 — 목록을 보냈는데 원소가 비면 422 다.
 *
 * 문구 값은 원문 그대로 받는다 (COPY POLICY). 이 클래스는 문자열을 만들지 않는다.
 * 권한은 라우트 미들웨어(`permission:admin,pinkbro-contents.site.update`)가 판정한다.
 */
class CopyUpdateRequest extends FormRequest
{
    /**
     * 스칼라 문구 키 77개 — 시더 `COPY` 의 스칼라 항목 그대로.
     *
     * @var array<int, string>
     */
    protected const TEXT_KEYS = [
        'hero_headline',
        'hero_lead',
        'hero_cta_primary',
        'hero_cta_secondary',
        'about_message',
        'about_stage_eyebrow',
        'about_side_eyebrow',
        'service_intro',
        'package_intro',
        'pricing_notice',
        'pricing_flow',
        'projects_intro',
        'projects_note',
        'estimate_intro',
        'estimate_note',
        'faq_intro',
        'footer_text',
        'about_heading',
        'about_side_heading',
        'hero_visual_label',
        'hero_visual_message_label',
        'hero_visual_brand_message',
        'hero_visual_body',
        'service_intro_sub',
        'service_detail_label',
        'extra_box_heading',
        'extra_box_body',
        'service_eyebrow',
        'extra_box_cta',
        'package_intro_sub',
        'package_stage_eyebrow',
        'package_a_label',
        'package_b_label',
        'package_c_label',
        'package_a_note',
        'package_a_note_sub',
        'package_b_note',
        'package_b_note_sub',
        'package_c_note',
        'package_c_note_sub',
        'benefit_heading',
        'benefit_sub',
        'benefit_eyebrow',
        'pricing_heading',
        'pricing_sub',
        'pricing_notice_sub',
        'pricing_field',
        'pricing_flow_label',
        'pricing_eyebrow',
        'pricing_notice_label',
        'estimator_heading',
        'estimator_sub',
        'estimator_eyebrow',
        'estimator_air_label',
        'estimator_row_count',
        'estimator_row_base',
        'estimator_row_discount',
        'estimator_row_discount_amount',
        'estimator_summary_total_label',
        'estimator_cta_submit',
        'estimator_cta_kakao',
        'estimator_summary_heading',
        'estimator_summary_note',
        'faq_eyebrow',
        'faq_intro_sub',
        'projects_eyebrow',
        'projects_card_kicker',
        'projects_link_label',
        'projects_sub',
        'estimate_panel_heading',
        'estimate_panel_sub',
        'estimate_panel_note',
        'footer_brand_desc',
        'header_cta',
        'mobile_cta_estimate',
        'mobile_cta_phone',
        'mobile_cta_kakao',
    ];

    /**
     * 문자열 목록 키 2개.
     *
     * @var array<int, string>
     */
    protected const LIST_KEYS = [
        'hero_pills',
        'estimate_checklist',
    ];

    /**
     * 객체 목록 키 3개 — 원소 계약은 ELEMENT_RULES 가 정한다.
     *
     * @var array<int, string>
     */
    protected const OBJECT_KEYS = [
        'about_perspectives',
        'hero_scope',
        'benefit_items',
    ];

    /**
     * 목록 원소 계약 — 와일드카드 키.
     *
     * 목록 자체를 보냈다면 원소는 계약을 온전히 갖춰야 한다 (`required`).
     *
     * @var array<string, array<int, string>>
     */
    protected const ELEMENT_RULES = [
        'hero_pills.*' => ['string', 'max:200'],
        'estimate_checklist.*' => ['string', 'max:500'],
        'about_perspectives.*' => ['array'],
        'about_perspectives.*.title' => ['required', 'string', 'max:500'],
        'about_perspectives.*.body' => ['required', 'string', 'max:2000'],
        'hero_scope.*' => ['array'],
        'hero_scope.*.no' => ['required', 'string', 'max:20'],
        'hero_scope.*.title' => ['required', 'string', 'max:200'],
        'hero_scope.*.body' => ['required', 'string', 'max:500'],
        'benefit_items.*' => ['array'],
        'benefit_items.*.condition' => ['required', 'string', 'max:100'],
        'benefit_items.*.amount_label' => ['required', 'string', 'max:100'],
    ];

    /**
     * 허용 키 목록 — 시더 `COPY` 와의 정합성 검사가 읽는다.
     *
     * 와일드카드 하위 키(`hero_pills.*` 등)는 키가 아니라 원소 계약이므로 빠진다.
     *
     * 이름이 `keys()` 가 아닌 이유: 상위 `Illuminate\Http\Request` 가 비정적
     * `keys()` 를 이미 갖고 있어 정적 메서드로 재선언할 수 없다.
     *
     * @return array<int, string>
     */
    public static function allowedKeys(): array
    {
        return [...self::TEXT_KEYS, ...self::LIST_KEYS, ...self::OBJECT_KEYS];
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

        foreach (self::TEXT_KEYS as $key) {
            $rules[$key] = ['sometimes', 'required', 'string', 'max:2000'];
        }

        foreach ([...self::LIST_KEYS, ...self::OBJECT_KEYS] as $key) {
            $rules[$key] = ['sometimes', 'required', 'array'];
        }

        // 원소 계약은 두 모드에서 같다 (목록 단위 계약).
        foreach (self::ELEMENT_RULES as $key => $constraints) {
            $rules[$key] = $constraints;
        }

        return $rules;
    }
}
