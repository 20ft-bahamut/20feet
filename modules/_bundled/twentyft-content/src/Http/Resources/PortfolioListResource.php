<?php

namespace Modules\Twentyft\Content\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Portfolio 목록용 Public DTO
 *
 * 내부 board id, post id, 비공개 메타는 노출하지 않습니다.
 */
class PortfolioListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource['public_id'],
            'slug' => $this->resource['slug'],
            'title' => $this->resource['title'],
            'summary' => $this->resource['summary'],
            'year' => $this->resource['year'],
            'types' => $this->resource['types'],
            'status' => $this->resource['status'],
            'featured' => $this->resource['is_featured'],
            'coverImageUrl' => $this->resource['cover_image_url'],
            '_debug_cover_attachment_id' => $this->resource['_debug_cover_attachment_id'] ?? null,
            '_debug_first_attachment_id' => $this->resource['_debug_first_attachment_id'] ?? null,
            '_debug_first_attachment_post_id' => $this->resource['_debug_first_attachment_post_id'] ?? null,
            '_debug_post_id' => $this->resource['_debug_post_id'] ?? null,
            '_debug_attachments_count' => $this->resource['_debug_attachments_count'] ?? null,
        ];
    }
}
