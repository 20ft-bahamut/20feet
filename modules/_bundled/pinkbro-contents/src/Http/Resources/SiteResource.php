<?php

namespace Modules\Pinkbro\Contents\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 사이트 레벨 공개 DTO — 브랜드/연락처.
 *
 * 공개 API 는 단일 래핑(`{data: {...}}`)이다 — 중첩 `data.data` 를 만들지 않는다.
 * 값은 전역 SITE 메타에 저장된 원문 그대로이며, 이 리소스는 문구를 만들지 않는다.
 * 키 집합은 계약(SPEC §4.7)이 고정한다 — 저장값이 없으면 null 로 자리를 지킨다.
 */
class SiteResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'brand_name' => $this->resource['brand_name'] ?? null,
            'brand_name_en' => $this->resource['brand_name_en'] ?? null,
            'tagline' => $this->resource['tagline'] ?? null,
            'eyebrow' => $this->resource['eyebrow'] ?? null,
            'phone' => $this->resource['phone'] ?? null,
            'kakao_channel' => $this->resource['kakao_channel'] ?? null,
            'region' => $this->resource['region'] ?? null,
            'og_image_slot' => $this->resource['og_image_slot'] ?? null,
        ];
    }
}
