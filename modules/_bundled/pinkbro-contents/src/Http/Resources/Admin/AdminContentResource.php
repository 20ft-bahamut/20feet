<?php

namespace Modules\Pinkbro\Contents\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 관리자 콘텐츠 DTO — 게시글 1건 + 도메인 메타 (SPEC §4.5).
 *
 * 응답은 `id` + 그 도메인의 키 전체다. 저장값이 없는 키는 누락이 아니라 null 로
 * 자리를 지킨다 — 관리자 폼이 이 응답을 `_local.form` 에 그대로 바인딩하므로
 * 키가 빠지면 폼 필드가 사라진다 (공개 리소스가 키 집합을 고정하는 것과 같은 이유).
 *
 * `KEYS` 는 이 응답의 키 집합이다. 입력 계약(`ContentStoreRequest::FIELDS`)과 키가
 * 같아야 하며 — 어긋나면 `AdminContentApiTest` 의 정합성 테스트가 실패한다 — 키를
 * 늘릴 때는 양쪽을 함께 고친다. 목록에 없는 키를 이 리소스가 새로 만들지 않는다.
 *
 * 예외는 case 의 `cover` 다 (키가 아니라 해석된 1건 컴포지트): 관리자 사례 폼이
 * 현재 커버를 미리보기하려면 cover_slot 키 문자열만으론 부족하므로, 컨트롤러가
 * `MediaSlotService::resolve` 해석 결과(`{slot, url, alt}`)를 함께 내려준다.
 * 이 키는 메타 키가 아니므로 KEYS 에 넣지 않는다(정합성 표가 응답·입력 키를
 * 비교하는 범위를 유지한다). 1회용 연산 입력 키 `cover_temp_key` 도 마찬가지다.
 *
 * `slug` 도 다른 키와 똑같이 메타 행에서 온다 — `board_posts` 에 slug 컬럼이 없다.
 */
class AdminContentResource extends JsonResource
{
    /**
     * 도메인별 키 집합 (SPEC §4.5). service 에 `body` 키는 없다.
     *
     * @var array<string, array<int, string>>
     */
    public const KEYS = [
        'service' => [
            'slug', 'title', 'tag', 'summary', 'base_price', 'criteria',
            'extra_note', 'photo_slot', 'air_types', 'sort', 'is_visible',
        ],
        'package' => [
            'title', 'summary', 'includes', 'base_total', 'price', 'discount_rate', 'is_featured', 'sort',
        ],
        'case' => [
            'title', 'summary', 'blog_url', 'cover_slot', 'sort',
        ],
        'faq' => [
            'question', 'answer', 'sort',
        ],
    ];

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $domain = (string) ($this->resource['domain'] ?? '');
        $meta = $this->resource['meta'] ?? [];

        $item = ['id' => (int) ($this->resource['id'] ?? 0)];

        foreach (self::KEYS[$domain] ?? [] as $key) {
            $item[$key] = $meta[$key] ?? null;
        }

        if ($domain === 'case') {
            // 목록·단건·생성·수정 모두 같은 모양을 지킨다 — 관리자 폼이 목록과
            // 단건을 같은 바인딩으로 읽는다 (컨트롤러 payload 가 채우는 값이다).
            $item['cover'] = $this->resource['cover'] ?? null;
        }

        return $item;
    }
}
