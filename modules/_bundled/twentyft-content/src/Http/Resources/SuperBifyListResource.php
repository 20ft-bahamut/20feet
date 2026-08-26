<?php

namespace Modules\Twentyft\Content\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * SuperBify 목록용 Public DTO
 */
class SuperBifyListResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource['public_id'],
            'slug' => $this->resource['slug'],
            'title' => $this->resource['title'],
            'summary' => $this->resource['summary'],
            'type' => $this->resource['type'],
            'status' => $this->resource['status'],
            'version' => $this->resource['version'],
            'compatibility' => $this->resource['g7_compatibility'],
            'featured' => $this->resource['is_featured'],
            'coverImageUrl' => $this->resource['cover_image_url'],
        ];
    }
}
