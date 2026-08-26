<?php

namespace Modules\Twentyft\Content\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Portfolio 상세용 Public DTO
 */
class PortfolioDetailResource extends JsonResource
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
            'description' => $this->resource['description'],
            'year' => $this->resource['year'],
            'types' => $this->resource['types'],
            'status' => $this->resource['status'],
            'featured' => $this->resource['is_featured'],
            'clientName' => $this->resource['client_name'],
            'role' => $this->resource['role'],
            'techStack' => $this->resource['tech_stack'],
            'relatedUrl' => $this->resource['related_url'],
            'githubUrl' => $this->resource['github_url'],
            'links' => [
                'github' => $this->resource['github_url'],
                'related' => $this->resource['related_url'],
            ],
            'coverImageUrl' => $this->resource['cover_image_url'],
            'galleryImageUrls' => $this->resource['gallery_image_urls'],
        ];
    }
}
