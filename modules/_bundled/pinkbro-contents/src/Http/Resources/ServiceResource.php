<?php

namespace Modules\Pinkbro\Contents\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 서비스 공개 DTO — 게시글 메타(SERVICE 도메인) + 슬롯 해석 결과.
 *
 * 키 집합은 계약(SPEC §4.5)이 고정한다 — 저장값이 없으면 null 로 자리를 지킨다.
 * `photo` 는 컨트롤러가 `MediaSlotService::resolve()` 로 해석해 넘긴 `{url, alt}` 이며,
 * 슬롯이 비면 `{url: null, alt: null}` 이다 (누락이 아니라 null).
 * `air_types` 는 에어컨 서비스 메타에 저장된 배열을 그대로 통과시킨다 —
 * 이 리소스는 값을 만들거나 다시 계산하지 않는다.
 */
class ServiceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->resource['slug'] ?? null,
            'title' => $this->resource['title'] ?? null,
            'tag' => $this->resource['tag'] ?? null,
            'summary' => $this->resource['summary'] ?? null,
            'criteria' => $this->resource['criteria'] ?? null,
            'base_price' => $this->resource['base_price'] ?? null,
            'extra_note' => $this->resource['extra_note'] ?? null,
            'air_types' => $this->resource['air_types'] ?? [],
            'photo' => $this->resource['photo'] ?? ['url' => null, 'alt' => null],
        ];
    }
}
