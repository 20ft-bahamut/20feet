<?php

namespace Modules\Pinkbro\Contents\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 패키지 공개 DTO — 게시글 메타(PACKAGE 도메인).
 *
 * 키 집합은 계약(SPEC §4.5 package 행)이 고정한다 — 저장값이 없으면 null 로 자리를 지킨다.
 * `includes` 는 구성 항목 목록이라 비어 있어도 `[]` 로 자리를 지킨다.
 * 문구·금액·할인율은 저장값 그대로이며 이 리소스는 계산하지 않는다.
 */
class PackageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'title' => $this->resource['title'] ?? null,
            'summary' => $this->resource['summary'] ?? null,
            'includes' => $this->resource['includes'] ?? [],
            'base_total' => $this->resource['base_total'] ?? null,
            'price' => $this->resource['price'] ?? null,
            'discount_rate' => $this->resource['discount_rate'] ?? null,
            'is_featured' => $this->resource['is_featured'] ?? null,
        ];
    }
}
