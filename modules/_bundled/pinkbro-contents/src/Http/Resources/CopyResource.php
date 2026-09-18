<?php

namespace Modules\Pinkbro\Contents\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 섹션 문구 공개 DTO.
 *
 * COPY 메타에 저장된 키를 그대로 통과시킨다 — 섹션별 문구 키가 많고
 * 템플릿 레이아웃의 data_sources 가 각 키를 직접 소비하므로,
 * 여기서 화이트리스트를 두면 문구 하나가 조용히 사라진다.
 * 값은 저장 원문 그대로다 (COPY POLICY — 이 리소스는 문자열을 만들지 않는다).
 */
class CopyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return $this->resource;
    }
}
