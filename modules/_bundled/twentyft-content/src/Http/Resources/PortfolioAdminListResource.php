<?php

namespace Modules\Twentyft\Content\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Portfolio 관리자 목록 아이템
 */
class PortfolioAdminListResource extends JsonResource
{
    /**
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'postId' => $this->resource['post_id'],
            'slug' => $this->resource['slug'],
            'title' => $this->resource['title'],
            'year' => $this->resource['year'],
            'types' => $this->resource['types'],
            'status' => $this->resource['status'],
            'visibility' => $this->resource['visibility'],
            'isFeatured' => $this->resource['is_featured'],
            'sortOrder' => $this->resource['_sort_order'],
            'createdAt' => $this->resource['created_at'],
        ];
    }
}
