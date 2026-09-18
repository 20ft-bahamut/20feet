<?php

namespace Modules\Pinkbro\Contents\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 미디어 슬롯 공개 DTO — `MediaSlotService::resolveAll()` 결과.
 *
 * 레지스트리의 16개 슬롯이 전부 키로 등장한다 — 비어 있는 슬롯도
 * `{url: null, alt: null}` 로 자리를 지킨다 (누락이 아니라 null).
 * 키 집합은 서비스가 유일한 출처다 — 이 리소스는 슬롯 목록을 다시 정의하지 않는다.
 */
class MediaSlotResource extends JsonResource
{
    /**
     * @return array<string, array{url: string|null, alt: string|null}>
     */
    public function toArray(Request $request): array
    {
        return $this->resource;
    }
}
