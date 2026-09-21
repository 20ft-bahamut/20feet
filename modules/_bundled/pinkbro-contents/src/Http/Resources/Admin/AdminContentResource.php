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

        return $item;
    }
}
