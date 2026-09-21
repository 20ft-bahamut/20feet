<?php

namespace Modules\Pinkbro\Contents\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Pinkbro\Contents\Enums\InquiryStatus;

/**
 * 관리자 문의 DTO — 게시글 1건 + 문의 메타 (SPEC §4.5 inquiry 키 집합).
 *
 * 응답은 `id` + 문의 키 전체다. 저장값이 없는 키는 누락이 아니라 null 로 자리를
 * 지킨다 — 관리자 폼이 이 응답을 그대로 바인딩하므로 키가 빠지면 폼 필드가
 * 사라진다 (AdminContentResource 와 같은 이유). `internal_note` 는 접수 때 없을
 * 수 있는 키라 null 이며, 상태는 접수 시점이 항상 NEW 이므로 메타가 비어도
 * `new` 로 자리를 지킨다 (참조 백엔드의 tryFrom ?? NEW 와 같은 방어).
 *
 * `services` 는 목록 선택 — 접수 때 list 로 정규화해 저장되지만, 저장값이
 * 비어 있으면 빈 배열로 자리를 지킨다.
 */
class AdminInquiryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $meta = (array) ($this->resource['meta'] ?? []);

        return [
            'id' => (int) ($this->resource['id'] ?? 0),
            'business_type' => $meta['business_type'] ?? null,
            'services' => $this->serviceList($meta),
            'store_size' => $meta['store_size'] ?? null,
            'contact' => $meta['contact'] ?? null,
            'message' => $meta['message'] ?? null,
            'status' => (string) ($meta['status'] ?? InquiryStatus::NEW->value),
            'created_at' => $this->resource['created_at'] ?? null,
        ];
    }

    /**
     * @param  array<string, mixed>  $meta
     * @return array<int, string>
     */
    private function serviceList(array $meta): array
    {
        $services = $meta['services'] ?? [];

        if ($services === null || $services === '') {
            return [];
        }

        return is_array($services) ? array_values(array_map(strval(...), $services)) : [(string) $services];
    }
}
